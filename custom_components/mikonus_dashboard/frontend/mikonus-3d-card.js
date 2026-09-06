var S="homeAssistant",w=/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/,N=new Set(["light","switch","cover","climate","lock","vacuum","binary_sensor"]),j={light:["power","brightness","color","colorTemperature"],switch:["power"],cover:["position","coverMovement","openState"],climate:["currentTemperature","targetTemperature","humidity","hvacMode","hvacAction"],lock:["lockState"],vacuum:["startStop","cleaningState","returnToBase","batteryLevel","chargingState"],binary_sensor:["motion","occupancy","openState","smokeAlarm","waterLeak","alarm"]},X={motion:["motion","activity","motion"],occupancy:["occupancy","activity","occupancy"],presence:["occupancy","activity","presence"],opening:["contact","contact","openState"],door:["contact","contact","openState"],window:["contact","contact","openState"],smoke:["smoke","safety","smoke"],moisture:["water","safety","water"]},m=i=>typeof i=="number"&&Number.isFinite(i)?i:null,y=(i,e,t)=>m(i)===null?null:Math.max(e,Math.min(t,i)),O=i=>Array.isArray(i)?[...new Set(i.filter(e=>typeof e=="string"))].sort():[],D=(i,e,t)=>Object.hasOwn(i?.services?.[e]??{},t);function I(i){if(!i||i.provider!==S)return"unsupported provider";if(typeof i.deviceId!="string"||!w.test(i.deviceId))return"invalid entity id";if(Object.hasOwn(i,"slot"))return"HA bindings require deviceId, not slot";let e=i.deviceId.split(".")[0];return N.has(e)?j[e].includes(i.capability)?null:"capability does not match entity domain":"unsupported domain"}function M(i,e="missing"){return{id:i,provider:S,name:null,deviceClass:null,availability:e,missing:e==="missing",power:null,light:null,contact:null,cover:null,climate:null,lock:null,cleaning:null,activity:null,safety:null,health:null,motion:null,controls:{}}}function Y(i){let e=i.hs_color;if(Array.isArray(e)&&m(e[0])!==null&&m(e[1])!==null)return{hue:y(e[0],0,360)/360,saturation:y(e[1],0,100)/100};let t=i.rgb_color;if(!Array.isArray(t)||t.length!==3||t.some(c=>m(c)===null))return null;let[a,n,r]=t.map(c=>y(c,0,255)/255),s=Math.max(a,n,r),o=Math.min(a,n,r),l=s-o;return{hue:((l===0?0:s===a?(n-r)/l%6:s===n?(r-a)/l+2:(a-n)/l+4)/6+1)%1,saturation:s===0?0:l/s}}function U(i,e,t,a=[]){if(!e)return M(i);let n=i.split(".")[0],r=M(i,"unavailable"),s=e.attributes??{};if(r.name=typeof s.friendly_name=="string"?s.friendly_name:i,r.deviceClass=n,!w.test(i)||e.entity_id!==i||!N.has(n)||!a.some(h=>!I(h))||typeof e.state!="string"||["unknown","unavailable"].includes(e.state))return r;let o=e.state;r.availability="available";let l=h=>D(t,n,h),b=Number.isInteger(s.supported_features)?s.supported_features:0,c=h=>(b&h)===h,d=r.controls;if(n==="light"||n==="switch"){if(!["on","off"].includes(o))return{...r,availability:"unavailable"};if(r.power={isOn:o==="on"},d.setPower=l("turn_on")&&l("turn_off"),n==="light"){let h=O(s.supported_color_modes),v=h.some(u=>["brightness","color_temp","hs","xy","rgb","rgbw","rgbww","white"].includes(u)),f=h.some(u=>["hs","xy","rgb","rgbw","rgbww"].includes(u)),p=m(s.min_color_temp_kelvin),g=m(s.max_color_temp_kelvin);r.light={brightness:m(s.brightness)===null?null:y(s.brightness,0,255)/255,color:Y(s),colorTemperatureKelvin:m(s.color_temp_kelvin),mode:s.color_mode==="color_temp"?"temperature":["hs","xy","rgb","rgbw","rgbww"].includes(s.color_mode)?"color":null},v&&l("turn_on")&&(d.setBrightness={min:0,max:1,step:1/255}),d.setColor=f&&l("turn_on"),h.includes("color_temp")&&p>0&&g>=p&&l("turn_on")&&(d.setColorTemperature={min:p,max:g,step:1,unit:"K"})}}else if(n==="cover")r.cover={position:m(s.current_position)===null?o==="closed"?0:null:y(s.current_position,0,100)/100,movement:["opening","closing"].includes(o)?o:["open","closed"].includes(o)?"stopped":"unknown"},d.openCover=c(1)&&l("open_cover"),d.closeCover=c(2)&&l("close_cover"),d.stopCover=c(8)&&l("stop_cover"),c(4)&&l("set_cover_position")&&(d.setCoverPosition={min:0,max:1,step:.01});else if(n==="climate"){let h=s.temperature_unit??t?.config?.unit_system?.temperature;r.climate={currentTemperature:m(s.current_temperature),targetTemperature:m(s.temperature),humidity:y(s.current_humidity,0,100),unit:["\xB0C","\xB0F"].includes(h)?h:null,mode:o,heatingActive:typeof s.hvac_action=="string"?s.hvac_action==="heating":null};let v=m(s.min_temp),f=m(s.max_temp);c(1)&&v!==null&&f!==null&&f>v&&l("set_temperature")&&r.climate.unit&&(d.setTargetTemperature={min:v,max:f,step:m(s.target_temp_step)>0?s.target_temp_step:.5,unit:r.climate.unit});let p=O(s.hvac_modes).filter(g=>["off","heat","cool","heat_cool","auto","dry","fan_only"].includes(g));p.length&&l("set_hvac_mode")&&(d.setThermostatMode={values:p.map(g=>({id:g,label:g}))})}else if(n==="lock"){r.lock={isLocked:o==="locked"?!0:o==="unlocked"?!1:null};let h=["locked","unlocked"].includes(o)&&!s.code_format;d.lock=h&&l("lock"),d.unlock=h&&l("unlock")}else if(n==="vacuum")r.cleaning={state:["cleaning","paused","returning","docked","idle","error"].includes(o)?o:"unknown",batteryPercent:y(s.battery_level,0,100),error:o==="error"?typeof s.error=="string"?s.error:"Device error":null},r.cleaning.batteryPercent!==null&&(r.health={batteryPercent:r.cleaning.batteryPercent,alerts:[]}),d.startCleaning=c(8192)&&l("start"),d.pauseCleaning=c(4)&&l("pause"),d.stopCleaning=c(8)&&l("stop"),d.returnToBase=c(16)&&l("return_to_base");else if(n==="binary_sensor"){let h=X[s.device_class];if(!h||!["on","off"].includes(o))return{...r,availability:"unavailable"};let[v,f,p]=h,g=p==="presence"?["occupancy"]:p==="smoke"?["smokeAlarm","alarm"]:p==="water"?["waterLeak","alarm"]:[p];if(!a.some(u=>g.includes(u.capability)))return{...r,availability:"unavailable"};r.deviceClass=v,f==="contact"?r.contact={state:o==="on"?"open":"closed"}:r[f]=[{id:p,baseId:p,active:o==="on",label:r.name}]}return r}function F(i,e,t,a){let n=i.id.split(".")[0],s=e?.type==="togglePower"?{type:"setPower",value:!i.power?.isOn}:e;if(typeof a!="function"||!a(i,s)||e?.type==="setCoverPosition"&&(e.value<0||e.value>1))throw new Error(`Unsupported action ${e?.type??"(missing)"} for ${i.id}.`);let o,l={entity_id:i.id};switch(e.type){case"togglePower":o="toggle";break;case"setPower":o=e.value?"turn_on":"turn_off";break;case"setBrightness":o="turn_on",l.brightness=Math.round(e.value*255);break;case"setColor":o="turn_on",l.hs_color=[e.value.hue*360,e.value.saturation*100];break;case"setColorTemperature":o="turn_on",l.color_temp_kelvin=Math.round(e.value);break;case"openCover":o="open_cover";break;case"closeCover":o="close_cover";break;case"stopCover":o="stop_cover";break;case"setCoverPosition":o="set_cover_position",l.position=Math.round(e.value*100);break;case"setTargetTemperature":o="set_temperature",l.temperature=e.value;break;case"setThermostatMode":o="set_hvac_mode",l.hvac_mode=e.value;break;case"lock":o="lock";break;case"unlock":o="unlock";break;case"startCleaning":o="start";break;case"pauseCleaning":o="pause";break;case"stopCleaning":o="stop";break;case"returnToBase":o="return_to_base";break;default:throw new Error("Unsupported action.")}if(!D(t,n,o))throw new Error(`Service ${n}.${o} is unavailable.`);return{domain:n,service:o,data:l}}var E=class{provider=S;bindings=new Map;states=new Map;listeners=new Set;disposed=!1;constructor(e=null,{supportsCommand:t=null}={}){this.hass=e,this.supportsCommand=t}configureCommandSupport(e){if(!this.disposed){if(typeof e!="function")throw new TypeError("A neutral command validator is required.");this.supportsCommand=e}}configureBindings(e){if(this.disposed)return;let t=new Map;for(let a of e??[])I(a)||t.set(a.deviceId,[...t.get(a.deviceId)??[],{...a}]);this.bindings=t;for(let a of this.states.keys())t.has(a)||this.states.delete(a);this.updateHass(this.hass)}normalize(e){let t=this.bindings.get(e);return t?U(e,this.hass?.states?.[e],this.hass,t):M(e,"unavailable")}updateHass(e){if(!this.disposed){this.hass=e;for(let t of this.bindings.keys()){let a=this.normalize(t);if(JSON.stringify(a)!==JSON.stringify(this.states.get(t))){this.states.set(t,a);for(let n of this.listeners)n(structuredClone(a))}}}}async loadStates(e){return this.disposed?[]:e.map(t=>structuredClone(this.states.get(t)??this.normalize(t)))}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),()=>this.listeners.delete(e))}async execute(e,t){if(this.disposed)throw new Error("Home Assistant runtime has been disposed.");if(!this.bindings.has(e))throw new Error("Entity is not bound to this scene.");let a=this.normalize(e),{domain:n,service:r,data:s}=F(a,t,this.hass,this.supportsCommand);if(typeof this.hass?.callService!="function")throw new Error("Home Assistant is not connected.");return await this.hass.callService(n,r,s),{accepted:!0,deviceId:e,command:structuredClone(t)}}dispose(){this.disposed||(this.disposed=!0,this.listeners.clear(),this.states.clear(),this.bindings.clear(),this.hass=null,this.supportsCommand=null)}};var T="mikonus_dashboard/scene/",q=[500,1e3,2e3,4e3,8e3],$=new Set(["unknown_command","integration_not_setup","disconnected","connection_lost","cannot_connect","timeout","transport_error","store_unavailable","storage_error"]),K={unknown_command:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste hinzuf\xFCgen. Warte auf die Integration \u2026",integration_not_setup:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste einrichten oder neu laden. Warte auf die Integration \u2026",scene_not_found:"Diese Scene wurde noch nicht aus Mikonus ver\xF6ffentlicht.",no_scenes:"Noch kein Dashboard ver\xF6ffentlicht. Ver\xF6ffentliche zuerst eine Scene aus Mikonus.",multiple_scenes:"Mehrere Dashboards vorhanden. Bitte scene_id in der Card-Konfiguration angeben.",invalid_scene_id:"Ung\xFCltige scene_id in der Card-Konfiguration.",invalid_scene:"Die ver\xF6ffentlichte Scene ist ung\xFCltig.",unauthorized:"Keine Berechtigung zum Laden dieses Dashboards.",permission_denied:"Keine Berechtigung zum Laden dieses Dashboards.",forbidden:"Keine Berechtigung zum Laden dieses Dashboards.",disconnected:"Verbindung zu Home Assistant unterbrochen."};function x(i){let e=typeof i=="number"?i:i?.code,t=[1,3].includes(e)?"disconnected":e;return Object.assign(new Error(K[t]??i?.message??"Dashboard konnte nicht geladen werden."),{code:t})}function L(i){return $.has(x(i).code)||i?.name==="NetworkError"}var _=()=>new DOMException("Scene source stopped or superseded.","AbortError");function k(i,e){return e.throwIfAborted(),new Promise((t,a)=>{let n=()=>a(_());e.addEventListener("abort",n,{once:!0}),Promise.resolve(i).then(t,a).finally(()=>e.removeEventListener("abort",n))})}var A=i=>{try{Promise.resolve(i?.()).catch(()=>{})}catch{}},C=class{constructor(e,{sceneId:t,onStatus:a=()=>{},retryDelays:n=q}={}){this.connection=e,this.sceneId=t,this.onStatus=a,this.revision=null,this.notifiedRevision=0,this.epoch=0,this.wakeRevision=0,this.transportGeneration=0,this.listeners=new Set,this.disposed=!1,this.unsubscribe=null,this.starting=null,this.pending=null,this.unavailable=!1,this.observers=new Map,this.retryDelays=n,this.retryIndex=0,this.timer=null,this.lifetime=new AbortController,this.transport=new AbortController,this.onDisconnect=()=>{this.disposed||(this.unavailable=!0,this.invalidate(),this.clearRetry(),this.onStatus(x({code:"disconnected"})))},this.onReconnect=()=>{this.disposed||(this.invalidate(),this.recover())},e?.addEventListener?.("disconnected",this.onDisconnect),e?.addEventListener?.("ready",this.onReconnect)}clearRetry(){clearTimeout(this.timer),this.timer=null}retry(e){this.disposed||!L(e)||this.timer!==null||this.connection?.connected===!1||this.retryIndex>=this.retryDelays.length||(this.timer=setTimeout(()=>{this.timer=null,this.wake()},this.retryDelays[this.retryIndex++]))}wake(){this.disposed||this.emit({revision:`recovery:${++this.wakeRevision}:${this.epoch}`})}recover(){this.clearRetry(),this.retryIndex=0,this.unavailable=!1,this.wake()}invalidate(){this.transport.abort(),this.transport=new AbortController,++this.epoch,++this.transportGeneration,this.pending=null,this.starting=null,this.revision=null,this.notifiedRevision=0,A(this.unsubscribe),this.unsubscribe=null;for(let e of this.observers.values())A(e.unsubscribe);this.observers.clear()}async observe(e,t,a){if(this.observers.has(e))return this.observers.get(e).promise;let n={};return this.observers.set(e,n),n.promise=this.connection.subscribeMessage(r=>{!this.disposed&&this.observers.get(e)===n&&a(r)},t,{resubscribe:!1}).then(r=>{if(this.disposed||this.observers.get(e)!==n)throw A(r),_();n.unsubscribe=r}).catch(r=>{throw this.observers.get(e)===n&&this.observers.delete(e),r}),n.promise}async start(){if(this.starting)return this.starting;let e=this.epoch,t=(async()=>{if(typeof this.connection?.sendMessagePromise!="function"||typeof this.connection?.subscribeMessage!="function"||this.connection.connected===!1)throw x({code:"disconnected"});if(await this.observe("component",{type:"subscribe_events",event_type:"component_loaded"},r=>{r.data?.component==="mikonus_dashboard"&&this.recover()}),await this.observe("watch",{type:T+"watch"},r=>{(r.type==="ready"||r.type==="updated"&&!this.unsubscribe&&(!this.sceneId||r.sceneId===this.sceneId))&&this.recover()}),!this.sceneId){let{scenes:r}=await this.connection.sendMessagePromise({type:T+"list"});if(this.disposed||e!==this.epoch)throw _();if(!r.length)throw x({code:"no_scenes"});if(r.length!==1)throw x({code:"multiple_scenes"});this.sceneId=r[0].sceneId}if(this.disposed||e!==this.epoch)throw _();if(this.unsubscribe)return;let a=this.transportGeneration,n=await this.connection.subscribeMessage(r=>{a===this.transportGeneration&&this.onEvent(r)},{type:T+"subscribe",scene_id:this.sceneId},{resubscribe:!1});if(this.disposed||e!==this.epoch)throw A(n),_();this.unsubscribe=n})();this.starting=t;try{return await t}finally{this.starting===t&&(this.starting=null)}}onEvent(e){if(!this.disposed){if(e.type==="unavailable"){this.unavailable=!0,this.onStatus(x(e)),L(e)||this.clearRetry(),this.retry(e);return}e.sceneId!==this.sceneId||!Number.isSafeInteger(e.revision)||(this.unavailable&&(this.unavailable=!1,this.revision=null,this.notifiedRevision=0,++this.epoch),!(e.revision<=(this.revision??0)||e.revision<=this.notifiedRevision)&&(this.notifiedRevision=e.revision,this.clearRetry(),this.retryIndex=0,this.listeners.size&&this.emit({sceneId:this.sceneId,revision:`${e.revision}:${this.epoch}`})))}}emit(e){for(let t of this.listeners)t(e)}async loadScene({signal:e}={}){if(e?.throwIfAborted(),this.disposed)throw _();let t=this.epoch,a=AbortSignal.any([this.lifetime.signal,this.transport.signal,...e?[e]:[]]);try{if(await k(this.start(),a),e?.throwIfAborted(),this.disposed||t!==this.epoch)throw _();this.pending??=this.connection.sendMessagePromise({type:T+"get",scene_id:this.sceneId});let n=this.pending,r;try{r=await k(n,a)}finally{this.pending===n&&(this.pending=null)}if(e?.throwIfAborted(),this.disposed||t!==this.epoch)throw _();let s=r?.metadata?.revision;if(r?.scene?.sceneId!==this.sceneId||!Number.isSafeInteger(s)||s<1)throw x({code:"invalid_scene"});return this.revision=s,this.clearRetry(),this.retryIndex=0,this.onStatus(null),{scene:r.scene,metadata:{...r.metadata,revision:`${s}:${t}`,source:"homeAssistant"}}}catch(n){if(this.disposed||t!==this.epoch||n?.name==="AbortError")throw _();let r=x(n);throw this.onStatus(r),L(n)||this.clearRetry(),this.retry(n),r}}async waitUntilReady({signal:e}={}){let t=[this.lifetime.signal,...e?[e]:[]],a=!0,n,r=()=>{a=!0,n?.()},s=this.subscribe(r);for(let o of t)o.addEventListener("abort",r);try{for(;;){for(let o of t)o.throwIfAborted();a||await new Promise(o=>{n=o}),n=null;for(let o of t)o.throwIfAborted();a=!1;try{return await this.loadScene({signal:e})}catch{if(this.disposed||e?.aborted)throw _()}}}finally{s();for(let o of t)o.removeEventListener("abort",r)}}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),this.notifiedRevision>(this.revision??0)&&e({sceneId:this.sceneId,revision:`${this.notifiedRevision}:${this.epoch}`}),()=>this.listeners.delete(e))}dispose(){this.disposed||(this.disposed=!0,this.lifetime.abort(),this.clearRetry(),this.invalidate(),this.listeners.clear(),this.connection?.removeEventListener?.("disconnected",this.onDisconnect),this.connection?.removeEventListener?.("ready",this.onReconnect))}};var z={schemaVersion:2,sceneId:"mikonus:ha-reference",name:"Mikonus HA Reference",metadata:{generator:"mikonus-ha-development-fixture",revision:"1"},defaultFloorId:"floor-eg",floors:[{id:"floor-ug",name:"UG",level:-1,sortOrder:0,elevation:-2.8,rooms:[{id:"room-ug-storage",name:"Keller",polygon:[{x:-2.4,z:-1.8},{x:2.4,z:-1.8},{x:2.4,z:1.8},{x:-2.4,z:1.8}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"object-ug-storage",kind:"furniture",shape:"box",position:{x:0,y:.45,z:0},rotation:{y:0},size:{width:1.2,depth:.6,height:.9},appearance:"cabinet"}]},{id:"floor-eg",name:"EG",level:0,sortOrder:1,elevation:0,rooms:[{id:"room-eg-living",name:"Wohnzimmer",polygon:[{x:-3.2,z:-2.4},{x:3.2,z:-2.4},{x:3.2,z:2.4},{x:-3.2,z:2.4}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[{id:"wall-eg-north",start:{x:-3.2,z:-2.4},end:{x:3.2,z:-2.4},baseY:0,height:2.8,thickness:.15}],doors:[],windows:[{id:"cover-eg-window",wallId:"wall-eg-north",position:{x:0,y:.7,z:-2.4},rotation:{y:0},size:{width:1.8,height:1.7,depth:.08},openAngle:0,binding:{provider:"homeAssistant",deviceId:"cover.mikonus_reference",capability:"position"}}],objects:[{id:"light-eg-living",kind:"light",position:{x:-.8,y:2.35,z:.4},rotation:{y:0},size:{width:.42,depth:.42,height:.16},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_reference",capability:"power"}}]},{id:"floor-og",name:"OG",level:1,sortOrder:2,elevation:2.8,rooms:[{id:"room-og-bedroom",name:"Schlafzimmer",polygon:[{x:-2.8,z:-2.1},{x:2.8,z:-2.1},{x:2.8,z:2.1},{x:-2.8,z:2.1}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"light-og-bedroom",kind:"light",position:{x:.9,y:2.35,z:-.3},rotation:{y:0},size:{width:.38,depth:.38,height:.14},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_upstairs",capability:"power"}}]}]};var J={"light.mikonus_reference":"light","light.mikonus_upstairs":"upstairs_light","cover.mikonus_reference":"cover"};function B(i={}){let e=structuredClone(z);for(let t of e.floors)for(let a of["objects","doors","windows"])for(let n of t[a])n.binding&&(n.binding.deviceId=i[J[n.binding.deviceId]]??n.binding.deviceId);return e}var R=class{#t=null;#e=new Set;#i=!1;read(){return this.#t}updateHass(e){if(this.#i)return;let t=e?.themes?.darkMode,a=typeof t=="boolean"?t?"dark":"light":null;if(a!==this.#t){this.#t=a;for(let n of this.#e)n(a)}}subscribe(e){return this.#i?()=>{}:(this.#e.add(e),()=>this.#e.delete(e))}dispose(){this.#i=!0,this.#e.clear()}};function V(i){if(!i||i.type!=="custom:mikonus-3d-card")throw new Error("Expected type: custom:mikonus-3d-card.");if(i.scene==="published"){if(i.scene_id!==void 0&&(typeof i.scene_id!="string"||!/^mikonus:[A-Za-z0-9][A-Za-z0-9:_-]{0,190}$/.test(i.scene_id)))throw new Error("Invalid scene_id.");if(i.entities!==void 0)throw new Error("entities applies only to scene: reference.");return{type:"custom:mikonus-3d-card",scene:"published",...i.scene_id?{scene_id:i.scene_id}:{}}}if(i.scene!==void 0&&i.scene!=="reference")throw new Error("Expected scene: reference or published.");if(i.scene_id!==void 0)throw new Error("scene_id requires scene: published.");let e=i.entities??{};if(!e||typeof e!="object"||Array.isArray(e))throw new Error("entities must be a mapping.");let t={};for(let a of Object.keys(e).sort()){let n={light:"light",upstairs_light:"light",cover:"cover"}[a],r=e[a];if(!n||typeof r!="string"||!w.test(r)||!r.startsWith(`${n}.`))throw new Error(`Invalid reference entity mapping: ${a}.`);t[a]=r}return{type:"custom:mikonus-3d-card",scene:"reference",entities:t}}function H(i){return class extends HTMLElement{#t=null;#e=null;#i=null;#s=null;#n=0;#u=new Map;#r=null;#a=null;#c=t=>{t.persisted&&(this.#h(),this.#l())};constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML='<style>:host{display:block;height:100%;min-height:360px}.card{position:relative;height:100%;min-height:360px;border-radius:var(--ha-card-border-radius,12px);overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff))}.viewport{position:absolute;inset:0}p{position:absolute;inset:16px auto auto 16px;margin:0;max-width:calc(100% - 32px);font:14px system-ui;color:var(--primary-text-color,#222)}[hidden]{display:none}</style><div class="card"><div class="viewport"></div><p role="status">Warte auf Home Assistant \u2026</p></div>'}setConfig(t){let a=V(t);JSON.stringify(a)!==JSON.stringify(this.#t)&&(this.#t=a,this.#h(),this.#l())}set hass(t){let a=this.#e&&this.#e.connection!==t?.connection;this.#e=t,a&&this.#t?.scene==="published"&&this.#h(),this.#a?.updateHass(t),this.#s?.updateHass(t),this.#l()}get hass(){return this.#e}connectedCallback(){window.addEventListener("pageshow",this.#c),this.#l()}disconnectedCallback(){window.removeEventListener("pageshow",this.#c),this.#h()}getCardSize(){return 8}getGridOptions(){return{columns:12,rows:7,min_columns:6,min_rows:6}}static getStubConfig(){return{scene:"reference"}}#o(t){let a=this.shadowRoot.querySelector("[role=status]");a.textContent=t,a.hidden=!t}#l(){if(!this.isConnected||!this.#t||!this.#e||this.#s)return;let t=++this.#n,a=new E(this.#e);this.#s=a,this.#a=new R,this.#a.updateHass(this.#e),this.#o("Mikonus wird geladen \u2026");let n=this.#u,r={getItem:s=>n.get(s)??null,setItem:(s,o)=>n.set(s,String(o)),removeItem:s=>n.delete(s)};this.#t.scene==="published"&&(this.#r=new C(this.#e.connection,{sceneId:this.#t.scene_id,onStatus:s=>{t===this.#n&&this.#o(s?.message??"")}}));try{let s=i({container:this.shadowRoot.querySelector(".viewport"),runtime:a,scene:this.#r?void 0:B(this.#t.entities),sceneSource:this.#r,themeSource:this.#a,storage:r,onReady:()=>{t===this.#n&&this.#o("")},onError:o=>{t===this.#n&&(a.dispose(),this.#r?.dispose(),this.#o(`Mikonus konnte nicht geladen werden: ${o.message??"Unbekannter Fehler"}`))}});t!==this.#n?s.dispose():this.#i=s}catch(s){a.dispose(),this.#r?.dispose(),this.#o(`Mikonus konnte nicht geladen werden: ${s.message}`)}}#h(){++this.#n;try{this.#i?.dispose()}finally{this.#r?.dispose(),this.#r=null,this.#a?.dispose(),this.#a=null,this.#s?.dispose(),this.#s=null,this.#i=null,this.shadowRoot.querySelector(".viewport").replaceChildren()}}}}var G=`(()=>{var X0=Object.create;var od=Object.defineProperty;var q0=Object.getOwnPropertyDescriptor;var Y0=Object.getOwnPropertyNames;var $0=Object.getPrototypeOf,j0=Object.prototype.hasOwnProperty;var Ka=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Z0=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Y0(e))!j0.call(n,s)&&s!==t&&od(n,s,{get:()=>e[s],enumerable:!(i=q0(e,s))||i.enumerable});return n};var ei=(n,e,t)=>(t=n!=null?X0($0(n)):{},Z0(e||!n||!n.__esModule?od(t,"default",{value:n,enumerable:!0}):t,n));var Ll=Ka((Nw,cd)=>{"use strict";function os(n,e){return\`\${n}:\${e}\`}function Fs(n){let e=n.end.x-n.start.x,t=n.end.z-n.start.z,i=Math.hypot(e,t);if(!Number.isFinite(i)||i<=0)throw new TypeError(\`Wall \${n.id??"<unknown>"} must have a positive length.\`);return{length:i,direction:{x:e/i,z:t/i},perpendicular:{x:-t/i,z:e/i}}}function Dl(n,e,t){let i=Fs(n),s=e.rotation.y*Math.PI/180,r={x:Math.cos(s),z:-Math.sin(s)},a={x:e.position.x+r.x*e.size.width/2,z:e.position.z+r.z*e.size.width/2},o=(a.x-n.start.x)*i.direction.x+(a.z-n.start.z)*i.direction.z,c=t==="door"?0:e.position.y-n.baseY;return{id:e.id,kind:t,wallId:n.id,centerOffset:o,minimumOffset:o-e.size.width/2,maximumOffset:o+e.size.width/2,minimumY:c,maximumY:c+e.size.height,width:e.size.width,height:e.size.height}}function K0(n,e){return[...n.doors.filter(t=>t.wallId===e.id).map(t=>Dl(e,t,"door")),...n.windows.filter(t=>t.wallId===e.id).map(t=>Dl(e,t,"window"))].sort((t,i)=>t.minimumOffset-i.minimumOffset||t.minimumY-i.minimumY||t.id.localeCompare(i.id))}function J0(n,e,t){let i=Math.max(0,Math.min(n.minimumOffset,e)),s=Math.max(0,Math.min(n.maximumOffset,e)),r=Math.max(0,Math.min(n.minimumY,t)),a=Math.max(0,Math.min(n.maximumY,t));return s-i<.001||a-r<.001?null:{minimumOffset:i,maximumOffset:s,minimumY:r,maximumY:a}}function Q0(n){let e=[...n].sort((i,s)=>i-s),t=[];for(let i of e)(t.length===0||Math.abs(i-t[t.length-1])>=.001)&&t.push(i);return t}function eg(n,e){let{length:t}=Fs(n),i=e.map(a=>J0(a,t,n.height)).filter(Boolean);if(i.length===0)return[{minimumOffset:0,maximumOffset:t,minimumY:0,maximumY:n.height,width:t,height:n.height,centerOffset:t/2,centerY:n.height/2}];let s=Q0(new Set([0,t,...i.flatMap(a=>[a.minimumOffset,a.maximumOffset])])),r=[];for(let a=1;a<s.length;a+=1){let o=s[a-1],c=s[a];if(c-o<.001)continue;let l=(o+c)/2,u=i.filter(d=>l>=d.minimumOffset-.001&&l<=d.maximumOffset+.001).map(d=>[d.minimumY,d.maximumY]).sort((d,p)=>d[0]-p[0]),h=[];for(let d of u){let p=h[h.length-1];p&&d[0]<=p[1]+.001?p[1]=Math.max(p[1],d[1]):h.push([...d])}let f=0;for(let d of h)d[0]-f>=.001&&r.push(Fr(o,c,f,d[0])),f=Math.max(f,d[1]);n.height-f>=.001&&r.push(Fr(o,c,f,n.height))}return r}function Fr(n,e,t,i){return{minimumOffset:n,maximumOffset:e,minimumY:t,maximumY:i,width:e-n,height:i-t,centerOffset:(n+e)/2,centerY:(t+i)/2}}function tg(n,e,t=1.38,i=.04){let s=n.minimumY<=.002,r=n.maximumY<e-.002,a=null;s&&r?a=n.maximumY:s&&(a=Math.min(n.maximumY,Math.max(t,i)));let o=[],c=[];return a!==null&&a-n.minimumY>=i?(o.push(Fr(n.minimumOffset,n.maximumOffset,n.minimumY,a)),n.maximumY-a>=i&&c.push(Fr(n.minimumOffset,n.maximumOffset,a,n.maximumY))):c.push(n),{visiblePanels:o,lightOccluderPanels:c}}function ng(n,e,t=.01){let i=Math.min(n.maximumOffset,e.maximumOffset)-Math.max(n.minimumOffset,e.minimumOffset),s=Math.min(n.maximumY,e.maximumY)-Math.max(n.minimumY,e.minimumY);return i>t&&s>t}function ig(n,e=.11){let t=n.flatMap((d,p)=>{let x=Fs(d);return[{wall:d,wallIndex:p,end:"start",point:d.start,inward:x.direction},{wall:d,wallIndex:p,end:"end",point:d.end,inward:{x:-x.direction.x,z:-x.direction.z}}]}),i=t.map((d,p)=>p),s=d=>{let p=d;for(;i[p]!==p;)p=i[p];return p},r=(d,p)=>{let x=s(d),m=s(p);x!==m&&(i[m]=x)},a=e*e;for(let d=0;d<t.length;d+=1)for(let p=d+1;p<t.length;p+=1){let x=t[d],m=t[p];if(x.wall.id===m.wall.id||Math.abs(x.wall.baseY-m.wall.baseY)>e)continue;let g=x.point.x-m.point.x,w=x.point.z-m.point.z;g*g+w*w<=a&&r(d,p)}let o=new Map;t.forEach((d,p)=>{let x=s(p);o.has(x)||o.set(x,[]),o.get(x).push(p)});let c=new Set,l=new Set,u=new Set,h=new Map,f=[];for(let d of o.values()){if(new Set(d.map(E=>t[E].wall.id)).size<2||(d.forEach(E=>c.add(os(t[E].wall.id,t[E].end))),d.length!==2))continue;let p=t[d[0]],x=t[d[1]],m=p.inward.x*x.inward.x+p.inward.z*x.inward.z,g=p.inward.x*x.inward.z-p.inward.z*x.inward.x,w={x:(p.point.x+x.point.x)/2,z:(p.point.z+x.point.z)/2};if(Math.abs(m)<=.2&&Math.abs(g)>=.96){g<0&&([p,x]=[x,p]);let E=Math.max(p.wall.thickness,x.wall.thickness),y=E/2,T={x:w.x+(p.inward.x+x.inward.x)*y,z:w.z+(p.inward.z+x.inward.z)*y},b={center:w,arcCenter:T,first:p,second:x,thickness:E,elevation:(p.wall.baseY+x.wall.baseY)/2,height:Math.min(p.wall.height,x.wall.height)};f.push(b),l.add(os(p.wall.id,p.end)),l.add(os(x.wall.id,x.end))}else if(m<=-.98&&Math.abs(g)<=.08)for(let E of[p,x]){let y=os(E.wall.id,E.end),T={x:-E.inward.x,z:-E.inward.z};u.add(y),h.set(y,(w.x-E.point.x)*T.x+(w.z-E.point.z)*T.z)}}return t.forEach(d=>{let p=os(d.wall.id,d.end);if(!c.has(p))for(let x of n){if(x.id===d.wall.id||Math.abs(x.baseY-d.wall.baseY)>e)continue;let m=Fs(x),g=d.point.x-x.start.x,w=d.point.z-x.start.z,E=(g*m.direction.x+w*m.direction.z)/m.length;if(E<=.03||E>=.97)continue;let y={x:x.start.x+m.direction.x*m.length*E,z:x.start.z+m.direction.z*m.length*E},T=d.point.x-y.x,b=d.point.z-y.z;if(T*T+b*b<=a){c.add(p);break}}}),f.sort((d,p)=>d.center.x-p.center.x||d.center.z-p.center.z),{joinedEndpoints:c,roundedEndpoints:l,continuationEndpoints:u,continuationAlignmentOffsets:h,roundedCorners:f}}function sg(n,e=0,t=16){let i=Math.max(Math.round(t),4),s=Math.max(n.thickness+Math.max(e,0),.001),r=[{...n.arcCenter}];for(let a=i;a>=0;a-=1){let o=a/i*Math.PI/2;r.push({x:n.arcCenter.x-n.first.inward.x*Math.sin(o)*s-n.second.inward.x*Math.cos(o)*s,z:n.arcCenter.z-n.first.inward.z*Math.sin(o)*s-n.second.inward.z*Math.cos(o)*s})}return r}function rg(n,e,t){let i=Fs(e),s=Math.abs(n.minimumOffset)<=.003,r=Math.abs(n.maximumOffset-i.length)<=.003,a=os(e.id,"start"),o=os(e.id,"end"),c=e.thickness/2,l=n.minimumOffset,u=n.maximumOffset;if(s&&(t.roundedEndpoints.has(a)?l+=c:t.continuationEndpoints.has(a)?l-=t.continuationAlignmentOffsets?.get(a)??0:t.joinedEndpoints.has(a)&&(l-=c)),r&&(t.roundedEndpoints.has(o)?u-=c:t.continuationEndpoints.has(o)?u+=t.continuationAlignmentOffsets?.get(o)??0:t.joinedEndpoints.has(o)&&(u+=c)),u-l<.012){let f=(n.minimumOffset+n.maximumOffset)/2;l=f-.006,u=f+.006}return Fr(l,u,n.minimumY,n.maximumY)}cd.exports={DOLLHOUSE_WALL_HEIGHT:1.38,MINIMUM_PANEL_SIZE:.001,OPENING_OVERLAP_EPSILON:.01,PRESENTATION_MINIMUM_PANEL_SIZE:.04,WALL_CORNER_SEGMENTS:16,WALL_JOIN_TOLERANCE:.11,buildWallPanels:eg,collectWallOpenings:K0,contactOpening:Dl,openingsOverlap:ng,joinedWallPanel:rg,resolveWallPresentation:tg,resolveWallJoinTopology:ig,roundedCornerFootprint:sg,wallFrame:Fs}});var yd=Ka((Fw,_d)=>{"use strict";var{contactOpening:ag,openingsOverlap:og,wallFrame:cg}=Ll(),Nl=Object.freeze([1,2]),lg=2,ug=new Set(["light","furniture","decor"]),Qa=new Set(["box","cylinder","ellipsoid"]),eo=.1,to=Object.freeze({maxJsonBytes:2*1024*1024,maxFloors:16,maxRooms:256,maxWalls:4096,maxDoors:1024,maxWindows:2048,maxObjects:8192,maxPolygonPointsPerRoom:1024}),Us=class extends Error{constructor(e,t){super(e,t),this.name="DashboardSceneError",this.code="invalid_dashboard_scene"}};function ht(n,e){throw new Us(\`\${n}: \${e}\`)}function Li(n){return n!==null&&typeof n=="object"&&!Array.isArray(n)}function Vt(n,e){Li(n)||ht(e,"must be an object.")}function cs(n,e){Array.isArray(n)||ht(e,"must be an array.")}function Ct(n,e){(typeof n!="string"||n.trim().length===0)&&ht(e,"must be a non-empty string.")}function Bt(n,e,{positive:t=!1}={}){Number.isFinite(n)||ht(e,"must be a finite number."),t&&n<=0&&ht(e,"must be greater than zero.")}function ld(n,e,{nonNegative:t=!1}={}){Bt(n,e),Number.isInteger(n)||ht(e,"must be an integer."),t&&n<0&&ht(e,"must be zero or greater.")}function Ol(n,e){Bt(n,e),(n<0||n>1)&&ht(e,"must be between zero and one.")}function fd(n){return typeof TextEncoder=="function"?new TextEncoder().encode(n).byteLength:typeof Buffer<"u"?Buffer.byteLength(n,"utf8"):unescape(encodeURIComponent(n)).length}function hg(n){let e;try{e=JSON.stringify(n)}catch(t){throw new Us("scene: must be JSON serializable.",{cause:t})}return typeof e!="string"&&ht("scene","must be a JSON object."),fd(e)}function ls(n,e,t){e>t&&ht(n,\`contains \${e} entries; maximum is \${t}.\`)}function Fl(n,e){Vt(n,e),Bt(n.x,\`\${e}.x\`),Bt(n.z,\`\${e}.z\`)}function pd(n,e){Vt(n,e),Bt(n.x,\`\${e}.x\`),Bt(n.y,\`\${e}.y\`),Bt(n.z,\`\${e}.z\`)}function md(n,e){Vt(n,e),Bt(n.y,\`\${e}.y\`)}function Ul(n,e){Vt(n,e),Bt(n.width,\`\${e}.width\`,{positive:!0}),Bt(n.depth,\`\${e}.depth\`,{positive:!0}),Bt(n.height,\`\${e}.height\`,{positive:!0})}function gd(n,e){if(typeof n>"u")return;Vt(n,e),Ct(n.provider,\`\${e}.provider\`),Ct(n.capability,\`\${e}.capability\`);let t=typeof n.deviceId<"u",i=typeof n.slot<"u";t===i&&ht(e,"must contain exactly one of deviceId or slot."),t&&Ct(n.deviceId,\`\${e}.deviceId\`),i&&Ct(n.slot,\`\${e}.slot\`)}function no(n,e){typeof n<"u"&&Ct(n,e)}function dg(n,e){if(!(typeof n>"u")){Vt(n,e),Vt(n.materialSlots,\`\${e}.materialSlots\`);for(let[t,i]of Object.entries(n.materialSlots)){Ct(t,\`\${e}.materialSlots key\`);let s=\`\${e}.materialSlots.\${t}\`;Di(i,s)}}}function Di(n,e){typeof n>"u"||(Vt(n,e),Ct(n.materialKey,\`\${e}.materialKey\`),(typeof n.baseColor!="string"||!/^#[0-9A-Fa-f]{6}$/.test(n.baseColor))&&ht(\`\${e}.baseColor\`,"must be an RGB hex color."),Ol(n.roughness,\`\${e}.roughness\`),Ol(n.metallic,\`\${e}.metallic\`),Ol(n.opacity,\`\${e}.opacity\`),typeof n.pattern<"u"&&(Vt(n.pattern,\`\${e}.pattern\`),Ct(n.pattern.kind,\`\${e}.pattern.kind\`),Bt(n.pattern.elementSize,\`\${e}.pattern.elementSize\`,{positive:!0}),Bt(n.pattern.lineWidth,\`\${e}.pattern.lineWidth\`,{positive:!0}),Ct(n.pattern.orientation,\`\${e}.pattern.orientation\`)))}function fg(n,e){typeof n>"u"||(Vt(n,e),Di(n.body,\`\${e}.body\`),Di(n.positiveSide,\`\${e}.positiveSide\`),Di(n.negativeSide,\`\${e}.negativeSide\`))}function pg(n,e){typeof n>"u"||(Vt(n,e),Di(n.panel,\`\${e}.panel\`),Di(n.frame,\`\${e}.frame\`),Di(n.reveal,\`\${e}.reveal\`))}function mg(n,e){if(!(typeof n>"u")){Vt(n,e);for(let[t,i]of Object.entries(n))Ct(t,\`\${e} key\`),typeof i!="string"&&typeof i!="boolean"&&!Number.isFinite(i)&&ht(\`\${e}.\${t}\`,"must be a finite number, string, or boolean.")}}function Ur(n,e,t){Ct(n,e),t.has(n)&&ht(e,\`duplicate scene id "\${n}".\`),t.add(n)}function gg(n){return Li(n)?{...n,elevation:n.elevation??0,floorThickness:n.floorThickness??.2,appearance:n.appearance??"floor"}:n}function xg(n){return Li(n)?{...n,baseY:n.baseY??0,appearance:n.appearance??"wall"}:n}function xd(n){return n==null?{y:0}:Li(n)?{...n,y:n.y??0}:n}function ud(n,e){return Li(n)?{...n,rotation:xd(n.rotation),openAngle:n.openAngle??70,appearance:n.appearance??e}:n}function vg(n){if(!Li(n))return n;let e=n.appearance==="floor-lamp"?"floorLamp":n.appearance==="table-lamp"?"tableLamp":"floorLamp";return{...n,rotation:xd(n.rotation),visualType:n.visualType??(n.kind==="light"?e:void 0),appearance:n.appearance??(n.assetKey?{materialSlots:{}}:n.kind)}}function _g(n,e,t){if(!Li(n))return n;let i={...n,rooms:Array.isArray(n.rooms)?n.rooms.map(gg):n.rooms??[],walls:Array.isArray(n.walls)?n.walls.map(xg):n.walls??[],doors:Array.isArray(n.doors)?n.doors.map(s=>ud(s,"door")):n.doors??[],windows:Array.isArray(n.windows)?n.windows.map(s=>ud(s,"window")):n.windows??[],objects:Array.isArray(n.objects)?n.objects.map(vg):n.objects??[]};return e!==1?i:{...i,level:0,sortOrder:t,elevation:0}}function yg(n,e){let t=n.sortOrder-e.sortOrder;if(t!==0)return t;let i=n.level-e.level;return i!==0?i:n.id<e.id?-1:n.id>e.id?1:0}function bg(n,e,t,i){Vt(n,e),Ur(n.id,\`\${e}.id\`,t),Ct(n.name,\`\${e}.name\`),cs(n.polygon,\`\${e}.polygon\`),n.polygon.length<3&&ht(\`\${e}.polygon\`,"must contain at least three points."),ls(\`\${e}.polygon\`,n.polygon.length,i.maxPolygonPointsPerRoom),n.polygon.forEach((s,r)=>Fl(s,\`\${e}.polygon[\${r}]\`)),Bt(n.elevation,\`\${e}.elevation\`),Bt(n.floorThickness,\`\${e}.floorThickness\`,{positive:!0}),no(n.appearance,\`\${e}.appearance\`),Di(n.material,\`\${e}.material\`)}function Mg(n,e,t){Vt(n,e),Ur(n.id,\`\${e}.id\`,t),Fl(n.start,\`\${e}.start\`),Fl(n.end,\`\${e}.end\`),n.start.x===n.end.x&&n.start.z===n.end.z&&ht(e,"start and end must describe a wall with non-zero length."),Bt(n.baseY,\`\${e}.baseY\`),Bt(n.height,\`\${e}.height\`,{positive:!0}),Bt(n.thickness,\`\${e}.thickness\`,{positive:!0}),no(n.appearance,\`\${e}.appearance\`),fg(n.materials,\`\${e}.materials\`)}function hd(n,e,t){Vt(n,e),Ur(n.id,\`\${e}.id\`,t),typeof n.wallId<"u"&&Ct(n.wallId,\`\${e}.wallId\`),pd(n.position,\`\${e}.position\`),md(n.rotation,\`\${e}.rotation\`),Ul(n.size,\`\${e}.size\`),Bt(n.openAngle,\`\${e}.openAngle\`),no(n.appearance,\`\${e}.appearance\`),pg(n.materials,\`\${e}.materials\`),gd(n.binding,\`\${e}.binding\`)}function dd(n,e,t,i){let s=ag(e,n,t),{length:r}=cg(e);return(s.minimumOffset<-eo||s.maximumOffset>r+eo)&&ht(i,"opening must lie within its referenced wall."),t==="window"&&s.minimumY<-eo&&ht(\`\${i}.position.y\`,"window sill must not be below its referenced wall."),s.maximumY>e.height+eo&&ht(i,"opening height must lie within its referenced wall."),s}function Sg(n){for(let e=0;e<n.length;e+=1)for(let t=e+1;t<n.length;t+=1)og(n[e].opening,n[t].opening)&&ht(n[t].path,"opening overlaps another opening in the same wall.")}function Eg(n,e,t){Vt(n,e),Ur(n.id,\`\${e}.id\`,t),Ct(n.kind,\`\${e}.kind\`),ug.has(n.kind)||ht(\`\${e}.kind\`,"must be light, furniture, or decor."),pd(n.position,\`\${e}.position\`),md(n.rotation,\`\${e}.rotation\`),Ul(n.size,\`\${e}.size\`),gd(n.binding,\`\${e}.binding\`),typeof n.visualType<"u"&&Ct(n.visualType,\`\${e}.visualType\`),mg(n.parameters,\`\${e}.parameters\`),typeof n.assetKey<"u"?(Ct(n.assetKey,\`\${e}.assetKey\`),n.kind!=="furniture"&&n.kind!=="decor"&&ht(\`\${e}.kind\`,"an assetKey is only valid for furniture or decor."),typeof n.variantKey<"u"?Ct(n.variantKey,\`\${e}.variantKey\`):ht(\`\${e}.variantKey\`,"must be a non-empty string."),Ul(n.dimensions,\`\${e}.dimensions\`),dg(n.appearance,\`\${e}.appearance\`)):no(n.appearance,\`\${e}.appearance\`),n.kind!=="light"&&typeof n.assetKey>"u"?(Ct(n.shape,\`\${e}.shape\`),Qa.has(n.shape)||ht(\`\${e}.shape\`,\`must be one of \${[...Qa].join(", ")}.\`)):typeof n.shape<"u"&&!Qa.has(n.shape)&&ht(\`\${e}.shape\`,\`must be one of \${[...Qa].join(", ")} when provided.\`)}function wg(n){Vt(n,"metadata"),typeof n.generatedAt<"u"&&Ct(n.generatedAt,"metadata.generatedAt"),typeof n.generator<"u"&&Ct(n.generator,"metadata.generator"),typeof n.revision<"u"&&Ct(n.revision,"metadata.revision")}function vd(n,{limits:e=to}={}){let t={...to,...e};Vt(n,"scene");let i=hg(n);i>t.maxJsonBytes&&ht("scene",\`JSON size is \${i} bytes; maximum is \${t.maxJsonBytes} bytes.\`),Nl.includes(n.schemaVersion)||ht("schemaVersion",\`unsupported version \${String(n.schemaVersion)}; expected one of \${Nl.join(", ")}.\`),Ct(n.sceneId,"sceneId"),Ct(n.name,"name"),cs(n.floors,"floors"),n.floors.length===0&&ht("floors","must contain at least one floor."),ls("floors",n.floors.length,t.maxFloors),n.schemaVersion===2&&(Ct(n.defaultFloorId,"defaultFloorId"),typeof n.activeFloorId<"u"&&ht("activeFloorId","must not be stored in a Dashboard Scene v2."));let s={...n,metadata:n.metadata??{},defaultFloorId:n.schemaVersion===1?n.floors[0]?.id:n.defaultFloorId,floors:Array.isArray(n.floors)?n.floors.map((l,u)=>_g(l,n.schemaVersion,u)):n.floors};wg(s.metadata);let r={rooms:0,walls:0,doors:0,windows:0,objects:0};for(let l of s.floors)if(Li(l))for(let u of Object.keys(r))Array.isArray(l[u])&&(r[u]+=l[u].length);ls("rooms",r.rooms,t.maxRooms),ls("walls",r.walls,t.maxWalls),ls("doors",r.doors,t.maxDoors),ls("windows",r.windows,t.maxWindows),ls("objects",r.objects,t.maxObjects);let a=new Set([s.sceneId]),o=new Set;s.floors.forEach((l,u)=>{let h=\`floors[\${u}]\`;Vt(l,h),Ur(l.id,\`\${h}.id\`,a),o.add(l.id),Ct(l.name,\`\${h}.name\`),ld(l.level,\`\${h}.level\`),ld(l.sortOrder,\`\${h}.sortOrder\`,{nonNegative:!0}),Bt(l.elevation,\`\${h}.elevation\`),cs(l.rooms,\`\${h}.rooms\`),cs(l.walls,\`\${h}.walls\`),cs(l.doors,\`\${h}.doors\`),cs(l.windows,\`\${h}.windows\`),cs(l.objects,\`\${h}.objects\`),l.rooms.forEach((x,m)=>bg(x,\`\${h}.rooms[\${m}]\`,a,t)),l.walls.forEach((x,m)=>Mg(x,\`\${h}.walls[\${m}]\`,a)),l.doors.forEach((x,m)=>hd(x,\`\${h}.doors[\${m}]\`,a)),l.windows.forEach((x,m)=>hd(x,\`\${h}.windows[\${m}]\`,a)),l.objects.forEach((x,m)=>Eg(x,\`\${h}.objects[\${m}]\`,a));let f=new Map(l.walls.map(x=>[x.id,x])),d=new Set(f.keys()),p=new Map;l.doors.forEach((x,m)=>{let g=\`\${h}.doors[\${m}]\`;if(x.wallId&&!d.has(x.wallId)&&ht(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=dd(x,f.get(x.wallId),"door",g),E=p.get(x.wallId)??[];E.push({opening:w,path:g}),p.set(x.wallId,E)}}),l.windows.forEach((x,m)=>{let g=\`\${h}.windows[\${m}]\`;if(x.wallId&&!d.has(x.wallId)&&ht(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=dd(x,f.get(x.wallId),"window",g),E=p.get(x.wallId)??[];E.push({opening:w,path:g}),p.set(x.wallId,E)}}),p.forEach(Sg)}),o.has(s.defaultFloorId)||ht("defaultFloorId",\`"\${s.defaultFloorId}" does not reference a floor.\`);let c=s.schemaVersion===2?[...s.floors].sort(yg):s.floors;return{...s,floors:c,activeFloorId:s.defaultFloorId}}function Tg(n,e){typeof n!="string"&&ht("scene","JSON source must be a string.");let t=e?.limits?.maxJsonBytes??to.maxJsonBytes;fd(n)>t&&ht("scene",\`JSON size exceeds the maximum of \${t} bytes.\`);let i;try{i=JSON.parse(n)}catch(s){throw new Us("Scene JSON could not be parsed.",{cause:s})}return vd(i,e)}_d.exports={DASHBOARD_SCENE_LIMITS:to,DashboardSceneError:Us,SUPPORTED_SCHEMA_VERSION:lg,SUPPORTED_SCHEMA_VERSIONS:Nl,parseDashboardScene:Tg,validateDashboardScene:vd}});var Bl=Ka((Uw,Md)=>{"use strict";var bd=yd(),{DashboardSceneError:io,parseDashboardScene:Ag}=bd;async function Cg(n,{fetchImpl:e=globalThis.fetch,signal:t}={}){if(typeof e!="function")throw new io("Scene loading requires fetch support.");let i;try{i=await e(n,{cache:"no-store",...t?{signal:t}:{}})}catch(r){throw new io(\`Scene could not be fetched from \${n}.\`,{cause:r})}if(!i?.ok)throw new io(\`Scene request failed with HTTP \${i?.status??"unknown"} for \${n}.\`);let s;try{s=await i.text()}catch(r){throw new io(\`Scene response from \${n} could not be read.\`,{cause:r})}return Ag(s)}Md.exports={...bd,loadDashboardScene:Cg}});var ts=Ka((OC,km)=>{"use strict";var Nm=Object.freeze({AVAILABLE:"available",UNAVAILABLE:"unavailable",MISSING:"missing"}),fE=Object.freeze({SET_POWER:"setPower",TOGGLE_POWER:"togglePower",SET_BRIGHTNESS:"setBrightness",SET_COLOR:"setColor",SET_COLOR_TEMPERATURE:"setColorTemperature",SET_COVER_POSITION:"setCoverPosition",OPEN_COVER:"openCover",CLOSE_COVER:"closeCover",STOP_COVER:"stopCover",SET_TARGET_TEMPERATURE:"setTargetTemperature",SET_THERMOSTAT_MODE:"setThermostatMode",SET_FAN_SPEED:"setFanSpeed",SET_FAN_MODE:"setFanMode",SET_TARGET_HUMIDITY:"setTargetHumidity",START_CLEANING:"startCleaning",PAUSE_CLEANING:"pauseCleaning",STOP_CLEANING:"stopCleaning",RETURN_TO_BASE:"returnToBase",LOCK:"lock",UNLOCK:"unlock"});function wr(n){return n?.availability===Nm.AVAILABLE}function pE(n){return!!(n?.power&&Object.prototype.hasOwnProperty.call(n.power,"isOn"))}function mE(n){return wr(n)&&typeof n?.power?.isOn=="boolean"}function gE(n){return wr(n)?n?.contact?.state??"unknown":"unknown"}function Fm(n){return!!n?.cover}function xE(n){return wr(n)&&Fm(n)}function Um(n){return!!n?.climate}function vE(n){return wr(n)&&Um(n)}function Bm(n){return!!n?.cleaning}function _E(n){return wr(n)&&Bm(n)}km.exports={DEVICE_AVAILABILITY:Nm,DEVICE_COMMAND:fE,contactState:gE,hasCleaningState:Bm,hasClimateState:Um,hasCoverState:Fm,hasPowerState:pE,isAvailable:wr,isUsableCleaningState:_E,isUsableClimateState:vE,isUsableCoverState:xE,isUsablePowerState:mE}});var Ja=class{constructor(e){this.controller=new AbortController,this.signal=this.controller.signal,this.cleanups=[],this.disposed=!1;let t=()=>this.dispose();e?.aborted?this.dispose():e&&(e.addEventListener("abort",t,{once:!0}),this.defer(()=>e.removeEventListener("abort",t)))}defer(e){typeof e=="function"&&(this.disposed?e():this.cleanups.push(e))}check(){this.signal.throwIfAborted()}async wait(e){this.disposed&&(Promise.resolve(e).catch(()=>{}),this.check());let t;try{let i=await Promise.race([e,new Promise((s,r)=>{t=()=>r(this.signal.reason),this.signal.addEventListener("abort",t,{once:!0})})]);return this.check(),i}finally{this.signal.removeEventListener("abort",t)}}dispose(){if(!this.disposed){this.disposed=!0,this.controller.abort(new DOMException("Dashboard viewer was destroyed.","AbortError"));for(let e of this.cleanups.reverse())try{e()}catch(t){console.warn("Dashboard cleanup failed.",t)}this.cleanups.length=0}}};var Sd=ei(Bl());function Ed(n){let e=n?.scene,t=e&&typeof e=="object"&&!Array.isArray(e)?(({activeFloorId:i,...s})=>s)(e):e;return{...n,scene:Sd.default.validateDashboardScene(t)}}var wd=\`
:where(.mikonus-renderer-ui.device-details-open) .mikonus-renderer-canvas { pointer-events: none; cursor: default; }
/* Shared UI only. Hosts retain their document, shell and header layout. */
.mikonus-renderer-ui {
  --dashboard-ui-text-primary: var(--dashboard-host-text-primary, #26313c);
  --dashboard-ui-text-secondary: var(--dashboard-host-text-secondary, rgba(38,49,60,.7));
  --dashboard-control-border: rgba(38,49,60,.14);
  --dashboard-control-background: rgba(244,246,247,.88);
  --dashboard-control-shadow: rgba(24,31,38,.14);
  --dashboard-control-selected-background: rgba(38,49,60,.92);
  --dashboard-control-selected-text: #fff;
  --dashboard-chevron: rgba(38,49,60,.66);
  --dashboard-control-size: 44px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.mikonus-renderer-ui[data-dashboard-theme="dark"] {
  --dashboard-ui-text-primary: var(--dashboard-host-text-primary, #f2f4f5);
  --dashboard-ui-text-secondary: var(--dashboard-host-text-secondary, rgba(236,239,241,.72));
  --dashboard-control-border: rgba(255,255,255,.18);
  --dashboard-control-background: rgba(38,44,50,.9);
  --dashboard-control-shadow: rgba(0,0,0,.24);
  --dashboard-control-selected-background: rgba(242,244,245,.94);
  --dashboard-control-selected-text: #26313c;
  --dashboard-chevron: rgba(242,244,245,.68);
  color-scheme: dark;
}
.mikonus-renderer-ui[data-dashboard-layout-size="spacious"] { --dashboard-control-size: 48px; }
:where(.mikonus-renderer-ui)[data-dashboard-layout-size="compact"] .floor-selector { font-size: 12px; }
:where(.mikonus-renderer-ui)[data-dashboard-layout-size="spacious"] .floor-selector { font-size: 14px; }
:where(.mikonus-renderer-ui) *, :where(.mikonus-renderer-ui) *::before,
:where(.mikonus-renderer-ui) *::after { box-sizing: border-box; }
:where(.mikonus-renderer-ui) [hidden] { display: none !important; }
:where(.mikonus-renderer-ui) .mikonus-renderer-canvas {
  display: block; width: 100%; height: 100%; touch-action: none; outline: none;
}
:where(.mikonus-renderer-ui) .mikonus-marker-host,
:where(.mikonus-renderer-ui) .mikonus-popup-host {
  position: absolute; inset: 0; pointer-events: none;
}
:where(.mikonus-renderer-ui) .mikonus-marker-host { z-index: 3; }
:where(.mikonus-renderer-ui) .mikonus-popup-host { z-index: 5; }
      :where(.mikonus-renderer-ui) .floor-selector {
        max-width: 100%;
        color: var(--dashboard-ui-text-primary);
        font-size: 13px;
        font-weight: 720;
        line-height: 1;
        pointer-events: auto;
      }

      :where(.mikonus-renderer-ui) .floor-selector[hidden],
      :where(.mikonus-renderer-ui) .floor-selector-segments[hidden],
      :where(.mikonus-renderer-ui) .floor-selector-compact[hidden] {
        display: none;
      }

      :where(.mikonus-renderer-ui) .floor-selector-segments {
        display: inline-flex;
        max-width: 100%;
        gap: 3px;
        padding: 2px;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 999px;
        background: var(--dashboard-control-background);
        box-shadow: 0 2px 8px var(--dashboard-control-shadow);
      }

      :where(.mikonus-renderer-ui) .floor-selector-segment {
        min-width: 44px;
        min-height: var(--dashboard-control-size);
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: inherit;
        font: inherit;
        white-space: nowrap;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .floor-selector-segment[aria-selected="true"] {
        background: var(--dashboard-control-selected-background);
        box-shadow: 0 1px 4px var(--dashboard-control-shadow);
        color: var(--dashboard-control-selected-text);
      }

      :where(.mikonus-renderer-ui) .floor-selector-segment:focus-visible,
      :where(.mikonus-renderer-ui) .floor-selector-select:focus-visible {
        outline: 2px solid var(--dashboard-accent, #2d845c);
        outline-offset: 2px;
      }

      :where(.mikonus-renderer-ui) .floor-selector-compact {
        position: relative;
        display: inline-block;
        max-width: 100%;
      }

      :where(.mikonus-renderer-ui) .floor-selector-select {
        width: 100%;
        min-width: 0;
        min-height: var(--dashboard-control-size);
        appearance: none;
        padding: 0 44px 0 16px;
        overflow: hidden;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 999px;
        background: var(--dashboard-control-background);
        box-shadow: 0 2px 8px var(--dashboard-control-shadow);
        color: var(--dashboard-ui-text-primary);
        font: inherit;
        text-overflow: ellipsis;
        white-space: nowrap;
        touch-action: manipulation;
      }

      :where(.mikonus-renderer-ui) .floor-selector-chevron {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-57%);
        color: var(--dashboard-chevron);
        font-size: 18px;
        pointer-events: none;
      }

      :where(.mikonus-renderer-ui) .device-affordance-layer {
        position: absolute;
        inset: 0;
        z-index: 3;
        pointer-events: none;
        transition: opacity 120ms ease;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }

      :where(.mikonus-renderer-ui) .device-affordance-layer[hidden] {
        display: none;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button {
        position: absolute;
        display: grid;
        width: 44px;
        height: 44px;
        transform: translate(-50%, -50%);
        place-items: center;
        padding: 0;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 50%;
        background: var(--dashboard-control-background);
        box-shadow: 0 3px 10px var(--dashboard-control-shadow);
        color: var(--dashboard-ui-text-primary);
        pointer-events: auto;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button svg {
        width: 21px;
        height: 21px;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 1.8;
      }

      :where(.mikonus-renderer-ui) .device-affordance-device-icon {
        display: none;
        width: 23px;
        height: 23px;
        background: currentColor;
        -webkit-mask: var(--device-affordance-icon) center / contain no-repeat;
        mask: var(--device-affordance-icon) center / contain no-repeat;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.has-device-icon svg {
        display: none;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.has-device-icon .device-affordance-device-icon {
        display: block;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button[data-marker-type="power"].is-on {
        border-color: rgba(45, 132, 92, 0.68);
        background: var(--dashboard-accent, #2d845c);
        color: #fff;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.is-active {
        border-color: rgba(34, 126, 214, 0.72);
        background: #247ed1;
        color: #fff;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.is-alert {
        border-color: rgba(214, 61, 61, 0.82);
        background: #c93636;
        color: #fff;
        box-shadow: 0 3px 14px rgba(201, 54, 54, 0.42);
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.is-unavailable {
        opacity: 0.5;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button:focus-visible {
        outline: 2px solid var(--dashboard-accent, #2d845c);
        outline-offset: 2px;
      }

      :where(.mikonus-renderer-ui) .device-details-layer {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 10px;
        background: rgba(16, 20, 24, 0.22);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        pointer-events: auto;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }

      :where(.mikonus-renderer-ui) .device-details-layer[hidden] {
        display: none;
      }

      :where(.mikonus-renderer-ui) .device-details-panel {
        width: min(100%, 390px);
        max-height: min(76%, 640px);
        overflow: hidden;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 20px;
        background: var(--dashboard-control-background);
        box-shadow: 0 16px 38px rgba(15, 20, 24, 0.3);
        color: var(--dashboard-ui-text-primary);
        outline: none;
      }

      :where(.mikonus-renderer-ui) .device-details-header {
        display: flex;
        min-height: 56px;
        align-items: center;
        gap: 12px;
        padding: 8px 8px 8px 18px;
        border-bottom: 1px solid var(--dashboard-control-border);
      }

      :where(.mikonus-renderer-ui) .device-details-title {
        min-width: 0;
        flex: 1;
        margin: 0;
        overflow: hidden;
        font-size: 18px;
        font-weight: 740;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :where(.mikonus-renderer-ui) .device-details-close {
        display: grid;
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
        place-items: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: rgba(127, 127, 127, 0.14);
        color: inherit;
        font: inherit;
        font-size: 27px;
        line-height: 1;
        touch-action: manipulation;
      }

      :where(.mikonus-renderer-ui) .device-details-body {
        display: grid;
        max-height: calc(min(76vh, 640px) - 57px);
        gap: 10px;
        padding: 12px;
        overflow: auto;
        overscroll-behavior: contain;
        touch-action: pan-y;
      }

      :where(.mikonus-renderer-ui) .device-details-section {
        display: grid;
        gap: 9px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(127, 127, 127, 0.1);
      }

      :where(.mikonus-renderer-ui) .device-details-section.is-alert {
        border: 1px solid rgba(201, 54, 54, 0.56);
        background: rgba(201, 54, 54, 0.14);
      }

      :where(.mikonus-renderer-ui) .device-details-section.is-warning {
        border: 1px solid rgba(208, 145, 33, 0.48);
        background: rgba(208, 145, 33, 0.12);
      }

      :where(.mikonus-renderer-ui) .device-details-section-title {
        margin: 0;
        color: var(--dashboard-ui-text-secondary);
        font-size: 12px;
        font-weight: 720;
        letter-spacing: 0.04em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      :where(.mikonus-renderer-ui) .device-details-value-row,
      :where(.mikonus-renderer-ui) .device-details-range-label,
      :where(.mikonus-renderer-ui) .device-details-stepper-row,
      :where(.mikonus-renderer-ui) .device-details-choice-row {
        display: flex;
        min-height: 28px;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      :where(.mikonus-renderer-ui) .device-details-choice-row {
        align-items: flex-start;
        flex-direction: column;
      }

      :where(.mikonus-renderer-ui) .device-details-choices {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 7px;
      }

      :where(.mikonus-renderer-ui) .device-details-choice {
        min-height: 38px;
        padding: 7px 12px;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 999px;
        background: transparent;
        color: var(--dashboard-ui-text-primary);
        font: inherit;
      }

      :where(.mikonus-renderer-ui) .device-details-choice.is-selected {
        border-color: var(--dashboard-accent, #2d845c);
        background: var(--dashboard-accent, #2d845c);
        color: #fff;
      }

      :where(.mikonus-renderer-ui) .device-details-value-label {
        color: var(--dashboard-ui-text-secondary);
        font-size: 13px;
      }

      :where(.mikonus-renderer-ui) .device-details-value,
      :where(.mikonus-renderer-ui) .device-details-range-value,
      :where(.mikonus-renderer-ui) .device-details-stepper-value {
        font-size: 14px;
        font-weight: 680;
        font-variant-numeric: tabular-nums;
      }

      :where(.mikonus-renderer-ui) .device-details-toggle {
        display: flex;
        min-height: 48px;
        align-items: center;
        justify-content: space-between;
        padding: 0 13px 0 16px;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 14px;
        background: rgba(127, 127, 127, 0.08);
        color: inherit;
        font: inherit;
        font-weight: 680;
        touch-action: manipulation;
      }

      :where(.mikonus-renderer-ui) .device-details-toggle-indicator {
        width: 26px;
        height: 26px;
        border: 7px solid rgba(127, 127, 127, 0.32);
        border-radius: 50%;
      }

      :where(.mikonus-renderer-ui) .device-details-toggle.is-on {
        border-color: rgba(45, 132, 92, 0.5);
        background: rgba(45, 132, 92, 0.14);
      }

      :where(.mikonus-renderer-ui) .device-details-toggle.is-on .device-details-toggle-indicator {
        border-color: var(--dashboard-accent, #2d845c);
      }

      :where(.mikonus-renderer-ui) .device-details-range {
        --range-fill: var(--dashboard-accent, #2d845c);
        --range-progress: 0%;
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        height: 46px;
        min-height: 46px;
        margin: -6px 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--range-fill);
        touch-action: none;
      }

      :where(.mikonus-renderer-ui) .device-details-range::-webkit-slider-runnable-track {
        height: 10px;
        border-radius: 999px;
        background: linear-gradient(
          to right,
          var(--range-fill) 0%,
          var(--range-fill) var(--range-progress),
          rgba(127, 127, 127, 0.25) var(--range-progress),
          rgba(127, 127, 127, 0.25) 100%
        );
      }

      :where(.mikonus-renderer-ui) .device-details-range::-webkit-slider-thumb {
        width: 28px;
        height: 28px;
        appearance: none;
        -webkit-appearance: none;
        margin-top: -9px;
        border: 3px solid #fff;
        border-radius: 50%;
        background: var(--range-fill);
        box-shadow: 0 1px 5px rgba(15, 20, 24, 0.38);
      }

      :where(.mikonus-renderer-ui) .device-details-range::-moz-range-track {
        height: 10px;
        border: 0;
        border-radius: 999px;
        background: rgba(127, 127, 127, 0.25);
      }

      :where(.mikonus-renderer-ui) .device-details-range::-moz-range-progress {
        height: 10px;
        border-radius: 999px;
        background: var(--range-fill);
      }

      :where(.mikonus-renderer-ui) .device-details-range::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border: 3px solid #fff;
        border-radius: 50%;
        background: var(--range-fill);
        box-shadow: 0 1px 5px rgba(15, 20, 24, 0.38);
      }

      :where(.mikonus-renderer-ui) .device-details-range:focus-visible {
        outline: 2px solid var(--range-fill);
        outline-offset: 1px;
      }

      :where(.mikonus-renderer-ui) .device-details-brightness-range {
        --range-fill: #f2c94c;
      }

      :where(.mikonus-renderer-ui) .device-details-temperature-range {
        --range-fill: #e8a64b;
      }

      :where(.mikonus-renderer-ui) .device-details-color-wheel {
        position: relative;
        width: min(100%, 250px);
        aspect-ratio: 1;
        justify-self: center;
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(127, 127, 127, 0.22);
        border-radius: 50%;
        background:
          radial-gradient(circle, #fff 0%, rgba(255, 255, 255, 0.94) 4%, rgba(255, 255, 255, 0) 70%),
          conic-gradient(
            from 90deg,
            #f33 0deg,
            #ffed33 60deg,
            #39df55 120deg,
            #27d9df 180deg,
            #2d6dff 240deg,
            #d842ef 300deg,
            #f33 360deg
          );
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        cursor: crosshair;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .device-details-color-wheel-marker {
        position: absolute;
        width: 26px;
        height: 26px;
        transform: translate(-50%, -50%);
        border: 4px solid #fff;
        border-radius: 50%;
        box-shadow: 0 1px 7px rgba(15, 20, 24, 0.5);
        pointer-events: none;
      }

      :where(.mikonus-renderer-ui) .device-details-color-wheel:focus-visible {
        outline: 3px solid var(--dashboard-accent, #2d845c);
        outline-offset: 3px;
      }

      :where(.mikonus-renderer-ui) .device-details-color-presets-label {
        margin-top: 3px;
        color: var(--dashboard-ui-text-secondary);
        font-size: 12px;
        font-weight: 650;
      }

      :where(.mikonus-renderer-ui) .device-details-color-presets {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 7px;
      }

      :where(.mikonus-renderer-ui) .device-details-color-preset {
        width: 100%;
        max-width: 38px;
        aspect-ratio: 1;
        justify-self: center;
        padding: 0;
        border: 2px solid rgba(255, 255, 255, 0.76);
        border-radius: 50%;
        background: var(--preset-color);
        box-shadow: 0 0 0 1px rgba(38, 49, 60, 0.22);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .device-details-color-preset.is-selected {
        box-shadow:
          0 0 0 2px var(--dashboard-control-background),
          0 0 0 4px var(--dashboard-accent, #2d845c);
      }

      :where(.mikonus-renderer-ui) .device-details-color-preset:focus-visible {
        outline: 2px solid var(--dashboard-accent, #2d845c);
        outline-offset: 3px;
      }

      :where(.mikonus-renderer-ui) .device-details-climate-section {
        gap: 11px;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial {
        --thermostat-accent: #e8a64b;
        position: relative;
        width: min(100%, 300px);
        aspect-ratio: 300 / 210;
        justify-self: center;
        border-radius: 48% 48% 30% 30%;
        outline: none;
        cursor: grab;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial.is-adjusting {
        cursor: grabbing;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial[aria-disabled="true"] {
        cursor: default;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial:focus-visible {
        outline: 3px solid var(--thermostat-accent);
        outline-offset: 2px;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-scale {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-tick {
        stroke: rgba(127, 127, 127, 0.34);
        stroke-linecap: round;
        stroke-width: 2.5;
        transition: stroke 120ms ease, stroke-width 120ms ease;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-tick.is-major {
        stroke-width: 3.5;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-tick.is-active {
        stroke: var(--thermostat-accent);
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-thumb {
        fill: var(--thermostat-accent);
        stroke: #fff;
        stroke-width: 4;
        filter: drop-shadow(0 2px 4px rgba(15, 20, 24, 0.42));
        transition: cx 100ms ease, cy 100ms ease, r 100ms ease;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial.is-adjusting .device-details-thermostat-thumb {
        r: 10px;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-dial.is-pending .device-details-thermostat-thumb {
        animation: thermostat-pending-pulse 700ms ease-in-out infinite alternate;
      }

      @keyframes thermostat-pending-pulse {
        from { opacity: 0.68; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        :where(.mikonus-renderer-ui) .device-details-thermostat-tick,
        :where(.mikonus-renderer-ui) .device-details-thermostat-thumb {
          transition: none;
        }

        :where(.mikonus-renderer-ui) .device-details-thermostat-dial.is-pending .device-details-thermostat-thumb {
          animation: none;
        }
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-readout {
        position: absolute;
        top: 48%;
        left: 50%;
        display: grid;
        width: 68%;
        justify-items: center;
        gap: 3px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        text-align: center;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-target-label {
        color: var(--dashboard-ui-text-secondary);
        font-size: 11px;
        font-weight: 680;
        letter-spacing: 0.045em;
        text-transform: uppercase;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-target-value {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        color: var(--dashboard-ui-text-primary);
        font-variant-numeric: tabular-nums;
        line-height: 0.95;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-target-number {
        font-size: clamp(36px, 13vw, 54px);
        font-weight: 720;
        letter-spacing: -0.045em;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-target-unit {
        margin: 3px 0 0 5px;
        color: var(--dashboard-ui-text-secondary);
        font-size: 18px;
        font-weight: 650;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-current {
        margin-top: 5px;
        color: var(--dashboard-ui-text-secondary);
        font-size: 12px;
        font-weight: 620;
        font-variant-numeric: tabular-nums;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-controls {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1px;
        width: min(58%, 174px);
        justify-self: center;
        overflow: hidden;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 999px;
        background: var(--dashboard-control-border);
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-step {
        display: grid;
        min-height: 46px;
        place-items: center;
        padding: 0;
        border: 0;
        background: var(--dashboard-control-background);
        color: var(--dashboard-ui-text-primary);
        font: inherit;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-step-symbol {
        font-size: 24px;
        font-weight: 560;
        line-height: 1;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-step-label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-step:focus-visible {
        position: relative;
        z-index: 1;
        outline: 3px solid var(--thermostat-accent, #e8a64b);
        outline-offset: -3px;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-feedback {
        display: grid;
        min-height: 18px;
        justify-items: center;
        color: var(--dashboard-ui-text-secondary);
        font-size: 11px;
        text-align: center;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-pending {
        color: #c98425;
        font-weight: 680;
      }

      :where(.mikonus-renderer-ui) .device-details-thermostat-pending[hidden] {
        display: none;
      }

      :where(.mikonus-renderer-ui) .device-details-actions,
      :where(.mikonus-renderer-ui) .device-details-stepper {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      :where(.mikonus-renderer-ui) .device-details-actions {
        flex-wrap: wrap;
      }

      :where(.mikonus-renderer-ui) .device-details-stepper {
        justify-content: flex-end;
      }

      :where(.mikonus-renderer-ui) .device-details-action {
        display: inline-flex;
        min-width: 44px;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 11px;
        border: 1px solid var(--dashboard-control-border);
        border-radius: 12px;
        background: rgba(127, 127, 127, 0.08);
        color: inherit;
        font: inherit;
        font-size: 12px;
        font-weight: 650;
        touch-action: manipulation;
      }

      :where(.mikonus-renderer-ui) .device-details-action-symbol {
        font-size: 17px;
      }

      :where(.mikonus-renderer-ui) .device-details-stepper .device-details-action-label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }

      :where(.mikonus-renderer-ui) .device-details-stepper-value {
        min-width: 74px;
        text-align: center;
      }

      :where(.mikonus-renderer-ui) .device-details-action:disabled,
      :where(.mikonus-renderer-ui) .device-details-toggle:disabled,
      :where(.mikonus-renderer-ui) .device-details-choice:disabled,
      :where(.mikonus-renderer-ui) .device-details-thermostat-step:disabled,
      :where(.mikonus-renderer-ui) .device-details-range:disabled,
      :where(.mikonus-renderer-ui) .device-details-color-wheel:disabled,
      :where(.mikonus-renderer-ui) .device-details-color-preset:disabled {
        opacity: 0.42;
      }

      :where(.mikonus-renderer-ui) .device-details-unavailable,
      :where(.mikonus-renderer-ui) .device-details-empty {
        margin: 0;
        padding: 11px 13px;
        border-radius: 12px;
        background: rgba(190, 58, 48, 0.12);
        color: var(--dashboard-ui-text-secondary);
        font-size: 13px;
        line-height: 1.35;
      }


      :where(.mikonus-renderer-ui)[data-dashboard-layout-size="compact"] .floor-selector-segments {
        gap: 1px;
        padding: 1px;
      }

      :where(.mikonus-renderer-ui)[data-dashboard-layout-size="compact"] .floor-selector-segment {
        padding-right: 10px;
        padding-left: 10px;
      }

      :where(.mikonus-renderer-ui)[data-dashboard-layout-orientation="landscape"] .floor-selector {
        grid-column: 1;
        grid-row: 1;
      }

      :where(.mikonus-renderer-ui)[data-dashboard-layout-orientation="landscape"] .device-details-layer {
        align-items: center;
        justify-content: flex-end;
        padding: 14px;
      }

:where(.mikonus-renderer-ui) .device-details-panel { display: flex; flex-direction: column; }
:where(.mikonus-renderer-ui) .device-details-body { min-height: 0; overflow-y: auto; touch-action: pan-y; }
:where(.mikonus-renderer-ui) .quick-controls-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
:where(.mikonus-renderer-ui) .quick-control-chip {
  position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center;
  min-width: 44px; min-height: 44px; padding: 0 6px; border-radius: 22px;
  border: 1px solid var(--dashboard-control-border); background: var(--dashboard-control-background);
  color: var(--dashboard-ui-text-primary); box-shadow: 0 3px 10px var(--dashboard-control-shadow);
  pointer-events: auto; touch-action: manipulation; font: inherit;
}
:where(.mikonus-renderer-ui) .quick-control-action { min-width: 44px; min-height: 44px; border: 0; background: transparent; color: inherit; font: inherit; touch-action: manipulation; }
:where(.mikonus-renderer-ui) .quick-control-chip.is-on { color: var(--dashboard-accent, #2d845c); }
:where(.mikonus-renderer-ui) .quick-control-chip:disabled,
:where(.mikonus-renderer-ui) .quick-control-action:disabled { opacity: .45; }
:where(.mikonus-renderer-ui) .quick-control-chip:focus-visible,
:where(.mikonus-renderer-ui) .quick-control-action:focus-visible { outline: 2px solid var(--dashboard-accent, #2d845c); outline-offset: 2px; }
\`,kl=new WeakMap;function zl(n=document){let e=kl.get(n);if(!e){let s=(n.ownerDocument??n).createElement("style");s.dataset.mikonusRendererStyles="",s.textContent=wd,(n.head??n).appendChild(s),e={element:s,users:0},kl.set(n,e)}e.users+=1;let t=!1;return()=>{t||(t=!0,--e.users===0&&(e.element.remove(),kl.delete(n)))}}function Hl({container:n,sceneShell:e=n}){let t=e.getRootNode(),s=[zl(t)],r=e.ownerDocument,a=r.defaultView;for(let u of new Set([e,n])){let h=u.classList.contains("mikonus-renderer-ui");h||u.classList.add("mikonus-renderer-ui");let f=u.style.position;a.getComputedStyle(u).position==="static"&&(u.style.position="relative");let d=u.style.isolation;u.style.isolation="isolate",s.push(()=>{h||u.classList.remove("mikonus-renderer-ui"),u.style.position=f,u.style.isolation=d})}let o=r.createElement("div");o.className="mikonus-marker-host",n.appendChild(o);let c=r.createElement("div");c.className="mikonus-popup-host",e.appendChild(c);let l=!1;return{markerHost:o,popupHost:c,setEnvironment(u){for(let h of new Set([e,n]))h.dataset.dashboardTheme=u.resolvedTheme},dispose(){if(!l){l=!0,o.remove(),c.remove();for(let u of s.reverse())u()}}}}var qi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Yi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},tf=0,Cu=1,nf=2;var Es=1,sf=2,dr=3,Un=0,fn=1,nn=2,ri=0,gs=1,Ru=2,Iu=3,Pu=4,rf=5;var Hi=100,af=101,of=102,cf=103,lf=104,uf=200,hf=201,df=202,ff=203,Co=204,Ro=205,pf=206,mf=207,gf=208,xf=209,vf=210,_f=211,yf=212,bf=213,Mf=214,Io=0,Po=1,Do=2,xs=3,Lo=4,Oo=5,No=6,Fo=7,Du=0,Sf=1,Ef=2,Rn=0,Lu=1,Ou=2,Nu=3,fr=4,Fu=5,Uu=6,Bu=7;var ku=300,$i=301,ws=302,hc=303,dc=304,_a=306,vs=1e3,ni=1001,Uo=1002,Jt=1003,wf=1004;var ya=1005;var Gt=1006,fc=1007;var ai=1008;var on=1009,zu=1010,Hu=1011,pr=1012,pc=1013,qn=1014,Yn=1015,oi=1016,mc=1017,gc=1018,mr=1020,Vu=35902,Gu=35899,Wu=1021,Xu=1022,gn=1023,si=1026,ji=1027,qu=1028,xc=1029,Zi=1030,vc=1031;var _c=1033,ba=33776,Ma=33777,Sa=33778,Ea=33779,yc=35840,bc=35841,Mc=35842,Sc=35843,Ec=36196,wc=37492,Tc=37496,Ac=37488,Cc=37489,wa=37490,Rc=37491,Ic=37808,Pc=37809,Dc=37810,Lc=37811,Oc=37812,Nc=37813,Fc=37814,Uc=37815,Bc=37816,kc=37817,zc=37818,Hc=37819,Vc=37820,Gc=37821,Wc=36492,Xc=36494,qc=36495,Yc=36283,$c=36284,Ta=36285,jc=36286;var Yr=2300,Bo=2301,Ao=2302,fu=2303,pu=2400,mu=2401,gu=2402;var Tf=3200;var Zc=0,Af=1,Si="",Kt="srgb",$r="srgb-linear",jr="linear",gt="srgb";var ps=7680;var xu=519,Cf=512,Rf=513,If=514,Kc=515,Pf=516,Df=517,Jc=518,Lf=519,vu=35044;var Yu="300 es",Gn=2e3,Js=2001;function Rg(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Ig(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Zr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Of(){let n=Zr("canvas");return n.style.display="block",n}var Td={},Qs=null;function $u(...n){let e="THREE."+n.shift();Qs?Qs("log",e,...n):console.log(e,...n)}function Nf(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function He(...n){n=Nf(n);let e="THREE."+n.shift();if(Qs)Qs("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ge(...n){n=Nf(n);let e="THREE."+n.shift();if(Qs)Qs("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function ms(...n){let e=n.join(" ");e in Td||(Td[e]=!0,He(...n))}function Ff(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Uf={[Io]:Po,[Do]:No,[Lo]:Fo,[xs]:Oo,[Po]:Io,[No]:Do,[Fo]:Lo,[Oo]:xs},Wn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ad=1234567,Gr=Math.PI/180,_s=180/Math.PI;function Ts(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(rn[n&255]+rn[n>>8&255]+rn[n>>16&255]+rn[n>>24&255]+"-"+rn[e&255]+rn[e>>8&255]+"-"+rn[e>>16&15|64]+rn[e>>24&255]+"-"+rn[t&63|128]+rn[t>>8&255]+"-"+rn[t>>16&255]+rn[t>>24&255]+rn[i&255]+rn[i>>8&255]+rn[i>>16&255]+rn[i>>24&255]).toLowerCase()}function nt(n,e,t){return Math.max(e,Math.min(t,n))}function ju(n,e){return(n%e+e)%e}function Pg(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Dg(n,e,t){return n!==e?(t-n)/(e-n):0}function Wr(n,e,t){return(1-t)*n+t*e}function Lg(n,e,t,i){return Wr(n,e,1-Math.exp(-t*i))}function Og(n,e=1){return e-Math.abs(ju(n,e*2)-e)}function Ng(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Fg(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Ug(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Bg(n,e){return n+Math.random()*(e-n)}function kg(n){return n*(.5-Math.random())}function zg(n){n!==void 0&&(Ad=n);let e=Ad+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Hg(n){return n*Gr}function Vg(n){return n*_s}function Gg(n){return(n&n-1)===0&&n!==0}function Wg(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Xg(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function qg(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+i)/2),u=a((e+i)/2),h=r((e-i)/2),f=a((e-i)/2),d=r((i-e)/2),p=a((i-e)/2);switch(s){case"XYX":n.set(o*u,c*h,c*f,o*l);break;case"YZY":n.set(c*f,o*u,c*h,o*l);break;case"ZXZ":n.set(c*h,c*f,o*u,o*l);break;case"XZX":n.set(o*u,c*p,c*d,o*l);break;case"YXY":n.set(c*d,o*u,c*p,o*l);break;case"ZYZ":n.set(c*p,c*d,o*u,o*l);break;default:He("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Zs(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function un(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ut={DEG2RAD:Gr,RAD2DEG:_s,generateUUID:Ts,clamp:nt,euclideanModulo:ju,mapLinear:Pg,inverseLerp:Dg,lerp:Wr,damp:Lg,pingpong:Og,smoothstep:Ng,smootherstep:Fg,randInt:Ug,randFloat:Bg,randFloatSpread:kg,seededRandom:zg,degToRad:Hg,radToDeg:Vg,isPowerOfTwo:Gg,ceilPowerOfTwo:Wg,floorPowerOfTwo:Xg,setQuaternionFromProperEuler:qg,normalize:un,denormalize:Zs},ce=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Mn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3],f=r[a+0],d=r[a+1],p=r[a+2],x=r[a+3];if(h!==x||c!==f||l!==d||u!==p){let m=c*f+l*d+u*p+h*x;m<0&&(f=-f,d=-d,p=-p,x=-x,m=-m);let g=1-o;if(m<.9995){let w=Math.acos(m),E=Math.sin(w);g=Math.sin(g*w)/E,o=Math.sin(o*w)/E,c=c*g+f*o,l=l*g+d*o,u=u*g+p*o,h=h*g+x*o}else{c=c*g+f*o,l=l*g+d*o,u=u*g+p*o,h=h*g+x*o;let w=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=w,l*=w,u*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[a],f=r[a+1],d=r[a+2],p=r[a+3];return e[t]=o*p+u*h+c*d-l*f,e[t+1]=c*p+u*f+l*h-o*d,e[t+2]=l*p+u*d+o*f-c*h,e[t+3]=u*p-o*h-c*f-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),u=o(s/2),h=o(r/2),f=c(i/2),d=c(s/2),p=c(r/2);switch(a){case"XYZ":this._x=f*u*h+l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h-f*d*p;break;case"YXZ":this._x=f*u*h+l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h+f*d*p;break;case"ZXY":this._x=f*u*h-l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h-f*d*p;break;case"ZYX":this._x=f*u*h-l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h+f*d*p;break;case"YZX":this._x=f*u*h+l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h-f*d*p;break;case"XZY":this._x=f*u*h-l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h+f*d*p;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],h=t[10],f=i+o+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-c)*d,this._y=(r-l)*d,this._z=(a-s)*d}else if(i>o&&i>h){let d=2*Math.sqrt(1+i-o-h);this._w=(u-c)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+l)/d}else if(o>h){let d=2*Math.sqrt(1+o-i-h);this._w=(r-l)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(c+u)/d}else{let d=2*Math.sqrt(1+h-i-o);this._w=(a-s)/d,this._x=(r+l)/d,this._y=(c+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-i*l,this._z=r*u+a*l+i*c-s*o,this._w=a*u-i*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Cd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Cd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*i),u=2*(o*t-r*s),h=2*(r*i-a*t);return this.x=t+c*l+a*h-o*u,this.y=i+c*u+o*l-r*h,this.z=s+c*h+r*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-i*c,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Vl.copy(this).projectOnVector(e),this.sub(Vl)}reflect(e){return this.sub(Vl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Vl=new D,Cd=new Mn,Ze=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l)}set(e,t,i,s,r,a,o,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],u=i[4],h=i[7],f=i[2],d=i[5],p=i[8],x=s[0],m=s[3],g=s[6],w=s[1],E=s[4],y=s[7],T=s[2],b=s[5],C=s[8];return r[0]=a*x+o*w+c*T,r[3]=a*m+o*E+c*b,r[6]=a*g+o*y+c*C,r[1]=l*x+u*w+h*T,r[4]=l*m+u*E+h*b,r[7]=l*g+u*y+h*C,r[2]=f*x+d*w+p*T,r[5]=f*m+d*E+p*b,r[8]=f*g+d*y+p*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-i*r*u+i*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=u*a-o*l,f=o*c-u*r,d=l*r-a*c,p=t*h+i*f+s*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=h*x,e[1]=(s*l-u*i)*x,e[2]=(o*i-s*a)*x,e[3]=f*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-o*t)*x,e[6]=d*x,e[7]=(i*c-l*t)*x,e[8]=(a*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return ms("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Gl.makeScale(e,t)),this}rotate(e){return ms("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Gl.makeRotation(-e)),this}translate(e,t){return ms("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Gl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Gl=new Ze,Rd=new Ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Id=new Ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Yg(){let n={enabled:!0,workingColorSpace:$r,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===gt&&(s.r=xi(s.r),s.g=xi(s.g),s.b=xi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===gt&&(s.r=Ks(s.r),s.g=Ks(s.g),s.b=Ks(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Si?jr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ms("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ms("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[$r]:{primaries:e,whitePoint:i,transfer:jr,toXYZ:Rd,fromXYZ:Id,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Kt},outputColorSpaceConfig:{drawingBufferColorSpace:Kt}},[Kt]:{primaries:e,whitePoint:i,transfer:gt,toXYZ:Rd,fromXYZ:Id,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Kt}}}),n}var lt=Yg();function xi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ks(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Bs,ko=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Bs===void 0&&(Bs=Zr("canvas")),Bs.width=e.width,Bs.height=e.height;let s=Bs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Bs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Zr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=xi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(xi(t[i]/255)*255):t[i]=xi(t[i]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},$g=0,er=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:$g++}),this.uuid=Ts(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Wl(s[a].image)):r.push(Wl(s[a]))}else r=Wl(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Wl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?ko.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}var jg=0,Xl=new D,mn=class n extends Wn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=ni,s=ni,r=Gt,a=ai,o=gn,c=on,l=n.DEFAULT_ANISOTROPY,u=Si){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:jg++}),this.uuid=Ts(),this.name="",this.source=new er(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Xl).x}get height(){return this.source.getSize(Xl).y}get depth(){return this.source.getSize(Xl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){He(\`Texture.setValues(): parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){He(\`Texture.setValues(): property '\${t}' does not exist.\`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ku)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case vs:e.x=e.x-Math.floor(e.x);break;case ni:e.x=e.x<0?0:1;break;case Uo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case vs:e.y=e.y-Math.floor(e.y);break;case ni:e.y=e.y<0?0:1;break;case Uo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};mn.DEFAULT_IMAGE=null;mn.DEFAULT_MAPPING=ku;mn.DEFAULT_ANISOTROPY=1;var Pt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],f=c[1],d=c[5],p=c[9],x=c[2],m=c[6],g=c[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(p+m)<.1&&Math.abs(l+d+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,y=(d+1)/2,T=(g+1)/2,b=(u+f)/4,C=(h+x)/4,v=(p+m)/4;return E>y&&E>T?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=b/i,r=C/i):y>T?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=b/s,r=v/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=C/r,s=v/r),this.set(i,s,r,t),this}let w=Math.sqrt((m-p)*(m-p)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(w)<.001&&(w=1),this.x=(m-p)/w,this.y=(h-x)/w,this.z=(f-u)/w,this.w=Math.acos((l+d+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},zo=class extends Wn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Pt(0,0,e,t),this.scissorTest=!1,this.viewport=new Pt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new mn(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Gt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new er(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Sn=class extends zo{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Kr=class extends mn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ho=class extends mn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var It=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m)}set(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=l,g[6]=u,g[10]=h,g[14]=f,g[3]=d,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/ks.setFromMatrixColumn(e,0).length(),r=1/ks.setFromMatrixColumn(e,1).length(),a=1/ks.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=a*u,d=a*h,p=o*u,x=o*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=d+p*l,t[5]=f-x*l,t[9]=-o*c,t[2]=x-f*l,t[6]=p+d*l,t[10]=a*c}else if(e.order==="YXZ"){let f=c*u,d=c*h,p=l*u,x=l*h;t[0]=f+x*o,t[4]=p*o-d,t[8]=a*l,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=d*o-p,t[6]=x+f*o,t[10]=a*c}else if(e.order==="ZXY"){let f=c*u,d=c*h,p=l*u,x=l*h;t[0]=f-x*o,t[4]=-a*h,t[8]=p+d*o,t[1]=d+p*o,t[5]=a*u,t[9]=x-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let f=a*u,d=a*h,p=o*u,x=o*h;t[0]=c*u,t[4]=p*l-d,t[8]=f*l+x,t[1]=c*h,t[5]=x*l+f,t[9]=d*l-p,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let f=a*c,d=a*l,p=o*c,x=o*l;t[0]=c*u,t[4]=x-f*h,t[8]=p*h+d,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=d*h+p,t[10]=f-x*h}else if(e.order==="XZY"){let f=a*c,d=a*l,p=o*c,x=o*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=f*h+x,t[5]=a*u,t[9]=d*h-p,t[2]=p*h-d,t[6]=o*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Zg,e,Kg)}lookAt(e,t,i){let s=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Oi.crossVectors(i,yn),Oi.lengthSq()===0&&(Math.abs(i.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Oi.crossVectors(i,yn)),Oi.normalize(),so.crossVectors(yn,Oi),s[0]=Oi.x,s[4]=so.x,s[8]=yn.x,s[1]=Oi.y,s[5]=so.y,s[9]=yn.y,s[2]=Oi.z,s[6]=so.z,s[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],u=i[1],h=i[5],f=i[9],d=i[13],p=i[2],x=i[6],m=i[10],g=i[14],w=i[3],E=i[7],y=i[11],T=i[15],b=s[0],C=s[4],v=s[8],S=s[12],P=s[1],I=s[5],O=s[9],U=s[13],q=s[2],R=s[6],H=s[10],z=s[14],k=s[3],$=s[7],se=s[11],ae=s[15];return r[0]=a*b+o*P+c*q+l*k,r[4]=a*C+o*I+c*R+l*$,r[8]=a*v+o*O+c*H+l*se,r[12]=a*S+o*U+c*z+l*ae,r[1]=u*b+h*P+f*q+d*k,r[5]=u*C+h*I+f*R+d*$,r[9]=u*v+h*O+f*H+d*se,r[13]=u*S+h*U+f*z+d*ae,r[2]=p*b+x*P+m*q+g*k,r[6]=p*C+x*I+m*R+g*$,r[10]=p*v+x*O+m*H+g*se,r[14]=p*S+x*U+m*z+g*ae,r[3]=w*b+E*P+y*q+T*k,r[7]=w*C+E*I+y*R+T*$,r[11]=w*v+E*O+y*H+T*se,r[15]=w*S+E*U+y*z+T*ae,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],h=e[6],f=e[10],d=e[14],p=e[3],x=e[7],m=e[11],g=e[15],w=c*d-l*f,E=o*d-l*h,y=o*f-c*h,T=a*d-l*u,b=a*f-c*u,C=a*h-o*u;return t*(x*w-m*E+g*y)-i*(p*w-m*T+g*b)+s*(p*E-x*T+g*C)-r*(p*y-x*b+m*C)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],u=e[10];return t*(a*u-o*l)-i*(r*u-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=e[9],f=e[10],d=e[11],p=e[12],x=e[13],m=e[14],g=e[15],w=t*o-i*a,E=t*c-s*a,y=t*l-r*a,T=i*c-s*o,b=i*l-r*o,C=s*l-r*c,v=u*x-h*p,S=u*m-f*p,P=u*g-d*p,I=h*m-f*x,O=h*g-d*x,U=f*g-d*m,q=w*U-E*O+y*I+T*P-b*S+C*v;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/q;return e[0]=(o*U-c*O+l*I)*R,e[1]=(s*O-i*U-r*I)*R,e[2]=(x*C-m*b+g*T)*R,e[3]=(f*b-h*C-d*T)*R,e[4]=(c*P-a*U-l*S)*R,e[5]=(t*U-s*P+r*S)*R,e[6]=(m*y-p*C-g*E)*R,e[7]=(u*C-f*y+d*E)*R,e[8]=(a*O-o*P+l*v)*R,e[9]=(i*P-t*O-r*v)*R,e[10]=(p*b-x*y+g*w)*R,e[11]=(h*y-u*b-d*w)*R,e[12]=(o*S-a*I-c*v)*R,e[13]=(t*I-i*S+s*v)*R,e[14]=(x*E-p*T-m*w)*R,e[15]=(u*T-h*E+f*w)*R,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,c=e.z,l=r*a,u=r*o;return this.set(l*a+i,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+i,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,u=a+a,h=o+o,f=r*l,d=r*u,p=r*h,x=a*u,m=a*h,g=o*h,w=c*l,E=c*u,y=c*h,T=i.x,b=i.y,C=i.z;return s[0]=(1-(x+g))*T,s[1]=(d+y)*T,s[2]=(p-E)*T,s[3]=0,s[4]=(d-y)*b,s[5]=(1-(f+g))*b,s[6]=(m+w)*b,s[7]=0,s[8]=(p+E)*C,s[9]=(m-w)*C,s[10]=(1-(f+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=ks.set(s[0],s[1],s[2]).length(),o=ks.set(s[4],s[5],s[6]).length(),c=ks.set(s[8],s[9],s[10]).length();r<0&&(a=-a),zn.copy(this);let l=1/a,u=1/o,h=1/c;return zn.elements[0]*=l,zn.elements[1]*=l,zn.elements[2]*=l,zn.elements[4]*=u,zn.elements[5]*=u,zn.elements[6]*=u,zn.elements[8]*=h,zn.elements[9]*=h,zn.elements[10]*=h,t.setFromRotationMatrix(zn),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,s,r,a,o=Gn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(i-s),f=(t+e)/(t-e),d=(i+s)/(i-s),p,x;if(c)p=r/(a-r),x=a*r/(a-r);else if(o===Gn)p=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Js)p=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=Gn,c=!1){let l=this.elements,u=2/(t-e),h=2/(i-s),f=-(t+e)/(t-e),d=-(i+s)/(i-s),p,x;if(c)p=1/(a-r),x=a/(a-r);else if(o===Gn)p=-2/(a-r),x=-(a+r)/(a-r);else if(o===Js)p=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=h,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},ks=new D,zn=new It,Zg=new D(0,0,0),Kg=new D(1,1,1),Oi=new D,so=new D,yn=new D,Pd=new It,Dd=new Mn,vi=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(nt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Pd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Pd,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Dd.setFromEuler(this),this.setFromQuaternion(Dd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vi.DEFAULT_ORDER="XYZ";var tr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Jg=0,Ld=new D,zs=new Mn,di=new It,ro=new D,Br=new D,Qg=new D,ex=new Mn,Od=new D(1,0,0),Nd=new D(0,1,0),Fd=new D(0,0,1),Ud={type:"added"},tx={type:"removed"},Hs={type:"childadded",child:null},ql={type:"childremoved",child:null},zt=class n extends Wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jg++}),this.uuid=Ts(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new D,t=new vi,i=new Mn,s=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new It},normalMatrix:{value:new Ze}}),this.matrix=new It,this.matrixWorld=new It,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new tr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return zs.setFromAxisAngle(e,t),this.quaternion.multiply(zs),this}rotateOnWorldAxis(e,t){return zs.setFromAxisAngle(e,t),this.quaternion.premultiply(zs),this}rotateX(e){return this.rotateOnAxis(Od,e)}rotateY(e){return this.rotateOnAxis(Nd,e)}rotateZ(e){return this.rotateOnAxis(Fd,e)}translateOnAxis(e,t){return Ld.copy(e).applyQuaternion(this.quaternion),this.position.add(Ld.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Od,e)}translateY(e){return this.translateOnAxis(Nd,e)}translateZ(e){return this.translateOnAxis(Fd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ro.copy(e):ro.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Br.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(Br,ro,this.up):di.lookAt(ro,Br,this.up),this.quaternion.setFromRotationMatrix(di),s&&(di.extractRotation(s.matrixWorld),zs.setFromRotationMatrix(di),this.quaternion.premultiply(zs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ge("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ud),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null):Ge("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(tx),ql.child=e,this.dispatchEvent(ql),ql.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ud),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,e,Qg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,ex,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),d=a(e.animations),p=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),p.length>0&&(i.nodes=p)}return i.object=s,i;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};zt.DEFAULT_UP=new D(0,1,0);zt.DEFAULT_MATRIX_AUTO_UPDATE=!0;zt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _t=class extends zt{constructor(){super(),this.isGroup=!0,this.type="Group"}},nx={type:"move"},nr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _t,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _t,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _t,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),g=this._getHandJoint(l,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,p=.005;l.inputState.pinching&&f>d+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=d-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(nx)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new _t;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Bf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ni={h:0,s:0,l:0},ao={h:0,s:0,l:0};function Yl(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var je=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,lt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=lt.workingColorSpace){return this.r=e,this.g=t,this.b=i,lt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=lt.workingColorSpace){if(e=ju(e,1),t=nt(t,0,1),i=nt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=Yl(a,r,e+1/3),this.g=Yl(a,r,e),this.b=Yl(a,r,e-1/3)}return lt.colorSpaceToWorking(this,s),this}setStyle(e,t=Kt){function i(r){r!==void 0&&parseFloat(r)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\\w+)\\(([^\\)]*)\\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\\s*(\\d*\\.?\\d+)\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(s=/^\\#([A-Fa-f\\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){let i=Bf[e.toLowerCase()];return i!==void 0?this.setHex(i,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=Ks(e.r),this.g=Ks(e.g),this.b=Ks(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return lt.workingToColorSpace(an.copy(this),e),Math.round(nt(an.r*255,0,255))*65536+Math.round(nt(an.g*255,0,255))*256+Math.round(nt(an.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=lt.workingColorSpace){lt.workingToColorSpace(an.copy(this),t);let i=an.r,s=an.g,r=an.b,a=Math.max(i,s,r),o=Math.min(i,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let h=a-o;switch(l=u<=.5?h/(a+o):h/(2-a-o),a){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=lt.workingColorSpace){return lt.workingToColorSpace(an.copy(this),t),e.r=an.r,e.g=an.g,e.b=an.b,e}getStyle(e=Kt){lt.workingToColorSpace(an.copy(this),e);let t=an.r,i=an.g,s=an.b;return e!==Kt?\`color(\${e} \${t.toFixed(3)} \${i.toFixed(3)} \${s.toFixed(3)})\`:\`rgb(\${Math.round(t*255)},\${Math.round(i*255)},\${Math.round(s*255)})\`}offsetHSL(e,t,i){return this.getHSL(Ni),this.setHSL(Ni.h+e,Ni.s+t,Ni.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ni),e.getHSL(ao);let i=Wr(Ni.h,ao.h,t),s=Wr(Ni.s,ao.s,t),r=Wr(Ni.l,ao.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},an=new je;je.NAMES=Bf;var Jr=class extends zt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vi,this.environmentIntensity=1,this.environmentRotation=new vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Hn=new D,fi=new D,$l=new D,pi=new D,Vs=new D,Gs=new D,Bd=new D,jl=new D,Zl=new D,Kl=new D,Jl=new Pt,Ql=new Pt,eu=new Pt,zi=class n{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Hn.subVectors(e,t),s.cross(Hn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Hn.subVectors(s,t),fi.subVectors(i,t),$l.subVectors(e,t);let a=Hn.dot(Hn),o=Hn.dot(fi),c=Hn.dot($l),l=fi.dot(fi),u=fi.dot($l),h=a*l-o*o;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(l*c-o*u)*f,p=(a*u-o*c)*f;return r.set(1-d-p,p,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,i,s,r,a,o,c){return this.getBarycoord(e,t,i,s,pi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,pi.x),c.addScaledVector(a,pi.y),c.addScaledVector(o,pi.z),c)}static getInterpolatedAttribute(e,t,i,s,r,a){return Jl.setScalar(0),Ql.setScalar(0),eu.setScalar(0),Jl.fromBufferAttribute(e,t),Ql.fromBufferAttribute(e,i),eu.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Jl,r.x),a.addScaledVector(Ql,r.y),a.addScaledVector(eu,r.z),a}static isFrontFacing(e,t,i,s){return Hn.subVectors(i,t),fi.subVectors(e,t),Hn.cross(fi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Hn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Hn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;Vs.subVectors(s,i),Gs.subVectors(r,i),jl.subVectors(e,i);let c=Vs.dot(jl),l=Gs.dot(jl);if(c<=0&&l<=0)return t.copy(i);Zl.subVectors(e,s);let u=Vs.dot(Zl),h=Gs.dot(Zl);if(u>=0&&h<=u)return t.copy(s);let f=c*h-u*l;if(f<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(i).addScaledVector(Vs,a);Kl.subVectors(e,r);let d=Vs.dot(Kl),p=Gs.dot(Kl);if(p>=0&&d<=p)return t.copy(r);let x=d*l-c*p;if(x<=0&&l>=0&&p<=0)return o=l/(l-p),t.copy(i).addScaledVector(Gs,o);let m=u*p-d*h;if(m<=0&&h-u>=0&&d-p>=0)return Bd.subVectors(r,s),o=(h-u)/(h-u+(d-p)),t.copy(s).addScaledVector(Bd,o);let g=1/(m+x+f);return a=x*g,o=f*g,t.copy(i).addScaledVector(Vs,a).addScaledVector(Gs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dn=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Vn):Vn.fromBufferAttribute(r,a),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),oo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),oo.copy(i.boundingBox)),oo.applyMatrix4(e.matrixWorld),this.union(oo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(kr),co.subVectors(this.max,kr),Ws.subVectors(e.a,kr),Xs.subVectors(e.b,kr),qs.subVectors(e.c,kr),Fi.subVectors(Xs,Ws),Ui.subVectors(qs,Xs),us.subVectors(Ws,qs);let t=[0,-Fi.z,Fi.y,0,-Ui.z,Ui.y,0,-us.z,us.y,Fi.z,0,-Fi.x,Ui.z,0,-Ui.x,us.z,0,-us.x,-Fi.y,Fi.x,0,-Ui.y,Ui.x,0,-us.y,us.x,0];return!tu(t,Ws,Xs,qs,co)||(t=[1,0,0,0,1,0,0,0,1],!tu(t,Ws,Xs,qs,co))?!1:(lo.crossVectors(Fi,Ui),t=[lo.x,lo.y,lo.z],tu(t,Ws,Xs,qs,co))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},mi=[new D,new D,new D,new D,new D,new D,new D,new D],Vn=new D,oo=new dn,Ws=new D,Xs=new D,qs=new D,Fi=new D,Ui=new D,us=new D,kr=new D,co=new D,lo=new D,hs=new D;function tu(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){hs.fromArray(n,r);let o=s.x*Math.abs(hs.x)+s.y*Math.abs(hs.y)+s.z*Math.abs(hs.z),c=e.dot(hs),l=t.dot(hs),u=i.dot(hs);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var kt=new D,uo=new ce,ix=0,hn=class extends Wn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ix++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=vu,this.updateRanges=[],this.gpuType=Yn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)uo.fromBufferAttribute(this,t),uo.applyMatrix3(e),this.setXY(t,uo.x,uo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Zs(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=un(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zs(t,this.array)),t}setX(e,t){return this.normalized&&(t=un(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zs(t,this.array)),t}setY(e,t){return this.normalized&&(t=un(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=un(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zs(t,this.array)),t}setW(e,t){return this.normalized&&(t=un(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=un(t,this.array),i=un(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=un(t,this.array),i=un(i,this.array),s=un(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=un(t,this.array),i=un(i,this.array),s=un(s,this.array),r=un(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==vu&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var Qr=class extends hn{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ea=class extends hn{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var bt=class extends hn{constructor(e,t,i){super(new Float32Array(e),t,i)}},sx=new dn,zr=new D,nu=new D,ir=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):sx.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);let t=zr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(zr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(nu)),this.expandByPoint(zr.copy(e.center).sub(nu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},rx=0,Nn=new It,iu=new zt,Ys=new D,bn=new dn,Hr=new dn,Zt=new D,tn=class n extends Wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rx++}),this.uuid=Ts(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Rg(e)?ea:Qr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ze().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Nn.makeRotationFromQuaternion(e),this.applyMatrix4(Nn),this}rotateX(e){return Nn.makeRotationX(e),this.applyMatrix4(Nn),this}rotateY(e){return Nn.makeRotationY(e),this.applyMatrix4(Nn),this}rotateZ(e){return Nn.makeRotationZ(e),this.applyMatrix4(Nn),this}translate(e,t,i){return Nn.makeTranslation(e,t,i),this.applyMatrix4(Nn),this}scale(e,t,i){return Nn.makeScale(e,t,i),this.applyMatrix4(Nn),this}lookAt(e){return iu.lookAt(e),iu.updateMatrix(),this.applyMatrix4(iu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ys).negate(),this.translate(Ys.x,Ys.y,Ys.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new bt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new dn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];bn.setFromBufferAttribute(r),this.morphTargetsRelative?(Zt.addVectors(this.boundingBox.min,bn.min),this.boundingBox.expandByPoint(Zt),Zt.addVectors(this.boundingBox.max,bn.max),this.boundingBox.expandByPoint(Zt)):(this.boundingBox.expandByPoint(bn.min),this.boundingBox.expandByPoint(bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ge('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ir);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let i=this.boundingSphere.center;if(bn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Hr.setFromBufferAttribute(o),this.morphTargetsRelative?(Zt.addVectors(bn.min,Hr.min),bn.expandByPoint(Zt),Zt.addVectors(bn.max,Hr.max),bn.expandByPoint(Zt)):(bn.expandByPoint(Hr.min),bn.expandByPoint(Hr.max))}bn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Zt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Zt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Zt.fromBufferAttribute(o,l),c&&(Ys.fromBufferAttribute(e,l),Zt.add(Ys)),s=Math.max(s,i.distanceToSquared(Zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ge('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ge("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new hn(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let v=0;v<i.count;v++)o[v]=new D,c[v]=new D;let l=new D,u=new D,h=new D,f=new ce,d=new ce,p=new ce,x=new D,m=new D;function g(v,S,P){l.fromBufferAttribute(i,v),u.fromBufferAttribute(i,S),h.fromBufferAttribute(i,P),f.fromBufferAttribute(r,v),d.fromBufferAttribute(r,S),p.fromBufferAttribute(r,P),u.sub(l),h.sub(l),d.sub(f),p.sub(f);let I=1/(d.x*p.y-p.x*d.y);isFinite(I)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(h,-d.y).multiplyScalar(I),m.copy(h).multiplyScalar(d.x).addScaledVector(u,-p.x).multiplyScalar(I),o[v].add(x),o[S].add(x),o[P].add(x),c[v].add(m),c[S].add(m),c[P].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let v=0,S=w.length;v<S;++v){let P=w[v],I=P.start,O=P.count;for(let U=I,q=I+O;U<q;U+=3)g(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let E=new D,y=new D,T=new D,b=new D;function C(v){T.fromBufferAttribute(s,v),b.copy(T);let S=o[v];E.copy(S),E.sub(T.multiplyScalar(T.dot(S))).normalize(),y.crossVectors(b,S);let I=y.dot(c[v])<0?-1:1;a.setXYZW(v,E.x,E.y,E.z,I)}for(let v=0,S=w.length;v<S;++v){let P=w[v],I=P.start,O=P.count;for(let U=I,q=I+O;U<q;U+=3)C(e.getX(U+0)),C(e.getX(U+1)),C(e.getX(U+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new hn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let s=new D,r=new D,a=new D,o=new D,c=new D,l=new D,u=new D,h=new D;if(e)for(let f=0,d=e.count;f<d;f+=3){let p=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(i,p),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),o.add(u),c.add(u),l.add(u),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Zt.fromBufferAttribute(e,t),Zt.normalize(),e.setXYZ(t,Zt.x,Zt.y,Zt.z)}toNonIndexed(){function e(o,c){let l=o.array,u=o.itemSize,h=o.normalized,f=new l.constructor(c.length*u),d=0,p=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?d=c[x]*o.data.stride+o.offset:d=c[x]*u;for(let g=0;g<u;g++)f[p++]=l[d++]}return new hn(f,u,h)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,i);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,h=l.length;u<h;u++){let f=l[u],d=e(f,i);c.push(d)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,f=l.length;h<f;h++){let d=l[h];u.push(d.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,u=a.length;l<u;l++){let h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var ax=0,Vi=class extends Wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ax++}),this.uuid=Ts(),this.name="",this.type="Material",this.blending=gs,this.side=Un,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Co,this.blendDst=Ro,this.blendEquation=Hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new je(0,0,0),this.blendAlpha=0,this.depthFunc=xs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=xu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ps,this.stencilZFail=ps,this.stencilZPass=ps,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){He(\`Material: parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){He(\`Material: '\${t}' is not a property of THREE.\${this.type}.\`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==gs&&(i.blending=this.blending),this.side!==Un&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Co&&(i.blendSrc=this.blendSrc),this.blendDst!==Ro&&(i.blendDst=this.blendDst),this.blendEquation!==Hi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==xs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==xu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ps&&(i.stencilFail=this.stencilFail),this.stencilZFail!==ps&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==ps&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new je().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ce().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ce().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var gi=new D,su=new D,ho=new D,Bi=new D,ru=new D,fo=new D,au=new D,ys=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=gi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gi.copy(this.origin).addScaledVector(this.direction,t),gi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){su.copy(e).add(t).multiplyScalar(.5),ho.copy(t).sub(e).normalize(),Bi.copy(this.origin).sub(su);let r=e.distanceTo(t)*.5,a=-this.direction.dot(ho),o=Bi.dot(this.direction),c=-Bi.dot(ho),l=Bi.lengthSq(),u=Math.abs(1-a*a),h,f,d,p;if(u>0)if(h=a*c-o,f=a*o-c,p=r*u,h>=0)if(f>=-p)if(f<=p){let x=1/u;h*=x,f*=x,d=h*(h+a*f+2*o)+f*(a*h+f+2*c)+l}else f=r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;else f<=-p?(h=Math.max(0,-(-a*r+o)),f=h>0?-r:Math.min(Math.max(-r,-c),r),d=-h*h+f*(f+2*c)+l):f<=p?(h=0,f=Math.min(Math.max(-r,-c),r),d=f*(f+2*c)+l):(h=Math.max(0,-(a*r+o)),f=h>0?r:Math.min(Math.max(-r,-c),r),d=-h*h+f*(f+2*c)+l);else f=a>0?-r:r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(su).addScaledVector(ho,f),d}intersectSphere(e,t){gi.subVectors(e.center,this.origin);let i=gi.dot(this.direction),s=gi.dot(gi)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(i=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(i=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),u>=0?(r=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),i>c||o>s)||((o>i||i!==i)&&(i=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,gi)!==null}intersectTriangle(e,t,i,s,r){ru.subVectors(t,e),fo.subVectors(i,e),au.crossVectors(ru,fo);let a=this.direction.dot(au),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Bi.subVectors(this.origin,e);let c=o*this.direction.dot(fo.crossVectors(Bi,fo));if(c<0)return null;let l=o*this.direction.dot(ru.cross(Bi));if(l<0||c+l>a)return null;let u=-o*Bi.dot(au);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},En=class extends Vi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=Du,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},kd=new It,ds=new ys,po=new ir,zd=new D,mo=new D,go=new D,xo=new D,ou=new D,vo=new D,Hd=new D,_o=new D,pt=class extends zt{constructor(e=new tn,t=new En){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){vo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],h=r[c];u!==0&&(ou.fromBufferAttribute(h,e),a?vo.addScaledVector(ou,u):vo.addScaledVector(ou.sub(t),u))}t.add(vo)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),po.copy(i.boundingSphere),po.applyMatrix4(r),ds.copy(e.ray).recast(e.near),!(po.containsPoint(ds.origin)===!1&&(ds.intersectSphere(po,zd)===null||ds.origin.distanceToSquared(zd)>(e.far-e.near)**2))&&(kd.copy(r).invert(),ds.copy(e.ray).applyMatrix4(kd),!(i.boundingBox!==null&&ds.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,x=f.length;p<x;p++){let m=f[p],g=a[m.materialIndex],w=Math.max(m.start,d.start),E=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=w,T=E;y<T;y+=3){let b=o.getX(y),C=o.getX(y+1),v=o.getX(y+2);s=yo(this,g,e,i,l,u,h,b,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let w=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);s=yo(this,a,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let p=0,x=f.length;p<x;p++){let m=f[p],g=a[m.materialIndex],w=Math.max(m.start,d.start),E=Math.min(c.count,Math.min(m.start+m.count,d.start+d.count));for(let y=w,T=E;y<T;y+=3){let b=y,C=y+1,v=y+2;s=yo(this,g,e,i,l,u,h,b,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(c.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let w=m,E=m+1,y=m+2;s=yo(this,a,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function ox(n,e,t,i,s,r,a,o){let c;if(e.side===fn?c=i.intersectTriangle(a,r,s,!0,o):c=i.intersectTriangle(s,r,a,e.side===Un,o),c===null)return null;_o.copy(o),_o.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(_o);return l<t.near||l>t.far?null:{distance:l,point:_o.clone(),object:n}}function yo(n,e,t,i,s,r,a,o,c,l){n.getVertexPosition(o,mo),n.getVertexPosition(c,go),n.getVertexPosition(l,xo);let u=ox(n,e,t,i,mo,go,xo,Hd);if(u){let h=new D;zi.getBarycoord(Hd,mo,go,xo,h),s&&(u.uv=zi.getInterpolatedAttribute(s,o,c,l,h,new ce)),r&&(u.uv1=zi.getInterpolatedAttribute(r,o,c,l,h,new ce)),a&&(u.normal=zi.getInterpolatedAttribute(a,o,c,l,h,new D),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a:o,b:c,c:l,normal:new D,materialIndex:0};zi.getNormal(mo,go,xo,f.normal),u.face=f,u.barycoord=h}return u}var sr=class extends mn{constructor(e=null,t=1,i=1,s,r,a,o,c,l=Jt,u=Jt,h,f){super(null,a,o,c,l,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var cu=new D,cx=new D,lx=new Ze,Fn=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=cu.subVectors(i,t).cross(cx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(cu),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||lx.getNormalMatrix(e),s=this.coplanarPoint(cu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},fs=new ir,ux=new ce(.5,.5),bo=new D,rr=class{constructor(e=new Fn,t=new Fn,i=new Fn,s=new Fn,r=new Fn,a=new Fn){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Gn,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],h=r[5],f=r[6],d=r[7],p=r[8],x=r[9],m=r[10],g=r[11],w=r[12],E=r[13],y=r[14],T=r[15];if(s[0].setComponents(l-a,d-u,g-p,T-w).normalize(),s[1].setComponents(l+a,d+u,g+p,T+w).normalize(),s[2].setComponents(l+o,d+h,g+x,T+E).normalize(),s[3].setComponents(l-o,d-h,g-x,T-E).normalize(),i)s[4].setComponents(c,f,m,y).normalize(),s[5].setComponents(l-c,d-f,g-m,T-y).normalize();else if(s[4].setComponents(l-c,d-f,g-m,T-y).normalize(),t===Gn)s[5].setComponents(l+c,d+f,g+m,T+y).normalize();else if(t===Js)s[5].setComponents(c,f,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(e){fs.center.set(0,0,0);let t=ux.distanceTo(e.center);return fs.radius=.7071067811865476+t,fs.applyMatrix4(e.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(bo.x=s.normal.x>0?e.max.x:e.min.x,bo.y=s.normal.y>0?e.max.y:e.min.y,bo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(bo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ta=class extends mn{constructor(e=[],t=$i,i,s,r,a,o,c,l,u){super(e,t,i,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var _i=class extends mn{constructor(e,t,i=qn,s,r,a,o=Jt,c=Jt,l,u=si,h=1){if(u!==si&&u!==ji)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:h};super(f,s,r,a,o,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new er(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Vo=class extends _i{constructor(e,t=qn,i=$i,s,r,a=Jt,o=Jt,c,l=si){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,i,s,r,a,o,c,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},na=class extends mn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Wt=class n extends tn{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],h=[],f=0,d=0;p("z","y","x",-1,-1,i,t,e,a,r,0),p("z","y","x",1,-1,i,t,-e,a,r,1),p("x","z","y",1,1,e,i,t,s,a,2),p("x","z","y",1,-1,e,i,-t,s,a,3),p("x","y","z",1,-1,e,t,i,s,r,4),p("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new bt(l,3)),this.setAttribute("normal",new bt(u,3)),this.setAttribute("uv",new bt(h,2));function p(x,m,g,w,E,y,T,b,C,v,S){let P=y/C,I=T/v,O=y/2,U=T/2,q=b/2,R=C+1,H=v+1,z=0,k=0,$=new D;for(let se=0;se<H;se++){let ae=se*I-U;for(let ee=0;ee<R;ee++){let we=ee*P-O;$[x]=we*w,$[m]=ae*E,$[g]=q,l.push($.x,$.y,$.z),$[x]=0,$[m]=0,$[g]=b>0?1:-1,u.push($.x,$.y,$.z),h.push(ee/C),h.push(1-se/v),z+=1}}for(let se=0;se<v;se++)for(let ae=0;ae<C;ae++){let ee=f+ae+R*se,we=f+ae+R*(se+1),Ke=f+(ae+1)+R*(se+1),We=f+(ae+1)+R*se;c.push(ee,we,We),c.push(we,Ke,We),k+=6}o.addGroup(d,k,S),d+=k,f+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var yi=class n extends tn{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],p=0,x=[],m=i/2,g=0;w(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new bt(h,3)),this.setAttribute("normal",new bt(f,3)),this.setAttribute("uv",new bt(d,2));function w(){let y=new D,T=new D,b=0,C=(t-e)/i;for(let v=0;v<=r;v++){let S=[],P=v/r,I=P*(t-e)+e;for(let O=0;O<=s;O++){let U=O/s,q=U*c+o,R=Math.sin(q),H=Math.cos(q);T.x=I*R,T.y=-P*i+m,T.z=I*H,h.push(T.x,T.y,T.z),y.set(R,C,H).normalize(),f.push(y.x,y.y,y.z),d.push(U,1-P),S.push(p++)}x.push(S)}for(let v=0;v<s;v++)for(let S=0;S<r;S++){let P=x[S][v],I=x[S+1][v],O=x[S+1][v+1],U=x[S][v+1];(e>0||S!==0)&&(u.push(P,I,U),b+=3),(t>0||S!==r-1)&&(u.push(I,O,U),b+=3)}l.addGroup(g,b,0),g+=b}function E(y){let T=p,b=new ce,C=new D,v=0,S=y===!0?e:t,P=y===!0?1:-1;for(let O=1;O<=s;O++)h.push(0,m*P,0),f.push(0,P,0),d.push(.5,.5),p++;let I=p;for(let O=0;O<=s;O++){let q=O/s*c+o,R=Math.cos(q),H=Math.sin(q);C.x=S*H,C.y=m*P,C.z=S*R,h.push(C.x,C.y,C.z),f.push(0,P,0),b.x=R*.5+.5,b.y=H*.5*P+.5,d.push(b.x,b.y),p++}for(let O=0;O<s;O++){let U=T+O,q=I+O;y===!0?u.push(q,q+1,U):u.push(q+1,q,U),v+=3}l.addGroup(g,v,y===!0?1:2),g+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var wn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=i[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===a)return s/(r-1);let u=i[s],f=i[s+1]-u,d=(a-u)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new ce:new D);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new D,s=[],r=[],a=[],o=new D,c=new It;for(let d=0;d<=e;d++){let p=d/e;s[d]=this.getTangentAt(p,new D)}r[0]=new D,a[0]=new D;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=l&&(l=u,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),f<=l&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(nt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(o,p))}a[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(nt(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(d=-d);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],d*p)),a[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ar=class extends wn{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new ce){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=c-this.aX,d=l-this.aY;c=f*u-d*h+this.aX,l=f*h+d*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Go=class extends ar{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Zu(){let n=0,e=0,t=0,i=0;function s(r,a,o,c){n=r,e=o,t=-3*r+3*a-2*o-c,i=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,u,h){let f=(a-r)/l-(o-r)/(l+u)+(o-a)/u,d=(o-a)/u-(c-a)/(u+h)+(c-o)/h;f*=u,d*=u,s(a,o,f,d)},calc:function(r){let a=r*r,o=a*r;return n+e*r+t*a+i*o}}}var Vd=new D,Gd=new D,lu=new Zu,uu=new Zu,hu=new Zu,Wo=class extends wn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new D){let i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,u;this.closed||o>0?l=s[(o-1)%r]:(Gd.subVectors(s[0],s[1]).add(s[0]),l=Gd);let h=s[o%r],f=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Vd.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Vd),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,p=Math.pow(l.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),lu.initNonuniformCatmullRom(l.x,h.x,f.x,u.x,p,x,m),uu.initNonuniformCatmullRom(l.y,h.y,f.y,u.y,p,x,m),hu.initNonuniformCatmullRom(l.z,h.z,f.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(lu.initCatmullRom(l.x,h.x,f.x,u.x,this.tension),uu.initCatmullRom(l.y,h.y,f.y,u.y,this.tension),hu.initCatmullRom(l.z,h.z,f.z,u.z,this.tension));return i.set(lu.calc(c),uu.calc(c),hu.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Wd(n,e,t,i,s){let r=(i-e)*.5,a=(s-t)*.5,o=n*n,c=n*o;return(2*t-2*i+r+a)*c+(-3*t+3*i-2*r-a)*o+r*n+t}function hx(n,e){let t=1-n;return t*t*e}function dx(n,e){return 2*(1-n)*n*e}function fx(n,e){return n*n*e}function Xr(n,e,t,i){return hx(n,e)+dx(n,t)+fx(n,i)}function px(n,e){let t=1-n;return t*t*t*e}function mx(n,e){let t=1-n;return 3*t*t*n*e}function gx(n,e){return 3*(1-n)*n*n*e}function xx(n,e){return n*n*n*e}function qr(n,e,t,i,s){return px(n,e)+mx(n,t)+gx(n,i)+xx(n,s)}var ia=class extends wn{constructor(e=new ce,t=new ce,i=new ce,s=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ce){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(qr(e,s.x,r.x,a.x,o.x),qr(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Xo=class extends wn{constructor(e=new D,t=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(qr(e,s.x,r.x,a.x,o.x),qr(e,s.y,r.y,a.y,o.y),qr(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},sa=class extends wn{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},qo=class extends wn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ra=class extends wn{constructor(e=new ce,t=new ce,i=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ce){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(Xr(e,s.x,r.x,a.x),Xr(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Yo=class extends wn{constructor(e=new D,t=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(Xr(e,s.x,r.x,a.x),Xr(e,s.y,r.y,a.y),Xr(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},aa=class extends wn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){let i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return i.set(Wd(o,c.x,l.x,u.x,h.x),Wd(o,c.y,l.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new ce().fromArray(s))}return this}},_u=Object.freeze({__proto__:null,ArcCurve:Go,CatmullRomCurve3:Wo,CubicBezierCurve:ia,CubicBezierCurve3:Xo,EllipseCurve:ar,LineCurve:sa,LineCurve3:qo,QuadraticBezierCurve:ra,QuadraticBezierCurve3:Yo,SplineCurve:aa}),$o=class extends wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new _u[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new _u[s.type]().fromJSON(s))}return this}},oa=class extends $o{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new sa(this.currentPoint.clone(),new ce(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new ra(this.currentPoint.clone(),new ce(e,t),new ce(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){let o=new ia(this.currentPoint.clone(),new ce(e,t),new ce(i,s),new ce(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new aa(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,s,r,a,o,c),this}absellipse(e,t,i,s,r,a,o,c){let l=new ar(e,t,i,s,r,a,o,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Xn=class extends oa{constructor(e){super(e),this.uuid=Ts(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new oa().fromJSON(s))}return this}};function vx(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=kf(n,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,c,l;if(i&&(r=Sx(n,e,r,t)),n.length>80*t){o=n[0],c=n[1];let u=o,h=c;for(let f=t;f<s;f+=t){let d=n[f],p=n[f+1];d<o&&(o=d),p<c&&(c=p),d>u&&(u=d),p>h&&(h=p)}l=Math.max(u-o,h-c),l=l!==0?32767/l:0}return ca(r,a,t,o,c,l,0),a}function kf(n,e,t,i,s){let r;if(s===Ox(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=Xd(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=Xd(a/i|0,n[a],n[a+1],r);return r&&or(r,r.next)&&(ua(r),r=r.next),r}function bs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(or(t,t.next)||Dt(t.prev,t,t.next)===0)){if(ua(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function ca(n,e,t,i,s,r,a){if(!n)return;!a&&r&&Cx(n,i,s,r);let o=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(r?yx(n,i,s,r):_x(n)){e.push(c.i,n.i,l.i),ua(n),n=l.next,o=l.next;continue}if(n=l,n===o){a?a===1?(n=bx(bs(n),e),ca(n,e,t,i,s,r,2)):a===2&&Mx(n,e,t,i,s,r):ca(bs(n),e,t,i,s,r,1);break}}}function _x(n){let e=n.prev,t=n,i=n.next;if(Dt(e,t,i)>=0)return!1;let s=e.x,r=t.x,a=i.x,o=e.y,c=t.y,l=i.y,u=Math.min(s,r,a),h=Math.min(o,c,l),f=Math.max(s,r,a),d=Math.max(o,c,l),p=i.next;for(;p!==e;){if(p.x>=u&&p.x<=f&&p.y>=h&&p.y<=d&&Vr(s,o,r,c,a,l,p.x,p.y)&&Dt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function yx(n,e,t,i){let s=n.prev,r=n,a=n.next;if(Dt(s,r,a)>=0)return!1;let o=s.x,c=r.x,l=a.x,u=s.y,h=r.y,f=a.y,d=Math.min(o,c,l),p=Math.min(u,h,f),x=Math.max(o,c,l),m=Math.max(u,h,f),g=yu(d,p,e,t,i),w=yu(x,m,e,t,i),E=n.prevZ,y=n.nextZ;for(;E&&E.z>=g&&y&&y.z<=w;){if(E.x>=d&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==a&&Vr(o,u,c,h,l,f,E.x,E.y)&&Dt(E.prev,E,E.next)>=0||(E=E.prevZ,y.x>=d&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==a&&Vr(o,u,c,h,l,f,y.x,y.y)&&Dt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;E&&E.z>=g;){if(E.x>=d&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==a&&Vr(o,u,c,h,l,f,E.x,E.y)&&Dt(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;y&&y.z<=w;){if(y.x>=d&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==a&&Vr(o,u,c,h,l,f,y.x,y.y)&&Dt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function bx(n,e){let t=n;do{let i=t.prev,s=t.next.next;!or(i,s)&&Hf(i,t,t.next,s)&&la(i,s)&&la(s,i)&&(e.push(i.i,t.i,s.i),ua(t),ua(t.next),t=n=s),t=t.next}while(t!==n);return bs(t)}function Mx(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Px(a,o)){let c=Vf(a,o);a=bs(a,a.next),c=bs(c,c.next),ca(a,e,t,i,s,r,0),ca(c,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function Sx(n,e,t,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,c=r<a-1?e[r+1]*i:n.length,l=kf(n,o,c,i,!1);l===l.next&&(l.steiner=!0),s.push(Ix(l))}s.sort(Ex);for(let r=0;r<s.length;r++)t=wx(s[r],t);return t}function Ex(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function wx(n,e){let t=Tx(n,e);if(!t)return e;let i=Vf(t,n);return bs(i,i.next),bs(t,t.next)}function Tx(n,e){let t=e,i=n.x,s=n.y,r=-1/0,a;if(or(n,t))return t;do{if(or(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,c=a.x,l=a.y,u=1/0;t=a;do{if(i>=t.x&&t.x>=c&&i!==t.x&&zf(s<l?i:r,s,c,l,s<l?r:i,s,t.x,t.y)){let h=Math.abs(s-t.y)/(i-t.x);la(t,n)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&Ax(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function Ax(n,e){return Dt(n.prev,n,e.prev)<0&&Dt(e.next,n,n.next)<0}function Cx(n,e,t,i){let s=n;do s.z===0&&(s.z=yu(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Rx(s)}function Rx(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let l=0;l<t&&(o++,a=a.nextZ,!!a);l++);let c=t;for(;o>0||c>0&&a;)o!==0&&(c===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function yu(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function Ix(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function zf(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function Vr(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&zf(n,e,t,i,s,r,a,o)}function Px(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Dx(n,e)&&(la(n,e)&&la(e,n)&&Lx(n,e)&&(Dt(n.prev,n,e.prev)||Dt(n,e.prev,e))||or(n,e)&&Dt(n.prev,n,n.next)>0&&Dt(e.prev,e,e.next)>0)}function Dt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function or(n,e){return n.x===e.x&&n.y===e.y}function Hf(n,e,t,i){let s=So(Dt(n,e,t)),r=So(Dt(n,e,i)),a=So(Dt(t,i,n)),o=So(Dt(t,i,e));return!!(s!==r&&a!==o||s===0&&Mo(n,t,e)||r===0&&Mo(n,i,e)||a===0&&Mo(t,n,i)||o===0&&Mo(t,e,i))}function Mo(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function So(n){return n>0?1:n<0?-1:0}function Dx(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Hf(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function la(n,e){return Dt(n.prev,n,n.next)<0?Dt(n,e,n.next)>=0&&Dt(n,n.prev,e)>=0:Dt(n,e,n.prev)<0||Dt(n,n.next,e)<0}function Lx(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Vf(n,e){let t=bu(n.i,n.x,n.y),i=bu(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Xd(n,e,t,i){let s=bu(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function ua(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function bu(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ox(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Mu=class{static triangulate(e,t,i=2){return vx(e,t,i)}},ii=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];qd(e),Yd(i,e);let a=e.length;t.forEach(qd);for(let c=0;c<t.length;c++)s.push(a),a+=t[c].length,Yd(i,t[c]);let o=Mu.triangulate(i,s);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}};function qd(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Yd(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var bi=class n extends tn{constructor(e=new Xn([new ce(.5,.5),new ce(-.5,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let o=0,c=e.length;o<c;o++){let l=e[o];a(l)}this.setAttribute("position",new bt(s,3)),this.setAttribute("uv",new bt(r,2)),this.computeVertexNormals();function a(o){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:Nx,E,y=!1,T,b,C,v;if(g){E=g.getSpacedPoints(u),y=!0,f=!1;let ie=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(u,ie),b=new D,C=new D,v=new D}f||(m=0,d=0,p=0,x=0);let S=o.extractPoints(l),P=S.shape,I=S.holes;if(!ii.isClockWise(P)){P=P.reverse();for(let ie=0,oe=I.length;ie<oe;ie++){let re=I[ie];ii.isClockWise(re)&&(I[ie]=re.reverse())}}function U(ie){let re=10000000000000001e-36,ge=ie[0];for(let ve=1;ve<=ie.length;ve++){let Re=ve%ie.length,Le=ie[Re],qe=Le.x-ge.x,$e=Le.y-ge.y,L=qe*qe+$e*$e,mt=Math.max(Math.abs(Le.x),Math.abs(Le.y),Math.abs(ge.x),Math.abs(ge.y)),it=re*mt*mt;if(L<=it){ie.splice(Re,1),ve--;continue}ge=Le}}U(P),I.forEach(U);let q=I.length,R=P;for(let ie=0;ie<q;ie++){let oe=I[ie];P=P.concat(oe)}function H(ie,oe,re){return oe||Ge("ExtrudeGeometry: vec does not exist"),ie.clone().addScaledVector(oe,re)}let z=P.length;function k(ie,oe,re){let ge,ve,Re,Le=ie.x-oe.x,qe=ie.y-oe.y,$e=re.x-ie.x,L=re.y-ie.y,mt=Le*Le+qe*qe,it=Le*L-qe*$e;if(Math.abs(it)>Number.EPSILON){let A=Math.sqrt(mt),_=Math.sqrt($e*$e+L*L),B=oe.x-qe/A,V=oe.y+Le/A,j=re.x-L/_,le=re.y+$e/_,he=((j-B)*L-(le-V)*$e)/(Le*L-qe*$e);ge=B+Le*he-ie.x,ve=V+qe*he-ie.y;let Z=ge*ge+ve*ve;if(Z<=2)return new ce(ge,ve);Re=Math.sqrt(Z/2)}else{let A=!1;Le>Number.EPSILON?$e>Number.EPSILON&&(A=!0):Le<-Number.EPSILON?$e<-Number.EPSILON&&(A=!0):Math.sign(qe)===Math.sign(L)&&(A=!0),A?(ge=-qe,ve=Le,Re=Math.sqrt(mt)):(ge=Le,ve=qe,Re=Math.sqrt(mt/2))}return new ce(ge/Re,ve/Re)}let $=[];for(let ie=0,oe=R.length,re=oe-1,ge=ie+1;ie<oe;ie++,re++,ge++)re===oe&&(re=0),ge===oe&&(ge=0),$[ie]=k(R[ie],R[re],R[ge]);let se=[],ae,ee=$.concat();for(let ie=0,oe=q;ie<oe;ie++){let re=I[ie];ae=[];for(let ge=0,ve=re.length,Re=ve-1,Le=ge+1;ge<ve;ge++,Re++,Le++)Re===ve&&(Re=0),Le===ve&&(Le=0),ae[ge]=k(re[ge],re[Re],re[Le]);se.push(ae),ee=ee.concat(ae)}let we;if(m===0)we=ii.triangulateShape(R,I);else{let ie=[],oe=[];for(let re=0;re<m;re++){let ge=re/m,ve=d*Math.cos(ge*Math.PI/2),Re=p*Math.sin(ge*Math.PI/2)+x;for(let Le=0,qe=R.length;Le<qe;Le++){let $e=H(R[Le],$[Le],Re);Ie($e.x,$e.y,-ve),ge===0&&ie.push($e)}for(let Le=0,qe=q;Le<qe;Le++){let $e=I[Le];ae=se[Le];let L=[];for(let mt=0,it=$e.length;mt<it;mt++){let A=H($e[mt],ae[mt],Re);Ie(A.x,A.y,-ve),ge===0&&L.push(A)}ge===0&&oe.push(L)}}we=ii.triangulateShape(ie,oe)}let Ke=we.length,We=p+x;for(let ie=0;ie<z;ie++){let oe=f?H(P[ie],ee[ie],We):P[ie];y?(C.copy(T.normals[0]).multiplyScalar(oe.x),b.copy(T.binormals[0]).multiplyScalar(oe.y),v.copy(E[0]).add(C).add(b),Ie(v.x,v.y,v.z)):Ie(oe.x,oe.y,0)}for(let ie=1;ie<=u;ie++)for(let oe=0;oe<z;oe++){let re=f?H(P[oe],ee[oe],We):P[oe];y?(C.copy(T.normals[ie]).multiplyScalar(re.x),b.copy(T.binormals[ie]).multiplyScalar(re.y),v.copy(E[ie]).add(C).add(b),Ie(v.x,v.y,v.z)):Ie(re.x,re.y,h/u*ie)}for(let ie=m-1;ie>=0;ie--){let oe=ie/m,re=d*Math.cos(oe*Math.PI/2),ge=p*Math.sin(oe*Math.PI/2)+x;for(let ve=0,Re=R.length;ve<Re;ve++){let Le=H(R[ve],$[ve],ge);Ie(Le.x,Le.y,h+re)}for(let ve=0,Re=I.length;ve<Re;ve++){let Le=I[ve];ae=se[ve];for(let qe=0,$e=Le.length;qe<$e;qe++){let L=H(Le[qe],ae[qe],ge);y?Ie(L.x,L.y+E[u-1].y,E[u-1].x+re):Ie(L.x,L.y,h+re)}}}K(),ue();function K(){let ie=s.length/3;if(f){let oe=0,re=z*oe;for(let ge=0;ge<Ke;ge++){let ve=we[ge];Xe(ve[2]+re,ve[1]+re,ve[0]+re)}oe=u+m*2,re=z*oe;for(let ge=0;ge<Ke;ge++){let ve=we[ge];Xe(ve[0]+re,ve[1]+re,ve[2]+re)}}else{for(let oe=0;oe<Ke;oe++){let re=we[oe];Xe(re[2],re[1],re[0])}for(let oe=0;oe<Ke;oe++){let re=we[oe];Xe(re[0]+z*u,re[1]+z*u,re[2]+z*u)}}i.addGroup(ie,s.length/3-ie,0)}function ue(){let ie=s.length/3,oe=0;ne(R,oe),oe+=R.length;for(let re=0,ge=I.length;re<ge;re++){let ve=I[re];ne(ve,oe),oe+=ve.length}i.addGroup(ie,s.length/3-ie,1)}function ne(ie,oe){let re=ie.length;for(;--re>=0;){let ge=re,ve=re-1;ve<0&&(ve=ie.length-1);for(let Re=0,Le=u+m*2;Re<Le;Re++){let qe=z*Re,$e=z*(Re+1),L=oe+ge+qe,mt=oe+ve+qe,it=oe+ve+$e,A=oe+ge+$e;ze(L,mt,it,A)}}}function Ie(ie,oe,re){c.push(ie),c.push(oe),c.push(re)}function Xe(ie,oe,re){dt(ie),dt(oe),dt(re);let ge=s.length/3,ve=w.generateTopUV(i,s,ge-3,ge-2,ge-1);Ye(ve[0]),Ye(ve[1]),Ye(ve[2])}function ze(ie,oe,re,ge){dt(ie),dt(oe),dt(ge),dt(oe),dt(re),dt(ge);let ve=s.length/3,Re=w.generateSideWallUV(i,s,ve-6,ve-3,ve-2,ve-1);Ye(Re[0]),Ye(Re[1]),Ye(Re[3]),Ye(Re[1]),Ye(Re[2]),Ye(Re[3])}function dt(ie){s.push(c[ie*3+0]),s.push(c[ie*3+1]),s.push(c[ie*3+2])}function Ye(ie){r.push(ie.x),r.push(ie.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return Fx(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new _u[s.type]().fromJSON(s)),new n(i,e.options)}},Nx={generateTopUV:function(n,e,t,i,s){let r=e[t*3],a=e[t*3+1],o=e[i*3],c=e[i*3+1],l=e[s*3],u=e[s*3+1];return[new ce(r,a),new ce(o,c),new ce(l,u)]},generateSideWallUV:function(n,e,t,i,s,r){let a=e[t*3],o=e[t*3+1],c=e[t*3+2],l=e[i*3],u=e[i*3+1],h=e[i*3+2],f=e[s*3],d=e[s*3+1],p=e[s*3+2],x=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-u)<Math.abs(a-l)?[new ce(a,1-c),new ce(l,1-h),new ce(f,1-p),new ce(x,1-g)]:[new ce(o,1-c),new ce(u,1-h),new ce(d,1-p),new ce(m,1-g)]}};function Fx(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var ha=class n extends tn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),c=Math.floor(s),l=o+1,u=c+1,h=e/o,f=t/c,d=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let w=g*f-a;for(let E=0;E<l;E++){let y=E*h-r;p.push(y,-w,0),x.push(0,0,1),m.push(E/o),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let w=0;w<o;w++){let E=w+l*g,y=w+l*(g+1),T=w+1+l*(g+1),b=w+1+l*g;d.push(E,y,b),d.push(y,T,b)}this.setIndex(d),this.setAttribute("position",new bt(p,3)),this.setAttribute("normal",new bt(x,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},da=class n extends tn{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],c=[],l=[],u=[],h=e,f=(t-e)/s,d=new D,p=new ce;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let g=r+m/i*a;d.x=h*Math.cos(g),d.y=h*Math.sin(g),c.push(d.x,d.y,d.z),l.push(0,0,1),p.x=(d.x/t+1)/2,p.y=(d.y/t+1)/2,u.push(p.x,p.y)}h+=f}for(let x=0;x<s;x++){let m=x*(i+1);for(let g=0;g<i;g++){let w=g+m,E=w,y=w+i+1,T=w+i+2,b=w+1;o.push(E,y,b),o.push(y,T,b)}}this.setIndex(o),this.setAttribute("position",new bt(c,3)),this.setAttribute("normal",new bt(l,3)),this.setAttribute("uv",new bt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},fa=class n extends tn{constructor(e=new Xn([new ce(0,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],s=[],r=[],a=[],o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(o,c,u),o+=c,c=0;this.setIndex(i),this.setAttribute("position",new bt(s,3)),this.setAttribute("normal",new bt(r,3)),this.setAttribute("uv",new bt(a,2));function l(u){let h=s.length/3,f=u.extractPoints(t),d=f.shape,p=f.holes;ii.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,g=p.length;m<g;m++){let w=p[m];ii.isClockWise(w)===!0&&(p[m]=w.reverse())}let x=ii.triangulateShape(d,p);for(let m=0,g=p.length;m<g;m++){let w=p[m];d=d.concat(w)}for(let m=0,g=d.length;m<g;m++){let w=d[m];s.push(w.x,w.y,0),r.push(0,0,1),a.push(w.x,w.y)}for(let m=0,g=x.length;m<g;m++){let w=x[m],E=w[0]+h,y=w[1]+h,T=w[2]+h;i.push(E,y,T),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Ux(t,e)}static fromJSON(e,t){let i=[];for(let s=0,r=e.shapes.length;s<r;s++){let a=t[e.shapes[s]];i.push(a)}return new n(i,e.curveSegments)}};function Ux(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}var Mi=class n extends tn{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,u=[],h=new D,f=new D,d=[],p=[],x=[],m=[];for(let g=0;g<=i;g++){let w=[],E=g/i,y=a+E*o,T=e*Math.cos(y),b=Math.sqrt(e*e-T*T),C=0;g===0&&a===0?C=.5/t:g===i&&c===Math.PI&&(C=-.5/t);for(let v=0;v<=t;v++){let S=v/t,P=s+S*r;h.x=-b*Math.cos(P),h.y=T,h.z=b*Math.sin(P),p.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),m.push(S+C,1-E),w.push(l++)}u.push(w)}for(let g=0;g<i;g++)for(let w=0;w<t;w++){let E=u[g][w+1],y=u[g][w],T=u[g+1][w],b=u[g+1][w+1];(g!==0||a>0)&&d.push(E,y,b),(g!==i-1||c<Math.PI)&&d.push(y,T,b)}this.setIndex(d),this.setAttribute("position",new bt(p,3)),this.setAttribute("normal",new bt(x,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function As(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if($d(s))s.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if($d(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function cn(n){let e={};for(let t=0;t<n.length;t++){let i=As(n[t]);for(let s in i)e[s]=i[s]}return e}function $d(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Bx(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Ku(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:lt.workingColorSpace}var Gf={clone:As,merge:cn},kx=\`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}\`,zx=\`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}\`,Tn=class extends Vi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=kx,this.fragmentShader=zx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=As(e.uniforms),this.uniformsGroups=Bx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new je().setHex(s.value);break;case"v2":this.uniforms[i].value=new ce().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Pt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ze().fromArray(s.value);break;case"m4":this.uniforms[i].value=new It().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},jo=class extends Tn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},An=class extends Vi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new je(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Zc,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},pa=class extends An{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new je(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new je(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new je(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Zo=class extends Vi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Tf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ko=class extends Vi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Eo(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}var Gi=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break n}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Jo=class extends Gi{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:pu,endingEnd:pu}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case mu:r=e,o=2*t-i;break;case gu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case mu:a=e,c=2*i-t;break;case gu:a=1,c=i+s[1]-s[0];break;default:a=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,p=(i-t)/(s-t),x=p*p,m=x*p,g=-f*m+2*f*x-f*p,w=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*p+1,E=(-1-d)*m+(1.5+d)*x+.5*p,y=d*m-d*x;for(let T=0;T!==o;++T)r[T]=g*a[u+T]+w*a[l+T]+E*a[c+T]+y*a[h+T];return r}},Qo=class extends Gi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(i-t)/(s-t),h=1-u;for(let f=0;f!==o;++f)r[f]=a[l+f]*h+a[c+f]*u;return r}},ec=class extends Gi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},tc=class extends Gi{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(i-t)/(s-t),x=1-p;for(let m=0;m!==o;++m)r[m]=a[l+m]*x+a[c+m]*p;return r}let f=o*2,d=e-1;for(let p=0;p!==o;++p){let x=a[l+p],m=a[c+p],g=d*f+p*2,w=h[g],E=h[g+1],y=e*f+p*2,T=u[y],b=u[y+1],C=(i-t)/(s-t),v,S,P,I,O;for(let U=0;U<8;U++){v=C*C,S=v*C,P=1-C,I=P*P,O=I*P;let R=O*t+3*I*C*w+3*P*v*T+S*s-i;if(Math.abs(R)<1e-10)break;let H=3*I*(w-t)+6*P*C*(T-w)+3*v*(s-T);if(Math.abs(H)<1e-10)break;C=C-R/H,C=Math.max(0,Math.min(1,C))}r[p]=O*x+3*I*C*E+3*P*v*b+S*m}return r}},Cn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Eo(t,this.TimeBufferType),this.values=Eo(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Eo(e.times,Array),values:Eo(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new ec(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Qo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Jo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new tc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Yr:t=this.InterpolantFactoryMethodDiscrete;break;case Bo:t=this.InterpolantFactoryMethodLinear;break;case Ao:t=this.InterpolantFactoryMethodSmooth;break;case fu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return He("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Yr;case this.InterpolantFactoryMethodLinear:return Bo;case this.InterpolantFactoryMethodSmooth:return Ao;case this.InterpolantFactoryMethodBezier:return fu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ge("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Ge("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){Ge("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Ge("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Ig(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){Ge("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Ao,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(s)c=!0;else{let h=o*i,f=h-i,d=h+i;for(let p=0;p!==i;++p){let x=t[h+p];if(x!==t[f+p]||x!==t[d+p]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let h=o*i,f=a*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Cn.prototype.ValueTypeName="";Cn.prototype.TimeBufferType=Float32Array;Cn.prototype.ValueBufferType=Float32Array;Cn.prototype.DefaultInterpolation=Bo;var Wi=class extends Cn{constructor(e,t,i){super(e,t,i)}};Wi.prototype.ValueTypeName="bool";Wi.prototype.ValueBufferType=Array;Wi.prototype.DefaultInterpolation=Yr;Wi.prototype.InterpolantFactoryMethodLinear=void 0;Wi.prototype.InterpolantFactoryMethodSmooth=void 0;var nc=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};nc.prototype.ValueTypeName="color";var ic=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};ic.prototype.ValueTypeName="number";var sc=class extends Gi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(s-t),l=e*o;for(let u=l+o;l!==u;l+=4)Mn.slerpFlat(r,0,a,l-o,a,l,c);return r}},ma=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new sc(this.times,this.values,this.getValueSize(),e)}};ma.prototype.ValueTypeName="quaternion";ma.prototype.InterpolantFactoryMethodSmooth=void 0;var Xi=class extends Cn{constructor(e,t,i){super(e,t,i)}};Xi.prototype.ValueTypeName="string";Xi.prototype.ValueBufferType=Array;Xi.prototype.DefaultInterpolation=Yr;Xi.prototype.InterpolantFactoryMethodLinear=void 0;Xi.prototype.InterpolantFactoryMethodSmooth=void 0;var rc=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};rc.prototype.ValueTypeName="vector";var ac=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=l.length;h<f;h+=2){let d=l[h],p=l[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Wf=new ac,oc=class{constructor(e){this.manager=e!==void 0?e:Wf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};oc.DEFAULT_MATERIAL_NAME="__DEFAULT";var cr=class extends zt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new je(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ga=class extends cr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new je(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},du=new It,jd=new D,Zd=new D,cc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=on,this.map=null,this.mapPass=null,this.matrix=new It,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rr,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new Pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;jd.setFromMatrixPosition(e.matrixWorld),t.position.copy(jd),Zd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Zd),t.updateMatrixWorld(),du.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(du,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Js||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(du)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},wo=new D,To=new Mn,ti=new D,Ms=class extends zt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new It,this.projectionMatrix=new It,this.projectionMatrixInverse=new It,this.coordinateSystem=Gn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(wo,To,ti),ti.x===1&&ti.y===1&&ti.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,ti.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(wo,To,ti),ti.x===1&&ti.y===1&&ti.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(wo,To,ti.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ki=new D,Kd=new ce,Jd=new ce,en=class extends Ms{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=_s*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Gr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return _s*2*Math.atan(Math.tan(Gr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){ki.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ki.x,ki.y).multiplyScalar(-e/ki.z),ki.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ki.x,ki.y).multiplyScalar(-e/ki.z)}getViewSize(e,t){return this.getViewBounds(e,Kd,Jd),t.subVectors(Jd,Kd)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Gr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*i/l,s*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Su=class extends cc{constructor(){super(new en(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=_s*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},xa=class extends cr{constructor(e,t,i=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.target=new zt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Su}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}};var lr=class extends Ms{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Eu=class extends cc{constructor(){super(new lr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ur=class extends cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.target=new zt,this.shadow=new Eu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var $s=-90,js=1,lc=class extends zt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new en($s,js,e,t);s.layers=this.layers,this.add(s);let r=new en($s,js,e,t);r.layers=this.layers,this.add(r);let a=new en($s,js,e,t);a.layers=this.layers,this.add(a);let o=new en($s,js,e,t);o.layers=this.layers,this.add(o);let c=new en($s,js,e,t);c.layers=this.layers,this.add(c);let l=new en($s,js,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===Gn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Js)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},uc=class extends en{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ju="\\\\[\\\\]\\\\.:\\\\/",Hx=new RegExp("["+Ju+"]","g"),Qu="[^"+Ju+"]",Vx="[^"+Ju.replace("\\\\.","")+"]",Gx=/((?:WC+[\\/:])*)/.source.replace("WC",Qu),Wx=/(WCOD+)?/.source.replace("WCOD",Vx),Xx=/(?:\\.(WC+)(?:\\[(.+)\\])?)?/.source.replace("WC",Qu),qx=/\\.(WC+)(?:\\[(.+)\\])?/.source.replace("WC",Qu),Yx=new RegExp("^"+Gx+Wx+Xx+qx+"$"),$x=["material","materials","bones","map"],wu=class{constructor(e,t,i){let s=i||Rt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Rt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\\s/g,"_").replace(Hx,"")}static parseTrackName(e){let t=Yx.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);$x.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){He("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ge("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ge("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ge("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ge("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){Ge("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;Ge("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Rt.Composite=wu;Rt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Rt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Rt.prototype.GetterByBindingType=[Rt.prototype._getValue_direct,Rt.prototype._getValue_array,Rt.prototype._getValue_arrayElement,Rt.prototype._getValue_toArray];Rt.prototype.SetterByBindingTypeAndVersioning=[[Rt.prototype._setValue_direct,Rt.prototype._setValue_direct_setNeedsUpdate,Rt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_array,Rt.prototype._setValue_array_setNeedsUpdate,Rt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_arrayElement,Rt.prototype._setValue_arrayElement_setNeedsUpdate,Rt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_fromArray,Rt.prototype._setValue_fromArray_setNeedsUpdate,Rt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Vw=new Float32Array(1);var Qd=new It,Ss=class{constructor(e,t,i=0,s=1/0){this.ray=new ys(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new tr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ge("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Qd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Qd),this}intersectObject(e,t=!0,i=[]){return Tu(e,this,i,t),i.sort(ef),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Tu(e[s],this,i,t);return i.sort(ef),i}};function ef(n,e){return n.distance-e.distance}function Tu(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)Tu(r[a],e,t,!0)}}var hr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=nt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(nt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Au=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};var va=class extends Wn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){He("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function eh(n,e,t,i){let s=jx(i);switch(t){case Wu:return n*e;case qu:return n*e/s.components*s.byteLength;case xc:return n*e/s.components*s.byteLength;case Zi:return n*e*2/s.components*s.byteLength;case vc:return n*e*2/s.components*s.byteLength;case Xu:return n*e*3/s.components*s.byteLength;case gn:return n*e*4/s.components*s.byteLength;case _c:return n*e*4/s.components*s.byteLength;case ba:case Ma:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Sa:case Ea:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case bc:case Sc:return Math.max(n,16)*Math.max(e,8)/4;case yc:case Mc:return Math.max(n,8)*Math.max(e,8)/2;case Ec:case wc:case Ac:case Cc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Tc:case wa:case Rc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ic:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Pc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Dc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Lc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Oc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Nc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Fc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Uc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Bc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case kc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case zc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Hc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Vc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Gc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Wc:case Xc:case qc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Yc:case $c:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ta:case jc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(\`Unable to determine texture byte length for \${t} format.\`)}function jx(n){switch(n){case on:case zu:return{byteLength:1,components:1};case pr:case Hu:case oi:return{byteLength:2,components:1};case mc:case gc:return{byteLength:2,components:4};case qn:case pc:case Yn:return{byteLength:4,components:1};case Vu:case Gu:return{byteLength:4,components:3}}throw new Error(\`THREE.TextureUtils: Unknown texture type \${n}.\`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function fp(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Kx(n){let e=new WeakMap;function t(o,c){let l=o.array,u=o.usage,h=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,u),o.onUploadCallback();let d;if(l instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)d=n.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=n.SHORT;else if(l instanceof Uint32Array)d=n.UNSIGNED_INT;else if(l instanceof Int32Array)d=n.INT;else if(l instanceof Int8Array)d=n.BYTE;else if(l instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,c,l){let u=c.array,h=c.updateRanges;if(n.bindBuffer(l,o),h.length===0)n.bufferSubData(l,0,u);else{h.sort((d,p)=>d.start-p.start);let f=0;for(let d=1;d<h.length;d++){let p=h[f],x=h[d];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++f,h[f]=x)}h.length=f+1;for(let d=0,p=h.length;d<p;d++){let x=h[d];n.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(n.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Jx=\`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif\`,Qx=\`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif\`,ev=\`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif\`,tv=\`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif\`,nv=\`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif\`,iv=\`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif\`,sv=\`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif\`,rv=\`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif\`,av=\`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif\`,ov=\`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif\`,cv=\`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif\`,lv=\`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif\`,uv=\`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated\`,hv=\`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif\`,dv=\`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif\`,fv=\`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif\`,pv=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif\`,mv=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif\`,gv=\`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif\`,xv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif\`,vv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif\`,_v=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif\`,yv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif\`,bv=\`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated\`,Mv=\`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif\`,Sv=\`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif\`,Ev=\`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif\`,wv=\`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif\`,Tv=\`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif\`,Av=\`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif\`,Cv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Rv=\`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}\`,Iv=\`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif\`,Pv=\`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif\`,Dv=\`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif\`,Lv=\`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif\`,Ov=\`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif\`,Nv=\`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif\`,Fv=\`#ifdef USE_FOG
	varying float vFogDepth;
#endif\`,Uv=\`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif\`,Bv=\`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif\`,kv=\`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}\`,zv=\`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif\`,Hv=\`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;\`,Vv=\`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert\`,Gv=\`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>\`,Wv=\`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif\`,Xv=\`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;\`,qv=\`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon\`,Yv=\`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;\`,$v=\`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong\`,jv=\`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif\`,Zv=\`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}\`,Kv=\`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif\`,Jv=\`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif\`,Qv=\`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif\`,e_=\`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif\`,t_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif\`,n_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,i_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,s_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif\`,r_=\`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif\`,a_=\`#ifdef USE_MAP
	uniform sampler2D map;
#endif\`,o_=\`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif\`,c_=\`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif\`,l_=\`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif\`,u_=\`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif\`,h_=\`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif\`,d_=\`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif\`,f_=\`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,p_=\`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif\`,m_=\`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,g_=\`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;\`,x_=\`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif\`,v_=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,__=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,y_=\`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif\`,b_=\`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif\`,M_=\`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif\`,S_=\`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif\`,E_=\`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif\`,w_=\`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif\`,T_=\`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );\`,A_=\`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}\`,C_=\`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif\`,R_=\`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;\`,I_=\`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif\`,P_=\`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif\`,D_=\`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif\`,L_=\`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif\`,O_=\`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif\`,N_=\`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif\`,F_=\`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif\`,U_=\`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}\`,B_=\`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif\`,k_=\`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif\`,z_=\`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif\`,H_=\`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif\`,V_=\`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif\`,G_=\`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif\`,W_=\`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif\`,X_=\`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }\`,q_=\`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif\`,Y_=\`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif\`,$_=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif\`,j_=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif\`,Z_=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif\`,K_=\`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif\`,J_=\`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}\`,Q_=\`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,ey=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,ty=\`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,ny=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,iy=\`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,sy=\`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}\`,ry=\`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}\`,ay=\`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}\`,oy=\`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}\`,cy=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}\`,ly=\`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,uy=\`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}\`,hy=\`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}\`,dy=\`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}\`,fy=\`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,py=\`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}\`,my=\`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,gy=\`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}\`,xy=\`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,vy=\`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}\`,_y=\`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}\`,yy=\`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}\`,by=\`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,My=\`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}\`,Sy=\`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,Ey=\`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}\`,wy=\`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}\`,Ty=\`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}\`,Ay=\`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}\`,Cy=\`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}\`,Ry=\`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}\`,Iy=\`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}\`,Py=\`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}\`,st={alphahash_fragment:Jx,alphahash_pars_fragment:Qx,alphamap_fragment:ev,alphamap_pars_fragment:tv,alphatest_fragment:nv,alphatest_pars_fragment:iv,aomap_fragment:sv,aomap_pars_fragment:rv,batching_pars_vertex:av,batching_vertex:ov,begin_vertex:cv,beginnormal_vertex:lv,bsdfs:uv,iridescence_fragment:hv,bumpmap_pars_fragment:dv,clipping_planes_fragment:fv,clipping_planes_pars_fragment:pv,clipping_planes_pars_vertex:mv,clipping_planes_vertex:gv,color_fragment:xv,color_pars_fragment:vv,color_pars_vertex:_v,color_vertex:yv,common:bv,cube_uv_reflection_fragment:Mv,defaultnormal_vertex:Sv,displacementmap_pars_vertex:Ev,displacementmap_vertex:wv,emissivemap_fragment:Tv,emissivemap_pars_fragment:Av,colorspace_fragment:Cv,colorspace_pars_fragment:Rv,envmap_fragment:Iv,envmap_common_pars_fragment:Pv,envmap_pars_fragment:Dv,envmap_pars_vertex:Lv,envmap_physical_pars_fragment:Wv,envmap_vertex:Ov,fog_vertex:Nv,fog_pars_vertex:Fv,fog_fragment:Uv,fog_pars_fragment:Bv,gradientmap_pars_fragment:kv,lightmap_pars_fragment:zv,lights_lambert_fragment:Hv,lights_lambert_pars_fragment:Vv,lights_pars_begin:Gv,lights_toon_fragment:Xv,lights_toon_pars_fragment:qv,lights_phong_fragment:Yv,lights_phong_pars_fragment:$v,lights_physical_fragment:jv,lights_physical_pars_fragment:Zv,lights_fragment_begin:Kv,lights_fragment_maps:Jv,lights_fragment_end:Qv,lightprobes_pars_fragment:e_,logdepthbuf_fragment:t_,logdepthbuf_pars_fragment:n_,logdepthbuf_pars_vertex:i_,logdepthbuf_vertex:s_,map_fragment:r_,map_pars_fragment:a_,map_particle_fragment:o_,map_particle_pars_fragment:c_,metalnessmap_fragment:l_,metalnessmap_pars_fragment:u_,morphinstance_vertex:h_,morphcolor_vertex:d_,morphnormal_vertex:f_,morphtarget_pars_vertex:p_,morphtarget_vertex:m_,normal_fragment_begin:g_,normal_fragment_maps:x_,normal_pars_fragment:v_,normal_pars_vertex:__,normal_vertex:y_,normalmap_pars_fragment:b_,clearcoat_normal_fragment_begin:M_,clearcoat_normal_fragment_maps:S_,clearcoat_pars_fragment:E_,iridescence_pars_fragment:w_,opaque_fragment:T_,packing:A_,premultiplied_alpha_fragment:C_,project_vertex:R_,dithering_fragment:I_,dithering_pars_fragment:P_,roughnessmap_fragment:D_,roughnessmap_pars_fragment:L_,shadowmap_pars_fragment:O_,shadowmap_pars_vertex:N_,shadowmap_vertex:F_,shadowmask_pars_fragment:U_,skinbase_vertex:B_,skinning_pars_vertex:k_,skinning_vertex:z_,skinnormal_vertex:H_,specularmap_fragment:V_,specularmap_pars_fragment:G_,tonemapping_fragment:W_,tonemapping_pars_fragment:X_,transmission_fragment:q_,transmission_pars_fragment:Y_,uv_pars_fragment:$_,uv_pars_vertex:j_,uv_vertex:Z_,worldpos_vertex:K_,background_vert:J_,background_frag:Q_,backgroundCube_vert:ey,backgroundCube_frag:ty,cube_vert:ny,cube_frag:iy,depth_vert:sy,depth_frag:ry,distance_vert:ay,distance_frag:oy,equirect_vert:cy,equirect_frag:ly,linedashed_vert:uy,linedashed_frag:hy,meshbasic_vert:dy,meshbasic_frag:fy,meshlambert_vert:py,meshlambert_frag:my,meshmatcap_vert:gy,meshmatcap_frag:xy,meshnormal_vert:vy,meshnormal_frag:_y,meshphong_vert:yy,meshphong_frag:by,meshphysical_vert:My,meshphysical_frag:Sy,meshtoon_vert:Ey,meshtoon_frag:wy,points_vert:Ty,points_frag:Ay,shadow_vert:Cy,shadow_frag:Ry,sprite_vert:Iy,sprite_frag:Py},be={common:{diffuse:{value:new je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ze}},envmap:{envMap:{value:null},envMapRotation:{value:new Ze},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ze},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0},uvTransform:{value:new Ze}},sprite:{diffuse:{value:new je(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}}},li={basic:{uniforms:cn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:cn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new je(0)},envMapIntensity:{value:1}}]),vertexShader:st.meshlambert_vert,fragmentShader:st.meshlambert_frag},phong:{uniforms:cn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new je(0)},specular:{value:new je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:st.meshphong_vert,fragmentShader:st.meshphong_frag},standard:{uniforms:cn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:cn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new je(0)}}]),vertexShader:st.meshtoon_vert,fragmentShader:st.meshtoon_frag},matcap:{uniforms:cn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:st.meshmatcap_vert,fragmentShader:st.meshmatcap_frag},points:{uniforms:cn([be.points,be.fog]),vertexShader:st.points_vert,fragmentShader:st.points_frag},dashed:{uniforms:cn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:st.linedashed_vert,fragmentShader:st.linedashed_frag},depth:{uniforms:cn([be.common,be.displacementmap]),vertexShader:st.depth_vert,fragmentShader:st.depth_frag},normal:{uniforms:cn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:st.meshnormal_vert,fragmentShader:st.meshnormal_frag},sprite:{uniforms:cn([be.sprite,be.fog]),vertexShader:st.sprite_vert,fragmentShader:st.sprite_frag},background:{uniforms:{uvTransform:{value:new Ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distance:{uniforms:cn([be.common,be.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:st.distance_vert,fragmentShader:st.distance_frag},shadow:{uniforms:cn([be.lights,be.fog,{color:{value:new je(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};li.physical={uniforms:cn([li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ze},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ze},sheen:{value:0},sheenColor:{value:new je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ze},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ze},attenuationDistance:{value:0},attenuationColor:{value:new je(0)},specularColor:{value:new je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ze},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ze}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};var Qc={r:0,b:0,g:0},Dy=new It,pp=new Ze;pp.set(-1,0,0,0,1,0,0,0,1);function Ly(n,e,t,i,s,r){let a=new je(0),o=s===!0?0:1,c,l,u=null,h=0,f=null;function d(w){let E=w.isScene===!0?w.background:null;if(E&&E.isTexture){let y=w.backgroundBlurriness>0;E=e.get(E,y)}return E}function p(w){let E=!1,y=d(w);y===null?m(a,o):y&&y.isColor&&(m(y,1),E=!0);let T=n.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(w,E){let y=d(E);y&&(y.isCubeTexture||y.mapping===_a)?(l===void 0&&(l=new pt(new Wt(1,1,1),new Tn({name:"BackgroundCubeMaterial",uniforms:As(li.backgroundCube.uniforms),vertexShader:li.backgroundCube.vertexShader,fragmentShader:li.backgroundCube.fragmentShader,side:fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,b,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Dy.makeRotationFromEuler(E.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(pp),l.material.toneMapped=lt.getTransfer(y.colorSpace)!==gt,(u!==y||h!==y.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,u=y,h=y.version,f=n.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new pt(new ha(2,2),new Tn({name:"BackgroundMaterial",uniforms:As(li.background.uniforms),vertexShader:li.background.vertexShader,fragmentShader:li.background.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=lt.getTransfer(y.colorSpace)!==gt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||h!==y.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=y,h=y.version,f=n.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function m(w,E){w.getRGB(Qc,Ku(n)),t.buffers.color.setClear(Qc.r,Qc.g,Qc.b,E,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,E=1){a.set(w),o=E,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(w){o=w,m(a,o)},render:p,addToRenderList:x,dispose:g}}function Oy(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,a=!1;function o(I,O,U,q,R){let H=!1,z=h(I,q,U,O);r!==z&&(r=z,l(r.object)),H=d(I,q,U,R),H&&p(I,q,U,R),R!==null&&e.update(R,n.ELEMENT_ARRAY_BUFFER),(H||a)&&(a=!1,y(I,O,U,q),R!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(R).buffer))}function c(){return n.createVertexArray()}function l(I){return n.bindVertexArray(I)}function u(I){return n.deleteVertexArray(I)}function h(I,O,U,q){let R=q.wireframe===!0,H=i[O.id];H===void 0&&(H={},i[O.id]=H);let z=I.isInstancedMesh===!0?I.id:0,k=H[z];k===void 0&&(k={},H[z]=k);let $=k[U.id];$===void 0&&($={},k[U.id]=$);let se=$[R];return se===void 0&&(se=f(c()),$[R]=se),se}function f(I){let O=[],U=[],q=[];for(let R=0;R<t;R++)O[R]=0,U[R]=0,q[R]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:U,attributeDivisors:q,object:I,attributes:{},index:null}}function d(I,O,U,q){let R=r.attributes,H=O.attributes,z=0,k=U.getAttributes();for(let $ in k)if(k[$].location>=0){let ae=R[$],ee=H[$];if(ee===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor)),ae===void 0||ae.attribute!==ee||ee&&ae.data!==ee.data)return!0;z++}return r.attributesNum!==z||r.index!==q}function p(I,O,U,q){let R={},H=O.attributes,z=0,k=U.getAttributes();for(let $ in k)if(k[$].location>=0){let ae=H[$];ae===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(ae=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(ae=I.instanceColor));let ee={};ee.attribute=ae,ae&&ae.data&&(ee.data=ae.data),R[$]=ee,z++}r.attributes=R,r.attributesNum=z,r.index=q}function x(){let I=r.newAttributes;for(let O=0,U=I.length;O<U;O++)I[O]=0}function m(I){g(I,0)}function g(I,O){let U=r.newAttributes,q=r.enabledAttributes,R=r.attributeDivisors;U[I]=1,q[I]===0&&(n.enableVertexAttribArray(I),q[I]=1),R[I]!==O&&(n.vertexAttribDivisor(I,O),R[I]=O)}function w(){let I=r.newAttributes,O=r.enabledAttributes;for(let U=0,q=O.length;U<q;U++)O[U]!==I[U]&&(n.disableVertexAttribArray(U),O[U]=0)}function E(I,O,U,q,R,H,z){z===!0?n.vertexAttribIPointer(I,O,U,R,H):n.vertexAttribPointer(I,O,U,q,R,H)}function y(I,O,U,q){x();let R=q.attributes,H=U.getAttributes(),z=O.defaultAttributeValues;for(let k in H){let $=H[k];if($.location>=0){let se=R[k];if(se===void 0&&(k==="instanceMatrix"&&I.instanceMatrix&&(se=I.instanceMatrix),k==="instanceColor"&&I.instanceColor&&(se=I.instanceColor)),se!==void 0){let ae=se.normalized,ee=se.itemSize,we=e.get(se);if(we===void 0)continue;let Ke=we.buffer,We=we.type,K=we.bytesPerElement,ue=We===n.INT||We===n.UNSIGNED_INT||se.gpuType===pc;if(se.isInterleavedBufferAttribute){let ne=se.data,Ie=ne.stride,Xe=se.offset;if(ne.isInstancedInterleavedBuffer){for(let ze=0;ze<$.locationSize;ze++)g($.location+ze,ne.meshPerAttribute);I.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let ze=0;ze<$.locationSize;ze++)m($.location+ze);n.bindBuffer(n.ARRAY_BUFFER,Ke);for(let ze=0;ze<$.locationSize;ze++)E($.location+ze,ee/$.locationSize,We,ae,Ie*K,(Xe+ee/$.locationSize*ze)*K,ue)}else{if(se.isInstancedBufferAttribute){for(let ne=0;ne<$.locationSize;ne++)g($.location+ne,se.meshPerAttribute);I.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let ne=0;ne<$.locationSize;ne++)m($.location+ne);n.bindBuffer(n.ARRAY_BUFFER,Ke);for(let ne=0;ne<$.locationSize;ne++)E($.location+ne,ee/$.locationSize,We,ae,ee*K,ee/$.locationSize*ne*K,ue)}}else if(z!==void 0){let ae=z[k];if(ae!==void 0)switch(ae.length){case 2:n.vertexAttrib2fv($.location,ae);break;case 3:n.vertexAttrib3fv($.location,ae);break;case 4:n.vertexAttrib4fv($.location,ae);break;default:n.vertexAttrib1fv($.location,ae)}}}}w()}function T(){S();for(let I in i){let O=i[I];for(let U in O){let q=O[U];for(let R in q){let H=q[R];for(let z in H)u(H[z].object),delete H[z];delete q[R]}}delete i[I]}}function b(I){if(i[I.id]===void 0)return;let O=i[I.id];for(let U in O){let q=O[U];for(let R in q){let H=q[R];for(let z in H)u(H[z].object),delete H[z];delete q[R]}}delete i[I.id]}function C(I){for(let O in i){let U=i[O];for(let q in U){let R=U[q];if(R[I.id]===void 0)continue;let H=R[I.id];for(let z in H)u(H[z].object),delete H[z];delete R[I.id]}}}function v(I){for(let O in i){let U=i[O],q=I.isInstancedMesh===!0?I.id:0,R=U[q];if(R!==void 0){for(let H in R){let z=R[H];for(let k in z)u(z[k].object),delete z[k];delete R[H]}delete U[q],Object.keys(U).length===0&&delete i[O]}}}function S(){P(),a=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:S,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:b,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:w}}function Ny(n,e,t){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function a(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function o(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let f=0;for(let d=0;d<u;d++)f+=l[d];t.update(f,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Fy(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==gn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let v=C===oi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==on&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Yn&&!v)}function c(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(He("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:y,maxSamples:T,samples:b}}function Uy(n){let e=this,t=null,i=0,s=!1,r=!1,a=new Fn,o=new Ze,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||s;return s=f,i=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let p=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,g=n.get(h);if(!s||p===null||p.length===0||r&&!m)r?u(null):l();else{let w=r?0:i,E=w*4,y=g.clippingState||null;c.value=y,y=u(p,f,E,d);for(let T=0;T!==E;++T)y[T]=t[T];g.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,p){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,p!==!0||m===null){let g=d+x*4,w=f.matrixWorldInverse;o.getNormalMatrix(w),(m===null||m.length<g)&&(m=new Float32Array(g));for(let E=0,y=d;E!==x;++E,y+=4)a.copy(h[E]).applyMatrix4(w,o),a.normal.toArray(m,y),m[y+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var Ki=4,Xf=[.125,.215,.35,.446,.526,.582],Cs=20,By=256,Aa=new lr,qf=new je,th=null,nh=0,ih=0,sh=!1,ky=new D,tl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=ky}=r;th=this._renderer.getRenderTarget(),nh=this._renderer.getActiveCubeFace(),ih=this._renderer.getActiveMipmapLevel(),sh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=jf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$f(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(th,nh,ih),this._renderer.xr.enabled=sh,e.scissorTest=!1,gr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===$i||e.mapping===ws?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),th=this._renderer.getRenderTarget(),nh=this._renderer.getActiveCubeFace(),ih=this._renderer.getActiveMipmapLevel(),sh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Gt,minFilter:Gt,generateMipmaps:!1,type:oi,format:gn,colorSpace:$r,depthBuffer:!1},s=Yf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Yf(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=zy(r)),this._blurMaterial=Vy(r,e,t),this._ggxMaterial=Hy(r,e,t)}return s}_compileMaterial(e){let t=new pt(new tn,e);this._renderer.compile(t,Aa)}_sceneToCubeUV(e,t,i,s,r){let c=new en(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(qf),h.toneMapping=Rn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pt(new Wt,new En({name:"PMREM.Background",side:fn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,g=!1,w=e.background;w?w.isColor&&(m.color.copy(w),e.background=null,g=!0):(m.color.copy(qf),g=!0);for(let E=0;E<6;E++){let y=E%3;y===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[E],r.y,r.z)):y===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[E]));let T=this._cubeSize;gr(s,y*T,E>2?T:0,T,T),h.setRenderTarget(s),g&&h.render(x,c),h.render(e,c)}h.toneMapping=d,h.autoClear=f,e.background=w}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===$i||e.mapping===ws;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=jf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$f());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;gr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(a,Aa)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let c=a.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-u*u),f=0+l*1.25,d=h*f,{_lodMax:p}=this,x=this._sizeLods[i],m=3*x*(i>p-Ki?i-p+Ki:0),g=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=p-t,gr(r,m,g,3*x,2*x),s.setRenderTarget(r),s.render(o,Aa),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=p-i,gr(e,m,g,3*x,2*x),s.setRenderTarget(e),s.render(o,Aa)}_blur(e,t,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Ge("blur direction must be either latitudinal or longitudinal!");let u=3,h=this._lodMeshes[s];h.material=l;let f=l.uniforms,d=this._sizeLods[i]-1,p=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Cs-1),x=r/p,m=isFinite(r)?1+Math.floor(u*x):Cs;m>Cs&&He(\`sigmaRadians, \${r}, is too large and will clip, as it requested \${m} samples when the maximum is set to \${Cs}\`);let g=[],w=0;for(let C=0;C<Cs;++C){let v=C/x,S=Math.exp(-v*v/2);g.push(S),C===0?w+=S:C<m&&(w+=2*S)}for(let C=0;C<g.length;C++)g[C]=g[C]/w;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=g,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:E}=this;f.dTheta.value=p,f.mipInt.value=E-i;let y=this._sizeLods[s],T=3*y*(s>E-Ki?s-E+Ki:0),b=4*(this._cubeSize-y);gr(t,T,b,3*y,2*y),c.setRenderTarget(t),c.render(h,Aa)}};function zy(n){let e=[],t=[],i=[],s=n,r=n-Ki+1+Xf.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>n-Ki?c=Xf[a-n+Ki-1]:a===0&&(c=0),t.push(c);let l=1/(o-2),u=-l,h=1+l,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,p=6,x=3,m=2,g=1,w=new Float32Array(x*p*d),E=new Float32Array(m*p*d),y=new Float32Array(g*p*d);for(let b=0;b<d;b++){let C=b%3*2/3-1,v=b>2?0:-1,S=[C,v,0,C+2/3,v,0,C+2/3,v+1,0,C,v,0,C+2/3,v+1,0,C,v+1,0];w.set(S,x*p*b),E.set(f,m*p*b);let P=[b,b,b,b,b,b];y.set(P,g*p*b)}let T=new tn;T.setAttribute("position",new hn(w,x)),T.setAttribute("uv",new hn(E,m)),T.setAttribute("faceIndex",new hn(y,g)),i.push(new pt(T,null)),s>Ki&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Yf(n,e,t){let i=new Sn(n,e,t);return i.texture.mapping=_a,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function gr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Hy(n,e,t){return new Tn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:By,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:sl(),fragmentShader:\`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		\`,blending:ri,depthTest:!1,depthWrite:!1})}function Vy(n,e,t){let i=new Float32Array(Cs),s=new D(0,1,0);return new Tn({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sl(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		\`,blending:ri,depthTest:!1,depthWrite:!1})}function $f(){return new Tn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		\`,blending:ri,depthTest:!1,depthWrite:!1})}function jf(){return new Tn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		\`,blending:ri,depthTest:!1,depthWrite:!1})}function sl(){return\`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	\`}var nl=class extends Sn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new ta(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:\`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			\`,fragmentShader:\`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			\`},s=new Wt(5,5,5),r=new Tn({name:"CubemapFromEquirect",uniforms:As(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:fn,blending:ri});r.uniforms.tEquirect.value=t;let a=new pt(s,r),o=t.minFilter;return t.minFilter===ai&&(t.minFilter=Gt),new lc(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function Gy(n){let e=new WeakMap,t=new WeakMap,i=null;function s(f,d=!1){return f==null?null:d?a(f):r(f)}function r(f){if(f&&f.isTexture){let d=f.mapping;if(d===hc||d===dc)if(e.has(f)){let p=e.get(f).texture;return o(p,f.mapping)}else{let p=f.image;if(p&&p.height>0){let x=new nl(p.height);return x.fromEquirectangularTexture(n,f),e.set(f,x),f.addEventListener("dispose",l),o(x.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){let d=f.mapping,p=d===hc||d===dc,x=d===$i||d===ws;if(p||x){let m=t.get(f),g=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return i===null&&(i=new tl(n)),m=p?i.fromEquirectangular(f,m):i.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let w=f.image;return p&&w&&w.height>0||x&&w&&c(w)?(i===null&&(i=new tl(n)),m=p?i.fromEquirectangular(f):i.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function o(f,d){return d===hc?f.mapping=$i:d===dc&&(f.mapping=ws),f}function c(f){let d=0,p=6;for(let x=0;x<p;x++)f[x]!==void 0&&d++;return d===p}function l(f){let d=f.target;d.removeEventListener("dispose",l);let p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function u(f){let d=f.target;d.removeEventListener("dispose",u);let p=t.get(d);p!==void 0&&(t.delete(d),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:h}}function Wy(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&ms("WebGLRenderer: "+i+" extension not supported."),s}}}function Xy(n,e,t,i){let s={},r=new WeakMap;function a(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let p in f.attributes)e.remove(f.attributes[p]);f.removeEventListener("dispose",a),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function c(h){let f=h.attributes;for(let d in f)e.update(f[d],n.ARRAY_BUFFER)}function l(h){let f=[],d=h.index,p=h.attributes.position,x=0;if(p===void 0)return;if(d!==null){let w=d.array;x=d.version;for(let E=0,y=w.length;E<y;E+=3){let T=w[E+0],b=w[E+1],C=w[E+2];f.push(T,b,b,C,C,T)}}else{let w=p.array;x=p.version;for(let E=0,y=w.length/3-1;E<y;E+=3){let T=E+0,b=E+1,C=E+2;f.push(T,b,b,C,C,T)}}let m=new(p.count>=65535?ea:Qr)(f,1);m.version=x;let g=r.get(h);g&&e.remove(g),r.set(h,m)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&l(h)}else l(h);return r.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function qy(n,e,t){let i;function s(h){i=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function c(h,f){n.drawElements(i,f,r,h*a),t.update(f,i,1)}function l(h,f,d){d!==0&&(n.drawElementsInstanced(i,f,r,h*a,d),t.update(f,i,d))}function u(h,f,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,h,0,d);let x=0;for(let m=0;m<d;m++)x+=f[m];t.update(x,i,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Yy(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:Ge("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function $y(n,e,t){let i=new WeakMap,s=new Pt;function r(a,o,c){let l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,f=i.get(o);if(f===void 0||f.count!==h){let S=function(){C.dispose(),i.delete(o),o.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let d=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],E=0;d===!0&&(E=1),p===!0&&(E=2),x===!0&&(E=3);let y=o.attributes.position.count*E,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let b=new Float32Array(y*T*4*h),C=new Kr(b,y,T,h);C.type=Yn,C.needsUpdate=!0;let v=E*4;for(let P=0;P<h;P++){let I=m[P],O=g[P],U=w[P],q=y*T*4*P;for(let R=0;R<I.count;R++){let H=R*v;d===!0&&(s.fromBufferAttribute(I,R),b[q+H+0]=s.x,b[q+H+1]=s.y,b[q+H+2]=s.z,b[q+H+3]=0),p===!0&&(s.fromBufferAttribute(O,R),b[q+H+4]=s.x,b[q+H+5]=s.y,b[q+H+6]=s.z,b[q+H+7]=0),x===!0&&(s.fromBufferAttribute(U,R),b[q+H+8]=s.x,b[q+H+9]=s.y,b[q+H+10]=s.z,b[q+H+11]=U.itemSize===4?s.w:1)}}f={count:h,texture:C,size:new ce(y,T)},i.set(o,f),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let d=0;for(let x=0;x<l.length;x++)d+=l[x];let p=o.morphTargetsRelative?1:1-d;c.getUniforms().setValue(n,"morphTargetBaseInfluence",p),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function jy(n,e,t,i,s){let r=new WeakMap;function a(l){let u=s.render.frame,h=l.geometry,f=e.get(l,h);if(r.get(f)!==u&&(e.update(f),r.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return f}function o(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var Zy={[Lu]:"LINEAR_TONE_MAPPING",[Ou]:"REINHARD_TONE_MAPPING",[Nu]:"CINEON_TONE_MAPPING",[fr]:"ACES_FILMIC_TONE_MAPPING",[Uu]:"AGX_TONE_MAPPING",[Bu]:"NEUTRAL_TONE_MAPPING",[Fu]:"CUSTOM_TONE_MAPPING"};function Ky(n,e,t,i,s,r){let a=new Sn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new _i(e,t):void 0}),o=new Sn(e,t,{type:oi,depthBuffer:!1,stencilBuffer:!1}),c=new tn;c.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new bt([0,2,0,0,2,0],2));let l=new jo({uniforms:{tDiffuse:{value:null}},vertexShader:\`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}\`,fragmentShader:\`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}\`,depthTest:!1,depthWrite:!1}),u=new pt(c,l),h=new lr(-1,1,1,-1,0,1),f=null,d=null,p=!1,x,m=null,g=[],w=!1;this.setSize=function(E,y){a.setSize(E,y),o.setSize(E,y);for(let T=0;T<g.length;T++){let b=g[T];b.setSize&&b.setSize(E,y)}},this.setEffects=function(E){g=E,w=g.length>0&&g[0].isRenderPass===!0;let y=a.width,T=a.height;for(let b=0;b<g.length;b++){let C=g[b];C.setSize&&C.setSize(y,T)}},this.begin=function(E,y){if(p||E.toneMapping===Rn&&g.length===0)return!1;if(m=y,y!==null){let T=y.width,b=y.height;(a.width!==T||a.height!==b)&&this.setSize(T,b)}return w===!1&&E.setRenderTarget(a),x=E.toneMapping,E.toneMapping=Rn,!0},this.hasRenderPass=function(){return w},this.end=function(E,y){E.toneMapping=x,p=!0;let T=a,b=o;for(let C=0;C<g.length;C++){let v=g[C];if(v.enabled!==!1&&(v.render(E,b,T,y),v.needsSwap!==!1)){let S=T;T=b,b=S}}if(f!==E.outputColorSpace||d!==E.toneMapping){f=E.outputColorSpace,d=E.toneMapping,l.defines={},lt.getTransfer(f)===gt&&(l.defines.SRGB_TRANSFER="");let C=Zy[d];C&&(l.defines[C]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,E.setRenderTarget(m),E.render(u,h),m=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}var mp=new mn,oh=new _i(1,1),gp=new Kr,xp=new Ho,vp=new ta,Zf=[],Kf=[],Jf=new Float32Array(16),Qf=new Float32Array(9),ep=new Float32Array(4);function vr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Zf[s];if(r===void 0&&(r=new Float32Array(s),Zf[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function rl(n,e){let t=Kf[e];t===void 0&&(t=new Int32Array(e),Kf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Jy(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Qy(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function eb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function tb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function nb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;ep.set(i),n.uniformMatrix2fv(this.addr,!1,ep),qt(t,i)}}function ib(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Qf.set(i),n.uniformMatrix3fv(this.addr,!1,Qf),qt(t,i)}}function sb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Jf.set(i),n.uniformMatrix4fv(this.addr,!1,Jf),qt(t,i)}}function rb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function ab(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function ob(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function cb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function lb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function ub(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function hb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function db(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function fb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(oh.compareFunction=t.isReversedDepthBuffer()?Jc:Kc,r=oh):r=mp,t.setTexture2D(e||r,s)}function pb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||xp,s)}function mb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||vp,s)}function gb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||gp,s)}function xb(n){switch(n){case 5126:return Jy;case 35664:return Qy;case 35665:return eb;case 35666:return tb;case 35674:return nb;case 35675:return ib;case 35676:return sb;case 5124:case 35670:return rb;case 35667:case 35671:return ab;case 35668:case 35672:return ob;case 35669:case 35673:return cb;case 5125:return lb;case 36294:return ub;case 36295:return hb;case 36296:return db;case 35678:case 36198:case 36298:case 36306:case 35682:return fb;case 35679:case 36299:case 36307:return pb;case 35680:case 36300:case 36308:case 36293:return mb;case 36289:case 36303:case 36311:case 36292:return gb}}function vb(n,e){n.uniform1fv(this.addr,e)}function _b(n,e){let t=vr(e,this.size,2);n.uniform2fv(this.addr,t)}function yb(n,e){let t=vr(e,this.size,3);n.uniform3fv(this.addr,t)}function bb(n,e){let t=vr(e,this.size,4);n.uniform4fv(this.addr,t)}function Mb(n,e){let t=vr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Sb(n,e){let t=vr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Eb(n,e){let t=vr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function wb(n,e){n.uniform1iv(this.addr,e)}function Tb(n,e){n.uniform2iv(this.addr,e)}function Ab(n,e){n.uniform3iv(this.addr,e)}function Cb(n,e){n.uniform4iv(this.addr,e)}function Rb(n,e){n.uniform1uiv(this.addr,e)}function Ib(n,e){n.uniform2uiv(this.addr,e)}function Pb(n,e){n.uniform3uiv(this.addr,e)}function Db(n,e){n.uniform4uiv(this.addr,e)}function Lb(n,e,t){let i=this.cache,s=e.length,r=rl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=oh:a=mp;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Ob(n,e,t){let i=this.cache,s=e.length,r=rl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||xp,r[a])}function Nb(n,e,t){let i=this.cache,s=e.length,r=rl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||vp,r[a])}function Fb(n,e,t){let i=this.cache,s=e.length,r=rl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||gp,r[a])}function Ub(n){switch(n){case 5126:return vb;case 35664:return _b;case 35665:return yb;case 35666:return bb;case 35674:return Mb;case 35675:return Sb;case 35676:return Eb;case 5124:case 35670:return wb;case 35667:case 35671:return Tb;case 35668:case 35672:return Ab;case 35669:case 35673:return Cb;case 5125:return Rb;case 36294:return Ib;case 36295:return Pb;case 36296:return Db;case 35678:case 36198:case 36298:case 36306:case 35682:return Lb;case 35679:case 36299:case 36307:return Ob;case 35680:case 36300:case 36308:case 36293:return Nb;case 36289:case 36303:case 36311:case 36292:return Fb}}var ch=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=xb(t.type)}},lh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ub(t.type)}},uh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},rh=/(\\w+)(\\])?(\\[|\\.)?/g;function tp(n,e){n.seq.push(e),n.map[e.id]=e}function Bb(n,e,t){let i=n.name,s=i.length;for(rh.lastIndex=0;;){let r=rh.exec(i),a=rh.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){tp(t,l===void 0?new ch(o,n,e):new lh(o,n,e));break}else{let h=t.map[o];h===void 0&&(h=new uh(o),tp(t,h)),t=h}}}var xr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Bb(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function np(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var kb=37297,zb=0;function Hb(n,e){let t=n.split(\`
\`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(\`\${o===e?">":" "} \${o}: \${t[a]}\`)}return i.join(\`
\`)}var ip=new Ze;function Vb(n){lt._getMatrix(ip,lt.workingColorSpace,n);let e=\`mat3( \${ip.elements.map(t=>t.toFixed(4))} )\`;switch(lt.getTransfer(n)){case jr:return[e,"LinearTransferOETF"];case gt:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function sp(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+\`

\`+r+\`

\`+Hb(n.getShaderSource(e),o)}else return r}function Gb(n,e){let t=Vb(e);return[\`vec4 \${n}( vec4 value ) {\`,\`	return \${t[1]}( vec4( value.rgb * \${t[0]}, value.a ) );\`,"}"].join(\`
\`)}var Wb={[Lu]:"Linear",[Ou]:"Reinhard",[Nu]:"Cineon",[fr]:"ACESFilmic",[Uu]:"AgX",[Bu]:"Neutral",[Fu]:"Custom"};function Xb(n,e){let t=Wb[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var el=new D;function qb(){lt.getLuminanceCoefficients(el);let n=el.x.toFixed(4),e=el.y.toFixed(4),t=el.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",\`	const vec3 weights = vec3( \${n}, \${e}, \${t} );\`,"	return dot( weights, rgb );","}"].join(\`
\`)}function Yb(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ra).join(\`
\`)}function $b(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(\`
\`)}function jb(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Ra(n){return n!==""}function rp(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ap(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Zb=/^[ \\t]*#include +<([\\w\\d./]+)>/gm;function hh(n){return n.replace(Zb,Jb)}var Kb=new Map;function Jb(n,e){let t=st[e];if(t===void 0){let i=Kb.get(e);if(i!==void 0)t=st[i],He('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return hh(t)}var Qb=/#pragma unroll_loop_start\\s+for\\s*\\(\\s*int\\s+i\\s*=\\s*(\\d+)\\s*;\\s*i\\s*<\\s*(\\d+)\\s*;\\s*i\\s*\\+\\+\\s*\\)\\s*{([\\s\\S]+?)}\\s+#pragma unroll_loop_end/g;function op(n){return n.replace(Qb,eM)}function eM(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\\[\\s*i\\s*\\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function cp(n){let e=\`precision \${n.precision} float;
	precision \${n.precision} int;
	precision \${n.precision} sampler2D;
	precision \${n.precision} samplerCube;
	precision \${n.precision} sampler3D;
	precision \${n.precision} sampler2DArray;
	precision \${n.precision} sampler2DShadow;
	precision \${n.precision} samplerCubeShadow;
	precision \${n.precision} sampler2DArrayShadow;
	precision \${n.precision} isampler2D;
	precision \${n.precision} isampler3D;
	precision \${n.precision} isamplerCube;
	precision \${n.precision} isampler2DArray;
	precision \${n.precision} usampler2D;
	precision \${n.precision} usampler3D;
	precision \${n.precision} usamplerCube;
	precision \${n.precision} usampler2DArray;
	\`;return n.precision==="highp"?e+=\`
#define HIGH_PRECISION\`:n.precision==="mediump"?e+=\`
#define MEDIUM_PRECISION\`:n.precision==="lowp"&&(e+=\`
#define LOW_PRECISION\`),e}var tM={[Es]:"SHADOWMAP_TYPE_PCF",[dr]:"SHADOWMAP_TYPE_VSM"};function nM(n){return tM[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var iM={[$i]:"ENVMAP_TYPE_CUBE",[ws]:"ENVMAP_TYPE_CUBE",[_a]:"ENVMAP_TYPE_CUBE_UV"};function sM(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":iM[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var rM={[ws]:"ENVMAP_MODE_REFRACTION"};function aM(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":rM[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var oM={[Du]:"ENVMAP_BLENDING_MULTIPLY",[Sf]:"ENVMAP_BLENDING_MIX",[Ef]:"ENVMAP_BLENDING_ADD"};function cM(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":oM[n.combine]||"ENVMAP_BLENDING_NONE"}function lM(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function uM(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=nM(t),l=sM(t),u=aM(t),h=cM(t),f=lM(t),d=Yb(t),p=$b(r),x=s.createProgram(),m,g,w=t.glslVersion?"#version "+t.glslVersion+\`
\`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ra).join(\`
\`),m.length>0&&(m+=\`
\`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ra).join(\`
\`),g.length>0&&(g+=\`
\`)):(m=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",\`
\`].filter(Ra).join(\`
\`),g=[cp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Rn?"#define TONE_MAPPING":"",t.toneMapping!==Rn?st.tonemapping_pars_fragment:"",t.toneMapping!==Rn?Xb("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,Gb("linearToOutputTexel",t.outputColorSpace),qb(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",\`
\`].filter(Ra).join(\`
\`)),a=hh(a),a=rp(a,t),a=ap(a,t),o=hh(o),o=rp(o,t),o=ap(o,t),a=op(a),o=op(o),t.isRawShaderMaterial!==!0&&(w=\`#version 300 es
\`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(\`
\`)+\`
\`+m,g=["#define varying in",t.glslVersion===Yu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(\`
\`)+\`
\`+g);let E=w+m+a,y=w+g+o,T=np(s,s.VERTEX_SHADER,E),b=np(s,s.FRAGMENT_SHADER,y);s.attachShader(x,T),s.attachShader(x,b),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(I){if(n.debug.checkShaderErrors){let O=s.getProgramInfoLog(x)||"",U=s.getShaderInfoLog(T)||"",q=s.getShaderInfoLog(b)||"",R=O.trim(),H=U.trim(),z=q.trim(),k=!0,$=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(k=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,T,b);else{let se=sp(s,T,"vertex"),ae=sp(s,b,"fragment");Ge("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+\`

Material Name: \`+I.name+\`
Material Type: \`+I.type+\`

Program Info Log: \`+R+\`
\`+se+\`
\`+ae)}else R!==""?He("WebGLProgram: Program Info Log:",R):(H===""||z==="")&&($=!1);$&&(I.diagnostics={runnable:k,programLog:R,vertexShader:{log:H,prefix:m},fragmentShader:{log:z,prefix:g}})}s.deleteShader(T),s.deleteShader(b),v=new xr(s,x),S=jb(s,x)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(x,kb)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=zb++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=b,this}var hM=0,dh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new fh(e),t.set(e,i)),i}},fh=class{constructor(e){this.id=hM++,this.code=e,this.usedTimes=0}};function dM(n){return n===Zi||n===wa||n===Ta}function fM(n,e,t,i,s,r){let a=new tr,o=new dh,c=new Set,l=[],u=new Map,h=i.logarithmicDepthBuffer,f=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return c.add(v),v===0?"uv":\`uv\${v}\`}function x(v,S,P,I,O,U){let q=I.fog,R=O.geometry,H=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,z=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,k=e.get(v.envMap||H,z),$=k&&k.mapping===_a?k.image.height:null,se=d[v.type];v.precision!==null&&(f=i.getMaxPrecision(v.precision),f!==v.precision&&He("WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));let ae=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,ee=ae!==void 0?ae.length:0,we=0;R.morphAttributes.position!==void 0&&(we=1),R.morphAttributes.normal!==void 0&&(we=2),R.morphAttributes.color!==void 0&&(we=3);let Ke,We,K,ue;if(se){let Pe=li[se];Ke=Pe.vertexShader,We=Pe.fragmentShader}else{Ke=v.vertexShader,We=v.fragmentShader;let Pe=o.getVertexShaderStage(v),At=o.getFragmentShaderStage(v);o.update(v,Pe,At),K=Pe.id,ue=At.id}let ne=n.getRenderTarget(),Ie=n.state.buffers.depth.getReversed(),Xe=O.isInstancedMesh===!0,ze=O.isBatchedMesh===!0,dt=!!v.map,Ye=!!v.matcap,ie=!!k,oe=!!v.aoMap,re=!!v.lightMap,ge=!!v.bumpMap&&v.wireframe===!1,ve=!!v.normalMap,Re=!!v.displacementMap,Le=!!v.emissiveMap,qe=!!v.metalnessMap,$e=!!v.roughnessMap,L=v.anisotropy>0,mt=v.clearcoat>0,it=v.dispersion>0,A=v.iridescence>0,_=v.sheen>0,B=v.transmission>0,V=L&&!!v.anisotropyMap,j=mt&&!!v.clearcoatMap,le=mt&&!!v.clearcoatNormalMap,he=mt&&!!v.clearcoatRoughnessMap,Z=A&&!!v.iridescenceMap,J=A&&!!v.iridescenceThicknessMap,pe=_&&!!v.sheenColorMap,De=_&&!!v.sheenRoughnessMap,_e=!!v.specularMap,de=!!v.specularColorMap,Be=!!v.specularIntensityMap,Ve=B&&!!v.transmissionMap,Je=B&&!!v.thicknessMap,N=!!v.gradientMap,fe=!!v.alphaMap,Q=v.alphaTest>0,me=!!v.alphaHash,Me=!!v.extensions,te=Rn;v.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(te=n.toneMapping);let Ae={shaderID:se,shaderType:v.type,shaderName:v.name,vertexShader:Ke,fragmentShader:We,defines:v.defines,customVertexShaderID:K,customFragmentShaderID:ue,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:ze,batchingColor:ze&&O._colorsTexture!==null,instancing:Xe,instancingColor:Xe&&O.instanceColor!==null,instancingMorph:Xe&&O.morphTexture!==null,outputColorSpace:ne===null?n.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:lt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:dt,matcap:Ye,envMap:ie,envMapMode:ie&&k.mapping,envMapCubeUVHeight:$,aoMap:oe,lightMap:re,bumpMap:ge,normalMap:ve,displacementMap:Re,emissiveMap:Le,normalMapObjectSpace:ve&&v.normalMapType===Af,normalMapTangentSpace:ve&&v.normalMapType===Zc,packedNormalMap:ve&&v.normalMapType===Zc&&dM(v.normalMap.format),metalnessMap:qe,roughnessMap:$e,anisotropy:L,anisotropyMap:V,clearcoat:mt,clearcoatMap:j,clearcoatNormalMap:le,clearcoatRoughnessMap:he,dispersion:it,iridescence:A,iridescenceMap:Z,iridescenceThicknessMap:J,sheen:_,sheenColorMap:pe,sheenRoughnessMap:De,specularMap:_e,specularColorMap:de,specularIntensityMap:Be,transmission:B,transmissionMap:Ve,thicknessMap:Je,gradientMap:N,opaque:v.transparent===!1&&v.blending===gs&&v.alphaToCoverage===!1,alphaMap:fe,alphaTest:Q,alphaHash:me,combine:v.combine,mapUv:dt&&p(v.map.channel),aoMapUv:oe&&p(v.aoMap.channel),lightMapUv:re&&p(v.lightMap.channel),bumpMapUv:ge&&p(v.bumpMap.channel),normalMapUv:ve&&p(v.normalMap.channel),displacementMapUv:Re&&p(v.displacementMap.channel),emissiveMapUv:Le&&p(v.emissiveMap.channel),metalnessMapUv:qe&&p(v.metalnessMap.channel),roughnessMapUv:$e&&p(v.roughnessMap.channel),anisotropyMapUv:V&&p(v.anisotropyMap.channel),clearcoatMapUv:j&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:le&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:J&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:pe&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:De&&p(v.sheenRoughnessMap.channel),specularMapUv:_e&&p(v.specularMap.channel),specularColorMapUv:de&&p(v.specularColorMap.channel),specularIntensityMapUv:Be&&p(v.specularIntensityMap.channel),transmissionMapUv:Ve&&p(v.transmissionMap.channel),thicknessMapUv:Je&&p(v.thicknessMap.channel),alphaMapUv:fe&&p(v.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(ve||L),vertexNormals:!!R.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!R.attributes.uv&&(dt||fe),fog:!!q,useFog:v.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||R.attributes.normal===void 0&&ve===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ie,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:we,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:U.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:te,decodeVideoTexture:dt&&v.map.isVideoTexture===!0&&lt.getTransfer(v.map.colorSpace)===gt,decodeVideoTextureEmissive:Le&&v.emissiveMap.isVideoTexture===!0&&lt.getTransfer(v.emissiveMap.colorSpace)===gt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===nn,flipSided:v.side===fn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Me&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Me&&v.extensions.multiDraw===!0||ze)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Ae.vertexUv1s=c.has(1),Ae.vertexUv2s=c.has(2),Ae.vertexUv3s=c.has(3),c.clear(),Ae}function m(v){let S=[];if(v.shaderID?S.push(v.shaderID):(S.push(v.customVertexShaderID),S.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)S.push(P),S.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(g(S,v),w(S,v),S.push(n.outputColorSpace)),S.push(v.customProgramCacheKey),S.join()}function g(v,S){v.push(S.precision),v.push(S.outputColorSpace),v.push(S.envMapMode),v.push(S.envMapCubeUVHeight),v.push(S.mapUv),v.push(S.alphaMapUv),v.push(S.lightMapUv),v.push(S.aoMapUv),v.push(S.bumpMapUv),v.push(S.normalMapUv),v.push(S.displacementMapUv),v.push(S.emissiveMapUv),v.push(S.metalnessMapUv),v.push(S.roughnessMapUv),v.push(S.anisotropyMapUv),v.push(S.clearcoatMapUv),v.push(S.clearcoatNormalMapUv),v.push(S.clearcoatRoughnessMapUv),v.push(S.iridescenceMapUv),v.push(S.iridescenceThicknessMapUv),v.push(S.sheenColorMapUv),v.push(S.sheenRoughnessMapUv),v.push(S.specularMapUv),v.push(S.specularColorMapUv),v.push(S.specularIntensityMapUv),v.push(S.transmissionMapUv),v.push(S.thicknessMapUv),v.push(S.combine),v.push(S.fogExp2),v.push(S.sizeAttenuation),v.push(S.morphTargetsCount),v.push(S.morphAttributeCount),v.push(S.numDirLights),v.push(S.numPointLights),v.push(S.numSpotLights),v.push(S.numSpotLightMaps),v.push(S.numHemiLights),v.push(S.numRectAreaLights),v.push(S.numDirLightShadows),v.push(S.numPointLightShadows),v.push(S.numSpotLightShadows),v.push(S.numSpotLightShadowsWithMaps),v.push(S.numLightProbes),v.push(S.shadowMapType),v.push(S.toneMapping),v.push(S.numClippingPlanes),v.push(S.numClipIntersection),v.push(S.depthPacking)}function w(v,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function E(v){let S=d[v.type],P;if(S){let I=li[S];P=Gf.clone(I.uniforms)}else P=v.uniforms;return P}function y(v,S){let P=u.get(S);return P!==void 0?++P.usedTimes:(P=new uM(n,S,v,s),l.push(P),u.set(S,P)),P}function T(v){if(--v.usedTimes===0){let S=l.indexOf(v);l[S]=l[l.length-1],l.pop(),u.delete(v.cacheKey),v.destroy()}}function b(v){o.remove(v)}function C(){o.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:E,acquireProgram:y,releaseProgram:T,releaseShaderCache:b,programs:l,dispose:C}}function pM(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,c){n.get(a)[o]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function mM(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function lp(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function up(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(f){let d=0;return f.isInstancedMesh&&(d+=2),f.isSkinnedMesh&&(d+=1),d}function o(f,d,p,x,m,g){let w=n[e];return w===void 0?(w={id:f.id,object:f,geometry:d,material:p,materialVariant:a(f),groupOrder:x,renderOrder:f.renderOrder,z:m,group:g},n[e]=w):(w.id=f.id,w.object=f,w.geometry=d,w.material=p,w.materialVariant=a(f),w.groupOrder=x,w.renderOrder=f.renderOrder,w.z=m,w.group=g),e++,w}function c(f,d,p,x,m,g){let w=o(f,d,p,x,m,g);p.transmission>0?i.push(w):p.transparent===!0?s.push(w):t.push(w)}function l(f,d,p,x,m,g){let w=o(f,d,p,x,m,g);p.transmission>0?i.unshift(w):p.transparent===!0?s.unshift(w):t.unshift(w)}function u(f,d,p){t.length>1&&t.sort(f||mM),i.length>1&&i.sort(d||lp),s.length>1&&s.sort(d||lp),p&&(t.reverse(),i.reverse(),s.reverse())}function h(){for(let f=e,d=n.length;f<d;f++){let p=n[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:h,sort:u}}function gM(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new up,n.set(i,[a])):s>=r.length?(a=new up,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function xM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new je};break;case"SpotLight":t={position:new D,direction:new D,color:new je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new je,groundColor:new je};break;case"RectAreaLight":t={color:new je,position:new D,halfWidth:new D,halfHeight:new D};break}return n[e.id]=t,t}}}function vM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var _M=0;function yM(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function bM(n){let e=new xM,t=vM(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);let s=new D,r=new It,a=new It;function o(l){let u=0,h=0,f=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let d=0,p=0,x=0,m=0,g=0,w=0,E=0,y=0,T=0,b=0,C=0;l.sort(yM);for(let S=0,P=l.length;S<P;S++){let I=l[S],O=I.color,U=I.intensity,q=I.distance,R=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Zi?R=I.shadow.map.texture:R=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=O.r*U,h+=O.g*U,f+=O.b*U;else if(I.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(I.sh.coefficients[H],U);C++}else if(I.isDirectionalLight){let H=e.get(I);if(H.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let z=I.shadow,k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,i.directionalShadow[d]=k,i.directionalShadowMap[d]=R,i.directionalShadowMatrix[d]=I.shadow.matrix,w++}i.directional[d]=H,d++}else if(I.isSpotLight){let H=e.get(I);H.position.setFromMatrixPosition(I.matrixWorld),H.color.copy(O).multiplyScalar(U),H.distance=q,H.coneCos=Math.cos(I.angle),H.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),H.decay=I.decay,i.spot[x]=H;let z=I.shadow;if(I.map&&(i.spotLightMap[T]=I.map,T++,z.updateMatrices(I),I.castShadow&&b++),i.spotLightMatrix[x]=z.matrix,I.castShadow){let k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,i.spotShadow[x]=k,i.spotShadowMap[x]=R,y++}x++}else if(I.isRectAreaLight){let H=e.get(I);H.color.copy(O).multiplyScalar(U),H.halfWidth.set(I.width*.5,0,0),H.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=H,m++}else if(I.isPointLight){let H=e.get(I);if(H.color.copy(I.color).multiplyScalar(I.intensity),H.distance=I.distance,H.decay=I.decay,I.castShadow){let z=I.shadow,k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,k.shadowCameraNear=z.camera.near,k.shadowCameraFar=z.camera.far,i.pointShadow[p]=k,i.pointShadowMap[p]=R,i.pointShadowMatrix[p]=I.shadow.matrix,E++}i.point[p]=H,p++}else if(I.isHemisphereLight){let H=e.get(I);H.skyColor.copy(I.color).multiplyScalar(U),H.groundColor.copy(I.groundColor).multiplyScalar(U),i.hemi[g]=H,g++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;let v=i.hash;(v.directionalLength!==d||v.pointLength!==p||v.spotLength!==x||v.rectAreaLength!==m||v.hemiLength!==g||v.numDirectionalShadows!==w||v.numPointShadows!==E||v.numSpotShadows!==y||v.numSpotMaps!==T||v.numLightProbes!==C)&&(i.directional.length=d,i.spot.length=x,i.rectArea.length=m,i.point.length=p,i.hemi.length=g,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=y+T-b,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=C,v.directionalLength=d,v.pointLength=p,v.spotLength=x,v.rectAreaLength=m,v.hemiLength=g,v.numDirectionalShadows=w,v.numPointShadows=E,v.numSpotShadows=y,v.numSpotMaps=T,v.numLightProbes=C,i.version=_M++)}function c(l,u){let h=0,f=0,d=0,p=0,x=0,m=u.matrixWorldInverse;for(let g=0,w=l.length;g<w;g++){let E=l[g];if(E.isDirectionalLight){let y=i.directional[h];y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(E.isSpotLight){let y=i.spot[d];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(E.isRectAreaLight){let y=i.rectArea[p];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(E.width*.5,0,0),y.halfHeight.set(0,E.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),p++}else if(E.isPointLight){let y=i.point[f];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),f++}else if(E.isHemisphereLight){let y=i.hemi[x];y.direction.setFromMatrixPosition(E.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:o,setupView:c,state:i}}function hp(n){let e=new bM(n),t=[],i=[],s=[];function r(f){h.camera=f,t.length=0,i.length=0,s.length=0}function a(f){t.push(f)}function o(f){i.push(f)}function c(f){s.push(f)}function l(){e.setup(t)}function u(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function MM(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new hp(n),e.set(s,[o])):r>=a.length?(o=new hp(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var SM=\`void main() {
	gl_Position = vec4( position, 1.0 );
}\`,EM=\`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}\`,wM=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],TM=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],dp=new It,Ca=new D,ah=new D;function AM(n,e,t){let i=new rr,s=new ce,r=new ce,a=new Pt,o=new Zo,c=new Ko,l={},u=t.maxTextureSize,h={[Un]:fn,[fn]:Un,[nn]:nn},f=new Tn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:SM,fragmentShader:EM}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let p=new tn;p.setAttribute("position",new hn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new pt(p,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Es;let g=this.type;this.render=function(b,C,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===sf&&(He("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Es);let S=n.getRenderTarget(),P=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),O=n.state;O.setBlending(ri),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let U=g!==this.type;U&&C.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(R=>R.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,R=b.length;q<R;q++){let H=b[q],z=H.shadow;if(z===void 0){He("WebGLShadowMap:",H,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let k=z.getFrameExtents();s.multiply(k),r.copy(z.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/k.x),s.x=r.x*k.x,z.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/k.y),s.y=r.y*k.y,z.mapSize.y=r.y));let $=n.state.buffers.depth.getReversed();if(z.camera._reversedDepth=$,z.map===null||U===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===dr){if(H.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Sn(s.x,s.y,{format:Zi,type:oi,minFilter:Gt,magFilter:Gt,generateMipmaps:!1}),z.map.texture.name=H.name+".shadowMap",z.map.depthTexture=new _i(s.x,s.y,Yn),z.map.depthTexture.name=H.name+".shadowMapDepth",z.map.depthTexture.format=si,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Jt,z.map.depthTexture.magFilter=Jt}else H.isPointLight?(z.map=new nl(s.x),z.map.depthTexture=new Vo(s.x,qn)):(z.map=new Sn(s.x,s.y),z.map.depthTexture=new _i(s.x,s.y,qn)),z.map.depthTexture.name=H.name+".shadowMap",z.map.depthTexture.format=si,this.type===Es?(z.map.depthTexture.compareFunction=$?Jc:Kc,z.map.depthTexture.minFilter=Gt,z.map.depthTexture.magFilter=Gt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Jt,z.map.depthTexture.magFilter=Jt);z.camera.updateProjectionMatrix()}let se=z.map.isWebGLCubeRenderTarget?6:1;for(let ae=0;ae<se;ae++){if(z.map.isWebGLCubeRenderTarget)n.setRenderTarget(z.map,ae),n.clear();else{ae===0&&(n.setRenderTarget(z.map),n.clear());let ee=z.getViewport(ae);a.set(r.x*ee.x,r.y*ee.y,r.x*ee.z,r.y*ee.w),O.viewport(a)}if(H.isPointLight){let ee=z.camera,we=z.matrix,Ke=H.distance||ee.far;Ke!==ee.far&&(ee.far=Ke,ee.updateProjectionMatrix()),Ca.setFromMatrixPosition(H.matrixWorld),ee.position.copy(Ca),ah.copy(ee.position),ah.add(wM[ae]),ee.up.copy(TM[ae]),ee.lookAt(ah),ee.updateMatrixWorld(),we.makeTranslation(-Ca.x,-Ca.y,-Ca.z),dp.multiplyMatrices(ee.projectionMatrix,ee.matrixWorldInverse),z._frustum.setFromProjectionMatrix(dp,ee.coordinateSystem,ee.reversedDepth)}else z.updateMatrices(H);i=z.getFrustum(),y(C,v,z.camera,H,this.type)}z.isPointLightShadow!==!0&&this.type===dr&&w(z,v),z.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(S,P,I)};function w(b,C){let v=e.update(x);f.defines.VSM_SAMPLES!==b.blurSamples&&(f.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Sn(s.x,s.y,{format:Zi,type:oi})),f.uniforms.shadow_pass.value=b.map.depthTexture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(C,null,v,f,x,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(C,null,v,d,x,null)}function E(b,C,v,S){let P=null,I=v.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(I!==void 0)P=I;else if(P=v.isPointLight===!0?c:o,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let O=P.uuid,U=C.uuid,q=l[O];q===void 0&&(q={},l[O]=q);let R=q[U];R===void 0&&(R=P.clone(),q[U]=R,C.addEventListener("dispose",T)),P=R}if(P.visible=C.visible,P.wireframe=C.wireframe,S===dr?P.side=C.shadowSide!==null?C.shadowSide:C.side:P.side=C.shadowSide!==null?C.shadowSide:h[C.side],P.alphaMap=C.alphaMap,P.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,P.map=C.map,P.clipShadows=C.clipShadows,P.clippingPlanes=C.clippingPlanes,P.clipIntersection=C.clipIntersection,P.displacementMap=C.displacementMap,P.displacementScale=C.displacementScale,P.displacementBias=C.displacementBias,P.wireframeLinewidth=C.wireframeLinewidth,P.linewidth=C.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let O=n.properties.get(P);O.light=v}return P}function y(b,C,v,S,P){if(b.visible===!1)return;if(b.layers.test(C.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&P===dr)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,b.matrixWorld);let U=e.update(b),q=b.material;if(Array.isArray(q)){let R=U.groups;for(let H=0,z=R.length;H<z;H++){let k=R[H],$=q[k.materialIndex];if($&&$.visible){let se=E(b,$,S,P);b.onBeforeShadow(n,b,C,v,U,se,k),n.renderBufferDirect(v,null,U,se,b,k),b.onAfterShadow(n,b,C,v,U,se,k)}}}else if(q.visible){let R=E(b,q,S,P);b.onBeforeShadow(n,b,C,v,U,R,null),n.renderBufferDirect(v,null,U,R,b,null),b.onAfterShadow(n,b,C,v,U,R,null)}}let O=b.children;for(let U=0,q=O.length;U<q;U++)y(O[U],C,v,S,P)}function T(b){b.target.removeEventListener("dispose",T);for(let v in l){let S=l[v],P=b.target.uuid;P in S&&(S[P].dispose(),delete S[P])}}}function CM(n,e){function t(){let N=!1,fe=new Pt,Q=null,me=new Pt(0,0,0,0);return{setMask:function(Me){Q!==Me&&!N&&(n.colorMask(Me,Me,Me,Me),Q=Me)},setLocked:function(Me){N=Me},setClear:function(Me,te,Ae,Pe,At){At===!0&&(Me*=Pe,te*=Pe,Ae*=Pe),fe.set(Me,te,Ae,Pe),me.equals(fe)===!1&&(n.clearColor(Me,te,Ae,Pe),me.copy(fe))},reset:function(){N=!1,Q=null,me.set(-1,0,0,0)}}}function i(){let N=!1,fe=!1,Q=null,me=null,Me=null;return{setReversed:function(te){if(fe!==te){let Ae=e.get("EXT_clip_control");te?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),fe=te;let Pe=Me;Me=null,this.setClear(Pe)}},getReversed:function(){return fe},setTest:function(te){te?ne(n.DEPTH_TEST):Ie(n.DEPTH_TEST)},setMask:function(te){Q!==te&&!N&&(n.depthMask(te),Q=te)},setFunc:function(te){if(fe&&(te=Uf[te]),me!==te){switch(te){case Io:n.depthFunc(n.NEVER);break;case Po:n.depthFunc(n.ALWAYS);break;case Do:n.depthFunc(n.LESS);break;case xs:n.depthFunc(n.LEQUAL);break;case Lo:n.depthFunc(n.EQUAL);break;case Oo:n.depthFunc(n.GEQUAL);break;case No:n.depthFunc(n.GREATER);break;case Fo:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}me=te}},setLocked:function(te){N=te},setClear:function(te){Me!==te&&(Me=te,fe&&(te=1-te),n.clearDepth(te))},reset:function(){N=!1,Q=null,me=null,Me=null,fe=!1}}}function s(){let N=!1,fe=null,Q=null,me=null,Me=null,te=null,Ae=null,Pe=null,At=null;return{setTest:function(vt){N||(vt?ne(n.STENCIL_TEST):Ie(n.STENCIL_TEST))},setMask:function(vt){fe!==vt&&!N&&(n.stencilMask(vt),fe=vt)},setFunc:function(vt,pn,Ln){(Q!==vt||me!==pn||Me!==Ln)&&(n.stencilFunc(vt,pn,Ln),Q=vt,me=pn,Me=Ln)},setOp:function(vt,pn,Ln){(te!==vt||Ae!==pn||Pe!==Ln)&&(n.stencilOp(vt,pn,Ln),te=vt,Ae=pn,Pe=Ln)},setLocked:function(vt){N=vt},setClear:function(vt){At!==vt&&(n.clearStencil(vt),At=vt)},reset:function(){N=!1,fe=null,Q=null,me=null,Me=null,te=null,Ae=null,Pe=null,At=null}}}let r=new t,a=new i,o=new s,c=new WeakMap,l=new WeakMap,u={},h={},f={},d=new WeakMap,p=[],x=null,m=!1,g=null,w=null,E=null,y=null,T=null,b=null,C=null,v=new je(0,0,0),S=0,P=!1,I=null,O=null,U=null,q=null,R=null,H=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,k=0,$=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(k=parseFloat(/^WebGL (\\d)/.exec($)[1]),z=k>=1):$.indexOf("OpenGL ES")!==-1&&(k=parseFloat(/^OpenGL ES (\\d)/.exec($)[1]),z=k>=2);let se=null,ae={},ee=n.getParameter(n.SCISSOR_BOX),we=n.getParameter(n.VIEWPORT),Ke=new Pt().fromArray(ee),We=new Pt().fromArray(we);function K(N,fe,Q,me){let Me=new Uint8Array(4),te=n.createTexture();n.bindTexture(N,te),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ae=0;Ae<Q;Ae++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(fe,0,n.RGBA,1,1,me,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(fe+Ae,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return te}let ue={};ue[n.TEXTURE_2D]=K(n.TEXTURE_2D,n.TEXTURE_2D,1),ue[n.TEXTURE_CUBE_MAP]=K(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[n.TEXTURE_2D_ARRAY]=K(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ue[n.TEXTURE_3D]=K(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ne(n.DEPTH_TEST),a.setFunc(xs),ge(!1),ve(Cu),ne(n.CULL_FACE),oe(ri);function ne(N){u[N]!==!0&&(n.enable(N),u[N]=!0)}function Ie(N){u[N]!==!1&&(n.disable(N),u[N]=!1)}function Xe(N,fe){return f[N]!==fe?(n.bindFramebuffer(N,fe),f[N]=fe,N===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=fe),N===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=fe),!0):!1}function ze(N,fe){let Q=p,me=!1;if(N){Q=d.get(fe),Q===void 0&&(Q=[],d.set(fe,Q));let Me=N.textures;if(Q.length!==Me.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let te=0,Ae=Me.length;te<Ae;te++)Q[te]=n.COLOR_ATTACHMENT0+te;Q.length=Me.length,me=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,me=!0);me&&n.drawBuffers(Q)}function dt(N){return x!==N?(n.useProgram(N),x=N,!0):!1}let Ye={[Hi]:n.FUNC_ADD,[af]:n.FUNC_SUBTRACT,[of]:n.FUNC_REVERSE_SUBTRACT};Ye[cf]=n.MIN,Ye[lf]=n.MAX;let ie={[uf]:n.ZERO,[hf]:n.ONE,[df]:n.SRC_COLOR,[Co]:n.SRC_ALPHA,[vf]:n.SRC_ALPHA_SATURATE,[gf]:n.DST_COLOR,[pf]:n.DST_ALPHA,[ff]:n.ONE_MINUS_SRC_COLOR,[Ro]:n.ONE_MINUS_SRC_ALPHA,[xf]:n.ONE_MINUS_DST_COLOR,[mf]:n.ONE_MINUS_DST_ALPHA,[_f]:n.CONSTANT_COLOR,[yf]:n.ONE_MINUS_CONSTANT_COLOR,[bf]:n.CONSTANT_ALPHA,[Mf]:n.ONE_MINUS_CONSTANT_ALPHA};function oe(N,fe,Q,me,Me,te,Ae,Pe,At,vt){if(N===ri){m===!0&&(Ie(n.BLEND),m=!1);return}if(m===!1&&(ne(n.BLEND),m=!0),N!==rf){if(N!==g||vt!==P){if((w!==Hi||T!==Hi)&&(n.blendEquation(n.FUNC_ADD),w=Hi,T=Hi),vt)switch(N){case gs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ru:n.blendFunc(n.ONE,n.ONE);break;case Iu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Pu:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ge("WebGLState: Invalid blending: ",N);break}else switch(N){case gs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Ru:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Iu:Ge("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Pu:Ge("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ge("WebGLState: Invalid blending: ",N);break}E=null,y=null,b=null,C=null,v.set(0,0,0),S=0,g=N,P=vt}return}Me=Me||fe,te=te||Q,Ae=Ae||me,(fe!==w||Me!==T)&&(n.blendEquationSeparate(Ye[fe],Ye[Me]),w=fe,T=Me),(Q!==E||me!==y||te!==b||Ae!==C)&&(n.blendFuncSeparate(ie[Q],ie[me],ie[te],ie[Ae]),E=Q,y=me,b=te,C=Ae),(Pe.equals(v)===!1||At!==S)&&(n.blendColor(Pe.r,Pe.g,Pe.b,At),v.copy(Pe),S=At),g=N,P=!1}function re(N,fe){N.side===nn?Ie(n.CULL_FACE):ne(n.CULL_FACE);let Q=N.side===fn;fe&&(Q=!Q),ge(Q),N.blending===gs&&N.transparent===!1?oe(ri):oe(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);let me=N.stencilWrite;o.setTest(me),me&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Le(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ne(n.SAMPLE_ALPHA_TO_COVERAGE):Ie(n.SAMPLE_ALPHA_TO_COVERAGE)}function ge(N){I!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),I=N)}function ve(N){N!==tf?(ne(n.CULL_FACE),N!==O&&(N===Cu?n.cullFace(n.BACK):N===nf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ie(n.CULL_FACE),O=N}function Re(N){N!==U&&(z&&n.lineWidth(N),U=N)}function Le(N,fe,Q){N?(ne(n.POLYGON_OFFSET_FILL),(q!==fe||R!==Q)&&(q=fe,R=Q,a.getReversed()&&(fe=-fe),n.polygonOffset(fe,Q))):Ie(n.POLYGON_OFFSET_FILL)}function qe(N){N?ne(n.SCISSOR_TEST):Ie(n.SCISSOR_TEST)}function $e(N){N===void 0&&(N=n.TEXTURE0+H-1),se!==N&&(n.activeTexture(N),se=N)}function L(N,fe,Q){Q===void 0&&(se===null?Q=n.TEXTURE0+H-1:Q=se);let me=ae[Q];me===void 0&&(me={type:void 0,texture:void 0},ae[Q]=me),(me.type!==N||me.texture!==fe)&&(se!==Q&&(n.activeTexture(Q),se=Q),n.bindTexture(N,fe||ue[N]),me.type=N,me.texture=fe)}function mt(){let N=ae[se];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function it(){try{n.compressedTexImage2D(...arguments)}catch(N){Ge("WebGLState:",N)}}function A(){try{n.compressedTexImage3D(...arguments)}catch(N){Ge("WebGLState:",N)}}function _(){try{n.texSubImage2D(...arguments)}catch(N){Ge("WebGLState:",N)}}function B(){try{n.texSubImage3D(...arguments)}catch(N){Ge("WebGLState:",N)}}function V(){try{n.compressedTexSubImage2D(...arguments)}catch(N){Ge("WebGLState:",N)}}function j(){try{n.compressedTexSubImage3D(...arguments)}catch(N){Ge("WebGLState:",N)}}function le(){try{n.texStorage2D(...arguments)}catch(N){Ge("WebGLState:",N)}}function he(){try{n.texStorage3D(...arguments)}catch(N){Ge("WebGLState:",N)}}function Z(){try{n.texImage2D(...arguments)}catch(N){Ge("WebGLState:",N)}}function J(){try{n.texImage3D(...arguments)}catch(N){Ge("WebGLState:",N)}}function pe(N){return h[N]!==void 0?h[N]:n.getParameter(N)}function De(N,fe){h[N]!==fe&&(n.pixelStorei(N,fe),h[N]=fe)}function _e(N){Ke.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),Ke.copy(N))}function de(N){We.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),We.copy(N))}function Be(N,fe){let Q=l.get(fe);Q===void 0&&(Q=new WeakMap,l.set(fe,Q));let me=Q.get(N);me===void 0&&(me=n.getUniformBlockIndex(fe,N.name),Q.set(N,me))}function Ve(N,fe){let me=l.get(fe).get(N);c.get(fe)!==me&&(n.uniformBlockBinding(fe,me,N.__bindingPointIndex),c.set(fe,me))}function Je(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},h={},se=null,ae={},f={},d=new WeakMap,p=[],x=null,m=!1,g=null,w=null,E=null,y=null,T=null,b=null,C=null,v=new je(0,0,0),S=0,P=!1,I=null,O=null,U=null,q=null,R=null,Ke.set(0,0,n.canvas.width,n.canvas.height),We.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ne,disable:Ie,bindFramebuffer:Xe,drawBuffers:ze,useProgram:dt,setBlending:oe,setMaterial:re,setFlipSided:ge,setCullFace:ve,setLineWidth:Re,setPolygonOffset:Le,setScissorTest:qe,activeTexture:$e,bindTexture:L,unbindTexture:mt,compressedTexImage2D:it,compressedTexImage3D:A,texImage2D:Z,texImage3D:J,pixelStorei:De,getParameter:pe,updateUBOMapping:Be,uniformBlockBinding:Ve,texStorage2D:le,texStorage3D:he,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:V,compressedTexSubImage3D:j,scissor:_e,viewport:de,reset:Je}}function RM(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ce,u=new WeakMap,h=new Set,f,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(A,_){return p?new OffscreenCanvas(A,_):Zr("canvas")}function m(A,_,B){let V=1,j=it(A);if((j.width>B||j.height>B)&&(V=B/Math.max(j.width,j.height)),V<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let le=Math.floor(V*j.width),he=Math.floor(V*j.height);f===void 0&&(f=x(le,he));let Z=_?x(le,he):f;return Z.width=le,Z.height=he,Z.getContext("2d").drawImage(A,0,0,le,he),He("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+le+"x"+he+")."),Z}else return"data"in A&&He("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),A;return A}function g(A){return A.generateMipmaps}function w(A){n.generateMipmap(A)}function E(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(A,_,B,V,j,le=!1){if(A!==null){if(n[A]!==void 0)return n[A];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let he;V&&(he=e.get("EXT_texture_norm16"),he||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=_;if(_===n.RED&&(B===n.FLOAT&&(Z=n.R32F),B===n.HALF_FLOAT&&(Z=n.R16F),B===n.UNSIGNED_BYTE&&(Z=n.R8),B===n.UNSIGNED_SHORT&&he&&(Z=he.R16_EXT),B===n.SHORT&&he&&(Z=he.R16_SNORM_EXT)),_===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.R8UI),B===n.UNSIGNED_SHORT&&(Z=n.R16UI),B===n.UNSIGNED_INT&&(Z=n.R32UI),B===n.BYTE&&(Z=n.R8I),B===n.SHORT&&(Z=n.R16I),B===n.INT&&(Z=n.R32I)),_===n.RG&&(B===n.FLOAT&&(Z=n.RG32F),B===n.HALF_FLOAT&&(Z=n.RG16F),B===n.UNSIGNED_BYTE&&(Z=n.RG8),B===n.UNSIGNED_SHORT&&he&&(Z=he.RG16_EXT),B===n.SHORT&&he&&(Z=he.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RG8UI),B===n.UNSIGNED_SHORT&&(Z=n.RG16UI),B===n.UNSIGNED_INT&&(Z=n.RG32UI),B===n.BYTE&&(Z=n.RG8I),B===n.SHORT&&(Z=n.RG16I),B===n.INT&&(Z=n.RG32I)),_===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),B===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),B===n.UNSIGNED_INT&&(Z=n.RGB32UI),B===n.BYTE&&(Z=n.RGB8I),B===n.SHORT&&(Z=n.RGB16I),B===n.INT&&(Z=n.RGB32I)),_===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),B===n.UNSIGNED_INT&&(Z=n.RGBA32UI),B===n.BYTE&&(Z=n.RGBA8I),B===n.SHORT&&(Z=n.RGBA16I),B===n.INT&&(Z=n.RGBA32I)),_===n.RGB&&(B===n.UNSIGNED_SHORT&&he&&(Z=he.RGB16_EXT),B===n.SHORT&&he&&(Z=he.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),_===n.RGBA){let J=le?jr:lt.getTransfer(j);B===n.FLOAT&&(Z=n.RGBA32F),B===n.HALF_FLOAT&&(Z=n.RGBA16F),B===n.UNSIGNED_BYTE&&(Z=J===gt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&he&&(Z=he.RGBA16_EXT),B===n.SHORT&&he&&(Z=he.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function T(A,_){let B;return A?_===null||_===qn||_===mr?B=n.DEPTH24_STENCIL8:_===Yn?B=n.DEPTH32F_STENCIL8:_===pr&&(B=n.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===qn||_===mr?B=n.DEPTH_COMPONENT24:_===Yn?B=n.DEPTH_COMPONENT32F:_===pr&&(B=n.DEPTH_COMPONENT16),B}function b(A,_){return g(A)===!0||A.isFramebufferTexture&&A.minFilter!==Jt&&A.minFilter!==Gt?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function C(A){let _=A.target;_.removeEventListener("dispose",C),S(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&h.delete(_)}function v(A){let _=A.target;_.removeEventListener("dispose",v),I(_)}function S(A){let _=i.get(A);if(_.__webglInit===void 0)return;let B=A.source,V=d.get(B);if(V){let j=V[_.__cacheKey];j.usedTimes--,j.usedTimes===0&&P(A),Object.keys(V).length===0&&d.delete(B)}i.remove(A)}function P(A){let _=i.get(A);n.deleteTexture(_.__webglTexture);let B=A.source,V=d.get(B);delete V[_.__cacheKey],a.memory.textures--}function I(A){let _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(_.__webglFramebuffer[V]))for(let j=0;j<_.__webglFramebuffer[V].length;j++)n.deleteFramebuffer(_.__webglFramebuffer[V][j]);else n.deleteFramebuffer(_.__webglFramebuffer[V]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[V])}else{if(Array.isArray(_.__webglFramebuffer))for(let V=0;V<_.__webglFramebuffer.length;V++)n.deleteFramebuffer(_.__webglFramebuffer[V]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let V=0;V<_.__webglColorRenderbuffer.length;V++)_.__webglColorRenderbuffer[V]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[V]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=A.textures;for(let V=0,j=B.length;V<j;V++){let le=i.get(B[V]);le.__webglTexture&&(n.deleteTexture(le.__webglTexture),a.memory.textures--),i.remove(B[V])}i.remove(A)}let O=0;function U(){O=0}function q(){return O}function R(A){O=A}function H(){let A=O;return A>=s.maxTextures&&He("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),O+=1,A}function z(A){let _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function k(A,_){let B=i.get(A);if(A.isVideoTexture&&L(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){let V=A.image;if(V===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{Ie(B,A,_);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+_)}function $(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Ie(B,A,_);return}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+_)}function se(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Ie(B,A,_);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+_)}function ae(A,_){let B=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&B.__version!==A.version){Xe(B,A,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+_)}let ee={[vs]:n.REPEAT,[ni]:n.CLAMP_TO_EDGE,[Uo]:n.MIRRORED_REPEAT},we={[Jt]:n.NEAREST,[wf]:n.NEAREST_MIPMAP_NEAREST,[ya]:n.NEAREST_MIPMAP_LINEAR,[Gt]:n.LINEAR,[fc]:n.LINEAR_MIPMAP_NEAREST,[ai]:n.LINEAR_MIPMAP_LINEAR},Ke={[Cf]:n.NEVER,[Lf]:n.ALWAYS,[Rf]:n.LESS,[Kc]:n.LEQUAL,[If]:n.EQUAL,[Jc]:n.GEQUAL,[Pf]:n.GREATER,[Df]:n.NOTEQUAL};function We(A,_){if(_.type===Yn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Gt||_.magFilter===fc||_.magFilter===ya||_.magFilter===ai||_.minFilter===Gt||_.minFilter===fc||_.minFilter===ya||_.minFilter===ai)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,ee[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,ee[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,ee[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,we[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,we[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,Ke[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Jt||_.minFilter!==ya&&_.minFilter!==ai||_.type===Yn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function K(A,_){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",C));let V=_.source,j=d.get(V);j===void 0&&(j={},d.set(V,j));let le=z(_);if(le!==A.__cacheKey){j[le]===void 0&&(j[le]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),j[le].usedTimes++;let he=j[A.__cacheKey];he!==void 0&&(j[A.__cacheKey].usedTimes--,he.usedTimes===0&&P(_)),A.__cacheKey=le,A.__webglTexture=j[le].texture}return B}function ue(A,_,B){return Math.floor(Math.floor(A/B)/_)}function ne(A,_,B,V){let le=A.updateRanges;if(le.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,B,V,_.data);else{le.sort((De,_e)=>De.start-_e.start);let he=0;for(let De=1;De<le.length;De++){let _e=le[he],de=le[De],Be=_e.start+_e.count,Ve=ue(de.start,_.width,4),Je=ue(_e.start,_.width,4);de.start<=Be+1&&Ve===Je&&ue(de.start+de.count-1,_.width,4)===Ve?_e.count=Math.max(_e.count,de.start+de.count-_e.start):(++he,le[he]=de)}le.length=he+1;let Z=t.getParameter(n.UNPACK_ROW_LENGTH),J=t.getParameter(n.UNPACK_SKIP_PIXELS),pe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let De=0,_e=le.length;De<_e;De++){let de=le[De],Be=Math.floor(de.start/4),Ve=Math.ceil(de.count/4),Je=Be%_.width,N=Math.floor(Be/_.width),fe=Ve,Q=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Je),t.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,Je,N,fe,Q,B,V,_.data)}A.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Z),t.pixelStorei(n.UNPACK_SKIP_PIXELS,J),t.pixelStorei(n.UNPACK_SKIP_ROWS,pe)}}function Ie(A,_,B){let V=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(V=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(V=n.TEXTURE_3D);let j=K(A,_),le=_.source;t.bindTexture(V,A.__webglTexture,n.TEXTURE0+B);let he=i.get(le);if(le.version!==he.__version||j===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Q=lt.getPrimaries(lt.workingColorSpace),me=_.colorSpace===Si?null:lt.getPrimaries(_.colorSpace),Me=_.colorSpace===Si||Q===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me)}t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let J=m(_.image,!1,s.maxTextureSize);J=mt(_,J);let pe=r.convert(_.format,_.colorSpace),De=r.convert(_.type),_e=y(_.internalFormat,pe,De,_.normalized,_.colorSpace,_.isVideoTexture);We(V,_);let de,Be=_.mipmaps,Ve=_.isVideoTexture!==!0,Je=he.__version===void 0||j===!0,N=le.dataReady,fe=b(_,J);if(_.isDepthTexture)_e=T(_.format===ji,_.type),Je&&(Ve?t.texStorage2D(n.TEXTURE_2D,1,_e,J.width,J.height):t.texImage2D(n.TEXTURE_2D,0,_e,J.width,J.height,0,pe,De,null));else if(_.isDataTexture)if(Be.length>0){Ve&&Je&&t.texStorage2D(n.TEXTURE_2D,fe,_e,Be[0].width,Be[0].height);for(let Q=0,me=Be.length;Q<me;Q++)de=Be[Q],Ve?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,de.width,de.height,pe,De,de.data):t.texImage2D(n.TEXTURE_2D,Q,_e,de.width,de.height,0,pe,De,de.data);_.generateMipmaps=!1}else Ve?(Je&&t.texStorage2D(n.TEXTURE_2D,fe,_e,J.width,J.height),N&&ne(_,J,pe,De)):t.texImage2D(n.TEXTURE_2D,0,_e,J.width,J.height,0,pe,De,J.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ve&&Je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,_e,Be[0].width,Be[0].height,J.depth);for(let Q=0,me=Be.length;Q<me;Q++)if(de=Be[Q],_.format!==gn)if(pe!==null)if(Ve){if(N)if(_.layerUpdates.size>0){let Me=eh(de.width,de.height,_.format,_.type);for(let te of _.layerUpdates){let Ae=de.data.subarray(te*Me/de.data.BYTES_PER_ELEMENT,(te+1)*Me/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,te,de.width,de.height,1,pe,Ae)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,J.depth,pe,de.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,_e,de.width,de.height,J.depth,0,de.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ve?N&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,J.depth,pe,De,de.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,_e,de.width,de.height,J.depth,0,pe,De,de.data)}else{Ve&&Je&&t.texStorage2D(n.TEXTURE_2D,fe,_e,Be[0].width,Be[0].height);for(let Q=0,me=Be.length;Q<me;Q++)de=Be[Q],_.format!==gn?pe!==null?Ve?N&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,de.width,de.height,pe,de.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,_e,de.width,de.height,0,de.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ve?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,de.width,de.height,pe,De,de.data):t.texImage2D(n.TEXTURE_2D,Q,_e,de.width,de.height,0,pe,De,de.data)}else if(_.isDataArrayTexture)if(Ve){if(Je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,_e,J.width,J.height,J.depth),N)if(_.layerUpdates.size>0){let Q=eh(J.width,J.height,_.format,_.type);for(let me of _.layerUpdates){let Me=J.data.subarray(me*Q/J.data.BYTES_PER_ELEMENT,(me+1)*Q/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,me,J.width,J.height,1,pe,De,Me)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,pe,De,J.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,_e,J.width,J.height,J.depth,0,pe,De,J.data);else if(_.isData3DTexture)Ve?(Je&&t.texStorage3D(n.TEXTURE_3D,fe,_e,J.width,J.height,J.depth),N&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,pe,De,J.data)):t.texImage3D(n.TEXTURE_3D,0,_e,J.width,J.height,J.depth,0,pe,De,J.data);else if(_.isFramebufferTexture){if(Je)if(Ve)t.texStorage2D(n.TEXTURE_2D,fe,_e,J.width,J.height);else{let Q=J.width,me=J.height;for(let Me=0;Me<fe;Me++)t.texImage2D(n.TEXTURE_2D,Me,_e,Q,me,0,pe,De,null),Q>>=1,me>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){let Q=n.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),J.parentNode!==Q){Q.appendChild(J),h.add(_),Q.onpaint=me=>{let Me=me.changedElements;for(let te of h)Me.includes(te.image)&&(te.needsUpdate=!0)},Q.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,J);else{let Me=n.RGBA,te=n.RGBA,Ae=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Me,te,Ae,J)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Be.length>0){if(Ve&&Je){let Q=it(Be[0]);t.texStorage2D(n.TEXTURE_2D,fe,_e,Q.width,Q.height)}for(let Q=0,me=Be.length;Q<me;Q++)de=Be[Q],Ve?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,pe,De,de):t.texImage2D(n.TEXTURE_2D,Q,_e,pe,De,de);_.generateMipmaps=!1}else if(Ve){if(Je){let Q=it(J);t.texStorage2D(n.TEXTURE_2D,fe,_e,Q.width,Q.height)}N&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,pe,De,J)}else t.texImage2D(n.TEXTURE_2D,0,_e,pe,De,J);g(_)&&w(V),he.__version=le.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function Xe(A,_,B){if(_.image.length!==6)return;let V=K(A,_),j=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);let le=i.get(j);if(j.version!==le.__version||V===!0){t.activeTexture(n.TEXTURE0+B);let he=lt.getPrimaries(lt.workingColorSpace),Z=_.colorSpace===Si?null:lt.getPrimaries(_.colorSpace),J=_.colorSpace===Si||he===Z?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let pe=_.isCompressedTexture||_.image[0].isCompressedTexture,De=_.image[0]&&_.image[0].isDataTexture,_e=[];for(let te=0;te<6;te++)!pe&&!De?_e[te]=m(_.image[te],!0,s.maxCubemapSize):_e[te]=De?_.image[te].image:_.image[te],_e[te]=mt(_,_e[te]);let de=_e[0],Be=r.convert(_.format,_.colorSpace),Ve=r.convert(_.type),Je=y(_.internalFormat,Be,Ve,_.normalized,_.colorSpace),N=_.isVideoTexture!==!0,fe=le.__version===void 0||V===!0,Q=j.dataReady,me=b(_,de);We(n.TEXTURE_CUBE_MAP,_);let Me;if(pe){N&&fe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,Je,de.width,de.height);for(let te=0;te<6;te++){Me=_e[te].mipmaps;for(let Ae=0;Ae<Me.length;Ae++){let Pe=Me[Ae];_.format!==gn?Be!==null?N?Q&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae,0,0,Pe.width,Pe.height,Be,Pe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae,Je,Pe.width,Pe.height,0,Pe.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae,0,0,Pe.width,Pe.height,Be,Ve,Pe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae,Je,Pe.width,Pe.height,0,Be,Ve,Pe.data)}}}else{if(Me=_.mipmaps,N&&fe){Me.length>0&&me++;let te=it(_e[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,Je,te.width,te.height)}for(let te=0;te<6;te++)if(De){N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,_e[te].width,_e[te].height,Be,Ve,_e[te].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Je,_e[te].width,_e[te].height,0,Be,Ve,_e[te].data);for(let Ae=0;Ae<Me.length;Ae++){let At=Me[Ae].image[te].image;N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae+1,0,0,At.width,At.height,Be,Ve,At.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae+1,Je,At.width,At.height,0,Be,Ve,At.data)}}else{N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Be,Ve,_e[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Je,Be,Ve,_e[te]);for(let Ae=0;Ae<Me.length;Ae++){let Pe=Me[Ae];N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae+1,0,0,Be,Ve,Pe.image[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ae+1,Je,Be,Ve,Pe.image[te])}}}g(_)&&w(n.TEXTURE_CUBE_MAP),le.__version=j.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function ze(A,_,B,V,j,le){let he=r.convert(B.format,B.colorSpace),Z=r.convert(B.type),J=y(B.internalFormat,he,Z,B.normalized,B.colorSpace),pe=i.get(_),De=i.get(B);if(De.__renderTarget=_,!pe.__hasExternalTextures){let _e=Math.max(1,_.width>>le),de=Math.max(1,_.height>>le);j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?t.texImage3D(j,le,J,_e,de,_.depth,0,he,Z,null):t.texImage2D(j,le,J,_e,de,0,he,Z,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),$e(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,V,j,De.__webglTexture,0,qe(_)):(j===n.TEXTURE_2D||j>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,V,j,De.__webglTexture,le),t.bindFramebuffer(n.FRAMEBUFFER,null)}function dt(A,_,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){let V=_.depthTexture,j=V&&V.isDepthTexture?V.type:null,le=T(_.stencilBuffer,j),he=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;$e(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qe(_),le,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,qe(_),le,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,le,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,he,n.RENDERBUFFER,A)}else{let V=_.textures;for(let j=0;j<V.length;j++){let le=V[j],he=r.convert(le.format,le.colorSpace),Z=r.convert(le.type),J=y(le.internalFormat,he,Z,le.normalized,le.colorSpace);$e(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qe(_),J,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,qe(_),J,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,J,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ye(A,_,B){let V=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let j=i.get(_.depthTexture);if(j.__renderTarget=_,(!j.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),V){if(j.__webglInit===void 0&&(j.__webglInit=!0,_.depthTexture.addEventListener("dispose",C)),j.__webglTexture===void 0){j.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,j.__webglTexture),We(n.TEXTURE_CUBE_MAP,_.depthTexture);let pe=r.convert(_.depthTexture.format),De=r.convert(_.depthTexture.type),_e;_.depthTexture.format===si?_e=n.DEPTH_COMPONENT24:_.depthTexture.format===ji&&(_e=n.DEPTH24_STENCIL8);for(let de=0;de<6;de++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,_e,_.width,_.height,0,pe,De,null)}}else k(_.depthTexture,0);let le=j.__webglTexture,he=qe(_),Z=V?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,J=_.depthTexture.format===ji?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===si)$e(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,Z,le,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,J,Z,le,0);else if(_.depthTexture.format===ji)$e(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,Z,le,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,J,Z,le,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ie(A){let _=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){let V=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),V){let j=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,V.removeEventListener("dispose",j)};V.addEventListener("dispose",j),_.__depthDisposeCallback=j}_.__boundDepthTexture=V}if(A.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let V=0;V<6;V++)Ye(_.__webglFramebuffer[V],A,V);else{let V=A.texture.mipmaps;V&&V.length>0?Ye(_.__webglFramebuffer[0],A,0):Ye(_.__webglFramebuffer,A,0)}else if(B){_.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[V]),_.__webglDepthbuffer[V]===void 0)_.__webglDepthbuffer[V]=n.createRenderbuffer(),dt(_.__webglDepthbuffer[V],A,!1);else{let j=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=_.__webglDepthbuffer[V];n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,le)}}else{let V=A.texture.mipmaps;if(V&&V.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),dt(_.__webglDepthbuffer,A,!1);else{let j=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,le),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,le)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function oe(A,_,B){let V=i.get(A);_!==void 0&&ze(V.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&ie(A)}function re(A){let _=A.texture,B=i.get(A),V=i.get(_);A.addEventListener("dispose",v);let j=A.textures,le=A.isWebGLCubeRenderTarget===!0,he=j.length>1;if(he||(V.__webglTexture===void 0&&(V.__webglTexture=n.createTexture()),V.__version=_.version,a.memory.textures++),le){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let J=0;J<_.mipmaps.length;J++)B.__webglFramebuffer[Z][J]=n.createFramebuffer()}else B.__webglFramebuffer[Z]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<_.mipmaps.length;Z++)B.__webglFramebuffer[Z]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(he)for(let Z=0,J=j.length;Z<J;Z++){let pe=i.get(j[Z]);pe.__webglTexture===void 0&&(pe.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&$e(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<j.length;Z++){let J=j[Z];B.__webglColorRenderbuffer[Z]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);let pe=r.convert(J.format,J.colorSpace),De=r.convert(J.type),_e=y(J.internalFormat,pe,De,J.normalized,J.colorSpace,A.isXRRenderTarget===!0),de=qe(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,de,_e,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Z,n.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),dt(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(le){t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture),We(n.TEXTURE_CUBE_MAP,_);for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)ze(B.__webglFramebuffer[Z][J],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,J);else ze(B.__webglFramebuffer[Z],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);g(_)&&w(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){for(let Z=0,J=j.length;Z<J;Z++){let pe=j[Z],De=i.get(pe),_e=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(_e=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(_e,De.__webglTexture),We(_e,pe),ze(B.__webglFramebuffer,A,pe,n.COLOR_ATTACHMENT0+Z,_e,0),g(pe)&&w(_e)}t.unbindTexture()}else{let Z=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Z=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Z,V.__webglTexture),We(Z,_),_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)ze(B.__webglFramebuffer[J],A,_,n.COLOR_ATTACHMENT0,Z,J);else ze(B.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,Z,0);g(_)&&w(Z),t.unbindTexture()}A.depthBuffer&&ie(A)}function ge(A){let _=A.textures;for(let B=0,V=_.length;B<V;B++){let j=_[B];if(g(j)){let le=E(A),he=i.get(j).__webglTexture;t.bindTexture(le,he),w(le),t.unbindTexture()}}}let ve=[],Re=[];function Le(A){if(A.samples>0){if($e(A)===!1){let _=A.textures,B=A.width,V=A.height,j=n.COLOR_BUFFER_BIT,le=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=i.get(A),Z=_.length>1;if(Z)for(let pe=0;pe<_.length;pe++)t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer);let J=A.texture.mipmaps;J&&J.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let pe=0;pe<_.length;pe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(j|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(j|=n.STENCIL_BUFFER_BIT)),Z){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,he.__webglColorRenderbuffer[pe]);let De=i.get(_[pe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,De,0)}n.blitFramebuffer(0,0,B,V,0,0,B,V,j,n.NEAREST),c===!0&&(ve.length=0,Re.length=0,ve.push(n.COLOR_ATTACHMENT0+pe),A.depthBuffer&&A.resolveDepthBuffer===!1&&(ve.push(le),Re.push(le),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Re)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ve))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Z)for(let pe=0;pe<_.length;pe++){t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,he.__webglColorRenderbuffer[pe]);let De=i.get(_[pe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,De,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function qe(A){return Math.min(s.maxSamples,A.samples)}function $e(A){let _=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function L(A){let _=a.render.frame;u.get(A)!==_&&(u.set(A,_),A.update())}function mt(A,_){let B=A.colorSpace,V=A.format,j=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==$r&&B!==Si&&(lt.getTransfer(B)===gt?(V!==gn||j!==on)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ge("WebGLTextures: Unsupported texture color space:",B)),_}function it(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=H,this.resetTextureUnits=U,this.getTextureUnits=q,this.setTextureUnits=R,this.setTexture2D=k,this.setTexture2DArray=$,this.setTexture3D=se,this.setTextureCube=ae,this.rebindTextures=oe,this.setupRenderTarget=re,this.updateRenderTargetMipmap=ge,this.updateMultisampleRenderTarget=Le,this.setupDepthRenderbuffer=ie,this.setupFrameBufferTexture=ze,this.useMultisampledRTT=$e,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function IM(n,e){function t(i,s=Si){let r,a=lt.getTransfer(s);if(i===on)return n.UNSIGNED_BYTE;if(i===mc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===gc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Vu)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Gu)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===zu)return n.BYTE;if(i===Hu)return n.SHORT;if(i===pr)return n.UNSIGNED_SHORT;if(i===pc)return n.INT;if(i===qn)return n.UNSIGNED_INT;if(i===Yn)return n.FLOAT;if(i===oi)return n.HALF_FLOAT;if(i===Wu)return n.ALPHA;if(i===Xu)return n.RGB;if(i===gn)return n.RGBA;if(i===si)return n.DEPTH_COMPONENT;if(i===ji)return n.DEPTH_STENCIL;if(i===qu)return n.RED;if(i===xc)return n.RED_INTEGER;if(i===Zi)return n.RG;if(i===vc)return n.RG_INTEGER;if(i===_c)return n.RGBA_INTEGER;if(i===ba||i===Ma||i===Sa||i===Ea)if(a===gt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ba)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ma)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Sa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ba)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ma)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Sa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ea)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===yc||i===bc||i===Mc||i===Sc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===yc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===bc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Mc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Sc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ec||i===wc||i===Tc||i===Ac||i===Cc||i===wa||i===Rc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ec||i===wc)return a===gt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Tc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ac)return r.COMPRESSED_R11_EAC;if(i===Cc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===wa)return r.COMPRESSED_RG11_EAC;if(i===Rc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ic||i===Pc||i===Dc||i===Lc||i===Oc||i===Nc||i===Fc||i===Uc||i===Bc||i===kc||i===zc||i===Hc||i===Vc||i===Gc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Ic)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Pc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Dc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Lc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Oc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Nc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Fc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Uc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Bc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===kc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===zc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Hc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Vc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Gc)return a===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Wc||i===Xc||i===qc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Wc)return a===gt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Xc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===qc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Yc||i===$c||i===Ta||i===jc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Yc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===$c)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ta)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===jc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===mr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var PM=\`
void main() {

	gl_Position = vec4( position, 1.0 );

}\`,DM=\`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}\`,ph=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new na(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Tn({vertexShader:PM,fragmentShader:DM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pt(new ha(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},mh=class extends Wn{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,h=null,f=null,d=null,p=null,x=typeof XRWebGLBinding<"u",m=new ph,g={},w=t.getContextAttributes(),E=null,y=null,T=[],b=[],C=new ce,v=null,S=new en;S.viewport=new Pt;let P=new en;P.viewport=new Pt;let I=[S,P],O=new uc,U=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ue=T[K];return ue===void 0&&(ue=new nr,T[K]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(K){let ue=T[K];return ue===void 0&&(ue=new nr,T[K]=ue),ue.getGripSpace()},this.getHand=function(K){let ue=T[K];return ue===void 0&&(ue=new nr,T[K]=ue),ue.getHandSpace()};function R(K){let ue=b.indexOf(K.inputSource);if(ue===-1)return;let ne=T[ue];ne!==void 0&&(ne.update(K.inputSource,K.frame,l||a),ne.dispatchEvent({type:K.type,data:K.inputSource}))}function H(){s.removeEventListener("select",R),s.removeEventListener("selectstart",R),s.removeEventListener("selectend",R),s.removeEventListener("squeeze",R),s.removeEventListener("squeezestart",R),s.removeEventListener("squeezeend",R),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",z);for(let K=0;K<T.length;K++){let ue=b[K];ue!==null&&(b[K]=null,T[K].disconnect(ue))}U=null,q=null,m.reset();for(let K in g)delete g[K];e.setRenderTarget(E),d=null,f=null,h=null,s=null,y=null,We.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",R),s.addEventListener("selectstart",R),s.addEventListener("selectend",R),s.addEventListener("squeeze",R),s.addEventListener("squeezestart",R),s.addEventListener("squeezeend",R),s.addEventListener("end",H),s.addEventListener("inputsourceschange",z),w.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let ne=null,Ie=null,Xe=null;w.depth&&(Xe=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=w.stencil?ji:si,Ie=w.stencil?mr:qn);let ze={colorFormat:t.RGBA8,depthFormat:Xe,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(ze),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),y=new Sn(f.textureWidth,f.textureHeight,{format:gn,type:on,depthTexture:new _i(f.textureWidth,f.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let ne={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,ne),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Sn(d.framebufferWidth,d.framebufferHeight,{format:gn,type:on,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),We.setContext(s),We.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function z(K){for(let ue=0;ue<K.removed.length;ue++){let ne=K.removed[ue],Ie=b.indexOf(ne);Ie>=0&&(b[Ie]=null,T[Ie].disconnect(ne))}for(let ue=0;ue<K.added.length;ue++){let ne=K.added[ue],Ie=b.indexOf(ne);if(Ie===-1){for(let ze=0;ze<T.length;ze++)if(ze>=b.length){b.push(ne),Ie=ze;break}else if(b[ze]===null){b[ze]=ne,Ie=ze;break}if(Ie===-1)break}let Xe=T[Ie];Xe&&Xe.connect(ne)}}let k=new D,$=new D;function se(K,ue,ne){k.setFromMatrixPosition(ue.matrixWorld),$.setFromMatrixPosition(ne.matrixWorld);let Ie=k.distanceTo($),Xe=ue.projectionMatrix.elements,ze=ne.projectionMatrix.elements,dt=Xe[14]/(Xe[10]-1),Ye=Xe[14]/(Xe[10]+1),ie=(Xe[9]+1)/Xe[5],oe=(Xe[9]-1)/Xe[5],re=(Xe[8]-1)/Xe[0],ge=(ze[8]+1)/ze[0],ve=dt*re,Re=dt*ge,Le=Ie/(-re+ge),qe=Le*-re;if(ue.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(qe),K.translateZ(Le),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Xe[10]===-1)K.projectionMatrix.copy(ue.projectionMatrix),K.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{let $e=dt+Le,L=Ye+Le,mt=ve-qe,it=Re+(Ie-qe),A=ie*Ye/L*$e,_=oe*Ye/L*$e;K.projectionMatrix.makePerspective(mt,it,A,_,$e,L),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function ae(K,ue){ue===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ue.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ue=K.near,ne=K.far;m.texture!==null&&(m.depthNear>0&&(ue=m.depthNear),m.depthFar>0&&(ne=m.depthFar)),O.near=P.near=S.near=ue,O.far=P.far=S.far=ne,(U!==O.near||q!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),U=O.near,q=O.far),O.layers.mask=K.layers.mask|6,S.layers.mask=O.layers.mask&-5,P.layers.mask=O.layers.mask&-3;let Ie=K.parent,Xe=O.cameras;ae(O,Ie);for(let ze=0;ze<Xe.length;ze++)ae(Xe[ze],Ie);Xe.length===2?se(O,S,P):O.projectionMatrix.copy(S.projectionMatrix),ee(K,O,Ie)};function ee(K,ue,ne){ne===null?K.matrix.copy(ue.matrixWorld):(K.matrix.copy(ne.matrixWorld),K.matrix.invert(),K.matrix.multiply(ue.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ue.projectionMatrix),K.projectionMatrixInverse.copy(ue.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=_s*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(f===null&&d===null))return c},this.setFoveation=function(K){c=K,f!==null&&(f.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(K){return g[K]};let we=null;function Ke(K,ue){if(u=ue.getViewerPose(l||a),p=ue,u!==null){let ne=u.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let Ie=!1;ne.length!==O.cameras.length&&(O.cameras.length=0,Ie=!0);for(let Ye=0;Ye<ne.length;Ye++){let ie=ne[Ye],oe=null;if(d!==null)oe=d.getViewport(ie);else{let ge=h.getViewSubImage(f,ie);oe=ge.viewport,Ye===0&&(e.setRenderTargetTextures(y,ge.colorTexture,ge.depthStencilTexture),e.setRenderTarget(y))}let re=I[Ye];re===void 0&&(re=new en,re.layers.enable(Ye),re.viewport=new Pt,I[Ye]=re),re.matrix.fromArray(ie.transform.matrix),re.matrix.decompose(re.position,re.quaternion,re.scale),re.projectionMatrix.fromArray(ie.projectionMatrix),re.projectionMatrixInverse.copy(re.projectionMatrix).invert(),re.viewport.set(oe.x,oe.y,oe.width,oe.height),Ye===0&&(O.matrix.copy(re.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Ie===!0&&O.cameras.push(re)}let Xe=s.enabledFeatures;if(Xe&&Xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let Ye=h.getDepthInformation(ne[0]);Ye&&Ye.isValid&&Ye.texture&&m.init(Ye,s.renderState)}if(Xe&&Xe.includes("camera-access")&&x){e.state.unbindTexture(),h=i.getBinding();for(let Ye=0;Ye<ne.length;Ye++){let ie=ne[Ye].camera;if(ie){let oe=g[ie];oe||(oe=new na,g[ie]=oe);let re=h.getCameraImage(ie);oe.sourceTexture=re}}}}for(let ne=0;ne<T.length;ne++){let Ie=b[ne],Xe=T[ne];Ie!==null&&Xe!==void 0&&Xe.update(Ie,ue,l||a)}we&&we(K,ue),ue.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ue}),p=null}let We=new fp;We.setAnimationLoop(Ke),this.setAnimationLoop=function(K){we=K},this.dispose=function(){}}},LM=new It,_p=new Ze;_p.set(-1,0,0,0,1,0,0,0,1);function OM(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,Ku(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,w,E,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),h(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),f(m,g),g.isMeshPhysicalMaterial&&d(m,g,y)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?c(m,g,w,E):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===fn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===fn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let w=e.get(g),E=w.envMap,y=w.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(LM.makeRotationFromEuler(y)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(_p),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,w,E){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*w,m.scale.value=E*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function f(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function d(m,g,w){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===fn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let w=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function NM(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,T){let b=T.program;i.uniformBlockBinding(y,b)}function l(y,T){let b=s[y.id];b===void 0&&(m(y),b=u(y),s[y.id]=b,y.addEventListener("dispose",w));let C=T.program;i.updateUBOMapping(y,C);let v=e.render.frame;r[y.id]!==v&&(f(y),r[y.id]=v)}function u(y){let T=h();y.__bindingPointIndex=T;let b=n.createBuffer(),C=y.__size,v=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,C,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,T,b),b}function h(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return Ge("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let T=s[y.id],b=y.uniforms,C=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,T);for(let v=0,S=b.length;v<S;v++){let P=b[v];if(Array.isArray(P))for(let I=0,O=P.length;I<O;I++)d(P[I],v,I,C);else d(P,v,0,C)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,T,b,C){if(x(y,T,b,C)===!0){let v=y.__offset,S=y.value;if(Array.isArray(S)){let P=0;for(let I=0;I<S.length;I++){let O=S[I],U=g(O);p(O,y.__data,P),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(P+=U.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(S,y.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,y.__data)}}function p(y,T,b){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,b)}function x(y,T,b,C){let v=y.value,S=T+"_"+b;if(C[S]===void 0)return typeof v=="number"||typeof v=="boolean"?C[S]=v:ArrayBuffer.isView(v)?C[S]=v.slice():C[S]=v.clone(),!0;{let P=C[S];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return C[S]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function m(y){let T=y.uniforms,b=0,C=16;for(let S=0,P=T.length;S<P;S++){let I=Array.isArray(T[S])?T[S]:[T[S]];for(let O=0,U=I.length;O<U;O++){let q=I[O],R=Array.isArray(q.value)?q.value:[q.value];for(let H=0,z=R.length;H<z;H++){let k=R[H],$=g(k),se=b%C,ae=se%$.boundary,ee=se+ae;b+=ae,ee!==0&&C-ee<$.storage&&(b+=C-ee),q.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=b,b+=$.storage}}}let v=b%C;return v>0&&(b+=C-v),y.__size=b,y.__cache={},this}function g(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):He("WebGLRenderer: Unsupported uniform value type.",y),T}function w(y){let T=y.target;T.removeEventListener("dispose",w);let b=a.indexOf(T.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function E(){for(let y in s)n.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:c,update:l,dispose:E}}var FM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ci=null;function UM(){return ci===null&&(ci=new sr(FM,16,16,Zi,oi),ci.name="DFG_LUT",ci.minFilter=Gt,ci.magFilter=Gt,ci.wrapS=ni,ci.wrapT=ni,ci.generateMipmaps=!1,ci.needsUpdate=!0),ci}var il=class{constructor(e={}){let{canvas:t=Of(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1,outputBufferType:d=on}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let x=d,m=new Set([_c,vc,xc]),g=new Set([on,qn,pr,mr,mc,gc]),w=new Uint32Array(4),E=new Int32Array(4),y=new D,T=null,b=null,C=[],v=[],S=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Rn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,O=null,U=null,q=null,R=null;this._outputColorSpace=Kt;let H=0,z=0,k=null,$=-1,se=null,ae=new Pt,ee=new Pt,we=null,Ke=new je(0),We=0,K=t.width,ue=t.height,ne=1,Ie=null,Xe=null,ze=new Pt(0,0,K,ue),dt=new Pt(0,0,K,ue),Ye=!1,ie=new rr,oe=!1,re=!1,ge=new It,ve=new D,Re=new Pt,Le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function $e(){return k===null?ne:1}let L=i;function mt(M,F){return t.getContext(M,F)}try{let M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",\`three.js r\${"185"}\`),t.addEventListener("webglcontextlost",At,!1),t.addEventListener("webglcontextrestored",vt,!1),t.addEventListener("webglcontextcreationerror",pn,!1),L===null){let F="webgl2";if(L=mt(F,M),L===null)throw mt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw Ge("WebGLRenderer: "+M.message),M}let it,A,_,B,V,j,le,he,Z,J,pe,De,_e,de,Be,Ve,Je,N,fe,Q,me,Me,te;function Ae(){it=new Wy(L),it.init(),me=new IM(L,it),A=new Fy(L,it,e,me),_=new CM(L,it),A.reversedDepthBuffer&&f&&_.buffers.depth.setReversed(!0),U=L.createFramebuffer(),q=L.createFramebuffer(),R=L.createFramebuffer(),B=new Yy(L),V=new pM,j=new RM(L,it,_,V,A,me,B),le=new Gy(P),he=new Kx(L),Me=new Oy(L,he),Z=new Xy(L,he,B,Me),J=new jy(L,Z,he,Me,B),N=new $y(L,A,j),Be=new Uy(V),pe=new fM(P,le,it,A,Me,Be),De=new OM(P,V),_e=new gM,de=new MM(it),Je=new Ly(P,le,_,J,p,c),Ve=new AM(P,J,A),te=new NM(L,B,A,_),fe=new Ny(L,it,B),Q=new qy(L,it,B),B.programs=pe.programs,P.capabilities=A,P.extensions=it,P.properties=V,P.renderLists=_e,P.shadowMap=Ve,P.state=_,P.info=B}Ae(),x!==on&&(S=new Ky(x,t.width,t.height,o,s,r));let Pe=new mh(P,L);this.xr=Pe,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let M=it.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=it.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return ne},this.setPixelRatio=function(M){M!==void 0&&(ne=M,this.setSize(K,ue,!1))},this.getSize=function(M){return M.set(K,ue)},this.setSize=function(M,F,Y=!0){if(Pe.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}K=M,ue=F,t.width=Math.floor(M*ne),t.height=Math.floor(F*ne),Y===!0&&(t.style.width=M+"px",t.style.height=F+"px"),S!==null&&S.setSize(t.width,t.height),this.setViewport(0,0,M,F)},this.getDrawingBufferSize=function(M){return M.set(K*ne,ue*ne).floor()},this.setDrawingBufferSize=function(M,F,Y){K=M,ue=F,ne=Y,t.width=Math.floor(M*Y),t.height=Math.floor(F*Y),this.setViewport(0,0,M,F)},this.setEffects=function(M){if(x===on){Ge("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let F=0;F<M.length;F++)if(M[F].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}S.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(ae)},this.getViewport=function(M){return M.copy(ze)},this.setViewport=function(M,F,Y,W){M.isVector4?ze.set(M.x,M.y,M.z,M.w):ze.set(M,F,Y,W),_.viewport(ae.copy(ze).multiplyScalar(ne).round())},this.getScissor=function(M){return M.copy(dt)},this.setScissor=function(M,F,Y,W){M.isVector4?dt.set(M.x,M.y,M.z,M.w):dt.set(M,F,Y,W),_.scissor(ee.copy(dt).multiplyScalar(ne).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(M){_.setScissorTest(Ye=M)},this.setOpaqueSort=function(M){Ie=M},this.setTransparentSort=function(M){Xe=M},this.getClearColor=function(M){return M.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor(...arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha(...arguments)},this.clear=function(M=!0,F=!0,Y=!0){let W=0;if(M){let X=!1;if(k!==null){let Ee=k.texture.format;X=m.has(Ee)}if(X){let Ee=k.texture.type,Ce=g.has(Ee),Se=Je.getClearColor(),Oe=Je.getClearAlpha(),Ue=Se.r,tt=Se.g,rt=Se.b;Ce?(w[0]=Ue,w[1]=tt,w[2]=rt,w[3]=Oe,L.clearBufferuiv(L.COLOR,0,w)):(E[0]=Ue,E[1]=tt,E[2]=rt,E[3]=Oe,L.clearBufferiv(L.COLOR,0,E))}else W|=L.COLOR_BUFFER_BIT}F&&(W|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(W|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&L.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),O=M},this.dispose=function(){t.removeEventListener("webglcontextlost",At,!1),t.removeEventListener("webglcontextrestored",vt,!1),t.removeEventListener("webglcontextcreationerror",pn,!1),Je.dispose(),_e.dispose(),de.dispose(),V.dispose(),le.dispose(),J.dispose(),Me.dispose(),te.dispose(),pe.dispose(),Pe.dispose(),Pe.removeEventListener("sessionstart",rs),Pe.removeEventListener("sessionend",Or),Kn.stop()};function At(M){M.preventDefault(),$u("WebGLRenderer: Context Lost."),I=!0}function vt(){$u("WebGLRenderer: Context Restored."),I=!1;let M=B.autoReset,F=Ve.enabled,Y=Ve.autoUpdate,W=Ve.needsUpdate,X=Ve.type;Ae(),B.autoReset=M,Ve.enabled=F,Ve.autoUpdate=Y,Ve.needsUpdate=W,Ve.type=X}function pn(M){Ge("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ln(M){let F=M.target;F.removeEventListener("dispose",Ln),ja(F)}function ja(M){Dr(M),V.remove(M)}function Dr(M){let F=V.get(M).programs;F!==void 0&&(F.forEach(function(Y){pe.releaseProgram(Y)}),M.isShaderMaterial&&pe.releaseShaderCache(M))}this.renderBufferDirect=function(M,F,Y,W,X,Ee){F===null&&(F=Le);let Ce=X.isMesh&&X.matrixWorld.determinantAffine()<0,Se=as(M,F,Y,W,X);_.setMaterial(W,Ce);let Oe=Y.index,Ue=1;if(W.wireframe===!0){if(Oe=Z.getWireframeAttribute(Y),Oe===void 0)return;Ue=2}let tt=Y.drawRange,rt=Y.attributes.position,ke=tt.start*Ue,yt=(tt.start+tt.count)*Ue;Ee!==null&&(ke=Math.max(ke,Ee.start*Ue),yt=Math.min(yt,(Ee.start+Ee.count)*Ue)),Oe!==null?(ke=Math.max(ke,0),yt=Math.min(yt,Oe.count)):rt!=null&&(ke=Math.max(ke,0),yt=Math.min(yt,rt.count));let Ft=yt-ke;if(Ft<0||Ft===1/0)return;Me.setup(X,W,Se,Y,Oe);let Ot,St=fe;if(Oe!==null&&(Ot=he.get(Oe),St=Q,St.setIndex(Ot)),X.isMesh)W.wireframe===!0?(_.setLineWidth(W.wireframeLinewidth*$e()),St.setMode(L.LINES)):St.setMode(L.TRIANGLES);else if(X.isLine){let sn=W.linewidth;sn===void 0&&(sn=1),_.setLineWidth(sn*$e()),X.isLineSegments?St.setMode(L.LINES):X.isLineLoop?St.setMode(L.LINE_LOOP):St.setMode(L.LINE_STRIP)}else X.isPoints?St.setMode(L.POINTS):X.isSprite&&St.setMode(L.TRIANGLES);if(X.isBatchedMesh)if(it.get("WEBGL_multi_draw"))St.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let sn=X._multiDrawStarts,Te=X._multiDrawCounts,_n=X._multiDrawCount,ft=Oe?he.get(Oe).bytesPerElement:1,On=V.get(W).currentProgram.getUniforms();for(let Qn=0;Qn<_n;Qn++)On.setValue(L,"_gl_DrawID",Qn),St.render(sn[Qn]/ft,Te[Qn])}else if(X.isInstancedMesh)St.renderInstances(ke,Ft,X.count);else if(Y.isInstancedBufferGeometry){let sn=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Te=Math.min(Y.instanceCount,sn);St.renderInstances(ke,Ft,Te)}else St.render(ke,Ft)};function Lr(M,F,Y){M.transparent===!0&&M.side===nn&&M.forceSinglePass===!1?(M.side=fn,M.needsUpdate=!0,Qe(M,F,Y),M.side=Un,M.needsUpdate=!0,Qe(M,F,Y),M.side=nn):Qe(M,F,Y)}this.compile=function(M,F,Y=null){Y===null&&(Y=M),b=de.get(Y),b.init(F),v.push(b),Y.traverseVisible(function(X){X.isLight&&X.layers.test(F.layers)&&(b.pushLight(X),X.castShadow&&b.pushShadow(X))}),M!==Y&&M.traverseVisible(function(X){X.isLight&&X.layers.test(F.layers)&&(b.pushLight(X),X.castShadow&&b.pushShadow(X))}),b.setupLights();let W=new Set;return M.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let Ee=X.material;if(Ee)if(Array.isArray(Ee))for(let Ce=0;Ce<Ee.length;Ce++){let Se=Ee[Ce];Lr(Se,Y,X),W.add(Se)}else Lr(Ee,Y,X),W.add(Ee)}),b=v.pop(),W},this.compileAsync=function(M,F,Y=null){let W=this.compile(M,F,Y);return new Promise(X=>{function Ee(){if(W.forEach(function(Ce){V.get(Ce).currentProgram.isReady()&&W.delete(Ce)}),W.size===0){X(M);return}setTimeout(Ee,10)}it.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let Ds=null;function Za(M){Ds&&Ds(M)}function rs(){Kn.stop()}function Or(){Kn.start()}let Kn=new fp;Kn.setAnimationLoop(Za),typeof self<"u"&&Kn.setContext(self),this.setAnimationLoop=function(M){Ds=M,Pe.setAnimationLoop(M),M===null?Kn.stop():Kn.start()},Pe.addEventListener("sessionstart",rs),Pe.addEventListener("sessionend",Or),this.render=function(M,F){if(F!==void 0&&F.isCamera!==!0){Ge("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;O!==null&&O.renderStart(M,F);let Y=Pe.enabled===!0&&Pe.isPresenting===!0,W=S!==null&&(k===null||Y)&&S.begin(P,k);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Pe.enabled===!0&&Pe.isPresenting===!0&&(S===null||S.isCompositing()===!1)&&(Pe.cameraAutoUpdate===!0&&Pe.updateCamera(F),F=Pe.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,F,k),b=de.get(M,v.length),b.init(F),b.state.textureUnits=j.getTextureUnits(),v.push(b),ge.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),ie.setFromProjectionMatrix(ge,Gn,F.reversedDepth),re=this.localClippingEnabled,oe=Be.init(this.clippingPlanes,re),T=_e.get(M,C.length),T.init(),C.push(T),Pe.enabled===!0&&Pe.isPresenting===!0){let Ce=P.xr.getDepthSensingMesh();Ce!==null&&Ls(Ce,F,-1/0,P.sortObjects)}Ls(M,F,0,P.sortObjects),T.finish(),P.sortObjects===!0&&T.sort(Ie,Xe,F.reversedDepth),qe=Pe.enabled===!1||Pe.isPresenting===!1||Pe.hasDepthSensing()===!1,qe&&Je.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),oe===!0&&Be.beginShadows();let X=b.state.shadowsArray;if(Ve.render(X,M,F),oe===!0&&Be.endShadows(),(W&&S.hasRenderPass())===!1){let Ce=T.opaque,Se=T.transmissive;if(b.setupLights(),F.isArrayCamera){let Oe=F.cameras;if(Se.length>0)for(let Ue=0,tt=Oe.length;Ue<tt;Ue++){let rt=Oe[Ue];xe(Ce,Se,M,rt)}qe&&Je.render(M);for(let Ue=0,tt=Oe.length;Ue<tt;Ue++){let rt=Oe[Ue];G(T,M,rt,rt.viewport)}}else Se.length>0&&xe(Ce,Se,M,F),qe&&Je.render(M),G(T,M,F)}k!==null&&z===0&&(j.updateMultisampleRenderTarget(k),j.updateRenderTargetMipmap(k)),W&&S.end(P),M.isScene===!0&&M.onAfterRender(P,M,F),Me.resetDefaultState(),$=-1,se=null,v.pop(),v.length>0?(b=v[v.length-1],j.setTextureUnits(b.state.textureUnits),oe===!0&&Be.setGlobalState(P.clippingPlanes,b.state.camera)):b=null,C.pop(),C.length>0?T=C[C.length-1]:T=null,O!==null&&O.renderEnd()};function Ls(M,F,Y,W){if(M.visible===!1)return;if(M.layers.test(F.layers)){if(M.isGroup)Y=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(F);else if(M.isLightProbeGrid)b.pushLightProbeGrid(M);else if(M.isLight)b.pushLight(M),M.castShadow&&b.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||ie.intersectsSprite(M)){W&&Re.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ge);let Ce=J.update(M),Se=M.material;Se.visible&&T.push(M,Ce,Se,Y,Re.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||ie.intersectsObject(M))){let Ce=J.update(M),Se=M.material;if(W&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Re.copy(M.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),Re.copy(Ce.boundingSphere.center)),Re.applyMatrix4(M.matrixWorld).applyMatrix4(ge)),Array.isArray(Se)){let Oe=Ce.groups;for(let Ue=0,tt=Oe.length;Ue<tt;Ue++){let rt=Oe[Ue],ke=Se[rt.materialIndex];ke&&ke.visible&&T.push(M,Ce,ke,Y,Re.z,rt)}}else Se.visible&&T.push(M,Ce,Se,Y,Re.z,null)}}let Ee=M.children;for(let Ce=0,Se=Ee.length;Ce<Se;Ce++)Ls(Ee[Ce],F,Y,W)}function G(M,F,Y,W){let{opaque:X,transmissive:Ee,transparent:Ce}=M;b.setupLightsView(Y),oe===!0&&Be.setGlobalState(P.clippingPlanes,Y),W&&_.viewport(ae.copy(W)),X.length>0&&ye(X,F,Y),Ee.length>0&&ye(Ee,F,Y),Ce.length>0&&ye(Ce,F,Y),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function xe(M,F,Y,W){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[W.id]===void 0){let ke=it.has("EXT_color_buffer_half_float")||it.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[W.id]=new Sn(1,1,{generateMipmaps:!0,type:ke?oi:on,minFilter:ai,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:lt.workingColorSpace})}let Ee=b.state.transmissionRenderTarget[W.id],Ce=W.viewport||ae;Ee.setSize(Ce.z*P.transmissionResolutionScale,Ce.w*P.transmissionResolutionScale);let Se=P.getRenderTarget(),Oe=P.getActiveCubeFace(),Ue=P.getActiveMipmapLevel();P.setRenderTarget(Ee),P.getClearColor(Ke),We=P.getClearAlpha(),We<1&&P.setClearColor(16777215,.5),P.clear(),qe&&Je.render(Y);let tt=P.toneMapping;P.toneMapping=Rn;let rt=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),b.setupLightsView(W),oe===!0&&Be.setGlobalState(P.clippingPlanes,W),ye(M,Y,W),j.updateMultisampleRenderTarget(Ee),j.updateRenderTargetMipmap(Ee),it.has("WEBGL_multisampled_render_to_texture")===!1){let ke=!1;for(let yt=0,Ft=F.length;yt<Ft;yt++){let Ot=F[yt],{object:St,geometry:sn,material:Te,group:_n}=Ot;if(Te.side===nn&&St.layers.test(W.layers)){let ft=Te.side;Te.side=fn,Te.needsUpdate=!0,et(St,Y,W,sn,Te,_n),Te.side=ft,Te.needsUpdate=!0,ke=!0}}ke===!0&&(j.updateMultisampleRenderTarget(Ee),j.updateRenderTargetMipmap(Ee))}P.setRenderTarget(Se,Oe,Ue),P.setClearColor(Ke,We),rt!==void 0&&(W.viewport=rt),P.toneMapping=tt}function ye(M,F,Y){let W=F.isScene===!0?F.overrideMaterial:null;for(let X=0,Ee=M.length;X<Ee;X++){let Ce=M[X],{object:Se,geometry:Oe,group:Ue}=Ce,tt=Ce.material;tt.allowOverride===!0&&W!==null&&(tt=W),Se.layers.test(Y.layers)&&et(Se,F,Y,Oe,tt,Ue)}}function et(M,F,Y,W,X,Ee){M.onBeforeRender(P,F,Y,W,X,Ee),M.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),X.onBeforeRender(P,F,Y,W,M,Ee),X.transparent===!0&&X.side===nn&&X.forceSinglePass===!1?(X.side=fn,X.needsUpdate=!0,P.renderBufferDirect(Y,F,W,X,M,Ee),X.side=Un,X.needsUpdate=!0,P.renderBufferDirect(Y,F,W,X,M,Ee),X.side=nn):P.renderBufferDirect(Y,F,W,X,M,Ee),M.onAfterRender(P,F,Y,W,X,Ee)}function Qe(M,F,Y){F.isScene!==!0&&(F=Le);let W=V.get(M),X=b.state.lights,Ee=b.state.shadowsArray,Ce=X.state.version,Se=pe.getParameters(M,X.state,Ee,F,Y,b.state.lightProbeGridArray),Oe=pe.getProgramCacheKey(Se),Ue=W.programs;W.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?F.environment:null,W.fog=F.fog;let tt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;W.envMap=le.get(M.envMap||W.environment,tt),W.envMapRotation=W.environment!==null&&M.envMap===null?F.environmentRotation:M.envMapRotation,Ue===void 0&&(M.addEventListener("dispose",Ln),Ue=new Map,W.programs=Ue);let rt=Ue.get(Oe);if(rt!==void 0){if(W.currentProgram===rt&&W.lightsStateVersion===Ce)return Jn(M,Se),rt}else Se.uniforms=pe.getUniforms(M),O!==null&&M.isNodeMaterial&&O.build(M,Y,Se),M.onBeforeCompile(Se,P),rt=pe.acquireProgram(Se,Oe),Ue.set(Oe,rt),W.uniforms=Se.uniforms;let ke=W.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(ke.clippingPlanes=Be.uniform),Jn(M,Se),W.needsLights=Nr(M),W.lightsStateVersion=Ce,W.needsLights&&(ke.ambientLightColor.value=X.state.ambient,ke.lightProbe.value=X.state.probe,ke.directionalLights.value=X.state.directional,ke.directionalLightShadows.value=X.state.directionalShadow,ke.spotLights.value=X.state.spot,ke.spotLightShadows.value=X.state.spotShadow,ke.rectAreaLights.value=X.state.rectArea,ke.ltc_1.value=X.state.rectAreaLTC1,ke.ltc_2.value=X.state.rectAreaLTC2,ke.pointLights.value=X.state.point,ke.pointLightShadows.value=X.state.pointShadow,ke.hemisphereLights.value=X.state.hemi,ke.directionalShadowMatrix.value=X.state.directionalShadowMatrix,ke.spotLightMatrix.value=X.state.spotLightMatrix,ke.spotLightMap.value=X.state.spotLightMap,ke.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=b.state.lightProbeGridArray.length>0,W.currentProgram=rt,W.uniformsList=null,rt}function wt(M){if(M.uniformsList===null){let F=M.currentProgram.getUniforms();M.uniformsList=xr.seqWithValue(F.seq,M.uniforms)}return M.uniformsList}function Jn(M,F){let Y=V.get(M);Y.outputColorSpace=F.outputColorSpace,Y.batching=F.batching,Y.batchingColor=F.batchingColor,Y.instancing=F.instancing,Y.instancingColor=F.instancingColor,Y.instancingMorph=F.instancingMorph,Y.skinning=F.skinning,Y.morphTargets=F.morphTargets,Y.morphNormals=F.morphNormals,Y.morphColors=F.morphColors,Y.morphTargetsCount=F.morphTargetsCount,Y.numClippingPlanes=F.numClippingPlanes,Y.numIntersection=F.numClipIntersection,Y.vertexAlphas=F.vertexAlphas,Y.vertexTangents=F.vertexTangents,Y.toneMapping=F.toneMapping}function Ci(M,F){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(F.matrixWorld);for(let Y=0,W=M.length;Y<W;Y++){let X=M[Y];if(X.texture!==null&&X.boundingBox.containsPoint(y))return X}return null}function as(M,F,Y,W,X){F.isScene!==!0&&(F=Le),j.resetTextureUnits();let Ee=F.fog,Ce=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?F.environment:null,Se=k===null?P.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:lt.workingColorSpace,Oe=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Ue=le.get(W.envMap||Ce,Oe),tt=W.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,rt=!!Y.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),ke=!!Y.morphAttributes.position,yt=!!Y.morphAttributes.normal,Ft=!!Y.morphAttributes.color,Ot=Rn;W.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Ot=P.toneMapping);let St=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,sn=St!==void 0?St.length:0,Te=V.get(W),_n=b.state.lights;if(oe===!0&&(re===!0||M!==se)){let Tt=M===se&&W.id===$;Be.setState(W,M,Tt)}let ft=!1;W.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==_n.state.version||Te.outputColorSpace!==Se||X.isBatchedMesh&&Te.batching===!1||!X.isBatchedMesh&&Te.batching===!0||X.isBatchedMesh&&Te.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Te.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Te.instancing===!1||!X.isInstancedMesh&&Te.instancing===!0||X.isSkinnedMesh&&Te.skinning===!1||!X.isSkinnedMesh&&Te.skinning===!0||X.isInstancedMesh&&Te.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Te.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Te.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Te.instancingMorph===!1&&X.morphTexture!==null||Te.envMap!==Ue||W.fog===!0&&Te.fog!==Ee||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==Be.numPlanes||Te.numIntersection!==Be.numIntersection)||Te.vertexAlphas!==tt||Te.vertexTangents!==rt||Te.morphTargets!==ke||Te.morphNormals!==yt||Te.morphColors!==Ft||Te.toneMapping!==Ot||Te.morphTargetsCount!==sn||!!Te.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(ft=!0):(ft=!0,Te.__version=W.version);let On=Te.currentProgram;ft===!0&&(On=Qe(W,F,X),O&&W.isNodeMaterial&&O.onUpdateProgram(W,On,Te));let Qn=!1,Ri=!1,Os=!1,Et=On.getUniforms(),Ut=Te.uniforms;if(_.useProgram(On.program)&&(Qn=!0,Ri=!0,Os=!0),W.id!==$&&($=W.id,Ri=!0),Te.needsLights){let Tt=Ci(b.state.lightProbeGridArray,X);Te.lightProbeGrid!==Tt&&(Te.lightProbeGrid=Tt,Ri=!0)}if(Qn||se!==M){_.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Et.setValue(L,"projectionMatrix",M.projectionMatrix),Et.setValue(L,"viewMatrix",M.matrixWorldInverse);let Pi=Et.map.cameraPosition;Pi!==void 0&&Pi.setValue(L,ve.setFromMatrixPosition(M.matrixWorld)),A.logarithmicDepthBuffer&&Et.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&Et.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),se!==M&&(se=M,Ri=!0,Os=!0)}if(Te.needsLights&&(_n.state.directionalShadowMap.length>0&&Et.setValue(L,"directionalShadowMap",_n.state.directionalShadowMap,j),_n.state.spotShadowMap.length>0&&Et.setValue(L,"spotShadowMap",_n.state.spotShadowMap,j),_n.state.pointShadowMap.length>0&&Et.setValue(L,"pointShadowMap",_n.state.pointShadowMap,j)),X.isSkinnedMesh){Et.setOptional(L,X,"bindMatrix"),Et.setOptional(L,X,"bindMatrixInverse");let Tt=X.skeleton;Tt&&(Tt.boneTexture===null&&Tt.computeBoneTexture(),Et.setValue(L,"boneTexture",Tt.boneTexture,j))}X.isBatchedMesh&&(Et.setOptional(L,X,"batchingTexture"),Et.setValue(L,"batchingTexture",X._matricesTexture,j),Et.setOptional(L,X,"batchingIdTexture"),Et.setValue(L,"batchingIdTexture",X._indirectTexture,j),Et.setOptional(L,X,"batchingColorTexture"),X._colorsTexture!==null&&Et.setValue(L,"batchingColorTexture",X._colorsTexture,j));let Ii=Y.morphAttributes;if((Ii.position!==void 0||Ii.normal!==void 0||Ii.color!==void 0)&&N.update(X,Y,On),(Ri||Te.receiveShadow!==X.receiveShadow)&&(Te.receiveShadow=X.receiveShadow,Et.setValue(L,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&F.environment!==null&&(Ut.envMapIntensity.value=F.environmentIntensity),Ut.dfgLUT!==void 0&&(Ut.dfgLUT.value=UM()),Ri){if(Et.setValue(L,"toneMappingExposure",P.toneMappingExposure),Te.needsLights&&kn(Ut,Os),Ee&&W.fog===!0&&De.refreshFogUniforms(Ut,Ee),De.refreshMaterialUniforms(Ut,W,ne,ue,b.state.transmissionRenderTarget[M.id]),Te.needsLights&&Te.lightProbeGrid){let Tt=Te.lightProbeGrid;Ut.probesSH.value=Tt.texture,Ut.probesMin.value.copy(Tt.boundingBox.min),Ut.probesMax.value.copy(Tt.boundingBox.max),Ut.probesResolution.value.copy(Tt.resolution)}xr.upload(L,wt(Te),Ut,j)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(xr.upload(L,wt(Te),Ut,j),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&Et.setValue(L,"center",X.center),Et.setValue(L,"modelViewMatrix",X.modelViewMatrix),Et.setValue(L,"normalMatrix",X.normalMatrix),Et.setValue(L,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){let Tt=W.uniformsGroups;for(let Pi=0,Ns=Tt.length;Pi<Ns;Pi++){let ad=Tt[Pi];te.update(ad,On),te.bind(ad,On)}}return On}function kn(M,F){M.ambientLightColor.needsUpdate=F,M.lightProbe.needsUpdate=F,M.directionalLights.needsUpdate=F,M.directionalLightShadows.needsUpdate=F,M.pointLights.needsUpdate=F,M.pointLightShadows.needsUpdate=F,M.spotLights.needsUpdate=F,M.spotLightShadows.needsUpdate=F,M.rectAreaLights.needsUpdate=F,M.hemisphereLights.needsUpdate=F}function Nr(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(M,F,Y){let W=V.get(M);W.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),V.get(M.texture).__webglTexture=F,V.get(M.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Y,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,F){let Y=V.get(M);Y.__webglFramebuffer=F,Y.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(M,F=0,Y=0){k=M,H=F,z=Y;let W=null,X=!1,Ee=!1;if(M){let Se=V.get(M);if(Se.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(L.FRAMEBUFFER,Se.__webglFramebuffer),ae.copy(M.viewport),ee.copy(M.scissor),we=M.scissorTest,_.viewport(ae),_.scissor(ee),_.setScissorTest(we),$=-1;return}else if(Se.__webglFramebuffer===void 0)j.setupRenderTarget(M);else if(Se.__hasExternalTextures)j.rebindTextures(M,V.get(M.texture).__webglTexture,V.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let tt=M.depthTexture;if(Se.__boundDepthTexture!==tt){if(tt!==null&&V.has(tt)&&(M.width!==tt.image.width||M.height!==tt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");j.setupDepthRenderbuffer(M)}}let Oe=M.texture;(Oe.isData3DTexture||Oe.isDataArrayTexture||Oe.isCompressedArrayTexture)&&(Ee=!0);let Ue=V.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ue[F])?W=Ue[F][Y]:W=Ue[F],X=!0):M.samples>0&&j.useMultisampledRTT(M)===!1?W=V.get(M).__webglMultisampledFramebuffer:Array.isArray(Ue)?W=Ue[Y]:W=Ue,ae.copy(M.viewport),ee.copy(M.scissor),we=M.scissorTest}else ae.copy(ze).multiplyScalar(ne).floor(),ee.copy(dt).multiplyScalar(ne).floor(),we=Ye;if(Y!==0&&(W=U),_.bindFramebuffer(L.FRAMEBUFFER,W)&&_.drawBuffers(M,W),_.viewport(ae),_.scissor(ee),_.setScissorTest(we),X){let Se=V.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,Se.__webglTexture,Y)}else if(Ee){let Se=F;for(let Oe=0;Oe<M.textures.length;Oe++){let Ue=V.get(M.textures[Oe]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Oe,Ue.__webglTexture,Y,Se)}}else if(M!==null&&Y!==0){let Se=V.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Se.__webglTexture,Y)}$=-1},this.readRenderTargetPixels=function(M,F,Y,W,X,Ee,Ce,Se=0){if(!(M&&M.isWebGLRenderTarget)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Oe=V.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Oe=Oe[Ce]),Oe){_.bindFramebuffer(L.FRAMEBUFFER,Oe);try{let Ue=M.textures[Se],tt=Ue.format,rt=Ue.type;if(M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Se),!A.textureFormatReadable(tt)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!A.textureTypeReadable(rt)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=M.width-W&&Y>=0&&Y<=M.height-X&&L.readPixels(F,Y,W,X,me.convert(tt),me.convert(rt),Ee)}finally{let Ue=k!==null?V.get(k).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(M,F,Y,W,X,Ee,Ce,Se=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Oe=V.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Oe=Oe[Ce]),Oe)if(F>=0&&F<=M.width-W&&Y>=0&&Y<=M.height-X){_.bindFramebuffer(L.FRAMEBUFFER,Oe);let Ue=M.textures[Se],tt=Ue.format,rt=Ue.type;if(M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Se),!A.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!A.textureTypeReadable(rt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ke=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ke),L.bufferData(L.PIXEL_PACK_BUFFER,Ee.byteLength,L.STREAM_READ),L.readPixels(F,Y,W,X,me.convert(tt),me.convert(rt),0);let yt=k!==null?V.get(k).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,yt);let Ft=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Ff(L,Ft,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ke),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Ee),L.deleteBuffer(ke),L.deleteSync(Ft),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,F=null,Y=0){let W=Math.pow(2,-Y),X=Math.floor(M.image.width*W),Ee=Math.floor(M.image.height*W),Ce=F!==null?F.x:0,Se=F!==null?F.y:0;j.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,Y,0,0,Ce,Se,X,Ee),_.unbindTexture()},this.copyTextureToTexture=function(M,F,Y=null,W=null,X=0,Ee=0){let Ce,Se,Oe,Ue,tt,rt,ke,yt,Ft,Ot=M.isCompressedTexture?M.mipmaps[Ee]:M.image;if(Y!==null)Ce=Y.max.x-Y.min.x,Se=Y.max.y-Y.min.y,Oe=Y.isBox3?Y.max.z-Y.min.z:1,Ue=Y.min.x,tt=Y.min.y,rt=Y.isBox3?Y.min.z:0;else{let Ut=Math.pow(2,-X);Ce=Math.floor(Ot.width*Ut),Se=Math.floor(Ot.height*Ut),M.isDataArrayTexture?Oe=Ot.depth:M.isData3DTexture?Oe=Math.floor(Ot.depth*Ut):Oe=1,Ue=0,tt=0,rt=0}W!==null?(ke=W.x,yt=W.y,Ft=W.z):(ke=0,yt=0,Ft=0);let St=me.convert(F.format),sn=me.convert(F.type),Te;F.isData3DTexture?(j.setTexture3D(F,0),Te=L.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(j.setTexture2DArray(F,0),Te=L.TEXTURE_2D_ARRAY):(j.setTexture2D(F,0),Te=L.TEXTURE_2D),_.activeTexture(L.TEXTURE0),_.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,F.flipY),_.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),_.pixelStorei(L.UNPACK_ALIGNMENT,F.unpackAlignment);let _n=_.getParameter(L.UNPACK_ROW_LENGTH),ft=_.getParameter(L.UNPACK_IMAGE_HEIGHT),On=_.getParameter(L.UNPACK_SKIP_PIXELS),Qn=_.getParameter(L.UNPACK_SKIP_ROWS),Ri=_.getParameter(L.UNPACK_SKIP_IMAGES);_.pixelStorei(L.UNPACK_ROW_LENGTH,Ot.width),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ot.height),_.pixelStorei(L.UNPACK_SKIP_PIXELS,Ue),_.pixelStorei(L.UNPACK_SKIP_ROWS,tt),_.pixelStorei(L.UNPACK_SKIP_IMAGES,rt);let Os=M.isDataArrayTexture||M.isData3DTexture,Et=F.isDataArrayTexture||F.isData3DTexture;if(M.isDepthTexture){let Ut=V.get(M),Ii=V.get(F),Tt=V.get(Ut.__renderTarget),Pi=V.get(Ii.__renderTarget);_.bindFramebuffer(L.READ_FRAMEBUFFER,Tt.__webglFramebuffer),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,Pi.__webglFramebuffer);for(let Ns=0;Ns<Oe;Ns++)Os&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,V.get(M).__webglTexture,X,rt+Ns),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,V.get(F).__webglTexture,Ee,Ft+Ns)),L.blitFramebuffer(Ue,tt,Ce,Se,ke,yt,Ce,Se,L.DEPTH_BUFFER_BIT,L.NEAREST);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(X!==0||M.isRenderTargetTexture||V.has(M)){let Ut=V.get(M),Ii=V.get(F);_.bindFramebuffer(L.READ_FRAMEBUFFER,q),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,R);for(let Tt=0;Tt<Oe;Tt++)Os?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ut.__webglTexture,X,rt+Tt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ut.__webglTexture,X),Et?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ii.__webglTexture,Ee,Ft+Tt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ii.__webglTexture,Ee),X!==0?L.blitFramebuffer(Ue,tt,Ce,Se,ke,yt,Ce,Se,L.COLOR_BUFFER_BIT,L.NEAREST):Et?L.copyTexSubImage3D(Te,Ee,ke,yt,Ft+Tt,Ue,tt,Ce,Se):L.copyTexSubImage2D(Te,Ee,ke,yt,Ue,tt,Ce,Se);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Et?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(Te,Ee,ke,yt,Ft,Ce,Se,Oe,St,sn,Ot.data):F.isCompressedArrayTexture?L.compressedTexSubImage3D(Te,Ee,ke,yt,Ft,Ce,Se,Oe,St,Ot.data):L.texSubImage3D(Te,Ee,ke,yt,Ft,Ce,Se,Oe,St,sn,Ot):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Ee,ke,yt,Ce,Se,St,sn,Ot.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Ee,ke,yt,Ot.width,Ot.height,St,Ot.data):L.texSubImage2D(L.TEXTURE_2D,Ee,ke,yt,Ce,Se,St,sn,Ot);_.pixelStorei(L.UNPACK_ROW_LENGTH,_n),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ft),_.pixelStorei(L.UNPACK_SKIP_PIXELS,On),_.pixelStorei(L.UNPACK_SKIP_ROWS,Qn),_.pixelStorei(L.UNPACK_SKIP_IMAGES,Ri),Ee===0&&F.generateMipmaps&&L.generateMipmap(Te),_.unbindTexture()},this.initRenderTarget=function(M){V.get(M).__webglFramebuffer===void 0&&j.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?j.setTextureCube(M,0):M.isData3DTexture?j.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?j.setTexture2DArray(M,0):j.setTexture2D(M,0),_.unbindTexture()},this.resetState=function(){H=0,z=0,k=null,_.reset(),Me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Gn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=lt._getDrawingBufferColorSpace(e),t.unpackColorSpace=lt._getUnpackColorSpace()}};var yp={type:"change"},xh={type:"start"},Mp={type:"end"},al=new ys,bp=new Fn,BM=Math.cos(70*ut.DEG2RAD),Yt=new D,xn=2*Math.PI,Mt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},gh=1e-6,ol=class extends va{constructor(e,t=null){super(e,t),this.state=Mt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:qi.ROTATE,MIDDLE:qi.DOLLY,RIGHT:qi.PAN},this.touches={ONE:Yi.ROTATE,TWO:Yi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Mn,this._lastTargetPosition=new D,this._quat=new Mn().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new hr,this._sphericalDelta=new hr,this._scale=1,this._panOffset=new D,this._rotateStart=new ce,this._rotateEnd=new ce,this._rotateDelta=new ce,this._panStart=new ce,this._panEnd=new ce,this._panDelta=new ce,this._dollyStart=new ce,this._dollyEnd=new ce,this._dollyDelta=new ce,this._dollyDirection=new D,this._mouse=new ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=zM.bind(this),this._onPointerDown=kM.bind(this),this._onPointerUp=HM.bind(this),this._onContextMenu=$M.bind(this),this._onMouseWheel=WM.bind(this),this._onKeyDown=XM.bind(this),this._onTouchStart=qM.bind(this),this._onTouchMove=YM.bind(this),this._onMouseDown=VM.bind(this),this._onMouseMove=GM.bind(this),this._interceptControlDown=jM.bind(this),this._interceptControlUp=ZM.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(yp),this.update(),this.state=Mt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Yt.copy(t).sub(this.target),Yt.applyQuaternion(this._quat),this._spherical.setFromVector3(Yt),this.autoRotate&&this.state===Mt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=xn:i>Math.PI&&(i-=xn),s<-Math.PI?s+=xn:s>Math.PI&&(s-=xn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Yt.setFromSpherical(this._spherical),Yt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Yt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Yt.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let o=new D(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=Yt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(al.origin.copy(this.object.position),al.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(al.direction))<BM?this.object.lookAt(this.target):(bp.setFromNormalAndCoplanarPoint(this.object.up,this.target),al.intersectPlane(bp,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>gh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>gh||this._lastTargetPosition.distanceToSquared(this.target)>gh?(this.dispatchEvent(yp),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?xn/60*this.autoRotateSpeed*e:xn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Yt.setFromMatrixColumn(t,0),Yt.multiplyScalar(-e),this._panOffset.add(Yt)}_panUp(e,t){this.screenSpacePanning===!0?Yt.setFromMatrixColumn(t,1):(Yt.setFromMatrixColumn(t,0),Yt.crossVectors(this.object.up,Yt)),Yt.multiplyScalar(e),this._panOffset.add(Yt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Yt.copy(s).sub(this.target);let r=Yt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(xn*this._rotateDelta.x/t.clientHeight),this._rotateUp(xn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(xn*this._rotateDelta.x/t.clientHeight),this._rotateUp(xn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ce,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function kM(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function zM(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function HM(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Mp),this.state=Mt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function VM(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case qi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=Mt.DOLLY;break;case qi.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Mt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Mt.ROTATE}break;case qi.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Mt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Mt.PAN}break;default:this.state=Mt.NONE}this.state!==Mt.NONE&&this.dispatchEvent(xh)}function GM(n){switch(this.state){case Mt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case Mt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case Mt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function WM(n){this.enabled===!1||this.enableZoom===!1||this.state!==Mt.NONE||(n.preventDefault(),this.dispatchEvent(xh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Mp))}function XM(n){this.enabled!==!1&&this._handleKeyDown(n)}function qM(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Yi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=Mt.TOUCH_ROTATE;break;case Yi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=Mt.TOUCH_PAN;break;default:this.state=Mt.NONE}break;case 2:switch(this.touches.TWO){case Yi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=Mt.TOUCH_DOLLY_PAN;break;case Yi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=Mt.TOUCH_DOLLY_ROTATE;break;default:this.state=Mt.NONE}break;default:this.state=Mt.NONE}this.state!==Mt.NONE&&this.dispatchEvent(xh)}function YM(n){switch(this._trackPointer(n),this.state){case Mt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case Mt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case Mt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case Mt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=Mt.NONE}}function $M(n){this.enabled!==!1&&n.preventDefault()}function jM(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function ZM(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var bm=ei(Ll());var Lt=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),mattress:Object.freeze({materialKey:"fabric",baseColor:"#E4E0D8",roughness:.94,metallic:0,opacity:1}),countertop:Object.freeze({materialKey:"custom",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1})});function xt(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Sp({width:n,height:e,depth:t}){let i=e*.38,s=t*.2,r=n*.1,a=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),o=Math.max(e*.16,.035),c=Math.max(Math.min(n*.012,.018),.006),l=[xt("seat","cushions",[n,i,t],[0,-e/2+i/2,0]),xt("back","body",[n,e*.62,s],[0,e*.19,-t/2+s/2]),xt("left-arm","body",[r,e*.46,t],[-n/2+r/2,-e*.08,0]),xt("right-arm","body",[r,e*.46,t],[n/2-r/2,-e*.08,0])];for(let u of[-n*.4,n*.4])for(let h of[-t*.32,t*.32])l.push(xt("leg","legs",[a,o,a],[u,-e/2+o/2,h]));return l.push(xt("cushion-seam","cushions",[c,Math.max(i*.035,.006),t*.78],[0,-e/2+i+.003,t*.02])),{parts:l,materialDefaults:{body:Lt.fabric,cushions:Lt.fabric,legs:Lt.metal}}}function Ep({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.08,.024),r=[xt("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),xt("back","back",[n*.9,e*.46,Math.max(t*.14,.035)],[0,e*.26,-t*.36],"seat")];for(let a of[-n*.36,n*.36])for(let o of[-t*.3,t*.3])r.push(xt("leg","frame",[s,e*.44,s],[a,-e*.28,o]));return{parts:r,yawOffsetDegrees:180,materialDefaults:{seat:Lt.fabric,back:Lt.fabric,frame:Lt.wood}}}function vh({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.max(Math.min(Math.min(n,t)*.09,.075),.025),r=Math.max(e-i,.02),a=[xt("top","top",[n,i,t],[0,e/2-i/2,0]),xt("top-surface","top",[n*.965,.012,t*.965],[0,e/2-.006,0])];for(let o of[-n*.4,n*.4])for(let c of[-t*.4,t*.4])a.push(xt("leg","legs",[s,r,s],[o,-i/2,c]));return{parts:a,materialDefaults:{top:Lt.wood,legs:Lt.metal}}}function _h({width:n,height:e,depth:t}){let i=e*.4,s=e*.38,r=Math.max(e*.1,.045);return{parts:[xt("frame","frame",[n,i,t],[0,-e/2+i/2,0]),xt("mattress","mattress",[n*.93,s,t*.9],[0,-e/2+i+s/2,t*.025]),xt("headboard","headboard",[n*.98,e*.72,Math.max(t*.065,.055)],[0,-e/2+e*.64,-t/2+Math.max(t*.0325,.0275)],"frame"),xt("left-pillow","mattress",[n*.38,r,t*.2],[-n*.23,e*.27,-t*.29]),xt("right-pillow","mattress",[n*.38,r,t*.2],[n*.23,e*.27,-t*.29])],yawOffsetDegrees:180,materialDefaults:{frame:Lt.wood,mattress:Lt.mattress,headboard:Lt.wood}}}function wp({width:n,height:e,depth:t}){let i=Math.max(e*.06,.025),s=Math.max(t*.05,.016),r=Math.max(e-i,.02),a=r*.92,o=n*.94/3,c=Math.max(s*.7,.012),l=[xt("body","body",[n,r,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let u=0;u<3;u+=1){let h=-n*.47+o*(u+.5);l.push(xt("front","front",[o*.96,a,s],[h,-i/2,t/2-s/2]));let f=h+o*(u<1?.3:-.3);l.push(xt("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),c],[f,0,t/2-c/2]))}return l.push(xt("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:l,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.wood,handles:Lt.metal}}}function Tp({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.045,.016),r=Math.max(s*.7,.012),a=[xt("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let o of[-n*.245,n*.245])a.push(xt("front","front",[n*.47,Math.max(e-i,.02)*.94,s],[o,-i/2,t/2-s/2])),a.push(xt("handle","handles",[n*.25,Math.max(e*.016,.01),r],[o,e*.3,t/2-r/2]));return a.push(xt("worktop","top",[n,i,t],[0,e*.46,0])),{parts:a,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.countertop,handles:Lt.metal}}}function Ap({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.05,.016),r=n*.305,a=Math.max(s*.7,.012),o=Math.max(e*.12,.018),c=[xt("body","body",[n,e*.76-i,Math.max(t-s,.02)],[0,e*.08-i/2,-s/2])];for(let l of[-1,0,1]){let u=l*n*.323;c.push(xt("front","front",[r,e*.58,s],[u,e*.04,t/2-s/2])),c.push(xt("handle","handles",[r*.28,Math.max(e*.018,.009),a],[u,e*.25,t/2-a/2]))}return c.push(xt("top","top",[n,i,t],[0,e*.46-i/2,0])),c.push(xt("foot","body",[n*.82,o,t*.72],[0,-e*.44,0])),{parts:c,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.wood,handles:Lt.metal}}}var ct=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"paint",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),counter:Object.freeze({materialKey:"stone",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1})});function Fe(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Ia(n,e,t,i,s,r=void 0,a=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:a,radius:t,height:i,position:s,rotation:r}}var yh=Object.freeze({seat:ct.fabric,back:ct.fabric,frame:ct.wood,arms:ct.fabric});function Cp({width:n,height:e,depth:t}){let i=e*.4,s=t*.84,r=t*.24,a=n*.17,o=Math.max(Math.min(n,t)*.07,.018),c=Math.max(e*.16,.035),l=[Fe("seat","seat",[n,i,s],[0,-e/2+i/2,t*.08]),Fe("back","back",[n,e*.64,r],[0,e*.18,-t/2+r/2]),Fe("left-arm","arms",[a,e*.5,t*.88],[-n/2+a/2,-e*.06,t*.06],"seat"),Fe("right-arm","arms",[a,e*.5,t*.88],[n/2-a/2,-e*.06,t*.06],"seat")];for(let u of[-n*.33,n*.33])for(let h of[-t*.3,t*.3])l.push(Fe("leg","frame",[o,c,o],[u,-e/2+c/2,h]));return{parts:l,yawOffsetDegrees:180,materialDefaults:yh}}function Rp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.075,.026),r=e*.45,a=[Fe("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02])];for(let o of[-n*.36,n*.36]){for(let c of[-t*.3,t*.3])a.push(Fe("leg","frame",[s,r,s],[o,-e/2+r/2,c]));a.push(Fe("back-post","frame",[s,e*.51,s],[o,e*.23,-t*.34]))}for(let o of[e*.18,e*.34])a.push(Fe("back-slat","back",[n*.76,e*.085,Math.max(t*.07,.028)],[0,o,-t*.34],"frame"));return{parts:a,yawOffsetDegrees:180,materialDefaults:yh}}function Ip({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.045,.02),r=[Fe("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),Fe("back","back",[n*.88,e*.42,Math.max(t*.13,.035)],[0,e*.27,-t*.31],"seat")];for(let a of[-n*.37,n*.37])r.push(Fe("base-rail","frame",[s,s,t*.84],[a,-e/2+s/2,0])),r.push(Fe("front-post","frame",[s,e*.48,s],[a,-e*.26,t*.34])),r.push(Fe("back-post","frame",[s,e*.58,s],[a,e*.14,-t*.31]));return{parts:r,yawOffsetDegrees:180,materialDefaults:yh}}function Pp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.min(n,t)/2;return{parts:[Ia("top","top",s,i,[0,e/2-i/2,0]),Ia("top-surface","top",s*.965,.012,[0,e/2-.006,0]),Ia("pedestal","legs",s*.13,Math.max(e-i-.055,.02),[0,-i/2+.028,0]),Ia("foot","legs",s*.34,.055,[0,-e/2+.0275,0])],materialDefaults:{top:ct.wood,legs:ct.metal}}}function Dp({width:n,height:e,depth:t}){let i=Math.max(Math.min(n*.055,.055),.028),s=Math.max(Math.min(e*.025,.04),.025),r=[Fe("left-side","body",[i,e,t],[-n/2+i/2,0,0]),Fe("right-side","body",[i,e,t],[n/2-i/2,0,0]),Fe("bottom","body",[n,s,t],[0,-e/2+s/2,0])];for(let a=1;a<=5;a+=1){let o=-e/2+e*a/5;r.push(Fe(a===5?"top":"shelf",a===5?"top":"body",[n,s,t],[0,Math.min(o,e/2-s/2),0]))}return r.push(Fe("back","body",[n-i*2,e*.96,Math.max(t*.045,.016)],[0,0,-t/2+Math.max(t*.0225,.008)])),{parts:r,materialDefaults:{body:ct.cabinet,top:ct.wood}}}function cl({width:n,height:e,depth:t},i="cabinet"){let s=Math.max(e*.06,.025),r=Math.max(t*.05,.016),a=Math.max(e-s,.02),o=a*.92,c=-s/2,l=[Fe("body","body",[n,a,Math.max(t-r,.02)],[0,-s/2,-r/2])];if(i==="nightstand")for(let u=0;u<2;u+=1){let h=c+(u===0?o*.25:-o*.25),f=Math.max(r*.7,.012);l.push(Fe("front","front",[n*.94,o*.46,r],[0,h,t/2-r/2])),l.push(Fe("handle","handles",[n*.22,Math.max(e*.018,.008),f],[0,h+o*.12,t/2-f/2]))}else{let u=i==="wardrobe"?3:2,h=n*.94/u;for(let f=0;f<u;f+=1){let d=-n*.47+h*(f+.5),p=d+h*(f<u/2?.3:-.3),x=Math.max(r*.7,.012);l.push(Fe("front","front",[h*.96,o,r],[d,c,t/2-r/2])),l.push(Fe("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),x],[p,0,t/2-x/2]))}}return l.push(Fe("top","top",[n,s,t],[0,e/2-s/2,0])),{parts:l,materialDefaults:{body:ct.cabinet,front:ct.front,top:ct.wood,handles:ct.metal}}}function Lp({width:n,height:e,depth:t}){let i=Math.max(e*.025,.03),s=Math.max(t*.045,.016),r=[Fe("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let[a,o]of[[e*.25,e*.45],[-e*.25,e*.45]]){let c=Math.max(s*.7,.012);r.push(Fe("front","front",[n*.95,o,s],[0,a,t/2-s/2])),r.push(Fe("handle","handles",[Math.max(n*.025,.012),o*.44,c],[n*.38,a,t/2-c/2]))}return r.push(Fe("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:r,materialDefaults:{body:ct.cabinet,front:ct.front,top:ct.counter,handles:ct.metal}}}function Op({width:n,height:e,depth:t}){let i=Math.max(t*.055,.018),s=Math.max(e*.025,.028),r=e*.34,a=Math.max(e*.007,.008),o=Math.max(t*.06,.016);return{parts:[Fe("body","body",[n,e-s,Math.max(t-i,.02)],[0,-s/2,-i/2]),Fe("door","front",[n*.97,e-r-a*1.5,i],[0,r/2+a*.25,t/2-i/2]),Fe("freezer-door","front",[n*.97,r-a*1.5,i],[0,-e/2+r/2,t/2-i/2]),Fe("handle","handles",[Math.max(n*.018,.009),e*.3,o],[n*.38,e*.25,t/2-o/2]),Fe("freezer-handle","handles",[Math.max(n*.018,.009),e*.19,o],[n*.38,-e*.25,t/2-o/2]),Fe("top","top",[n,s,t],[0,e/2-s/2,0])],materialDefaults:{body:ct.cabinet,front:ct.front,top:ct.metal,handles:ct.metal}}}function Np({width:n,height:e,depth:t}){let i=Math.max(e*.075,.03),s=t*.13,r=t-s,a=Math.max(t*.035,.016),o=[Fe("body","body",[n*.94,e-i,r],[0,-i/2,-s/2])];for(let c=-1;c<=1;c+=1){let l=c*n*.31;o.push(Fe("front","front",[n*.29,e*.8,a],[l,-i/2,t/2-s-a/2])),o.push(Fe("handle","handles",[n*.16,Math.max(e*.014,.009),Math.max(a*.75,.012)],[l,e*.31,t/2-s+.003]))}return o.push(Fe("worktop","top",[n,i,t],[0,e/2-i/2,0])),{parts:o,materialDefaults:{body:ct.cabinet,front:ct.front,top:ct.counter,handles:ct.metal}}}function Fp({width:n,height:e,depth:t}){let i=Math.min(e*.22,.24),s=e-i,r=Math.max(s*.075,.03),a=Math.max(t*.045,.016),o=-e/2+s/2,c=-e/2+s-r/2,l=n*.48,u=t*.52,h=Math.max(Math.min(l,u)*.075,.025),f=c+r/2-Math.max(r*.08,.005),d=[Fe("body","body",[n,s-r,Math.max(t-a,.02)],[0,o-r/2,-a/2])];for(let m of[-n*.245,n*.245]){let g=Math.max(a*.75,.012);d.push(Fe("front","front",[n*.47,s*.78,a],[m,o-r*.3,t/2-a/2])),d.push(Fe("handle","handles",[n*.22,Math.max(s*.014,.009),g],[m,c-s*.12,t/2-g/2]))}d.push(Fe("worktop","top",[n,r,t],[0,c,0])),d.push(Fe("basin-back","basin",[l,Math.max(r*.16,.01),h],[-n*.12,f,-u/2])),d.push(Fe("basin-front","basin",[l,Math.max(r*.16,.01),h],[-n*.12,f,u/2])),d.push(Fe("basin-left","basin",[h,Math.max(r*.16,.01),u],[-n*.12-l/2+h/2,f,0])),d.push(Fe("basin-right","basin",[h,Math.max(r*.16,.01),u],[-n*.12+l/2-h/2,f,0]));let p=i*.72,x=c+r/2;return d.push(Ia("faucet","fittings",Math.max(n*.018,.012),p,[n*.28,x+p/2,-t*.12])),d.push(Fe("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.2,Math.min(x+p,e/2-.01),-t*.05])),{parts:d,materialDefaults:{body:ct.cabinet,front:ct.front,top:ct.counter,handles:ct.metal,basin:ct.metal,fittings:ct.metal}}}function Up({width:n,height:e,depth:t}){let i=Math.max(Math.min(t*.34,.055),.018);return{parts:[Fe("frame","frame",[n,e*.88,i],[0,e*.06,0]),Fe("display","display",[n*.92,e*.76,Math.max(i*.12,.008)],[0,e*.06,i*.52]),Fe("stand","stand",[n*.34,Math.max(e*.045,.018),t],[0,-e*.46,0])],materialDefaults:{frame:ct.metal,display:ct.screen,stand:ct.metal}}}function Bp({width:n,height:e,depth:t}){let i=Math.min(Math.max(Math.min(n,t)*.045,.025),.09),s=Math.max(e*.72,.018),r=Math.max(e*.55,.014),a=-e/2+r/2;return{parts:[Fe("pile","pile",[Math.max(n-i*2,.08),s,Math.max(t-i*2,.08)],[0,e/2-s/2+.002,0]),Fe("border-back","border",[n,r,i],[0,a,-t/2+i/2]),Fe("border-front","border",[n,r,i],[0,a,t/2-i/2]),Fe("border-left","border",[i,r,Math.max(t-i*2,.08)],[-n/2+i/2,a,0]),Fe("border-right","border",[i,r,Math.max(t-i*2,.08)],[n/2-i/2,a,0])],materialDefaults:{pile:ct.fabric,border:ct.fabric}}}function kp({width:n,height:e,depth:t}){return{parts:[Fe("body","body",[n*.96,e*.96,t*.96],[0,0,0]),Fe("top","top",[n*.72,Math.max(e*.025,.018),t*.72],[0,e*.44,0])],materialDefaults:{body:ct.cabinet,top:ct.wood}}}var at=Object.freeze({paint:Object.freeze({materialKey:"paint",baseColor:"#D8D5CE",roughness:.7,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E7E4DE",roughness:.64,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),darkMetal:Object.freeze({materialKey:"metal",baseColor:"#34393C",roughness:.48,metallic:.62,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#22282C",roughness:.16,metallic:.08,opacity:.86}),counter:Object.freeze({materialKey:"stone",baseColor:"#5F6467",roughness:.52,metallic:.04,opacity:1}),blue:Object.freeze({materialKey:"custom",baseColor:"#4E82A6",roughness:.64,metallic:0,opacity:1})});function ot(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Ji(n,e,t,i,s,r=void 0,a=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:a,radius:t,height:i,position:s,rotation:r}}function zp({width:n,height:e,depth:t}){let i=Math.max(e*.075,.032),s=Math.max(t*.05,.018),r=Math.max(s*.82,.014),a=s*1.05,o=[ot("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2]),ot("oven-front","front",[n*.94,e*.6,s],[0,-e*.12,t/2-s/2]),ot("controls","controls",[n*.94,e*.17,a],[0,e*.28,t/2-a/2]),ot("handle","handles",[n*.62,Math.max(e*.022,.012),r],[0,e*.12,t/2-r/2]),ot("worktop","top",[n,i,t],[0,e/2-i/2,0])];for(let c of[-n*.23,n*.23])for(let l of[-t*.22,t*.22])o.push(Ji("burner","cooktop",Math.min(n,t)*.105,Math.max(i*.15,.008),[c,e/2-.004,l]));return{parts:o,materialDefaults:{body:at.paint,front:at.front,controls:at.screen,handles:at.metal,top:at.counter,cooktop:at.darkMetal}}}function Hp({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(i.bodyHeight??.28,e*.12),e*.62),r=Math.min(Math.max(i.chimneyHeight??.52,e-s),e-s/2),a=Math.min(Math.max(i.chimneyWidth??.3,n*.18),n*.72),o=Math.max(t*.025,.012);return{parts:[ot("hood","body",[n,s,t],[0,-e/2+s/2,0]),ot("rim","frame",[n*.82,Math.max(s*.1,.018),t],[0,-e/2+s*.08,0]),ot("chimney","body",[a,r,t*.42],[0,e/2-r/2,-t*.15]),ot("controls","controls",[n*.3,Math.max(s*.075,.014),o],[n*.25,-e/2+s*.72,t/2-o/2])],materialDefaults:{body:at.metal,frame:at.darkMetal,controls:at.screen}}}function ll({width:n,height:e,depth:t},i="washingMachine"){let s=Math.max(e*.045,.028),r=Math.max(t*.055,.02),a=Math.max(r*.7,.018),o=i==="tumbleDryer"?n*.34:n*.25,c=Math.max(r*.78,.016),l=Math.max(r*.8,.018),u=[ot("body","body",[n,e-s,Math.max(t-r,.02)],[0,-s/2,-r/2]),ot("front","front",[n*.96,e*.92,r],[0,-s/2,t/2-r/2]),ot("top","top",[n,s,t],[0,e/2-s/2,0]),Ji("door","door",Math.min(n,e)*.31,a,[0,-e*.08,t/2-a/2],[Math.PI/2,0,0]),ot("display","display",[o,e*.1,c],[n*.22,e*.33,t/2-c/2]),Ji("control","handles",Math.max(n*.055,.022),l,[-n*.26,e*.33,t/2-l/2],[Math.PI/2,0,0])];if(i==="washerDryer"){let h=Math.max(r*.84,.018);u.push(ot("mode","display",[n*.18,Math.max(e*.018,.01),h],[n*.2,e*.24,t/2-h/2]))}else if(i==="tumbleDryer")for(let h=0;h<3;h+=1){let f=h*Math.PI*2/3,d=Math.max(r*.86,.018);u.push(ot("drum-vane","door",[n*.055,n*.018,d],[Math.cos(f)*n*.13,-e*.08+Math.sin(f)*n*.13,t/2-d/2]))}return{parts:u,materialDefaults:{body:at.paint,front:at.front,top:at.paint,door:at.glass,display:at.screen,handles:at.metal}}}function Vp({width:n,height:e,depth:t}){let i=Math.min(n,t)*.47,s=Math.max(e*.62,.045),r=Math.max(t*.1,.025),a=Math.max(i*.19,.035),o=[Math.max(n*.1,.028),Math.max(e*.28,.022),Math.max(t*.3,.07)];return{parts:[Ji("body","body",i,s,[0,-e/2+s/2,0]),ot("bumper","bumper",[n*.78,s*.68,r],[0,-e*.15,t*.43]),Ji("sensor","sensor",a,Math.max(e*.25,.02),[0,e*.3,-t*.1]),ot("left-wheel","wheels",o,[-n*.34,-e*.34,0]),ot("right-wheel","wheels",o,[n*.34,-e*.34,0])],materialDefaults:{body:at.darkMetal,bumper:at.darkMetal,sensor:at.screen,wheels:at.darkMetal}}}function Gp({width:n,height:e,depth:t}){let i=Math.max(t*.12,.018),s=Math.max(t*.1,.018),r=-e*.31,a=Math.max(n*.014,.01),o=[ot("body","body",[n*.96,e*.86,t*.82],[0,e*.04,-t*.05]),ot("front","front",[n*.9,e*.58,i],[0,e*.09,t/2-i/2]),ot("outlet","outlet",[n*.82,e*.18,s],[0,r,t/2-s/2])];for(let c=-3;c<=3;c+=1)o.push(ot("louver","louvers",[a,e*.13,Math.max(t*.035,.01)],[c*n*.105,r,t*.475]));return o.push(ot("controls","controls",[n*.12,e*.075,Math.max(t*.035,.01)],[n*.34,e*.17,t*.465])),o.push(ot("rear-frame","frame",[n*.58,e*.42,Math.max(t*.055,.012)],[0,e*.04,-t*.46])),{parts:o,materialDefaults:{body:at.paint,front:at.front,outlet:at.screen,louvers:at.darkMetal,controls:at.screen,frame:at.metal}}}function Wp({width:n,height:e,depth:t}){let i=e*.92,s=Math.max(t*.045,.018),r=Math.max(e*.045,.03),a=e*.08,o=Math.max(s*1.1,.02),c=[ot("body","body",[n*.94,i,t*.88],[0,-e/2+i/2,-t*.03]),ot("upper-front","front",[n*.88,e*.42,s],[0,e*.2,t/2-s/2]),ot("lower-front","front",[n*.88,e*.39,s],[0,-e*.255,t/2-s/2]),ot("controls","controls",[n*.24,e*.075,o],[n*.22,e*.3,t/2-o/2]),ot("foot","foot",[n*.82,r,t*.72],[0,-e/2+r/2,0])];for(let l of[-n*.22,0,n*.22])c.push(Ji("connection","connections",Math.max(n*.035,.018),a,[l,e/2-a/2,-t*.13]));return{parts:c,materialDefaults:{body:at.paint,front:at.front,controls:at.screen,foot:at.metal,connections:at.metal}}}function Xp({width:n,height:e,depth:t}){let i=e*.74,s=-e/2+i/2,r=Math.max(t*.045,.022),a=Math.max(e*.035,.025),o=-e/2+i,c=e-i;return{parts:[ot("body","body",[n*.92,i,t*.88],[0,s,0]),ot("window","glass",[n*.62,i*.55,r],[0,s+i*.04,t/2-r/2]),ot("handle","handles",[n*.035,i*.38,r],[n*.29,s+i*.03,t/2-r/2]),ot("top","top",[n,a,t*.94],[0,o-a/2,0]),Ji("flue","flue",Math.min(n,t)*.13,c,[0,o+c/2,-t*.18])],materialDefaults:{body:at.darkMetal,glass:at.glass,handles:at.metal,top:at.darkMetal,flue:at.darkMetal}}}function qp({width:n,height:e,depth:t}){let i=Math.min(n,t),s=i*.52,r=i*.114,a=[Ji("motor","body",i*.156,e*.3,[0,e*.14,0])];for(let o=0;o<4;o+=1){let c=o*Math.PI/2,l=ot("blade","frame",[s,e*.072,r],[Math.cos(c)*i*.235,-e*.016,-Math.sin(c)*i*.235]);l.rotation=[0,-c,0],a.push(l)}return{parts:a,materialDefaults:{body:at.metal,frame:at.darkMetal}}}function Yp({width:n,height:e,depth:t}){let i=e*.29,s=n*.55,r=(n-s)/2,a=[ot("base","body",[n*.92,e*.087,t*.92],[0,-e/2+e*.0435,0]),ot("stand","frame",[n*.104,e*.64,t*.104],[0,-e*.15,0]),ot("housing","body",[n,e*.36,t*.23],[0,i,0])];for(let o=0;o<3;o+=1){let c=o*Math.PI*2/3,l=ot("blade","frame",[s,e*.062,t*.19],[Math.cos(c)*r,i+Math.sin(c)*e*.12,t*.14]);l.rotation=[0,0,c],a.push(l)}return{parts:a,materialDefaults:{body:at.metal,frame:at.blue}}}var vn=Object.freeze({ceramic:Object.freeze({materialKey:"custom",baseColor:"#F0F0E8",roughness:.68,metallic:0,opacity:1}),seat:Object.freeze({materialKey:"custom",baseColor:"#E5E4DC",roughness:.62,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#B8BDBD",roughness:.24,metallic:.82,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#B8DBE3",roughness:.08,metallic:0,opacity:.24})});function $t(n,e,t,i){return{type:"box",name:n,slot:e,size:t,position:i}}function Qi(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function $p({width:n,height:e,depth:t}){let i=t*.3,s=e*.5,r=e*.42,a=Math.min(n*.46,t*.25);return{yawOffsetDegrees:180,parts:[$t("tank","ceramic",[n*.88,s,i],[0,e/2-s/2,-t/2+i/2]),$t("pedestal","ceramic",[n*.56,r,t*.38],[0,-e/2+r/2,t*.08]),Qi("bowl","ceramic",a,e*.24,[0,-e*.08,t*.15]),Qi("seat","seat",a*.92,Math.max(e*.035,.018),[0,e*.07,t*.15]),Qi("flush","handles",Math.max(n*.055,.02),Math.max(e*.018,.01),[0,e/2-.006,-t*.35])],materialDefaults:{ceramic:vn.ceramic,seat:vn.seat,handles:vn.metal}}}function jp({width:n,height:e,depth:t}){let i=e*.58,s=e*.18,r=e*.2,a=-e/2+i+s;return{parts:[Qi("pedestal","ceramic",Math.min(n,t)*.22,i,[0,-e/2+i/2,-t*.08]),$t("basin","ceramic",[n,s,t*.84],[0,-e/2+i+s/2,0]),$t("basin-inset","basin",[n*.66,Math.max(s*.22,.018),t*.5],[0,-e/2+i+s*.74,t*.04]),Qi("faucet","fittings",Math.max(n*.018,.012),r,[n*.24,a+r/2,-t*.24]),$t("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.16,Math.min(a+r,e/2-.01),-t*.16])],materialDefaults:{ceramic:vn.ceramic,basin:vn.seat,fittings:vn.metal}}}function Zp({width:n,height:e,depth:t}){let i=Math.max(e*.14,.055),s=Math.max(Math.min(n,t)*.075,.045),r=Math.max(t*.025,.014);return{parts:[$t("rear-side","ceramic",[n,e*.72,s],[0,-e*.14,-t/2+s/2]),$t("front-side","ceramic",[n,e*.72,s],[0,-e*.14,t/2-s/2]),$t("left-side","ceramic",[s,e*.72,t-s*2],[-n/2+s/2,-e*.14,0]),$t("right-side","ceramic",[s,e*.72,t-s*2],[n/2-s/2,-e*.14,0]),$t("tub","tub",[n-s*2,i,t-s*2],[0,-e/2+i/2,0]),$t("rear-rim","ceramic",[n,i,s],[0,e/2-i/2,-t/2+s/2]),Qi("faucet","fittings",r,e*.28,[n*.34,e*.34,-t*.33]),$t("spout","fittings",[n*.16,r*1.5,r*1.5],[n*.27,e*.41,-t*.28])],materialDefaults:{ceramic:vn.ceramic,tub:vn.seat,fittings:vn.metal}}}function Kp({width:n,height:e,depth:t}){let i=Math.min(n,t),s=Math.min(Math.max(e*.035,.045),e*.12),r=Math.min(Math.max(i*.014,.01),.018),a=Math.min(Math.max(i*.02,.014),.026),o=Math.max(e-s,.08),c=-e/2+s+o/2,l=n*.43,u=[$t("tray","tub",[n,s,t],[0,-e/2+s/2,0]),$t("rear-glass","glass",[n*.96,o,r],[0,c,-t/2+r/2]),$t("side-glass","glass",[r,o,t*.96],[-n/2+r/2,c,0]),$t("front-glass","glass",[l,o,r],[n/2-l/2,c,t/2-r/2])];for(let f of[[-n/2+a/2,c,-t/2+a/2],[n/2-a/2,c,-t/2+a/2],[n/2-a/2,c,t/2-a/2]])u.push($t("post","frame",[a,o,a],f));u.push(Qi("drain","fittings",Math.min(Math.max(i*.055,.026),.05),Math.max(s*.16,.008),[n*.2,-e/2+s+Math.max(s*.08,.004),t*.18])),u.push(Qi("rail","fittings",Math.max(a*.44,.008),o*.58,[n*.27,-e/2+s+o*.48,-t/2+r*2.2])),u.push($t("shower-head","fittings",[n*.2,Math.max(a*.78,.012),t*.085],[n*.2,-e/2+s+o*.82,-t*.4]));let h=Math.max(r*1.35,.014);return u.push($t("handle","handles",[a,o*.18,h],[n*.22,c,t/2-h/2])),{parts:u,materialDefaults:{tub:vn.ceramic,glass:vn.glass,frame:vn.metal,fittings:vn.metal,handles:vn.metal}}}var ul=Object.freeze({pot:Object.freeze({materialKey:"custom",baseColor:"#9D7256",roughness:.82,metallic:0,opacity:1}),soil:Object.freeze({materialKey:"custom",baseColor:"#51402F",roughness:.96,metallic:0,opacity:1}),leaves:Object.freeze({materialKey:"custom",baseColor:"#64805E",roughness:.88,metallic:0,opacity:1}),ceramic:Object.freeze({materialKey:"custom",baseColor:"#B98568",roughness:.7,metallic:0,opacity:1})});function Pa(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function KM(n,e,t,i,s,r){return{type:"sphere",name:n,slot:e,radius:t,scale:i,position:s,rotation:r}}function bh({width:n,height:e,depth:t},i=!1){let s=e*(i?.24:.36),r=Math.min(n,t)*(i?.32:.38),a=i?11:7,o=-e/2+s*.78,c=e-s*.72,l=[Pa("pot","pot",r,s,[0,-e/2+s/2,0]),Pa("soil","soil",r*.86,Math.max(s*.08,.018),[0,-e/2+s*.92,0])];for(let u=0;u<a;u+=1){let h=u/a*Math.PI*2,f=u%3/2,d=Math.min(n,t)*(.16+f*.13),p=o+c*(.28+f*.24);l.push(KM("leaf","leaves",Math.min(n,t)*.18,[.55,i?1.35:1.05,.34],[Math.cos(h)*d,Math.min(p,e*.4),Math.sin(h)*d],[0,h,Math.cos(h)*.42]))}return{parts:l,materialDefaults:{pot:ul.pot,soil:ul.soil,leaves:ul.leaves}}}function Jp({width:n,height:e,depth:t}){let i=e*.7,s=e*.25;return{parts:[Pa("body","ceramic",Math.min(n,t)*.46,i,[0,-e/2+i/2,0]),Pa("neck","ceramic",Math.min(n,t)*.2,s,[0,e/2-s/2,0]),Pa("lip","ceramic",Math.min(n,t)*.27,Math.max(e*.05,.018),[0,e/2-Math.max(e*.025,.009),0])],materialDefaults:{ceramic:ul.ceramic}}}var ui=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),cabinetTop:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),stair:Object.freeze({materialKey:"wood",baseColor:"#A8835F",roughness:.7,metallic:0,opacity:1})});function In(n,e,t,i,s){return{type:"box",name:n,slot:e,size:t,position:i,rotation:s}}function Rs({width:n,height:e,depth:t},i={},s="3_seater"){if(s==="ottoman"){let b=e*.72,C=e-b;return{parts:[In("cushion","cushions",[n,b,t],[0,e/2-b/2,0]),In("base","body",[n*.94,C,t*.92],[0,-e/2+C/2,0])],materialDefaults:{cushions:ui.fabric,body:ui.fabric}}}let r=Math.min(Math.max(Number(i.leftExtensionLength)||0,0),3.5),a=Math.min(Math.max(Number(i.rightExtensionLength)||0,0),3.5),o=r>.05||a>.05,c=o?Math.min(t,.9):t,l=-t/2,u=l+c,h=(l+u)/2,f=Math.min(Math.max(n*.34,.62),1.05),d=e*.38,p=c*.2,x=n*.1,m=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),g=Math.max(e*.16,.035),w=Math.max(Math.min(n*.012,.018),.006),E=[In("seat","cushions",[n,d,c],[0,-e/2+d/2,h]),In("back","body",[n,e*.62,p],[0,e*.19,l+p/2]),In("left-arm","body",[x,e*.46,c],[-n/2+x/2,-e*.08,h]),In("right-arm","body",[x,e*.46,c],[n/2-x/2,-e*.08,h])];for(let b of[-n*.4,n*.4])for(let C of[h-c*.32,h+c*.32])E.push(In("leg","legs",[m,g,m],[b,-e/2+g/2,C]));let y=o?3:2;for(let b=1;b<y;b+=1){let C=-n/2+n*b/y;E.push(In("cushion-seam","cushions",[w,Math.max(d*.035,.006),c*.78],[C,-e/2+d+.003,h+c*.02]))}let T=(b,C)=>{if(C<=.05)return;let v=Math.min(Math.max(C,c),3.5),S=b==="left"?-n/2+f/2:n/2-f/2,P=l+v/2;E.push(In(\`\${b}-return\`,"cushions",[f,d,v],[S,-e/2+d/2,P])),E.push(In(\`\${b}-return-seam\`,"cushions",[f*.82,Math.max(d*.055,.012),v*.72],[S,-e/2+d+.004,P+v*.03]))};return T("left",r),T("right",a),{parts:E,materialDefaults:{body:ui.fabric,cushions:ui.fabric,legs:ui.metal}}}function Qp({width:n,height:e,depth:t},i={}){let r=(O,U)=>Math.min(Math.max(Number(O)||U*.42,Math.min(.05,U/2)),Math.max(U-Math.min(.05,U/2),U/2)),a=r(i.leftLegLength,n),o=r(i.rightLegLength,t),c=[[-n/2,-t/2],[n/2,-t/2],[n/2,-t/2+o],[-n/2+a,t/2],[-n/2,t/2]],l=c[2],u=c[3],h=u[0]-l[0],f=u[1]-l[1],d=Math.hypot(h,f),p=[h/d,f/d],x=[p[1],-p[0]],m=[(l[0]+u[0])/2,(l[1]+u[1])/2],g=Math.min(Math.max(e*.06,.025),.08),w=Math.max(e-g,.02),E=Math.min(Math.max(Math.min(n,t)*.025,.014),.026),y=w*.9,T=-g/2,b=-Math.atan2(p[1],p[0]),C=[{type:"extrude",name:"body",slot:"body",outline:c,height:w,position:[0,-g/2,0]},{type:"extrude",name:"top",slot:"top",outline:c,height:g,position:[0,e/2-g/2,0]}],v=d*.44;for(let O of[-d*.225,d*.225]){let U=[m[0]+p[0]*O+x[0]*E/2,m[1]+p[1]*O+x[1]*E/2];C.push(In("front","front",[v,y,E],[U[0],T,U[1]],[0,b,0]))}let S=Math.min(Math.max(e*.18,.12),.3),P=Math.min(Math.max(d*.018,.01),.018),I=Math.min(Math.max(E*.55,.009),.014);for(let O of[-d*.055,d*.055]){let U=[m[0]+p[0]*O+x[0]*(E+I/2),m[1]+p[1]*O+x[1]*(E+I/2)];C.push(In("handle","handles",[P,S,I],[U[0],T,U[1]],[0,b,0]))}return{parts:C,materialDefaults:{body:ui.cabinet,front:ui.cabinetFront,top:ui.cabinetTop,handles:ui.metal}}}function em({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(Math.round(Number(i.stepCount)||e/.18),2),30),r=i.direction==="down"?"down":"up",a=t/s,o=e/s,c=Math.min(Math.max(o*.22,.025),.055),l=[];for(let u=0;u<s;u+=1){let h=-t/2+a*(u+.5),f=r==="up"?h:-h,d=-e/2+o*(u+1)-c/2;l.push(In("tread","body",[n,c,a],[0,d,f]))}return{parts:l,materialDefaults:{body:ui.stair}}}var JM=Object.freeze({sofa_basic:Object.freeze({variants:Object.freeze({default:(n,e)=>Rs(n,e,"default"),"2_seater":(n,e)=>Rs(n,e,"2_seater"),"3_seater":Sp,corner_left:(n,e)=>Rs(n,e,"corner_left"),corner_right:(n,e)=>Rs(n,e,"corner_right"),u_shaped:(n,e)=>Rs(n,e,"u_shaped"),ottoman:(n,e)=>Rs(n,e,"ottoman")})}),chair_basic:Object.freeze({variants:Object.freeze({dining:Ep,lounge:Cp,wooden:Rp,cantilever:Ip})}),table_basic:Object.freeze({variants:Object.freeze({coffee:vh,round:Pp,rectangular:vh})}),bed_basic:Object.freeze({variants:Object.freeze({single:_h,queen:_h})}),wardrobe:Object.freeze({variants:Object.freeze({default:wp})}),nightstand:Object.freeze({variants:Object.freeze({default:n=>cl(n,"nightstand")})}),shelf:Object.freeze({variants:Object.freeze({default:Dp})}),cabinet:Object.freeze({variants:Object.freeze({default:cl})}),cornerCabinet:Object.freeze({variants:Object.freeze({default:Qp})}),genericStorage:Object.freeze({variants:Object.freeze({default:cl})}),kitchenBase:Object.freeze({variants:Object.freeze({default:Tp})}),kitchenTallUnit:Object.freeze({variants:Object.freeze({default:Lp})}),refrigerator:Object.freeze({variants:Object.freeze({default:Op})}),stove:Object.freeze({variants:Object.freeze({default:zp})}),rangeHood:Object.freeze({variants:Object.freeze({default:Hp})}),kitchenSink:Object.freeze({variants:Object.freeze({default:Fp})}),kitchenIsland:Object.freeze({variants:Object.freeze({default:Np})}),tvLowboard:Object.freeze({variants:Object.freeze({default:Ap})}),television:Object.freeze({variants:Object.freeze({default:Up})}),robotVacuum:Object.freeze({variants:Object.freeze({default:Vp})}),ceilingFan:Object.freeze({variants:Object.freeze({default:qp})}),standingFan:Object.freeze({variants:Object.freeze({default:Yp})}),airConditioner:Object.freeze({variants:Object.freeze({default:Gp})}),heatPumpIndoorUnit:Object.freeze({variants:Object.freeze({default:Wp})}),fireplaceStove:Object.freeze({variants:Object.freeze({default:Xp})}),washerDryer:Object.freeze({variants:Object.freeze({default:n=>ll(n,"washerDryer")})}),washingMachine:Object.freeze({variants:Object.freeze({default:n=>ll(n,"washingMachine")})}),tumbleDryer:Object.freeze({variants:Object.freeze({default:n=>ll(n,"tumbleDryer")})}),toilet:Object.freeze({variants:Object.freeze({default:$p})}),bathroomSink:Object.freeze({variants:Object.freeze({default:jp})}),bathtub:Object.freeze({variants:Object.freeze({default:Zp})}),shower:Object.freeze({variants:Object.freeze({default:Kp})}),straightStair:Object.freeze({variants:Object.freeze({default:em})}),smallPlant:Object.freeze({variants:Object.freeze({default:n=>bh(n,!1)})}),floorPlant:Object.freeze({variants:Object.freeze({default:n=>bh(n,!0)})}),decorativeVase:Object.freeze({variants:Object.freeze({default:Jp})}),rug:Object.freeze({variants:Object.freeze({default:Bp})}),genericObject:Object.freeze({variants:Object.freeze({default:kp})})});function tm(n,e){return JM[n]?.variants?.[e]??null}var rm=Object.freeze({fabric:Object.freeze({roughness:.9,metallic:0}),wood:Object.freeze({roughness:.68,metallic:0}),metal:Object.freeze({roughness:.42,metallic:.72}),glass:Object.freeze({roughness:.18,metallic:0}),paint:Object.freeze({roughness:.84,metallic:0}),tile:Object.freeze({roughness:.62,metallic:0}),concrete:Object.freeze({roughness:.9,metallic:0}),stone:Object.freeze({roughness:.58,metallic:.02}),custom:Object.freeze({roughness:.7,metallic:0})}),Pn=256,nm=Object.freeze({automatic:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"longestBoundary"}),tile:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),laminate:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),carpet:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"local"}),wood:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),fabric:Object.freeze({elementSize:.06,lineWidth:.001,orientation:"local"}),concrete:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),stone:Object.freeze({elementSize:.6,lineWidth:.003,orientation:"local"})});function _r(n){return Number(n).toFixed(6)}function QM(n){return n==="wallPaint"?"paint":Object.hasOwn(rm,n)?n:"custom"}function eS(n,e,t){let i=n?.pattern??e?.pattern,s=["wood","fabric","tile","concrete","stone"].includes(t)?t:null,r=i?.kind??s;if(!r||!Object.hasOwn(nm,r))return null;let a=nm[r];return{kind:r,elementSize:i?.elementSize??a.elementSize,lineWidth:i?.lineWidth??a.lineWidth,orientation:i?.orientation??a.orientation}}function im(n={},e={}){let t=n?.materialKey??e?.materialKey??"custom",i=QM(t),s=rm[i],r={materialKey:i,baseColor:n?.baseColor??e?.baseColor??"#B8B3AA",roughness:n?.roughness??e?.roughness??s.roughness,metallic:n?.metallic??e?.metallic??s.metallic,opacity:n?.opacity??e?.opacity??1},a=eS(n,e,i);return a?{...r,pattern:a}:r}function am(n){return n?[n.kind,_r(n.elementSize),_r(n.lineWidth),n.orientation].join(":"):"no-pattern"}function tS(n){return[n.materialKey,new je(n.baseColor).getHexString().toUpperCase(),am(n.pattern)].join(":")}function nS(n,e){return[e.physical?"physical":"standard",n.materialKey,new je(n.baseColor).getHexString().toUpperCase(),_r(n.roughness),_r(n.metallic),_r(n.opacity),am(n.pattern),_r(e.transmission??0),e.depthWrite===!1?"no-depth-write":"depth-write",e.side??Un].join(":")}function Mh(n,e,t){let i=Math.imul(n+1,521288629)^Math.imul(e+1,1597334677)^t;return i=Math.imul(i^i>>>15,73244475),((i^i>>>16)>>>0)/4294967295}function iS(n){return Math.min(Math.max(n,0),1)}function Sh(n){let e=Math.max(n.elementSize,.001);switch(n.kind){case"laminate":return{x:Math.max(e*5.2,.72),z:e*2};case"wood":return{x:Math.max(e*5.2,.72),z:e};case"fabric":case"carpet":return{x:Math.min(e,.12),z:Math.min(e,.12)};case"automatic":return{x:1,z:e};default:return{x:e,z:e}}}function sS(n){let e=Sh(n);return{resolution:Pn,lineWidthMeters:n.lineWidth,lineWidthPixels:{x:n.lineWidth/e.x*Pn,z:n.lineWidth/e.z*Pn},antialiased:!0}}function Is(n,e,t){let i=1/Pn,s=Math.max(t,0)/2,r=0;for(let a of e){let o=Math.abs(n-a),c=Math.min(o,1-o);r=Math.max(r,iS((s+i/2-c)/i))}return r}function rS(n,e,t){let i=Sh(n),s=n.lineWidth/i.x,r=n.lineWidth/i.z;switch(n.kind){case"automatic":return Is(t,[0],r);case"tile":return Math.max(Is(e,[0],s),Is(t,[0],r));case"laminate":{let a=t<.5?0:1;return Math.max(Is(t,[0,.5],r),Is(e,[a===0?0:.5],s))}case"wood":return Math.max(Is(e,[0],s),Is(t,[0],r));default:return 0}}function hl(n,e,t){return Math.round(n+(e-n)*t)}function aS(n,e,t){let i=(e+.5)/Pn,s=(t+.5)/Pn,r=rS(n,i,s);switch(n.kind){case"automatic":return hl(255,226,r);case"tile":return hl(255,208,r);case"laminate":{let a=Math.sin((i*7.5+s*.7)*Math.PI*2)*.7,o=Math.sin((i*25+s*1.2)*Math.PI*2)*.35;return hl(Math.min(Math.round(254+a+o),255),228,r)}case"wood":{let a=Math.sin((i*8.5+s*.55)*Math.PI*2)*.65,o=Math.sin((i*29+s*1.1)*Math.PI*2)*.3,c=(Mh(Math.floor(e/4),t,194075)-.5)*.6;return hl(Math.min(Math.round(254+a+o+c),255),230,r)}case"fabric":case"carpet":{let a=e%6===2||t%6===2?-24:0,o=e%6===5||t%6===5?8:0;return 247+a+o}case"concrete":return Math.round(246-Mh(e,t,277015)*18);case"stone":{let a=Mh(Math.floor(e/3),Math.floor(t/3),597045),o=Math.abs(Math.sin((i*2.1+s*1.35)*Math.PI*2));return Math.round(246-a*12-(o<.055?20:0))}default:return 255}}function oS(n){let e=new Uint8Array(Pn*Pn*4);for(let i=0;i<Pn;i+=1)for(let s=0;s<Pn;s+=1){let r=Math.min(Math.max(aS(n,s,i),0),255),a=(i*Pn+s)*4;e[a]=r,e[a+1]=r,e[a+2]=r,e[a+3]=255}let t=new sr(e,Pn,Pn,gn,on);return t.wrapS=vs,t.wrapT=vs,t.magFilter=Gt,t.minFilter=ai,t.generateMipmaps=!0,t.anisotropy=4,t.colorSpace=Kt,t.userData.portablePattern={...n},t.userData.meterPeriod=Sh(n),t.userData.portablePatternRaster=sS(n),t.needsUpdate=!0,t}function sm(n,e={},t=null){let i={color:n.baseColor,roughness:n.roughness,metalness:n.metallic,transparent:n.opacity<1,opacity:n.opacity,depthWrite:e.depthWrite??!0,side:e.side??Un,map:t},s=e.physical?new pa({...i,transmission:e.transmission??0}):new An(i);return s.userData.materialKey=n.materialKey,s.userData.portableAppearance={...n},s}function Ei(){let n=new Map,e=new Map;function t(i){if(!i.pattern)return null;let s=tS(i);return e.has(s)||e.set(s,oS(i.pattern)),e.get(s)}return{material(i,s,r={}){let a=im(i,s),o={...r,physical:r.physical??a.materialKey==="glass"},c=nS(a,o);return n.has(c)||n.set(c,sm(a,o,t(a))),n.get(c)},instance(i,s,r={}){let a=im(i,s);return sm(a,{...r,physical:r.physical??a.materialKey==="glass"},t(a))}}}function om(n){return Number(n).toFixed(6)}function Eh(){let n=new Map,e=Ei();return{boxGeometry(t){let i=\`box:\${t.map(om).join(":")}\`;return n.has(i)||n.set(i,new Wt(...t)),n.get(i)},geometry(t){let i,s;switch(t.type){case"extrude":i=[t.height,...t.outline.flat()],s=()=>{let a=new Xn;t.outline.forEach(([c,l],u)=>{u===0?a.moveTo(c,-l):a.lineTo(c,-l)}),a.closePath();let o=new bi(a,{depth:t.height,bevelEnabled:!1,steps:1});return o.translate(0,0,-t.height/2),o.rotateX(-Math.PI/2),o};break;case"cylinder":i=[t.radius,t.height,t.radialSegments??24],s=()=>new yi(t.radius,t.radius,t.height,t.radialSegments??24);break;case"sphere":i=[t.radius,t.widthSegments??20,t.heightSegments??14],s=()=>new Mi(t.radius,t.widthSegments??20,t.heightSegments??14);break;default:return this.boxGeometry(t.size)}let r=\`\${t.type}:\${i.map(om).join(":")}\`;return n.has(r)||n.set(r,s()),n.get(r)},material(t){return e.material(t)}}}function cS(n,e,t){let i=t.appearance?.materialSlots??{},s=e.materialDefaults[n.slot]??e.materialDefaults[n.fallbackSlot]??{materialKey:"custom",baseColor:"#B8B3AA",roughness:.7,metallic:0,opacity:1},r=i[n.slot]??(n.fallbackSlot?i[n.fallbackSlot]:void 0);return{...s,...r}}function cm(n,e){n.userData.sceneObjectId=e.id,n.userData.sceneElementType="object",n.userData.kind=e.kind,n.userData.binding=e.binding??null,n.userData.assetKey=e.assetKey,n.userData.variantKey=e.variantKey}function lm(n,e,t=Eh()){let i=tm(e.assetKey,e.variantKey);if(!i)return console.warn(\`Mikonus interior asset \${e.assetKey}/\${e.variantKey} is not supported; skipping \${e.id}.\`),null;let s=e.dimensions,r=i(s,e.parameters??{}),a=new _t;a.position.set(e.position.x,e.position.y,e.position.z),a.rotation.y=ut.degToRad(e.rotation.y),cm(a,e),a.userData.anchor="groundCenter",a.userData.forwardAxis="+Z",a.userData.dimensions={...s},a.userData.recipeYawOffsetDegrees=r.yawOffsetDegrees??0;let o=new _t;o.rotation.y=ut.degToRad(r.yawOffsetDegrees??0),a.add(o);for(let c of r.parts){let l=new pt(t.geometry(c),t.material(cS(c,r,e)));l.name=\`\${e.assetKey}:\${c.name}\`,l.position.set(c.position[0],c.position[1]+s.height/2,c.position[2]),c.rotation&&l.rotation.set(...c.rotation),c.scale&&l.scale.set(...c.scale),cm(l,e),l.userData.materialSlot=c.slot,l.userData.recipePart=c.name,o.add(l)}return n.add(a),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:a,pickables:[],visual:{type:"furniture",assetKey:e.assetKey,variantKey:e.variantKey,pathMotionRoot:o}}}function yr(n,e,t,i){return{type:"box",name:n,role:e,size:t,position:i}}function Qt(n,e,t,i,s,r=void 0){return{type:"cylinder",name:n,role:e,radius:t,height:i,position:s,rotation:r}}function lS(n,e,t,i){return{type:"sphere",name:n,role:e,radius:t,position:i}}function uS(n,e,t,i,s,r){return{type:"frustum",name:n,role:e,topRadius:t,bottomRadius:i,height:s,position:r}}function hS(n){let e=Math.min(n.width,n.depth),t=Math.max(n.height*.2,.018),i=Math.max(n.height*.42,.035),s=Math.max(n.height*.22,.018);return[Qt("mount","body",e*.3,t,[0,n.height/2-t/2,0]),Qt("shade","body",e*.48,i,[0,n.height*.05,0]),Qt("diffuser","diffuser",e*.41,s,[0,-n.height/2+s/2,0])]}function Da(n,e,t=1){let i=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),s=Math.max(n.height*.045,.025),r=t===1?Math.min(n.width*.42,n.depth):n.width*.88,a=n.height*.43-i,o=Math.max(n.height*.14,.08),c=Math.min(n.depth*.44,n.width/(t*2.35)),l=(e.shadeDiameter??.35)/2,u=Math.min(c,Math.max(l,c*.72)),h=Math.max(n.width-u*2.25,0),f=[yr("mount","body",[r,s,n.depth*.58],[0,n.height/2-s/2,0])];for(let d=0;d<t;d+=1){let p=t===1?.5:d/(t-1),x=-h/2+h*p,m=Math.max(o*.16,.012);f.push(Qt(\`cable-\${d}\`,"body",Math.max(n.width*.007,.006),i,[x,n.height/2-s-i/2,0])),f.push(Qt(\`shade-\${d}\`,"body",u,o,[x,a,0])),f.push(Qt(\`diffuser-\${d}\`,"diffuser",u*.82,m,[x,a-o/2+m/2,0]))}return f}function dS(n,e){let t=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),i=Math.max(n.height*.045,.025),s=n.height*.43-t,r=Math.max(n.height*.075,.045),a=Math.max(r*.22,.012);return[yr("mount","body",[n.width*.42,i,n.depth*.62],[0,n.height/2-i/2,0]),Qt("cable-left","body",.006,t,[-n.width*.34,n.height/2-i-t/2,0]),Qt("cable-right","body",.006,t,[n.width*.34,n.height/2-i-t/2,0]),yr("bar","body",[n.width,r,n.depth*.72],[0,s,0]),yr("diffuser","diffuser",[n.width*.94,a,n.depth*.56],[0,s-r/2+a/2,0])]}function fS(n,e){let t=Math.max(Math.min(n.width,n.depth),.12),i=Math.max(n.height,.3),s=Number.isFinite(e.shadeDiameter)?e.shadeDiameter:t*.9,a=Math.min(Math.max(s,t*.82),t)/2,o=a*.64,c=Math.min(Math.max(i*.3,.24),i*.38),l=i/2-c/2-i*.025,u=Math.max(n.height*.035,.025),h=l+c*.16,f=-n.height/2+u;return[Qt("base","body",n.width*.38,u,[0,-n.height/2+u/2,0]),Qt("stem","body",Math.max(n.width*.025,.009),Math.max(h-f,.12),[0,(h+f)/2,0]),uS("shade","shade",o,a,c,[0,l,0]),lS("diffuser","diffuser",Math.max(o*.5,.045),[0,l-c*.08,0])]}function pS(n,e){let t=Math.max(n.height*.035,.025),i=n.height*.28,s=n.height/2-i/2,r=Math.min(e.shadeDiameter??.35,Math.min(n.width,n.depth))/2;return[Qt("base","body",n.width*.38,t,[0,-n.height/2+t/2,0]),Qt("stem","body",Math.max(n.width*.025,.009),n.height*.62,[0,-n.height*.13,0]),Qt("shade","shade",r,i,[0,s,0]),Qt("diffuser","diffuser",Math.max(r*.45,.035),Math.max(i*.28,.02),[0,s-i*.14,0])]}function mS(n){let e=Math.max(n.depth*.18,.018),t=n.depth*.62,i=Math.max(n.depth*.16,.016);return[yr("mount","body",[n.width*.58,n.height*.58,e],[0,0,-n.depth/2+e/2]),Qt("shade","body",Math.min(n.width,n.height)*.44,t,[0,0,-n.depth/2+e+t/2],[Math.PI/2,0,0]),Qt("diffuser","diffuser",Math.min(n.width,n.height)*.34,i,[0,0,n.depth/2-i/2],[Math.PI/2,0,0])]}function gS(n){let e=n.height*.32;return[Qt("shade","body",Math.min(n.width,n.depth)*.48,n.height,[0,0,0]),Qt("diffuser","diffuser",Math.min(n.width,n.depth)*.32,e,[0,-n.height/2+e/2,0])]}function xS(n,e){let t=Math.max(e.stripThickness??.025,.008);return[yr("strip","diffuser",[Math.max(n.width-Math.min(n.width*.2,.008),.008),t,t],[0,0,0])]}var vS=Object.freeze({ceilingLight:(n,e)=>hS(n,e),pendantLight:(n,e)=>Da(n,e,1),pendantSpot1:(n,e)=>Da(n,e,1),pendantSpot2:(n,e)=>Da(n,e,2),pendantSpot3:(n,e)=>Da(n,e,3),pendantSpot4:(n,e)=>Da(n,e,4),pendantLED:dS,floorLamp:fS,tableLamp:pS,wallLight:(n,e)=>mS(n,e),recessedSpot:(n,e)=>gS(n,e),ledStrip:xS});function um(n,e,t={}){let i=vS[n];return i?i(e,t):null}var La=2,es=Object.freeze({hemisphere:Object.freeze({skyColor:16776179,groundColor:8358552,intensity:.82}),key:Object.freeze({color:16773852,intensity:2.15,direction:Object.freeze({x:-.48,y:1,z:.62})}),fill:Object.freeze({color:12177646,intensity:.24,direction:Object.freeze({x:.72,y:.62,z:-.58})}),globalShadow:Object.freeze({mapSize:2048,bias:-35e-5,normalBias:.025,radius:3})});function dm(n){n.shadowMap.enabled=!0,n.shadowMap.type=Es,n.shadowMap.autoUpdate=!1,n.shadowMap.needsUpdate=!0}function fm(n,e){n.shadowMap.enabled=e,n.shadowMap.needsUpdate=e}function wh(n){return n?(n.userData.dashboardBaseIntensity??=n.intensity,n.userData.dashboardBaseIntensity):0}function pm(n){let e=n.userData.dashboardAmbientBrightnessFactor??1,t=n.userData.dashboardEnvironmentIntensityFactor??1;n.intensity=wh(n)*e*t}function mm(n,e){let t=n?.hemisphere;t&&(t.userData.dashboardAmbientBrightnessFactor=Number.isFinite(e)?Math.max(e,0):1,pm(t))}function gm(n,e){if(!n||!e)return;let t=e.ambientIntensityFactor??1,i=e.keyIntensityFactor??1,s=e.fillIntensityFactor??1;n.hemisphere&&(n.hemisphere.userData.dashboardEnvironmentIntensityFactor=t,pm(n.hemisphere)),n.keyLight&&(n.keyLight.intensity=wh(n.keyLight)*i),n.fillLight&&(n.fillLight.intensity=wh(n.fillLight)*s)}function xm(n,e,t){let i=Number.isFinite(t)?Math.min(Math.max(t,0),1):1;n?.keyLight?.shadow&&(n.keyLight.shadow.intensity=i);for(let s of e?.values?.()??[]){let r=s.visual?.light?.shadow;r&&(r.intensity=i)}}function Th(n,e,t){n?.keyLight&&(n.keyLight.castShadow=t);for(let i of e?.values?.()??[]){let s=i.visual?.light;s?.isLight&&(s.castShadow=t&&s.userData.selectedForIllumination===!0)}}function _S(n){return(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean)}function hm(n){return _S(n).some(e=>e.transparent===!0&&e.opacity<.98||e.transmission>0)}function yS(n){n.traverse(e=>{if(!e.isMesh)return;if(e.userData.isPhysicalLightOccluder){e.castShadow=!0,e.receiveShadow=!1;return}if(e.userData.isPickProxy){e.castShadow=!1,e.receiveShadow=!1;return}let t=e.userData.sceneElementType==="room",i=e.userData.lightRole==="diffuser";e.castShadow=!t&&!i&&!hm(e),e.receiveShadow=!hm(e)})}function bS(n){n.updateWorldMatrix(!0,!0);let e=new dn,t=new dn;return n.traverse(i=>{!i.isMesh||i.userData.isPhysicalLightOccluder||e.union(t.setFromObject(i))}),e.isEmpty()&&(e.min.set(-1,0,-1),e.max.set(1,2,1)),e}function MS(n,e){let t=e.getCenter(new D),i=e.getSize(new D),s=Math.max(Math.hypot(i.x,i.z)/2+.65,1.5),r=es.key.direction;n.position.set(t.x+r.x*s,e.max.y+r.y*s,t.z+r.z*s),n.target.position.set(t.x,e.min.y+Math.min(i.y*.28,.75),t.z);let a=n.shadow.camera;return a.left=-s,a.right=s,a.top=s,a.bottom=-s,a.near=.1,a.far=s*3.4+i.y,a.updateProjectionMatrix(),{bounds:e,center:t,horizontalRadius:s}}function vm(n,e){yS(e);let t=bS(e),i=es.hemisphere,s=new ga(i.skyColor,i.groundColor,i.intensity);s.name="DashboardAmbientHemisphere",n.add(s);let r=es.key,a=new ur(r.color,r.intensity);a.name="DashboardShadowKey",a.castShadow=!0,a.shadow.mapSize.setScalar(es.globalShadow.mapSize),a.shadow.bias=es.globalShadow.bias,a.shadow.normalBias=es.globalShadow.normalBias,a.shadow.radius=es.globalShadow.radius,n.add(a,a.target);let o=MS(a,t),c=es.fill,l=new ur(c.color,c.intensity);return l.name="DashboardSkyFill",l.castShadow=!1,l.position.set(o.center.x+c.direction.x*o.horizontalRadius,t.max.y+c.direction.y*o.horizontalRadius,o.center.z+c.direction.z*o.horizontalRadius),l.target.position.copy(o.center),n.add(l,l.target),{hemisphere:s,keyLight:a,fillLight:l,shadowFit:o}}var SS=4,ES=512,_m=Object.freeze({ceilingLight:Object.freeze({intensity:54,distance:5,inner:26,outer:76,priority:9}),pendantLight:Object.freeze({intensity:44,distance:4.8,inner:30,outer:78,priority:8}),pendantSpot1:Object.freeze({intensity:56,distance:4.2,inner:14,outer:44,priority:10}),pendantSpot2:Object.freeze({intensity:58,distance:4.8,inner:24,outer:70,priority:10}),pendantSpot3:Object.freeze({intensity:62,distance:5,inner:26,outer:78,priority:10}),pendantSpot4:Object.freeze({intensity:66,distance:5.2,inner:28,outer:84,priority:10}),pendantLED:Object.freeze({intensity:48,distance:4.6,inner:34,outer:82,priority:8}),floorLamp:Object.freeze({intensity:30,distance:4,inner:72,outer:124,priority:6}),tableLamp:Object.freeze({intensity:22,distance:2.8,inner:34,outer:82,priority:5}),wallLight:Object.freeze({intensity:38,distance:3.6,inner:26,outer:74,priority:7,direction:"forward"}),recessedSpot:Object.freeze({intensity:52,distance:4,inner:14,outer:42,priority:10}),ledStrip:Object.freeze({intensity:26,distance:2.8,inner:46,outer:104,priority:5})}),wS=_m.ceilingLight;function Ah(n){return n.reduce((e,t)=>e+t,0)/Math.max(n.length,1)}function ym(n,e,t,i){let s=_m[e]??wS,r=i.filter(h=>h.role==="diffuser"),a=r.length>0?r:i,o=new D(Ah(a.map(h=>h.position[0])),Ah(a.map(h=>h.position[1]+t/2)),Ah(a.map(h=>h.position[2]))),c=s.direction==="forward"?new D(0,0,1):new D(0,-1,0);o.addScaledVector(c,.035);let l=new xa(16777215,0,s.distance,ut.degToRad(s.outer/2),.68,2);l.name=\`DashboardSmartLight:\${e}\`,l.position.copy(o),l.castShadow=!1,l.shadow.mapSize.setScalar(ES),l.shadow.bias=-45e-5,l.shadow.normalBias=.025,l.shadow.camera.near=.03,l.shadow.camera.far=s.distance,l.shadow.camera.layers.enable(La),l.userData.smartLightProfile=s,l.userData.selectedForIllumination=!1;let u=new zt;return u.name=\`DashboardSmartLightTarget:\${e}\`,u.position.copy(o).add(c),l.target=u,n.add(l,u),{light:l,target:u,profile:s}}function Ch(n,e=SS){let t=[...n.values()].filter(s=>s.kind==="light"&&s.visual?.type==="light"&&s.visual.lightState?.known&&s.visual.lightState.on&&s.visual.lightState.brightness>.001).sort((s,r)=>{let a=s.visual.lightProfile.priority+s.visual.lightState.brightness;return r.visual.lightProfile.priority+r.visual.lightState.brightness-a||s.id.localeCompare(r.id)}),i=new Set(t.slice(0,e).map(s=>s.id));for(let s of n.values()){if(s.kind!=="light"||s.visual?.type!=="light")continue;let{light:r,lightProfile:a,lightState:o}=s.visual,c=i.has(s.id);r.userData.selectedForIllumination=c,r.castShadow=c,r.intensity=c?a.intensity*o.brightness**2:0}return i}var{DOLLHOUSE_WALL_HEIGHT:Ph,buildWallPanels:TS,collectWallOpenings:AS,joinedWallPanel:CS,resolveWallPresentation:RS,resolveWallJoinTopology:Mm,roundedCornerFootprint:Rh,wallFrame:IS}=bm.default,Bn=Object.freeze({height:.055,overhang:.018,color:2434081}),PS=.075,wi={floor:15262682,wall:16250352,sofa:8559003,wood:11041109,darkWood:5588026,kitchen:14209736,counter:5988967,metal:9147029,rug:12101775,green:7901816,pot:10318422,hob:1975079,fridge:11449783,door:12094306,window:10405330,lampOff:14209724,lampOn:16766044,unavailable:9410201},DS={hob:{roughness:.35,metalness:.2},metal:{roughness:.6,metalness:.15},window:{roughness:.25,metalness:.08,transparent:!0,opacity:.62}};function LS(n,e={}){let t=DS[n]??{};return new An({color:wi[n]??wi.wall,roughness:e.roughness??t.roughness??.82,metalness:e.metalness??t.metalness??0,transparent:e.transparent??t.transparent??!1,opacity:e.opacity??t.opacity??1})}function Mr(n){return ut.degToRad(n)}function Nt(n,e,t){n.userData.sceneObjectId=e.id,n.userData.sceneElementType=t,n.userData.kind=e.kind??t,n.userData.binding=e.binding??null}function OS(n,e="local"){if(e!=="longestBoundary"||n.length<2)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let t={x:1,z:0},i=0;if(n.forEach((a,o)=>{let c=n[(o+1)%n.length],l={x:c.x-a.x,z:c.z-a.z},u=l.x*l.x+l.z*l.z;u>i&&(t=l,i=u)}),i<=1e-6)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let s=Math.sqrt(i),r={x:t.x/s,z:t.z/s};return(r.x<-1e-4||Math.abs(r.x)<=1e-4&&r.z<0)&&(r={x:-r.x,z:-r.z}),{xAxis:r,zAxis:{x:-r.z,z:r.x}}}function NS(n,e,t){let i=t.map?.userData?.portablePattern,s=t.map?.userData?.meterPeriod;if(!i||!s)return null;let r=OS(e,i.orientation),a=n.getAttribute("position"),o=new Float32Array(a.count*2);for(let c=0;c<a.count;c+=1){let l=a.getX(c),u=a.getZ(c);o[c*2]=(l*r.xAxis.x+u*r.xAxis.z)/s.x,o[c*2+1]=(l*r.zAxis.x+u*r.zAxis.z)/s.z}return n.setAttribute("uv",new hn(o,2)),r}function FS(n,e,t=Ei()){let i=new Xn;e.polygon.forEach((c,l)=>{l===0?i.moveTo(c.x,-c.z):i.lineTo(c.x,-c.z)}),i.closePath();let s=new fa(i);s.rotateX(-Math.PI/2);let r=t.material(e.material,{materialKey:"custom",baseColor:"#E8E3DA",roughness:.88,metallic:0,opacity:1}),a=NS(s,e.polygon,r),o=new pt(s,r);return o.position.y=e.elevation,o.userData.floorThickness=e.floorThickness,a&&(o.userData.floorPatternAlignment=a),Nt(o,e,"room"),n.add(o),o}function US(n){let e=[...n.rooms.map(i=>i.elevation-PS/2),...n.walls.map(i=>i.baseY)].filter(Number.isFinite),t=e.length>0?Math.min(...e):0;return{...n,foundationBaseY:t,walls:n.walls.map(i=>({...i,authoredBaseY:i.baseY,baseY:t}))}}function Sm(n,e,t){let i=n/2,s=e/2,r=Math.min(Math.max(t,.001),i,s),a=new Xn;return a.moveTo(-i+r,-s),a.lineTo(i-r,-s),a.quadraticCurveTo(i,-s,i,-s+r),a.lineTo(i,s-r),a.quadraticCurveTo(i,s,i-r,s),a.lineTo(-i+r,s),a.quadraticCurveTo(-i,s,-i,s-r),a.lineTo(-i,-s+r),a.quadraticCurveTo(-i,-s,-i+r,-s),a.closePath(),a}function BS(n,e){let t=Math.min(Bn.height*.45,e*.22),i=new bi(Sm(e,Bn.height,t),{depth:n,bevelEnabled:!1,steps:1,curveSegments:5});return i.translate(0,0,-n/2),i.rotateY(Math.PI/2),i}function kS(n,e){let t={materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1},i=e.material(n.materials?.body,t),s=e.material(n.materials?.positiveSide,t),r=e.material(n.materials?.negativeSide,t);return{body:i,positive:s,negative:r,box:[i,i,i,i,s,r]}}function zS(n,e,t={doors:[],windows:[]},i,s=Ei()){let r=IS(e),a=AS(t,e),o=TS(e,a),c=i??Mm(t.walls??[e]),l=new _t;Nt(l,e,"wall"),l.userData.authoredBaseY=e.authoredBaseY??e.baseY,l.userData.foundationBaseY=e.baseY,l.userData.physicalHeight=e.height,l.userData.presentationHeight=Math.min(e.height,Ph),l.userData.lightOccluderPanels=[];let u=kS(e,s),h=new En({color:Bn.color}),f=new En({color:0,colorWrite:!1,depthWrite:!1});for(let d of o){let p=CS(d,e,c),x=RS(p,e.height);l.userData.lightOccluderPanels.push(...x.lightOccluderPanels.map(b=>({...b})));let m=Math.abs(d.minimumOffset)<=.003,g=Math.abs(d.maximumOffset-r.length)<=.003,w=m&&c.joinedEndpoints.has(\`\${e.id}:start\`),E=g&&c.joinedEndpoints.has(\`\${e.id}:end\`),y=w?0:Bn.overhang,T=E?0:Bn.overhang;for(let b of x.visiblePanels){let C=new pt(new Wt(b.width,b.height,e.thickness),u.box);C.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.userData.wallPart="body",C.userData.physicalWallHeight=e.height,Nt(C,e,"wall");let v=b.width+y+T,S=new pt(BS(v,e.thickness+Bn.overhang*2),h);S.position.set((T-y)/2,b.height/2+Bn.height/2-Math.min(Bn.height*.22,.012),0),S.userData.wallPart="cap",Nt(S,e,"wall"),C.add(S),l.add(C)}for(let b of x.lightOccluderPanels){let C=new pt(new Wt(b.width,b.height,e.thickness),f);C.name=\`PhysicalWallOccluder:\${e.id}\`,C.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.layers.set(La),C.castShadow=!0,C.receiveShadow=!1,C.userData.wallPart="physical-light-occluder",C.userData.isPhysicalLightOccluder=!0,C.userData.excludeFromCameraFit=!0,Nt(C,e,"wall"),l.add(C)}}return n.add(l),l}function Ih(n,e){let t=new Xn;n.forEach((s,r)=>{r===0?t.moveTo(s.x,-s.z):t.lineTo(s.x,-s.z)}),t.closePath();let i=new bi(t,{depth:e,bevelEnabled:!1,steps:1});return i.rotateX(-Math.PI/2),i}function HS(n,e,t=Ei()){let i=[];for(let[s,r]of e.roundedCorners.entries()){let a=[r.first.wall,r.second.wall].sort((f,d)=>f.id.localeCompare(d.id))[0],o=new _t;o.name=\`rounded-wall-corner-\${s}\`,o.userData.roundedWallIds=[r.first.wall.id,r.second.wall.id],o.userData.physicalHeight=r.height,o.userData.presentationHeight=Math.min(r.height,Ph),Nt(o,a,"wall");let c=Math.min(r.height,Ph),l=new pt(Ih(Rh(r),c),t.material(a.materials?.body,{materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1}));l.position.y=r.elevation,l.userData.wallPart="rounded-corner-body",Nt(l,a,"wall");let u=new pt(Ih(Rh(r,Bn.overhang),Bn.height),new En({color:Bn.color}));u.position.y=r.elevation+c-Math.min(Bn.height*.22,.012),u.userData.wallPart="rounded-corner-cap",Nt(u,a,"wall"),o.add(l,u);let h=r.height-c;if(h>=.04){let f=new pt(Ih(Rh(r),h),new En({color:0,colorWrite:!1,depthWrite:!1}));f.name=\`PhysicalRoundedWallOccluder:\${s}\`,f.position.y=r.elevation+c,f.layers.set(La),f.castShadow=!0,f.receiveShadow=!1,f.userData.wallPart="physical-rounded-light-occluder",f.userData.isPhysicalLightOccluder=!0,f.userData.excludeFromCameraFit=!0,Nt(f,a,"wall"),o.add(f)}n.add(o),i.push(o)}return i}function VS(n,e){let{width:t,depth:i,height:s}=e.size,r;e.shape==="cylinder"?(r=new yi(.5,.5,s,18),r.scale(t,1,i)):e.shape==="ellipsoid"?(r=new Mi(.5,18,12),r.scale(t,s,i)):r=new Wt(t,s,i);let a=new pt(r,LS(e.appearance));return a.position.set(e.position.x,e.position.y+s/2,e.position.z),a.rotation.y=Mr(e.rotation.y),Nt(a,e,"object"),n.add(a),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:a,pickables:e.kind==="light"?[a]:[]}}function GS(n,e){let t=n.type==="box"?n.size:n.type==="sphere"?[n.radius]:n.type==="frustum"?[n.topRadius,n.bottomRadius,n.height]:[n.radius,n.height],i=\`\${n.type}:\${t.map(r=>Number(r).toFixed(6)).join(":")}\`;if(e.has(i))return e.get(i);let s;switch(n.type){case"box":s=new Wt(...n.size);break;case"sphere":s=new Mi(n.radius,24,16);break;case"frustum":s=new yi(n.topRadius,n.bottomRadius,n.height,32,1,!0);break;default:s=new yi(n.radius,n.radius,n.height,24);break}return e.set(i,s),s}function WS(n,e,t=new Map){let i=e.visualType??(e.appearance==="table-lamp"?"tableLamp":"floorLamp"),s=um(i,e.size,e.parameters);if(!s)return console.warn(\`Mikonus light visual type \${i} is not supported; skipping \${e.id}.\`),null;let r=new _t;r.position.set(e.position.x,e.position.y,e.position.z),r.rotation.y=Mr(e.rotation.y),Nt(r,e,"object");let{width:a,height:o,depth:c}=e.size,l=new An({color:5984585,roughness:.62,metalness:.18}),u=new An({color:wi.lampOff,emissive:0,emissiveIntensity:0,roughness:.45}),h=new An({color:12819559,emissive:0,emissiveIntensity:0,roughness:.75,side:nn}),f=[];for(let x of s){let m=x.role==="diffuser"?u:x.role==="shade"?h:l,g=new pt(GS(x,t),m);g.name=\`\${i}:\${x.name}\`,g.position.set(x.position[0],x.position[1]+o/2,x.position[2]),x.rotation&&g.rotation.set(...x.rotation),g.userData.recipePart=x.name,g.userData.lightRole=x.role,Nt(g,e,"object"),r.add(g),f.push(g)}let d=ym(r,i,o,s),p=[];if(e.binding){let x=new En({side:nn});x.visible=!1;let m=new pt(new Mi(1,12,8),x);m.position.y=o/2,m.scale.set(Math.max(a*.65,.24),Math.max(o*.5,.24),Math.max(c*.65,a*.65,.24)),m.userData.isPickProxy=!0,Nt(m,e,"object"),r.add(m),p.push(m,...f)}return n.add(r),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:r,pickables:p,visual:{type:"light",visualType:i,bulbMaterial:u,shadeMaterial:h,emissiveMaterials:[u],bodyMaterials:[l,h],light:d.light,lightTarget:d.target,lightProfile:d.profile,lightState:null}}}function XS(n,e,t,i){return e.kind==="light"?WS(n,e,i):e.assetKey?lm(n,e,t):VS(n,e)}function qS(n){let e=[],t=new Set;for(let i of n)if(i.binding){for(let s of i.pickables??[])t.has(s)||(t.add(s),e.push(s));i.root.traverse(s=>{!s.isMesh||t.has(s)||s.userData.excludeFromDevicePicking||(t.add(s),e.push(s))})}return e}function br(n,e,t,i,s,r,a){let o=new pt(e,t);return o.position.set(...i),o.userData.architectureRole=a,Nt(o,s,r),n.add(o),o}function Oa({parent:n,width:e,height:t,depth:i,thickness:s,material:r,description:a,elementType:o,role:c,offsetX:l=0,offsetY:u=0}){let h=new Wt(s,t,i),f=new Wt(e,s,i);return[br(n,h,r,[l+s/2,u+t/2,0],a,o,c),br(n,h,r,[l+e-s/2,u+t/2,0],a,o,c),br(n,f,r,[l+e/2,u+s/2,0],a,o,c),br(n,f,r,[l+e/2,u+t-s/2,0],a,o,c)]}function YS(n,e,t,i){let s=new bi(Sm(n,e,i),{depth:t,bevelEnabled:!1,steps:1,curveSegments:5});return s.translate(0,0,-t/2),s.userData.cornerRadius=i,s}function $S(n,e,t,i=Ei()){let s=new _t;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=Mr(e.rotation.y),Nt(s,e,"door");let{width:r,depth:a,height:o}=e.size,c=Math.min(Math.max(Math.min(r,o)*.075,.025),.055),l=Math.max(a,.018)+.012,u=Math.max(t?.thickness??0,a,l),h=Math.min(c,.025),f=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),d={materialKey:"wood",baseColor:"#BBAA88",roughness:.86,metallic:0,opacity:1},p=i.material(e.materials?.frame,d),x=i.instance(e.materials?.panel,d),m=x.color.getHex(),g=new _t;g.name="DoorReveal",g.userData.architectureRole="door-reveal",Nt(g,e,"door"),Oa({parent:g,width:r,height:o,depth:u,thickness:h,material:f,description:e,elementType:"door",role:"door-reveal"}),s.add(g);let w=new _t;w.name="DoorFrame",w.userData.architectureRole="door-frame",Nt(w,e,"door"),Oa({parent:w,width:r,height:o,depth:l,thickness:c,material:p,description:e,elementType:"door",role:"door-frame"}),s.add(w);let E=new _t;E.name="DoorLeaf",E.userData.architectureRole="door-leaf-hinge",Nt(E,e,"door");let y=br(E,YS(r,o,Math.max(a,.018),.008),x,[r/2,o/2,0],e,"door","door-leaf");return s.add(E),n.add(s),{id:e.id,elementType:"door",kind:"door",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:E,panelMaterial:x,frameMaterial:p,baseColor:m,stateMaterials:[{material:y.material,baseColor:m}],closedAngle:0,openAngle:Mr(e.openAngle)}}}function jS(n,e,t,i=Ei()){let s=new _t;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=Mr(e.rotation.y),Nt(s,e,"window");let{width:r,depth:a,height:o}=e.size,c=Math.min(Math.max(Math.min(r,o)*.075,.025),.055),l=Math.max(a,.014)+.012,u=Math.max(t?.thickness??0,a,l),h=Math.min(c,.025),f=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),d=i.material(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),p=i.instance(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),x=i.instance(e.materials?.panel,{materialKey:"glass",baseColor:"#B8CCD1",roughness:.36,metallic:0,opacity:.3},{physical:!0,transmission:.22,depthWrite:!1,side:nn});Object.assign(x,{depthWrite:!1,side:nn});let m=x.color.getHex(),g=p.color.getHex(),w=new _t;w.name="WindowReveal",w.userData.architectureRole="window-reveal",Nt(w,e,"window"),Oa({parent:w,width:r,height:o,depth:u,thickness:h,material:f,description:e,elementType:"window",role:"window-reveal"}),s.add(w);let E=new _t;E.name="WindowFrame",E.userData.architectureRole="window-frame",Nt(E,e,"window"),Oa({parent:E,width:r,height:o,depth:l,thickness:c,material:d,description:e,elementType:"window",role:"window-frame"}),s.add(E);let y=new _t;y.name="WindowSash",y.userData.architectureRole="window-sash",Nt(y,e,"window");let T=c,b=Math.max(r-T*2,c),C=Math.max(o-T*2,c),v=Math.min(Math.max(c*.58,.014),.028),S=Math.max(a,.014)+.006,P=Oa({parent:y,width:b,height:C,depth:S,thickness:v,material:p,description:e,elementType:"window",role:"window-sash-frame",offsetX:T,offsetY:T}),I=Math.max(b-v*2,.01),O=Math.max(C-v*2,.01),U=br(y,new Wt(I,O,Math.min(Math.max(a,.008),.022)),x,[r/2,o/2,0],e,"window","window-glass");return U.renderOrder=1,s.add(y),n.add(s),{id:e.id,elementType:"window",kind:"window",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:y,panelMaterial:x,frameMaterial:d,baseColor:m,stateMaterials:[{material:x,baseColor:m},...P.map(q=>({material:q.material,baseColor:g}))],closedAngle:0,openAngle:Mr(e.openAngle),size:{width:r,height:o,depth:a},glass:U}}}function Em(n){let e=n.floors.find(i=>i.id===n.activeFloorId);if(!e)throw new Error(\`Active floor \${n.activeFloorId} does not exist.\`);let t=new Jr;try{let i=new _t;i.userData.sceneId=n.sceneId,i.userData.activeFloorId=e.id,t.add(i);let s=Ei();e.rooms.forEach(p=>FS(i,p,s));let r=US(e);i.userData.foundationBaseY=r.foundationBaseY;let a=Mm(r.walls);r.walls.forEach(p=>zS(i,p,r,a,s)),HS(i,a,s);let o=Eh(),c=new Map,l=[...e.objects.map(p=>XS(i,p,o,c)),...e.doors.map(p=>$S(i,p,r.walls.find(x=>x.id===p.wallId),s)),...e.windows.map(p=>jS(i,p,r.walls.find(x=>x.id===p.wallId),s))].filter(Boolean),u=new Map(l.map(p=>[p.id,p])),h=l.flatMap(p=>p.pickables),f=qS(l),d=vm(t,i);return{scene:t,sceneRoot:i,activeFloor:e,entities:u,lighting:d,pickables:h,devicePickables:f}}catch(i){throw dl(t),i}}function dl(n){if(!n)return;let e=new Set,t=new Set,i=new Set,s=new Set;n.traverse(r=>{r.shadow?.map&&s.add(r.shadow.map),r.shadow?.mapPass&&s.add(r.shadow.mapPass),r.geometry&&e.add(r.geometry),(Array.isArray(r.material)?r.material:[r.material]).filter(Boolean).forEach(o=>{t.add(o),Object.values(o).forEach(c=>{c?.isTexture&&i.add(c)})})}),i.forEach(r=>r.dispose()),s.forEach(r=>r.dispose()),e.forEach(r=>r.dispose()),t.forEach(r=>r.dispose()),n.clear()}var ZS=new Set(["room","wall","door","window"]),Dh=1.1,KS=.02,Sr=34,JS=.55,QS=2.5,Lh=new D(0,1,0);function wm(n,e){let t=n.geometry?.getAttribute("position");if(!t)return;let i=new D;for(let s=0;s<t.count;s+=1)i.fromBufferAttribute(t,s).applyMatrix4(n.matrixWorld),e.push(i.clone())}function eE(n,e){n.updateWorldMatrix(!0,!0),n.traverse(t=>{t.isMesh&&wm(t,e)})}function Fa(n,e=new Map){let t=[];n.updateWorldMatrix(!0,!0),n.traverse(i=>{i.isMesh&&!i.userData.excludeFromCameraFit&&ZS.has(i.userData.sceneElementType)&&wm(i,t)});for(let i of e.values()){if(i.visual?.type!=="contact")continue;let s=i.visual.motionRoot??i.root,r=s.rotation.y;for(let a of[i.visual.closedAngle,i.visual.closedAngle+i.visual.openAngle])s.rotation.y=a,eE(i.root,t);s.rotation.y=r,i.root.updateWorldMatrix(!0,!0)}return n.updateWorldMatrix(!0,!0),t}function tE(n){if(!n.length)return null;let e=new dn().setFromPoints(n);if(e.isEmpty())return null;let t=e.getSize(new D);return new D((e.min.x+e.max.x)/2,e.min.y+t.y*.25,(e.min.z+e.max.z)/2)}function nE(n){let e=n.clone().normalize(),t=new Ms;return t.position.copy(e),t.up.copy(Lh),t.lookAt(0,0,0),t.quaternion.clone()}function Na(n,e){if(!e.length)return null;n.updateMatrixWorld(!0),n.updateProjectionMatrix();let t=new D,i={minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0};for(let s of e)t.copy(s).project(n),i.minX=Math.min(i.minX,t.x),i.maxX=Math.max(i.maxX,t.x),i.minY=Math.min(i.minY,t.y),i.maxY=Math.max(i.maxY,t.y);return{...i,width:i.maxX-i.minX,height:i.maxY-i.minY,centerX:(i.minX+i.maxX)/2,centerY:(i.minY+i.maxY)/2,maximumAbsolute:Math.max(Math.abs(i.minX),Math.abs(i.maxX),Math.abs(i.minY),Math.abs(i.maxY))}}function Tm(n,e,t,i,s=Sr,r=Dh,a=n){let o=Math.max(i,.05),c=ut.clamp(s,1,120),l=Math.tan(ut.degToRad(c)/2),u=l*o,h=t.clone().invert(),f=n.map(y=>y.clone().sub(e).applyQuaternion(h)),d=a.map(y=>y.clone().sub(e).applyQuaternion(h)),p=iE(n,e,t,o,c,r),x=Math.max(...f.map(y=>y.z+.1),.1),m=p.distance,g=1/r,w=(y,T)=>{let b=1/0,C=-1/0,v=1/0,S=-1/0;for(let P of y){let I=T-P.z,O=P.x/(I*u),U=P.y/(I*l);b=Math.min(b,O),C=Math.max(C,O),v=Math.min(v,U),S=Math.max(S,U)}return{minX:b,maxX:C,minY:v,maxY:S}},E=y=>{let T=w(d,y),b=(T.minX+T.maxX)/2,C=(T.minY+T.maxY)/2,v=w(f,y);return Math.max(Math.abs(v.minX-b),Math.abs(v.maxX-b),Math.abs(v.minY-C),Math.abs(v.maxY-C))};for(;E(m)>g;)m*=1.5;for(let y=0;y<48;y+=1){let T=(x+m)/2;E(T)>g?x=T:m=T}return{distance:m,fovDegrees:c}}function Ps(n,e){if(!n?.isPerspectiveCamera||!e.length)return null;n.view?.enabled?n.clearViewOffset():n.updateProjectionMatrix();let t=Na(n,e),i=2,s=i*n.aspect;return n.setViewOffset(s,i,t.centerX*n.aspect,-t.centerY,s,i),n.updateProjectionMatrix(),{ndcBounds:Na(n,e),rawBounds:t}}function iE(n,e,t,i,s=Sr,r=Dh){let a=Math.max(i,.05),o=ut.clamp(s,1,120),c=Math.tan(ut.degToRad(o)/2),l=c*a,u=t.clone().invert(),h=new D,f=0,d=-1/0;for(let p of n)h.copy(p).sub(e).applyQuaternion(u),d=Math.max(d,h.z),f=Math.max(f,h.z+Math.abs(h.x)*r/l,h.z+Math.abs(h.y)*r/c);return{distance:Math.max(f,d+.1,.1),fovDegrees:o}}function sE(n,e,t,i,{allowQuarterTurn:s=!0,centeringPoints:r=n,fovDegrees:a=Sr,padding:o=Dh,minimumImprovement:c=KS}={}){let l=[t.clone().normalize()];s&&l.push(t.clone().applyAxisAngle(Lh,Math.PI/2).normalize());let u=l.map((h,f)=>{let d=nE(h);return{...Tm(n,e,d,i,a,o,r),direction:h,orientationDegrees:f*90,quaternion:d}});return u[1]?.distance<u[0].distance*(1-c)?u[1]:u[0]}function rE(n,e){let t=0;for(let i of n)t=Math.max(t,i.distanceTo(e));return Math.max(t,1)}function Oh(n,e,t){let i=n.position.distanceTo(e),s=Math.max(.25,t*.08);return n.near=Math.max(.03,i-t-s),n.far=Math.max(n.near+1,i+t+s),n.updateProjectionMatrix(),{distance:i,far:n.far,near:n.near,radius:t}}function Am(n,e,t,i,s,r={}){let a=r.centeringPoints?.length?r.centeringPoints:e,o=r.targetPoints?.length?r.targetPoints:a,c=tE(o);if(!c)return null;let l=r.fovDegrees??Sr,u=sE(e,c,s,i,{...r,centeringPoints:a,fovDegrees:l});n.aspect=Math.max(i,.05),n.fov=l,n.zoom=1,n.position.copy(c).addScaledVector(u.direction,u.distance),n.up.copy(Lh),n.lookAt(c),n.updateMatrixWorld(!0);let h=rE([...t,...e],c),f=Math.max(u.distance*JS,h*1.05),d=Math.max(u.distance*QS,f*1.1),p=Oh(n,c,h),x=Ps(n,a);return{...u,...p,maxDistance:d,minDistance:f,centeringBounds:x.ndcBounds,ndcBounds:Na(n,e),target:c}}function aE(n,e=1,t=.001){return n.minX>=-e-t&&n.maxX<=e+t&&n.minY>=-e-t&&n.maxY<=e+t}function Cm(n,e,{worldPoints:t=[],centeringPoints:i=t,target:s=null,clippingPadding:r=1.02}={}){let a=i.length?Ps(n,i):null,o=t.length?Na(n,t):null,c=o?aE(o):!1,l=s?n.position.distanceTo(s):0,u=Math.max(e,.05),h=l,f=!1;if(n.aspect=u,c&&s){let p=Tm(t,s,n.quaternion,u,n.fov,r,i);if(p.distance>l){let x=n.position.clone().sub(s).normalize();n.position.copy(s).addScaledVector(x,p.distance),n.lookAt(s),n.updateMatrixWorld(!0),h=p.distance,f=!0}}n.updateProjectionMatrix();let d=i.length?Ps(n,i):null;return{distance:h,expandedForClipping:f,centeringBounds:d?.ndcBounds??null,ndcBounds:t.length?Na(n,t):null,previousBounds:o}}function oE(n){return 1-(1-n)**3}var fl=class{constructor({camera:e,controls:t,requestRender:i,updateClipping:s=()=>{},onComplete:r=()=>{},isBlocked:a=()=>!1,delayMs:o=0,durationMs:c=700,setTimeoutFn:l=(d,p)=>window.setTimeout(d,p),clearTimeoutFn:u=d=>window.clearTimeout(d),requestAnimationFrameFn:h=d=>window.requestAnimationFrame(d),cancelAnimationFrameFn:f=d=>window.cancelAnimationFrame(d)}){this.camera=e,this.controls=t,this.requestRender=i,this.updateClipping=s,this.onComplete=r,this.isBlocked=a,this.delayMs=o,this.durationMs=c,this.setTimeoutFn=l,this.clearTimeoutFn=u,this.requestAnimationFrameFn=h,this.cancelAnimationFrameFn=f,this.homeView=null,this.timeoutId=null,this.animationFrameId=null}setHomeView({position:e,target:t}){this.homeView={position:e.clone(),target:t.clone()}}cancelTimer(){this.timeoutId!==null&&(this.clearTimeoutFn(this.timeoutId),this.timeoutId=null)}cancelAnimation(){this.animationFrameId!==null&&(this.cancelAnimationFrameFn(this.animationFrameId),this.animationFrameId=null)}cancel(){this.cancelTimer(),this.cancelAnimation()}schedule(){return this.cancelTimer(),this.delayMs<=0||!this.homeView||this.isBlocked()?!1:(this.timeoutId=this.setTimeoutFn(()=>{this.timeoutId=null,this.start()},this.delayMs),!0)}start(){if(this.cancelAnimation(),!this.homeView||this.isBlocked())return!1;let e=this.camera.position.clone(),t=this.controls.target.clone(),i=this.homeView.position,s=this.homeView.target;if(e.distanceToSquared(i)<1e-12&&t.distanceToSquared(s)<1e-12)return this.onComplete(),!1;let r=null,a=o=>{if(this.isBlocked()){this.animationFrameId=null;return}r??=o;let c=Math.min(Math.max((o-r)/this.durationMs,0),1),l=oE(c);if(this.camera.position.lerpVectors(e,i,l),this.controls.target.lerpVectors(t,s,l),this.camera.lookAt(this.controls.target),this.updateClipping(),this.requestRender(),c<1){this.animationFrameId=this.requestAnimationFrameFn(a);return}this.animationFrameId=null,this.controls.update(),this.onComplete()};return this.animationFrameId=this.requestAnimationFrameFn(a),!0}dispose(){this.cancel(),this.homeView=null}};function Rm(n){return Array.isArray(n?.floors)?n.floors.map(e=>e.id):[]}function Im(n,e){let t=new Set(Rm(n));return typeof e=="string"&&t.has(e)?e:typeof n?.defaultFloorId=="string"&&t.has(n.defaultFloorId)?n.defaultFloorId:Rm(n)[0]??null}function Pm(n,e,t){let i=n?.sceneId===e?t:null;return Im(n,i)}function ml(n,e){return\`mikonus.active-floor:\${typeof e=="string"&&e?e:"default"}:\${n}\`}var pl=class{constructor({description:e,initialFloorId:t,createRuntime:i,disposeRuntime:s,maxCachedRuntimes:r=3}){if(!e||!Array.isArray(e.floors)||e.floors.length===0)throw new TypeError("DashboardFloorController requires at least one floor.");if(typeof i!="function"||typeof s!="function")throw new TypeError("DashboardFloorController requires runtime lifecycle callbacks.");if(!Number.isInteger(r)||r<1)throw new TypeError("maxCachedRuntimes must be a positive integer.");this.description=e,this.floorsById=new Map(e.floors.map(a=>[a.id,a])),this.createRuntime=i,this.disposeRuntime=s,this.maxCachedRuntimes=r,this.runtimes=new Map,this.activeFloorId=Im(e,t),this.activeRuntime=null}activate(e=this.activeFloorId){if(!this.floorsById.has(e))throw new RangeError(\`Floor \${String(e)} does not exist in the dashboard scene.\`);let t=this.runtimes.get(e),i=!t;if(t?this.runtimes.delete(e):t=this.createRuntime(e),!t)throw new Error(\`Floor runtime \${e} could not be created.\`);this.runtimes.set(e,t),this.activeFloorId=e,this.activeRuntime=t;let s=[];for(;this.runtimes.size>this.maxCachedRuntimes;){let r=this.runtimes.keys().next().value;if(r===this.activeFloorId)break;let a=this.runtimes.get(r);this.runtimes.delete(r),this.disposeRuntime(a),s.push(r)}return{created:i,evictedFloorIds:s,floorId:e,runtime:t}}get cachedFloorIds(){return[...this.runtimes.keys()]}get cachedRuntimes(){return[...this.runtimes.values()]}dispose(){for(let e of this.runtimes.values())this.disposeRuntime(e);this.runtimes.clear(),this.activeRuntime=null}};function cE(n,e,t){if(!Array.isArray(n)||n.length<=1)return"hidden";if(n.length>4)return"compact";let i=n.map(r=>Math.ceil(t(String(r.name??""))));return i.some(r=>r>112)?"compact":i.reduce((r,a)=>r+a+28,Math.max(n.length-1,0)*3)<=Math.max(Number(e)||0,0)?"segmented":"compact"}function lE(n){let t=n.ownerDocument.createElement("canvas").getContext("2d");return i=>{if(!t)return String(i).length*8;let s=getComputedStyle(n);return t.font=s.font||\`\${s.fontWeight} \${s.fontSize} \${s.fontFamily}\`,t.measureText(String(i)).width}}var gl=class{constructor({host:e,onSelect:t,translate:i=(s,r)=>r}){if(!e||typeof t!="function")throw new TypeError("DashboardFloorSelector requires a host and selection callback.");this.host=e,this.hadHostClass=e.classList.contains("floor-selector"),e.classList.add("floor-selector"),this.onSelect=t,this.floors=[],this.activeFloorId=null,this.availableWidth=0,this.measureText=lE(e),this.translate=i,this.segments=e.ownerDocument.createElement("div"),this.segments.className="floor-selector-segments",this.segments.setAttribute("role","tablist"),this.segments.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.compact=e.ownerDocument.createElement("span"),this.compact.className="floor-selector-compact",this.select=e.ownerDocument.createElement("select"),this.select.className="floor-selector-select",this.select.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.chevron=e.ownerDocument.createElement("span"),this.chevron.className="floor-selector-chevron",this.chevron.setAttribute("aria-hidden","true"),this.chevron.textContent="\\u2304",this.compact.append(this.select,this.chevron),e.append(this.segments,this.compact),this.onCompactChange=()=>this.requestSelection(this.select.value),this.select.addEventListener("change",this.onCompactChange)}update({floors:e,activeFloorId:t,availableWidth:i}){this.floors=Array.isArray(e)?e:[],this.activeFloorId=t,this.availableWidth=Math.max(Number(i)||0,0),this.render()}layout(e){let t=Math.max(Number(e)||0,0);Math.abs(t-this.availableWidth)<1||(this.availableWidth=t,this.render())}requestSelection(e){!e||e===this.activeFloorId||this.onSelect(e)}render(){let e=cE(this.floors,this.availableWidth,this.measureText);if(this.host.hidden=e==="hidden",this.segments.hidden=e!=="segmented",this.compact.hidden=e!=="compact",this.host.dataset.mode=e,e==="hidden"){this.segments.replaceChildren(),this.select.replaceChildren();return}this.select.replaceChildren(...this.floors.map(i=>{let s=this.host.ownerDocument.createElement("option");return s.value=i.id,s.textContent=i.name,s})),this.select.value=this.activeFloorId;let t=this.floors.find(i=>i.id===this.activeFloorId);if(this.select.title=t?.name??"",e==="compact"){this.segments.replaceChildren();let i=this.measureText(t?.name??"")+56;this.compact.style.width=\`\${Math.min(this.availableWidth,Math.max(116,i))}px\`;return}this.segments.replaceChildren(...this.floors.map((i,s)=>{let r=this.host.ownerDocument.createElement("button"),a=i.id===this.activeFloorId;return r.type="button",r.className="floor-selector-segment",r.textContent=i.name,r.title=i.name,r.dataset.floorId=i.id,r.setAttribute("role","tab"),r.setAttribute("aria-selected",String(a)),r.tabIndex=a?0:-1,r.addEventListener("click",()=>this.requestSelection(i.id)),r.addEventListener("keydown",o=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(o.key))return;o.preventDefault();let l=s;o.key==="Home"?l=0:o.key==="End"?l=this.floors.length-1:o.key==="ArrowLeft"||o.key==="ArrowUp"?l=(s-1+this.floors.length)%this.floors.length:l=(s+1)%this.floors.length,[...this.segments.children].find(h=>h.dataset.floorId===this.floors[l].id)?.focus(),this.requestSelection(this.floors[l].id)}),r}))}dispose(){this.hadHostClass||this.host.classList.remove("floor-selector"),this.select.removeEventListener("change",this.onCompactChange),this.host.replaceChildren()}};var uE=7,hE=520;var Er=class{constructor({movementThreshold:e=uE,longPressDelayMs:t=hE,onLongPress:i=()=>!1,schedule:s=(a,o)=>setTimeout(a,o),cancelSchedule:r=a=>clearTimeout(a)}={}){this.activePointers=new Map,this.candidate=null,this.movementThreshold=e,this.longPressDelayMs=t,this.onLongPress=i,this.schedule=s,this.cancelSchedule=r}cancelTimer(e=this.candidate){e?.timer!=null&&(this.cancelSchedule(e.timer),e.timer=null)}pointerDown({pointerId:e,clientX:t,clientY:i}){if(this.activePointers.set(e,{x:t,y:i}),this.activePointers.size!==1){this.candidate&&(this.candidate.moved=!0),this.cancelTimer();return}let s={pointerId:e,x:t,y:i,moved:!1,longPressFired:!1,timer:null};s.timer=this.schedule(()=>{s.timer=null,!(this.candidate!==s||s.moved||this.activePointers.size!==1)&&(s.longPressFired=this.onLongPress({clientX:s.x,clientY:s.y,pointerId:s.pointerId})===!0)},this.longPressDelayMs),this.candidate=s}pointerMove({pointerId:e,clientX:t,clientY:i}){!this.candidate||this.candidate.pointerId!==e||Math.hypot(t-this.candidate.x,i-this.candidate.y)<=this.movementThreshold||(this.candidate.moved=!0,this.cancelTimer())}pointerUp({pointerId:e,clientX:t,clientY:i}){let s=this.candidate;return this.activePointers.delete(e),!s||s.pointerId!==e||(this.cancelTimer(s),this.candidate=null,s.moved||s.longPressFired||this.activePointers.size>0)?null:{type:"tap",clientX:t,clientY:i,pointerId:e}}pointerCancel({pointerId:e}){this.activePointers.delete(e),this.candidate?.pointerId===e&&(this.cancelTimer(),this.candidate=null)}reset(){this.cancelTimer(),this.activePointers.clear(),this.candidate=null}dispose(){this.reset()}};function dE(n,e,t,i=new ce){let s=t.getBoundingClientRect();return!(s.width>0)||!(s.height>0)?null:(i.x=(n-s.left)/s.width*2-1,i.y=-((e-s.top)/s.height)*2+1,i)}function Dm({camera:n,canvas:e,clientX:t,clientY:i,pickables:s,pointer:r=new ce,raycaster:a=new Ss,scene:o=null}){let c=dE(t,i,e,r);if(!c)return null;n.updateProjectionMatrix(),n.updateMatrixWorld(!0),o?.updateMatrixWorld(!0),a.setFromCamera(c,n);let l=a.intersectObjects(s??[],!1).find(u=>u.object.userData.sceneObjectId);return l?{intersection:l,sceneObjectId:l.object.userData.sceneObjectId}:null}function Lm(n){if(!n||typeof n!="object")return[];let e=[];n.power&&!n.cleaning&&e.push("power"),n.light&&n.controls?.setBrightness&&e.push("brightness"),n.light&&n.controls?.setColorTemperature&&e.push("colorTemperature"),n.light&&n.controls?.setColor===!0&&e.push("color"),n.contact&&e.push("contact"),n.cover&&e.push("cover"),n.climate&&e.push("climate"),n.activity&&e.push("activity"),n.safety&&e.push("safety"),n.fan&&e.push("fan"),Array.isArray(n.environment)&&n.environment.length>0&&e.push("environment"),Array.isArray(n.energy)&&n.energy.length>0&&e.push("energy");let t=n.health?.alerts?.some(i=>i.active===!0)===!0;return n.health&&(!n.cleaning||t)&&e.push("health"),n.cleaning&&e.push("cleaning"),n.lock&&e.push("lock"),e}function Om({entityId:n,binding:e,state:t}){return typeof n!="string"||!n||typeof e?.provider!="string"||!e.provider||typeof e?.deviceId!="string"||!e.deviceId?null:{entityId:n,provider:e.provider,targetId:e.deviceId,bindingCapability:e.capability??null,capabilities:Lm(t),state:t??null}}var xl=class{constructor({adapters:e={},onOpenChange:t=()=>{}}={}){this.adapters=new Map(Object.entries(e)),this.onOpenChange=t,this.active=null}open(e){if(!e||typeof e.provider!="string")return!1;let t=this.adapters.get(e.provider);return!t||typeof t.open!="function"||(this.close(),t.open(e,{onClose:()=>this.handleAdapterClose(t)})===!1)?!1:(this.active={adapter:t,context:e},this.onOpenChange(!0,e),!0)}handleAdapterClose(e){this.active?.adapter===e&&(this.active=null,this.onOpenChange(!1,null))}updateState(e,t){if(!this.active||this.active.context.targetId!==e)return!1;let i={...this.active.context,capabilities:Lm(t),state:t};return this.active.context=i,this.active.adapter.update?.(i),!0}setBusy(e,t){return!this.active||this.active.context.targetId!==e?!1:(this.active.adapter.setBusy?.(!!t),!0)}close(){if(!this.active)return;let{adapter:e}=this.active;this.active=null,e.close?.(),this.onOpenChange(!1,null)}dispose(){let e=!!this.active;this.active=null;for(let t of new Set(this.adapters.values()))t.dispose?.();this.adapters.clear(),e&&this.onOpenChange(!1,null)}};var Hm=ei(ts()),{DEVICE_COMMAND:jt}=Hm.default;function zm(n,e){return n?.values?.some(t=>t.id===e)===!0}function Ti(n,e){if(n?.availability!=="available"||!e)return!1;switch(e.type){case jt.SET_POWER:return n.controls?.setPower===!0&&typeof e.value=="boolean";case jt.SET_BRIGHTNESS:return!!n.controls?.setBrightness&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_COLOR:return n.controls?.setColor===!0&&Number.isFinite(e.value?.hue)&&e.value.hue>=0&&e.value.hue<=1&&Number.isFinite(e.value?.saturation)&&e.value.saturation>=0&&e.value.saturation<=1;case jt.SET_COLOR_TEMPERATURE:return!!n.controls?.setColorTemperature&&Number.isFinite(e.value)&&e.value>=n.controls.setColorTemperature.min&&e.value<=n.controls.setColorTemperature.max;case jt.OPEN_COVER:return n.controls?.openCover===!0;case jt.CLOSE_COVER:return n.controls?.closeCover===!0;case jt.STOP_COVER:return n.controls?.stopCover===!0;case jt.SET_COVER_POSITION:return!!n.controls?.setCoverPosition&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_TARGET_TEMPERATURE:{let t=n.controls?.setTargetTemperature;return!!t&&Number.isFinite(e.value)&&e.value>=t.min&&e.value<=t.max}case jt.SET_THERMOSTAT_MODE:return zm(n.controls?.setThermostatMode,e.value);case jt.SET_FAN_SPEED:return!!n.controls?.setFanSpeed&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_FAN_MODE:return zm(n.controls?.setFanMode,e.value);case jt.SET_TARGET_HUMIDITY:return!!n.controls?.setTargetHumidity&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.START_CLEANING:return n.controls?.startCleaning===!0;case jt.PAUSE_CLEANING:return n.controls?.pauseCleaning===!0;case jt.STOP_CLEANING:return n.controls?.stopCleaning===!0;case jt.RETURN_TO_BASE:return n.controls?.returnToBase===!0;case jt.LOCK:return n.controls?.lock===!0;case jt.UNLOCK:return n.controls?.unlock===!0;default:return!1}}var Gm=ei(ts()),{DEVICE_COMMAND:Vm}=Gm.default,Ua=class{constructor({document:e=globalThis.document,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.interacting=!1,this.disposed=!1,this.element=e.createElement("div"),this.element.className="device-details-cover-position";let s=a=>{let o=e.createElement("div");o.className="device-details-range-label";let c=e.createElement("span");c.textContent=a;let l=e.createElement("span");return l.className="device-details-range-value",o.append(c,l),this.element.append(o),l};this.current=s(i("deviceDetails.position","Position"));let r=i("deviceDetails.targetPosition","Target position");this.target=s(r),this.slider=e.createElement("input"),this.slider.className="device-details-range device-details-cover-range",this.slider.type="range",this.slider.min="0",this.slider.max="100",this.slider.setAttribute("aria-label",r),this.element.append(this.slider),this.slider.addEventListener("pointerdown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("keydown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("input",()=>this.showTarget()),this.slider.addEventListener("change",()=>{this.interacting=!1;let a={type:Vm.SET_COVER_POSITION,value:Number(this.slider.value)/100};!this.disposed&&!this.slider.disabled&&Ti(this.state,a)&&this.onCommand(a)}),this.slider.addEventListener("pointerup",()=>{this.interacting=!1}),this.slider.addEventListener("keyup",()=>{this.interacting=!1}),this.slider.addEventListener("blur",()=>{this.interacting=!1}),this.slider.addEventListener("pointercancel",()=>{this.interacting=!1,this.update(this.state,this.busy)})}showTarget(){let e=Number(this.slider.value);this.target.textContent=\`\${e}%\`,this.slider.style.setProperty("--range-progress",\`\${e}%\`),this.slider.setAttribute("aria-valuetext",\`\${e}%\`)}update(e,t=!1,i=null){this.state=e,this.busy=t;let s=e?.cover?.position,r=Number.isFinite(s)&&s>=0&&s<=1;if(this.current.textContent=r?\`\${Math.round(s*100)}%\`:"\\u2013",this.slider.disabled=t||!r||!Ti(e,{type:Vm.SET_COVER_POSITION,value:s}),this.slider.step=String(Math.max(1,Math.round((e?.controls?.setCoverPosition?.step??.01)*100))),this.slider.disabled&&(this.interacting=!1),!this.interacting){let a=Number.isFinite(i)?i:s;this.slider.value=String(r?Math.round(a*100):0),this.showTarget(),r||(this.target.textContent="\\u2013")}}dispose(){this.disposed=!0,this.interacting=!1,this.slider.disabled=!0,this.element.remove()}};var Ym=ei(ts());var Wm=Object.freeze({capture:!0,passive:!1});function vl(n){let e=n.style.touchAction,t=i=>{i.cancelable&&i.preventDefault()};return n.style.touchAction="none",n.addEventListener("touchmove",t,Wm),()=>{n.removeEventListener("touchmove",t,Wm),n.style.touchAction=e}}var{DEVICE_COMMAND:Ht}=Ym.default,yE=Object.freeze(["#ffffff","#ff9138","#ffd400","#0bc9bd","#49c7ef","#1594e8","#d735e5","#ff3d63"]),bE=700,Ar=Object.freeze({width:300,height:210,centerX:150,centerY:133,startDegrees:155,sweepDegrees:230});function ME(n){return Number.isFinite(n)?Math.round(Math.min(Math.max(n,0),1)*100):null}function jn(n,e,t){return Math.min(Math.max(n,e),t)}function Xm(n){if(!Number.isFinite(n?.hue)||!Number.isFinite(n?.saturation))return"#ffffff";let e=(n.hue%1+1)%1,t=jn(n.saturation,0,1),i=e*6,s=Math.floor(i),r=i-s,a=1-t,o=1-r*t,c=1-(1-r)*t,[l,u,h]=[[1,c,a],[o,1,a],[a,1,c],[a,o,1],[c,a,1],[1,a,o]][s%6];return\`#\${[l,u,h].map(f=>Math.round(f*255).toString(16).padStart(2,"0")).join("")}\`}function SE(n){if(typeof n!="string"||!/^#[0-9a-f]{6}$/i.test(n))return null;let e=Number.parseInt(n.slice(1,3),16)/255,t=Number.parseInt(n.slice(3,5),16)/255,i=Number.parseInt(n.slice(5,7),16)/255,s=Math.max(e,t,i),r=Math.min(e,t,i),a=s-r,o=0;return a>0&&(s===e?o=(t-i)/a%6:s===t?o=(i-e)/a+2:o=(e-t)/a+4,o=(o/6+1)%1),{hue:o,saturation:s===0?0:a/s}}function $m(n){let e=Number.isFinite(n?.hue)?(n.hue%1+1)%1:0,t=Number.isFinite(n?.saturation)?jn(n.saturation,0,1):0;return{hue:e,saturation:t}}function EE(n){let e=$m(n),t=e.hue*Math.PI*2,i=e.saturation*45;return{left:50+Math.cos(t)*i,top:50+Math.sin(t)*i}}function wE(n,e,t,i){if(![n,e,t,i].every(Number.isFinite)||t<=0||i<=0)return null;let s=t/2,r=i/2,a=n-s,o=e-r,c=Math.min(t,i)/2;return{hue:(Math.atan2(o,a)/(Math.PI*2)+1)%1,saturation:jn(Math.hypot(a,o)/c,0,1)}}function TE(n,e,t){return![n,e,t].every(Number.isFinite)||t<=e?0:jn((n-e)/(t-e)*100,0,100)}function Tr(n,e,t,i){n.style.setProperty("--range-progress",\`\${TE(e,t,i)}%\`)}function _l(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function yl(n){let e=Number.isFinite(n?.min)?n.min:4,t=Number.isFinite(n?.max)&&n.max>e?n.max:35,i=Number.isFinite(n?.step)&&n.step>0?n.step:.5;return{minimum:e,maximum:t,step:i}}function Uh(n,e){if(!Number.isFinite(n))return null;let{minimum:t,maximum:i,step:s}=yl(e),r=t+Math.round((n-t)/s)*s,a=Math.max(_l(t),_l(i),_l(s));return Number(jn(r,t,i).toFixed(a))}function AE(n,e){if(!Number.isFinite(n))return 0;let{minimum:t,maximum:i}=yl(e);return jn((n-t)/(i-t),0,1)}function Nh(n,e=100){let t=Ar,i=(t.startDegrees+jn(n,0,1)*t.sweepDegrees)*Math.PI/180;return{x:t.centerX+Math.cos(i)*e,y:t.centerY+Math.sin(i)*e}}function CE(n,e,t){if(![n,e].every(Number.isFinite))return null;let i=Ar,s=Math.atan2(e-i.centerY,n-i.centerX)*180/Math.PI;s<0&&(s+=360),s<i.startDegrees&&(s+=360);let r=s-i.startDegrees;r>i.sweepDegrees&&(r=n<i.centerX?0:i.sweepDegrees);let{minimum:a,maximum:o}=yl(t);return Uh(a+r/i.sweepDegrees*(o-a),t)}function qm(n,e){if(!Number.isFinite(n))return"\\u2013";let t=Math.max(0,_l(e));return n.toFixed(t)}var Bh=class{constructor({delay:e=bE,onCommit:t,setTimer:i=(r,a)=>globalThis.setTimeout(r,a),clearTimer:s=r=>globalThis.clearTimeout(r)}){this.delay=e,this.onCommit=t,this.setTimer=i,this.clearTimer=s,this.timer=null,this.value=null}get pending(){return this.timer!==null}cancel(){return this.timer===null?!1:(this.clearTimer(this.timer),this.timer=null,this.value=null,!0)}schedule(e){this.cancel(),this.value=e;let t=null;t=this.setTimer(()=>{if(this.timer!==t)return;let i=this.value;this.timer=null,this.value=null,this.onCommit?.(i)},this.delay),this.timer=t}dispose(){this.cancel()}};function Ne(n,e,t=null){let i=document.createElement(n);return e&&(i.className=e),t!==null&&(i.textContent=t),i}function Fh(n,e={}){let t=document.createElementNS("http://www.w3.org/2000/svg",n);for(let[i,s]of Object.entries(e))t.setAttribute(i,String(s));return t}function RE(n){n.stopPropagation()}var Ba=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.context=null,this.busy=!1,this.onClose=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureCommit=new Bh({onCommit:r=>{!r||this.layer.hidden||this.context?.entityId!==r.entityId||(this.setTargetTemperaturePendingVisual(!1),this.send({type:Ht.SET_TARGET_TEMPERATURE,value:r.value}))}}),this.layer=Ne("div","device-details-layer"),this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.panel=Ne("section","device-details-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","true"),this.panel.setAttribute("aria-labelledby","device-details-title"),this.panel.setAttribute("tabindex","-1");let s=Ne("header","device-details-header");this.title=Ne("h2","device-details-title"),this.title.id="device-details-title",this.closeButton=Ne("button","device-details-close","\\xD7"),this.closeButton.type="button",this.closeButton.addEventListener("click",()=>this.close()),s.append(this.title,this.closeButton),this.body=Ne("div","device-details-body"),this.panel.append(s,this.body),this.layer.appendChild(this.panel),e.appendChild(this.layer),this.onLayerClick=r=>{r.target===this.layer&&this.close()},this.onKeyDown=r=>{r.key==="Escape"&&!this.layer.hidden&&this.close()},this.layer.addEventListener("click",this.onLayerClick);for(let r of["pointerdown","pointermove","pointerup","pointercancel"])this.layer.addEventListener(r,RE);document.addEventListener("keydown",this.onKeyDown)}text(e,t){return this.translate(\`deviceDetails.\${e}\`,t)}open(e,{onClose:t=null}={}){globalThis.getSelection?.()?.removeAllRanges(),this.resetTargetTemperatureInteraction(),this.coverPositionDraft=null,this.context=e,this.busy=!1,this.onClose=t,this.render(),this.layer.hidden=!1,this.layer.setAttribute("aria-hidden","false"),this.panel.focus({preventScroll:!0})}update(e){if(this.layer.hidden||e.targetId!==this.context?.targetId)return;let t=this.targetTemperatureDraft,i=e.state?.climate?.targetTemperature;t?.entityId===e.entityId&&Number.isFinite(i)&&Math.abs(i-t.value)<1e-6&&(this.targetTemperatureCommit.cancel(),this.targetTemperatureDraft=null),this.coverPositionDraft?.entityId===e.entityId&&e.state?.cover?.position===this.coverPositionDraft.value&&(this.coverPositionDraft=null),this.context=e,!(this.coverPositionControl?.interacting&&(this.coverPositionControl.update(e.state,this.busy),this.coverPositionControl.interacting))&&this.render()}setBusy(e){this.layer.hidden||this.busy===e||(this.busy=e,this.render())}close({notify:e=!0}={}){if(this.layer.hidden)return;let t=this.onClose;this.resetTargetTemperatureInteraction(),this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.coverPositionDraft=null,this.coverPositionHadFocus=!1,this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.context=null,this.busy=!1,this.onClose=null,e&&t?.()}resetTargetTemperatureInteraction(){this.targetTemperatureCommit.cancel(),this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null}setTargetTemperaturePendingVisual(e){this.targetTemperaturePendingIndicator&&(this.targetTemperaturePendingIndicator.hidden=!e),this.targetTemperatureDial?.classList.toggle("is-pending",e)}cancelTargetTemperatureCommit(){this.targetTemperatureCommit.cancel(),this.setTargetTemperaturePendingVisual(!1)}scheduleTargetTemperatureCommit(e){if(!this.context||!Number.isFinite(e))return;let t=this.context.state?.climate?.targetTemperature;if(Number.isFinite(t)&&Math.abs(t-e)<1e-6){this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null;return}let i={entityId:this.context.entityId,value:e};this.targetTemperatureDraft=i,this.targetTemperatureCommit.schedule(i),this.setTargetTemperaturePendingVisual(!0)}createSection(e,t=""){let i=Ne("section",\`device-details-section\${t?\` \${t}\`:""}\`);return i.appendChild(Ne("h3","device-details-section-title",e)),this.body.appendChild(i),i}appendValue(e,t,i){let s=Ne("div","device-details-value-row");s.append(Ne("span","device-details-value-label",t),Ne("span","device-details-value",i)),e.appendChild(s)}capabilityLabel(e,t=null){if(typeof t=="string"&&t.trim())return t.trim();let s={alarm_motion:"Motion",alarm_presence:"Presence",alarm_occupancy:"Occupancy",alarm_smoke:"Smoke",alarm_fire:"Fire",alarm_co:"Carbon monoxide",alarm_gas:"Gas",alarm_water:"Water",alarm_moisture:"Moisture",alarm_heat:"Heat",measure_temperature:"Temperature",measure_humidity:"Humidity",measure_luminance:"Illuminance",measure_aqi:"Air quality index",measure_co2:"CO\\u2082",measure_pm25:"PM2.5",measure_tvoc:"TVOC",measure_pressure:"Pressure",measure_noise:"Noise",measure_power:"Power",meter_power:"Energy",measure_current:"Current",measure_voltage:"Voltage",meter_gas:"Gas meter",meter_water:"Water meter",alarm_battery:"Battery warning",alarm_connectivity:"Connectivity warning"}[e]??e;return this.text(\`capability.\${e}\`,s)}appendEnumControl(e,t,i,s,r){if(!s||!Array.isArray(s.values)||s.values.length===0){typeof i=="string"&&i&&this.appendValue(e,t,i);return}let a=Ne("div","device-details-choice-row");a.appendChild(Ne("span","device-details-value-label",t));let o=Ne("div","device-details-choices");for(let c of s.values){let l=Ne("button","device-details-choice",c.label??c.id);l.type="button",l.disabled=this.busy||this.context?.state?.availability!=="available",l.classList.toggle("is-selected",c.id===i),l.setAttribute("aria-pressed",String(c.id===i)),l.addEventListener("click",()=>this.send({type:r,value:c.id})),o.appendChild(l)}a.appendChild(o),e.appendChild(a)}appendNormalizedRange(e,{label:t,value:i,control:s,commandType:r}){let a=Number.isFinite(i)?Math.round(jn(i,0,1)*100):null,o=Ne("span","device-details-range-value",a===null?"\\u2013":\`\${a}%\`),c=Ne("div","device-details-range-label");c.append(Ne("span",null,t),o);let l=Ne("input","device-details-range");l.type="range",l.min="0",l.max="100",l.step=String(Math.max(1,Math.round((s?.step??.01)*100))),l.value=String(a??0),l.disabled=this.busy||this.context?.state?.availability!=="available"||a===null||!s,l.setAttribute("aria-label",t),Tr(l,a??0,0,100),l.addEventListener("input",()=>{o.textContent=\`\${l.value}%\`,Tr(l,Number(l.value),0,100)}),l.addEventListener("change",()=>this.send({type:r,value:Number(l.value)/100})),e.append(c,l)}createAction(e,t,i,s=!0){let r=Ne("button","device-details-action");return r.type="button",r.disabled=this.busy||!s||this.context?.state?.availability!=="available",r.setAttribute("aria-label",e),r.title=e,r.append(Ne("span","device-details-action-symbol",t),Ne("span","device-details-action-label",e)),r.addEventListener("click",()=>this.send(i)),r}send(e){!this.context||this.busy||this.onCommand(this.context.entityId,e)}renderPower(e){let t=e.power?.isOn===!0,i=e.availability==="available"&&typeof e.power?.isOn=="boolean",s=this.createSection(this.text("power","Power")),r=Ne("button",\`device-details-toggle\${t?" is-on":""}\`);r.type="button",r.disabled=this.busy||!i||e.controls?.setPower!==!0,r.setAttribute("aria-pressed",String(t));let a=t?this.text("on","On"):this.text("off","Off");r.setAttribute("aria-label",\`\${this.text("power","Power")}: \${a}\`),r.append(Ne("span","device-details-toggle-label",a),Ne("span","device-details-toggle-indicator")),r.addEventListener("click",()=>this.send({type:Ht.SET_POWER,value:!t})),s.appendChild(r)}renderBrightness(e){let t=this.createSection(this.text("brightness","Brightness")),i=ME(e.light?.brightness),s=Ne("span","device-details-range-value",i===null?"\\u2013":\`\${i}%\`),r=Ne("div","device-details-range-label");r.append(Ne("span",null,this.text("brightness","Brightness")),s);let a=Ne("input","device-details-range device-details-brightness-range");a.type="range",a.min="0",a.max="100",a.step=String(Math.max(1,Math.round((e.controls.setBrightness.step??.01)*100))),a.value=String(i??0),a.disabled=this.busy||e.availability!=="available"||i===null,a.setAttribute("aria-label",this.text("brightness","Brightness")),Tr(a,i??0,0,100),a.addEventListener("input",()=>{s.textContent=\`\${a.value}%\`,Tr(a,Number(a.value),0,100)}),a.addEventListener("change",()=>this.send({type:Ht.SET_BRIGHTNESS,value:Number(a.value)/100})),t.append(r,a)}renderColorTemperature(e){let t=e.controls?.setColorTemperature,i=Number.isFinite(t?.min)?t.min:2e3,s=Number.isFinite(t?.max)?t.max:6500,r=Number.isFinite(t?.step)&&t.step>0?t.step:50,a=Number.isFinite(e.light?.colorTemperatureKelvin)?jn(e.light.colorTemperatureKelvin,i,s):null,o=this.createSection(this.text("colorTemperature","Color temperature")),c=Ne("span","device-details-range-value",a===null?"\\u2013":\`\${Math.round(a)} K\`),l=Ne("div","device-details-range-label");l.append(Ne("span",null,this.text("colorTemperature","Color temperature")),c);let u=Ne("input","device-details-range device-details-temperature-range");u.type="range",u.min=String(i),u.max=String(s),u.step=String(r),u.value=String(a??(i+s)/2),u.disabled=this.busy||e.availability!=="available"||!t,u.setAttribute("aria-label",this.text("colorTemperature","Color temperature")),Tr(u,a??(i+s)/2,i,s),u.addEventListener("input",()=>{c.textContent=\`\${Math.round(Number(u.value))} K\`,Tr(u,Number(u.value),i,s)}),u.addEventListener("change",()=>this.send({type:Ht.SET_COLOR_TEMPERATURE,value:Number(u.value)})),o.append(l,u)}renderColor(e){let t=this.createSection(this.text("color","Color")),i=!this.busy&&e.availability==="available",s=$m(e.light?.color),r=Ne("button","device-details-color-wheel");r.type="button",r.disabled=!i,r.setAttribute("aria-label",this.text("selectColor","Select color"));let a=Ne("span","device-details-color-wheel-marker");a.setAttribute("aria-hidden","true"),r.appendChild(a);let o=Ne("div","device-details-color-presets-label",this.text("presets","Presets")),c=Ne("div","device-details-color-presets"),l=yE.map(d=>{let p=SE(d),x=Ne("button","device-details-color-preset");return x.type="button",x.disabled=!i,x.style.setProperty("--preset-color",d),x.setAttribute("aria-label",\`\${this.text("selectColor","Select color")}: \${d}\`),x.addEventListener("click",()=>{s=p,u(),this.send({type:Ht.SET_COLOR,value:p})}),c.appendChild(x),{button:x,color:p}}),u=()=>{let d=EE(s);a.style.left=\`\${d.left}%\`,a.style.top=\`\${d.top}%\`,a.style.background=Xm(s),r.setAttribute("aria-valuetext",Xm(s));for(let p of l){let x=Math.abs(p.color.saturation-s.saturation),m=Math.min(Math.abs(p.color.hue-s.hue),1-Math.abs(p.color.hue-s.hue)),g=x<.025&&(s.saturation<.025||m<.0125);p.button.classList.toggle("is-selected",g),p.button.setAttribute("aria-pressed",String(g))}},h=d=>{let p=r.getBoundingClientRect(),x=wE(d.clientX-p.left,d.clientY-p.top,p.width,p.height);return x?(s=x,u(),!0):!1},f=null;r.addEventListener("pointerdown",d=>{i&&(f=d.pointerId,r.setPointerCapture?.(d.pointerId),h(d),d.preventDefault())}),r.addEventListener("pointermove",d=>{d.pointerId===f&&(h(d),d.preventDefault())}),r.addEventListener("pointerup",d=>{if(d.pointerId!==f)return;let p=h(d);f=null,r.releasePointerCapture?.(d.pointerId),p&&this.send({type:Ht.SET_COLOR,value:s}),d.preventDefault()}),r.addEventListener("pointercancel",d=>{d.pointerId===f&&(f=null)}),r.addEventListener("keydown",d=>{let p=.013888888888888888,x=.05;if(d.key==="ArrowLeft")s.hue=(s.hue-p+1)%1;else if(d.key==="ArrowRight")s.hue=(s.hue+p)%1;else if(d.key==="ArrowUp")s.saturation=jn(s.saturation+x,0,1);else if(d.key==="ArrowDown")s.saturation=jn(s.saturation-x,0,1);else return;u(),this.send({type:Ht.SET_COLOR,value:s}),d.preventDefault()}),u(),t.append(r,o,c)}renderContact(e){let t=this.createSection(this.text("contact","Contact")),i=e.contact?.state??"unknown",s={open:this.text("open","Open"),closed:this.text("closed","Closed"),unknown:this.text("unknown","Unknown")};this.appendValue(t,this.text("status","Status"),s[i]??s.unknown)}renderCover(e){let t=this.createSection(this.text("cover","Cover"));this.coverPositionControl=new Ua({onCommand:o=>{this.coverPositionDraft={entityId:this.context.entityId,value:o.value},this.send(o)},translate:this.translate});let i=this.coverPositionDraft?.entityId===this.context.entityId?this.coverPositionDraft.value:null;this.coverPositionControl.update(e,this.busy,i),t.appendChild(this.coverPositionControl.element);let s=e.cover?.movement??"unknown",r=this.text(\`coverState.\${s}\`,s);s!=="unknown"&&this.appendValue(t,this.text("status","Status"),r);let a=Ne("div","device-details-actions");a.append(this.createAction(this.text("openCover","Open"),"\\u2191",{type:Ht.OPEN_COVER},e.controls?.openCover===!0),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Ht.STOP_COVER},e.controls?.stopCover===!0),this.createAction(this.text("closeCover","Close"),"\\u2193",{type:Ht.CLOSE_COVER},e.controls?.closeCover===!0)),t.appendChild(a)}renderThermostatDial(e,t,i,s,r){let{minimum:a,maximum:o,step:c}=yl(s),l=!!s&&!this.busy&&t.availability==="available",u=this.context?.entityId,h=this.targetTemperatureDraft?.entityId===u?this.targetTemperatureDraft.value:null,f=Uh(Number.isFinite(h)?h:i,s),d=Ne("div","device-details-thermostat-dial");d.setAttribute("role","slider"),d.setAttribute("aria-label",this.text("targetTemperature","Target temperature")),d.setAttribute("aria-valuemin",String(a)),d.setAttribute("aria-valuemax",String(o)),d.setAttribute("aria-disabled",String(!l)),d.tabIndex=l?0:-1,this.targetTemperatureDial=d,this.disposeTargetTemperatureTouchGuard=vl(d);let p=Fh("svg",{viewBox:\`0 0 \${Ar.width} \${Ar.height}\`,"aria-hidden":"true"});p.classList.add("device-details-thermostat-scale");let x=[],m=41;for(let ee=0;ee<m;ee+=1){let we=ee/(m-1),Ke=ee%5===0,We=Nh(we,119),K=Nh(we,Ke?101:108),ue=Fh("line",{x1:K.x,y1:K.y,x2:We.x,y2:We.y});ue.classList.add("device-details-thermostat-tick"),Ke&&ue.classList.add("is-major"),p.appendChild(ue),x.push({element:ue,fraction:we})}let g=Fh("circle",{r:8});g.classList.add("device-details-thermostat-thumb"),p.appendChild(g);let w=Ne("div","device-details-thermostat-readout"),E=Ne("span","device-details-thermostat-target-label",this.text("targetTemperature","Target temperature")),y=Ne("span","device-details-thermostat-target-value"),T=Ne("span","device-details-thermostat-target-number"),b=Ne("span","device-details-thermostat-target-unit",r);y.append(T,b);let C=Number.isFinite(t.climate?.currentTemperature)?\`\${t.climate.currentTemperature.toFixed(1)} \${r}\`:this.text("unknown","Unknown"),v=Ne("span","device-details-thermostat-current",\`\${this.text("currentTemperature","Current temperature")}: \${C}\`);w.append(E,y,v),d.append(p,w);let S=Ne("div","device-details-thermostat-feedback"),P=Ne("span","device-details-thermostat-hint",l?this.text("temperatureDialHint","Drag along the arc to adjust"):""),I=Ne("span","device-details-thermostat-pending",this.text("temperaturePending","Will be sent shortly\\u2026"));I.setAttribute("role","status"),I.setAttribute("aria-live","polite");let O=this.targetTemperatureCommit.pending&&this.targetTemperatureDraft?.entityId===u;I.hidden=!O,S.append(P,I),this.targetTemperaturePendingIndicator=I,d.classList.toggle("is-pending",O);let U=Ne("div","device-details-thermostat-controls"),q=Ne("button","device-details-thermostat-step");q.type="button",q.setAttribute("aria-label",this.text("decreaseTemperature","Decrease target temperature")),q.append(Ne("span","device-details-thermostat-step-symbol","\\u2212"),Ne("span","device-details-thermostat-step-label",this.text("decreaseTemperature","Decrease target temperature")));let R=Ne("button","device-details-thermostat-step");R.type="button",R.setAttribute("aria-label",this.text("increaseTemperature","Increase target temperature")),R.append(Ne("span","device-details-thermostat-step-symbol","+"),Ne("span","device-details-thermostat-step-label",this.text("increaseTemperature","Increase target temperature"))),U.append(q,R);let H=(ee,we=!0)=>{let Ke=Uh(ee,s);if(!Number.isFinite(Ke))return!1;f=Ke,we&&(this.targetTemperatureDraft={entityId:u,value:f});let We=AE(f,s);for(let ne of x)ne.element.classList.toggle("is-active",ne.fraction<=We+1e-6);let K=Nh(We,103);g.setAttribute("cx",String(K.x)),g.setAttribute("cy",String(K.y)),T.textContent=qm(f,c);let ue=\`\${qm(f,c)} \${r}\`;return d.setAttribute("aria-valuenow",String(f)),d.setAttribute("aria-valuetext",ue),q.disabled=!l||f<=a,R.disabled=!l||f>=o,!0},z=ee=>{let we=d.getBoundingClientRect();return!(we.width>0)||!(we.height>0)?!1:H(CE((ee.clientX-we.left)*Ar.width/we.width,(ee.clientY-we.top)*Ar.height/we.height,s))},k=null;d.addEventListener("pointerdown",ee=>{l&&(this.cancelTargetTemperatureCommit(),k=ee.pointerId,d.classList.add("is-adjusting"),d.setPointerCapture?.(ee.pointerId),z(ee),ee.preventDefault())}),d.addEventListener("pointermove",ee=>{ee.pointerId===k&&(z(ee),ee.preventDefault())}),d.addEventListener("pointerup",ee=>{ee.pointerId===k&&(z(ee),k=null,d.classList.remove("is-adjusting"),d.releasePointerCapture?.(ee.pointerId),this.scheduleTargetTemperatureCommit(f),ee.preventDefault())}),d.addEventListener("pointercancel",ee=>{ee.pointerId===k&&(k=null,d.classList.remove("is-adjusting"),this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null,H(i,!1))});let $=new Set(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"]),se=!1;d.addEventListener("keydown",ee=>{if(!l||!$.has(ee.key))return;this.cancelTargetTemperatureCommit();let we=f;(ee.key==="ArrowLeft"||ee.key==="ArrowDown")&&(we-=c),(ee.key==="ArrowRight"||ee.key==="ArrowUp")&&(we+=c),ee.key==="Home"&&(we=a),ee.key==="End"&&(we=o),se=H(we)||se,ee.preventDefault()}),d.addEventListener("keyup",ee=>{!$.has(ee.key)||!se||(se=!1,this.scheduleTargetTemperatureCommit(f),ee.preventDefault())});let ae=ee=>{this.cancelTargetTemperatureCommit(),H(f+ee*c)&&this.scheduleTargetTemperatureCommit(f)};q.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),R.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),q.addEventListener("click",()=>ae(-1)),R.addEventListener("click",()=>ae(1)),H(f,!1),e.append(d,U,S)}renderClimate(e){let t=this.createSection(this.text("climate","Climate"),"device-details-climate-section"),i=e.climate?.unit??"\\xB0C",s=e.climate?.targetTemperature,r=e.controls?.setTargetTemperature;Number.isFinite(s)?this.renderThermostatDial(t,e,s,r,i):Number.isFinite(e.climate?.currentTemperature)&&this.appendValue(t,this.text("currentTemperature","Current temperature"),\`\${e.climate.currentTemperature.toFixed(1)} \${i}\`),Number.isFinite(e.climate?.humidity)&&this.appendValue(t,this.text("humidity","Humidity"),\`\${Math.round(e.climate.humidity)}%\`),(typeof e.climate?.mode=="string"||e.controls?.setThermostatMode)&&this.appendEnumControl(t,this.text("mode","Mode"),e.climate.mode,e.controls?.setThermostatMode,Ht.SET_THERMOSTAT_MODE)}renderActivity(e){let t=this.createSection(this.text("activity","Activity")),i={alarm_motion:[this.text("detected","Detected"),this.text("clear","Clear")],alarm_presence:[this.text("present","Present"),this.text("away","Away")],alarm_occupancy:[this.text("occupied","Occupied"),this.text("unoccupied","Unoccupied")]};for(let s of e.activity??[]){let r=s.baseId??s.id,[a,o]=i[r]??[this.text("active","Active"),this.text("normal","Normal")];this.appendValue(t,this.capabilityLabel(r,s.label),s.active===null?this.text("unknown","Unknown"):s.active?a:o)}}renderSafety(e){let t=(e.safety??[]).some(s=>s.active===!0),i=this.createSection(this.text("safety","Safety"),t?"is-alert":"");for(let s of e.safety??[])this.appendValue(i,this.capabilityLabel(s.baseId??s.id,s.label),s.active===null?this.text("unknown","Unknown"):s.active?this.text("alarm","Alarm"):this.text("normal","Normal"))}renderFan(e){let t=this.createSection(this.text("fan","Fan"));e.fan&&(Number.isFinite(e.fan.speed)||e.controls?.setFanSpeed)&&this.appendNormalizedRange(t,{label:this.text("fanSpeed","Fan speed"),value:e.fan.speed,control:e.controls?.setFanSpeed,commandType:Ht.SET_FAN_SPEED}),(typeof e.fan?.mode=="string"||e.controls?.setFanMode)&&this.appendEnumControl(t,this.text("fanMode","Fan mode"),e.fan.mode,e.controls?.setFanMode,Ht.SET_FAN_MODE),e.fan&&(Number.isFinite(e.fan.targetHumidity)||e.controls?.setTargetHumidity)&&this.appendNormalizedRange(t,{label:this.text("targetHumidity","Target humidity"),value:e.fan.targetHumidity,control:e.controls?.setTargetHumidity,commandType:Ht.SET_TARGET_HUMIDITY})}renderMeasurements(e,t){let i=t==="environment",s=(e[t]??[]).filter(a=>!i||!e.climate||!["measure_temperature","measure_humidity"].includes(a.baseId??a.id));if(s.length===0)return;let r=this.createSection(this.text(i?"environment":"energy",i?"Environment":"Energy"));for(let a of s){let o=Number.isFinite(a.value)?\`\${Number(a.value.toFixed(2))}\${a.unit?\` \${a.unit}\`:""}\`:"\\u2013";this.appendValue(r,this.capabilityLabel(a.baseId??a.id,a.label),o)}}renderHealth(e){let t=(e.health?.alerts??[]).filter(r=>r.active===!0),i=Number.isFinite(e.health?.batteryPercent);if(!i&&t.length===0)return;let s=this.createSection(this.text("deviceHealth","Device health"),t.length>0?"is-warning":"");i&&this.appendValue(s,this.text("battery","Battery"),\`\${Math.round(e.health.batteryPercent)}%\`);for(let r of t)this.appendValue(s,this.capabilityLabel(r.id,r.label),this.text("attentionRequired","Attention required"))}renderCleaning(e){let t=this.createSection(this.text("cleaning","Cleaning")),i=e.cleaning?.state??"unknown";this.appendValue(t,this.text("status","Status"),this.text(\`cleaningState.\${i}\`,i)),Number.isFinite(e.cleaning?.batteryPercent)&&this.appendValue(t,this.text("battery","Battery"),\`\${Math.round(e.cleaning.batteryPercent)}%\`);let s=Ne("div","device-details-actions");s.append(this.createAction(this.text("start","Start"),"\\u25B6",{type:Ht.START_CLEANING},e.controls?.startCleaning===!0&&i!=="cleaning"),this.createAction(this.text("pause","Pause"),"\\u2016",{type:Ht.PAUSE_CLEANING},e.controls?.pauseCleaning===!0&&i==="cleaning"),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Ht.STOP_CLEANING},e.controls?.stopCleaning===!0&&!["idle","docked"].includes(i)),this.createAction(this.text("returnToBase","Return to base"),"\\u2302",{type:Ht.RETURN_TO_BASE},e.controls?.returnToBase===!0&&!["docked","returning"].includes(i))),t.appendChild(s)}renderLock(e){let t=this.createSection(this.text("lock","Lock")),i=typeof e.lock?.isLocked=="boolean"?e.lock.isLocked:null,s=i===null?this.text("unknown","Unknown"):i?this.text("locked","Locked"):this.text("unlocked","Unlocked");this.appendValue(t,this.text("status","Status"),s);let r=Ne("div","device-details-actions");r.append(this.createAction(this.text("unlock","Unlock"),"\\u{1F513}",{type:Ht.UNLOCK},e.controls?.unlock===!0&&i!==!1),this.createAction(this.text("lockAction","Lock"),"\\u{1F512}",{type:Ht.LOCK},e.controls?.lock===!0&&i!==!0)),t.appendChild(r)}render(){let e=this.context?.state??{},t=typeof e.name=="string"&&e.name.trim()?e.name.trim():this.text("device","Device");this.title.textContent=t;let i=this.text("close","Close");this.closeButton.setAttribute("aria-label",i),this.closeButton.title=i,this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.coverPositionHadFocus||=this.coverPositionControl?.slider===document.activeElement,this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.body.replaceChildren(),this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,e.availability!=="available"&&this.body.appendChild(Ne("div","device-details-unavailable",this.text("unavailable","Unavailable")));let s=new Set(this.context?.capabilities??[]);s.has("safety")&&this.renderSafety(e),s.has("activity")&&this.renderActivity(e),s.has("power")&&this.renderPower(e),s.has("brightness")&&this.renderBrightness(e),s.has("colorTemperature")&&this.renderColorTemperature(e),s.has("color")&&this.renderColor(e),s.has("contact")&&this.renderContact(e),s.has("cover")&&this.renderCover(e),s.has("climate")&&this.renderClimate(e),s.has("fan")&&this.renderFan(e),s.has("environment")&&this.renderMeasurements(e,"environment"),s.has("energy")&&this.renderMeasurements(e,"energy"),s.has("health")&&this.renderHealth(e),s.has("cleaning")&&this.renderCleaning(e),s.has("lock")&&this.renderLock(e),this.coverPositionHadFocus&&!this.busy&&(this.coverPositionControl?.slider.disabled||this.coverPositionControl?.slider.focus({preventScroll:!0}),this.coverPositionHadFocus=!1),s.size===0&&this.body.appendChild(Ne("p","device-details-empty",this.text("noInformation","No supported device information")))}dispose(){this.disposed||(this.disposed=!0,this.close({notify:!1}),this.targetTemperatureCommit.dispose(),document.removeEventListener("keydown",this.onKeyDown),this.layer.remove())}};var ka=class{constructor({overlay:e}){this.overlay=e}open(e,t){return this.overlay.open(e,t),!0}update(e){this.overlay.update(e)}setBusy(e){this.overlay.setBusy(e)}close(){this.overlay.close({notify:!1})}dispose(){this.overlay.dispose()}};var Zm=ei(ts()),{DEVICE_COMMAND:GC,hasCleaningState:WC,hasClimateState:XC,hasCoverState:qC,hasPowerState:YC,isUsableCleaningState:$C,isUsableClimateState:jC,isUsableCoverState:ZC,isUsablePowerState:KC}=Zm.default;function jm(n,e,t){return e<=t*2?e/2:Math.min(Math.max(n,t),e-t)}function IE({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:a=4}){let o=Math.max(s/2+a,0),c=Math.max(r/2+a,0);return{left:jm(n,Math.max(t,0),o),top:jm(e,Math.max(i,0),c)}}function PE(n,e,t){return{left:n.left-e/2,right:n.left+e/2,top:n.top-t/2,bottom:n.top+t/2}}function DE(n,e,t){return e.reduce((i,s)=>{let r=Math.max(0,Math.min(n.right,s.right+t)-Math.max(n.left,s.left-t)),a=Math.max(0,Math.min(n.bottom,s.bottom+t)-Math.max(n.top,s.top-t));return i+r*a},0)}function LE(n,e,t){let i=Math.max(52,n*.58+t),s=Math.max(52,e+t),r=[{x:0,y:0}];for(let a=1;a<=3;a+=1){let o=i*a,c=s*a;r.push({x:0,y:-c},{x:0,y:c},{x:-o,y:0},{x:o,y:0},{x:-o,y:-c},{x:o,y:-c},{x:-o,y:c},{x:o,y:c})}return r}function Km({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:a=4,collisionGap:o=8,obstacles:c=[]}){let l=null,u=new Set;for(let h of LE(s,r,o)){let f=IE({left:n+h.x,top:e+h.y,width:t,height:i,controlWidth:s,controlHeight:r,edgePadding:a}),d=\`\${f.left.toFixed(3)}:\${f.top.toFixed(3)}\`;if(u.has(d))continue;u.add(d);let p=PE(f,s,r),x=DE(p,c,o),m=Math.hypot(f.left-n,f.top-e),g={position:f,rectangle:p,score:x,displacement:m};if(x===0)return g;(!l||x<l.score||x===l.score&&m<l.displacement)&&(l=g)}return l}var OE=Object.freeze({power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v9"/><path d="M6.6 5.4a8 8 0 1 0 10.8 0"/></svg>',cover:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M9 19l3-2 3 2"/></svg>',climate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M13 7v9"/></svg>',cleaning:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M6 17.5h12"/></svg>',contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="13" height="18" rx="1"/><circle cx="14.5" cy="12" r=".8"/></svg>',lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>',activity:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></svg>',safety:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 19h17L12 3Z"/><path d="M12 9v4.5M12 17h.01"/></svg>',fan:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1.5-4.8 1-7 3.5-6 2.2.9 1.6 4.8-1.9 7M13.8 13c4.9 1.1 5.6 4.4 3.5 6-1.9 1.5-5-1-5.2-5M10.3 13c-3.4 3.7-6.5 2.6-6.8 0-.3-2.4 3.4-3.8 6.6-1.3"/></svg>',environment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5C5 11 9 6.5 18.5 5c.5 8.5-3.6 14-9 14A4.5 4.5 0 0 1 5 15.5Z"/><path d="M7 18c2-4 5-6 9-9"/></svg>',energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/></svg>',health:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l2-5 4 10 2-5h4"/><path d="M5 5h14v14H5z"/></svg>',details:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>'}),za=Object.freeze({minimumVisible:6,maximumVisible:20,horizontalPitch:48});function NE(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();if(!e)return null;let t=e.split(".")[0];return e.startsWith("windowcoverings_")||t==="garagedoor_closed"?"cover":["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(t)?"safety":["alarm_motion","alarm_presence","alarm_occupancy"].includes(t)?"activity":e.startsWith("vacuum_")||e.startsWith("vacuumcleaner_")?"cleaning":e==="target_temperature"||e.startsWith("thermostat_")?"climate":["fan_speed","fan_mode","target_humidity"].includes(t)?"fan":t==="onoff"?"power":["locked","locked_status","lock","unlock","deadbolt"].includes(t)?"lock":t==="alarm_contact"?"contact":t==="measure_temperature"?"climate":["measure_humidity","measure_luminance","measure_aqi","measure_co2","measure_pm25","measure_tvoc","measure_pressure","measure_noise"].includes(t)?"environment":["measure_power","meter_power","measure_current","measure_voltage","meter_gas","meter_water"].includes(t)?"energy":t==="measure_battery"||t.startsWith("alarm_")?"health":null}function FE(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();return["windowcoverings","blinds","curtain","shutter"].includes(e)?"cover":["vacuumcleaner","vacuum"].includes(e)?"cleaning":["thermostat","heater"].includes(e)?"climate":["fan","airconditioning","airpurifier","humidifier","dehumidifier"].includes(e)?"fan":e==="lock"?"lock":["garagedoor","gate"].includes(e)?"cover":["meter","smartmeter"].includes(e)?"energy":["light","socket"].includes(e)?"power":null}function UE(n,e=null,t=null){if(n?.safety)return"safety";let i=FE(n?.deviceClass);if(i==="lock")return"lock";let s=NE(t);return s||i||(n?.cleaning?"cleaning":n?.cover?"cover":n?.lock?"lock":n?.activity?"activity":n?.fan?"fan":e==="light"&&n?.power?"power":n?.climate?"climate":n?.power?"power":n?.energy?"energy":n?.environment?"environment":n?.health?"health":n?.contact?"contact":"details")}function BE(n,e){let t=typeof n=="string"?n.trim().toLowerCase():"",i=t.split(".")[0];return["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(i)?900:["alarm_motion","alarm_presence","alarm_occupancy"].includes(i)?800:t.startsWith("vacuum_")||t.startsWith("vacuumcleaner_")?600:t.startsWith("windowcoverings_")?500:t==="target_temperature"||t.startsWith("thermostat_")?400:["locked","locked_status","lock","unlock","deadbolt"].includes(t)?375:t==="onoff"?350:t==="alarm_contact"?300:t==="measure_temperature"?100:{safety:90,activity:80,cleaning:60,cover:50,climate:40,lock:38,power:35,contact:30,fan:28,energy:20,environment:18,health:16,details:0}[e]??0}function kE(n){let e=Number.isFinite(n)&&n>0?n:za.minimumVisible*za.horizontalPitch;return Math.min(za.maximumVisible,Math.max(za.minimumVisible,Math.floor(e/za.horizontalPitch)))}function zE(n){let e=n?.state,t=Number.isFinite(n?.priority)?n.priority:0;return(e?.safety??[]).some(s=>s.active===!0)||e?.health?.alerts?.some(s=>s.active===!0)===!0?t+3e3:n?.type==="power"&&e?.power?.isOn===!0?t+1400:(e?.activity??[]).some(s=>s.active===!0)?t+1200:e?.cleaning&&!["docked","idle"].includes(e.cleaning.state)?t+1e3:e?.cover?.movement&&e.cover.movement!=="stopped"?t+800:e?.climate?.heatingActive===!0?t+700:n?.type==="fan"&&(e?.power?.isOn===!0||Number.isFinite(e?.fan?.speed)&&e.fan.speed>0)?t+600:e?.availability==="unavailable"?t-100:t}function Jm(n,e){return(n.left-e.left)**2+(n.top-e.top)**2}function HE(n,e,t,i,s){let r=[...n],a=[];for(;a.length<e&&r.length>0;){let o=0,c=-1/0;for(let l=0;l<r.length;l+=1){let u=r[l],h=[...t,...a],f=h.length>0?Math.min(...h.map(p=>Jm(u,p))):-Jm(u,{left:i/2,top:s/2}),d=r[o];(f>c||f===c&&u.sceneObjectId.localeCompare(d.sceneObjectId)<0)&&(o=l,c=f)}a.push(r.splice(o,1)[0])}return a}function VE(n,e,t){let i=kE(e);if(n.length<=i)return n;let s=new Map;for(let a of n){let o=zE(a.record);s.has(o)||s.set(o,[]),s.get(o).push(a)}let r=[];for(let a of[...s.keys()].sort((o,c)=>c-o)){let o=s.get(a),c=i-r.length;if(c<=0)break;o.length<=c?r.push(...o):r.push(...HE(o,c,r,e,t))}return r}function GE({entities:n,bindings:e,statesByDeviceId:t}){let i=new Map;for(let s of n.values()){let r=e.get(s.id);if(!r?.deviceId)continue;let a=t.get(r.deviceId),o=UE(a,s.kind,r.capability),c={binding:r,entity:s,priority:BE(r.capability,o),state:a,type:o},l=i.get(r.deviceId);(!l||c.priority>l.priority)&&i.set(r.deviceId,c)}return[...i.values()]}function Cr(n){n.preventDefault(),n.stopPropagation()}var Ha=class{constructor({host:e,onOpenDetails:t,onTogglePower:i,translate:s=(r,a)=>a}){this.onOpenDetails=t,this.onTogglePower=i,this.translate=s,this.records=new Map,this.suppressed=!1,this.bounds=new dn,this.anchor=new D,this.projected=new D,this.size=new D,this.layer=document.createElement("div"),this.layer.className="device-affordance-layer",this.layer.hidden=!0,this.layer.setAttribute("aria-label",this.translate("deviceDetails.label","Device details")),e.appendChild(this.layer)}createRecord(e,t,i){let s=document.createElement("button");s.type="button",s.className="device-affordance-button",s.dataset.markerType=i,s.dataset.sceneObjectId=e,s.innerHTML=\`\${OE[i]}<span class="device-affordance-device-icon" aria-hidden="true"></span>\`;let r={deviceId:null,element:s,entity:t,pressGesture:null,priority:0,state:null,suppressClickUntil:0,type:i};r.pressGesture=new Er({onLongPress:()=>{if(this.records.get(e)!==r)return!1;let o=this.onOpenDetails(e)===!0;return o&&(r.suppressClickUntil=Date.now()+1e3,globalThis.getSelection?.()?.removeAllRanges()),o}});let a=()=>{this.records.get(e)===r&&(r.type==="power"&&r.state?.availability==="available"&&typeof r.state.power?.isOn=="boolean"&&r.state.controls?.setPower===!0?this.onTogglePower(e):this.onOpenDetails(e))};return s.addEventListener("pointerdown",o=>{Cr(o);try{s.setPointerCapture?.(o.pointerId)}catch{}r.pressGesture.pointerDown(o)}),s.addEventListener("pointermove",o=>{Cr(o),r.pressGesture.pointerMove(o)}),s.addEventListener("pointerup",o=>{Cr(o);let c=r.pressGesture.pointerUp(o);r.suppressClickUntil=Math.max(r.suppressClickUntil,Date.now()+500),c&&a()}),s.addEventListener("pointercancel",o=>{Cr(o),r.pressGesture.pointerCancel(o)}),s.addEventListener("lostpointercapture",o=>{r.pressGesture.pointerCancel(o)}),s.addEventListener("contextmenu",Cr),s.addEventListener("click",o=>{Cr(o),!(Date.now()<r.suppressClickUntil)&&a()}),this.layer.appendChild(s),this.records.set(e,r),r}removeRecord(e,t){t.pressGesture.dispose(),t.element.remove(),this.records.delete(e)}updateRecord(e,t){e.state=t;let i=typeof t?.icon?.dataUrl=="string"&&t.icon.dataUrl.startsWith("data:image/svg+xml;base64,")?t.icon.dataUrl:null;e.element.classList.toggle("has-device-icon",!!i),i?e.element.style.setProperty("--device-affordance-icon",\`url("\${i}")\`):e.element.style.removeProperty("--device-affordance-icon");let s=e.type==="power",r=s&&t?.power?.isOn===!0,a=t?.availability!=="available",o=(t?.safety??[]).some(f=>f.active===!0)||t?.health?.alerts?.some(f=>f.active===!0)===!0,c=String(t?.cleaning?.state??"").toLowerCase(),l=(t?.activity??[]).some(f=>f.active===!0)||e.type==="cleaning"&&t?.availability==="available"&&c.length>0&&!["docked","idle","paused"].includes(c)||e.type==="fan"&&(t?.power?.isOn===!0||Number.isFinite(t?.fan?.speed)&&t.fan.speed>0||t?.fan?.mode==="on");e.element.classList.toggle("is-on",r),e.element.classList.toggle("is-alert",o),e.element.classList.toggle("is-active",l),e.element.classList.toggle("is-unavailable",a),s?e.element.setAttribute("aria-pressed",String(r)):e.element.removeAttribute("aria-pressed");let u=typeof t?.name=="string"&&t.name.trim()?t.name.trim():this.translate("deviceDetails.device","Device"),h=s&&!a?this.translate(r?"quickControls.power.turnOff":"quickControls.power.turnOn",r?"Turn off":"Turn on"):this.translate("deviceDetails.label","Device details");e.element.setAttribute("aria-label",\`\${u}: \${h}\`),e.element.title=h}sync({entities:e,bindings:t,statesByDeviceId:i}){let s=new Set,r=GE({entities:e,bindings:t,statesByDeviceId:i});for(let{binding:a,entity:o,priority:c,state:l,type:u}of r){s.add(o.id);let h=this.records.get(o.id);h&&h.type!==u&&(this.removeRecord(o.id,h),h=null),h??=this.createRecord(o.id,o,u),h.entity=o,h.deviceId=a.deviceId,h.priority=c,this.updateRecord(h,l)}for(let[a,o]of this.records)s.has(a)||this.removeRecord(a,o);this.layer.hidden=this.suppressed||this.records.size===0}setSuppressed(e){if(this.suppressed=!!e,this.suppressed)for(let t of this.records.values()){let i=[...t.pressGesture.activePointers.keys()];t.pressGesture.reset();for(let s of i)try{t.element.hasPointerCapture?.(s)&&t.element.releasePointerCapture(s)}catch{}}this.layer.hidden=this.suppressed||this.records.size===0}layout(e,t){if(this.layer.hidden)return[];let i=Math.max(t.clientWidth,1),s=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let r=[];for(let[l,u]of this.records){let h=u.entity.controlAnchor;h?(h.updateWorldMatrix(!0,!1),h.getWorldPosition(this.anchor),this.anchor.y+=.35):(u.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(u.entity.root)),!h&&this.bounds.isEmpty()?(u.entity.root.getWorldPosition(this.anchor),this.anchor.y+=.35):h||(this.bounds.getCenter(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.16,this.size.y*.05)),this.projected.copy(this.anchor).project(e);let f=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;u.element.hidden=!f,f&&r.push({left:(this.projected.x*.5+.5)*i,record:u,sceneObjectId:l,top:(-this.projected.y*.5+.5)*s})}let a=VE(r,i,s),o=new Set(a.map(({sceneObjectId:l})=>l));for(let l of r)l.record.element.hidden=!o.has(l.sceneObjectId);a.sort((l,u)=>l.top-u.top||l.left-u.left||l.sceneObjectId.localeCompare(u.sceneObjectId));let c=[];for(let l of a){let u=Km({left:l.left,top:l.top,width:i,height:s,controlWidth:l.record.element.offsetWidth||38,controlHeight:l.record.element.offsetHeight||38,collisionGap:5,obstacles:c});u&&(l.record.element.style.left=\`\${u.position.left}px\`,l.record.element.style.top=\`\${u.position.top}px\`,c.push(u.rectangle))}return c}clear(){for(let[e,t]of this.records)this.removeRecord(e,t);this.layer.hidden=!0}dispose(){this.clear(),this.layer.remove()}};var P0=ei(ts());var WE=Object.freeze(["auto","light","dark"]),n0=Object.freeze(["auto","day","evening","night"]),Qm=Object.freeze({resolvedTheme:"light",backgroundStyle:"neutral-light",uiContrast:"dark",ambientIntensityFactor:1,keyIntensityFactor:1,fillIntensityFactor:1,toneMappingExposure:1.05}),XE=Object.freeze({resolvedTheme:"dark",backgroundStyle:"warm-evening",uiContrast:"light",ambientIntensityFactor:.62,keyIntensityFactor:.58,fillIntensityFactor:.55,toneMappingExposure:1.025}),e0=Object.freeze({resolvedTheme:"dark",backgroundStyle:"neutral-dark",uiContrast:"light",ambientIntensityFactor:.28,keyIntensityFactor:.24,fillIntensityFactor:.22,toneMappingExposure:1}),qE=Object.freeze({day:Qm,evening:XE,night:e0,light:Qm,dark:e0});function YE(n){return WE.includes(n)?n:"auto"}function Va(n){return n0.includes(n)?n:"auto"}function t0(n){return n==="dark"||n==="light"?n:null}function kh({mode:n="auto",timeOfDay:e="auto",hostTheme:t=null,systemTheme:i="light"}={}){let s=YE(n),r=s==="auto"?t0(t)??t0(i)??"light":s,a=Va(e),o=a==="auto"?r==="dark"?"night":"day":a;return Object.freeze({themeMode:s,timeOfDayMode:a,resolvedTimeOfDay:o,...qE[o]})}function $E(n,e){return!!(n&&e&&n.themeMode===e.themeMode&&n.timeOfDayMode===e.timeOfDayMode&&n.resolvedTimeOfDay===e.resolvedTimeOfDay&&n.resolvedTheme===e.resolvedTheme)}function bl(n,{renderer:e=null,rootElement:t=null,runtimes:i=[]}={}){if(n){t&&(t.dataset.dashboardThemeMode=n.themeMode,t.dataset.dashboardTheme=n.resolvedTheme,t.dataset.dashboardTimeOfDayMode=n.timeOfDayMode,t.dataset.dashboardTimeOfDay=n.resolvedTimeOfDay,t.dataset.dashboardBackground=n.backgroundStyle,t.dataset.dashboardContrast=n.uiContrast,t.style.colorScheme=n.resolvedTheme),e&&(e.toneMappingExposure=n.toneMappingExposure);for(let s of i)gm(s?.lighting,n)}}function zh(n,e,{mode:t="auto",timeOfDay:i="auto",renderer:s=null,rootElement:r=null,runtimes:a=[],afterApply:o=null,requestRender:c=null}={}){let l=kh({mode:t,timeOfDay:i,...e});return $E(n,l)?n:(bl(l,{renderer:s,rootElement:r,runtimes:a}),o?.(l),c?.(),l)}var ns=Object.freeze({compactWidth:320,spaciousWidth:640,shortHeight:320,tallHeight:720,portraitAspect:.8,landscapeAspect:1.2,maxDevicePixelRatio:2,maxRenderPixels:21e5});function Hh(n,e=1){return Number.isFinite(n)&&n>0?n:e}function Vh({width:n,height:e,devicePixelRatio:t=1}={}){let i=Hh(n),s=Hh(e),r=i/s,a=i<ns.compactWidth?"compact":i>=ns.spaciousWidth?"spacious":"standard",o=s<ns.shortHeight?"short":s>=ns.tallHeight?"tall":"standard",c=r<=ns.portraitAspect?"portrait":r>=ns.landscapeAspect?"landscape":"balanced",l=Math.min(Math.max(Hh(t),1),ns.maxDevicePixelRatio),u=Math.sqrt(ns.maxRenderPixels/(i*s)),h=Math.round(Math.max(1,Math.min(l,u))*1e3)/1e3;return Object.freeze({width:i,height:s,aspect:r,size:a,heightClass:o,orientation:c,renderPixelRatio:h})}function i0(n,e){return!!(n&&e&&n.size===e.size&&n.heightClass===e.heightClass&&n.orientation===e.orientation&&n.renderPixelRatio===e.renderPixelRatio)}function Gh(n,{rootElement:e=null,shellElement:t=null}={}){if(n)for(let i of[e,t])i&&(i.dataset.dashboardLayoutSize=n.size,i.dataset.dashboardLayoutHeight=n.heightClass,i.dataset.dashboardLayoutOrientation=n.orientation)}function Ml(n,e){let t=Math.max(Number(e)||0,0);return n?.orientation!=="landscape"?t:Math.min(t,Math.max(116,Math.floor(t*.58)))}var r2=Object.freeze({minimumKelvin:2e3,maximumKelvin:6500}),jE=2850;function Ga(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function Sl(n){return typeof n=="number"&&Number.isFinite(n)?n:null}function s0(n){let e=Ga(n,2e3,6500)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,i=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,s=e>=66?255:e<=19?0:138.5177312231*Math.log(e-10)-305.0447927307,r=a=>Ga(a/255*.88+.12);return{r:r(t),g:r(i),b:r(s)}}function ZE(n,e){let t=(n%1+1)%1,i=Ga(e),s=t*6,r=i,a=r*(1-Math.abs(s%2-1)),o;s<1?o=[r,a,0]:s<2?o=[a,r,0]:s<3?o=[0,r,a]:s<4?o=[0,a,r]:s<5?o=[a,0,r]:o=[r,0,a];let c=1-r,l=u=>{let h=Ga(u+c);return Math.abs(h)<1e-12?0:Math.abs(1-h)<1e-12?1:h};return{r:l(o[0]),g:l(o[1]),b:l(o[2])}}function r0(n){let e=n?.availability==="available"&&typeof n?.power?.isOn=="boolean",t=e&&n.power.isOn,i=Sl(n?.light?.brightness),s=i===null?1:Ga(i),r=Sl(n?.light?.color?.hue),a=Sl(n?.light?.color?.saturation),o=Sl(n?.light?.colorTemperatureKelvin),c=r!==null&&a!==null,l=o!==null,u=["color","temperature","white"].includes(n?.light?.mode)?n.light.mode:c?"color":l?"temperature":"white",h=u==="color"&&!c?l?"temperature":"white":u==="temperature"&&!l?c?"color":"white":u,f,d=null;return h==="color"&&c?f=ZE(r,a):h==="temperature"&&l?(d=o,f=s0(o)):f=s0(jE),{known:e,on:t,brightness:s,hasDim:i!==null,colorMode:h,rgb:f,...d===null?{}:{colorTemperature:d}}}var a0=14,KE=280,o0=1776928,JE=5593180;function Wh(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function QE(n){return n<.5?4*n*n*n:1-(-2*n+2)**3/2}function El(n,e){let t=Wh(e);n.slats.forEach((i,s)=>{let r=n.topY-n.headrailHeight-(s+.5)*n.fullSpacing,a=n.topY-n.headrailHeight-(s+.5)*n.stackSpacing;i.position.y=ut.lerp(r,a,t),i.rotation.x=-.05*(1-t)}),n.fraction=t}function ew(n){let e=n.visual?.coverVisual;if(e)return e;if(n.elementType!=="window"||!n.visual?.size)return null;let{width:t,height:i,depth:s}=n.visual.size,r=Math.max(t-.1,.18),a=Math.max(i-.1,.32),o=Math.min(Math.max(a*.04,.035),.055),c=Math.max((a-o)/a0,.018),l=Math.min(Math.max(a*.004,.0035),.006),u=Math.max(c+.006,.024),h=new An({color:o0,roughness:.58,metalness:.08}),f=new _t;f.name="DashboardWindowCover",f.position.set(t/2,.05,Math.max(s,.02)*.1),f.userData.deviceVisual="cover",n.root.add(f);let d=new Wt(r,o,.06),p=new pt(d,h);p.name="DashboardWindowCoverRail",p.position.y=a-o/2,p.castShadow=!0,p.receiveShadow=!0,f.add(p);let x=new Wt(r*.98,u,.052),m=Array.from({length:a0},(w,E)=>{let y=new pt(x,h);return y.name=\`DashboardWindowCoverSlat:\${E}\`,y.castShadow=!0,y.receiveShadow=!0,f.add(y),y}),g={root:f,rail:p,slats:m,material:h,topY:a,headrailHeight:o,fullSpacing:c,stackSpacing:l,fraction:1,transition:null,initialized:!1};return El(g,1),n.visual.coverVisual=g,g}function c0(n,e,t=0){if(n.elementType!=="window")return!1;if(!e?.cover)return n.visual?.coverVisual&&(n.visual.coverVisual.root.visible=!1),!1;let i=ew(n);if(!i)return!1;i.root.visible=!0;let s=e.availability==="available";i.material.color.setHex(s?o0:JE),i.root.userData.coverAvailability=e.availability,i.root.userData.coverMovement=e.cover.movement;let r=typeof e.cover.position=="number"&&Number.isFinite(e.cover.position)?Wh(e.cover.position):null;return r===null?(i.initialized||El(i,1),i.initialized=!0,i.transition=null,!1):i.initialized?Math.abs(r-i.fraction)<=1e-6?(i.transition=null,!1):(i.transition={from:i.fraction,to:r,startedAt:t,duration:KE},!0):(El(i,r),i.initialized=!0,!0)}function tw(n,e){let t=n.visual?.coverVisual,i=t?.transition;if(!i)return!1;let s=Wh((e-i.startedAt)/i.duration);return El(t,ut.lerp(i.from,i.to,QE(s))),s>=1&&(t.transition=null),s<1}function l0(n,e){let t=!1;for(let i of n.values())t=tw(i,e)||t;return t}var g0=new Set(["alarm_occupancy","alarm_presence","occupancy","presence"]),u0=5680504,x0=5680504,nw=6662616,iw=14179671,ln=Object.freeze({fadeInMs:600,fadeOutMs:1500,floorOffset:.006,wallGap:.02,innerWidth:.035,outerWidth:.11,innerVerticalOffset:8e-4,innerOpacity:.42,outerOpacity:.14,pulseDurationMs:3600,minimumPulseOpacity:.72}),v0=Object.freeze({coreOpacity:.34}),hi=Object.freeze({maximumFrameDeltaMs:100,maximumPathPoints:128,maximumSpeedMetersPerSecond:2,minimumSegmentLength:.01,minimumSpeedMetersPerSecond:.02}),Ai=Object.freeze({gridSpacing:.25,maximumGridPoints:2400,maximumLandmarks:5,maximumRobotClearance:.34,minimumLandmarkDistance:.8,minimumRobotClearance:.18,robotClearancePadding:.04,speedMetersPerSecond:.22}),sw=new Set(["chair_basic","climate","device","rug","table_basic"]),Xh=.002,rw=4;function Yh(n){return typeof n=="string"?n.trim().toLowerCase().split(".")[0]:""}function aw(n){return g0.has(Yh(n?.capability))}function ow(n){return g0.has(Yh(n?.baseId??n?.id))}function cw(n){return n?.availability==="available"&&(n.activity??[]).some(e=>ow(e)&&e.active===!0)}function lw(n){if(n?.availability!=="available")return"inactive";let e=String(n?.cleaning?.state??"").trim().toLowerCase(),t=String(n?.cleaning?.error??"").trim().toLowerCase();return["error","fault","blocked"].includes(e)||t&&!["no error","none","ok"].includes(t)?"error":["returning","returning_to_base","return-to-base","docking"].includes(e)?"returning":["active","cleaning","mowing","on","running"].includes(e)?"working":"inactive"}function $h(n){if(!n||(n.coordinateSpace??"floor")!=="floor")return null;let e=[];for(let s of n.path??[]){if(e.length>=hi.maximumPathPoints)break;if(!Number.isFinite(s?.x)||!Number.isFinite(s?.z))continue;let r={x:s.x,z:s.z};(e.length===0||Math.sqrt(Zn(e[e.length-1],r))>=hi.minimumSegmentLength)&&e.push(r)}if(e.length<2)return null;let t=ut.clamp(Number(n.speedMetersPerSecond)||.25,hi.minimumSpeedMetersPerSecond,hi.maximumSpeedMetersPerSecond);return{coordinateSpace:"floor",loop:n.loop===!0,path:e,speedMetersPerSecond:t}}function _0(n){let e=$h(n);if(!e)return null;let{loop:t,path:i,speedMetersPerSecond:s}=e,r=[],a=t?i.length:i.length-1,o=0;for(let c=0;c<a;c+=1){let l=i[c],u=i[(c+1)%i.length],h=Math.sqrt(Zn(l,u));h<hi.minimumSegmentLength||(r.push({end:u,length:h,start:l,startDistance:o}),o+=h)}return r.length===0||o<=0?null:{...e,segments:r,signature:JSON.stringify(e),totalDistance:o}}function Zn(n,e){return(n.x-e.x)**2+(n.z-e.z)**2}function is(n){return n.length<3?0:n.reduce((e,t,i)=>{let s=n[(i+1)%n.length];return e+t.x*s.z-s.x*t.z},0)/2}function Rr(n,e){return n.x*e.z-n.z*e.x}function Dn(n,e){return{x:n.x-e.x,z:n.z-e.z}}function Tl(n,e,t){return{x:n.x+e.x*t,z:n.z+e.z*t}}function h0(n){let e=Math.hypot(n.x,n.z);return e<=Xh?null:{x:n.x/e,z:n.z/e}}function jh(n){let e=[];for(let t of n??[])!Number.isFinite(t?.x)||!Number.isFinite(t?.z)||(e.length===0||Zn(e[e.length-1],t)>Xh**2)&&e.push({x:t.x,z:t.z});return e.length>1&&Zn(e[0],e[e.length-1])<=Xh**2&&e.pop(),is(e)<0&&e.reverse(),e}function Pr(n,e){if(!n||e.length<3)return!1;let t=!1,i=e[e.length-1];for(let s of e){if(s.z>n.z!=i.z>n.z){let a=(i.x-s.x)*(n.z-s.z)/(i.z-s.z)+s.x;n.x<a&&(t=!t)}i=s}return t}function uw(n,e,t,i){let s=Rr(Dn(e,n),Dn(t,n)),r=Rr(Dn(e,n),Dn(i,n)),a=Rr(Dn(i,t),Dn(n,t)),o=Rr(Dn(i,t),Dn(e,t));return s*r<-1e-6&&a*o<-1e-6}function y0(n){if(n.length<4)return!1;for(let e=0;e<n.length;e+=1){let t=(e+1)%n.length;for(let i=e+1;i<n.length;i+=1){let s=(i+1)%n.length;if(!(t===i||s===e||e===i)&&uw(n[e],n[t],n[i],n[s]))return!0}}return!1}function hw(n,e,t){let i=Dn(t,e),s=i.x**2+i.z**2;if(s<=1e-6)return Math.sqrt(Zn(n,e));let r=Dn(n,e),a=ut.clamp((r.x*i.x+r.z*i.z)/s,0,1);return Math.sqrt(Zn(n,Tl(e,i,a)))}function b0(n,e){return e.reduce((t,i,s)=>Math.min(t,hw(n,i,e[(s+1)%e.length])),1/0)}function dw(n){let e=String(n?.assetKey??n?.visualType??"").trim();if(n?.kind==="light"||e==="robotVacuum"||sw.has(e))return null;let t=n?.dimensions??n?.size,i=Number(t?.width),s=Number(t?.depth),r=Number(n?.position?.x),a=Number(n?.position?.z);return![i,s,r,a].every(Number.isFinite)||i<=.04||s<=.04?null:{depth:s,rotation:ut.degToRad(Number(n?.rotation?.y)||0),width:i,x:r,z:a}}function M0(n,e,t){let i=n.x-e.x,s=n.z-e.z,r=Math.cos(e.rotation),a=Math.sin(e.rotation),o=r*i+a*s,c=-a*i+r*s;return Math.abs(o)<=e.width/2+t&&Math.abs(c)<=e.depth/2+t}function fw(n,e,t,i){return Pr(n,e)&&b0(n,e)>=i&&!t.some(s=>M0(n,s,i))}function S0(n,e,t,i){let s=Math.sqrt(Zn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let a=0;a<=r;a+=1){let o=a/r;if(!t({x:ut.lerp(n.x,e.x,o),z:ut.lerp(n.z,e.z,o)}))return!1}return!0}function pw(n,e,t,i){let s=Math.sqrt(Zn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let a=1;a<=r;a+=1){let o=a/r;if(!t({x:ut.lerp(n.x,e.x,o),z:ut.lerp(n.z,e.z,o)}))return!1}return!0}function mw(n,e,t){n[e].push(t),n[t].push(e)}function E0(n,e){let t=[],i=[e],s=new Set(i);for(let r=0;r<i.length;r+=1){let a=i[r];t.push(a);for(let o of n[a])s.has(o)||(s.add(o),i.push(o))}return t}function gw(n){let e=[],t=new Map;for(let i=0;i<n.length;i+=1){if(t.has(i))continue;let s=E0(n,i),r=e.length;e.push(s);for(let a of s)t.set(a,r)}return{componentByPoint:t,components:e}}function d0(n,e,t){if(e===t)return[e];let i=[e],s=new Map([[e,null]]);for(let r=0;r<i.length;r+=1){let a=i[r];for(let o of n[a])if(!s.has(o)){if(s.set(o,a),o===t){let c=[t],l=a;for(;l!==null;)c.push(l),l=s.get(l);return c.reverse()}i.push(o)}}return null}function f0(n,e,t){if(n.length<=2)return n;let i=[n[0]],s=0;for(;s<n.length-1;){let r=s+1;for(let a=n.length-1;a>s+1;a-=1)if(S0(n[s],n[a],e,t)){r=a;break}i.push(n[r]),s=r}return i}function xw(n,e){return(n?.rooms??[]).map(t=>({room:t,boundary:jh(t?.polygon)})).filter(({boundary:t})=>Pr(e,t)).sort((t,i)=>Math.abs(is(t.boundary))-Math.abs(is(i.boundary)))[0]??null}function w0({activeFloor:n,excludedObjectId:e=null,origin:t,robotSize:i=null}={}){if(!Number.isFinite(t?.x)||!Number.isFinite(t?.z))return null;let s=xw(n,t);if(!s||s.boundary.length<3)return null;let r=Math.max(Number(i?.width)||.42,.18),a=Math.max(Number(i?.depth)||.42,.18),o=ut.clamp(Math.max(r,a)/2+Ai.robotClearancePadding,Ai.minimumRobotClearance,Ai.maximumRobotClearance),c=(n?.objects??[]).filter(k=>k?.id!==e&&Pr(k?.position,s.boundary)).map(dw).filter(Boolean),l=k=>fw(k,s.boundary,c,o),u=k=>Pr(k,s.boundary)&&!c.some($=>M0(k,$,.02)),h=s.boundary.reduce((k,$)=>({maximumX:Math.max(k.maximumX,$.x),maximumZ:Math.max(k.maximumZ,$.z),minimumX:Math.min(k.minimumX,$.x),minimumZ:Math.min(k.minimumZ,$.z)}),{maximumX:-1/0,maximumZ:-1/0,minimumX:1/0,minimumZ:1/0}),f=Math.max(0,h.maximumX-h.minimumX-o*2),d=Math.max(0,h.maximumZ-h.minimumZ-o*2),p=Ai.gridSpacing;f*d/p**2>Ai.maximumGridPoints&&(p=Math.sqrt(f*d/Ai.maximumGridPoints));let m=[],g=new Map,w=Math.floor(f/p)+1,E=Math.floor(d/p)+1;for(let k=0;k<E;k+=1)for(let $=0;$<w;$+=1){let se={x:h.minimumX+o+$*p,z:h.minimumZ+o+k*p};l(se)&&(g.set(\`\${$}:\${k}\`,m.length),m.push(se))}if(m.length<2)return null;let y=m.map(()=>[]),T=[[1,0],[0,1],[1,1],[-1,1]];for(let[k,$]of g){let[se,ae]=k.split(":").map(Number);for(let[ee,we]of T){let Ke=g.get(\`\${se+ee}:\${ae+we}\`);Ke!==void 0&&(ee!==0&&we!==0&&(!g.has(\`\${se+ee}:\${ae}\`)||!g.has(\`\${se}:\${ae+we}\`))||S0(m[$],m[Ke],l,p)&&mw(y,$,Ke))}}let b=m.map((k,$)=>({index:$,distance:Zn(t,k)})).sort((k,$)=>k.distance-$.distance),{componentByPoint:C,components:v}=gw(y),S=b.filter(({index:k})=>v[C.get(k)].length>=2),P=S.filter(({index:k})=>pw(t,m[k],u,p)),I=(P.length>0?P:S).sort((k,$)=>v[C.get($.index)].length-v[C.get(k.index)].length||k.distance-$.distance)[0]?.index;if(I===void 0)return null;let O=E0(y,I);if(O.length<2)return null;let U=[I];for(;U.length<=Ai.maximumLandmarks;){let k=null;for(let $ of O){if(U.includes($))continue;let se=Math.min(...U.map(ae=>Zn(m[$],m[ae])));(!k||se>k.separation)&&(k={index:$,separation:se})}if(!k||Math.sqrt(k.separation)<Ai.minimumLandmarkDistance)break;U.push(k.index)}if(U.length<2)return null;let q=[{x:t.x,z:t.z},m[I]],R=new Set(U.slice(1)),H=I;for(;R.size>0;){let k=null;for(let se of R){let ae=d0(y,H,se);!ae||k&&ae.length>=k.graphPath.length||(k={graphPath:ae,target:se})}if(!k)break;let $=f0(k.graphPath.map(se=>m[se]),l,p);q.push(...$.slice(1)),H=k.target,R.delete(H)}let z=d0(y,H,I);if(z){let k=f0(z.map($=>m[$]),l,p);q.push(...k.slice(1))}return $h({coordinateSpace:"floor",loop:!0,path:q,speedMetersPerSecond:Ai.speedMetersPerSecond})}function wl(n,e){if(e<=0)return n.map(s=>({...s}));let t=[];for(let s=0;s<n.length;s+=1){let r=n[(s-1+n.length)%n.length],a=n[s],o=n[(s+1)%n.length],c=h0(Dn(a,r)),l=h0(Dn(o,a));if(!c||!l)return null;let u={x:-c.z,z:c.x},h={x:-l.z,z:l.x},f=Tl(a,u,e),d=Tl(a,h,e),p=Rr(c,l),x;if(Math.abs(p)<=1e-5){if(!(c.x*l.x+c.z*l.z>0))return null;x=f}else{let g=Rr(Dn(d,f),l)/p;x=Tl(f,c,g)}let m=Math.sqrt(Zn(a,x));if(!Number.isFinite(x.x)||!Number.isFinite(x.z)||m>e*rw)return null;t.push(x)}let i=is(t);return t.length!==n.length||i<=0||i>=is(n)||y0(t)||t.some(s=>!Pr(s,n))||t.some(s=>b0(s,n)<e-.001)?null:t}function vw(n,e){let t=jh(n?.polygon);if(t.length<3||is(t)<=0||y0(t))return null;let i=Math.max(e,0)+ln.wallGap,s=i+ln.outerWidth,r=i+(ln.outerWidth-ln.innerWidth)/2,a=r+ln.innerWidth,o=wl(t,i),c=wl(t,s),l=wl(t,r),u=wl(t,a);return!o||!c||!l||!u?null:{boundary:t,softOuter:o,softInner:c,coreOuter:l,coreInner:u}}function p0(n,e,t){let i=[],s=[];for(let a=0;a<n.length;a+=1){let o=(a+1)%n.length,c=i.length/3;i.push(n[a].x,t,n[a].z,n[o].x,t,n[o].z,e[o].x,t,e[o].z,e[a].x,t,e[a].z),s.push(c,c+2,c+1,c,c+3,c+2)}let r=new tn;return r.setAttribute("position",new bt(i,3)),r.setIndex(s),r.computeVertexNormals(),r}function qh(n,e){let t=new En({color:n,depthTest:!0,depthWrite:!1,opacity:0,side:nn,toneMapped:!1,transparent:!0});return t.userData.baseOpacity=e,t}function Ir(n){n.userData.excludeFromCameraFit=!0,n.userData.excludeFromDevicePicking=!0}function _w(n,e,t){let i=vw(n,e);if(!i)return null;let s=n.elevation+ln.floorOffset,r=qh(u0,ln.outerOpacity),a=qh(u0,ln.innerOpacity),o=new _t;o.name=\`OccupancyRoomGlow:\${n.id}\`,o.visible=!1,Ir(o);let c=new pt(p0(i.softOuter,i.softInner,s),r),l=new pt(p0(i.coreOuter,i.coreInner,s+ln.innerVerticalOffset),a);return c.renderOrder=2,l.renderOrder=3,Ir(c),Ir(l),o.add(c,l),t.add(o),{currentOpacity:0,duration:0,group:o,innerMaterial:a,outerMaterial:r,roomId:n.id,startOpacity:0,transitionStartedAt:0,targetOccupied:!1}}function yw(n,e=null){let t=n.root.userData.dimensions??{width:.42,depth:.42},i=Math.max(Number(t.width)||.42,.18),s=Math.max(Number(t.depth)||.42,.18),r=n.visual?.pathMotionRoot??n.root,a=new _t;a.name=\`RobotWorkGlow:\${n.id}\`,a.position.y=.008,a.visible=!1,Ir(a);let o=qh(x0,v0.coreOpacity),c=new pt(new da(.54,.76,64),o);return c.rotation.x=-Math.PI/2,c.scale.set(i,s,1),c.renderOrder=4,Ir(c),a.add(c),r.add(a),n.controlAnchor=n.root,{baseEntityPosition:n.root.position.clone(),baseEntityRotationY:n.root.rotation.y,baseMotionPosition:r.position.clone(),baseMotionRotationY:r.rotation.y,core:c,coreMaterial:o,distance:0,entityRoot:n.root,errorTravelRemaining:0,group:a,illustrativeMotion:_0(e),lastMotionAt:null,mode:"inactive",motion:null,motionRoot:r,motionSignature:null}}function bw(n,e){let t={x:e.root.position.x,z:e.root.position.z};return(n.rooms??[]).map(s=>({room:s,polygon:jh(s.polygon)})).filter(({polygon:s})=>Pr(t,s)).sort((s,r)=>Math.abs(is(s.polygon))-Math.abs(is(r.polygon)))[0]?.room??null}function Mw(n){let e=ut.clamp(n,0,1);return e**3*(e*(e*6-15)+10)}function m0(n,e,t){if(n.duration>0){let o=(e-n.transitionStartedAt)/n.duration;n.currentOpacity=n.startOpacity+((n.targetOccupied?1:0)-n.startOpacity)*Mw(o),(o>=1||t)&&(n.currentOpacity=n.targetOccupied?1:0,n.duration=0)}let i=e%ln.pulseDurationMs/ln.pulseDurationMs,s=(1-Math.cos(i*2*Math.PI))/2,r=n.targetOccupied&&!t&&n.duration===0?1-s*(1-ln.minimumPulseOpacity):1,a=n.currentOpacity*r;return n.outerMaterial.opacity=ln.outerOpacity*a,n.innerMaterial.opacity=ln.innerOpacity*a,n.group.visible=a>1e-4||n.duration>0,n.duration>0||n.targetOccupied&&!t}function Zh(n){if(!n.motion)return!1;let e=n.motion.loop?n.distance%n.motion.totalDistance:ut.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.find(h=>e<=h.startDistance+h.length)??n.motion.segments[n.motion.segments.length-1],i=ut.clamp((e-t.startDistance)/t.length,0,1),s=ut.lerp(t.start.x,t.end.x,i),r=ut.lerp(t.start.z,t.end.z,i),a=Math.atan2(t.end.x-t.start.x,t.end.z-t.start.z),o=s,c=r,l=a;if(n.motionRoot!==n.entityRoot){let h=s-n.baseEntityPosition.x,f=r-n.baseEntityPosition.z,d=Math.cos(n.baseEntityRotationY),p=Math.sin(n.baseEntityRotationY);o=n.baseMotionPosition.x+d*h-p*f,c=n.baseMotionPosition.z+p*h+d*f,l=n.baseMotionRotationY+a-n.baseEntityRotationY}let u=Math.abs(n.motionRoot.position.x-o)>1e-5||Math.abs(n.motionRoot.position.z-c)>1e-5;return n.motionRoot.position.x=o,n.motionRoot.position.z=c,n.motionRoot.rotation.y=l,u}function Sw(n,e,t){let i=_0(e?.motion)??n.illustrativeMotion;return i?.signature===n.motionSignature?!1:(n.motion=i,n.motionSignature=i?.signature??null,n.distance=0,n.lastMotionAt=t,i?Zh(n):(n.motionRoot.position.copy(n.baseMotionPosition),n.motionRoot.rotation.y=n.baseMotionRotationY),!0)}function Ew(n){if(n?.availability!=="available")return!1;let e=String(n?.cleaning?.state??"").trim().toLowerCase();return["docked","charging","charged"].includes(e)}function ww(n){if(!n.motion){n.errorTravelRemaining=0;return}let e=n.motion.loop?n.distance%n.motion.totalDistance:ut.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.findIndex(a=>e<=a.startDistance+a.length),i=t<0?n.motion.segments.length-1:t,s=n.motion.segments[i],r=Math.max(0,s.startDistance+s.length-e);if(r<Math.max(hi.minimumSegmentLength*4,.12)&&(n.motion.loop||i<n.motion.segments.length-1)){let a=n.motion.segments[(i+1)%n.motion.segments.length];r+=a.length}n.errorTravelRemaining=r}function Tw(n,e,t){let i=n.mode!=="inactive",s=!1;if(n.motion){let l=n.lastMotionAt===null?0:ut.clamp(e-n.lastMotionAt,0,hi.maximumFrameDeltaMs);n.lastMotionAt=e;let u=t?n.errorTravelRemaining:l/1e3*n.motion.speedMetersPerSecond;if(i&&l>0&&u>0){let h=u;n.mode==="error"&&(h=Math.min(h,n.errorTravelRemaining),n.errorTravelRemaining=Math.max(0,n.errorTravelRemaining-h)),(!t||n.mode==="error")&&(n.distance=n.mode==="returning"?Math.max(0,n.distance-h):n.motion.loop?(n.distance+h)%n.motion.totalDistance:Math.min(n.motion.totalDistance,n.distance+h)),s=Zh(n)}}else n.lastMotionAt=e;let r=n.mode==="returning"&&n.motion&&n.distance<=hi.minimumSegmentLength,a=i&&!r;if(n.group.visible=a,!a)return{active:!1,moved:s};let o=n.mode==="error"?iw:n.mode==="returning"?nw:x0;return n.coreMaterial.color.setHex(o),n.coreMaterial.opacity=v0.coreOpacity,{active:!t&&!!n.motion&&(n.mode==="working"&&(n.motion.loop||n.distance<n.motion.totalDistance-hi.minimumSegmentLength)||n.mode==="returning"&&!r||n.mode==="error"&&n.errorTravelRemaining>hi.minimumSegmentLength),moved:s}}function T0({activeFloor:n,bindings:e,entities:t,sceneRoot:i,reduceMotion:s=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches===!0}){let r=new _t;r.name="DashboardStateVisuals",Ir(r),i.add(r);let a=new Map,o=new Map,c=new Map,l=!1,u=Math.max(.15,...(n.walls??[]).map(d=>Number(d.thickness)||0));for(let d of t.values()){let p=e.get(d.id);if(!p?.deviceId||((d.visual?.assetKey==="robotVacuum"||Yh(p.capability).startsWith("vacuum"))&&c.set(d.id,yw(d,d.visual?.pathMotionRoot?w0({activeFloor:n,excludedObjectId:d.id,origin:{x:d.root.position.x,z:d.root.position.z},robotSize:d.root.userData.dimensions}):null)),!aw(p)))continue;let m=bw(n,d);if(!m)continue;if(!a.has(m.id)){let w=_w(m,u/2,r);w&&a.set(m.id,w)}let g=o.get(m.id)??new Set;g.add(p.deviceId),o.set(m.id,g)}return Object.freeze({layer:r,occupancyByRoomId:a,robotByEntityId:c,didMoveRobot:()=>l,step:(d=globalThis.performance?.now()??Date.now())=>{let p=!1;l=!1;for(let x of a.values())p=m0(x,d,s)||p;for(let x of c.values()){let m=Tw(x,d,s);p=m.active||p,l=m.moved||l}return p},sync:(d,p=globalThis.performance?.now()??Date.now())=>{for(let[x,m]of c){let g=e.get(x),w=d.get(g?.deviceId),E=m.mode;m.mode=lw(w);let y=Sw(m,w,p);m.mode==="error"&&(E!=="error"||y)?ww(m):m.mode!=="error"&&(m.errorTravelRemaining=0),Ew(w)&&m.motion&&m.distance!==0&&(m.distance=0,Zh(m))}for(let[x,m]of a){let g=[...o.get(x)??[]].some(w=>cw(d.get(w)));m.targetOccupied!==g&&(m0(m,p,s),m.targetOccupied=g,m.startOpacity=m.currentOpacity,m.transitionStartedAt=p,m.duration=s?0:g?ln.fadeInMs:ln.fadeOutMs,s&&(m.currentOpacity=g?1:0))}}})}var{DEVICE_COMMAND:A0,contactState:Rl,hasPowerState:Cw}=P0.default,Rw=new D(8.5,12.5,10.5).normalize(),Cl=Object.freeze({outputColorSpace:Kt,toneMapping:fr,toneMappingExposure:1.05}),Xa=["livingLight","patioDoor","window"];function Iw(n){let e=Array.isArray(n?.providers)?n.providers:[n?.provider];return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function Jh(n,{provider:e=null,providers:t=null}={}){return n?e?n.provider===e:t?t.has(n.provider):!0:!1}function D0(n){n.outputColorSpace=Cl.outputColorSpace,n.toneMapping=Cl.toneMapping,n.toneMappingExposure=Cl.toneMappingExposure}function L0(n=window.location){return["localhost","127.0.0.1"].includes(n.hostname)}function Kh(n,e=window.location){if(!L0(e))return!1;let t=new URLSearchParams(e.search),i=t.get("toneMapping");if(i==="none")n.toneMapping=Rn;else if(i==="aces")n.toneMapping=fr;else return!1;let s=Number(t.get("exposure"));return Number.isFinite(s)&&s>0&&(n.toneMappingExposure=s),!0}function Wa(n){return n?.availability==="available"&&typeof n?.power?.isOn=="boolean"}function O0(n,e,t){let i=Wa(t),s=r0(t);s.known=i,s.on=i&&t.power.isOn;let r=s.on,{bulbMaterial:a,shadeMaterial:o,emissiveMaterials:c=[a].filter(Boolean)}=n.visual,l=new je().setRGB(s.rgb.r,s.rgb.g,s.rgb.b,Kt);return c.forEach(u=>{u.color.setHex(i?wi.lampOff:wi.unavailable),u.emissive.copy(r?l:new je(0)),u.emissiveIntensity=r&&s.brightness>.001?.2+s.brightness**.72*3.25:0}),o&&(o.color.setHex(i?12819559:9145999),o.emissive.copy(r?l:new je(0)),o.emissiveIntensity=r&&s.brightness>.001?.06+s.brightness**.72*.48:0),n.visual.light.color.copy(l),n.visual.lightState=s,s}function N0(n,e,t){let i=Rl(t),s=i!=="unknown",r=i==="open",{panelMaterial:a,frameMaterial:o,baseColor:c,closedAngle:l,openAngle:u,motionRoot:h=n.root,stateMaterials:f}=n.visual,d=h.rotation.y;return h.rotation.y=l+(r?u:0),Array.isArray(f)?f.forEach(({material:p,baseColor:x})=>{p.color.setHex(s?x:wi.unavailable)}):(a.color.setHex(s?c:wi.unavailable),o.color.setHex(s?wi.metal:7633276)),Math.abs(d-h.rotation.y)>1e-8}function C0(n,e,t){let i=!1;return n.kind==="light"&&n.visual?.type==="light"&&O0(n,e,t),n.visual?.type==="contact"&&t?.contact&&(i=N0(n,e,t)),c0(n,t,globalThis.performance?.now()??Date.now()),i}function R0(n,e){return n.size===e.size&&[...n].every(t=>e.has(t))}function Qh(n,e=Xa){return new Map(e.map((t,i)=>[t,n[i]??null]))}function ed(n,e,t=null){return!n||t&&n.provider!==t?null:n.deviceId??e.get(n.slot)??null}function F0(n,e,{bindingSlots:t=Xa,provider:i=null,providers:s=null}={}){let r=Qh(e,t),a=new Map;for(let o of n.values()){if(!o.binding)continue;let c=Jh(o.binding,{provider:i,providers:s}),l=c?ed(o.binding,r):null;if(a.set(o.id,{...o.binding,deviceId:l}),c)o.binding.slot&&!r.has(o.binding.slot)&&console.warn(\`Mikonus scene binding \${o.id} uses unknown selector slot \${o.binding.slot}.\`);else{let u=i??[...s??[]].join(", ");console.warn(\`Mikonus scene binding \${o.id} uses unsupported provider \${o.binding.provider}; the active runtime handles \${u}.\`)}}return a}function U0(n,e,{bindingSlots:t=Xa,provider:i=null,providers:s=null}={}){let r=Qh(e,t),a=new Set;for(let o of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of o[c]??[]){if(!Jh(l.binding,{provider:i,providers:s}))continue;let u=ed(l.binding,r);u&&a.add(u)}return a}function B0(n,e,{bindingSlots:t=Xa,provider:i=null,providers:s=null}={}){let r=Qh(e,t),a=[];for(let o of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of o[c]??[]){if(!Jh(l.binding,{provider:i,providers:s}))continue;let u=ed(l.binding,r);u&&a.push({...l.binding,deviceId:u})}return a}function k0(n,e,t,i){return!n||typeof n.id!="string"||!e.has(n.id)?!1:(i.set(n.id,n),t.has(n.id))}function I0(n,e,t,i){if(!e?.deviceId||!t)return;let s=null;t.missing?s="device is missing":t.availability!=="available"?s="device is unavailable":n.kind==="light"&&!Cw(t)?s="power state is missing":n.visual?.type==="contact"&&e.capability==="alarm_contact"&&!t.contact?s="contact state is missing":n.kind==="light"&&!Wa(t)?s="power state is unknown":n.visual?.type==="contact"&&(t.contact||e.capability==="alarm_contact")&&Rl(t)==="unknown"&&(s="contact state is unknown");let r=\`\${n.id}:\${e.deviceId}:\${s}\`;!s||i.has(r)||(i.add(r),console.warn(\`Mikonus binding \${n.id} is neutral because \${s}.\`,t))}function Al(n,e,t,i){let s=[...e.values()].filter(h=>h.elementType==="door"||h.elementType==="window").map(h=>t.get(h.id)).filter(h=>h&&(h.capability==="alarm_contact"||i.get(h.deviceId)?.contact)),r=s.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>Rl(h)!=="unknown"),a=r.filter(({state:h})=>Rl(h)==="open").length,o;if(r.length===s.length&&s.length>0&&a===0)o="Alles geschlossen";else if(a>0){let h=r.length<s.length?" \\xB7 Status unvollst\\xE4ndig":"";o=\`\${a} offen\${h}\`}else s.length===0||s.every(h=>!h.deviceId)?o="Kontakte nicht zugeordnet":o="Kontaktstatus unvollst\\xE4ndig";let c=[...e.values()].filter(h=>h.kind==="light").map(h=>t.get(h.id)).filter(Boolean),l=c.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>Wa(h)),u="Licht nicht zugeordnet";if(l.length>0){let h=l.filter(({state:f})=>f.power.isOn).length;u=\`\${h} \${h===1?"Licht":"Lichter"} an\`,l.length<c.length&&(u+=" \\xB7 Status unvollst\\xE4ndig")}else c.some(h=>h.deviceId)&&(u="Lichtstatus unbekannt");n.textContent=\`\${o} \\xB7 \${u}\`}function Pw(n,{sceneLoad:e=!1}={}){console.error(e?"Mikonus dashboard scene could not be loaded":"Mikonus 3D initialization failed",n);let t=document.getElementById("error");if(!t)return;let i=t.querySelector("strong"),s=t.querySelector("span");e&&(i&&(i.textContent="Mikonus 3D"),s&&(s.textContent="Scene could not be loaded.")),t.hidden=!1}async function td({container:n,sceneSource:e,deviceRuntime:t,host:i,options:s={},signal:r=s.signal}){let a=new Ja(r),o=()=>a.dispose();a.defer(()=>t?.dispose?.());try{if(a.check(),window.addEventListener("pagehide",o,{once:!0}),a.defer(()=>window.removeEventListener("pagehide",o)),typeof e?.loadScene!="function")throw new TypeError("Dashboard viewer requires a SceneSource with loadScene().");if(typeof t?.loadStates!="function"||typeof t?.subscribe!="function"||typeof t?.execute!="function")throw new TypeError("Dashboard viewer requires a DeviceRuntime.");if(!i||typeof i.getSettings!="function"||typeof i.readTheme!="function")throw new TypeError("Dashboard viewer requires a HostAdapter.");let c=Iw(t);if(c.length===0)throw new TypeError("Dashboard DeviceRuntime requires at least one provider id.");let l=s.summaryElement??document.getElementById("floor-summary"),u=s.floorLabel??document.getElementById("floor-label"),h=s.floorSelectorElement??document.getElementById("floor-selector"),f=s.statusHeader??document.querySelector(".status-header"),d=s.sceneShell??n?.closest(".scene-shell");if(!n||!l||!u||!h||!f||!d)throw new Error("Widget container is missing.");let p=(G,xe)=>i.translate?.(G,xe)??xe,x=i.getSettings(),m=Va(s.timeOfDay),g=kh({mode:x.themeMode,timeOfDay:m,...i.readTheme()}),w=Vh({width:d.clientWidth,height:d.clientHeight,devicePixelRatio:window.devicePixelRatio});Gh(w,{rootElement:document.documentElement,shellElement:d}),d.classList.toggle("camera-locked",x.cameraLocked);let E=Hl({container:n,sceneShell:d});a.defer(()=>E.dispose()),E.setEnvironment(g);let y=async(G={})=>{let xe=await a.wait(e.loadScene({...G,signal:a.signal}));return a.check(),Ed(xe)},T;try{T=await y(),a.check()}catch(G){throw G.dashboardSceneLoad=!0,G}let b=new il({alpha:!0,antialias:!0,powerPreference:"high-performance"});a.defer(()=>b.forceContextLoss()),a.defer(()=>b.dispose()),a.defer(()=>b.domElement.remove()),b.domElement.classList.add("mikonus-renderer-canvas"),b.setClearColor(0,0),D0(b),bl(g,{renderer:b,rootElement:document.documentElement});let C=Kh(b,i.location??window.location);s.onEnvironmentChange?.(g),a.check(),dm(b),fm(b,x.shadowsActive),b.setPixelRatio(w.renderPixelRatio),b.domElement.setAttribute("aria-label",p("deviceDetails.sceneLabel","Rotate and zoom the Mikonus floor; tap a light or hold a device for details")),b.domElement.setAttribute("tabindex","0"),n.appendChild(b.domElement);let v=new en(Sr,1,.1,100);v.position.set(8.5,12.5,10.5);let S=new ol(v,b.domElement);a.defer(()=>S.dispose());let P=vl(b.domElement);a.defer(P),S.target.set(0,.55,0),S.enableDamping=!1,S.enablePan=!1,S.rotateSpeed=.65,S.zoomSpeed=.8,S.minDistance=5,S.maxDistance=100,S.minPolarAngle=ut.degToRad(18),S.maxPolarAngle=1.28,S.zoomToCursor=!0,S.enabled=!x.cameraLocked,S.update();let I=i.getSelectedDeviceIds?.()??[],O={bindingSlots:i.bindingSlots??Xa,providers:new Set(c)},U=new Map,q=new Set,R=null,H=null,z=null,k=new Set,$=null,se=null,ae=null,ee=0,we=!1,Ke=!1,We=!1,K=x.shadowsActive,ue=()=>{};a.defer(()=>{ee&&window.cancelAnimationFrame(ee),H?.dispose(),H=null,R=null,z=null,k.clear(),U.clear()});let ne=()=>{a.disposed||ee||!R||(ee=window.requestAnimationFrame(G=>{if(ee=0,R){let xe=l0(R.entities,G),ye=R.stateVisuals?.step(G)===!0;xe&&x.shadowsActive&&(K=!0),R.stateVisuals?.didMoveRobot()===!0&&x.shadowsActive&&(K=!0),x.shadowsActive&&K&&(b.shadowMap.needsUpdate=!0),b.render(R.scene,v),se?.layout(v,b.domElement),K=!1,(xe||ye)&&ne()}}))},Ie=G=>{K=x.shadowsActive,x.shadowsActive&&R&&(R.shadowInvalidationReasons??=new Set,R.shadowInvalidationReasons.add(G)),ne()},Xe=G=>{C&&Kh(b),E.setEnvironment(G),s.onEnvironmentChange?.(G)},ze=G=>(a.disposed||(m=Va(G),g=zh(g,i.readTheme(),{mode:x.themeMode,timeOfDay:m,renderer:b,rootElement:document.documentElement,runtimes:H?.cachedRuntimes??[],afterApply:Xe,requestRender:ne})),g),dt=()=>{if(a.disposed)return!1;let G=Vh({width:d.clientWidth,height:d.clientHeight,devicePixelRatio:window.devicePixelRatio}),xe=!i0(w,G);return w=G,xe&&Gh(w,{rootElement:document.documentElement,shellElement:d}),ae?.layout(Ml(w,f.clientWidth)),xe},Ye=G=>{a.disposed||(g=zh(g,G,{mode:x.themeMode,timeOfDay:m,renderer:b,rootElement:document.documentElement,runtimes:H?.cachedRuntimes??[],afterApply:Xe,requestRender:ne}))};ue=i.subscribeTheme?.(Ye)??(()=>{}),a.defer(ue),a.check();let ie=()=>{if(!R?.cameraFit)return;let G=S.target.distanceTo(R.cameraFit.target);Oh(v,S.target,R.cameraFit.radius+G),Ps(v,R.architectureCenterPoints)},oe=G=>G.schemaVersion!==2?null:i.readFloor?.(G.sceneId)??null,re=(G,xe)=>{G.schemaVersion===2&&i.writeFloor?.(G.sceneId,xe)},ge=()=>{!z?.sceneId||!R?.floorId||i.writeCamera?.(z.sceneId,R.floorId,{position:v.position.toArray(),target:S.target.toArray(),fov:v.fov,zoom:v.zoom,minDistance:S.minDistance,maxDistance:S.maxDistance,userAdjustedView:We})},ve=()=>{!z?.sceneId||!R?.floorId||i.removeCamera?.(z.sceneId,R.floorId)},Re=new fl({camera:v,controls:S,delayMs:x.autoReturnDelayMs,isBlocked:()=>x.cameraLocked,requestRender:ne,updateClipping:ie,onComplete:()=>{We=!1,ve(),ne()}});a.defer(()=>Re.dispose());let Le=()=>{if(!R)return;let G=Math.max(n.clientWidth,1),xe=Math.max(n.clientHeight,1),ye=Am(v,R.architectureFitPoints,R.sceneBoundsPoints,G/xe,Rw,{centeringPoints:R.architectureCenterPoints,targetPoints:R.architectureCenterPoints,allowQuarterTurn:!1});ye&&(R.cameraFit={distance:ye.distance,radius:ye.radius,target:ye.target.clone()},S.target.copy(ye.target),S.minDistance=ye.minDistance,S.maxDistance=ye.maxDistance,S.update(),Re.setHomeView({position:v.position,target:S.target})),ne()},qe=(G,xe)=>{We=!1,Le();let ye=i.readCamera?.(G?.sceneId,xe);return ye?(v.position.fromArray(ye.position),v.fov=ye.fov,v.zoom=ye.zoom,S.target.fromArray(ye.target),S.minDistance=ye.minDistance,S.maxDistance=ye.maxDistance,v.lookAt(S.target),S.update(),We=ye.userAdjustedView,ie(),We&&Re.schedule(),ne(),!0):!1},$e=()=>{if(a.disposed)return;dt();let G=Math.max(n.clientWidth,1),xe=Math.max(n.clientHeight,1);if(b.setPixelRatio(w.renderPixelRatio),b.setSize(G,xe,!1),R&&!We)Le();else if(R){let ye=Cm(v,G/xe,{worldPoints:R.architectureFitPoints,centeringPoints:R.architectureCenterPoints,target:S.target});ye.expandedForClipping&&(S.maxDistance=Math.max(S.maxDistance,ye.distance*1.05),S.update()),ne()}},L=()=>{we=!0,Ke=!1},mt=()=>{we&&(Ke||Re.cancel(),Ke=!0,We=!0),ie(),ne()},it=()=>{we=!1,Ke&&(ge(),Re.schedule()),Ke=!1};a.defer(()=>{S.removeEventListener("start",L),S.removeEventListener("change",mt),S.removeEventListener("end",it)}),S.addEventListener("start",L),S.addEventListener("change",mt),S.addEventListener("end",it);let A=new ResizeObserver($e);a.defer(()=>A.disconnect()),A.observe(n);let _=({scene:G,metadata:xe},ye)=>{let et=Em({...G,activeFloorId:ye});try{mm(et.lighting,x.ambientBrightnessFactor),bl(g,{runtimes:[et]}),xm(et.lighting,et.entities,x.shadowIntensityFactor);let Qe=Fa(et.sceneRoot),wt=Fa(et.sceneRoot,et.entities),Jn=wt.map(Nr=>Nr.clone()),Ci=F0(et.entities,I,O),as=new Set([...Ci.values()].map(Nr=>Nr.deviceId).filter(Boolean)),kn=T0({activeFloor:et.activeFloor,bindings:Ci,entities:et.entities,sceneRoot:et.sceneRoot});return{...et,description:G,floorId:ye,bindings:Ci,metadata:xe,architectureCenterPoints:Qe,architectureFitPoints:wt,sceneBoundsPoints:Jn,stateVisuals:kn,runtimeDeviceIds:as,warnedBindings:new Set}}catch(Qe){throw dl(et.scene),Qe}},B=G=>{let xe=G.activeSmartLights??new Set,ye=!1;for(let et of G.entities.values()){let Qe=G.bindings.get(et.id),wt=U.get(Qe?.deviceId);Qe&&I0(et,Qe,wt,G.warnedBindings),ye=C0(et,Qe,wt)||ye}return ye&&(G.architectureCenterPoints=Fa(G.sceneRoot)),G.activeSmartLights=Ch(G.entities),G.stateVisuals.sync(U),Th(G.lighting,G.entities,x.shadowsActive),Al(l,G.entities,G.bindings,U),{contactGeometryChanged:ye,lightShadowSelectionChanged:!R0(xe,G.activeSmartLights)}},V=(G=R)=>{G&&se?.sync({entities:G.entities,bindings:G.bindings,statesByDeviceId:U})},j=()=>{let G=d.getBoundingClientRect(),xe=f.getBoundingClientRect(),ye=Math.max(0,Math.ceil(xe.bottom-G.top+4));d.style.setProperty("--scene-header-height",\`\${ye}px\`)},le=(G=z,xe=R?.floorId)=>{let ye=G?.schemaVersion===2&&G.floors.length>1;u.hidden=ye,ae?.update({floors:ye?G.floors:[],activeFloorId:xe,availableWidth:Ml(w,f.clientWidth)}),j()},he=()=>({position:v.position.clone(),quaternion:v.quaternion.clone(),aspect:v.aspect,fov:v.fov,zoom:v.zoom,near:v.near,far:v.far,target:S.target.clone(),minDistance:S.minDistance,maxDistance:S.maxDistance,cameraFit:R?.cameraFit,homeView:Re.homeView&&{position:Re.homeView.position.clone(),target:Re.homeView.target.clone()},userAdjustedView:We}),Z=(G,xe)=>{v.position.copy(G.position),v.quaternion.copy(G.quaternion),v.aspect=G.aspect,v.fov=G.fov,v.zoom=G.zoom,v.near=G.near,v.far=G.far,v.updateProjectionMatrix(),S.target.copy(G.target),S.minDistance=G.minDistance,S.maxDistance=G.maxDistance,xe&&(xe.cameraFit=G.cameraFit),G.homeView?Re.setHomeView(G.homeView):Re.homeView=null,We=G.userAdjustedView},J=(G,{sceneUpdate:xe=!1}={})=>{a.check(),$?.close(),Re.cancel(),ge(),a.check();let ye,et;try{ye=new pl({description:G.scene,initialFloorId:xe?Pm(G.scene,z?.sceneId,R?.floorId):oe(G.scene),createRuntime:kn=>_(G,kn),disposeRuntime:kn=>dl(kn.scene)}),et=ye.activate().runtime,B(et)}catch(kn){throw ye?.dispose(),kn}let Qe=H,wt=R,Jn=z,Ci=k,as=he();H=ye,R=et,z=G.scene,k=U0(G.scene,I,O);try{t.configureBindings?.(B0(G.scene,I,O)),a.check(),Ie("sceneChanged"),u.textContent=et.activeFloor.name,le(G.scene,et.floorId),qe(G.scene,et.floorId),V(et),re(G.scene,et.floorId),a.check()}catch(kn){throw a.disposed?(Qe?.dispose(),ye.dispose(),H=null,R=null,a.signal.reason):(H=Qe,R=wt,z=Jn,k=Ci,Z(as,wt),u.textContent=wt?.activeFloor.name??"\\u2013",wt&&Al(l,wt.entities,wt.bindings,U),V(wt),le(Jn,wt?.floorId),ye.dispose(),ne(),kn)}return Qe?.dispose(),et},pe=G=>{if(a.disposed||!R||!k0(G,k,R.runtimeDeviceIds,U))return;let ye=R.activeSmartLights??new Set,et=!1;for(let Qe of R.entities.values()){let wt=R.bindings.get(Qe.id);wt?.deviceId===G.id&&(I0(Qe,wt,G,R.warnedBindings),et=C0(Qe,wt,G)||et)}et&&(R.architectureCenterPoints=Fa(R.sceneRoot),Ps(v,R.architectureCenterPoints)),R.activeSmartLights=Ch(R.entities),R.stateVisuals.sync(U),Th(R.lighting,R.entities,x.shadowsActive),Al(l,R.entities,R.bindings,U),$?.updateState(G.id,G),V(),et?Ie("contactGeometryChanged"):R0(ye,R.activeSmartLights)||Ie("lightStateChanged"),ne()},De=async G=>{a.check();let xe=[...G.runtimeDeviceIds];if(xe.length!==0)try{let ye=await a.wait(t.loadStates(xe,{signal:a.signal}));if(a.check(),R!==G||!Array.isArray(ye))return;ye.forEach(Qe=>{Qe&&typeof Qe.id=="string"&&U.set(Qe.id,Qe)});let et=B(G);V(G),et.contactGeometryChanged?(Ps(v,G.architectureCenterPoints),Ie("contactGeometryChanged")):et.lightShadowSelectionChanged&&Ie("lightStateChanged"),ne()}catch(ye){if(a.disposed)throw a.signal.reason;console.warn("Could not load the configured dashboard device states.",ye)}},_e=async G=>{if(a.disposed||!H||!z)return null;if(G===H.activeFloorId)return le(z,G),R;$?.close(),Re.cancel(),ge(),a.check();let xe=R,ye=H.activeFloorId,et=he(),Qe;try{Qe=H.activate(G).runtime,B(Qe),R=Qe,Ie("floorChanged"),u.textContent=Qe.activeFloor.name,le(z,G),qe(z,G),V(Qe),re(z,G),a.check()}catch(wt){throw a.disposed?a.signal.reason:(ye&&H.activate(ye),R=xe,Z(et,xe),u.textContent=xe?.activeFloor.name??"\\u2013",xe&&Al(l,xe.entities,xe.bindings,U),V(xe),le(z,ye),ne(),wt)}return await De(Qe),Qe},de=Promise.resolve(),Be=async G=>{if(a.disposed||typeof G?.revision=="string"&&G.revision===R?.metadata?.revision)return;let xe=await y({allowFallback:!1});if(a.check(),xe.metadata.revision===R?.metadata?.revision)return;let ye=J(xe,{sceneUpdate:!0});await De(ye)},Ve=G=>{de=de.then(()=>Be(G)).catch(xe=>{a.disposed||console.error("Runtime dashboard scene reload failed; keeping the current scene.",xe)})},Je=G=>{de=de.then(()=>_e(G)).catch(xe=>{a.disposed||(console.error("Floor switch failed; keeping the current floor.",xe),le())})};ae=new gl({host:h,translate:p,onSelect:Je}),a.defer(()=>ae.dispose());let N=new ResizeObserver(()=>{a.disposed||(ae?.layout(Ml(w,f.clientWidth)),j())});a.defer(()=>N.disconnect()),N.observe(f),j();let fe=t.subscribe(pe);a.defer(fe),a.check();let Q=e.subscribe?.(Ve)??(()=>{});a.defer(Q),a.check();let me=new Ss,Me=new ce,te=null,Ae=null,Pe=()=>{let G=te?[...te.activePointers.keys()]:[];te?.reset(),Ae=null;for(let xe of G)try{b.domElement.hasPointerCapture?.(xe)&&b.domElement.releasePointerCapture(xe)}catch{}},At=async(G,xe,{directLightTap:ye=!1}={})=>{if(a.disposed)return;let et=R?.entities.get(G),Qe=R?.bindings.get(G),wt=U.get(Qe?.deviceId),Jn=!!(et&&Qe?.deviceId);if(!(ye?Jn&&et.kind==="light"&&Wa(wt)&&xe.type===A0.SET_POWER:Jn&&Ti(wt,xe))){console.warn(\`The 3D object \${G} cannot execute \${xe.type} because its state or control is unavailable.\`);return}if(!q.has(Qe.deviceId)){q.add(Qe.deviceId),$?.setBusy(Qe.deviceId,!0),i.feedback?.();try{await t.execute(Qe.deviceId,xe,Qe)}catch(as){console.warn(\`Could not execute \${xe.type} for \${G}.\`,as)}finally{if(a.disposed)return;q.delete(Qe.deviceId),$?.setBusy(Qe.deviceId,!1)}}},vt=G=>{let xe=R?.bindings.get(G),ye=U.get(xe?.deviceId);Wa(ye)&&At(G,{type:A0.SET_POWER,value:!ye.power.isOn},{directLightTap:!0})},pn=new Ba({host:E.popupHost,onCommand:At,translate:p});a.defer(()=>pn.dispose());let Ln=s.createDeviceDetailsAdapter?.({overlay:pn})??new ka({overlay:pn});$=new xl({adapters:Object.fromEntries(c.map(G=>[G,Ln])),onOpenChange:G=>{G&&Pe(),d.classList.toggle("device-details-open",G),se?.setSuppressed(G),S.enabled=G?!1:!x.cameraLocked,G?Re.cancel():ne()}}),a.defer(()=>$.dispose()),a.check();let ja=(G,xe,ye)=>Dm({camera:v,canvas:b.domElement,clientX:G,clientY:xe,pickables:ye,pointer:Me,raycaster:me,scene:R?.scene}),Dr=G=>{if(a.disposed)return!1;let xe=R?.bindings.get(G),ye=Om({entityId:G,binding:xe,state:U.get(xe?.deviceId)});return!ye||!$?.open(ye)?!1:(i.feedback?.(),!0)};se=new Ha({host:E.markerHost,onOpenDetails:Dr,onTogglePower:vt,translate:p}),a.defer(()=>se.dispose()),te=new Er({onLongPress:({clientX:G,clientY:xe})=>{let ye=ja(G,xe,R?.devicePickables??[]);return!ye||(Ae&&(Z(Ae,R),Ae=null,Ke=!1,we=!1,ie(),ne()),!Dr(ye.sceneObjectId))?!1:(window.getSelection?.()?.removeAllRanges(),!0)}}),a.defer(()=>te.dispose());let Lr=G=>{G.cancelable&&G.preventDefault(),te.activePointers.size===0&&(Ae=he()),te.pointerDown(G)},Ds=G=>{te.pointerMove(G)},Za=G=>{let xe=te.pointerUp(G);if(Ae=null,!xe)return;let ye=ja(xe.clientX,xe.clientY,R?.pickables??[]);ye&&vt(ye.sceneObjectId)},rs=G=>{te.pointerCancel(G),Ae=null},Or=G=>G.preventDefault();a.defer(()=>{b.domElement.removeEventListener("pointerdown",Lr,!0),b.domElement.removeEventListener("pointermove",Ds,!0),b.domElement.removeEventListener("pointerup",Za,!0),b.domElement.removeEventListener("pointercancel",rs,!0),b.domElement.removeEventListener("lostpointercapture",rs,!0),b.domElement.removeEventListener("contextmenu",Or)}),b.domElement.addEventListener("pointerdown",Lr,!0),b.domElement.addEventListener("pointermove",Ds,!0),b.domElement.addEventListener("pointerup",Za,!0),b.domElement.addEventListener("pointercancel",rs,!0),b.domElement.addEventListener("lostpointercapture",rs,!0),b.domElement.addEventListener("contextmenu",Or);let Kn=J(T);$e(),await De(Kn),a.check();let Ls=i.getInitialDetailsDeviceId?.();if(Ls){let G=[...Kn.bindings].find(([,xe])=>xe.deviceId===Ls);G&&Dr(G[0])}return Object.freeze({dispose:o,destroy:o,getEnvironment:()=>g,requestRender:ne,setTimeOfDay:ze})}catch(c){throw o(),c.name!=="AbortError"&&Pw(c,{sceneLoad:c.dashboardSceneLoad===!0}),c}}var Dw="mikonus.camera-view-v2";function nd(n,e,t){return[Dw,typeof t=="string"&&t?t:"default",n,e].map(s=>encodeURIComponent(String(s))).join(":")}function z0(n){return Array.isArray(n)&&n.length===3&&n.every(Number.isFinite)}function H0(n){return!n||typeof n!="object"||!z0(n.position)||!z0(n.target)||!Number.isFinite(n.fov)||n.fov<=0||n.fov>=180||!Number.isFinite(n.zoom)||n.zoom<=0||!Number.isFinite(n.minDistance)||n.minDistance<=0||!Number.isFinite(n.maxDistance)||n.maxDistance<n.minDistance?null:{position:[...n.position],target:[...n.target],fov:n.fov,zoom:n.zoom,minDistance:n.minDistance,maxDistance:n.maxDistance,userAdjustedView:n.userAdjustedView===!0}}var qa=class{constructor({storage:e,widgetInstanceId:t}){this.storage=e,this.widgetInstanceId=t}read(e,t){try{let i=this.storage?.getItem(nd(e,t,this.widgetInstanceId));return i?H0(JSON.parse(i)):null}catch(i){return console.debug("Could not read the preserved floor camera view.",i),null}}write(e,t,i){let s=H0(i);if(!s)return!1;try{return this.storage?.setItem(nd(e,t,this.widgetInstanceId),JSON.stringify(s)),!0}catch(r){return console.debug("Could not preserve the floor camera view.",r),!1}}remove(e,t){try{this.storage?.removeItem(nd(e,t,this.widgetInstanceId))}catch(i){console.debug("Could not clear the preserved floor camera view.",i)}}};var V0=Object.freeze({off:0,"30s":3e4,"60s":6e4,"120s":12e4}),ss=Object.freeze({themeMode:"auto",ambientBrightnessPercent:100,shadowsEnabled:!0,shadowIntensityPercent:100,cameraLocked:!1,autoReturn:"off"});function id(n={}){(!n||typeof n!="object")&&(n={});let e=["auto","light","dark"].includes(n.themeMode)?n.themeMode:ss.themeMode,t=typeof n.ambientBrightnessPercent=="number"?n.ambientBrightnessPercent:ss.ambientBrightnessPercent,i=Number.isFinite(t)?Math.min(Math.max(t,0),150):ss.ambientBrightnessPercent,s=typeof n.shadowIntensityPercent=="number"?n.shadowIntensityPercent:ss.shadowIntensityPercent,r=Number.isFinite(s)?Math.min(Math.max(s,0),100):ss.shadowIntensityPercent,a=typeof n.shadowsEnabled=="boolean"?n.shadowsEnabled:ss.shadowsEnabled,o=Object.prototype.hasOwnProperty.call(V0,n.autoReturn)?n.autoReturn:ss.autoReturn;return{themeMode:e,ambientBrightnessPercent:i,ambientBrightnessFactor:i/100,shadowsEnabled:a,shadowIntensityPercent:r,shadowIntensityFactor:r/100,shadowsActive:a&&r>0,cameraLocked:typeof n.cameraLocked=="boolean"?n.cameraLocked:ss.cameraLocked,autoReturn:o,autoReturnDelayMs:V0[o]}}function sd(n){if(typeof n!="function")return"light";try{return n("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"light"}}var Il=class{constructor(){this.values=new Map}getItem(e){return this.values.get(e)??null}setItem(e,t){this.values.set(e,String(t))}removeItem(e){this.values.delete(e)}},Ya=class{constructor({settings:e={},translations:t={},initialDetailsDeviceId:i=null,instanceId:s="browser-host",windowObject:r=window,storage:a=new Il}={}){this.window=r,this.location=r.location,this.settings=id(e),this.translations=t,this.initialDetailsDeviceId=i,this.storage=a,this.cameraViewStore=new qa({storage:a,widgetInstanceId:s}),this.instanceId=s}translate(e,t){return this.translations[e]??t}getSettings(){return this.settings}getSelectedDeviceIds(){return[]}getInitialDetailsDeviceId(){return this.initialDetailsDeviceId}readTheme(){return{hostTheme:null,systemTheme:sd(this.window.matchMedia?.bind(this.window))}}subscribeTheme(e){let t=this.window.matchMedia?.("(prefers-color-scheme: dark)"),i=()=>e(this.readTheme());return typeof t?.addEventListener=="function"?t.addEventListener("change",i):t?.addListener?.(i),i(),()=>{typeof t?.removeEventListener=="function"?t.removeEventListener("change",i):t?.removeListener?.(i)}}feedback(){}readFloor(e){return this.storage.getItem(ml(e,this.instanceId))}writeFloor(e,t){this.storage.setItem(ml(e,this.instanceId),t)}readCamera(e,t){return this.cameraViewStore.read(e,t)}writeCamera(e,t,i){return this.cameraViewStore.write(e,t,i)}removeCamera(e,t){this.cameraViewStore.remove(e,t)}};var G0=ei(ts()),{DEVICE_COMMAND:V2}=G0.default;var rd=ei(Bl()),$a=class{constructor({url:e,transformScene:t=s=>s,load:i=rd.default.loadDashboardScene}){this.url=e,this.transformScene=t,this.load=i}async loadScene({signal:e}={}){e?.throwIfAborted();let t=await this.load(this.url,{signal:e});e?.throwIfAborted();let i=this.transformScene(t),{activeFloorId:s,...r}=i,a=rd.default.validateDashboardScene(r);return{scene:a,metadata:{schemaVersion:a.schemaVersion,sceneId:a.sceneId,revision:\`\${a.sceneId}:static\`,source:"static"}}}subscribe(){return()=>{}}};var W0=ei(ts()),K2=W0.default.DEVICE_COMMAND;var Pl=class extends Ya{constructor({themeSource:e,...t}){super(t),this.themeSource=e}readTheme(){return{...super.readTheme(),hostTheme:this.themeSource?.read()??null}}subscribeTheme(e){let t=()=>e(this.readTheme()),i=this.themeSource?.subscribe(t)??(()=>{}),s=super.subscribeTheme(t);return()=>{i(),s()}}};document.addEventListener("mikonus-connect",async n=>{let{runtime:e,scene:t,sceneSource:i,themeSource:s,storage:r,signal:a,initializeRuntime:o,onReady:c,onError:l}=n.detail;try{o(Ti);let u=!0,h=i?{async loadScene(d){let p=await(u?i.waitUntilReady(d):i.loadScene(d));return u=!1,p},subscribe:d=>i.subscribe(d)}:new $a({url:"reference",load:async()=>t}),f=await td({container:document.getElementById("viewport"),sceneSource:h,deviceRuntime:e,host:new Pl({instanceId:"ha-card",storage:r,themeSource:s}),signal:a,options:{timeOfDay:"auto",sceneShell:document.getElementById("shell"),statusHeader:document.getElementById("header"),summaryElement:document.getElementById("summary"),floorLabel:document.getElementById("floor-label"),floorSelectorElement:document.getElementById("floor-selector")}});c(f)}catch(u){l(u)}},{once:!0});window.frameElement.dispatchEvent(new CustomEvent("mikonus-frame-ready"));})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
`;var ee=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;font:14px system-ui,sans-serif;color:#222;background:transparent}
#shell{position:relative;display:flex;flex-direction:column;width:100%;height:100%}
#header{position:absolute;inset:0 0 auto;z-index:4;background:transparent;pointer-events:none;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:12px;min-height:56px}
#header>*{pointer-events:auto}
#viewport{position:relative;flex:1;width:100%;min-height:180px;overflow:hidden}
#viewport canvas{display:block;width:100%;height:100%}
#summary{color:var(--dashboard-ui-text-primary);flex:0 0 auto;margin:0;padding:4px 12px}button,select,input{font:inherit}button,select{min-height:44px}
[hidden]{display:none!important}#error{padding:12px}
</style></head><body><main id="shell"><header id="header"><span id="floor-label"></span><div id="floor-selector"></div></header><div id="viewport"></div><p id="summary"></p></main><p id="error" hidden></p></body></html>`;function W({container:i,runtime:e,scene:t,sceneSource:a,themeSource:n,storage:r,onReady:s,onError:o}){let l=document.createElement("iframe");l.title="Mikonus 3D Dashboard",l.style.cssText="display:block;width:100%;height:100%;border:0";let b=null,c=!1,d=new AbortController,h=URL.createObjectURL(new Blob([G],{type:"text/javascript"})),v=()=>{if(!c){c=!0,d.abort(),l.removeEventListener("mikonus-frame-ready",p),l.removeEventListener("load",g);try{b?.dispose()}finally{b=null,e.dispose(),l.remove(),URL.revokeObjectURL(h)}}},f=u=>{c||(v(),o(u))},p=()=>{if(!c)try{l.contentDocument.dispatchEvent(new l.contentWindow.CustomEvent("mikonus-connect",{detail:{runtime:e,scene:t,sceneSource:a,themeSource:n,storage:r,signal:d.signal,initializeRuntime:u=>e.configureCommandSupport(u),onReady:u=>{if(URL.revokeObjectURL(h),c){u.dispose();return}b=u,s()},onError:f}}))}catch(u){f(u)}},g=()=>{if(!c)try{let u=l.contentDocument.createElement("script");u.src=h,u.onerror=()=>f(new Error("Renderer script could not be loaded. Check the browser content policy.")),l.contentDocument.body.append(u)}catch(u){f(u)}};return l.addEventListener("load",g,{once:!0}),l.addEventListener("mikonus-frame-ready",p,{once:!0}),l.srcdoc=ee,i.append(l),{dispose:v}}document.querySelector("home-assistant")&&await customElements.whenDefined("home-assistant");var P="mikonus-3d-card";customElements.get(P)||customElements.define(P,H(W));window.customCards??=[];window.customCards.some(i=>i.type===P)||window.customCards.push({type:P,name:"Mikonus 3D",preview:!1,description:"Mikonus Dashboard Scene v2 mit Home Assistant Ger\xE4ten."});
