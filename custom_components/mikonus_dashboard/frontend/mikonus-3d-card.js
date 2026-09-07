var w="homeAssistant",E=/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/,W=new Set(["light","switch","cover","climate","lock","vacuum","binary_sensor"]),oe={light:["power","brightness","color","colorTemperature"],switch:["power"],cover:["position","coverMovement","openState"],climate:["currentTemperature","targetTemperature","humidity","hvacMode","hvacAction"],lock:["lockState"],vacuum:["startStop","cleaningState","returnToBase","batteryLevel","chargingState"],binary_sensor:["motion","occupancy","openState","smokeAlarm","waterLeak","alarm"]},le={motion:["motion","activity","motion"],occupancy:["occupancy","activity","occupancy"],presence:["occupancy","activity","presence"],opening:["contact","contact","openState"],door:["contact","contact","openState"],window:["contact","contact","openState"],smoke:["smoke","safety","smoke"],moisture:["water","safety","water"]},m=i=>typeof i=="number"&&Number.isFinite(i)?i:null,b=(i,e,t)=>m(i)===null?null:Math.max(e,Math.min(t,i)),G=i=>Array.isArray(i)?[...new Set(i.filter(e=>typeof e=="string"))].sort():[],N=(i,e,t)=>Object.hasOwn(i?.services?.[e]??{},t);function U(i){if(!i||i.provider!==w)return"unsupported provider";if(typeof i.deviceId!="string"||!E.test(i.deviceId))return"invalid entity id";if(Object.hasOwn(i,"slot"))return"HA bindings require deviceId, not slot";let e=i.deviceId.split(".")[0];return W.has(e)?oe[e].includes(i.capability)?null:"capability does not match entity domain":"unsupported domain"}function S(i,e="missing"){return{id:i,provider:w,name:null,deviceClass:null,availability:e,missing:e==="missing",power:null,light:null,contact:null,cover:null,climate:null,lock:null,cleaning:null,activity:null,safety:null,health:null,motion:null,controls:{}}}function ce(i){let e=i.hs_color;if(Array.isArray(e)&&m(e[0])!==null&&m(e[1])!==null)return{hue:b(e[0],0,360)/360,saturation:b(e[1],0,100)/100};let t=i.rgb_color;if(!Array.isArray(t)||t.length!==3||t.some(c=>m(c)===null))return null;let[r,n,a]=t.map(c=>b(c,0,255)/255),s=Math.max(r,n,a),o=Math.min(r,n,a),l=s-o;return{hue:((l===0?0:s===r?(n-a)/l%6:s===n?(a-r)/l+2:(r-n)/l+4)/6+1)%1,saturation:s===0?0:l/s}}function j(i,e,t,r=[]){if(!e)return S(i);let n=i.split(".")[0],a=S(i,"unavailable"),s=e.attributes??{};if(a.name=typeof s.friendly_name=="string"?s.friendly_name:i,a.deviceClass=n,!E.test(i)||e.entity_id!==i||!W.has(n)||!r.some(h=>!U(h))||typeof e.state!="string"||["unknown","unavailable"].includes(e.state))return a;let o=e.state;a.availability="available";let l=h=>N(t,n,h),M=Number.isInteger(s.supported_features)?s.supported_features:0,c=h=>(M&h)===h,u=a.controls;if(n==="light"||n==="switch"){if(!["on","off"].includes(o))return{...a,availability:"unavailable"};if(a.power={isOn:o==="on"},u.setPower=l("turn_on")&&l("turn_off"),n==="light"){let h=G(s.supported_color_modes),g=h.some(_=>["brightness","color_temp","hs","xy","rgb","rgbw","rgbww","white"].includes(_)),v=h.some(_=>["hs","xy","rgb","rgbw","rgbww"].includes(_)),d=m(s.min_color_temp_kelvin),f=m(s.max_color_temp_kelvin);a.light={brightness:m(s.brightness)===null?null:b(s.brightness,0,255)/255,color:ce(s),colorTemperatureKelvin:m(s.color_temp_kelvin),mode:s.color_mode==="color_temp"?"temperature":["hs","xy","rgb","rgbw","rgbww"].includes(s.color_mode)?"color":null},g&&l("turn_on")&&(u.setBrightness={min:0,max:1,step:1/255}),u.setColor=v&&l("turn_on"),h.includes("color_temp")&&d>0&&f>=d&&l("turn_on")&&(u.setColorTemperature={min:d,max:f,step:1,unit:"K"})}}else if(n==="cover")a.cover={position:m(s.current_position)===null?o==="closed"?0:null:b(s.current_position,0,100)/100,movement:["opening","closing"].includes(o)?o:["open","closed"].includes(o)?"stopped":"unknown"},u.openCover=c(1)&&l("open_cover"),u.closeCover=c(2)&&l("close_cover"),u.stopCover=c(8)&&l("stop_cover"),c(4)&&l("set_cover_position")&&(u.setCoverPosition={min:0,max:1,step:.01});else if(n==="climate"){let h=s.temperature_unit??t?.config?.unit_system?.temperature;a.climate={currentTemperature:m(s.current_temperature),targetTemperature:m(s.temperature),humidity:b(s.current_humidity,0,100),unit:["\xB0C","\xB0F"].includes(h)?h:null,mode:o,heatingActive:typeof s.hvac_action=="string"?s.hvac_action==="heating":null};let g=m(s.min_temp),v=m(s.max_temp);c(1)&&g!==null&&v!==null&&v>g&&l("set_temperature")&&a.climate.unit&&(u.setTargetTemperature={min:g,max:v,step:m(s.target_temp_step)>0?s.target_temp_step:.5,unit:a.climate.unit});let d=G(s.hvac_modes).filter(f=>["off","heat","cool","heat_cool","auto","dry","fan_only"].includes(f));d.length&&l("set_hvac_mode")&&(u.setThermostatMode={values:d.map(f=>({id:f,label:f}))})}else if(n==="lock"){a.lock={isLocked:o==="locked"?!0:o==="unlocked"?!1:null};let h=["locked","unlocked"].includes(o)&&!s.code_format;u.lock=h&&l("lock"),u.unlock=h&&l("unlock")}else if(n==="vacuum")a.cleaning={state:["cleaning","paused","returning","docked","idle","error"].includes(o)?o:"unknown",batteryPercent:b(s.battery_level,0,100),error:o==="error"?typeof s.error=="string"?s.error:"Device error":null},a.cleaning.batteryPercent!==null&&(a.health={batteryPercent:a.cleaning.batteryPercent,alerts:[]}),u.startCleaning=c(8192)&&l("start"),u.pauseCleaning=c(4)&&l("pause"),u.stopCleaning=c(8)&&l("stop"),u.returnToBase=c(16)&&l("return_to_base");else if(n==="binary_sensor"){let h=le[s.device_class];if(!h||!["on","off"].includes(o))return{...a,availability:"unavailable"};let[g,v,d]=h,f=d==="presence"?["occupancy"]:d==="smoke"?["smokeAlarm","alarm"]:d==="water"?["waterLeak","alarm"]:[d];if(!r.some(_=>f.includes(_.capability)))return{...a,availability:"unavailable"};a.deviceClass=g,v==="contact"?a.contact={state:o==="on"?"open":"closed"}:a[v]=[{id:d,baseId:d,active:o==="on",label:a.name}]}return a}function X(i,e,t,r){let n=i.id.split(".")[0],s=e?.type==="togglePower"?{type:"setPower",value:!i.power?.isOn}:e;if(typeof r!="function"||!r(i,s)||e?.type==="setCoverPosition"&&(e.value<0||e.value>1))throw new Error(`Unsupported action ${e?.type??"(missing)"} for ${i.id}.`);let o,l={entity_id:i.id};switch(e.type){case"togglePower":o="toggle";break;case"setPower":o=e.value?"turn_on":"turn_off";break;case"setBrightness":o="turn_on",l.brightness=Math.round(e.value*255);break;case"setColor":o="turn_on",l.hs_color=[e.value.hue*360,e.value.saturation*100];break;case"setColorTemperature":o="turn_on",l.color_temp_kelvin=Math.round(e.value);break;case"openCover":o="open_cover";break;case"closeCover":o="close_cover";break;case"stopCover":o="stop_cover";break;case"setCoverPosition":o="set_cover_position",l.position=Math.round(e.value*100);break;case"setTargetTemperature":o="set_temperature",l.temperature=e.value;break;case"setThermostatMode":o="set_hvac_mode",l.hvac_mode=e.value;break;case"lock":o="lock";break;case"unlock":o="unlock";break;case"startCleaning":o="start";break;case"pauseCleaning":o="pause";break;case"stopCleaning":o="stop";break;case"returnToBase":o="return_to_base";break;default:throw new Error("Unsupported action.")}if(!N(t,n,o))throw new Error(`Service ${n}.${o} is unavailable.`);return{domain:n,service:o,data:l}}var T=class{provider=w;bindings=new Map;states=new Map;listeners=new Set;disposed=!1;constructor(e=null,{supportsCommand:t=null}={}){this.hass=e,this.supportsCommand=t}configureCommandSupport(e){if(!this.disposed){if(typeof e!="function")throw new TypeError("A neutral command validator is required.");this.supportsCommand=e}}configureBindings(e){if(this.disposed)return;let t=new Map;for(let r of e??[])U(r)||t.set(r.deviceId,[...t.get(r.deviceId)??[],{...r}]);this.bindings=t;for(let r of this.states.keys())t.has(r)||this.states.delete(r);this.updateHass(this.hass)}normalize(e){let t=this.bindings.get(e);return t?j(e,this.hass?.states?.[e],this.hass,t):S(e,"unavailable")}updateHass(e){if(!this.disposed){this.hass=e;for(let t of this.bindings.keys()){let r=this.normalize(t);if(JSON.stringify(r)!==JSON.stringify(this.states.get(t))){this.states.set(t,r);for(let n of this.listeners)n(structuredClone(r))}}}}async loadStates(e){return this.disposed?[]:e.map(t=>structuredClone(this.states.get(t)??this.normalize(t)))}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),()=>this.listeners.delete(e))}async execute(e,t){if(this.disposed)throw new Error("Home Assistant runtime has been disposed.");if(!this.bindings.has(e))throw new Error("Entity is not bound to this scene.");let r=this.normalize(e),{domain:n,service:a,data:s}=X(r,t,this.hass,this.supportsCommand);if(typeof this.hass?.callService!="function")throw new Error("Home Assistant is not connected.");return await this.hass.callService(n,a,s),{accepted:!0,deviceId:e,command:structuredClone(t)}}dispose(){this.disposed||(this.disposed=!0,this.listeners.clear(),this.states.clear(),this.bindings.clear(),this.hass=null,this.supportsCommand=null)}};var A="mikonus_dashboard/scene/",he=[500,1e3,2e3,4e3,8e3],ue=new Set(["unknown_command","integration_not_setup","disconnected","connection_lost","cannot_connect","timeout","transport_error","store_unavailable","storage_error"]),de={unknown_command:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste hinzuf\xFCgen. Warte auf die Integration \u2026",integration_not_setup:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste einrichten oder neu laden. Warte auf die Integration \u2026",scene_not_found:"Diese Scene wurde noch nicht aus Mikonus ver\xF6ffentlicht.",no_scenes:"Noch kein Dashboard ver\xF6ffentlicht. Ver\xF6ffentliche zuerst eine Scene aus Mikonus.",multiple_scenes:"Mehrere Dashboards vorhanden. Bitte scene_id in der Card-Konfiguration angeben.",invalid_scene_id:"Ung\xFCltige scene_id in der Card-Konfiguration.",invalid_scene:"Die ver\xF6ffentlichte Scene ist ung\xFCltig.",unauthorized:"Keine Berechtigung zum Laden dieses Dashboards.",permission_denied:"Keine Berechtigung zum Laden dieses Dashboards.",forbidden:"Keine Berechtigung zum Laden dieses Dashboards.",disconnected:"Verbindung zu Home Assistant unterbrochen."};function y(i){let e=typeof i=="number"?i:i?.code,t=[1,3].includes(e)?"disconnected":e;return Object.assign(new Error(de[t]??i?.message??"Dashboard konnte nicht geladen werden."),{code:t})}function F(i){return ue.has(y(i).code)||i?.name==="NetworkError"}var x=()=>new DOMException("Scene source stopped or superseded.","AbortError");function q(i,e){return e.throwIfAborted(),new Promise((t,r)=>{let n=()=>r(x());e.addEventListener("abort",n,{once:!0}),Promise.resolve(i).then(t,r).finally(()=>e.removeEventListener("abort",n))})}var C=i=>{try{Promise.resolve(i?.()).catch(()=>{})}catch{}},R=class{constructor(e,{sceneId:t,onStatus:r=()=>{},retryDelays:n=he}={}){this.connection=e,this.sceneId=t,this.onStatus=r,this.revision=null,this.notifiedRevision=0,this.epoch=0,this.wakeRevision=0,this.transportGeneration=0,this.listeners=new Set,this.disposed=!1,this.unsubscribe=null,this.starting=null,this.pending=null,this.unavailable=!1,this.observers=new Map,this.retryDelays=n,this.retryIndex=0,this.timer=null,this.lifetime=new AbortController,this.transport=new AbortController,this.onDisconnect=()=>{this.disposed||(this.unavailable=!0,this.invalidate(),this.clearRetry(),this.onStatus(y({code:"disconnected"})))},this.onReconnect=()=>{this.disposed||(this.invalidate(),this.recover())},e?.addEventListener?.("disconnected",this.onDisconnect),e?.addEventListener?.("ready",this.onReconnect)}clearRetry(){clearTimeout(this.timer),this.timer=null}retry(e){this.disposed||!F(e)||this.timer!==null||this.connection?.connected===!1||this.retryIndex>=this.retryDelays.length||(this.timer=setTimeout(()=>{this.timer=null,this.wake()},this.retryDelays[this.retryIndex++]))}wake(){this.disposed||this.emit({revision:`recovery:${++this.wakeRevision}:${this.epoch}`})}recover(){this.clearRetry(),this.retryIndex=0,this.unavailable=!1,this.wake()}invalidate(){this.transport.abort(),this.transport=new AbortController,++this.epoch,++this.transportGeneration,this.pending=null,this.starting=null,this.revision=null,this.notifiedRevision=0,C(this.unsubscribe),this.unsubscribe=null;for(let e of this.observers.values())C(e.unsubscribe);this.observers.clear()}async observe(e,t,r){if(this.observers.has(e))return this.observers.get(e).promise;let n={};return this.observers.set(e,n),n.promise=this.connection.subscribeMessage(a=>{!this.disposed&&this.observers.get(e)===n&&r(a)},t,{resubscribe:!1}).then(a=>{if(this.disposed||this.observers.get(e)!==n)throw C(a),x();n.unsubscribe=a}).catch(a=>{throw this.observers.get(e)===n&&this.observers.delete(e),a}),n.promise}async start(){if(this.starting)return this.starting;let e=this.epoch,t=(async()=>{if(typeof this.connection?.sendMessagePromise!="function"||typeof this.connection?.subscribeMessage!="function"||this.connection.connected===!1)throw y({code:"disconnected"});if(await this.observe("component",{type:"subscribe_events",event_type:"component_loaded"},a=>{a.data?.component==="mikonus_dashboard"&&this.recover()}),await this.observe("watch",{type:A+"watch"},a=>{(a.type==="ready"||a.type==="updated"&&!this.unsubscribe&&(!this.sceneId||a.sceneId===this.sceneId))&&this.recover()}),!this.sceneId){let{scenes:a}=await this.connection.sendMessagePromise({type:A+"list"});if(this.disposed||e!==this.epoch)throw x();if(!a.length)throw y({code:"no_scenes"});if(a.length!==1)throw y({code:"multiple_scenes"});this.sceneId=a[0].sceneId}if(this.disposed||e!==this.epoch)throw x();if(this.unsubscribe)return;let r=this.transportGeneration,n=await this.connection.subscribeMessage(a=>{r===this.transportGeneration&&this.onEvent(a)},{type:A+"subscribe",scene_id:this.sceneId},{resubscribe:!1});if(this.disposed||e!==this.epoch)throw C(n),x();this.unsubscribe=n})();this.starting=t;try{return await t}finally{this.starting===t&&(this.starting=null)}}onEvent(e){if(!this.disposed){if(e.type==="unavailable"){this.unavailable=!0,this.onStatus(y(e)),F(e)||this.clearRetry(),this.retry(e);return}e.sceneId!==this.sceneId||!Number.isSafeInteger(e.revision)||(this.unavailable&&(this.unavailable=!1,this.revision=null,this.notifiedRevision=0,++this.epoch),!(e.revision<=(this.revision??0)||e.revision<=this.notifiedRevision)&&(this.notifiedRevision=e.revision,this.clearRetry(),this.retryIndex=0,this.listeners.size&&this.emit({sceneId:this.sceneId,revision:`${e.revision}:${this.epoch}`})))}}emit(e){for(let t of this.listeners)t(e)}async loadScene({signal:e}={}){if(e?.throwIfAborted(),this.disposed)throw x();let t=this.epoch,r=AbortSignal.any([this.lifetime.signal,this.transport.signal,...e?[e]:[]]);try{if(await q(this.start(),r),e?.throwIfAborted(),this.disposed||t!==this.epoch)throw x();this.pending??=this.connection.sendMessagePromise({type:A+"get",scene_id:this.sceneId});let n=this.pending,a;try{a=await q(n,r)}finally{this.pending===n&&(this.pending=null)}if(e?.throwIfAborted(),this.disposed||t!==this.epoch)throw x();let s=a?.metadata?.revision;if(a?.scene?.sceneId!==this.sceneId||!Number.isSafeInteger(s)||s<1)throw y({code:"invalid_scene"});return this.revision=s,this.clearRetry(),this.retryIndex=0,this.onStatus(null),{scene:a.scene,metadata:{...a.metadata,revision:`${s}:${t}`,source:"homeAssistant"}}}catch(n){if(this.disposed||t!==this.epoch||n?.name==="AbortError")throw x();let a=y(n);throw this.onStatus(a),F(n)||this.clearRetry(),this.retry(n),a}}async waitUntilReady({signal:e}={}){let t=[this.lifetime.signal,...e?[e]:[]],r=!0,n,a=()=>{r=!0,n?.()},s=this.subscribe(a);for(let o of t)o.addEventListener("abort",a);try{for(;;){for(let o of t)o.throwIfAborted();r||await new Promise(o=>{n=o}),n=null;for(let o of t)o.throwIfAborted();r=!1;try{return await this.loadScene({signal:e})}catch{if(this.disposed||e?.aborted)throw x()}}}finally{s();for(let o of t)o.removeEventListener("abort",a)}}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),this.notifiedRevision>(this.revision??0)&&e({sceneId:this.sceneId,revision:`${this.notifiedRevision}:${this.epoch}`}),()=>this.listeners.delete(e))}dispose(){this.disposed||(this.disposed=!0,this.lifetime.abort(),this.clearRetry(),this.invalidate(),this.listeners.clear(),this.connection?.removeEventListener?.("disconnected",this.onDisconnect),this.connection?.removeEventListener?.("ready",this.onReconnect))}};var Y={schemaVersion:2,sceneId:"mikonus:ha-reference",name:"Mikonus HA Reference",metadata:{generator:"mikonus-ha-development-fixture",revision:"1"},defaultFloorId:"floor-eg",floors:[{id:"floor-ug",name:"UG",level:-1,sortOrder:0,elevation:-2.8,rooms:[{id:"room-ug-storage",name:"Keller",polygon:[{x:-2.4,z:-1.8},{x:2.4,z:-1.8},{x:2.4,z:1.8},{x:-2.4,z:1.8}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"object-ug-storage",kind:"furniture",shape:"box",position:{x:0,y:.45,z:0},rotation:{y:0},size:{width:1.2,depth:.6,height:.9},appearance:"cabinet"}]},{id:"floor-eg",name:"EG",level:0,sortOrder:1,elevation:0,rooms:[{id:"room-eg-living",name:"Wohnzimmer",polygon:[{x:-3.2,z:-2.4},{x:3.2,z:-2.4},{x:3.2,z:2.4},{x:-3.2,z:2.4}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[{id:"wall-eg-north",start:{x:-3.2,z:-2.4},end:{x:3.2,z:-2.4},baseY:0,height:2.8,thickness:.15}],doors:[],windows:[{id:"cover-eg-window",wallId:"wall-eg-north",position:{x:0,y:.7,z:-2.4},rotation:{y:0},size:{width:1.8,height:1.7,depth:.08},openAngle:0,binding:{provider:"homeAssistant",deviceId:"cover.mikonus_reference",capability:"position"}}],objects:[{id:"light-eg-living",kind:"light",position:{x:-.8,y:2.35,z:.4},rotation:{y:0},size:{width:.42,depth:.42,height:.16},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_reference",capability:"power"}}]},{id:"floor-og",name:"OG",level:1,sortOrder:2,elevation:2.8,rooms:[{id:"room-og-bedroom",name:"Schlafzimmer",polygon:[{x:-2.8,z:-2.1},{x:2.8,z:-2.1},{x:2.8,z:2.1},{x:-2.8,z:2.1}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"light-og-bedroom",kind:"light",position:{x:.9,y:2.35,z:-.3},rotation:{y:0},size:{width:.38,depth:.38,height:.14},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_upstairs",capability:"power"}}]}]};var me={"light.mikonus_reference":"light","light.mikonus_upstairs":"upstairs_light","cover.mikonus_reference":"cover"};function $(i={}){let e=structuredClone(Y);for(let t of e.floors)for(let r of["objects","doors","windows"])for(let n of t[r])n.binding&&(n.binding.deviceId=i[me[n.binding.deviceId]]??n.binding.deviceId);return e}var P=class{#e=null;#t=new Set;#i=!1;read(){return this.#e}updateHass(e){if(this.#i)return;let t=e?.themes?.darkMode,r=typeof t=="boolean"?t?"dark":"light":null;if(r!==this.#e){this.#e=r;for(let n of this.#t)n(r)}}subscribe(e){return this.#i?()=>{}:(this.#t.add(e),()=>this.#t.delete(e))}dispose(){this.#i=!0,this.#t.clear()}};function fe(i){let e=i?.states?.["sun.sun"];if(e?.attributes?.elevation===null||e?.attributes?.elevation===void 0||e?.attributes?.azimuth===null||e?.attributes?.azimuth===void 0||e?.attributes?.elevation===""||e?.attributes?.azimuth==="")return null;let t=Number(e?.attributes?.elevation),r=Number(e?.attributes?.azimuth);return!Number.isFinite(t)||!Number.isFinite(r)||t<-90||t>90?null:Object.freeze({elevationDegrees:t,azimuthDegrees:r,source:"home-assistant"})}function ge(i){return i?`${i.elevationDegrees}:${i.azimuthDegrees}`:"fallback"}var D=class{#e=null;#t="fallback";#i=new Set;#r=!1;read(){return this.#e}updateHass(e){if(this.#r)return;let t=fe(e),r=ge(t);if(r!==this.#t){this.#e=t,this.#t=r;for(let n of this.#i)n(this.#e)}}subscribe(e){return this.#r?()=>{}:(this.#i.add(e),()=>this.#i.delete(e))}dispose(){this.#r=!0,this.#i.clear(),this.#e=null,this.#t="fallback"}};var I=Object.freeze(["ambientLight","shadowsEnabled","shadowStrength","theme","autoBrightness","indoorBrightnessInDarkness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),Z=new Set(["shadowsEnabled","autoBrightness","indoorBrightnessInDarkness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),J=Object.freeze({ambientLight:100,shadowsEnabled:!0,shadowStrength:100,theme:"auto",autoBrightness:!0,indoorBrightnessInDarkness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0});function K(i,e,t,r){if(typeof i!="number"||!Number.isFinite(i))throw new Error(`${e} must be a finite number.`);return Math.min(Math.max(i,t),r)}function L(i={}){let e={};for(let t of I){let r=i[t];if(r!==void 0){if(Z.has(t)){if(typeof r!="boolean")throw new Error(`${t} must be a boolean.`);e[t]=r;continue}if(t==="ambientLight"){e[t]=K(r,t,0,150);continue}if(t==="shadowStrength"){e[t]=K(r,t,0,100);continue}if(t==="theme"){if(!["auto","light","dark"].includes(r))throw new Error("theme must be auto, light or dark.");e[t]=r}}}return e}function k(i={}){let e=L(i),t={};e.ambientLight!==void 0&&(t.ambientBrightnessPercent=e.ambientLight),e.shadowStrength!==void 0&&(t.shadowIntensityPercent=e.shadowStrength),e.theme!==void 0&&(t.themeMode=e.theme);for(let r of Z)e[r]!==void 0&&(t[r]=e[r]);return t}function z(i={}){return Object.freeze({...J,...L(i)})}function Q(i={}){let e=z(i);return Object.fromEntries(I.filter(t=>e[t]!==J[t]).map(t=>[t,e[t]]))}function ee(i){if(!i||i.type!=="custom:mikonus-3d-card")throw new Error("Expected type: custom:mikonus-3d-card.");let e=L(i);if(i.scene==="published"){if(i.scene_id!==void 0&&(typeof i.scene_id!="string"||!/^mikonus:[A-Za-z0-9][A-Za-z0-9:_-]{0,190}$/.test(i.scene_id)))throw new Error("Invalid scene_id.");if(i.entities!==void 0)throw new Error("entities applies only to scene: reference.");return{type:"custom:mikonus-3d-card",scene:"published",...i.scene_id?{scene_id:i.scene_id}:{},...e}}if(i.scene!==void 0&&i.scene!=="reference")throw new Error("Expected scene: reference or published.");if(i.scene_id!==void 0)throw new Error("scene_id requires scene: published.");let t=i.entities??{};if(!t||typeof t!="object"||Array.isArray(t))throw new Error("entities must be a mapping.");let r={};for(let n of Object.keys(t).sort()){let a={light:"light",upstairs_light:"light",cover:"cover"}[n],s=t[n];if(!a||typeof s!="string"||!E.test(s)||!s.startsWith(`${a}.`))throw new Error(`Invalid reference entity mapping: ${n}.`);r[n]=s}return{type:"custom:mikonus-3d-card",scene:"reference",entities:r,...e}}function B(i){return i.scene==="published"?{scene:"published",...i.scene_id?{scene_id:i.scene_id}:{}}:{scene:"reference",entities:i.entities}}function te(i){return class extends HTMLElement{#e=null;#t=null;#i=null;#r=null;#a=0;#d=new Map;#n=null;#s=null;#o=null;#u=t=>{t.persisted&&(this.#h(),this.#c())};constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML='<style>:host{display:block;height:100%;min-height:360px}.card{position:relative;height:100%;min-height:360px;border-radius:var(--ha-card-border-radius,12px);overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff))}.viewport{position:absolute;inset:0}p{position:absolute;inset:16px auto auto 16px;margin:0;max-width:calc(100% - 32px);font:14px system-ui;color:var(--primary-text-color,#222)}[hidden]{display:none}</style><div class="card"><div class="viewport"></div><p role="status">Warte auf Home Assistant \u2026</p></div>'}setConfig(t){let r=ee(t);if(JSON.stringify(r)===JSON.stringify(this.#e))return;let n=this.#e&&JSON.stringify(B(r))===JSON.stringify(B(this.#e));if(this.#e=r,n&&!this.#r?.disposed){this.#i?.updateSettings?.(k(r));return}this.#h(),this.#c()}set hass(t){let r=this.#t&&this.#t.connection!==t?.connection;this.#t=t,r&&this.#e?.scene==="published"&&this.#h(),this.#s?.updateHass(t),this.#o?.updateHass(t),this.#r?.updateHass(t),this.#c()}get hass(){return this.#t}connectedCallback(){window.addEventListener("pageshow",this.#u),this.#c()}disconnectedCallback(){window.removeEventListener("pageshow",this.#u),this.#h()}getCardSize(){return 8}getGridOptions(){return{columns:"full",rows:7,min_columns:6,min_rows:6}}static getStubConfig(){return{scene:"published"}}static getConfigElement(){return document.createElement("mikonus-3d-card-editor")}#l(t){let r=this.shadowRoot.querySelector("[role=status]");r.textContent=t,r.hidden=!t}#c(){if(!this.isConnected||!this.#e||!this.#t||this.#r)return;let t=++this.#a,r=new T(this.#t);this.#r=r,this.#s=new P,this.#s.updateHass(this.#t),this.#o=new D,this.#o.updateHass(this.#t),this.#l("Mikonus wird geladen \u2026");let n=this.#d,a={getItem:s=>n.get(s)??null,setItem:(s,o)=>n.set(s,String(o)),removeItem:s=>n.delete(s)};this.#e.scene==="published"&&(this.#n=new R(this.#t.connection,{sceneId:this.#e.scene_id,onStatus:s=>{t===this.#a&&this.#l(s?.message??"")}}));try{let s=i({container:this.shadowRoot.querySelector(".viewport"),runtime:r,scene:this.#n?void 0:$(this.#e.entities),sceneSource:this.#n,themeSource:this.#s,solarSource:this.#o,storage:a,presentationSettings:k(this.#e),onReady:()=>{t===this.#a&&this.#l("")},onError:o=>{t===this.#a&&(r.dispose(),this.#n?.dispose(),this.#l(`Mikonus konnte nicht geladen werden: ${o.message??"Unbekannter Fehler"}`))}});t!==this.#a?s.dispose():this.#i=s}catch(s){r.dispose(),this.#n?.dispose(),this.#l(`Mikonus konnte nicht geladen werden: ${s.message}`)}}#h(){++this.#a;try{this.#i?.dispose()}finally{this.#n?.dispose(),this.#n=null,this.#s?.dispose(),this.#s=null,this.#o?.dispose(),this.#o=null,this.#r?.dispose(),this.#r=null,this.#i=null,this.shadowRoot.querySelector(".viewport").replaceChildren()}}}}var ie=Object.freeze({de:{intro:"Die Szene bleibt unver\xE4ndert. Diese Einstellungen gelten nur f\xFCr diese Karteninstanz.",sceneSection:"Dashboard Scene",scene:"Szenenquelle",scene_id:"Scene-ID (optional)",sceneHelp:"Leer lassen, wenn genau eine ver\xF6ffentlichte Scene vorhanden ist.",published:"Ver\xF6ffentlichte Scene",reference:"Entwicklungs-Referenzscene",displaySection:"Darstellung",ambientLight:"Umgebungshelligkeit",shadowsEnabled:"Schatten aktivieren",shadowStrength:"Schattenst\xE4rke",theme:"Theme",autoBrightness:"Automatische Helligkeit",indoorBrightnessInDarkness:"Grundhelligkeit bei Dunkelheit",auto:"Automatisch",light:"Hell",dark:"Dunkel",cameraSection:"Kamera",cameraLocked:"Kamera sperren",cameraRotationEnabled:"Rotation erlauben",cameraZoomEnabled:"Zoom erlauben",cameraPanEnabled:"Verschieben erlauben",uiSection:"Dashboard UI",showFloorSelector:"Etagenumschalter anzeigen",showQuickControls:"Quick-Control-Chips anzeigen",showDeviceMarkers:"Device-Marker anzeigen"},en:{intro:"The scene stays unchanged. These settings apply only to this card instance.",sceneSection:"Dashboard Scene",scene:"Scene source",scene_id:"Scene ID (optional)",sceneHelp:"Leave empty when exactly one published scene is available.",published:"Published scene",reference:"Development reference scene",displaySection:"Appearance",ambientLight:"Ambient light",shadowsEnabled:"Enable shadows",shadowStrength:"Shadow strength",theme:"Theme",autoBrightness:"Automatic brightness",indoorBrightnessInDarkness:"Indoor brightness in darkness",auto:"Auto",light:"Light",dark:"Dark",cameraSection:"Camera",cameraLocked:"Lock camera",cameraRotationEnabled:"Allow rotation",cameraZoomEnabled:"Allow zoom",cameraPanEnabled:"Allow pan",uiSection:"Dashboard UI",showFloorSelector:"Show floor selector",showQuickControls:"Show quick-control chips",showDeviceMarkers:"Show device markers"}});function ve(i){return[{type:"expandable",name:"sceneSettings",title:i.sceneSection,flatten:!0,schema:[{name:"scene",required:!0,selector:{select:{mode:"dropdown",options:[{value:"published",label:i.published},{value:"reference",label:i.reference}]}}},{name:"scene_id",selector:{text:{}}}]},{type:"expandable",name:"displaySettings",title:i.displaySection,flatten:!0,schema:[{name:"ambientLight",required:!0,selector:{number:{min:0,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"shadowsEnabled",required:!0,selector:{boolean:{}}},{name:"shadowStrength",required:!0,selector:{number:{min:0,max:100,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"theme",required:!0,selector:{select:{mode:"dropdown",options:[{value:"auto",label:i.auto},{value:"light",label:i.light},{value:"dark",label:i.dark}]}}},{name:"autoBrightness",required:!0,selector:{boolean:{}}},{name:"indoorBrightnessInDarkness",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"cameraSettings",title:i.cameraSection,flatten:!0,schema:[{name:"cameraLocked",required:!0,selector:{boolean:{}}},{name:"cameraRotationEnabled",required:!0,selector:{boolean:{}}},{name:"cameraZoomEnabled",required:!0,selector:{boolean:{}}},{name:"cameraPanEnabled",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"uiSettings",title:i.uiSection,flatten:!0,schema:[{name:"showFloorSelector",required:!0,selector:{boolean:{}}},{name:"showQuickControls",required:!0,selector:{boolean:{}}},{name:"showDeviceMarkers",required:!0,selector:{boolean:{}}}]}]}function _e(i){return{scene:i.scene??"published",...i.scene_id?{scene_id:i.scene_id}:{},...z(i)}}function xe(i,e){let t={...i,type:"custom:mikonus-3d-card"};t.scene=e.scene==="reference"?"reference":"published",t.scene==="published"?(delete t.entities,typeof e.scene_id=="string"&&e.scene_id.trim()?t.scene_id=e.scene_id.trim():delete t.scene_id):(delete t.scene_id,t.entities??={});for(let r of I)delete t[r];return Object.assign(t,Q(e)),t}function re(){return class extends HTMLElement{#e={type:"custom:mikonus-3d-card",scene:"published"};#t=null;#i;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>
        :host{display:block}.intro{margin:0 0 12px;color:var(--secondary-text-color);font-size:14px;line-height:1.4}
        ha-form{display:block}
      </style><p class="intro"></p><ha-form></ha-form>`,this.#i=this.shadowRoot.querySelector("ha-form"),this.#i.addEventListener("value-changed",e=>{e.stopPropagation();let t=xe(this.#e,e.detail?.value??{});this.#e=t,this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:t}}))}),this.#r()}setConfig(e){this.#e={...e},this.#r()}set hass(e){this.#t=e,this.#r()}get hass(){return this.#t}#r(){if(!this.#i)return;let t=(this.#t?.locale?.language??this.#t?.language??"en").toLowerCase().startsWith("de")?ie.de:ie.en;this.shadowRoot.querySelector(".intro").textContent=t.intro,this.#i.hass=this.#t,this.#i.data=_e(this.#e),this.#i.schema=ve(t),this.#i.computeLabel=r=>t[r.name],this.#i.computeHelper=r=>r.name==="scene_id"?t.sceneHelp:void 0}}}var ne=`(()=>{var wg=Object.create;var Rd=Object.defineProperty;var Tg=Object.getOwnPropertyDescriptor;var Ag=Object.getOwnPropertyNames;var Cg=Object.getPrototypeOf,Rg=Object.prototype.hasOwnProperty;var zr=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Pg=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Ag(e))!Rg.call(n,s)&&s!==t&&Rd(n,s,{get:()=>e[s],enumerable:!(i=Tg(e,s))||i.enumerable});return n};var kn=(n,e,t)=>(t=n!=null?wg(Cg(n)):{},Pg(e||!n||!n.__esModule?Rd(t,"default",{value:n,enumerable:!0}):t,n));var Zl=zr((jT,Pd)=>{"use strict";function rs(n,e){return\`\${n}:\${e}\`}function zs(n){let e=n.end.x-n.start.x,t=n.end.z-n.start.z,i=Math.hypot(e,t);if(!Number.isFinite(i)||i<=0)throw new TypeError(\`Wall \${n.id??"<unknown>"} must have a positive length.\`);return{length:i,direction:{x:e/i,z:t/i},perpendicular:{x:-t/i,z:e/i}}}function jl(n,e,t){let i=zs(n),s=e.rotation.y*Math.PI/180,r={x:Math.cos(s),z:-Math.sin(s)},o={x:e.position.x+r.x*e.size.width/2,z:e.position.z+r.z*e.size.width/2},a=(o.x-n.start.x)*i.direction.x+(o.z-n.start.z)*i.direction.z,c=t==="door"?0:e.position.y-n.baseY;return{id:e.id,kind:t,wallId:n.id,centerOffset:a,minimumOffset:a-e.size.width/2,maximumOffset:a+e.size.width/2,minimumY:c,maximumY:c+e.size.height,width:e.size.width,height:e.size.height}}function Ig(n,e){return[...n.doors.filter(t=>t.wallId===e.id).map(t=>jl(e,t,"door")),...n.windows.filter(t=>t.wallId===e.id).map(t=>jl(e,t,"window"))].sort((t,i)=>t.minimumOffset-i.minimumOffset||t.minimumY-i.minimumY||t.id.localeCompare(i.id))}function Dg(n,e,t){let i=Math.max(0,Math.min(n.minimumOffset,e)),s=Math.max(0,Math.min(n.maximumOffset,e)),r=Math.max(0,Math.min(n.minimumY,t)),o=Math.max(0,Math.min(n.maximumY,t));return s-i<.001||o-r<.001?null:{minimumOffset:i,maximumOffset:s,minimumY:r,maximumY:o}}function Lg(n){let e=[...n].sort((i,s)=>i-s),t=[];for(let i of e)(t.length===0||Math.abs(i-t[t.length-1])>=.001)&&t.push(i);return t}function Og(n,e){let{length:t}=zs(n),i=e.map(o=>Dg(o,t,n.height)).filter(Boolean);if(i.length===0)return[{minimumOffset:0,maximumOffset:t,minimumY:0,maximumY:n.height,width:t,height:n.height,centerOffset:t/2,centerY:n.height/2}];let s=Lg(new Set([0,t,...i.flatMap(o=>[o.minimumOffset,o.maximumOffset])])),r=[];for(let o=1;o<s.length;o+=1){let a=s[o-1],c=s[o];if(c-a<.001)continue;let l=(a+c)/2,u=i.filter(f=>l>=f.minimumOffset-.001&&l<=f.maximumOffset+.001).map(f=>[f.minimumY,f.maximumY]).sort((f,p)=>f[0]-p[0]),h=[];for(let f of u){let p=h[h.length-1];p&&f[0]<=p[1]+.001?p[1]=Math.max(p[1],f[1]):h.push([...f])}let d=0;for(let f of h)f[0]-d>=.001&&r.push(Hr(a,c,d,f[0])),d=Math.max(d,f[1]);n.height-d>=.001&&r.push(Hr(a,c,d,n.height))}return r}function Hr(n,e,t,i){return{minimumOffset:n,maximumOffset:e,minimumY:t,maximumY:i,width:e-n,height:i-t,centerOffset:(n+e)/2,centerY:(t+i)/2}}function Ng(n,e,t=1.38,i=.04){let s=n.minimumY<=.002,r=n.maximumY<e-.002,o=null;s&&r?o=n.maximumY:s&&(o=Math.min(n.maximumY,Math.max(t,i)));let a=[],c=[];return o!==null&&o-n.minimumY>=i?(a.push(Hr(n.minimumOffset,n.maximumOffset,n.minimumY,o)),n.maximumY-o>=i&&c.push(Hr(n.minimumOffset,n.maximumOffset,o,n.maximumY))):c.push(n),{visiblePanels:a,lightOccluderPanels:c}}function Fg(n,e,t=.01){let i=Math.min(n.maximumOffset,e.maximumOffset)-Math.max(n.minimumOffset,e.minimumOffset),s=Math.min(n.maximumY,e.maximumY)-Math.max(n.minimumY,e.minimumY);return i>t&&s>t}function Ug(n,e=.11){let t=n.flatMap((f,p)=>{let x=zs(f);return[{wall:f,wallIndex:p,end:"start",point:f.start,inward:x.direction},{wall:f,wallIndex:p,end:"end",point:f.end,inward:{x:-x.direction.x,z:-x.direction.z}}]}),i=t.map((f,p)=>p),s=f=>{let p=f;for(;i[p]!==p;)p=i[p];return p},r=(f,p)=>{let x=s(f),m=s(p);x!==m&&(i[m]=x)},o=e*e;for(let f=0;f<t.length;f+=1)for(let p=f+1;p<t.length;p+=1){let x=t[f],m=t[p];if(x.wall.id===m.wall.id||Math.abs(x.wall.baseY-m.wall.baseY)>e)continue;let g=x.point.x-m.point.x,w=x.point.z-m.point.z;g*g+w*w<=o&&r(f,p)}let a=new Map;t.forEach((f,p)=>{let x=s(p);a.has(x)||a.set(x,[]),a.get(x).push(p)});let c=new Set,l=new Set,u=new Set,h=new Map,d=[];for(let f of a.values()){if(new Set(f.map(b=>t[b].wall.id)).size<2||(f.forEach(b=>c.add(rs(t[b].wall.id,t[b].end))),f.length!==2))continue;let p=t[f[0]],x=t[f[1]],m=p.inward.x*x.inward.x+p.inward.z*x.inward.z,g=p.inward.x*x.inward.z-p.inward.z*x.inward.x,w={x:(p.point.x+x.point.x)/2,z:(p.point.z+x.point.z)/2};if(Math.abs(m)<=.2&&Math.abs(g)>=.96){g<0&&([p,x]=[x,p]);let b=Math.max(p.wall.thickness,x.wall.thickness),y=b/2,T={x:w.x+(p.inward.x+x.inward.x)*y,z:w.z+(p.inward.z+x.inward.z)*y},S={center:w,arcCenter:T,first:p,second:x,thickness:b,elevation:(p.wall.baseY+x.wall.baseY)/2,height:Math.min(p.wall.height,x.wall.height)};d.push(S),l.add(rs(p.wall.id,p.end)),l.add(rs(x.wall.id,x.end))}else if(m<=-.98&&Math.abs(g)<=.08)for(let b of[p,x]){let y=rs(b.wall.id,b.end),T={x:-b.inward.x,z:-b.inward.z};u.add(y),h.set(y,(w.x-b.point.x)*T.x+(w.z-b.point.z)*T.z)}}return t.forEach(f=>{let p=rs(f.wall.id,f.end);if(!c.has(p))for(let x of n){if(x.id===f.wall.id||Math.abs(x.baseY-f.wall.baseY)>e)continue;let m=zs(x),g=f.point.x-x.start.x,w=f.point.z-x.start.z,b=(g*m.direction.x+w*m.direction.z)/m.length;if(b<=.03||b>=.97)continue;let y={x:x.start.x+m.direction.x*m.length*b,z:x.start.z+m.direction.z*m.length*b},T=f.point.x-y.x,S=f.point.z-y.z;if(T*T+S*S<=o){c.add(p);break}}}),d.sort((f,p)=>f.center.x-p.center.x||f.center.z-p.center.z),{joinedEndpoints:c,roundedEndpoints:l,continuationEndpoints:u,continuationAlignmentOffsets:h,roundedCorners:d}}function Bg(n,e=0,t=16){let i=Math.max(Math.round(t),4),s=Math.max(n.thickness+Math.max(e,0),.001),r=[{...n.arcCenter}];for(let o=i;o>=0;o-=1){let a=o/i*Math.PI/2;r.push({x:n.arcCenter.x-n.first.inward.x*Math.sin(a)*s-n.second.inward.x*Math.cos(a)*s,z:n.arcCenter.z-n.first.inward.z*Math.sin(a)*s-n.second.inward.z*Math.cos(a)*s})}return r}function kg(n,e,t){let i=zs(e),s=Math.abs(n.minimumOffset)<=.003,r=Math.abs(n.maximumOffset-i.length)<=.003,o=rs(e.id,"start"),a=rs(e.id,"end"),c=e.thickness/2,l=n.minimumOffset,u=n.maximumOffset;if(s&&(t.roundedEndpoints.has(o)?l+=c:t.continuationEndpoints.has(o)?l-=t.continuationAlignmentOffsets?.get(o)??0:t.joinedEndpoints.has(o)&&(l-=c)),r&&(t.roundedEndpoints.has(a)?u-=c:t.continuationEndpoints.has(a)?u+=t.continuationAlignmentOffsets?.get(a)??0:t.joinedEndpoints.has(a)&&(u+=c)),u-l<.012){let d=(n.minimumOffset+n.maximumOffset)/2;l=d-.006,u=d+.006}return Hr(l,u,n.minimumY,n.maximumY)}Pd.exports={DOLLHOUSE_WALL_HEIGHT:1.38,MINIMUM_PANEL_SIZE:.001,OPENING_OVERLAP_EPSILON:.01,PRESENTATION_MINIMUM_PANEL_SIZE:.04,WALL_CORNER_SEGMENTS:16,WALL_JOIN_TOLERANCE:.11,buildWallPanels:Og,collectWallOpenings:Ig,contactOpening:jl,openingsOverlap:Fg,joinedWallPanel:kg,resolveWallPresentation:Ng,resolveWallJoinTopology:Ug,roundedCornerFootprint:Bg,wallFrame:zs}});var Vd=zr((ZT,Hd)=>{"use strict";var{contactOpening:zg,openingsOverlap:Hg,wallFrame:Vg}=Zl(),Jl=Object.freeze([1,2]),Gg=2,Wg=new Set(["light","furniture","decor"]),ca=new Set(["box","cylinder","ellipsoid"]),la=.1,ua=Object.freeze({maxJsonBytes:2*1024*1024,maxFloors:16,maxRooms:256,maxWalls:4096,maxDoors:1024,maxWindows:2048,maxObjects:8192,maxPolygonPointsPerRoom:1024}),Hs=class extends Error{constructor(e,t){super(e,t),this.name="DashboardSceneError",this.code="invalid_dashboard_scene"}};function lt(n,e){throw new Hs(\`\${n}: \${e}\`)}function Ri(n){return n!==null&&typeof n=="object"&&!Array.isArray(n)}function kt(n,e){Ri(n)||lt(e,"must be an object.")}function os(n,e){Array.isArray(n)||lt(e,"must be an array.")}function bt(n,e){(typeof n!="string"||n.trim().length===0)&&lt(e,"must be a non-empty string.")}function Ot(n,e,{positive:t=!1}={}){Number.isFinite(n)||lt(e,"must be a finite number."),t&&n<=0&&lt(e,"must be greater than zero.")}function Id(n,e,{nonNegative:t=!1}={}){Ot(n,e),Number.isInteger(n)||lt(e,"must be an integer."),t&&n<0&&lt(e,"must be zero or greater.")}function Kl(n,e){Ot(n,e),(n<0||n>1)&&lt(e,"must be between zero and one.")}function Nd(n){return typeof TextEncoder=="function"?new TextEncoder().encode(n).byteLength:typeof Buffer<"u"?Buffer.byteLength(n,"utf8"):unescape(encodeURIComponent(n)).length}function Xg(n){let e;try{e=JSON.stringify(n)}catch(t){throw new Hs("scene: must be JSON serializable.",{cause:t})}return typeof e!="string"&&lt("scene","must be a JSON object."),Nd(e)}function as(n,e,t){e>t&&lt(n,\`contains \${e} entries; maximum is \${t}.\`)}function Ql(n,e){kt(n,e),Ot(n.x,\`\${e}.x\`),Ot(n.z,\`\${e}.z\`)}function Fd(n,e){kt(n,e),Ot(n.x,\`\${e}.x\`),Ot(n.y,\`\${e}.y\`),Ot(n.z,\`\${e}.z\`)}function Ud(n,e){kt(n,e),Ot(n.y,\`\${e}.y\`)}function eu(n,e){kt(n,e),Ot(n.width,\`\${e}.width\`,{positive:!0}),Ot(n.depth,\`\${e}.depth\`,{positive:!0}),Ot(n.height,\`\${e}.height\`,{positive:!0})}function Bd(n,e){if(typeof n>"u")return;kt(n,e),bt(n.provider,\`\${e}.provider\`),bt(n.capability,\`\${e}.capability\`);let t=typeof n.deviceId<"u",i=typeof n.slot<"u";t===i&&lt(e,"must contain exactly one of deviceId or slot."),t&&bt(n.deviceId,\`\${e}.deviceId\`),i&&bt(n.slot,\`\${e}.slot\`)}function ha(n,e){typeof n<"u"&&bt(n,e)}function qg(n,e){if(!(typeof n>"u")){kt(n,e),kt(n.materialSlots,\`\${e}.materialSlots\`);for(let[t,i]of Object.entries(n.materialSlots)){bt(t,\`\${e}.materialSlots key\`);let s=\`\${e}.materialSlots.\${t}\`;Ci(i,s)}}}function Ci(n,e){typeof n>"u"||(kt(n,e),bt(n.materialKey,\`\${e}.materialKey\`),(typeof n.baseColor!="string"||!/^#[0-9A-Fa-f]{6}$/.test(n.baseColor))&&lt(\`\${e}.baseColor\`,"must be an RGB hex color."),Kl(n.roughness,\`\${e}.roughness\`),Kl(n.metallic,\`\${e}.metallic\`),Kl(n.opacity,\`\${e}.opacity\`),typeof n.pattern<"u"&&(kt(n.pattern,\`\${e}.pattern\`),bt(n.pattern.kind,\`\${e}.pattern.kind\`),Ot(n.pattern.elementSize,\`\${e}.pattern.elementSize\`,{positive:!0}),Ot(n.pattern.lineWidth,\`\${e}.pattern.lineWidth\`,{positive:!0}),bt(n.pattern.orientation,\`\${e}.pattern.orientation\`)))}function Yg(n,e){typeof n>"u"||(kt(n,e),Ci(n.body,\`\${e}.body\`),Ci(n.positiveSide,\`\${e}.positiveSide\`),Ci(n.negativeSide,\`\${e}.negativeSide\`))}function $g(n,e){typeof n>"u"||(kt(n,e),Ci(n.panel,\`\${e}.panel\`),Ci(n.frame,\`\${e}.frame\`),Ci(n.reveal,\`\${e}.reveal\`))}function jg(n,e){if(!(typeof n>"u")){kt(n,e);for(let[t,i]of Object.entries(n))bt(t,\`\${e} key\`),typeof i!="string"&&typeof i!="boolean"&&!Number.isFinite(i)&&lt(\`\${e}.\${t}\`,"must be a finite number, string, or boolean.")}}function Vr(n,e,t){bt(n,e),t.has(n)&&lt(e,\`duplicate scene id "\${n}".\`),t.add(n)}function Zg(n){return Ri(n)?{...n,elevation:n.elevation??0,floorThickness:n.floorThickness??.2,appearance:n.appearance??"floor"}:n}function Kg(n){return Ri(n)?{...n,baseY:n.baseY??0,appearance:n.appearance??"wall"}:n}function kd(n){return n==null?{y:0}:Ri(n)?{...n,y:n.y??0}:n}function Dd(n,e){return Ri(n)?{...n,rotation:kd(n.rotation),openAngle:n.openAngle??70,appearance:n.appearance??e}:n}function Jg(n){if(!Ri(n))return n;let e=n.appearance==="floor-lamp"?"floorLamp":n.appearance==="table-lamp"?"tableLamp":"floorLamp";return{...n,rotation:kd(n.rotation),visualType:n.visualType??(n.kind==="light"?e:void 0),appearance:n.appearance??(n.assetKey?{materialSlots:{}}:n.kind)}}function Qg(n,e,t){if(!Ri(n))return n;let i={...n,rooms:Array.isArray(n.rooms)?n.rooms.map(Zg):n.rooms??[],walls:Array.isArray(n.walls)?n.walls.map(Kg):n.walls??[],doors:Array.isArray(n.doors)?n.doors.map(s=>Dd(s,"door")):n.doors??[],windows:Array.isArray(n.windows)?n.windows.map(s=>Dd(s,"window")):n.windows??[],objects:Array.isArray(n.objects)?n.objects.map(Jg):n.objects??[]};return e!==1?i:{...i,level:0,sortOrder:t,elevation:0}}function ex(n,e){let t=n.sortOrder-e.sortOrder;if(t!==0)return t;let i=n.level-e.level;return i!==0?i:n.id<e.id?-1:n.id>e.id?1:0}function tx(n,e,t,i){kt(n,e),Vr(n.id,\`\${e}.id\`,t),bt(n.name,\`\${e}.name\`),os(n.polygon,\`\${e}.polygon\`),n.polygon.length<3&&lt(\`\${e}.polygon\`,"must contain at least three points."),as(\`\${e}.polygon\`,n.polygon.length,i.maxPolygonPointsPerRoom),n.polygon.forEach((s,r)=>Ql(s,\`\${e}.polygon[\${r}]\`)),Ot(n.elevation,\`\${e}.elevation\`),Ot(n.floorThickness,\`\${e}.floorThickness\`,{positive:!0}),ha(n.appearance,\`\${e}.appearance\`),Ci(n.material,\`\${e}.material\`)}function nx(n,e,t){kt(n,e),Vr(n.id,\`\${e}.id\`,t),Ql(n.start,\`\${e}.start\`),Ql(n.end,\`\${e}.end\`),n.start.x===n.end.x&&n.start.z===n.end.z&&lt(e,"start and end must describe a wall with non-zero length."),Ot(n.baseY,\`\${e}.baseY\`),Ot(n.height,\`\${e}.height\`,{positive:!0}),Ot(n.thickness,\`\${e}.thickness\`,{positive:!0}),ha(n.appearance,\`\${e}.appearance\`),Yg(n.materials,\`\${e}.materials\`)}function Ld(n,e,t){kt(n,e),Vr(n.id,\`\${e}.id\`,t),typeof n.wallId<"u"&&bt(n.wallId,\`\${e}.wallId\`),Fd(n.position,\`\${e}.position\`),Ud(n.rotation,\`\${e}.rotation\`),eu(n.size,\`\${e}.size\`),Ot(n.openAngle,\`\${e}.openAngle\`),ha(n.appearance,\`\${e}.appearance\`),$g(n.materials,\`\${e}.materials\`),Bd(n.binding,\`\${e}.binding\`)}function Od(n,e,t,i){let s=zg(e,n,t),{length:r}=Vg(e);return(s.minimumOffset<-la||s.maximumOffset>r+la)&&lt(i,"opening must lie within its referenced wall."),t==="window"&&s.minimumY<-la&&lt(\`\${i}.position.y\`,"window sill must not be below its referenced wall."),s.maximumY>e.height+la&&lt(i,"opening height must lie within its referenced wall."),s}function ix(n){for(let e=0;e<n.length;e+=1)for(let t=e+1;t<n.length;t+=1)Hg(n[e].opening,n[t].opening)&&lt(n[t].path,"opening overlaps another opening in the same wall.")}function sx(n,e,t){kt(n,e),Vr(n.id,\`\${e}.id\`,t),bt(n.kind,\`\${e}.kind\`),Wg.has(n.kind)||lt(\`\${e}.kind\`,"must be light, furniture, or decor."),Fd(n.position,\`\${e}.position\`),Ud(n.rotation,\`\${e}.rotation\`),eu(n.size,\`\${e}.size\`),Bd(n.binding,\`\${e}.binding\`),typeof n.visualType<"u"&&bt(n.visualType,\`\${e}.visualType\`),jg(n.parameters,\`\${e}.parameters\`),typeof n.assetKey<"u"?(bt(n.assetKey,\`\${e}.assetKey\`),n.kind!=="furniture"&&n.kind!=="decor"&&lt(\`\${e}.kind\`,"an assetKey is only valid for furniture or decor."),typeof n.variantKey<"u"?bt(n.variantKey,\`\${e}.variantKey\`):lt(\`\${e}.variantKey\`,"must be a non-empty string."),eu(n.dimensions,\`\${e}.dimensions\`),qg(n.appearance,\`\${e}.appearance\`)):ha(n.appearance,\`\${e}.appearance\`),n.kind!=="light"&&typeof n.assetKey>"u"?(bt(n.shape,\`\${e}.shape\`),ca.has(n.shape)||lt(\`\${e}.shape\`,\`must be one of \${[...ca].join(", ")}.\`)):typeof n.shape<"u"&&!ca.has(n.shape)&&lt(\`\${e}.shape\`,\`must be one of \${[...ca].join(", ")} when provided.\`)}function rx(n){kt(n,"metadata"),typeof n.generatedAt<"u"&&bt(n.generatedAt,"metadata.generatedAt"),typeof n.generator<"u"&&bt(n.generator,"metadata.generator"),typeof n.revision<"u"&&bt(n.revision,"metadata.revision"),typeof n.modelNorthDegrees<"u"&&Ot(n.modelNorthDegrees,"metadata.modelNorthDegrees")}function zd(n,{limits:e=ua}={}){let t={...ua,...e};kt(n,"scene");let i=Xg(n);i>t.maxJsonBytes&&lt("scene",\`JSON size is \${i} bytes; maximum is \${t.maxJsonBytes} bytes.\`),Jl.includes(n.schemaVersion)||lt("schemaVersion",\`unsupported version \${String(n.schemaVersion)}; expected one of \${Jl.join(", ")}.\`),bt(n.sceneId,"sceneId"),bt(n.name,"name"),os(n.floors,"floors"),n.floors.length===0&&lt("floors","must contain at least one floor."),as("floors",n.floors.length,t.maxFloors),n.schemaVersion===2&&(bt(n.defaultFloorId,"defaultFloorId"),typeof n.activeFloorId<"u"&&lt("activeFloorId","must not be stored in a Dashboard Scene v2."));let s={...n,metadata:n.metadata??{},defaultFloorId:n.schemaVersion===1?n.floors[0]?.id:n.defaultFloorId,floors:Array.isArray(n.floors)?n.floors.map((l,u)=>Qg(l,n.schemaVersion,u)):n.floors};rx(s.metadata);let r={rooms:0,walls:0,doors:0,windows:0,objects:0};for(let l of s.floors)if(Ri(l))for(let u of Object.keys(r))Array.isArray(l[u])&&(r[u]+=l[u].length);as("rooms",r.rooms,t.maxRooms),as("walls",r.walls,t.maxWalls),as("doors",r.doors,t.maxDoors),as("windows",r.windows,t.maxWindows),as("objects",r.objects,t.maxObjects);let o=new Set([s.sceneId]),a=new Set;s.floors.forEach((l,u)=>{let h=\`floors[\${u}]\`;kt(l,h),Vr(l.id,\`\${h}.id\`,o),a.add(l.id),bt(l.name,\`\${h}.name\`),Id(l.level,\`\${h}.level\`),Id(l.sortOrder,\`\${h}.sortOrder\`,{nonNegative:!0}),Ot(l.elevation,\`\${h}.elevation\`),os(l.rooms,\`\${h}.rooms\`),os(l.walls,\`\${h}.walls\`),os(l.doors,\`\${h}.doors\`),os(l.windows,\`\${h}.windows\`),os(l.objects,\`\${h}.objects\`),l.rooms.forEach((x,m)=>tx(x,\`\${h}.rooms[\${m}]\`,o,t)),l.walls.forEach((x,m)=>nx(x,\`\${h}.walls[\${m}]\`,o)),l.doors.forEach((x,m)=>Ld(x,\`\${h}.doors[\${m}]\`,o)),l.windows.forEach((x,m)=>Ld(x,\`\${h}.windows[\${m}]\`,o)),l.objects.forEach((x,m)=>sx(x,\`\${h}.objects[\${m}]\`,o));let d=new Map(l.walls.map(x=>[x.id,x])),f=new Set(d.keys()),p=new Map;l.doors.forEach((x,m)=>{let g=\`\${h}.doors[\${m}]\`;if(x.wallId&&!f.has(x.wallId)&&lt(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=Od(x,d.get(x.wallId),"door",g),b=p.get(x.wallId)??[];b.push({opening:w,path:g}),p.set(x.wallId,b)}}),l.windows.forEach((x,m)=>{let g=\`\${h}.windows[\${m}]\`;if(x.wallId&&!f.has(x.wallId)&&lt(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=Od(x,d.get(x.wallId),"window",g),b=p.get(x.wallId)??[];b.push({opening:w,path:g}),p.set(x.wallId,b)}}),p.forEach(ix)}),a.has(s.defaultFloorId)||lt("defaultFloorId",\`"\${s.defaultFloorId}" does not reference a floor.\`);let c=s.schemaVersion===2?[...s.floors].sort(ex):s.floors;return{...s,floors:c,activeFloorId:s.defaultFloorId}}function ox(n,e){typeof n!="string"&&lt("scene","JSON source must be a string.");let t=e?.limits?.maxJsonBytes??ua.maxJsonBytes;Nd(n)>t&&lt("scene",\`JSON size exceeds the maximum of \${t} bytes.\`);let i;try{i=JSON.parse(n)}catch(s){throw new Hs("Scene JSON could not be parsed.",{cause:s})}return zd(i,e)}Hd.exports={DASHBOARD_SCENE_LIMITS:ua,DashboardSceneError:Hs,SUPPORTED_SCHEMA_VERSION:Gg,SUPPORTED_SCHEMA_VERSIONS:Jl,parseDashboardScene:ox,validateDashboardScene:zd}});var tu=zr((KT,Wd)=>{"use strict";var Gd=Vd(),{DashboardSceneError:da,parseDashboardScene:ax}=Gd;async function cx(n,{fetchImpl:e=globalThis.fetch,signal:t}={}){if(typeof e!="function")throw new da("Scene loading requires fetch support.");let i;try{i=await e(n,{cache:"no-store",...t?{signal:t}:{}})}catch(r){throw new da(\`Scene could not be fetched from \${n}.\`,{cause:r})}if(!i?.ok)throw new da(\`Scene request failed with HTTP \${i?.status??"unknown"} for \${n}.\`);let s;try{s=await i.text()}catch(r){throw new da(\`Scene response from \${n} could not be read.\`,{cause:r})}return ax(s)}Wd.exports={...Gd,loadDashboardScene:cx}});var Qi=zr((tR,c0)=>{"use strict";var s0=Object.freeze({AVAILABLE:"available",UNAVAILABLE:"unavailable",MISSING:"missing"}),sw=Object.freeze({SET_POWER:"setPower",TOGGLE_POWER:"togglePower",SET_BRIGHTNESS:"setBrightness",SET_COLOR:"setColor",SET_COLOR_TEMPERATURE:"setColorTemperature",SET_COVER_POSITION:"setCoverPosition",OPEN_COVER:"openCover",CLOSE_COVER:"closeCover",STOP_COVER:"stopCover",SET_TARGET_TEMPERATURE:"setTargetTemperature",SET_THERMOSTAT_MODE:"setThermostatMode",SET_FAN_SPEED:"setFanSpeed",SET_FAN_MODE:"setFanMode",SET_TARGET_HUMIDITY:"setTargetHumidity",START_CLEANING:"startCleaning",PAUSE_CLEANING:"pauseCleaning",STOP_CLEANING:"stopCleaning",RETURN_TO_BASE:"returnToBase",LOCK:"lock",UNLOCK:"unlock"});function Ar(n){return n?.availability===s0.AVAILABLE}function rw(n){return!!(n?.power&&Object.prototype.hasOwnProperty.call(n.power,"isOn"))}function ow(n){return Ar(n)&&typeof n?.power?.isOn=="boolean"}function aw(n){return Ar(n)?n?.contact?.state??"unknown":"unknown"}function r0(n){return!!n?.cover}function cw(n){return Ar(n)&&r0(n)}function o0(n){return!!n?.climate}function lw(n){return Ar(n)&&o0(n)}function a0(n){return!!n?.cleaning}function uw(n){return Ar(n)&&a0(n)}c0.exports={DEVICE_AVAILABILITY:s0,DEVICE_COMMAND:sw,contactState:aw,hasCleaningState:a0,hasClimateState:o0,hasCoverState:r0,hasPowerState:rw,isAvailable:Ar,isUsableCleaningState:uw,isUsableClimateState:lw,isUsableCoverState:cw,isUsablePowerState:ow}});var I0=zr((gR,P0)=>{"use strict";function Dr(n,e,t){return Math.min(Math.max(n,e),t)}function es(n,e,t){return n+(e-n)*Dr(t,0,1)}function Ds(n,e,t){return n.map((i,s)=>es(i,e[s],t))}function Dl(n,e,t){let i=Dr((t-n)/(e-n),0,1);return i*i*(3-2*i)}function Ls(n){let e=n%360;return e<0?e+360:e}function Yw(n){let e=Math.PI*2,t=n%e;return t>Math.PI&&(t-=e),t<-Math.PI&&(t+=e),t}function A0(n){let e=n instanceof Date?n:new Date(n??Date.now());return Number.isFinite(e.getTime())?e:new Date}function C0(n){if(n?.elevationDegrees===null||n?.elevationDegrees===void 0||n?.azimuthDegrees===null||n?.azimuthDegrees===void 0||n?.elevationDegrees===""||n?.azimuthDegrees==="")return null;let e=Number(n?.elevationDegrees),t=Number(n?.azimuthDegrees);return!Number.isFinite(e)||!Number.isFinite(t)||e<-90||e>90?null:Object.freeze({elevationDegrees:e,azimuthDegrees:Ls(t),source:typeof n?.source=="string"&&n.source?n.source:"host"})}function $w({at:n=new Date,latitude:e,longitude:t}={}){if(e==null||e===""||t===null||t===void 0||t==="")return null;let i=Number(e),s=Number(t);if(!Number.isFinite(i)||!Number.isFinite(s)||i<-90||i>90||s<-180||s>180)return null;let a=A0(n).getTime()/864e5+24405875e-1-2451545,c=Ls(280.46+.9856474*a),l=Ls(357.528+.9856003*a)*Math.PI/180,u=(c+1.915*Math.sin(l)+.02*Math.sin(2*l))*Math.PI/180,h=(23.439-4e-7*a)*Math.PI/180,d=Math.atan2(Math.cos(h)*Math.sin(u),Math.cos(u)),f=Math.asin(Math.sin(h)*Math.sin(u)),p=a/36525,m=(Ls(280.46061837+360.98564736629*a+387933e-9*p*p-p*p*p/3871e4)+s)*Math.PI/180,g=Yw(m-d),w=i*Math.PI/180,b=-Math.cos(f)*Math.sin(g),y=Math.cos(w)*Math.sin(f)-Math.sin(w)*Math.cos(f)*Math.cos(g),T=Math.sin(w)*Math.sin(f)+Math.cos(w)*Math.cos(f)*Math.cos(g),S=Math.hypot(b,T,y)||1,C={x:b/S,y:T/S,z:y/S};return Object.freeze({elevationDegrees:Math.asin(Dr(C.y,-1,1))*180/Math.PI,azimuthDegrees:Ls(Math.atan2(C.x,C.z)*180/Math.PI),source:"calculated"})}function R0(n=new Date){let e=A0(n),t=e.getHours()+e.getMinutes()/60,i=Dr((t-5.75)/(21.25-5.75),0,1),s=Math.max(Math.sin(i*Math.PI),0),r=t>5.75&&t<21.25;return Object.freeze({elevationDegrees:r?es(-.833,72,Math.pow(s,.92)):-12,azimuthDegrees:es(90,270,i),source:"local-clock"})}function jw(n,e,t){return n==="day"?{elevationDegrees:62,azimuthDegrees:180,source:"manual-day"}:n==="evening"?{elevationDegrees:5,azimuthDegrees:258,source:"manual-evening"}:n==="night"?{elevationDegrees:-18,azimuthDegrees:0,source:"manual-night"}:C0(t)??R0(e)}function Zw(n,e){let t=n.elevationDegrees*Math.PI/180,i=n.azimuthDegrees*Math.PI/180,s=Math.cos(t)*Math.sin(i),r=Math.sin(t),o=Math.cos(t)*Math.cos(i),a=Ls(Number(e)||0)*Math.PI/180,c={x:Math.cos(a),z:-Math.sin(a)},l={x:-Math.sin(a),z:-Math.cos(a)},u={x:c.x*s+l.x*o,y:r,z:c.z*s+l.z*o},h=Math.hypot(u.x,u.y,u.z)||1;return Object.freeze({x:u.x/h,y:u.y/h,z:u.z/h})}function ad(n){return Math.round(n*1e4)/1e4}function Kw({at:n=new Date,solarPosition:e=null,modelNorthDegrees:t=0,timeOfDay:i="auto"}={}){let s=jw(i,n,e),r=s.elevationDegrees,o=.08+.92*Dl(-6,12,r),a=Dr((o-.08)/.92,0,1),c=Dl(-.833,4,r),l=Math.max(Math.sin(Math.max(r,0)*Math.PI/180),0),u=c*(1-Dl(5,32,r)),h=c*es(.58,1,Math.pow(l,.34)),d=[1,.965,.89],f=[1,.5,.19],p=[.48,.58,.78],x=[.69,.8,.91],m=[.28,.36,.54],g=[.105,.118,.155],w=[.165,.18,.205],b=[.335,.385,.455],y=[.5,.49,.455],T=[.82,.87,.915],S=[.72,.785,.825],C=Ds(p,d,a),_=r<=-6?"night":r<12||u>=.12?"evening":"day",A=Zw(s,t),I=Ls(Number(t)||0),P=Dr(A.y,0,1),F=Dl(.04,.88,P)*a,B=Ds(g,b,a),H=Ds(w,y,a);return Object.freeze({source:s.source,elevationDegrees:r,azimuthDegrees:s.azimuthDegrees,modelNorthDegrees:I,resolvedTimeOfDay:_,daylightLevel:o,warmth:u,sunPositionDirection:A,keyRGB:Object.freeze(Ds(C,f,u*.92)),fillRGB:Object.freeze(Ds(m,x,a)),backdropTopRGB:Object.freeze(Ds(B,T,F)),backdropBottomRGB:Object.freeze(Ds(H,S,F)),ambientIntensityFactor:es(.28,1,a),keyIntensityFactor:es(.24,1,h),fillIntensityFactor:es(.22,1,a),toneMappingExposure:es(1,1.05,a),signature:[s.source,ad(r),ad(s.azimuthDegrees),ad(I),_].join(":")})}P0.exports={FALLBACK_SUNRISE_HOUR:5.75,FALLBACK_SUNSET_HOUR:21.25,calculateDashboardSolarPosition:$w,fallbackDashboardSolarPosition:R0,normalizeDashboardSolarPosition:C0,resolveDashboardSolarState:Kw}});var aa=class{constructor(e){this.controller=new AbortController,this.signal=this.controller.signal,this.cleanups=[],this.disposed=!1;let t=()=>this.dispose();e?.aborted?this.dispose():e&&(e.addEventListener("abort",t,{once:!0}),this.defer(()=>e.removeEventListener("abort",t)))}defer(e){typeof e=="function"&&(this.disposed?e():this.cleanups.push(e))}check(){this.signal.throwIfAborted()}async wait(e){this.disposed&&(Promise.resolve(e).catch(()=>{}),this.check());let t;try{let i=await Promise.race([e,new Promise((s,r)=>{t=()=>r(this.signal.reason),this.signal.addEventListener("abort",t,{once:!0})})]);return this.check(),i}finally{this.signal.removeEventListener("abort",t)}}dispose(){if(!this.disposed){this.disposed=!0,this.controller.abort(new DOMException("Dashboard viewer was destroyed.","AbortError"));for(let e of this.cleanups.reverse())try{e()}catch(t){console.warn("Dashboard cleanup failed.",t)}this.cleanups.length=0}}};var Xd=kn(tu());function qd(n){let e=n?.scene,t=e&&typeof e=="object"&&!Array.isArray(e)?(({activeFloorId:i,...s})=>s)(e):e;return{...n,scene:Xd.default.validateDashboardScene(t)}}var Yd=\`
@property --dashboard-scene-backdrop-top {
  syntax: "<color>";
  inherits: true;
  initial-value: rgb(248, 247, 244);
}
@property --dashboard-scene-backdrop-bottom {
  syntax: "<color>";
  inherits: true;
  initial-value: rgb(230, 234, 231);
}
:where(.mikonus-renderer-ui.device-details-open) .mikonus-renderer-canvas { pointer-events: none; cursor: default; }
/* Shared visuals only. Hosts retain their document, shell and header layout. */
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
.mikonus-renderer-shell {
  background: linear-gradient(
    180deg,
    var(--dashboard-scene-backdrop-top),
    var(--dashboard-scene-backdrop-bottom)
  );
  transition:
    --dashboard-scene-backdrop-top 4s ease-in-out,
    --dashboard-scene-backdrop-bottom 4s ease-in-out;
}
:where(.mikonus-renderer-ui) .mikonus-renderer-status-header {
  color: var(--dashboard-scene-text-primary, #26313c);
}
:where(.mikonus-renderer-ui) .mikonus-renderer-summary {
  color: var(--dashboard-scene-text-secondary, rgba(38,49,60,.7));
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
\`,nu=new WeakMap;function iu(n=document){let e=nu.get(n);if(!e){let s=(n.ownerDocument??n).createElement("style");s.dataset.mikonusRendererStyles="",s.textContent=Yd,(n.head??n).appendChild(s),e={element:s,users:0},nu.set(n,e)}e.users+=1;let t=!1;return()=>{t||(t=!0,--e.users===0&&(e.element.remove(),nu.delete(n)))}}function su(n,e,t){if(!n)return;let i=n.classList.contains(e);i||n.classList.add(e),t.push(()=>{i||n.classList.remove(e)})}function ru({container:n,sceneShell:e=n,statusHeader:t=null,summaryElement:i=null}){let s=e.getRootNode(),o=[iu(s)],a=e.ownerDocument,c=a.defaultView;su(e,"mikonus-renderer-shell",o),su(t,"mikonus-renderer-status-header",o),su(i,"mikonus-renderer-summary",o);for(let d of new Set([e,n])){let f=d.classList.contains("mikonus-renderer-ui");f||d.classList.add("mikonus-renderer-ui");let p=d.style.position;c.getComputedStyle(d).position==="static"&&(d.style.position="relative");let x=d.style.isolation;d.style.isolation="isolate",o.push(()=>{f||d.classList.remove("mikonus-renderer-ui"),d.style.position=p,d.style.isolation=x})}let l=a.createElement("div");l.className="mikonus-marker-host",n.appendChild(l);let u=a.createElement("div");u.className="mikonus-popup-host",e.appendChild(u);let h=!1;return{markerHost:l,popupHost:u,setEnvironment(d){for(let f of new Set([e,n]))f.dataset.dashboardTheme=d.resolvedTheme},dispose(){if(!h){h=!0,l.remove(),u.remove();for(let d of o.reverse())d()}}}}var Vi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Gi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Ef=0,qu=1,wf=2;var Es=1,Tf=2,pr=3,dn=0,un=1,Ct=2,ti=0,ps=1,Wi=2,Yu=3,$u=4,Af=5;var Ui=100,Cf=101,Rf=102,Pf=103,If=104,Df=200,Lf=201,Of=202,Nf=203,Fa=204,Ua=205,Ff=206,Uf=207,Bf=208,kf=209,zf=210,Hf=211,Vf=212,Gf=213,Wf=214,Ba=0,ka=1,za=2,ms=3,Ha=4,Va=5,Ga=6,Wa=7,ju=0,Xf=1,qf=2,An=0,Zu=1,Ku=2,Ju=3,mr=4,Qu=5,eh=6,th=7;var nh=300,Xi=301,ws=302,_c=303,yc=304,wo=306,gs=1e3,Jn=1001,Xa=1002,jt=1003,Yf=1004;var To=1005;var At=1006,bc=1007;var ni=1008;var on=1009,ih=1010,sh=1011,gr=1012,Mc=1013,Xn=1014,qn=1015,ii=1016,Sc=1017,Ec=1018,xr=1020,rh=35902,oh=35899,ah=1021,ch=1022,pn=1023,Qn=1026,qi=1027,lh=1028,wc=1029,Yi=1030,Tc=1031;var Ac=1033,Ao=33776,Co=33777,Ro=33778,Po=33779,Cc=35840,Rc=35841,Pc=35842,Ic=35843,Dc=36196,Lc=37492,Oc=37496,Nc=37488,Fc=37489,Io=37490,Uc=37491,Bc=37808,kc=37809,zc=37810,Hc=37811,Vc=37812,Gc=37813,Wc=37814,Xc=37815,qc=37816,Yc=37817,$c=37818,jc=37819,Zc=37820,Kc=37821,Jc=36492,Qc=36494,el=36495,tl=36283,nl=36284,Do=36285,il=36286;var Jr=2300,qa=2301,Na=2302,Iu=2303,Du=2400,Lu=2401,Ou=2402;var $f=3200;var sl=0,jf=1,_i="",Nt="srgb",Qr="srgb-linear",eo="linear",ft="srgb";var ds=7680;var Nu=519,Zf=512,Kf=513,Jf=514,rl=515,Qf=516,ep=517,ol=518,tp=519,Fu=35044;var uh="300 es",Gn=2e3,nr=2001;function lx(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ux(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function to(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function np(){let n=to("canvas");return n.style.display="block",n}var $d={},ir=null;function hh(...n){let e="THREE."+n.shift();ir?ir("log",e,...n):console.log(e,...n)}function ip(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function ke(...n){n=ip(n);let e="THREE."+n.shift();if(ir)ir("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ve(...n){n=ip(n);let e="THREE."+n.shift();if(ir)ir("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function fs(...n){let e=n.join(" ");e in $d||($d[e]=!0,ke(...n))}function sp(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var rp={[Ba]:ka,[za]:Ga,[Ha]:Wa,[ms]:Va,[ka]:Ba,[Ga]:za,[Wa]:Ha,[Va]:ms},Wn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],jd=1234567,$r=Math.PI/180,xs=180/Math.PI;function Ts(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]).toLowerCase()}function tt(n,e,t){return Math.max(e,Math.min(t,n))}function dh(n,e){return(n%e+e)%e}function hx(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function dx(n,e,t){return n!==e?(t-n)/(e-n):0}function jr(n,e,t){return(1-t)*n+t*e}function fx(n,e,t,i){return jr(n,e,1-Math.exp(-t*i))}function px(n,e=1){return e-Math.abs(dh(n,e*2)-e)}function mx(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function gx(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function xx(n,e){return n+Math.floor(Math.random()*(e-n+1))}function vx(n,e){return n+Math.random()*(e-n)}function _x(n){return n*(.5-Math.random())}function yx(n){n!==void 0&&(jd=n);let e=jd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function bx(n){return n*$r}function Mx(n){return n*xs}function Sx(n){return(n&n-1)===0&&n!==0}function Ex(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function wx(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Tx(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+i)/2),u=o((e+i)/2),h=r((e-i)/2),d=o((e-i)/2),f=r((i-e)/2),p=o((i-e)/2);switch(s){case"XYX":n.set(a*u,c*h,c*d,a*l);break;case"YZY":n.set(c*d,a*u,c*h,a*l);break;case"ZXZ":n.set(c*h,c*d,a*u,a*l);break;case"XZX":n.set(a*u,c*p,c*f,a*l);break;case"YXY":n.set(c*f,a*u,c*p,a*l);break;case"ZYZ":n.set(c*p,c*f,a*u,a*l);break;default:ke("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function er(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ln(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var it={DEG2RAD:$r,RAD2DEG:xs,generateUUID:Ts,clamp:tt,euclideanModulo:dh,mapLinear:hx,inverseLerp:dx,lerp:jr,damp:fx,pingpong:px,smoothstep:mx,smootherstep:gx,randInt:xx,randFloat:vx,randFloatSpread:_x,seededRandom:yx,degToRad:bx,radToDeg:Mx,isPowerOfTwo:Sx,ceilPowerOfTwo:Ex,floorPowerOfTwo:wx,setQuaternionFromProperEuler:Tx,normalize:ln,denormalize:er},ae=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},bn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3],d=r[o+0],f=r[o+1],p=r[o+2],x=r[o+3];if(h!==x||c!==d||l!==f||u!==p){let m=c*d+l*f+u*p+h*x;m<0&&(d=-d,f=-f,p=-p,x=-x,m=-m);let g=1-a;if(m<.9995){let w=Math.acos(m),b=Math.sin(w);g=Math.sin(g*w)/b,a=Math.sin(a*w)/b,c=c*g+d*a,l=l*g+f*a,u=u*g+p*a,h=h*g+x*a}else{c=c*g+d*a,l=l*g+f*a,u=u*g+p*a,h=h*g+x*a;let w=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=w,l*=w,u*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[o],d=r[o+1],f=r[o+2],p=r[o+3];return e[t]=a*p+u*h+c*f-l*d,e[t+1]=c*p+u*d+l*h-a*f,e[t+2]=l*p+u*f+a*d-c*h,e[t+3]=u*p-a*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(s/2),h=a(r/2),d=c(i/2),f=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"YXZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"ZXY":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"ZYX":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"YZX":this._x=d*u*h+l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h-d*f*p;break;case"XZY":this._x=d*u*h-l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h+d*f*p;break;default:ke("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(tt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-i*l,this._z=r*u+o*l+i*c-s*a,this._w=o*u-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){let l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+c*l+o*h-a*u,this.y=i+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ou.copy(this).projectOnVector(e),this.sub(ou)}reflect(e){return this.sub(ou.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ou=new D,Zd=new bn,Ke=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l)}set(e,t,i,s,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],h=i[7],d=i[2],f=i[5],p=i[8],x=s[0],m=s[3],g=s[6],w=s[1],b=s[4],y=s[7],T=s[2],S=s[5],C=s[8];return r[0]=o*x+a*w+c*T,r[3]=o*m+a*b+c*S,r[6]=o*g+a*y+c*C,r[1]=l*x+u*w+h*T,r[4]=l*m+u*b+h*S,r[7]=l*g+u*y+h*C,r[2]=d*x+f*w+p*T,r[5]=d*m+f*b+p*S,r[8]=d*g+f*y+p*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*r*u+i*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*r,f=l*r-o*c,p=t*h+i*d+s*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=h*x,e[1]=(s*l-u*i)*x,e[2]=(a*i-s*o)*x,e[3]=d*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-a*t)*x,e[6]=f*x,e[7]=(i*c-l*t)*x,e[8]=(o*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return fs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(au.makeScale(e,t)),this}rotate(e){return fs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(au.makeRotation(-e)),this}translate(e,t){return fs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(au.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},au=new Ke,Kd=new Ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Jd=new Ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ax(){let n={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ft&&(s.r=fi(s.r),s.g=fi(s.g),s.b=fi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ft&&(s.r=tr(s.r),s.g=tr(s.g),s.b=tr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===_i?eo:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return fs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return fs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Qr]:{primaries:e,whitePoint:i,transfer:eo,toXYZ:Kd,fromXYZ:Jd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Nt},outputColorSpaceConfig:{drawingBufferColorSpace:Nt}},[Nt]:{primaries:e,whitePoint:i,transfer:ft,toXYZ:Kd,fromXYZ:Jd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Nt}}}),n}var at=Ax();function fi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function tr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Vs,Ya=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Vs===void 0&&(Vs=to("canvas")),Vs.width=e.width,Vs.height=e.height;let s=Vs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Vs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=to("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=fi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(fi(t[i]/255)*255):t[i]=fi(t[i]);return{data:t,width:e.width,height:e.height}}else return ke("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Cx=0,sr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cx++}),this.uuid=Ts(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(cu(s[o].image)):r.push(cu(s[o]))}else r=cu(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function cu(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ya.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(ke("Texture: Unable to serialize Texture."),{})}var Rx=0,lu=new D,fn=class n extends Wn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Jn,s=Jn,r=At,o=ni,a=pn,c=on,l=n.DEFAULT_ANISOTROPY,u=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rx++}),this.uuid=Ts(),this.name="",this.source=new sr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ae(0,0),this.repeat=new ae(1,1),this.center=new ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(lu).x}get height(){return this.source.getSize(lu).y}get depth(){return this.source.getSize(lu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){ke(\`Texture.setValues(): parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){ke(\`Texture.setValues(): property '\${t}' does not exist.\`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==nh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case gs:e.x=e.x-Math.floor(e.x);break;case Jn:e.x=e.x<0?0:1;break;case Xa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case gs:e.y=e.y-Math.floor(e.y);break;case Jn:e.y=e.y<0?0:1;break;case Xa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};fn.DEFAULT_IMAGE=null;fn.DEFAULT_MAPPING=nh;fn.DEFAULT_ANISOTROPY=1;var wt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],p=c[9],x=c[2],m=c[6],g=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(p+m)<.1&&Math.abs(l+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let b=(l+1)/2,y=(f+1)/2,T=(g+1)/2,S=(u+d)/4,C=(h+x)/4,_=(p+m)/4;return b>y&&b>T?b<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(b),s=S/i,r=C/i):y>T?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=S/s,r=_/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=C/r,s=_/r),this.set(i,s,r,t),this}let w=Math.sqrt((m-p)*(m-p)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(w)<.001&&(w=1),this.x=(m-p)/w,this.y=(h-x)/w,this.z=(d-u)/w,this.w=Math.acos((l+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this.w=tt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this.w=tt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(tt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},$a=class extends Wn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:At,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new fn(s),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:At,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new sr(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mn=class extends $a{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},no=class extends fn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ja=class extends fn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=Jn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var St=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m)}set(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/Gs.setFromMatrixColumn(e,0).length(),r=1/Gs.setFromMatrixColumn(e,1).length(),o=1/Gs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,p=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+p*l,t[5]=d-x*l,t[9]=-a*c,t[2]=x-d*l,t[6]=p+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*u,f=c*h,p=l*u,x=l*h;t[0]=d+x*a,t[4]=p*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-p,t[6]=x+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*u,f=c*h,p=l*u,x=l*h;t[0]=d-x*a,t[4]=-o*h,t[8]=p+f*a,t[1]=f+p*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*u,f=o*h,p=a*u,x=a*h;t[0]=c*u,t[4]=p*l-f,t[8]=d*l+x,t[1]=c*h,t[5]=x*l+d,t[9]=f*l-p,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,p=a*c,x=a*l;t[0]=c*u,t[4]=x-d*h,t[8]=p*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=f*h+p,t[10]=d-x*h}else if(e.order==="XZY"){let d=o*c,f=o*l,p=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+x,t[5]=o*u,t[9]=f*h-p,t[2]=p*h-f,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Px,e,Ix)}lookAt(e,t,i){let s=this.elements;return _n.subVectors(e,t),_n.lengthSq()===0&&(_n.z=1),_n.normalize(),Pi.crossVectors(i,_n),Pi.lengthSq()===0&&(Math.abs(i.z)===1?_n.x+=1e-4:_n.z+=1e-4,_n.normalize(),Pi.crossVectors(i,_n)),Pi.normalize(),fa.crossVectors(_n,Pi),s[0]=Pi.x,s[4]=fa.x,s[8]=_n.x,s[1]=Pi.y,s[5]=fa.y,s[9]=_n.y,s[2]=Pi.z,s[6]=fa.z,s[10]=_n.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],h=i[5],d=i[9],f=i[13],p=i[2],x=i[6],m=i[10],g=i[14],w=i[3],b=i[7],y=i[11],T=i[15],S=s[0],C=s[4],_=s[8],A=s[12],I=s[1],P=s[5],k=s[9],F=s[13],B=s[2],H=s[6],X=s[10],Y=s[14],V=s[3],j=s[7],W=s[11],ie=s[15];return r[0]=o*S+a*I+c*B+l*V,r[4]=o*C+a*P+c*H+l*j,r[8]=o*_+a*k+c*X+l*W,r[12]=o*A+a*F+c*Y+l*ie,r[1]=u*S+h*I+d*B+f*V,r[5]=u*C+h*P+d*H+f*j,r[9]=u*_+h*k+d*X+f*W,r[13]=u*A+h*F+d*Y+f*ie,r[2]=p*S+x*I+m*B+g*V,r[6]=p*C+x*P+m*H+g*j,r[10]=p*_+x*k+m*X+g*W,r[14]=p*A+x*F+m*Y+g*ie,r[3]=w*S+b*I+y*B+T*V,r[7]=w*C+b*P+y*H+T*j,r[11]=w*_+b*k+y*X+T*W,r[15]=w*A+b*F+y*Y+T*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],p=e[3],x=e[7],m=e[11],g=e[15],w=c*f-l*d,b=a*f-l*h,y=a*d-c*h,T=o*f-l*u,S=o*d-c*u,C=o*h-a*u;return t*(x*w-m*b+g*y)-i*(p*w-m*T+g*S)+s*(p*b-x*T+g*C)-r*(p*y-x*S+m*C)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],o=e[5],a=e[9],c=e[2],l=e[6],u=e[10];return t*(o*u-a*l)-i*(r*u-a*c)+s*(r*l-o*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],p=e[12],x=e[13],m=e[14],g=e[15],w=t*a-i*o,b=t*c-s*o,y=t*l-r*o,T=i*c-s*a,S=i*l-r*a,C=s*l-r*c,_=u*x-h*p,A=u*m-d*p,I=u*g-f*p,P=h*m-d*x,k=h*g-f*x,F=d*g-f*m,B=w*F-b*k+y*P+T*I-S*A+C*_;if(B===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/B;return e[0]=(a*F-c*k+l*P)*H,e[1]=(s*k-i*F-r*P)*H,e[2]=(x*C-m*S+g*T)*H,e[3]=(d*S-h*C-f*T)*H,e[4]=(c*I-o*F-l*A)*H,e[5]=(t*F-s*I+r*A)*H,e[6]=(m*y-p*C-g*b)*H,e[7]=(u*C-d*y+f*b)*H,e[8]=(o*k-a*I+l*_)*H,e[9]=(i*I-t*k-r*_)*H,e[10]=(p*S-x*y+g*w)*H,e[11]=(h*y-u*S-f*w)*H,e[12]=(a*A-o*P-c*_)*H,e[13]=(t*P-i*A+s*_)*H,e[14]=(x*b-p*T-m*w)*H,e[15]=(u*T-h*b+d*w)*H,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+i,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,d=r*l,f=r*u,p=r*h,x=o*u,m=o*h,g=a*h,w=c*l,b=c*u,y=c*h,T=i.x,S=i.y,C=i.z;return s[0]=(1-(x+g))*T,s[1]=(f+y)*T,s[2]=(p-b)*T,s[3]=0,s[4]=(f-y)*S,s[5]=(1-(d+g))*S,s[6]=(m+w)*S,s[7]=0,s[8]=(p+b)*C,s[9]=(m-w)*C,s[10]=(1-(d+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let o=Gs.set(s[0],s[1],s[2]).length(),a=Gs.set(s[4],s[5],s[6]).length(),c=Gs.set(s[8],s[9],s[10]).length();r<0&&(o=-o),zn.copy(this);let l=1/o,u=1/a,h=1/c;return zn.elements[0]*=l,zn.elements[1]*=l,zn.elements[2]*=l,zn.elements[4]*=u,zn.elements[5]*=u,zn.elements[6]*=u,zn.elements[8]*=h,zn.elements[9]*=h,zn.elements[10]*=h,t.setFromRotationMatrix(zn),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,s,r,o,a=Gn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),p,x;if(c)p=r/(o-r),x=o*r/(o-r);else if(a===Gn)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===nr)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Gn,c=!1){let l=this.elements,u=2/(t-e),h=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),p,x;if(c)p=1/(o-r),x=o/(o-r);else if(a===Gn)p=-2/(o-r),x=-(o+r)/(o-r);else if(a===nr)p=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Gs=new D,zn=new St,Px=new D(0,0,0),Ix=new D(1,1,1),Pi=new D,fa=new D,_n=new D,Qd=new St,ef=new bn,pi=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-tt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(tt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-tt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(tt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:ke("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Qd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Qd,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ef.setFromEuler(this),this.setFromQuaternion(ef,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pi.DEFAULT_ORDER="XYZ";var rr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Dx=0,tf=new D,Ws=new bn,ci=new St,pa=new D,Gr=new D,Lx=new D,Ox=new bn,nf=new D(1,0,0),sf=new D(0,1,0),rf=new D(0,0,1),of={type:"added"},Nx={type:"removed"},Xs={type:"childadded",child:null},uu={type:"childremoved",child:null},Ut=class n extends Wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Dx++}),this.uuid=Ts(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new D,t=new pi,i=new bn,s=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new St},normalMatrix:{value:new Ke}}),this.matrix=new St,this.matrixWorld=new St,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ws.setFromAxisAngle(e,t),this.quaternion.multiply(Ws),this}rotateOnWorldAxis(e,t){return Ws.setFromAxisAngle(e,t),this.quaternion.premultiply(Ws),this}rotateX(e){return this.rotateOnAxis(nf,e)}rotateY(e){return this.rotateOnAxis(sf,e)}rotateZ(e){return this.rotateOnAxis(rf,e)}translateOnAxis(e,t){return tf.copy(e).applyQuaternion(this.quaternion),this.position.add(tf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(nf,e)}translateY(e){return this.translateOnAxis(sf,e)}translateZ(e){return this.translateOnAxis(rf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ci.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?pa.copy(e):pa.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ci.lookAt(Gr,pa,this.up):ci.lookAt(pa,Gr,this.up),this.quaternion.setFromRotationMatrix(ci),s&&(ci.extractRotation(s.matrixWorld),Ws.setFromRotationMatrix(ci),this.quaternion.premultiply(Ws.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ve("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(of),Xs.child=e,this.dispatchEvent(Xs),Xs.child=null):Ve("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Nx),uu.child=e,this.dispatchEvent(uu),uu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ci.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ci.multiply(e.parent.matrixWorld)),e.applyMatrix4(ci),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(of),Xs.child=e,this.dispatchEvent(Xs),Xs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,e,Lx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,Ox,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),p=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=s,i;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};Ut.DEFAULT_UP=new D(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ct=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},Fx={type:"move"},or=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ct,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ct,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ct,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),g=this._getHandJoint(l,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,p=.005;l.inputState.pinching&&d>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Fx)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new ct;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},op={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},ma={h:0,s:0,l:0};function hu(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ge=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Nt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,at.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=at.workingColorSpace){return this.r=e,this.g=t,this.b=i,at.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=at.workingColorSpace){if(e=dh(e,1),t=tt(t,0,1),i=tt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=hu(o,r,e+1/3),this.g=hu(o,r,e),this.b=hu(o,r,e-1/3)}return at.colorSpaceToWorking(this,s),this}setStyle(e,t=Nt){function i(r){r!==void 0&&parseFloat(r)<1&&ke("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\\w+)\\(([^\\)]*)\\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\\s*(\\d*\\.?\\d+)\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ke("Color: Unknown color model "+e)}}else if(s=/^\\#([A-Fa-f\\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);ke("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Nt){let i=op[e.toLowerCase()];return i!==void 0?this.setHex(i,t):ke("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=fi(e.r),this.g=fi(e.g),this.b=fi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Nt){return at.workingToColorSpace(rn.copy(this),e),Math.round(tt(rn.r*255,0,255))*65536+Math.round(tt(rn.g*255,0,255))*256+Math.round(tt(rn.b*255,0,255))}getHexString(e=Nt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=at.workingColorSpace){at.workingToColorSpace(rn.copy(this),t);let i=rn.r,s=rn.g,r=rn.b,o=Math.max(i,s,r),a=Math.min(i,s,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=at.workingColorSpace){return at.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Nt){at.workingToColorSpace(rn.copy(this),e);let t=rn.r,i=rn.g,s=rn.b;return e!==Nt?\`color(\${e} \${t.toFixed(3)} \${i.toFixed(3)} \${s.toFixed(3)})\`:\`rgb(\${Math.round(t*255)},\${Math.round(i*255)},\${Math.round(s*255)})\`}offsetHSL(e,t,i){return this.getHSL(Ii),this.setHSL(Ii.h+e,Ii.s+t,Ii.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ii),e.getHSL(ma);let i=jr(Ii.h,ma.h,t),s=jr(Ii.s,ma.s,t),r=jr(Ii.l,ma.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new Ge;Ge.NAMES=op;var io=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Hn=new D,li=new D,du=new D,ui=new D,qs=new D,Ys=new D,af=new D,fu=new D,pu=new D,mu=new D,gu=new wt,xu=new wt,vu=new wt,Fi=class n{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Hn.subVectors(e,t),s.cross(Hn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Hn.subVectors(s,t),li.subVectors(i,t),du.subVectors(e,t);let o=Hn.dot(Hn),a=Hn.dot(li),c=Hn.dot(du),l=li.dot(li),u=li.dot(du),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(l*c-a*u)*d,p=(o*u-a*c)*d;return r.set(1-f-p,p,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,ui)===null?!1:ui.x>=0&&ui.y>=0&&ui.x+ui.y<=1}static getInterpolation(e,t,i,s,r,o,a,c){return this.getBarycoord(e,t,i,s,ui)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,ui.x),c.addScaledVector(o,ui.y),c.addScaledVector(a,ui.z),c)}static getInterpolatedAttribute(e,t,i,s,r,o){return gu.setScalar(0),xu.setScalar(0),vu.setScalar(0),gu.fromBufferAttribute(e,t),xu.fromBufferAttribute(e,i),vu.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(gu,r.x),o.addScaledVector(xu,r.y),o.addScaledVector(vu,r.z),o}static isFrontFacing(e,t,i,s){return Hn.subVectors(i,t),li.subVectors(e,t),Hn.cross(li).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Hn.subVectors(this.c,this.b),li.subVectors(this.a,this.b),Hn.cross(li).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;qs.subVectors(s,i),Ys.subVectors(r,i),fu.subVectors(e,i);let c=qs.dot(fu),l=Ys.dot(fu);if(c<=0&&l<=0)return t.copy(i);pu.subVectors(e,s);let u=qs.dot(pu),h=Ys.dot(pu);if(u>=0&&h<=u)return t.copy(s);let d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector(qs,o);mu.subVectors(e,r);let f=qs.dot(mu),p=Ys.dot(mu);if(p>=0&&f<=p)return t.copy(r);let x=f*l-c*p;if(x<=0&&l>=0&&p<=0)return a=l/(l-p),t.copy(i).addScaledVector(Ys,a);let m=u*p-f*h;if(m<=0&&h-u>=0&&f-p>=0)return af.subVectors(r,s),a=(h-u)/(h-u+(f-p)),t.copy(s).addScaledVector(af,a);let g=1/(m+x+d);return o=x*g,a=d*g,t.copy(i).addScaledVector(qs,o).addScaledVector(Ys,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},zt=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Vn):Vn.fromBufferAttribute(r,o),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ga.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ga.copy(i.boundingBox)),ga.applyMatrix4(e.matrixWorld),this.union(ga)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wr),xa.subVectors(this.max,Wr),$s.subVectors(e.a,Wr),js.subVectors(e.b,Wr),Zs.subVectors(e.c,Wr),Di.subVectors(js,$s),Li.subVectors(Zs,js),cs.subVectors($s,Zs);let t=[0,-Di.z,Di.y,0,-Li.z,Li.y,0,-cs.z,cs.y,Di.z,0,-Di.x,Li.z,0,-Li.x,cs.z,0,-cs.x,-Di.y,Di.x,0,-Li.y,Li.x,0,-cs.y,cs.x,0];return!_u(t,$s,js,Zs,xa)||(t=[1,0,0,0,1,0,0,0,1],!_u(t,$s,js,Zs,xa))?!1:(va.crossVectors(Di,Li),t=[va.x,va.y,va.z],_u(t,$s,js,Zs,xa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(hi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},hi=[new D,new D,new D,new D,new D,new D,new D,new D],Vn=new D,ga=new zt,$s=new D,js=new D,Zs=new D,Di=new D,Li=new D,cs=new D,Wr=new D,xa=new D,va=new D,ls=new D;function _u(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){ls.fromArray(n,r);let a=s.x*Math.abs(ls.x)+s.y*Math.abs(ls.y)+s.z*Math.abs(ls.z),c=e.dot(ls),l=t.dot(ls),u=i.dot(ls);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Ft=new D,_a=new ae,Ux=0,Jt=class extends Wn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ux++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Fu,this.updateRanges=[],this.gpuType=qn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)_a.fromBufferAttribute(this,t),_a.applyMatrix3(e),this.setXY(t,_a.x,_a.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix3(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=er(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ln(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=er(t,this.array)),t}setX(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=er(t,this.array)),t}setY(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=er(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=er(t,this.array)),t}setW(e,t){return this.normalized&&(t=ln(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),i=ln(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),i=ln(i,this.array),s=ln(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=ln(t,this.array),i=ln(i,this.array),s=ln(s,this.array),r=ln(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Fu&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var so=class extends Jt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ro=class extends Jt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var ht=class extends Jt{constructor(e,t,i){super(new Float32Array(e),t,i)}},Bx=new zt,Xr=new D,yu=new D,ar=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Bx.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Xr.subVectors(e,this.center);let t=Xr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Xr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(yu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Xr.copy(e.center).add(yu)),this.expandByPoint(Xr.copy(e.center).sub(yu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},kx=0,On=new St,bu=new Ut,Ks=new D,yn=new zt,qr=new zt,$t=new D,Ht=class n extends Wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kx++}),this.uuid=Ts(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(lx(e)?ro:so)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ke().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return On.makeRotationFromQuaternion(e),this.applyMatrix4(On),this}rotateX(e){return On.makeRotationX(e),this.applyMatrix4(On),this}rotateY(e){return On.makeRotationY(e),this.applyMatrix4(On),this}rotateZ(e){return On.makeRotationZ(e),this.applyMatrix4(On),this}translate(e,t,i){return On.makeTranslation(e,t,i),this.applyMatrix4(On),this}scale(e,t,i){return On.makeScale(e,t,i),this.applyMatrix4(On),this}lookAt(e){return bu.lookAt(e),bu.updateMatrix(),this.applyMatrix4(bu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ks).negate(),this.translate(Ks.x,Ks.y,Ks.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ht(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&ke("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];yn.setFromBufferAttribute(r),this.morphTargetsRelative?($t.addVectors(this.boundingBox.min,yn.min),this.boundingBox.expandByPoint($t),$t.addVectors(this.boundingBox.max,yn.max),this.boundingBox.expandByPoint($t)):(this.boundingBox.expandByPoint(yn.min),this.boundingBox.expandByPoint(yn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ve('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ar);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ve("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let i=this.boundingSphere.center;if(yn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];qr.setFromBufferAttribute(a),this.morphTargetsRelative?($t.addVectors(yn.min,qr.min),yn.expandByPoint($t),$t.addVectors(yn.max,qr.max),yn.expandByPoint($t)):(yn.expandByPoint(qr.min),yn.expandByPoint(qr.max))}yn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)$t.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared($t));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)$t.fromBufferAttribute(a,l),c&&(Ks.fromBufferAttribute(e,l),$t.add(Ks)),s=Math.max(s,i.distanceToSquared($t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ve('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ve("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new Jt(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let _=0;_<i.count;_++)a[_]=new D,c[_]=new D;let l=new D,u=new D,h=new D,d=new ae,f=new ae,p=new ae,x=new D,m=new D;function g(_,A,I){l.fromBufferAttribute(i,_),u.fromBufferAttribute(i,A),h.fromBufferAttribute(i,I),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,A),p.fromBufferAttribute(r,I),u.sub(l),h.sub(l),f.sub(d),p.sub(d);let P=1/(f.x*p.y-p.x*f.y);isFinite(P)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(h,-f.y).multiplyScalar(P),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-p.x).multiplyScalar(P),a[_].add(x),a[A].add(x),a[I].add(x),c[_].add(m),c[A].add(m),c[I].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let _=0,A=w.length;_<A;++_){let I=w[_],P=I.start,k=I.count;for(let F=P,B=P+k;F<B;F+=3)g(e.getX(F+0),e.getX(F+1),e.getX(F+2))}let b=new D,y=new D,T=new D,S=new D;function C(_){T.fromBufferAttribute(s,_),S.copy(T);let A=a[_];b.copy(A),b.sub(T.multiplyScalar(T.dot(A))).normalize(),y.crossVectors(S,A);let P=y.dot(c[_])<0?-1:1;o.setXYZW(_,b.x,b.y,b.z,P)}for(let _=0,A=w.length;_<A;++_){let I=w[_],P=I.start,k=I.count;for(let F=P,B=P+k;F<B;F+=3)C(e.getX(F+0)),C(e.getX(F+1)),C(e.getX(F+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Jt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new D,r=new D,o=new D,a=new D,c=new D,l=new D,u=new D,h=new D;if(e)for(let d=0,f=e.count;d<f;d+=3){let p=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,p),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),a.add(u),c.add(u),l.add(u),i.setXYZ(p,a.x,a.y,a.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)$t.fromBufferAttribute(e,t),$t.normalize(),e.setXYZ(t,$t.x,$t.y,$t.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u),f=0,p=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*u;for(let g=0;g<u;g++)d[p++]=l[f++]}return new Jt(d,u,h)}if(this.index===null)return ke("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,i);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let d=l[u],f=e(d,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){let f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var zx=0,Bi=class extends Wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zx++}),this.uuid=Ts(),this.name="",this.type="Material",this.blending=ps,this.side=dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fa,this.blendDst=Ua,this.blendEquation=Ui,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ge(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ds,this.stencilZFail=ds,this.stencilZPass=ds,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){ke(\`Material: parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){ke(\`Material: '\${t}' is not a property of THREE.\${this.type}.\`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ps&&(i.blending=this.blending),this.side!==dn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Fa&&(i.blendSrc=this.blendSrc),this.blendDst!==Ua&&(i.blendDst=this.blendDst),this.blendEquation!==Ui&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ms&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Nu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ds&&(i.stencilFail=this.stencilFail),this.stencilZFail!==ds&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==ds&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ge().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ae().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ae().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var di=new D,Mu=new D,ya=new D,Oi=new D,Su=new D,ba=new D,Eu=new D,vs=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,di)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=di.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(di.copy(this.origin).addScaledVector(this.direction,t),di.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Mu.copy(e).add(t).multiplyScalar(.5),ya.copy(t).sub(e).normalize(),Oi.copy(this.origin).sub(Mu);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ya),a=Oi.dot(this.direction),c=-Oi.dot(ya),l=Oi.lengthSq(),u=Math.abs(1-o*o),h,d,f,p;if(u>0)if(h=o*c-a,d=o*a-c,p=r*u,h>=0)if(d>=-p)if(d<=p){let x=1/u;h*=x,d*=x,f=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d<=-p?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l):d<=p?(h=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Mu).addScaledVector(ya,d),f}intersectSphere(e,t){di.subVectors(e.center,this.origin);let i=di.dot(this.direction),s=di.dot(di)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,di)!==null}intersectTriangle(e,t,i,s,r){Su.subVectors(t,e),ba.subVectors(i,e),Eu.crossVectors(Su,ba);let o=this.direction.dot(Eu),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Oi.subVectors(this.origin,e);let c=a*this.direction.dot(ba.crossVectors(Oi,ba));if(c<0)return null;let l=a*this.direction.dot(Su.cross(Oi));if(l<0||c+l>o)return null;let u=-a*Oi.dot(Eu);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qt=class extends Bi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ge(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=ju,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},cf=new St,us=new vs,Ma=new ar,lf=new D,Sa=new D,Ea=new D,wa=new D,wu=new D,Ta=new D,uf=new D,Aa=new D,nt=class extends Ut{constructor(e=new Ht,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Ta.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(wu.fromBufferAttribute(h,e),o?Ta.addScaledVector(wu,u):Ta.addScaledVector(wu.sub(t),u))}t.add(Ta)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ma.copy(i.boundingSphere),Ma.applyMatrix4(r),us.copy(e.ray).recast(e.near),!(Ma.containsPoint(us.origin)===!1&&(us.intersectSphere(Ma,lf)===null||us.origin.distanceToSquared(lf)>(e.far-e.near)**2))&&(cf.copy(r).invert(),us.copy(e.ray).applyMatrix4(cf),!(i.boundingBox!==null&&us.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,us)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=o[m.materialIndex],w=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=w,T=b;y<T;y+=3){let S=a.getX(y),C=a.getX(y+1),_=a.getX(y+2);s=Ca(this,g,e,i,l,u,h,S,C,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let w=a.getX(m),b=a.getX(m+1),y=a.getX(m+2);s=Ca(this,o,e,i,l,u,h,w,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=o[m.materialIndex],w=Math.max(m.start,f.start),b=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let y=w,T=b;y<T;y+=3){let S=y,C=y+1,_=y+2;s=Ca(this,g,e,i,l,u,h,S,C,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let w=m,b=m+1,y=m+2;s=Ca(this,o,e,i,l,u,h,w,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Hx(n,e,t,i,s,r,o,a){let c;if(e.side===un?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,e.side===dn,a),c===null)return null;Aa.copy(a),Aa.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Aa);return l<t.near||l>t.far?null:{distance:l,point:Aa.clone(),object:n}}function Ca(n,e,t,i,s,r,o,a,c,l){n.getVertexPosition(a,Sa),n.getVertexPosition(c,Ea),n.getVertexPosition(l,wa);let u=Hx(n,e,t,i,Sa,Ea,wa,uf);if(u){let h=new D;Fi.getBarycoord(uf,Sa,Ea,wa,h),s&&(u.uv=Fi.getInterpolatedAttribute(s,a,c,l,h,new ae)),r&&(u.uv1=Fi.getInterpolatedAttribute(r,a,c,l,h,new ae)),o&&(u.normal=Fi.getInterpolatedAttribute(o,a,c,l,h,new D),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new D,materialIndex:0};Fi.getNormal(Sa,Ea,wa,d.normal),u.face=d,u.barycoord=h}return u}var ei=class extends fn{constructor(e=null,t=1,i=1,s,r,o,a,c,l=jt,u=jt,h,d){super(null,o,a,c,l,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Tu=new D,Vx=new D,Gx=new Ke,Nn=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Tu.subVectors(i,t).cross(Vx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(Tu),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Gx.getNormalMatrix(e),s=this.coplanarPoint(Tu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},hs=new ar,Wx=new ae(.5,.5),Ra=new D,cr=class{constructor(e=new Nn,t=new Nn,i=new Nn,s=new Nn,r=new Nn,o=new Nn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Gn,i=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],h=r[5],d=r[6],f=r[7],p=r[8],x=r[9],m=r[10],g=r[11],w=r[12],b=r[13],y=r[14],T=r[15];if(s[0].setComponents(l-o,f-u,g-p,T-w).normalize(),s[1].setComponents(l+o,f+u,g+p,T+w).normalize(),s[2].setComponents(l+a,f+h,g+x,T+b).normalize(),s[3].setComponents(l-a,f-h,g-x,T-b).normalize(),i)s[4].setComponents(c,d,m,y).normalize(),s[5].setComponents(l-c,f-d,g-m,T-y).normalize();else if(s[4].setComponents(l-c,f-d,g-m,T-y).normalize(),t===Gn)s[5].setComponents(l+c,f+d,g+m,T+y).normalize();else if(t===nr)s[5].setComponents(c,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),hs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),hs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(hs)}intersectsSprite(e){hs.center.set(0,0,0);let t=Wx.distanceTo(e.center);return hs.radius=.7071067811865476+t,hs.applyMatrix4(e.matrixWorld),this.intersectsSphere(hs)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Ra.x=s.normal.x>0?e.max.x:e.min.x,Ra.y=s.normal.y>0?e.max.y:e.min.y,Ra.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ra)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var oo=class extends fn{constructor(e=[],t=Xi,i,s,r,o,a,c,l,u){super(e,t,i,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var mi=class extends fn{constructor(e,t,i=Xn,s,r,o,a=jt,c=jt,l,u=Qn,h=1){if(u!==Qn&&u!==qi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,s,r,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Za=class extends mi{constructor(e,t=Xn,i=Xi,s,r,o=jt,a=jt,c,l=Qn){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,c,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ao=class extends fn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Vt=class n extends Ht{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],d=0,f=0;p("z","y","x",-1,-1,i,t,e,o,r,0),p("z","y","x",1,-1,i,t,-e,o,r,1),p("x","z","y",1,1,e,i,t,s,o,2),p("x","z","y",1,-1,e,i,-t,s,o,3),p("x","y","z",1,-1,e,t,i,s,r,4),p("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new ht(l,3)),this.setAttribute("normal",new ht(u,3)),this.setAttribute("uv",new ht(h,2));function p(x,m,g,w,b,y,T,S,C,_,A){let I=y/C,P=T/_,k=y/2,F=T/2,B=S/2,H=C+1,X=_+1,Y=0,V=0,j=new D;for(let W=0;W<X;W++){let ie=W*P-F;for(let J=0;J<H;J++){let Ee=J*I-k;j[x]=Ee*w,j[m]=ie*b,j[g]=B,l.push(j.x,j.y,j.z),j[x]=0,j[m]=0,j[g]=S>0?1:-1,u.push(j.x,j.y,j.z),h.push(J/C),h.push(1-W/_),Y+=1}}for(let W=0;W<_;W++)for(let ie=0;ie<C;ie++){let J=d+ie+H*W,Ee=d+ie+H*(W+1),Ye=d+(ie+1)+H*(W+1),qe=d+(ie+1)+H*W;c.push(J,Ee,qe),c.push(Ee,Ye,qe),V+=6}a.addGroup(f,V,A),f+=V,d+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var gi=class n extends Ht{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],p=0,x=[],m=i/2,g=0;w(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new ht(h,3)),this.setAttribute("normal",new ht(d,3)),this.setAttribute("uv",new ht(f,2));function w(){let y=new D,T=new D,S=0,C=(t-e)/i;for(let _=0;_<=r;_++){let A=[],I=_/r,P=I*(t-e)+e;for(let k=0;k<=s;k++){let F=k/s,B=F*c+a,H=Math.sin(B),X=Math.cos(B);T.x=P*H,T.y=-I*i+m,T.z=P*X,h.push(T.x,T.y,T.z),y.set(H,C,X).normalize(),d.push(y.x,y.y,y.z),f.push(F,1-I),A.push(p++)}x.push(A)}for(let _=0;_<s;_++)for(let A=0;A<r;A++){let I=x[A][_],P=x[A+1][_],k=x[A+1][_+1],F=x[A][_+1];(e>0||A!==0)&&(u.push(I,P,F),S+=3),(t>0||A!==r-1)&&(u.push(P,k,F),S+=3)}l.addGroup(g,S,0),g+=S}function b(y){let T=p,S=new ae,C=new D,_=0,A=y===!0?e:t,I=y===!0?1:-1;for(let k=1;k<=s;k++)h.push(0,m*I,0),d.push(0,I,0),f.push(.5,.5),p++;let P=p;for(let k=0;k<=s;k++){let B=k/s*c+a,H=Math.cos(B),X=Math.sin(B);C.x=A*X,C.y=m*I,C.z=A*H,h.push(C.x,C.y,C.z),d.push(0,I,0),S.x=H*.5+.5,S.y=X*.5*I+.5,f.push(S.x,S.y),p++}for(let k=0;k<s;k++){let F=T+k,B=P+k;y===!0?u.push(B,B+1,F):u.push(B+1,B,F),_+=3}l.addGroup(g,_,y===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){ke("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=i[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===o)return s/(r-1);let u=i[s],d=i[s+1]-u,f=(o-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=t||(o.isVector2?new ae:new D);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new D,s=[],r=[],o=[],a=new D,c=new St;for(let f=0;f<=e;f++){let p=f/e;s[f]=this.getTangentAt(p,new D)}r[0]=new D,o[0]=new D;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=l&&(l=u,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),d<=l&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(tt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,p))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(tt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],f*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},lr=class extends Sn{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new ae){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*u-f*h+this.aX,l=d*h+f*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ka=class extends lr{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function fh(){let n=0,e=0,t=0,i=0;function s(r,o,a,c){n=r,e=a,t=-3*r+3*o-2*a-c,i=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,u,h){let d=(o-r)/l-(a-r)/(l+u)+(a-o)/u,f=(a-o)/u-(c-o)/(u+h)+(c-a)/h;d*=u,f*=u,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var hf=new D,df=new D,Au=new fh,Cu=new fh,Ru=new fh,Ja=class extends Sn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new D){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,u;this.closed||a>0?l=s[(a-1)%r]:(df.subVectors(s[0],s[1]).add(s[0]),l=df);let h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(hf.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=hf),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(l.distanceToSquared(h),f),x=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),Au.initNonuniformCatmullRom(l.x,h.x,d.x,u.x,p,x,m),Cu.initNonuniformCatmullRom(l.y,h.y,d.y,u.y,p,x,m),Ru.initNonuniformCatmullRom(l.z,h.z,d.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(Au.initCatmullRom(l.x,h.x,d.x,u.x,this.tension),Cu.initCatmullRom(l.y,h.y,d.y,u.y,this.tension),Ru.initCatmullRom(l.z,h.z,d.z,u.z,this.tension));return i.set(Au.calc(c),Cu.calc(c),Ru.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ff(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,c=n*a;return(2*t-2*i+r+o)*c+(-3*t+3*i-2*r-o)*a+r*n+t}function Xx(n,e){let t=1-n;return t*t*e}function qx(n,e){return 2*(1-n)*n*e}function Yx(n,e){return n*n*e}function Zr(n,e,t,i){return Xx(n,e)+qx(n,t)+Yx(n,i)}function $x(n,e){let t=1-n;return t*t*t*e}function jx(n,e){let t=1-n;return 3*t*t*n*e}function Zx(n,e){return 3*(1-n)*n*n*e}function Kx(n,e){return n*n*n*e}function Kr(n,e,t,i,s){return $x(n,e)+jx(n,t)+Zx(n,i)+Kx(n,s)}var co=class extends Sn{constructor(e=new ae,t=new ae,i=new ae,s=new ae){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ae){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Kr(e,s.x,r.x,o.x,a.x),Kr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Qa=class extends Sn{constructor(e=new D,t=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Kr(e,s.x,r.x,o.x,a.x),Kr(e,s.y,r.y,o.y,a.y),Kr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},lo=class extends Sn{constructor(e=new ae,t=new ae){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ae){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ae){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ec=class extends Sn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},uo=class extends Sn{constructor(e=new ae,t=new ae,i=new ae){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ae){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Zr(e,s.x,r.x,o.x),Zr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},tc=class extends Sn{constructor(e=new D,t=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Zr(e,s.x,r.x,o.x),Zr(e,s.y,r.y,o.y),Zr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ho=class extends Sn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ae){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return i.set(ff(a,c.x,l.x,u.x,h.x),ff(a,c.y,l.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new ae().fromArray(s))}return this}},Uu=Object.freeze({__proto__:null,ArcCurve:Ka,CatmullRomCurve3:Ja,CubicBezierCurve:co,CubicBezierCurve3:Qa,EllipseCurve:lr,LineCurve:lo,LineCurve3:ec,QuadraticBezierCurve:uo,QuadraticBezierCurve3:tc,SplineCurve:ho}),nc=class extends Sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Uu[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Uu[s.type]().fromJSON(s))}return this}},fo=class extends nc{constructor(e){super(),this.type="Path",this.currentPoint=new ae,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new lo(this.currentPoint.clone(),new ae(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new uo(this.currentPoint.clone(),new ae(e,t),new ae(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new co(this.currentPoint.clone(),new ae(e,t),new ae(i,s),new ae(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new ho(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,s,r,o,a,c),this}absellipse(e,t,i,s,r,o,a,c){let l=new lr(e,t,i,s,r,o,a,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},En=class extends fo{constructor(e){super(e),this.uuid=Ts(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new fo().fromJSON(s))}return this}};function Jx(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=ap(n,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(i&&(r=iv(n,e,r,t)),n.length>80*t){a=n[0],c=n[1];let u=a,h=c;for(let d=t;d<s;d+=t){let f=n[d],p=n[d+1];f<a&&(a=f),p<c&&(c=p),f>u&&(u=f),p>h&&(h=p)}l=Math.max(u-a,h-c),l=l!==0?32767/l:0}return po(r,o,t,a,c,l,0),o}function ap(n,e,t,i,s){let r;if(s===pv(n,e,t,i)>0)for(let o=e;o<t;o+=i)r=pf(o/i|0,n[o],n[o+1],r);else for(let o=t-i;o>=e;o-=i)r=pf(o/i|0,n[o],n[o+1],r);return r&&ur(r,r.next)&&(go(r),r=r.next),r}function _s(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(ur(t,t.next)||Tt(t.prev,t,t.next)===0)){if(go(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function po(n,e,t,i,s,r,o){if(!n)return;!o&&r&&cv(n,i,s,r);let a=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(r?ev(n,i,s,r):Qx(n)){e.push(c.i,n.i,l.i),go(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=tv(_s(n),e),po(n,e,t,i,s,r,2)):o===2&&nv(n,e,t,i,s,r):po(_s(n),e,t,i,s,r,1);break}}}function Qx(n){let e=n.prev,t=n,i=n.next;if(Tt(e,t,i)>=0)return!1;let s=e.x,r=t.x,o=i.x,a=e.y,c=t.y,l=i.y,u=Math.min(s,r,o),h=Math.min(a,c,l),d=Math.max(s,r,o),f=Math.max(a,c,l),p=i.next;for(;p!==e;){if(p.x>=u&&p.x<=d&&p.y>=h&&p.y<=f&&Yr(s,a,r,c,o,l,p.x,p.y)&&Tt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function ev(n,e,t,i){let s=n.prev,r=n,o=n.next;if(Tt(s,r,o)>=0)return!1;let a=s.x,c=r.x,l=o.x,u=s.y,h=r.y,d=o.y,f=Math.min(a,c,l),p=Math.min(u,h,d),x=Math.max(a,c,l),m=Math.max(u,h,d),g=Bu(f,p,e,t,i),w=Bu(x,m,e,t,i),b=n.prevZ,y=n.nextZ;for(;b&&b.z>=g&&y&&y.z<=w;){if(b.x>=f&&b.x<=x&&b.y>=p&&b.y<=m&&b!==s&&b!==o&&Yr(a,u,c,h,l,d,b.x,b.y)&&Tt(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=f&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Yr(a,u,c,h,l,d,y.x,y.y)&&Tt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=g;){if(b.x>=f&&b.x<=x&&b.y>=p&&b.y<=m&&b!==s&&b!==o&&Yr(a,u,c,h,l,d,b.x,b.y)&&Tt(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=w;){if(y.x>=f&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==o&&Yr(a,u,c,h,l,d,y.x,y.y)&&Tt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function tv(n,e){let t=n;do{let i=t.prev,s=t.next.next;!ur(i,s)&&lp(i,t,t.next,s)&&mo(i,s)&&mo(s,i)&&(e.push(i.i,t.i,s.i),go(t),go(t.next),t=n=s),t=t.next}while(t!==n);return _s(t)}function nv(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&hv(o,a)){let c=up(o,a);o=_s(o,o.next),c=_s(c,c.next),po(o,e,t,i,s,r,0),po(c,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function iv(n,e,t,i){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*i,c=r<o-1?e[r+1]*i:n.length,l=ap(n,a,c,i,!1);l===l.next&&(l.steiner=!0),s.push(uv(l))}s.sort(sv);for(let r=0;r<s.length;r++)t=rv(s[r],t);return t}function sv(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function rv(n,e){let t=ov(n,e);if(!t)return e;let i=up(t,n);return _s(i,i.next),_s(t,t.next)}function ov(n,e){let t=e,i=n.x,s=n.y,r=-1/0,o;if(ur(n,t))return t;do{if(ur(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>r&&(r=h,o=t.x<t.next.x?t:t.next,h===i))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,c=o.x,l=o.y,u=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&cp(s<l?i:r,s,c,l,s<l?r:i,s,t.x,t.y)){let h=Math.abs(s-t.y)/(i-t.x);mo(t,n)&&(h<u||h===u&&(t.x>o.x||t.x===o.x&&av(o,t)))&&(o=t,u=h)}t=t.next}while(t!==a);return o}function av(n,e){return Tt(n.prev,n,e.prev)<0&&Tt(e.next,n,n.next)<0}function cv(n,e,t,i){let s=n;do s.z===0&&(s.z=Bu(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,lv(s)}function lv(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(s=i,i=i.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=o}r.nextZ=null,t*=2}while(e>1);return n}function Bu(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function uv(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function cp(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function Yr(n,e,t,i,s,r,o,a){return!(n===o&&e===a)&&cp(n,e,t,i,s,r,o,a)}function hv(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!dv(n,e)&&(mo(n,e)&&mo(e,n)&&fv(n,e)&&(Tt(n.prev,n,e.prev)||Tt(n,e.prev,e))||ur(n,e)&&Tt(n.prev,n,n.next)>0&&Tt(e.prev,e,e.next)>0)}function Tt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function ur(n,e){return n.x===e.x&&n.y===e.y}function lp(n,e,t,i){let s=Ia(Tt(n,e,t)),r=Ia(Tt(n,e,i)),o=Ia(Tt(t,i,n)),a=Ia(Tt(t,i,e));return!!(s!==r&&o!==a||s===0&&Pa(n,t,e)||r===0&&Pa(n,i,e)||o===0&&Pa(t,n,i)||a===0&&Pa(t,e,i))}function Pa(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Ia(n){return n>0?1:n<0?-1:0}function dv(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&lp(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function mo(n,e){return Tt(n.prev,n,n.next)<0?Tt(n,e,n.next)>=0&&Tt(n,n.prev,e)>=0:Tt(n,e,n.prev)<0||Tt(n,n.next,e)<0}function fv(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function up(n,e){let t=ku(n.i,n.x,n.y),i=ku(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function pf(n,e,t,i){let s=ku(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function go(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function ku(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function pv(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}var zu=class{static triangulate(e,t,i=2){return Jx(e,t,i)}},Fn=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];mf(e),gf(i,e);let o=e.length;t.forEach(mf);for(let c=0;c<t.length;c++)s.push(o),o+=t[c].length,gf(i,t[c]);let a=zu.triangulate(i,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function mf(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function gf(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var xi=class n extends Ht{constructor(e=new En([new ae(.5,.5),new ae(-.5,.5),new ae(-.5,-.5),new ae(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let a=0,c=e.length;a<c;a++){let l=e[a];o(l)}this.setAttribute("position",new ht(s,3)),this.setAttribute("uv",new ht(r,2)),this.computeVertexNormals();function o(a){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:f-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:mv,b,y=!1,T,S,C,_;if(g){b=g.getSpacedPoints(u),y=!0,d=!1;let re=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(u,re),S=new D,C=new D,_=new D}d||(m=0,f=0,p=0,x=0);let A=a.extractPoints(l),I=A.shape,P=A.holes;if(!Fn.isClockWise(I)){I=I.reverse();for(let re=0,ce=P.length;re<ce;re++){let ne=P[re];Fn.isClockWise(ne)&&(P[re]=ne.reverse())}}function F(re){let ne=10000000000000001e-36,fe=re[0];for(let ge=1;ge<=re.length;ge++){let Be=ge%re.length,Oe=re[Be],We=Oe.x-fe.x,Xe=Oe.y-fe.y,N=We*We+Xe*Xe,dt=Math.max(Math.abs(Oe.x),Math.abs(Oe.y),Math.abs(fe.x),Math.abs(fe.y)),Qe=ne*dt*dt;if(N<=Qe){re.splice(Be,1),ge--;continue}fe=Oe}}F(I),P.forEach(F);let B=P.length,H=I;for(let re=0;re<B;re++){let ce=P[re];I=I.concat(ce)}function X(re,ce,ne){return ce||Ve("ExtrudeGeometry: vec does not exist"),re.clone().addScaledVector(ce,ne)}let Y=I.length;function V(re,ce,ne){let fe,ge,Be,Oe=re.x-ce.x,We=re.y-ce.y,Xe=ne.x-re.x,N=ne.y-re.y,dt=Oe*Oe+We*We,Qe=Oe*N-We*Xe;if(Math.abs(Qe)>Number.EPSILON){let R=Math.sqrt(dt),v=Math.sqrt(Xe*Xe+N*N),G=ce.x-We/R,q=ce.y+Oe/R,$=ne.x-N/v,he=ne.y+Xe/v,de=(($-G)*N-(he-q)*Xe)/(Oe*N-We*Xe);fe=G+Oe*de-re.x,ge=q+We*de-re.y;let Z=fe*fe+ge*ge;if(Z<=2)return new ae(fe,ge);Be=Math.sqrt(Z/2)}else{let R=!1;Oe>Number.EPSILON?Xe>Number.EPSILON&&(R=!0):Oe<-Number.EPSILON?Xe<-Number.EPSILON&&(R=!0):Math.sign(We)===Math.sign(N)&&(R=!0),R?(fe=-We,ge=Oe,Be=Math.sqrt(dt)):(fe=Oe,ge=We,Be=Math.sqrt(dt/2))}return new ae(fe/Be,ge/Be)}let j=[];for(let re=0,ce=H.length,ne=ce-1,fe=re+1;re<ce;re++,ne++,fe++)ne===ce&&(ne=0),fe===ce&&(fe=0),j[re]=V(H[re],H[ne],H[fe]);let W=[],ie,J=j.concat();for(let re=0,ce=B;re<ce;re++){let ne=P[re];ie=[];for(let fe=0,ge=ne.length,Be=ge-1,Oe=fe+1;fe<ge;fe++,Be++,Oe++)Be===ge&&(Be=0),Oe===ge&&(Oe=0),ie[fe]=V(ne[fe],ne[Be],ne[Oe]);W.push(ie),J=J.concat(ie)}let Ee;if(m===0)Ee=Fn.triangulateShape(H,P);else{let re=[],ce=[];for(let ne=0;ne<m;ne++){let fe=ne/m,ge=f*Math.cos(fe*Math.PI/2),Be=p*Math.sin(fe*Math.PI/2)+x;for(let Oe=0,We=H.length;Oe<We;Oe++){let Xe=X(H[Oe],j[Oe],Be);Re(Xe.x,Xe.y,-ge),fe===0&&re.push(Xe)}for(let Oe=0,We=B;Oe<We;Oe++){let Xe=P[Oe];ie=W[Oe];let N=[];for(let dt=0,Qe=Xe.length;dt<Qe;dt++){let R=X(Xe[dt],ie[dt],Be);Re(R.x,R.y,-ge),fe===0&&N.push(R)}fe===0&&ce.push(N)}}Ee=Fn.triangulateShape(re,ce)}let Ye=Ee.length,qe=p+x;for(let re=0;re<Y;re++){let ce=d?X(I[re],J[re],qe):I[re];y?(C.copy(T.normals[0]).multiplyScalar(ce.x),S.copy(T.binormals[0]).multiplyScalar(ce.y),_.copy(b[0]).add(C).add(S),Re(_.x,_.y,_.z)):Re(ce.x,ce.y,0)}for(let re=1;re<=u;re++)for(let ce=0;ce<Y;ce++){let ne=d?X(I[ce],J[ce],qe):I[ce];y?(C.copy(T.normals[re]).multiplyScalar(ne.x),S.copy(T.binormals[re]).multiplyScalar(ne.y),_.copy(b[re]).add(C).add(S),Re(_.x,_.y,_.z)):Re(ne.x,ne.y,h/u*re)}for(let re=m-1;re>=0;re--){let ce=re/m,ne=f*Math.cos(ce*Math.PI/2),fe=p*Math.sin(ce*Math.PI/2)+x;for(let ge=0,Be=H.length;ge<Be;ge++){let Oe=X(H[ge],j[ge],fe);Re(Oe.x,Oe.y,h+ne)}for(let ge=0,Be=P.length;ge<Be;ge++){let Oe=P[ge];ie=W[ge];for(let We=0,Xe=Oe.length;We<Xe;We++){let N=X(Oe[We],ie[We],fe);y?Re(N.x,N.y+b[u-1].y,b[u-1].x+ne):Re(N.x,N.y,h+ne)}}}K(),le();function K(){let re=s.length/3;if(d){let ce=0,ne=Y*ce;for(let fe=0;fe<Ye;fe++){let ge=Ee[fe];He(ge[2]+ne,ge[1]+ne,ge[0]+ne)}ce=u+m*2,ne=Y*ce;for(let fe=0;fe<Ye;fe++){let ge=Ee[fe];He(ge[0]+ne,ge[1]+ne,ge[2]+ne)}}else{for(let ce=0;ce<Ye;ce++){let ne=Ee[ce];He(ne[2],ne[1],ne[0])}for(let ce=0;ce<Ye;ce++){let ne=Ee[ce];He(ne[0]+Y*u,ne[1]+Y*u,ne[2]+Y*u)}}i.addGroup(re,s.length/3-re,0)}function le(){let re=s.length/3,ce=0;oe(H,ce),ce+=H.length;for(let ne=0,fe=P.length;ne<fe;ne++){let ge=P[ne];oe(ge,ce),ce+=ge.length}i.addGroup(re,s.length/3-re,1)}function oe(re,ce){let ne=re.length;for(;--ne>=0;){let fe=ne,ge=ne-1;ge<0&&(ge=re.length-1);for(let Be=0,Oe=u+m*2;Be<Oe;Be++){let We=Y*Be,Xe=Y*(Be+1),N=ce+fe+We,dt=ce+ge+We,Qe=ce+ge+Xe,R=ce+fe+Xe;Le(N,dt,Qe,R)}}}function Re(re,ce,ne){c.push(re),c.push(ce),c.push(ne)}function He(re,ce,ne){Je(re),Je(ce),Je(ne);let fe=s.length/3,ge=w.generateTopUV(i,s,fe-3,fe-2,fe-1);ze(ge[0]),ze(ge[1]),ze(ge[2])}function Le(re,ce,ne,fe){Je(re),Je(ce),Je(fe),Je(ce),Je(ne),Je(fe);let ge=s.length/3,Be=w.generateSideWallUV(i,s,ge-6,ge-3,ge-2,ge-1);ze(Be[0]),ze(Be[1]),ze(Be[3]),ze(Be[1]),ze(Be[2]),ze(Be[3])}function Je(re){s.push(c[re*3+0]),s.push(c[re*3+1]),s.push(c[re*3+2])}function ze(re){r.push(re.x),r.push(re.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return gv(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];i.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Uu[s.type]().fromJSON(s)),new n(i,e.options)}},mv={generateTopUV:function(n,e,t,i,s){let r=e[t*3],o=e[t*3+1],a=e[i*3],c=e[i*3+1],l=e[s*3],u=e[s*3+1];return[new ae(r,o),new ae(a,c),new ae(l,u)]},generateSideWallUV:function(n,e,t,i,s,r){let o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[i*3],u=e[i*3+1],h=e[i*3+2],d=e[s*3],f=e[s*3+1],p=e[s*3+2],x=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(a-u)<Math.abs(o-l)?[new ae(o,1-c),new ae(l,1-h),new ae(d,1-p),new ae(x,1-g)]:[new ae(a,1-c),new ae(u,1-h),new ae(f,1-p),new ae(m,1-g)]}};function gv(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var xo=class n extends Ht{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),c=Math.floor(s),l=a+1,u=c+1,h=e/a,d=t/c,f=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let w=g*d-o;for(let b=0;b<l;b++){let y=b*h-r;p.push(y,-w,0),x.push(0,0,1),m.push(b/a),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let w=0;w<a;w++){let b=w+l*g,y=w+l*(g+1),T=w+1+l*(g+1),S=w+1+l*g;f.push(b,y,S),f.push(y,T,S)}this.setIndex(f),this.setAttribute("position",new ht(p,3)),this.setAttribute("normal",new ht(x,3)),this.setAttribute("uv",new ht(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},vo=class n extends Ht{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);let a=[],c=[],l=[],u=[],h=e,d=(t-e)/s,f=new D,p=new ae;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let g=r+m/i*o;f.x=h*Math.cos(g),f.y=h*Math.sin(g),c.push(f.x,f.y,f.z),l.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,u.push(p.x,p.y)}h+=d}for(let x=0;x<s;x++){let m=x*(i+1);for(let g=0;g<i;g++){let w=g+m,b=w,y=w+i+1,T=w+i+2,S=w+1;a.push(b,y,S),a.push(y,T,S)}}this.setIndex(a),this.setAttribute("position",new ht(c,3)),this.setAttribute("normal",new ht(l,3)),this.setAttribute("uv",new ht(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},ys=class n extends Ht{constructor(e=new En([new ae(0,.5),new ae(-.5,-.5),new ae(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],s=[],r=[],o=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(i),this.setAttribute("position",new ht(s,3)),this.setAttribute("normal",new ht(r,3)),this.setAttribute("uv",new ht(o,2));function l(u){let h=s.length/3,d=u.extractPoints(t),f=d.shape,p=d.holes;Fn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,g=p.length;m<g;m++){let w=p[m];Fn.isClockWise(w)===!0&&(p[m]=w.reverse())}let x=Fn.triangulateShape(f,p);for(let m=0,g=p.length;m<g;m++){let w=p[m];f=f.concat(w)}for(let m=0,g=f.length;m<g;m++){let w=f[m];s.push(w.x,w.y,0),r.push(0,0,1),o.push(w.x,w.y)}for(let m=0,g=x.length;m<g;m++){let w=x[m],b=w[0]+h,y=w[1]+h,T=w[2]+h;i.push(b,y,T),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return xv(t,e)}static fromJSON(e,t){let i=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];i.push(o)}return new n(i,e.curveSegments)}};function xv(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}var vi=class n extends Ht{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new D,d=new D,f=[],p=[],x=[],m=[];for(let g=0;g<=i;g++){let w=[],b=g/i,y=o+b*a,T=e*Math.cos(y),S=Math.sqrt(e*e-T*T),C=0;g===0&&o===0?C=.5/t:g===i&&c===Math.PI&&(C=-.5/t);for(let _=0;_<=t;_++){let A=_/t,I=s+A*r;h.x=-S*Math.cos(I),h.y=T,h.z=S*Math.sin(I),p.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(A+C,1-b),w.push(l++)}u.push(w)}for(let g=0;g<i;g++)for(let w=0;w<t;w++){let b=u[g][w+1],y=u[g][w],T=u[g+1][w],S=u[g+1][w+1];(g!==0||o>0)&&f.push(b,y,S),(g!==i-1||c<Math.PI)&&f.push(y,T,S)}this.setIndex(f),this.setAttribute("position",new ht(p,3)),this.setAttribute("normal",new ht(x,3)),this.setAttribute("uv",new ht(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function As(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(xf(s))s.isRenderTargetTexture?(ke("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(xf(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function an(n){let e={};for(let t=0;t<n.length;t++){let i=As(n[t]);for(let s in i)e[s]=i[s]}return e}function xf(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function vv(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ph(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:at.workingColorSpace}var hp={clone:As,merge:an},_v=\`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}\`,yv=\`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}\`,en=class extends Bi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_v,this.fragmentShader=yv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=As(e.uniforms),this.uniformsGroups=vv(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ge().setHex(s.value);break;case"v2":this.uniforms[i].value=new ae().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new wt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ke().fromArray(s.value);break;case"m4":this.uniforms[i].value=new St().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ic=class extends en{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},wn=class extends Bi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ge(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ge(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=sl,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},_o=class extends wn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ae(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ge(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ge(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ge(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var sc=class extends Bi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=$f,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},rc=class extends Bi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Da(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}var ki=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},oc=class extends ki{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Du,endingEnd:Du}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Lu:r=e,a=2*t-i;break;case Ou:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Lu:o=e,c=2*i-t;break;case Ou:o=1,c=i+s[1]-s[0];break;default:o=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(i-t)/(s-t),x=p*p,m=x*p,g=-d*m+2*d*x-d*p,w=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*p+1,b=(-1-f)*m+(1.5+f)*x+.5*p,y=f*m-f*x;for(let T=0;T!==a;++T)r[T]=g*o[u+T]+w*o[l+T]+b*o[c+T]+y*o[h+T];return r}},ac=class extends ki{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[l+d]*h+o[c+d]*u;return r}},cc=class extends ki{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},lc=class extends ki{interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(i-t)/(s-t),x=1-p;for(let m=0;m!==a;++m)r[m]=o[l+m]*x+o[c+m]*p;return r}let d=a*2,f=e-1;for(let p=0;p!==a;++p){let x=o[l+p],m=o[c+p],g=f*d+p*2,w=h[g],b=h[g+1],y=e*d+p*2,T=u[y],S=u[y+1],C=(i-t)/(s-t),_,A,I,P,k;for(let F=0;F<8;F++){_=C*C,A=_*C,I=1-C,P=I*I,k=P*I;let H=k*t+3*P*C*w+3*I*_*T+A*s-i;if(Math.abs(H)<1e-10)break;let X=3*P*(w-t)+6*I*C*(T-w)+3*_*(s-T);if(Math.abs(X)<1e-10)break;C=C-H/X,C=Math.max(0,Math.min(1,C))}r[p]=k*x+3*P*C*b+3*I*_*S+A*m}return r}},Tn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Da(t,this.TimeBufferType),this.values=Da(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Da(e.times,Array),values:Da(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new cc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ac(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new oc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new lc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Jr:t=this.InterpolantFactoryMethodDiscrete;break;case qa:t=this.InterpolantFactoryMethodLinear;break;case Na:t=this.InterpolantFactoryMethodSmooth;break;case Iu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return ke("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Jr;case this.InterpolantFactoryMethodLinear:return qa;case this.InterpolantFactoryMethodSmooth:return Na;case this.InterpolantFactoryMethodBezier:return Iu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ve("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Ve("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){Ve("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){Ve("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&ux(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){Ve("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Na,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{let h=a*i,d=h-i,f=h+i;for(let p=0;p!==i;++p){let x=t[h+p];if(x!==t[d+p]||x!==t[f+p]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Tn.prototype.ValueTypeName="";Tn.prototype.TimeBufferType=Float32Array;Tn.prototype.ValueBufferType=Float32Array;Tn.prototype.DefaultInterpolation=qa;var zi=class extends Tn{constructor(e,t,i){super(e,t,i)}};zi.prototype.ValueTypeName="bool";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=Jr;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var uc=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};uc.prototype.ValueTypeName="color";var hc=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};hc.prototype.ValueTypeName="number";var dc=class extends ki{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(s-t),l=e*a;for(let u=l+a;l!==u;l+=4)bn.slerpFlat(r,0,o,l-a,o,l,c);return r}},yo=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new dc(this.times,this.values,this.getValueSize(),e)}};yo.prototype.ValueTypeName="quaternion";yo.prototype.InterpolantFactoryMethodSmooth=void 0;var Hi=class extends Tn{constructor(e,t,i){super(e,t,i)}};Hi.prototype.ValueTypeName="string";Hi.prototype.ValueBufferType=Array;Hi.prototype.DefaultInterpolation=Jr;Hi.prototype.InterpolantFactoryMethodLinear=void 0;Hi.prototype.InterpolantFactoryMethodSmooth=void 0;var fc=class extends Tn{constructor(e,t,i,s){super(e,t,i,s)}};fc.prototype.ValueTypeName="vector";var pc=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let f=l[h],p=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},dp=new pc,mc=class{constructor(e){this.manager=e!==void 0?e:dp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};mc.DEFAULT_MATERIAL_NAME="__DEFAULT";var bs=class extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ge(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},bo=class extends bs{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ge(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Pu=new St,vf=new D,_f=new D,gc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ae(512,512),this.mapType=on,this.map=null,this.mapPass=null,this.matrix=new St,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new cr,this._frameExtents=new ae(1,1),this._viewportCount=1,this._viewports=[new wt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;vf.setFromMatrixPosition(e.matrixWorld),t.position.copy(vf),_f.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(_f),t.updateMatrixWorld(),Pu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Pu,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===nr||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Pu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},La=new D,Oa=new bn,Kn=new D,Ms=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new St,this.projectionMatrix=new St,this.projectionMatrixInverse=new St,this.coordinateSystem=Gn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(La,Oa,Kn),Kn.x===1&&Kn.y===1&&Kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Oa,Kn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(La,Oa,Kn),Kn.x===1&&Kn.y===1&&Kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Oa,Kn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ni=new D,yf=new ae,bf=new ae,Kt=class extends Ms{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=xs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan($r*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xs*2*Math.atan(Math.tan($r*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z),Ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z)}getViewSize(e,t){return this.getViewBounds(e,yf,bf),t.subVectors(bf,yf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan($r*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Hu=class extends gc{constructor(){super(new Kt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=xs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Mo=class extends bs{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Hu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}};var hr=class extends Ms{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Vu=class extends gc{constructor(){super(new hr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},dr=class extends bs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new Vu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var So=class extends bs{constructor(e,t,i=10,s=10){super(e,t),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=i,this.height=s}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}};var Js=-90,Qs=1,xc=class extends Ut{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Kt(Js,Qs,e,t);s.layers=this.layers,this.add(s);let r=new Kt(Js,Qs,e,t);r.layers=this.layers,this.add(r);let o=new Kt(Js,Qs,e,t);o.layers=this.layers,this.add(o);let a=new Kt(Js,Qs,e,t);a.layers=this.layers,this.add(a);let c=new Kt(Js,Qs,e,t);c.layers=this.layers,this.add(c);let l=new Kt(Js,Qs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===Gn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===nr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},vc=class extends Kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var mh="\\\\[\\\\]\\\\.:\\\\/",bv=new RegExp("["+mh+"]","g"),gh="[^"+mh+"]",Mv="[^"+mh.replace("\\\\.","")+"]",Sv=/((?:WC+[\\/:])*)/.source.replace("WC",gh),Ev=/(WCOD+)?/.source.replace("WCOD",Mv),wv=/(?:\\.(WC+)(?:\\[(.+)\\])?)?/.source.replace("WC",gh),Tv=/\\.(WC+)(?:\\[(.+)\\])?/.source.replace("WC",gh),Av=new RegExp("^"+Sv+Ev+wv+Tv+"$"),Cv=["material","materials","bones","map"],Gu=class{constructor(e,t,i){let s=i||Mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Mt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\\s/g,"_").replace(bv,"")}static parseTrackName(e){let t=Av.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Cv.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=i(a.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ke("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ve("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ve("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ve("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ve("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ve("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){Ve("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;Ve("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ve("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Mt.Composite=Gu;Mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Mt.prototype.GetterByBindingType=[Mt.prototype._getValue_direct,Mt.prototype._getValue_array,Mt.prototype._getValue_arrayElement,Mt.prototype._getValue_toArray];Mt.prototype.SetterByBindingTypeAndVersioning=[[Mt.prototype._setValue_direct,Mt.prototype._setValue_direct_setNeedsUpdate,Mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_array,Mt.prototype._setValue_array_setNeedsUpdate,Mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_arrayElement,Mt.prototype._setValue_arrayElement_setNeedsUpdate,Mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_fromArray,Mt.prototype._setValue_fromArray_setNeedsUpdate,Mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var n1=new Float32Array(1);var Mf=new St,Ss=class{constructor(e,t,i=0,s=1/0){this.ray=new vs(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new rr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ve("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Mf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Mf),this}intersectObject(e,t=!0,i=[]){return Wu(e,this,i,t),i.sort(Sf),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Wu(e[s],this,i,t);return i.sort(Sf),i}};function Sf(n,e){return n.distance-e.distance}function Wu(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)Wu(r[o],e,t,!0)}}var fr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=tt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(tt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Xu=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};var Eo=class extends Wn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){ke("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function xh(n,e,t,i){let s=Rv(i);switch(t){case ah:return n*e;case lh:return n*e/s.components*s.byteLength;case wc:return n*e/s.components*s.byteLength;case Yi:return n*e*2/s.components*s.byteLength;case Tc:return n*e*2/s.components*s.byteLength;case ch:return n*e*3/s.components*s.byteLength;case pn:return n*e*4/s.components*s.byteLength;case Ac:return n*e*4/s.components*s.byteLength;case Ao:case Co:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ro:case Po:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Rc:case Ic:return Math.max(n,16)*Math.max(e,8)/4;case Cc:case Pc:return Math.max(n,8)*Math.max(e,8)/2;case Dc:case Lc:case Nc:case Fc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Oc:case Io:case Uc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Bc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case kc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case zc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Hc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Vc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Gc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Wc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Xc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case qc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Yc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case $c:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case jc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Zc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Kc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Jc:case Qc:case el:return Math.ceil(n/4)*Math.ceil(e/4)*16;case tl:case nl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Do:case il:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(\`Unable to determine texture byte length for \${t} format.\`)}function Rv(n){switch(n){case on:case ih:return{byteLength:1,components:1};case gr:case sh:case ii:return{byteLength:2,components:1};case Sc:case Ec:return{byteLength:2,components:4};case Xn:case Mc:case qn:return{byteLength:4,components:1};case rh:case oh:return{byteLength:4,components:3}}throw new Error(\`THREE.TextureUtils: Unknown texture type \${n}.\`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?ke("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function Np(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Iv(n){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,d=n.createBuffer();n.bindBuffer(c,d),n.bufferData(c,l,u),a.onUploadCallback();let f;if(l instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=n.SHORT;else if(l instanceof Uint32Array)f=n.UNSIGNED_INT;else if(l instanceof Int32Array)f=n.INT;else if(l instanceof Int8Array)f=n.BYTE;else if(l instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,c,l){let u=c.array,h=c.updateRanges;if(n.bindBuffer(l,a),h.length===0)n.bufferSubData(l,0,u);else{h.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<h.length;f++){let p=h[d],x=h[f];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++d,h[d]=x)}h.length=d+1;for(let f=0,p=h.length;f<p;f++){let x=h[f];n.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Dv=\`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif\`,Lv=\`#ifdef USE_ALPHAHASH
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
#endif\`,Ov=\`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif\`,Nv=\`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif\`,Fv=\`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif\`,Uv=\`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif\`,Bv=\`#ifdef USE_AOMAP
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
#endif\`,kv=\`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif\`,zv=\`#ifdef USE_BATCHING
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
#endif\`,Hv=\`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif\`,Vv=\`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif\`,Gv=\`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif\`,Wv=\`float G_BlinnPhong_Implicit( ) {
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
} // validated\`,Xv=\`#ifdef USE_IRIDESCENCE
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
#endif\`,qv=\`#ifdef USE_BUMPMAP
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
#endif\`,Yv=\`#if NUM_CLIPPING_PLANES > 0
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
#endif\`,$v=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif\`,jv=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif\`,Zv=\`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif\`,Kv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif\`,Jv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif\`,Qv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif\`,e_=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif\`,t_=\`#define PI 3.141592653589793
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
} // validated\`,n_=\`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif\`,i_=\`vec3 transformedNormal = objectNormal;
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
#endif\`,s_=\`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif\`,r_=\`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif\`,o_=\`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif\`,a_=\`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif\`,c_="gl_FragColor = linearToOutputTexel( gl_FragColor );",l_=\`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}\`,u_=\`#ifdef USE_ENVMAP
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
#endif\`,h_=\`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif\`,d_=\`#ifdef USE_ENVMAP
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
#endif\`,f_=\`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif\`,p_=\`#ifdef USE_ENVMAP
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
#endif\`,m_=\`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif\`,g_=\`#ifdef USE_FOG
	varying float vFogDepth;
#endif\`,x_=\`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif\`,v_=\`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif\`,__=\`#ifdef USE_GRADIENTMAP
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
}\`,y_=\`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif\`,b_=\`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;\`,M_=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert\`,S_=\`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>\`,E_=\`#ifdef USE_ENVMAP
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
#endif\`,w_=\`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;\`,T_=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon\`,A_=\`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;\`,C_=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong\`,R_=\`PhysicalMaterial material;
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
#endif\`,P_=\`uniform sampler2D dfgLUT;
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
}\`,I_=\`
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
#endif\`,D_=\`#if defined( RE_IndirectDiffuse )
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
#endif\`,L_=\`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif\`,O_=\`#ifdef USE_LIGHT_PROBES_GRID
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
#endif\`,N_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif\`,F_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,U_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,B_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif\`,k_=\`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif\`,z_=\`#ifdef USE_MAP
	uniform sampler2D map;
#endif\`,H_=\`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif\`,V_=\`#if defined( USE_POINTS_UV )
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
#endif\`,G_=\`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif\`,W_=\`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif\`,X_=\`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif\`,q_=\`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif\`,Y_=\`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,$_=\`#ifdef USE_MORPHTARGETS
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
#endif\`,j_=\`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,Z_=\`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;\`,K_=\`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif\`,J_=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,Q_=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,ey=\`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif\`,ty=\`#ifdef USE_NORMALMAP
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
#endif\`,ny=\`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif\`,iy=\`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif\`,sy=\`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif\`,ry=\`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif\`,oy=\`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );\`,ay=\`vec3 packNormalToRGB( const in vec3 normal ) {
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
}\`,cy=\`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif\`,ly=\`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;\`,uy=\`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif\`,hy=\`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif\`,dy=\`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif\`,fy=\`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif\`,py=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,my=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,gy=\`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif\`,xy=\`float getShadowMask() {
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
}\`,vy=\`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif\`,_y=\`#ifdef USE_SKINNING
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
#endif\`,yy=\`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif\`,by=\`#ifdef USE_SKINNING
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
#endif\`,My=\`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif\`,Sy=\`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif\`,Ey=\`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif\`,wy=\`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }\`,Ty=\`#ifdef USE_TRANSMISSION
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
#endif\`,Ay=\`#ifdef USE_TRANSMISSION
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
#endif\`,Cy=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,Ry=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,Py=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,Iy=\`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif\`,Dy=\`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}\`,Ly=\`uniform sampler2D t2D;
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
}\`,Oy=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,Ny=\`#ifdef ENVMAP_TYPE_CUBE
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
}\`,Fy=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,Uy=\`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,By=\`#include <common>
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
}\`,ky=\`#if DEPTH_PACKING == 3200
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
}\`,zy=\`#define DISTANCE
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
}\`,Hy=\`#define DISTANCE
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
}\`,Vy=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}\`,Gy=\`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,Wy=\`uniform float scale;
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
}\`,Xy=\`uniform vec3 diffuse;
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
}\`,qy=\`#include <common>
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
}\`,Yy=\`uniform vec3 diffuse;
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
}\`,$y=\`#define LAMBERT
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
}\`,jy=\`#define LAMBERT
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
}\`,Zy=\`#define MATCAP
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
}\`,Ky=\`#define MATCAP
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
}\`,Jy=\`#define NORMAL
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
}\`,Qy=\`#define NORMAL
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
}\`,eb=\`#define PHONG
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
}\`,tb=\`#define PHONG
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
}\`,nb=\`#define STANDARD
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
}\`,ib=\`#define STANDARD
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
}\`,sb=\`#define TOON
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
}\`,rb=\`#define TOON
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
}\`,ob=\`uniform float size;
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
}\`,ab=\`uniform vec3 diffuse;
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
}\`,cb=\`#include <common>
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
}\`,lb=\`uniform vec3 color;
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
}\`,ub=\`uniform float rotation;
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
}\`,hb=\`uniform vec3 diffuse;
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
}\`,et={alphahash_fragment:Dv,alphahash_pars_fragment:Lv,alphamap_fragment:Ov,alphamap_pars_fragment:Nv,alphatest_fragment:Fv,alphatest_pars_fragment:Uv,aomap_fragment:Bv,aomap_pars_fragment:kv,batching_pars_vertex:zv,batching_vertex:Hv,begin_vertex:Vv,beginnormal_vertex:Gv,bsdfs:Wv,iridescence_fragment:Xv,bumpmap_pars_fragment:qv,clipping_planes_fragment:Yv,clipping_planes_pars_fragment:$v,clipping_planes_pars_vertex:jv,clipping_planes_vertex:Zv,color_fragment:Kv,color_pars_fragment:Jv,color_pars_vertex:Qv,color_vertex:e_,common:t_,cube_uv_reflection_fragment:n_,defaultnormal_vertex:i_,displacementmap_pars_vertex:s_,displacementmap_vertex:r_,emissivemap_fragment:o_,emissivemap_pars_fragment:a_,colorspace_fragment:c_,colorspace_pars_fragment:l_,envmap_fragment:u_,envmap_common_pars_fragment:h_,envmap_pars_fragment:d_,envmap_pars_vertex:f_,envmap_physical_pars_fragment:E_,envmap_vertex:p_,fog_vertex:m_,fog_pars_vertex:g_,fog_fragment:x_,fog_pars_fragment:v_,gradientmap_pars_fragment:__,lightmap_pars_fragment:y_,lights_lambert_fragment:b_,lights_lambert_pars_fragment:M_,lights_pars_begin:S_,lights_toon_fragment:w_,lights_toon_pars_fragment:T_,lights_phong_fragment:A_,lights_phong_pars_fragment:C_,lights_physical_fragment:R_,lights_physical_pars_fragment:P_,lights_fragment_begin:I_,lights_fragment_maps:D_,lights_fragment_end:L_,lightprobes_pars_fragment:O_,logdepthbuf_fragment:N_,logdepthbuf_pars_fragment:F_,logdepthbuf_pars_vertex:U_,logdepthbuf_vertex:B_,map_fragment:k_,map_pars_fragment:z_,map_particle_fragment:H_,map_particle_pars_fragment:V_,metalnessmap_fragment:G_,metalnessmap_pars_fragment:W_,morphinstance_vertex:X_,morphcolor_vertex:q_,morphnormal_vertex:Y_,morphtarget_pars_vertex:$_,morphtarget_vertex:j_,normal_fragment_begin:Z_,normal_fragment_maps:K_,normal_pars_fragment:J_,normal_pars_vertex:Q_,normal_vertex:ey,normalmap_pars_fragment:ty,clearcoat_normal_fragment_begin:ny,clearcoat_normal_fragment_maps:iy,clearcoat_pars_fragment:sy,iridescence_pars_fragment:ry,opaque_fragment:oy,packing:ay,premultiplied_alpha_fragment:cy,project_vertex:ly,dithering_fragment:uy,dithering_pars_fragment:hy,roughnessmap_fragment:dy,roughnessmap_pars_fragment:fy,shadowmap_pars_fragment:py,shadowmap_pars_vertex:my,shadowmap_vertex:gy,shadowmask_pars_fragment:xy,skinbase_vertex:vy,skinning_pars_vertex:_y,skinning_vertex:yy,skinnormal_vertex:by,specularmap_fragment:My,specularmap_pars_fragment:Sy,tonemapping_fragment:Ey,tonemapping_pars_fragment:wy,transmission_fragment:Ty,transmission_pars_fragment:Ay,uv_pars_fragment:Cy,uv_pars_vertex:Ry,uv_vertex:Py,worldpos_vertex:Iy,background_vert:Dy,background_frag:Ly,backgroundCube_vert:Oy,backgroundCube_frag:Ny,cube_vert:Fy,cube_frag:Uy,depth_vert:By,depth_frag:ky,distance_vert:zy,distance_frag:Hy,equirect_vert:Vy,equirect_frag:Gy,linedashed_vert:Wy,linedashed_frag:Xy,meshbasic_vert:qy,meshbasic_frag:Yy,meshlambert_vert:$y,meshlambert_frag:jy,meshmatcap_vert:Zy,meshmatcap_frag:Ky,meshnormal_vert:Jy,meshnormal_frag:Qy,meshphong_vert:eb,meshphong_frag:tb,meshphysical_vert:nb,meshphysical_frag:ib,meshtoon_vert:sb,meshtoon_frag:rb,points_vert:ob,points_frag:ab,shadow_vert:cb,shadow_frag:lb,sprite_vert:ub,sprite_frag:hb},be={common:{diffuse:{value:new Ge(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ke}},envmap:{envMap:{value:null},envMapRotation:{value:new Ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ke},normalScale:{value:new ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ge(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Ge(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0},uvTransform:{value:new Ke}},sprite:{diffuse:{value:new Ge(16777215)},opacity:{value:1},center:{value:new ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}}},ri={basic:{uniforms:an([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:an([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ge(0)},envMapIntensity:{value:1}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:an([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ge(0)},specular:{value:new Ge(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:an([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Ge(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:an([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Ge(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:an([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:an([be.points,be.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:an([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:an([be.common,be.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:an([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:an([be.sprite,be.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new Ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ke}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distance:{uniforms:an([be.common,be.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distance_vert,fragmentShader:et.distance_frag},shadow:{uniforms:an([be.lights,be.fog,{color:{value:new Ge(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};ri.physical={uniforms:an([ri.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ke},clearcoatNormalScale:{value:new ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ke},sheen:{value:0},sheenColor:{value:new Ge(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ke},transmissionSamplerSize:{value:new ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ke},attenuationDistance:{value:0},attenuationColor:{value:new Ge(0)},specularColor:{value:new Ge(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ke},anisotropyVector:{value:new ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ke}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};var al={r:0,b:0,g:0},db=new St,Fp=new Ke;Fp.set(-1,0,0,0,1,0,0,0,1);function fb(n,e,t,i,s,r){let o=new Ge(0),a=s===!0?0:1,c,l,u=null,h=0,d=null;function f(w){let b=w.isScene===!0?w.background:null;if(b&&b.isTexture){let y=w.backgroundBlurriness>0;b=e.get(b,y)}return b}function p(w){let b=!1,y=f(w);y===null?m(o,a):y&&y.isColor&&(m(y,1),b=!0);let T=n.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||b)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(w,b){let y=f(b);y&&(y.isCubeTexture||y.mapping===wo)?(l===void 0&&(l=new nt(new Vt(1,1,1),new en({name:"BackgroundCubeMaterial",uniforms:As(ri.backgroundCube.uniforms),vertexShader:ri.backgroundCube.vertexShader,fragmentShader:ri.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,S,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(db.makeRotationFromEuler(b.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Fp),l.material.toneMapped=at.getTransfer(y.colorSpace)!==ft,(u!==y||h!==y.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,u=y,h=y.version,d=n.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new nt(new xo(2,2),new en({name:"BackgroundMaterial",uniforms:As(ri.background.uniforms),vertexShader:ri.background.vertexShader,fragmentShader:ri.background.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=at.getTransfer(y.colorSpace)!==ft,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||h!==y.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,u=y,h=y.version,d=n.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function m(w,b){w.getRGB(al,ph(n)),t.buffers.color.setClear(al.r,al.g,al.b,b,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(w,b=1){o.set(w),a=b,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(w){a=w,m(o,a)},render:p,addToRenderList:x,dispose:g}}function pb(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,o=!1;function a(P,k,F,B,H){let X=!1,Y=h(P,B,F,k);r!==Y&&(r=Y,l(r.object)),X=f(P,B,F,H),X&&p(P,B,F,H),H!==null&&e.update(H,n.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,y(P,k,F,B),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function c(){return n.createVertexArray()}function l(P){return n.bindVertexArray(P)}function u(P){return n.deleteVertexArray(P)}function h(P,k,F,B){let H=B.wireframe===!0,X=i[k.id];X===void 0&&(X={},i[k.id]=X);let Y=P.isInstancedMesh===!0?P.id:0,V=X[Y];V===void 0&&(V={},X[Y]=V);let j=V[F.id];j===void 0&&(j={},V[F.id]=j);let W=j[H];return W===void 0&&(W=d(c()),j[H]=W),W}function d(P){let k=[],F=[],B=[];for(let H=0;H<t;H++)k[H]=0,F[H]=0,B[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:F,attributeDivisors:B,object:P,attributes:{},index:null}}function f(P,k,F,B){let H=r.attributes,X=k.attributes,Y=0,V=F.getAttributes();for(let j in V)if(V[j].location>=0){let ie=H[j],J=X[j];if(J===void 0&&(j==="instanceMatrix"&&P.instanceMatrix&&(J=P.instanceMatrix),j==="instanceColor"&&P.instanceColor&&(J=P.instanceColor)),ie===void 0||ie.attribute!==J||J&&ie.data!==J.data)return!0;Y++}return r.attributesNum!==Y||r.index!==B}function p(P,k,F,B){let H={},X=k.attributes,Y=0,V=F.getAttributes();for(let j in V)if(V[j].location>=0){let ie=X[j];ie===void 0&&(j==="instanceMatrix"&&P.instanceMatrix&&(ie=P.instanceMatrix),j==="instanceColor"&&P.instanceColor&&(ie=P.instanceColor));let J={};J.attribute=ie,ie&&ie.data&&(J.data=ie.data),H[j]=J,Y++}r.attributes=H,r.attributesNum=Y,r.index=B}function x(){let P=r.newAttributes;for(let k=0,F=P.length;k<F;k++)P[k]=0}function m(P){g(P,0)}function g(P,k){let F=r.newAttributes,B=r.enabledAttributes,H=r.attributeDivisors;F[P]=1,B[P]===0&&(n.enableVertexAttribArray(P),B[P]=1),H[P]!==k&&(n.vertexAttribDivisor(P,k),H[P]=k)}function w(){let P=r.newAttributes,k=r.enabledAttributes;for(let F=0,B=k.length;F<B;F++)k[F]!==P[F]&&(n.disableVertexAttribArray(F),k[F]=0)}function b(P,k,F,B,H,X,Y){Y===!0?n.vertexAttribIPointer(P,k,F,H,X):n.vertexAttribPointer(P,k,F,B,H,X)}function y(P,k,F,B){x();let H=B.attributes,X=F.getAttributes(),Y=k.defaultAttributeValues;for(let V in X){let j=X[V];if(j.location>=0){let W=H[V];if(W===void 0&&(V==="instanceMatrix"&&P.instanceMatrix&&(W=P.instanceMatrix),V==="instanceColor"&&P.instanceColor&&(W=P.instanceColor)),W!==void 0){let ie=W.normalized,J=W.itemSize,Ee=e.get(W);if(Ee===void 0)continue;let Ye=Ee.buffer,qe=Ee.type,K=Ee.bytesPerElement,le=qe===n.INT||qe===n.UNSIGNED_INT||W.gpuType===Mc;if(W.isInterleavedBufferAttribute){let oe=W.data,Re=oe.stride,He=W.offset;if(oe.isInstancedInterleavedBuffer){for(let Le=0;Le<j.locationSize;Le++)g(j.location+Le,oe.meshPerAttribute);P.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Le=0;Le<j.locationSize;Le++)m(j.location+Le);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let Le=0;Le<j.locationSize;Le++)b(j.location+Le,J/j.locationSize,qe,ie,Re*K,(He+J/j.locationSize*Le)*K,le)}else{if(W.isInstancedBufferAttribute){for(let oe=0;oe<j.locationSize;oe++)g(j.location+oe,W.meshPerAttribute);P.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let oe=0;oe<j.locationSize;oe++)m(j.location+oe);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let oe=0;oe<j.locationSize;oe++)b(j.location+oe,J/j.locationSize,qe,ie,J*K,J/j.locationSize*oe*K,le)}}else if(Y!==void 0){let ie=Y[V];if(ie!==void 0)switch(ie.length){case 2:n.vertexAttrib2fv(j.location,ie);break;case 3:n.vertexAttrib3fv(j.location,ie);break;case 4:n.vertexAttrib4fv(j.location,ie);break;default:n.vertexAttrib1fv(j.location,ie)}}}}w()}function T(){A();for(let P in i){let k=i[P];for(let F in k){let B=k[F];for(let H in B){let X=B[H];for(let Y in X)u(X[Y].object),delete X[Y];delete B[H]}}delete i[P]}}function S(P){if(i[P.id]===void 0)return;let k=i[P.id];for(let F in k){let B=k[F];for(let H in B){let X=B[H];for(let Y in X)u(X[Y].object),delete X[Y];delete B[H]}}delete i[P.id]}function C(P){for(let k in i){let F=i[k];for(let B in F){let H=F[B];if(H[P.id]===void 0)continue;let X=H[P.id];for(let Y in X)u(X[Y].object),delete X[Y];delete H[P.id]}}}function _(P){for(let k in i){let F=i[k],B=P.isInstancedMesh===!0?P.id:0,H=F[B];if(H!==void 0){for(let X in H){let Y=H[X];for(let V in Y)u(Y[V].object),delete Y[V];delete H[X]}delete F[B],Object.keys(F).length===0&&delete i[k]}}}function A(){I(),o=!0,r!==s&&(r=s,l(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:I,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfObject:_,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:w}}function mb(n,e,t){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function o(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function a(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let d=0;for(let f=0;f<u;f++)d+=l[f];t.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function gb(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==pn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let _=C===ii&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==on&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==qn&&!_)}function c(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(ke("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&ke("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),S=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:w,maxVaryings:b,maxFragmentUniforms:y,maxSamples:T,samples:S}}function xb(n){let e=this,t=null,i=0,s=!1,r=!1,o=new Nn,a=new Ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||s;return s=d,i=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let p=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,g=n.get(h);if(!s||p===null||p.length===0||r&&!m)r?u(null):l();else{let w=r?0:i,b=w*4,y=g.clippingState||null;c.value=y,y=u(p,d,b,f);for(let T=0;T!==b;++T)y[T]=t[T];g.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,p){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,p!==!0||m===null){let g=f+x*4,w=d.matrixWorldInverse;a.getNormalMatrix(w),(m===null||m.length<g)&&(m=new Float32Array(g));for(let b=0,y=f;b!==x;++b,y+=4)o.copy(h[b]).applyMatrix4(w,a),o.normal.toArray(m,y),m[y+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var $i=4,fp=[.125,.215,.35,.446,.526,.582],Cs=20,vb=256,Lo=new hr,pp=new Ge,vh=null,_h=0,yh=0,bh=!1,_b=new D,ll=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:o=256,position:a=_b}=r;vh=this._renderer.getRenderTarget(),_h=this._renderer.getActiveCubeFace(),yh=this._renderer.getActiveMipmapLevel(),bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(vh,_h,yh),this._renderer.xr.enabled=bh,e.scissorTest=!1,vr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Xi||e.mapping===ws?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),vh=this._renderer.getRenderTarget(),_h=this._renderer.getActiveCubeFace(),yh=this._renderer.getActiveMipmapLevel(),bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:At,minFilter:At,generateMipmaps:!1,type:ii,format:pn,colorSpace:Qr,depthBuffer:!1},s=mp(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mp(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=yb(r)),this._blurMaterial=Mb(r,e,t),this._ggxMaterial=bb(r,e,t)}return s}_compileMaterial(e){let t=new nt(new Ht,e);this._renderer.compile(t,Lo)}_sceneToCubeUV(e,t,i,s,r){let c=new Kt(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(pp),h.toneMapping=An,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new nt(new Vt,new Qt({name:"PMREM.Background",side:un,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,g=!1,w=e.background;w?w.isColor&&(m.color.copy(w),e.background=null,g=!0):(m.color.copy(pp),g=!0);for(let b=0;b<6;b++){let y=b%3;y===0?(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[b],r.y,r.z)):y===1?(c.up.set(0,0,l[b]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[b],r.z)):(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[b]));let T=this._cubeSize;vr(s,y*T,b>2?T:0,T,T),h.setRenderTarget(s),g&&h.render(x,c),h.render(e,c)}h.toneMapping=f,h.autoClear=d,e.background=w}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Xi||e.mapping===ws;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=xp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gp());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;vr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,Lo)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let c=o.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-u*u),d=0+l*1.25,f=h*d,{_lodMax:p}=this,x=this._sizeLods[i],m=3*x*(i>p-$i?i-p+$i:0),g=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=p-t,vr(r,m,g,3*x,2*x),s.setRenderTarget(r),s.render(a,Lo),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=p-i,vr(e,m,g,3*x,2*x),s.setRenderTarget(e),s.render(a,Lo)}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Ve("blur direction must be either latitudinal or longitudinal!");let u=3,h=this._lodMeshes[s];h.material=l;let d=l.uniforms,f=this._sizeLods[i]-1,p=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Cs-1),x=r/p,m=isFinite(r)?1+Math.floor(u*x):Cs;m>Cs&&ke(\`sigmaRadians, \${r}, is too large and will clip, as it requested \${m} samples when the maximum is set to \${Cs}\`);let g=[],w=0;for(let C=0;C<Cs;++C){let _=C/x,A=Math.exp(-_*_/2);g.push(A),C===0?w+=A:C<m&&(w+=2*A)}for(let C=0;C<g.length;C++)g[C]=g[C]/w;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=g,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:b}=this;d.dTheta.value=p,d.mipInt.value=b-i;let y=this._sizeLods[s],T=3*y*(s>b-$i?s-b+$i:0),S=4*(this._cubeSize-y);vr(t,T,S,3*y,2*y),c.setRenderTarget(t),c.render(h,Lo)}};function yb(n){let e=[],t=[],i=[],s=n,r=n-$i+1+fp.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let c=1/a;o>n-$i?c=fp[o-n+$i-1]:o===0&&(c=0),t.push(c);let l=1/(a-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,p=6,x=3,m=2,g=1,w=new Float32Array(x*p*f),b=new Float32Array(m*p*f),y=new Float32Array(g*p*f);for(let S=0;S<f;S++){let C=S%3*2/3-1,_=S>2?0:-1,A=[C,_,0,C+2/3,_,0,C+2/3,_+1,0,C,_,0,C+2/3,_+1,0,C,_+1,0];w.set(A,x*p*S),b.set(d,m*p*S);let I=[S,S,S,S,S,S];y.set(I,g*p*S)}let T=new Ht;T.setAttribute("position",new Jt(w,x)),T.setAttribute("uv",new Jt(b,m)),T.setAttribute("faceIndex",new Jt(y,g)),i.push(new nt(T,null)),s>$i&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function mp(n,e,t){let i=new Mn(n,e,t);return i.texture.mapping=wo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function vr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function bb(n,e,t){return new en({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:dl(),fragmentShader:\`

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
		\`,blending:ti,depthTest:!1,depthWrite:!1})}function Mb(n,e,t){let i=new Float32Array(Cs),s=new D(0,1,0);return new en({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:dl(),fragmentShader:\`

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
		\`,blending:ti,depthTest:!1,depthWrite:!1})}function gp(){return new en({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:dl(),fragmentShader:\`

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
		\`,blending:ti,depthTest:!1,depthWrite:!1})}function xp(){return new en({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:dl(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		\`,blending:ti,depthTest:!1,depthWrite:!1})}function dl(){return\`

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
	\`}var ul=class extends Mn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new oo(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:\`

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
			\`},s=new Vt(5,5,5),r=new en({name:"CubemapFromEquirect",uniforms:As(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:un,blending:ti});r.uniforms.tEquirect.value=t;let o=new nt(s,r),a=t.minFilter;return t.minFilter===ni&&(t.minFilter=At),new xc(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}};function Sb(n){let e=new WeakMap,t=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===_c||f===yc)if(e.has(d)){let p=e.get(d).texture;return a(p,d.mapping)}else{let p=d.image;if(p&&p.height>0){let x=new ul(p.height);return x.fromEquirectangularTexture(n,d),e.set(d,x),d.addEventListener("dispose",l),a(x.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,p=f===_c||f===yc,x=f===Xi||f===ws;if(p||x){let m=t.get(d),g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return i===null&&(i=new ll(n)),m=p?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let w=d.image;return p&&w&&w.height>0||x&&w&&c(w)?(i===null&&(i=new ll(n)),m=p?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function a(d,f){return f===_c?d.mapping=Xi:f===yc&&(d.mapping=ws),d}function c(d){let f=0,p=6;for(let x=0;x<p;x++)d[x]!==void 0&&f++;return f===p}function l(d){let f=d.target;f.removeEventListener("dispose",l);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function u(d){let f=d.target;f.removeEventListener("dispose",u);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:h}}function Eb(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&fs("WebGLRenderer: "+i+" extension not supported."),s}}}function wb(n,e,t,i){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let p in d.attributes)e.remove(d.attributes[p]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function c(h){let d=h.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function l(h){let d=[],f=h.index,p=h.attributes.position,x=0;if(p===void 0)return;if(f!==null){let w=f.array;x=f.version;for(let b=0,y=w.length;b<y;b+=3){let T=w[b+0],S=w[b+1],C=w[b+2];d.push(T,S,S,C,C,T)}}else{let w=p.array;x=p.version;for(let b=0,y=w.length/3-1;b<y;b+=3){let T=b+0,S=b+1,C=b+2;d.push(T,S,S,C,C,T)}}let m=new(p.count>=65535?ro:so)(d,1);m.version=x;let g=r.get(h);g&&e.remove(g),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function Tb(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function c(h,d){n.drawElements(i,d,r,h*o),t.update(d,i,1)}function l(h,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,h*o,f),t.update(d,i,f))}function u(h,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,h,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];t.update(x,i,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Ab(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:Ve("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Cb(n,e,t){let i=new WeakMap,s=new wt;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let A=function(){C.dispose(),i.delete(a),a.removeEventListener("dispose",A)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],b=0;f===!0&&(b=1),p===!0&&(b=2),x===!0&&(b=3);let y=a.attributes.position.count*b,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let S=new Float32Array(y*T*4*h),C=new no(S,y,T,h);C.type=qn,C.needsUpdate=!0;let _=b*4;for(let I=0;I<h;I++){let P=m[I],k=g[I],F=w[I],B=y*T*4*I;for(let H=0;H<P.count;H++){let X=H*_;f===!0&&(s.fromBufferAttribute(P,H),S[B+X+0]=s.x,S[B+X+1]=s.y,S[B+X+2]=s.z,S[B+X+3]=0),p===!0&&(s.fromBufferAttribute(k,H),S[B+X+4]=s.x,S[B+X+5]=s.y,S[B+X+6]=s.z,S[B+X+7]=0),x===!0&&(s.fromBufferAttribute(F,H),S[B+X+8]=s.x,S[B+X+9]=s.y,S[B+X+10]=s.z,S[B+X+11]=F.itemSize===4?s.w:1)}}d={count:h,texture:C,size:new ae(y,T)},i.set(a,d),a.addEventListener("dispose",A)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let p=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(n,"morphTargetBaseInfluence",p),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function Rb(n,e,t,i,s){let r=new WeakMap;function o(l){let u=s.render.frame,h=l.geometry,d=e.get(l,h);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return d}function a(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var Pb={[Zu]:"LINEAR_TONE_MAPPING",[Ku]:"REINHARD_TONE_MAPPING",[Ju]:"CINEON_TONE_MAPPING",[mr]:"ACES_FILMIC_TONE_MAPPING",[eh]:"AGX_TONE_MAPPING",[th]:"NEUTRAL_TONE_MAPPING",[Qu]:"CUSTOM_TONE_MAPPING"};function Ib(n,e,t,i,s,r){let o=new Mn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new mi(e,t):void 0}),a=new Mn(e,t,{type:ii,depthBuffer:!1,stencilBuffer:!1}),c=new Ht;c.setAttribute("position",new ht([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new ht([0,2,0,0,2,0],2));let l=new ic({uniforms:{tDiffuse:{value:null}},vertexShader:\`
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
			}\`,depthTest:!1,depthWrite:!1}),u=new nt(c,l),h=new hr(-1,1,1,-1,0,1),d=null,f=null,p=!1,x,m=null,g=[],w=!1;this.setSize=function(b,y){o.setSize(b,y),a.setSize(b,y);for(let T=0;T<g.length;T++){let S=g[T];S.setSize&&S.setSize(b,y)}},this.setEffects=function(b){g=b,w=g.length>0&&g[0].isRenderPass===!0;let y=o.width,T=o.height;for(let S=0;S<g.length;S++){let C=g[S];C.setSize&&C.setSize(y,T)}},this.begin=function(b,y){if(p||b.toneMapping===An&&g.length===0)return!1;if(m=y,y!==null){let T=y.width,S=y.height;(o.width!==T||o.height!==S)&&this.setSize(T,S)}return w===!1&&b.setRenderTarget(o),x=b.toneMapping,b.toneMapping=An,!0},this.hasRenderPass=function(){return w},this.end=function(b,y){b.toneMapping=x,p=!0;let T=o,S=a;for(let C=0;C<g.length;C++){let _=g[C];if(_.enabled!==!1&&(_.render(b,S,T,y),_.needsSwap!==!1)){let A=T;T=S,S=A}}if(d!==b.outputColorSpace||f!==b.toneMapping){d=b.outputColorSpace,f=b.toneMapping,l.defines={},at.getTransfer(d)===ft&&(l.defines.SRGB_TRANSFER="");let C=Pb[f];C&&(l.defines[C]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,b.setRenderTarget(m),b.render(u,h),m=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}var Up=new fn,Eh=new mi(1,1),Bp=new no,kp=new ja,zp=new oo,vp=[],_p=[],yp=new Float32Array(16),bp=new Float32Array(9),Mp=new Float32Array(4);function yr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=vp[s];if(r===void 0&&(r=new Float32Array(s),vp[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Gt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Wt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function fl(n,e){let t=_p[e];t===void 0&&(t=new Int32Array(e),_p[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Db(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Lb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2fv(this.addr,e),Wt(t,e)}}function Ob(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Gt(t,e))return;n.uniform3fv(this.addr,e),Wt(t,e)}}function Nb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4fv(this.addr,e),Wt(t,e)}}function Fb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,i))return;Mp.set(i),n.uniformMatrix2fv(this.addr,!1,Mp),Wt(t,i)}}function Ub(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,i))return;bp.set(i),n.uniformMatrix3fv(this.addr,!1,bp),Wt(t,i)}}function Bb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Gt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,i))return;yp.set(i),n.uniformMatrix4fv(this.addr,!1,yp),Wt(t,i)}}function kb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function zb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2iv(this.addr,e),Wt(t,e)}}function Hb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;n.uniform3iv(this.addr,e),Wt(t,e)}}function Vb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4iv(this.addr,e),Wt(t,e)}}function Gb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Wb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;n.uniform2uiv(this.addr,e),Wt(t,e)}}function Xb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;n.uniform3uiv(this.addr,e),Wt(t,e)}}function qb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;n.uniform4uiv(this.addr,e),Wt(t,e)}}function Yb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Eh.compareFunction=t.isReversedDepthBuffer()?ol:rl,r=Eh):r=Up,t.setTexture2D(e||r,s)}function $b(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||kp,s)}function jb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||zp,s)}function Zb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Bp,s)}function Kb(n){switch(n){case 5126:return Db;case 35664:return Lb;case 35665:return Ob;case 35666:return Nb;case 35674:return Fb;case 35675:return Ub;case 35676:return Bb;case 5124:case 35670:return kb;case 35667:case 35671:return zb;case 35668:case 35672:return Hb;case 35669:case 35673:return Vb;case 5125:return Gb;case 36294:return Wb;case 36295:return Xb;case 36296:return qb;case 35678:case 36198:case 36298:case 36306:case 35682:return Yb;case 35679:case 36299:case 36307:return $b;case 35680:case 36300:case 36308:case 36293:return jb;case 36289:case 36303:case 36311:case 36292:return Zb}}function Jb(n,e){n.uniform1fv(this.addr,e)}function Qb(n,e){let t=yr(e,this.size,2);n.uniform2fv(this.addr,t)}function eM(n,e){let t=yr(e,this.size,3);n.uniform3fv(this.addr,t)}function tM(n,e){let t=yr(e,this.size,4);n.uniform4fv(this.addr,t)}function nM(n,e){let t=yr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function iM(n,e){let t=yr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function sM(n,e){let t=yr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function rM(n,e){n.uniform1iv(this.addr,e)}function oM(n,e){n.uniform2iv(this.addr,e)}function aM(n,e){n.uniform3iv(this.addr,e)}function cM(n,e){n.uniform4iv(this.addr,e)}function lM(n,e){n.uniform1uiv(this.addr,e)}function uM(n,e){n.uniform2uiv(this.addr,e)}function hM(n,e){n.uniform3uiv(this.addr,e)}function dM(n,e){n.uniform4uiv(this.addr,e)}function fM(n,e,t){let i=this.cache,s=e.length,r=fl(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Wt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=Eh:o=Up;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function pM(n,e,t){let i=this.cache,s=e.length,r=fl(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Wt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||kp,r[o])}function mM(n,e,t){let i=this.cache,s=e.length,r=fl(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Wt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||zp,r[o])}function gM(n,e,t){let i=this.cache,s=e.length,r=fl(t,s);Gt(i,r)||(n.uniform1iv(this.addr,r),Wt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Bp,r[o])}function xM(n){switch(n){case 5126:return Jb;case 35664:return Qb;case 35665:return eM;case 35666:return tM;case 35674:return nM;case 35675:return iM;case 35676:return sM;case 5124:case 35670:return rM;case 35667:case 35671:return oM;case 35668:case 35672:return aM;case 35669:case 35673:return cM;case 5125:return lM;case 36294:return uM;case 36295:return hM;case 36296:return dM;case 35678:case 36198:case 36298:case 36306:case 35682:return fM;case 35679:case 36299:case 36307:return pM;case 35680:case 36300:case 36308:case 36293:return mM;case 36289:case 36303:case 36311:case 36292:return gM}}var wh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Kb(t.type)}},Th=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=xM(t.type)}},Ah=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},Mh=/(\\w+)(\\])?(\\[|\\.)?/g;function Sp(n,e){n.seq.push(e),n.map[e.id]=e}function vM(n,e,t){let i=n.name,s=i.length;for(Mh.lastIndex=0;;){let r=Mh.exec(i),o=Mh.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Sp(t,l===void 0?new wh(a,n,e):new Th(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Ah(a),Sp(t,h)),t=h}}}var _r=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);vM(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function Ep(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var _M=37297,yM=0;function bM(n,e){let t=n.split(\`
\`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(\`\${a===e?">":" "} \${a}: \${t[o]}\`)}return i.join(\`
\`)}var wp=new Ke;function MM(n){at._getMatrix(wp,at.workingColorSpace,n);let e=\`mat3( \${wp.elements.map(t=>t.toFixed(4))} )\`;switch(at.getTransfer(n)){case eo:return[e,"LinearTransferOETF"];case ft:return[e,"sRGBTransferOETF"];default:return ke("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Tp(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+\`

\`+r+\`

\`+bM(n.getShaderSource(e),a)}else return r}function SM(n,e){let t=MM(e);return[\`vec4 \${n}( vec4 value ) {\`,\`	return \${t[1]}( vec4( value.rgb * \${t[0]}, value.a ) );\`,"}"].join(\`
\`)}var EM={[Zu]:"Linear",[Ku]:"Reinhard",[Ju]:"Cineon",[mr]:"ACESFilmic",[eh]:"AgX",[th]:"Neutral",[Qu]:"Custom"};function wM(n,e){let t=EM[e];return t===void 0?(ke("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var cl=new D;function TM(){at.getLuminanceCoefficients(cl);let n=cl.x.toFixed(4),e=cl.y.toFixed(4),t=cl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",\`	const vec3 weights = vec3( \${n}, \${e}, \${t} );\`,"	return dot( weights, rgb );","}"].join(\`
\`)}function AM(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(No).join(\`
\`)}function CM(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(\`
\`)}function RM(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function No(n){return n!==""}function Ap(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Cp(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var PM=/^[ \\t]*#include +<([\\w\\d./]+)>/gm;function Ch(n){return n.replace(PM,DM)}var IM=new Map;function DM(n,e){let t=et[e];if(t===void 0){let i=IM.get(e);if(i!==void 0)t=et[i],ke('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Ch(t)}var LM=/#pragma unroll_loop_start\\s+for\\s*\\(\\s*int\\s+i\\s*=\\s*(\\d+)\\s*;\\s*i\\s*<\\s*(\\d+)\\s*;\\s*i\\s*\\+\\+\\s*\\)\\s*{([\\s\\S]+?)}\\s+#pragma unroll_loop_end/g;function Rp(n){return n.replace(LM,OM)}function OM(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\\[\\s*i\\s*\\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Pp(n){let e=\`precision \${n.precision} float;
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
#define LOW_PRECISION\`),e}var NM={[Es]:"SHADOWMAP_TYPE_PCF",[pr]:"SHADOWMAP_TYPE_VSM"};function FM(n){return NM[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var UM={[Xi]:"ENVMAP_TYPE_CUBE",[ws]:"ENVMAP_TYPE_CUBE",[wo]:"ENVMAP_TYPE_CUBE_UV"};function BM(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":UM[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var kM={[ws]:"ENVMAP_MODE_REFRACTION"};function zM(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":kM[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var HM={[ju]:"ENVMAP_BLENDING_MULTIPLY",[Xf]:"ENVMAP_BLENDING_MIX",[qf]:"ENVMAP_BLENDING_ADD"};function VM(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":HM[n.combine]||"ENVMAP_BLENDING_NONE"}function GM(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function WM(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=FM(t),l=BM(t),u=zM(t),h=VM(t),d=GM(t),f=AM(t),p=CM(r),x=s.createProgram(),m,g,w=t.glslVersion?"#version "+t.glslVersion+\`
\`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(No).join(\`
\`),m.length>0&&(m+=\`
\`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(No).join(\`
\`),g.length>0&&(g+=\`
\`)):(m=[Pp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",\`
\`].filter(No).join(\`
\`),g=[Pp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==An?"#define TONE_MAPPING":"",t.toneMapping!==An?et.tonemapping_pars_fragment:"",t.toneMapping!==An?wM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,SM("linearToOutputTexel",t.outputColorSpace),TM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",\`
\`].filter(No).join(\`
\`)),o=Ch(o),o=Ap(o,t),o=Cp(o,t),a=Ch(a),a=Ap(a,t),a=Cp(a,t),o=Rp(o),a=Rp(a),t.isRawShaderMaterial!==!0&&(w=\`#version 300 es
\`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(\`
\`)+\`
\`+m,g=["#define varying in",t.glslVersion===uh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===uh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(\`
\`)+\`
\`+g);let b=w+m+o,y=w+g+a,T=Ep(s,s.VERTEX_SHADER,b),S=Ep(s,s.FRAGMENT_SHADER,y);s.attachShader(x,T),s.attachShader(x,S),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(P){if(n.debug.checkShaderErrors){let k=s.getProgramInfoLog(x)||"",F=s.getShaderInfoLog(T)||"",B=s.getShaderInfoLog(S)||"",H=k.trim(),X=F.trim(),Y=B.trim(),V=!0,j=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(V=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,T,S);else{let W=Tp(s,T,"vertex"),ie=Tp(s,S,"fragment");Ve("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+\`

Material Name: \`+P.name+\`
Material Type: \`+P.type+\`

Program Info Log: \`+H+\`
\`+W+\`
\`+ie)}else H!==""?ke("WebGLProgram: Program Info Log:",H):(X===""||Y==="")&&(j=!1);j&&(P.diagnostics={runnable:V,programLog:H,vertexShader:{log:X,prefix:m},fragmentShader:{log:Y,prefix:g}})}s.deleteShader(T),s.deleteShader(S),_=new _r(s,x),A=RM(s,x)}let _;this.getUniforms=function(){return _===void 0&&C(this),_};let A;this.getAttributes=function(){return A===void 0&&C(this),A};let I=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=s.getProgramParameter(x,_M)),I},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=yM++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=S,this}var XM=0,Rh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Ph(e),t.set(e,i)),i}},Ph=class{constructor(e){this.id=XM++,this.code=e,this.usedTimes=0}};function qM(n){return n===Yi||n===Io||n===Do}function YM(n,e,t,i,s,r){let o=new rr,a=new Rh,c=new Set,l=[],u=new Map,h=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return c.add(_),_===0?"uv":\`uv\${_}\`}function x(_,A,I,P,k,F){let B=P.fog,H=k.geometry,X=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,V=e.get(_.envMap||X,Y),j=V&&V.mapping===wo?V.image.height:null,W=f[_.type];_.precision!==null&&(d=i.getMaxPrecision(_.precision),d!==_.precision&&ke("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let ie=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,J=ie!==void 0?ie.length:0,Ee=0;H.morphAttributes.position!==void 0&&(Ee=1),H.morphAttributes.normal!==void 0&&(Ee=2),H.morphAttributes.color!==void 0&&(Ee=3);let Ye,qe,K,le;if(W){let Te=ri[W];Ye=Te.vertexShader,qe=Te.fragmentShader}else{Ye=_.vertexShader,qe=_.fragmentShader;let Te=a.getVertexShaderStage(_),Et=a.getFragmentShaderStage(_);a.update(_,Te,Et),K=Te.id,le=Et.id}let oe=n.getRenderTarget(),Re=n.state.buffers.depth.getReversed(),He=k.isInstancedMesh===!0,Le=k.isBatchedMesh===!0,Je=!!_.map,ze=!!_.matcap,re=!!V,ce=!!_.aoMap,ne=!!_.lightMap,fe=!!_.bumpMap&&_.wireframe===!1,ge=!!_.normalMap,Be=!!_.displacementMap,Oe=!!_.emissiveMap,We=!!_.metalnessMap,Xe=!!_.roughnessMap,N=_.anisotropy>0,dt=_.clearcoat>0,Qe=_.dispersion>0,R=_.iridescence>0,v=_.sheen>0,G=_.transmission>0,q=N&&!!_.anisotropyMap,$=dt&&!!_.clearcoatMap,he=dt&&!!_.clearcoatNormalMap,de=dt&&!!_.clearcoatRoughnessMap,Z=R&&!!_.iridescenceMap,te=R&&!!_.iridescenceThicknessMap,xe=v&&!!_.sheenColorMap,Pe=v&&!!_.sheenRoughnessMap,ye=!!_.specularMap,_e=!!_.specularColorMap,Fe=!!_.specularIntensityMap,Ne=G&&!!_.transmissionMap,$e=G&&!!_.thicknessMap,U=!!_.gradientMap,pe=!!_.alphaMap,ee=_.alphaTest>0,ve=!!_.alphaHash,Me=!!_.extensions,se=An;_.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(se=n.toneMapping);let Ie={shaderID:W,shaderType:_.type,shaderName:_.name,vertexShader:Ye,fragmentShader:qe,defines:_.defines,customVertexShaderID:K,customFragmentShaderID:le,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Le,batchingColor:Le&&k._colorsTexture!==null,instancing:He,instancingColor:He&&k.instanceColor!==null,instancingMorph:He&&k.morphTexture!==null,outputColorSpace:oe===null?n.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:at.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Je,matcap:ze,envMap:re,envMapMode:re&&V.mapping,envMapCubeUVHeight:j,aoMap:ce,lightMap:ne,bumpMap:fe,normalMap:ge,displacementMap:Be,emissiveMap:Oe,normalMapObjectSpace:ge&&_.normalMapType===jf,normalMapTangentSpace:ge&&_.normalMapType===sl,packedNormalMap:ge&&_.normalMapType===sl&&qM(_.normalMap.format),metalnessMap:We,roughnessMap:Xe,anisotropy:N,anisotropyMap:q,clearcoat:dt,clearcoatMap:$,clearcoatNormalMap:he,clearcoatRoughnessMap:de,dispersion:Qe,iridescence:R,iridescenceMap:Z,iridescenceThicknessMap:te,sheen:v,sheenColorMap:xe,sheenRoughnessMap:Pe,specularMap:ye,specularColorMap:_e,specularIntensityMap:Fe,transmission:G,transmissionMap:Ne,thicknessMap:$e,gradientMap:U,opaque:_.transparent===!1&&_.blending===ps&&_.alphaToCoverage===!1,alphaMap:pe,alphaTest:ee,alphaHash:ve,combine:_.combine,mapUv:Je&&p(_.map.channel),aoMapUv:ce&&p(_.aoMap.channel),lightMapUv:ne&&p(_.lightMap.channel),bumpMapUv:fe&&p(_.bumpMap.channel),normalMapUv:ge&&p(_.normalMap.channel),displacementMapUv:Be&&p(_.displacementMap.channel),emissiveMapUv:Oe&&p(_.emissiveMap.channel),metalnessMapUv:We&&p(_.metalnessMap.channel),roughnessMapUv:Xe&&p(_.roughnessMap.channel),anisotropyMapUv:q&&p(_.anisotropyMap.channel),clearcoatMapUv:$&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:he&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:te&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:Pe&&p(_.sheenRoughnessMap.channel),specularMapUv:ye&&p(_.specularMap.channel),specularColorMapUv:_e&&p(_.specularColorMap.channel),specularIntensityMapUv:Fe&&p(_.specularIntensityMap.channel),transmissionMapUv:Ne&&p(_.transmissionMap.channel),thicknessMapUv:$e&&p(_.thicknessMap.channel),alphaMapUv:pe&&p(_.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(ge||N),vertexNormals:!!H.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!H.attributes.uv&&(Je||pe),fog:!!B,useFog:_.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||H.attributes.normal===void 0&&ge===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Re,skinning:k.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:J,morphTextureStride:Ee,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:F.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&I.length>0,shadowMapType:n.shadowMap.type,toneMapping:se,decodeVideoTexture:Je&&_.map.isVideoTexture===!0&&at.getTransfer(_.map.colorSpace)===ft,decodeVideoTextureEmissive:Oe&&_.emissiveMap.isVideoTexture===!0&&at.getTransfer(_.emissiveMap.colorSpace)===ft,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ct,flipSided:_.side===un,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Me&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Me&&_.extensions.multiDraw===!0||Le)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ie.vertexUv1s=c.has(1),Ie.vertexUv2s=c.has(2),Ie.vertexUv3s=c.has(3),c.clear(),Ie}function m(_){let A=[];if(_.shaderID?A.push(_.shaderID):(A.push(_.customVertexShaderID),A.push(_.customFragmentShaderID)),_.defines!==void 0)for(let I in _.defines)A.push(I),A.push(_.defines[I]);return _.isRawShaderMaterial===!1&&(g(A,_),w(A,_),A.push(n.outputColorSpace)),A.push(_.customProgramCacheKey),A.join()}function g(_,A){_.push(A.precision),_.push(A.outputColorSpace),_.push(A.envMapMode),_.push(A.envMapCubeUVHeight),_.push(A.mapUv),_.push(A.alphaMapUv),_.push(A.lightMapUv),_.push(A.aoMapUv),_.push(A.bumpMapUv),_.push(A.normalMapUv),_.push(A.displacementMapUv),_.push(A.emissiveMapUv),_.push(A.metalnessMapUv),_.push(A.roughnessMapUv),_.push(A.anisotropyMapUv),_.push(A.clearcoatMapUv),_.push(A.clearcoatNormalMapUv),_.push(A.clearcoatRoughnessMapUv),_.push(A.iridescenceMapUv),_.push(A.iridescenceThicknessMapUv),_.push(A.sheenColorMapUv),_.push(A.sheenRoughnessMapUv),_.push(A.specularMapUv),_.push(A.specularColorMapUv),_.push(A.specularIntensityMapUv),_.push(A.transmissionMapUv),_.push(A.thicknessMapUv),_.push(A.combine),_.push(A.fogExp2),_.push(A.sizeAttenuation),_.push(A.morphTargetsCount),_.push(A.morphAttributeCount),_.push(A.numDirLights),_.push(A.numPointLights),_.push(A.numSpotLights),_.push(A.numSpotLightMaps),_.push(A.numHemiLights),_.push(A.numRectAreaLights),_.push(A.numDirLightShadows),_.push(A.numPointLightShadows),_.push(A.numSpotLightShadows),_.push(A.numSpotLightShadowsWithMaps),_.push(A.numLightProbes),_.push(A.shadowMapType),_.push(A.toneMapping),_.push(A.numClippingPlanes),_.push(A.numClipIntersection),_.push(A.depthPacking)}function w(_,A){o.disableAll(),A.instancing&&o.enable(0),A.instancingColor&&o.enable(1),A.instancingMorph&&o.enable(2),A.matcap&&o.enable(3),A.envMap&&o.enable(4),A.normalMapObjectSpace&&o.enable(5),A.normalMapTangentSpace&&o.enable(6),A.clearcoat&&o.enable(7),A.iridescence&&o.enable(8),A.alphaTest&&o.enable(9),A.vertexColors&&o.enable(10),A.vertexAlphas&&o.enable(11),A.vertexUv1s&&o.enable(12),A.vertexUv2s&&o.enable(13),A.vertexUv3s&&o.enable(14),A.vertexTangents&&o.enable(15),A.anisotropy&&o.enable(16),A.alphaHash&&o.enable(17),A.batching&&o.enable(18),A.dispersion&&o.enable(19),A.batchingColor&&o.enable(20),A.gradientMap&&o.enable(21),A.packedNormalMap&&o.enable(22),A.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.reversedDepthBuffer&&o.enable(4),A.skinning&&o.enable(5),A.morphTargets&&o.enable(6),A.morphNormals&&o.enable(7),A.morphColors&&o.enable(8),A.premultipliedAlpha&&o.enable(9),A.shadowMapEnabled&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),A.decodeVideoTextureEmissive&&o.enable(20),A.alphaToCoverage&&o.enable(21),A.numLightProbeGrids>0&&o.enable(22),A.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function b(_){let A=f[_.type],I;if(A){let P=ri[A];I=hp.clone(P.uniforms)}else I=_.uniforms;return I}function y(_,A){let I=u.get(A);return I!==void 0?++I.usedTimes:(I=new WM(n,A,_,s),l.push(I),u.set(A,I)),I}function T(_){if(--_.usedTimes===0){let A=l.indexOf(_);l[A]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function S(_){a.remove(_)}function C(){a.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:b,acquireProgram:y,releaseProgram:T,releaseShaderCache:S,programs:l,dispose:C}}function $M(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function jM(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function Ip(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Dp(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,p,x,m,g){let w=n[e];return w===void 0?(w={id:d.id,object:d,geometry:f,material:p,materialVariant:o(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:g},n[e]=w):(w.id=d.id,w.object=d,w.geometry=f,w.material=p,w.materialVariant=o(d),w.groupOrder=x,w.renderOrder=d.renderOrder,w.z=m,w.group=g),e++,w}function c(d,f,p,x,m,g){let w=a(d,f,p,x,m,g);p.transmission>0?i.push(w):p.transparent===!0?s.push(w):t.push(w)}function l(d,f,p,x,m,g){let w=a(d,f,p,x,m,g);p.transmission>0?i.unshift(w):p.transparent===!0?s.unshift(w):t.unshift(w)}function u(d,f,p){t.length>1&&t.sort(d||jM),i.length>1&&i.sort(f||Ip),s.length>1&&s.sort(f||Ip),p&&(t.reverse(),i.reverse(),s.reverse())}function h(){for(let d=e,f=n.length;d<f;d++){let p=n[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:h,sort:u}}function ZM(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new Dp,n.set(i,[o])):s>=r.length?(o=new Dp,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function KM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Ge};break;case"SpotLight":t={position:new D,direction:new D,color:new Ge,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ge,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ge,groundColor:new Ge};break;case"RectAreaLight":t={color:new Ge,position:new D,halfWidth:new D,halfHeight:new D};break}return n[e.id]=t,t}}}function JM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var QM=0;function eS(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function tS(n){let e=new KM,t=JM(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);let s=new D,r=new St,o=new St;function a(l){let u=0,h=0,d=0;for(let A=0;A<9;A++)i.probe[A].set(0,0,0);let f=0,p=0,x=0,m=0,g=0,w=0,b=0,y=0,T=0,S=0,C=0;l.sort(eS);for(let A=0,I=l.length;A<I;A++){let P=l[A],k=P.color,F=P.intensity,B=P.distance,H=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Yi?H=P.shadow.map.texture:H=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=k.r*F,h+=k.g*F,d+=k.b*F;else if(P.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(P.sh.coefficients[X],F);C++}else if(P.isDirectionalLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Y=P.shadow,V=t.get(P);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,i.directionalShadow[f]=V,i.directionalShadowMap[f]=H,i.directionalShadowMatrix[f]=P.shadow.matrix,w++}i.directional[f]=X,f++}else if(P.isSpotLight){let X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(k).multiplyScalar(F),X.distance=B,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,i.spot[x]=X;let Y=P.shadow;if(P.map&&(i.spotLightMap[T]=P.map,T++,Y.updateMatrices(P),P.castShadow&&S++),i.spotLightMatrix[x]=Y.matrix,P.castShadow){let V=t.get(P);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,i.spotShadow[x]=V,i.spotShadowMap[x]=H,y++}x++}else if(P.isRectAreaLight){let X=e.get(P);X.color.copy(k).multiplyScalar(F),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),i.rectArea[m]=X,m++}else if(P.isPointLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){let Y=P.shadow,V=t.get(P);V.shadowIntensity=Y.intensity,V.shadowBias=Y.bias,V.shadowNormalBias=Y.normalBias,V.shadowRadius=Y.radius,V.shadowMapSize=Y.mapSize,V.shadowCameraNear=Y.camera.near,V.shadowCameraFar=Y.camera.far,i.pointShadow[p]=V,i.pointShadowMap[p]=H,i.pointShadowMatrix[p]=P.shadow.matrix,b++}i.point[p]=X,p++}else if(P.isHemisphereLight){let X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(F),X.groundColor.copy(P.groundColor).multiplyScalar(F),i.hemi[g]=X,g++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let _=i.hash;(_.directionalLength!==f||_.pointLength!==p||_.spotLength!==x||_.rectAreaLength!==m||_.hemiLength!==g||_.numDirectionalShadows!==w||_.numPointShadows!==b||_.numSpotShadows!==y||_.numSpotMaps!==T||_.numLightProbes!==C)&&(i.directional.length=f,i.spot.length=x,i.rectArea.length=m,i.point.length=p,i.hemi.length=g,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=y+T-S,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=C,_.directionalLength=f,_.pointLength=p,_.spotLength=x,_.rectAreaLength=m,_.hemiLength=g,_.numDirectionalShadows=w,_.numPointShadows=b,_.numSpotShadows=y,_.numSpotMaps=T,_.numLightProbes=C,i.version=QM++)}function c(l,u){let h=0,d=0,f=0,p=0,x=0,m=u.matrixWorldInverse;for(let g=0,w=l.length;g<w;g++){let b=l[g];if(b.isDirectionalLight){let y=i.directional[h];y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(b.isSpotLight){let y=i.spot[f];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(b.isRectAreaLight){let y=i.rectArea[p];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(b.width*.5,0,0),y.halfHeight.set(0,b.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),p++}else if(b.isPointLight){let y=i.point[d];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){let y=i.hemi[x];y.direction.setFromMatrixPosition(b.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:i}}function Lp(n){let e=new tS(n),t=[],i=[],s=[];function r(d){h.camera=d,t.length=0,i.length=0,s.length=0}function o(d){t.push(d)}function a(d){i.push(d)}function c(d){s.push(d)}function l(){e.setup(t)}function u(d){e.setupView(t,d)}let h={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function nS(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Lp(n),e.set(s,[a])):r>=o.length?(a=new Lp(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var iS=\`void main() {
	gl_Position = vec4( position, 1.0 );
}\`,sS=\`uniform sampler2D shadow_pass;
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
}\`,rS=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],oS=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],Op=new St,Oo=new D,Sh=new D;function aS(n,e,t){let i=new cr,s=new ae,r=new ae,o=new wt,a=new sc,c=new rc,l={},u=t.maxTextureSize,h={[dn]:un,[un]:dn,[Ct]:Ct},d=new en({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ae},radius:{value:4}},vertexShader:iS,fragmentShader:sS}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new Ht;p.setAttribute("position",new Jt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new nt(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Es;let g=this.type;this.render=function(S,C,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===Tf&&(ke("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Es);let A=n.getRenderTarget(),I=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),k=n.state;k.setBlending(ti),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let F=g!==this.type;F&&C.traverse(function(B){B.material&&(Array.isArray(B.material)?B.material.forEach(H=>H.needsUpdate=!0):B.material.needsUpdate=!0)});for(let B=0,H=S.length;B<H;B++){let X=S[B],Y=X.shadow;if(Y===void 0){ke("WebGLShadowMap:",X,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let V=Y.getFrameExtents();s.multiply(V),r.copy(Y.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/V.x),s.x=r.x*V.x,Y.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/V.y),s.y=r.y*V.y,Y.mapSize.y=r.y));let j=n.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=j,Y.map===null||F===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===pr){if(X.isPointLight){ke("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Mn(s.x,s.y,{format:Yi,type:ii,minFilter:At,magFilter:At,generateMipmaps:!1}),Y.map.texture.name=X.name+".shadowMap",Y.map.depthTexture=new mi(s.x,s.y,qn),Y.map.depthTexture.name=X.name+".shadowMapDepth",Y.map.depthTexture.format=Qn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=jt,Y.map.depthTexture.magFilter=jt}else X.isPointLight?(Y.map=new ul(s.x),Y.map.depthTexture=new Za(s.x,Xn)):(Y.map=new Mn(s.x,s.y),Y.map.depthTexture=new mi(s.x,s.y,Xn)),Y.map.depthTexture.name=X.name+".shadowMap",Y.map.depthTexture.format=Qn,this.type===Es?(Y.map.depthTexture.compareFunction=j?ol:rl,Y.map.depthTexture.minFilter=At,Y.map.depthTexture.magFilter=At):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=jt,Y.map.depthTexture.magFilter=jt);Y.camera.updateProjectionMatrix()}let W=Y.map.isWebGLCubeRenderTarget?6:1;for(let ie=0;ie<W;ie++){if(Y.map.isWebGLCubeRenderTarget)n.setRenderTarget(Y.map,ie),n.clear();else{ie===0&&(n.setRenderTarget(Y.map),n.clear());let J=Y.getViewport(ie);o.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),k.viewport(o)}if(X.isPointLight){let J=Y.camera,Ee=Y.matrix,Ye=X.distance||J.far;Ye!==J.far&&(J.far=Ye,J.updateProjectionMatrix()),Oo.setFromMatrixPosition(X.matrixWorld),J.position.copy(Oo),Sh.copy(J.position),Sh.add(rS[ie]),J.up.copy(oS[ie]),J.lookAt(Sh),J.updateMatrixWorld(),Ee.makeTranslation(-Oo.x,-Oo.y,-Oo.z),Op.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Op,J.coordinateSystem,J.reversedDepth)}else Y.updateMatrices(X);i=Y.getFrustum(),y(C,_,Y.camera,X,this.type)}Y.isPointLightShadow!==!0&&this.type===pr&&w(Y,_),Y.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(A,I,P)};function w(S,C){let _=e.update(x);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Mn(s.x,s.y,{format:Yi,type:ii})),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(C,null,_,d,x,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(C,null,_,f,x,null)}function b(S,C,_,A){let I=null,P=_.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(P!==void 0)I=P;else if(I=_.isPointLight===!0?c:a,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let k=I.uuid,F=C.uuid,B=l[k];B===void 0&&(B={},l[k]=B);let H=B[F];H===void 0&&(H=I.clone(),B[F]=H,C.addEventListener("dispose",T)),I=H}if(I.visible=C.visible,I.wireframe=C.wireframe,A===pr?I.side=C.shadowSide!==null?C.shadowSide:C.side:I.side=C.shadowSide!==null?C.shadowSide:h[C.side],I.alphaMap=C.alphaMap,I.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,I.map=C.map,I.clipShadows=C.clipShadows,I.clippingPlanes=C.clippingPlanes,I.clipIntersection=C.clipIntersection,I.displacementMap=C.displacementMap,I.displacementScale=C.displacementScale,I.displacementBias=C.displacementBias,I.wireframeLinewidth=C.wireframeLinewidth,I.linewidth=C.linewidth,_.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let k=n.properties.get(I);k.light=_}return I}function y(S,C,_,A,I){if(S.visible===!1)return;if(S.layers.test(C.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&I===pr)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,S.matrixWorld);let F=e.update(S),B=S.material;if(Array.isArray(B)){let H=F.groups;for(let X=0,Y=H.length;X<Y;X++){let V=H[X],j=B[V.materialIndex];if(j&&j.visible){let W=b(S,j,A,I);S.onBeforeShadow(n,S,C,_,F,W,V),n.renderBufferDirect(_,null,F,W,S,V),S.onAfterShadow(n,S,C,_,F,W,V)}}}else if(B.visible){let H=b(S,B,A,I);S.onBeforeShadow(n,S,C,_,F,H,null),n.renderBufferDirect(_,null,F,H,S,null),S.onAfterShadow(n,S,C,_,F,H,null)}}let k=S.children;for(let F=0,B=k.length;F<B;F++)y(k[F],C,_,A,I)}function T(S){S.target.removeEventListener("dispose",T);for(let _ in l){let A=l[_],I=S.target.uuid;I in A&&(A[I].dispose(),delete A[I])}}}function cS(n,e){function t(){let U=!1,pe=new wt,ee=null,ve=new wt(0,0,0,0);return{setMask:function(Me){ee!==Me&&!U&&(n.colorMask(Me,Me,Me,Me),ee=Me)},setLocked:function(Me){U=Me},setClear:function(Me,se,Ie,Te,Et){Et===!0&&(Me*=Te,se*=Te,Ie*=Te),pe.set(Me,se,Ie,Te),ve.equals(pe)===!1&&(n.clearColor(Me,se,Ie,Te),ve.copy(pe))},reset:function(){U=!1,ee=null,ve.set(-1,0,0,0)}}}function i(){let U=!1,pe=!1,ee=null,ve=null,Me=null;return{setReversed:function(se){if(pe!==se){let Ie=e.get("EXT_clip_control");se?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),pe=se;let Te=Me;Me=null,this.setClear(Te)}},getReversed:function(){return pe},setTest:function(se){se?oe(n.DEPTH_TEST):Re(n.DEPTH_TEST)},setMask:function(se){ee!==se&&!U&&(n.depthMask(se),ee=se)},setFunc:function(se){if(pe&&(se=rp[se]),ve!==se){switch(se){case Ba:n.depthFunc(n.NEVER);break;case ka:n.depthFunc(n.ALWAYS);break;case za:n.depthFunc(n.LESS);break;case ms:n.depthFunc(n.LEQUAL);break;case Ha:n.depthFunc(n.EQUAL);break;case Va:n.depthFunc(n.GEQUAL);break;case Ga:n.depthFunc(n.GREATER);break;case Wa:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ve=se}},setLocked:function(se){U=se},setClear:function(se){Me!==se&&(Me=se,pe&&(se=1-se),n.clearDepth(se))},reset:function(){U=!1,ee=null,ve=null,Me=null,pe=!1}}}function s(){let U=!1,pe=null,ee=null,ve=null,Me=null,se=null,Ie=null,Te=null,Et=null;return{setTest:function(mt){U||(mt?oe(n.STENCIL_TEST):Re(n.STENCIL_TEST))},setMask:function(mt){pe!==mt&&!U&&(n.stencilMask(mt),pe=mt)},setFunc:function(mt,In,xn){(ee!==mt||ve!==In||Me!==xn)&&(n.stencilFunc(mt,In,xn),ee=mt,ve=In,Me=xn)},setOp:function(mt,In,xn){(se!==mt||Ie!==In||Te!==xn)&&(n.stencilOp(mt,In,xn),se=mt,Ie=In,Te=xn)},setLocked:function(mt){U=mt},setClear:function(mt){Et!==mt&&(n.clearStencil(mt),Et=mt)},reset:function(){U=!1,pe=null,ee=null,ve=null,Me=null,se=null,Ie=null,Te=null,Et=null}}}let r=new t,o=new i,a=new s,c=new WeakMap,l=new WeakMap,u={},h={},d={},f=new WeakMap,p=[],x=null,m=!1,g=null,w=null,b=null,y=null,T=null,S=null,C=null,_=new Ge(0,0,0),A=0,I=!1,P=null,k=null,F=null,B=null,H=null,X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,V=0,j=n.getParameter(n.VERSION);j.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\\d)/.exec(j)[1]),Y=V>=1):j.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\\d)/.exec(j)[1]),Y=V>=2);let W=null,ie={},J=n.getParameter(n.SCISSOR_BOX),Ee=n.getParameter(n.VIEWPORT),Ye=new wt().fromArray(J),qe=new wt().fromArray(Ee);function K(U,pe,ee,ve){let Me=new Uint8Array(4),se=n.createTexture();n.bindTexture(U,se),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ie=0;Ie<ee;Ie++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(pe,0,n.RGBA,1,1,ve,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(pe+Ie,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return se}let le={};le[n.TEXTURE_2D]=K(n.TEXTURE_2D,n.TEXTURE_2D,1),le[n.TEXTURE_CUBE_MAP]=K(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[n.TEXTURE_2D_ARRAY]=K(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),le[n.TEXTURE_3D]=K(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(n.DEPTH_TEST),o.setFunc(ms),fe(!1),ge(qu),oe(n.CULL_FACE),ce(ti);function oe(U){u[U]!==!0&&(n.enable(U),u[U]=!0)}function Re(U){u[U]!==!1&&(n.disable(U),u[U]=!1)}function He(U,pe){return d[U]!==pe?(n.bindFramebuffer(U,pe),d[U]=pe,U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=pe),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=pe),!0):!1}function Le(U,pe){let ee=p,ve=!1;if(U){ee=f.get(pe),ee===void 0&&(ee=[],f.set(pe,ee));let Me=U.textures;if(ee.length!==Me.length||ee[0]!==n.COLOR_ATTACHMENT0){for(let se=0,Ie=Me.length;se<Ie;se++)ee[se]=n.COLOR_ATTACHMENT0+se;ee.length=Me.length,ve=!0}}else ee[0]!==n.BACK&&(ee[0]=n.BACK,ve=!0);ve&&n.drawBuffers(ee)}function Je(U){return x!==U?(n.useProgram(U),x=U,!0):!1}let ze={[Ui]:n.FUNC_ADD,[Cf]:n.FUNC_SUBTRACT,[Rf]:n.FUNC_REVERSE_SUBTRACT};ze[Pf]=n.MIN,ze[If]=n.MAX;let re={[Df]:n.ZERO,[Lf]:n.ONE,[Of]:n.SRC_COLOR,[Fa]:n.SRC_ALPHA,[zf]:n.SRC_ALPHA_SATURATE,[Bf]:n.DST_COLOR,[Ff]:n.DST_ALPHA,[Nf]:n.ONE_MINUS_SRC_COLOR,[Ua]:n.ONE_MINUS_SRC_ALPHA,[kf]:n.ONE_MINUS_DST_COLOR,[Uf]:n.ONE_MINUS_DST_ALPHA,[Hf]:n.CONSTANT_COLOR,[Vf]:n.ONE_MINUS_CONSTANT_COLOR,[Gf]:n.CONSTANT_ALPHA,[Wf]:n.ONE_MINUS_CONSTANT_ALPHA};function ce(U,pe,ee,ve,Me,se,Ie,Te,Et,mt){if(U===ti){m===!0&&(Re(n.BLEND),m=!1);return}if(m===!1&&(oe(n.BLEND),m=!0),U!==Af){if(U!==g||mt!==I){if((w!==Ui||T!==Ui)&&(n.blendEquation(n.FUNC_ADD),w=Ui,T=Ui),mt)switch(U){case ps:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Wi:n.blendFunc(n.ONE,n.ONE);break;case Yu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case $u:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ve("WebGLState: Invalid blending: ",U);break}else switch(U){case ps:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Wi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Yu:Ve("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case $u:Ve("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ve("WebGLState: Invalid blending: ",U);break}b=null,y=null,S=null,C=null,_.set(0,0,0),A=0,g=U,I=mt}return}Me=Me||pe,se=se||ee,Ie=Ie||ve,(pe!==w||Me!==T)&&(n.blendEquationSeparate(ze[pe],ze[Me]),w=pe,T=Me),(ee!==b||ve!==y||se!==S||Ie!==C)&&(n.blendFuncSeparate(re[ee],re[ve],re[se],re[Ie]),b=ee,y=ve,S=se,C=Ie),(Te.equals(_)===!1||Et!==A)&&(n.blendColor(Te.r,Te.g,Te.b,Et),_.copy(Te),A=Et),g=U,I=!1}function ne(U,pe){U.side===Ct?Re(n.CULL_FACE):oe(n.CULL_FACE);let ee=U.side===un;pe&&(ee=!ee),fe(ee),U.blending===ps&&U.transparent===!1?ce(ti):ce(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);let ve=U.stencilWrite;a.setTest(ve),ve&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Oe(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?oe(n.SAMPLE_ALPHA_TO_COVERAGE):Re(n.SAMPLE_ALPHA_TO_COVERAGE)}function fe(U){P!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),P=U)}function ge(U){U!==Ef?(oe(n.CULL_FACE),U!==k&&(U===qu?n.cullFace(n.BACK):U===wf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Re(n.CULL_FACE),k=U}function Be(U){U!==F&&(Y&&n.lineWidth(U),F=U)}function Oe(U,pe,ee){U?(oe(n.POLYGON_OFFSET_FILL),(B!==pe||H!==ee)&&(B=pe,H=ee,o.getReversed()&&(pe=-pe),n.polygonOffset(pe,ee))):Re(n.POLYGON_OFFSET_FILL)}function We(U){U?oe(n.SCISSOR_TEST):Re(n.SCISSOR_TEST)}function Xe(U){U===void 0&&(U=n.TEXTURE0+X-1),W!==U&&(n.activeTexture(U),W=U)}function N(U,pe,ee){ee===void 0&&(W===null?ee=n.TEXTURE0+X-1:ee=W);let ve=ie[ee];ve===void 0&&(ve={type:void 0,texture:void 0},ie[ee]=ve),(ve.type!==U||ve.texture!==pe)&&(W!==ee&&(n.activeTexture(ee),W=ee),n.bindTexture(U,pe||le[U]),ve.type=U,ve.texture=pe)}function dt(){let U=ie[W];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function Qe(){try{n.compressedTexImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function R(){try{n.compressedTexImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function v(){try{n.texSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function G(){try{n.texSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function q(){try{n.compressedTexSubImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function $(){try{n.compressedTexSubImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function he(){try{n.texStorage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function de(){try{n.texStorage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function Z(){try{n.texImage2D(...arguments)}catch(U){Ve("WebGLState:",U)}}function te(){try{n.texImage3D(...arguments)}catch(U){Ve("WebGLState:",U)}}function xe(U){return h[U]!==void 0?h[U]:n.getParameter(U)}function Pe(U,pe){h[U]!==pe&&(n.pixelStorei(U,pe),h[U]=pe)}function ye(U){Ye.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Ye.copy(U))}function _e(U){qe.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),qe.copy(U))}function Fe(U,pe){let ee=l.get(pe);ee===void 0&&(ee=new WeakMap,l.set(pe,ee));let ve=ee.get(U);ve===void 0&&(ve=n.getUniformBlockIndex(pe,U.name),ee.set(U,ve))}function Ne(U,pe){let ve=l.get(pe).get(U);c.get(pe)!==ve&&(n.uniformBlockBinding(pe,ve,U.__bindingPointIndex),c.set(pe,ve))}function $e(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},h={},W=null,ie={},d={},f=new WeakMap,p=[],x=null,m=!1,g=null,w=null,b=null,y=null,T=null,S=null,C=null,_=new Ge(0,0,0),A=0,I=!1,P=null,k=null,F=null,B=null,H=null,Ye.set(0,0,n.canvas.width,n.canvas.height),qe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:oe,disable:Re,bindFramebuffer:He,drawBuffers:Le,useProgram:Je,setBlending:ce,setMaterial:ne,setFlipSided:fe,setCullFace:ge,setLineWidth:Be,setPolygonOffset:Oe,setScissorTest:We,activeTexture:Xe,bindTexture:N,unbindTexture:dt,compressedTexImage2D:Qe,compressedTexImage3D:R,texImage2D:Z,texImage3D:te,pixelStorei:Pe,getParameter:xe,updateUBOMapping:Fe,uniformBlockBinding:Ne,texStorage2D:he,texStorage3D:de,texSubImage2D:v,texSubImage3D:G,compressedTexSubImage2D:q,compressedTexSubImage3D:$,scissor:ye,viewport:_e,reset:$e}}function lS(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ae,u=new WeakMap,h=new Set,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(R,v){return p?new OffscreenCanvas(R,v):to("canvas")}function m(R,v,G){let q=1,$=Qe(R);if(($.width>G||$.height>G)&&(q=G/Math.max($.width,$.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let he=Math.floor(q*$.width),de=Math.floor(q*$.height);d===void 0&&(d=x(he,de));let Z=v?x(he,de):d;return Z.width=he,Z.height=de,Z.getContext("2d").drawImage(R,0,0,he,de),ke("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+he+"x"+de+")."),Z}else return"data"in R&&ke("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),R;return R}function g(R){return R.generateMipmaps}function w(R){n.generateMipmap(R)}function b(R){return R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?n.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(R,v,G,q,$,he=!1){if(R!==null){if(n[R]!==void 0)return n[R];ke("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let de;q&&(de=e.get("EXT_texture_norm16"),de||ke("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=v;if(v===n.RED&&(G===n.FLOAT&&(Z=n.R32F),G===n.HALF_FLOAT&&(Z=n.R16F),G===n.UNSIGNED_BYTE&&(Z=n.R8),G===n.UNSIGNED_SHORT&&de&&(Z=de.R16_EXT),G===n.SHORT&&de&&(Z=de.R16_SNORM_EXT)),v===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&(Z=n.R8UI),G===n.UNSIGNED_SHORT&&(Z=n.R16UI),G===n.UNSIGNED_INT&&(Z=n.R32UI),G===n.BYTE&&(Z=n.R8I),G===n.SHORT&&(Z=n.R16I),G===n.INT&&(Z=n.R32I)),v===n.RG&&(G===n.FLOAT&&(Z=n.RG32F),G===n.HALF_FLOAT&&(Z=n.RG16F),G===n.UNSIGNED_BYTE&&(Z=n.RG8),G===n.UNSIGNED_SHORT&&de&&(Z=de.RG16_EXT),G===n.SHORT&&de&&(Z=de.RG16_SNORM_EXT)),v===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&(Z=n.RG8UI),G===n.UNSIGNED_SHORT&&(Z=n.RG16UI),G===n.UNSIGNED_INT&&(Z=n.RG32UI),G===n.BYTE&&(Z=n.RG8I),G===n.SHORT&&(Z=n.RG16I),G===n.INT&&(Z=n.RG32I)),v===n.RGB_INTEGER&&(G===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),G===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),G===n.UNSIGNED_INT&&(Z=n.RGB32UI),G===n.BYTE&&(Z=n.RGB8I),G===n.SHORT&&(Z=n.RGB16I),G===n.INT&&(Z=n.RGB32I)),v===n.RGBA_INTEGER&&(G===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),G===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),G===n.UNSIGNED_INT&&(Z=n.RGBA32UI),G===n.BYTE&&(Z=n.RGBA8I),G===n.SHORT&&(Z=n.RGBA16I),G===n.INT&&(Z=n.RGBA32I)),v===n.RGB&&(G===n.UNSIGNED_SHORT&&de&&(Z=de.RGB16_EXT),G===n.SHORT&&de&&(Z=de.RGB16_SNORM_EXT),G===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),G===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),v===n.RGBA){let te=he?eo:at.getTransfer($);G===n.FLOAT&&(Z=n.RGBA32F),G===n.HALF_FLOAT&&(Z=n.RGBA16F),G===n.UNSIGNED_BYTE&&(Z=te===ft?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT&&de&&(Z=de.RGBA16_EXT),G===n.SHORT&&de&&(Z=de.RGBA16_SNORM_EXT),G===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function T(R,v){let G;return R?v===null||v===Xn||v===xr?G=n.DEPTH24_STENCIL8:v===qn?G=n.DEPTH32F_STENCIL8:v===gr&&(G=n.DEPTH24_STENCIL8,ke("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Xn||v===xr?G=n.DEPTH_COMPONENT24:v===qn?G=n.DEPTH_COMPONENT32F:v===gr&&(G=n.DEPTH_COMPONENT16),G}function S(R,v){return g(R)===!0||R.isFramebufferTexture&&R.minFilter!==jt&&R.minFilter!==At?Math.log2(Math.max(v.width,v.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?v.mipmaps.length:1}function C(R){let v=R.target;v.removeEventListener("dispose",C),A(v),v.isVideoTexture&&u.delete(v),v.isHTMLTexture&&h.delete(v)}function _(R){let v=R.target;v.removeEventListener("dispose",_),P(v)}function A(R){let v=i.get(R);if(v.__webglInit===void 0)return;let G=R.source,q=f.get(G);if(q){let $=q[v.__cacheKey];$.usedTimes--,$.usedTimes===0&&I(R),Object.keys(q).length===0&&f.delete(G)}i.remove(R)}function I(R){let v=i.get(R);n.deleteTexture(v.__webglTexture);let G=R.source,q=f.get(G);delete q[v.__cacheKey],o.memory.textures--}function P(R){let v=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(v.__webglFramebuffer[q]))for(let $=0;$<v.__webglFramebuffer[q].length;$++)n.deleteFramebuffer(v.__webglFramebuffer[q][$]);else n.deleteFramebuffer(v.__webglFramebuffer[q]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[q])}else{if(Array.isArray(v.__webglFramebuffer))for(let q=0;q<v.__webglFramebuffer.length;q++)n.deleteFramebuffer(v.__webglFramebuffer[q]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let q=0;q<v.__webglColorRenderbuffer.length;q++)v.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let G=R.textures;for(let q=0,$=G.length;q<$;q++){let he=i.get(G[q]);he.__webglTexture&&(n.deleteTexture(he.__webglTexture),o.memory.textures--),i.remove(G[q])}i.remove(R)}let k=0;function F(){k=0}function B(){return k}function H(R){k=R}function X(){let R=k;return R>=s.maxTextures&&ke("WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),k+=1,R}function Y(R){let v=[];return v.push(R.wrapS),v.push(R.wrapT),v.push(R.wrapR||0),v.push(R.magFilter),v.push(R.minFilter),v.push(R.anisotropy),v.push(R.internalFormat),v.push(R.format),v.push(R.type),v.push(R.generateMipmaps),v.push(R.premultiplyAlpha),v.push(R.flipY),v.push(R.unpackAlignment),v.push(R.colorSpace),v.join()}function V(R,v){let G=i.get(R);if(R.isVideoTexture&&N(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&G.__version!==R.version){let q=R.image;if(q===null)ke("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)ke("WebGLRenderer: Texture marked for update but image is incomplete");else{Re(G,R,v);return}}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+v)}function j(R,v){let G=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){Re(G,R,v);return}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+v)}function W(R,v){let G=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){Re(G,R,v);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+v)}function ie(R,v){let G=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&G.__version!==R.version){He(G,R,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+v)}let J={[gs]:n.REPEAT,[Jn]:n.CLAMP_TO_EDGE,[Xa]:n.MIRRORED_REPEAT},Ee={[jt]:n.NEAREST,[Yf]:n.NEAREST_MIPMAP_NEAREST,[To]:n.NEAREST_MIPMAP_LINEAR,[At]:n.LINEAR,[bc]:n.LINEAR_MIPMAP_NEAREST,[ni]:n.LINEAR_MIPMAP_LINEAR},Ye={[Zf]:n.NEVER,[tp]:n.ALWAYS,[Kf]:n.LESS,[rl]:n.LEQUAL,[Jf]:n.EQUAL,[ol]:n.GEQUAL,[Qf]:n.GREATER,[ep]:n.NOTEQUAL};function qe(R,v){if(v.type===qn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===At||v.magFilter===bc||v.magFilter===To||v.magFilter===ni||v.minFilter===At||v.minFilter===bc||v.minFilter===To||v.minFilter===ni)&&ke("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(R,n.TEXTURE_WRAP_S,J[v.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,J[v.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,J[v.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,Ee[v.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,Ee[v.minFilter]),v.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,Ye[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===jt||v.minFilter!==To&&v.minFilter!==ni||v.type===qn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let G=e.get("EXT_texture_filter_anisotropic");n.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function K(R,v){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,v.addEventListener("dispose",C));let q=v.source,$=f.get(q);$===void 0&&($={},f.set(q,$));let he=Y(v);if(he!==R.__cacheKey){$[he]===void 0&&($[he]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,G=!0),$[he].usedTimes++;let de=$[R.__cacheKey];de!==void 0&&($[R.__cacheKey].usedTimes--,de.usedTimes===0&&I(v)),R.__cacheKey=he,R.__webglTexture=$[he].texture}return G}function le(R,v,G){return Math.floor(Math.floor(R/G)/v)}function oe(R,v,G,q){let he=R.updateRanges;if(he.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,G,q,v.data);else{he.sort((Pe,ye)=>Pe.start-ye.start);let de=0;for(let Pe=1;Pe<he.length;Pe++){let ye=he[de],_e=he[Pe],Fe=ye.start+ye.count,Ne=le(_e.start,v.width,4),$e=le(ye.start,v.width,4);_e.start<=Fe+1&&Ne===$e&&le(_e.start+_e.count-1,v.width,4)===Ne?ye.count=Math.max(ye.count,_e.start+_e.count-ye.start):(++de,he[de]=_e)}he.length=de+1;let Z=t.getParameter(n.UNPACK_ROW_LENGTH),te=t.getParameter(n.UNPACK_SKIP_PIXELS),xe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let Pe=0,ye=he.length;Pe<ye;Pe++){let _e=he[Pe],Fe=Math.floor(_e.start/4),Ne=Math.ceil(_e.count/4),$e=Fe%v.width,U=Math.floor(Fe/v.width),pe=Ne,ee=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(n.UNPACK_SKIP_ROWS,U),t.texSubImage2D(n.TEXTURE_2D,0,$e,U,pe,ee,G,q,v.data)}R.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Z),t.pixelStorei(n.UNPACK_SKIP_PIXELS,te),t.pixelStorei(n.UNPACK_SKIP_ROWS,xe)}}function Re(R,v,G){let q=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(q=n.TEXTURE_3D);let $=K(R,v),he=v.source;t.bindTexture(q,R.__webglTexture,n.TEXTURE0+G);let de=i.get(he);if(he.version!==de.__version||$===!0){if(t.activeTexture(n.TEXTURE0+G),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let ee=at.getPrimaries(at.workingColorSpace),ve=v.colorSpace===_i?null:at.getPrimaries(v.colorSpace),Me=v.colorSpace===_i||ee===ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me)}t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment);let te=m(v.image,!1,s.maxTextureSize);te=dt(v,te);let xe=r.convert(v.format,v.colorSpace),Pe=r.convert(v.type),ye=y(v.internalFormat,xe,Pe,v.normalized,v.colorSpace,v.isVideoTexture);qe(q,v);let _e,Fe=v.mipmaps,Ne=v.isVideoTexture!==!0,$e=de.__version===void 0||$===!0,U=he.dataReady,pe=S(v,te);if(v.isDepthTexture)ye=T(v.format===qi,v.type),$e&&(Ne?t.texStorage2D(n.TEXTURE_2D,1,ye,te.width,te.height):t.texImage2D(n.TEXTURE_2D,0,ye,te.width,te.height,0,xe,Pe,null));else if(v.isDataTexture)if(Fe.length>0){Ne&&$e&&t.texStorage2D(n.TEXTURE_2D,pe,ye,Fe[0].width,Fe[0].height);for(let ee=0,ve=Fe.length;ee<ve;ee++)_e=Fe[ee],Ne?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,_e.width,_e.height,xe,Pe,_e.data):t.texImage2D(n.TEXTURE_2D,ee,ye,_e.width,_e.height,0,xe,Pe,_e.data);v.generateMipmaps=!1}else Ne?($e&&t.texStorage2D(n.TEXTURE_2D,pe,ye,te.width,te.height),U&&oe(v,te,xe,Pe)):t.texImage2D(n.TEXTURE_2D,0,ye,te.width,te.height,0,xe,Pe,te.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Ne&&$e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ye,Fe[0].width,Fe[0].height,te.depth);for(let ee=0,ve=Fe.length;ee<ve;ee++)if(_e=Fe[ee],v.format!==pn)if(xe!==null)if(Ne){if(U)if(v.layerUpdates.size>0){let Me=xh(_e.width,_e.height,v.format,v.type);for(let se of v.layerUpdates){let Ie=_e.data.subarray(se*Me/_e.data.BYTES_PER_ELEMENT,(se+1)*Me/_e.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,se,_e.width,_e.height,1,xe,Ie)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,_e.width,_e.height,te.depth,xe,_e.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ee,ye,_e.width,_e.height,te.depth,0,_e.data,0,0);else ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?U&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ee,0,0,0,_e.width,_e.height,te.depth,xe,Pe,_e.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ee,ye,_e.width,_e.height,te.depth,0,xe,Pe,_e.data)}else{Ne&&$e&&t.texStorage2D(n.TEXTURE_2D,pe,ye,Fe[0].width,Fe[0].height);for(let ee=0,ve=Fe.length;ee<ve;ee++)_e=Fe[ee],v.format!==pn?xe!==null?Ne?U&&t.compressedTexSubImage2D(n.TEXTURE_2D,ee,0,0,_e.width,_e.height,xe,_e.data):t.compressedTexImage2D(n.TEXTURE_2D,ee,ye,_e.width,_e.height,0,_e.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,_e.width,_e.height,xe,Pe,_e.data):t.texImage2D(n.TEXTURE_2D,ee,ye,_e.width,_e.height,0,xe,Pe,_e.data)}else if(v.isDataArrayTexture)if(Ne){if($e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ye,te.width,te.height,te.depth),U)if(v.layerUpdates.size>0){let ee=xh(te.width,te.height,v.format,v.type);for(let ve of v.layerUpdates){let Me=te.data.subarray(ve*ee/te.data.BYTES_PER_ELEMENT,(ve+1)*ee/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ve,te.width,te.height,1,xe,Pe,Me)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,xe,Pe,te.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ye,te.width,te.height,te.depth,0,xe,Pe,te.data);else if(v.isData3DTexture)Ne?($e&&t.texStorage3D(n.TEXTURE_3D,pe,ye,te.width,te.height,te.depth),U&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,xe,Pe,te.data)):t.texImage3D(n.TEXTURE_3D,0,ye,te.width,te.height,te.depth,0,xe,Pe,te.data);else if(v.isFramebufferTexture){if($e)if(Ne)t.texStorage2D(n.TEXTURE_2D,pe,ye,te.width,te.height);else{let ee=te.width,ve=te.height;for(let Me=0;Me<pe;Me++)t.texImage2D(n.TEXTURE_2D,Me,ye,ee,ve,0,xe,Pe,null),ee>>=1,ve>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in n){let ee=n.canvas;if(ee.hasAttribute("layoutsubtree")||ee.setAttribute("layoutsubtree","true"),te.parentNode!==ee){ee.appendChild(te),h.add(v),ee.onpaint=ve=>{let Me=ve.changedElements;for(let se of h)Me.includes(se.image)&&(se.needsUpdate=!0)},ee.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,te);else{let Me=n.RGBA,se=n.RGBA,Ie=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Me,se,Ie,te)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Fe.length>0){if(Ne&&$e){let ee=Qe(Fe[0]);t.texStorage2D(n.TEXTURE_2D,pe,ye,ee.width,ee.height)}for(let ee=0,ve=Fe.length;ee<ve;ee++)_e=Fe[ee],Ne?U&&t.texSubImage2D(n.TEXTURE_2D,ee,0,0,xe,Pe,_e):t.texImage2D(n.TEXTURE_2D,ee,ye,xe,Pe,_e);v.generateMipmaps=!1}else if(Ne){if($e){let ee=Qe(te);t.texStorage2D(n.TEXTURE_2D,pe,ye,ee.width,ee.height)}U&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,xe,Pe,te)}else t.texImage2D(n.TEXTURE_2D,0,ye,xe,Pe,te);g(v)&&w(q),de.__version=he.version,v.onUpdate&&v.onUpdate(v)}R.__version=v.version}function He(R,v,G){if(v.image.length!==6)return;let q=K(R,v),$=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+G);let he=i.get($);if($.version!==he.__version||q===!0){t.activeTexture(n.TEXTURE0+G);let de=at.getPrimaries(at.workingColorSpace),Z=v.colorSpace===_i?null:at.getPrimaries(v.colorSpace),te=v.colorSpace===_i||de===Z?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let xe=v.isCompressedTexture||v.image[0].isCompressedTexture,Pe=v.image[0]&&v.image[0].isDataTexture,ye=[];for(let se=0;se<6;se++)!xe&&!Pe?ye[se]=m(v.image[se],!0,s.maxCubemapSize):ye[se]=Pe?v.image[se].image:v.image[se],ye[se]=dt(v,ye[se]);let _e=ye[0],Fe=r.convert(v.format,v.colorSpace),Ne=r.convert(v.type),$e=y(v.internalFormat,Fe,Ne,v.normalized,v.colorSpace),U=v.isVideoTexture!==!0,pe=he.__version===void 0||q===!0,ee=$.dataReady,ve=S(v,_e);qe(n.TEXTURE_CUBE_MAP,v);let Me;if(xe){U&&pe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,$e,_e.width,_e.height);for(let se=0;se<6;se++){Me=ye[se].mipmaps;for(let Ie=0;Ie<Me.length;Ie++){let Te=Me[Ie];v.format!==pn?Fe!==null?U?ee&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,0,0,Te.width,Te.height,Fe,Te.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,$e,Te.width,Te.height,0,Te.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,0,0,Te.width,Te.height,Fe,Ne,Te.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie,$e,Te.width,Te.height,0,Fe,Ne,Te.data)}}}else{if(Me=v.mipmaps,U&&pe){Me.length>0&&ve++;let se=Qe(ye[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,$e,se.width,se.height)}for(let se=0;se<6;se++)if(Pe){U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,ye[se].width,ye[se].height,Fe,Ne,ye[se].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,$e,ye[se].width,ye[se].height,0,Fe,Ne,ye[se].data);for(let Ie=0;Ie<Me.length;Ie++){let Et=Me[Ie].image[se].image;U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,0,0,Et.width,Et.height,Fe,Ne,Et.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,$e,Et.width,Et.height,0,Fe,Ne,Et.data)}}else{U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,0,0,Fe,Ne,ye[se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,$e,Fe,Ne,ye[se]);for(let Ie=0;Ie<Me.length;Ie++){let Te=Me[Ie];U?ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,0,0,Fe,Ne,Te.image[se]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ie+1,$e,Fe,Ne,Te.image[se])}}}g(v)&&w(n.TEXTURE_CUBE_MAP),he.__version=$.version,v.onUpdate&&v.onUpdate(v)}R.__version=v.version}function Le(R,v,G,q,$,he){let de=r.convert(G.format,G.colorSpace),Z=r.convert(G.type),te=y(G.internalFormat,de,Z,G.normalized,G.colorSpace),xe=i.get(v),Pe=i.get(G);if(Pe.__renderTarget=v,!xe.__hasExternalTextures){let ye=Math.max(1,v.width>>he),_e=Math.max(1,v.height>>he);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?t.texImage3D($,he,te,ye,_e,v.depth,0,de,Z,null):t.texImage2D($,he,te,ye,_e,0,de,Z,null)}t.bindFramebuffer(n.FRAMEBUFFER,R),Xe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,$,Pe.__webglTexture,0,We(v)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,$,Pe.__webglTexture,he),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Je(R,v,G){if(n.bindRenderbuffer(n.RENDERBUFFER,R),v.depthBuffer){let q=v.depthTexture,$=q&&q.isDepthTexture?q.type:null,he=T(v.stencilBuffer,$),de=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Xe(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,We(v),he,v.width,v.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,We(v),he,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,he,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,R)}else{let q=v.textures;for(let $=0;$<q.length;$++){let he=q[$],de=r.convert(he.format,he.colorSpace),Z=r.convert(he.type),te=y(he.internalFormat,de,Z,he.normalized,he.colorSpace);Xe(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,We(v),te,v.width,v.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,We(v),te,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,te,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ze(R,v,G){let q=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,R),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=i.get(v.depthTexture);if($.__renderTarget=v,(!$.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),q){if($.__webglInit===void 0&&($.__webglInit=!0,v.depthTexture.addEventListener("dispose",C)),$.__webglTexture===void 0){$.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),qe(n.TEXTURE_CUBE_MAP,v.depthTexture);let xe=r.convert(v.depthTexture.format),Pe=r.convert(v.depthTexture.type),ye;v.depthTexture.format===Qn?ye=n.DEPTH_COMPONENT24:v.depthTexture.format===qi&&(ye=n.DEPTH24_STENCIL8);for(let _e=0;_e<6;_e++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,ye,v.width,v.height,0,xe,Pe,null)}}else V(v.depthTexture,0);let he=$.__webglTexture,de=We(v),Z=q?n.TEXTURE_CUBE_MAP_POSITIVE_X+G:n.TEXTURE_2D,te=v.depthTexture.format===qi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(v.depthTexture.format===Qn)Xe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,te,Z,he,0,de):n.framebufferTexture2D(n.FRAMEBUFFER,te,Z,he,0);else if(v.depthTexture.format===qi)Xe(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,te,Z,he,0,de):n.framebufferTexture2D(n.FRAMEBUFFER,te,Z,he,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function re(R){let v=i.get(R),G=R.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==R.depthTexture){let q=R.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),q){let $=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,q.removeEventListener("dispose",$)};q.addEventListener("dispose",$),v.__depthDisposeCallback=$}v.__boundDepthTexture=q}if(R.depthTexture&&!v.__autoAllocateDepthBuffer)if(G)for(let q=0;q<6;q++)ze(v.__webglFramebuffer[q],R,q);else{let q=R.texture.mipmaps;q&&q.length>0?ze(v.__webglFramebuffer[0],R,0):ze(v.__webglFramebuffer,R,0)}else if(G){v.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[q]),v.__webglDepthbuffer[q]===void 0)v.__webglDepthbuffer[q]=n.createRenderbuffer(),Je(v.__webglDepthbuffer[q],R,!1);else{let $=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=v.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,he),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,he)}}else{let q=R.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),Je(v.__webglDepthbuffer,R,!1);else{let $=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,he),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,he)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ce(R,v,G){let q=i.get(R);v!==void 0&&Le(q.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&re(R)}function ne(R){let v=R.texture,G=i.get(R),q=i.get(v);R.addEventListener("dispose",_);let $=R.textures,he=R.isWebGLCubeRenderTarget===!0,de=$.length>1;if(de||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=v.version,o.memory.textures++),he){G.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer[Z]=[];for(let te=0;te<v.mipmaps.length;te++)G.__webglFramebuffer[Z][te]=n.createFramebuffer()}else G.__webglFramebuffer[Z]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer=[];for(let Z=0;Z<v.mipmaps.length;Z++)G.__webglFramebuffer[Z]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(de)for(let Z=0,te=$.length;Z<te;Z++){let xe=i.get($[Z]);xe.__webglTexture===void 0&&(xe.__webglTexture=n.createTexture(),o.memory.textures++)}if(R.samples>0&&Xe(R)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Z=0;Z<$.length;Z++){let te=$[Z];G.__webglColorRenderbuffer[Z]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[Z]);let xe=r.convert(te.format,te.colorSpace),Pe=r.convert(te.type),ye=y(te.internalFormat,xe,Pe,te.normalized,te.colorSpace,R.isXRRenderTarget===!0),_e=We(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,_e,ye,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Z,n.RENDERBUFFER,G.__webglColorRenderbuffer[Z])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),Je(G.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(he){t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),qe(n.TEXTURE_CUBE_MAP,v);for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0)for(let te=0;te<v.mipmaps.length;te++)Le(G.__webglFramebuffer[Z][te],R,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,te);else Le(G.__webglFramebuffer[Z],R,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);g(v)&&w(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let Z=0,te=$.length;Z<te;Z++){let xe=$[Z],Pe=i.get(xe),ye=n.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ye=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ye,Pe.__webglTexture),qe(ye,xe),Le(G.__webglFramebuffer,R,xe,n.COLOR_ATTACHMENT0+Z,ye,0),g(xe)&&w(ye)}t.unbindTexture()}else{let Z=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Z=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Z,q.__webglTexture),qe(Z,v),v.mipmaps&&v.mipmaps.length>0)for(let te=0;te<v.mipmaps.length;te++)Le(G.__webglFramebuffer[te],R,v,n.COLOR_ATTACHMENT0,Z,te);else Le(G.__webglFramebuffer,R,v,n.COLOR_ATTACHMENT0,Z,0);g(v)&&w(Z),t.unbindTexture()}R.depthBuffer&&re(R)}function fe(R){let v=R.textures;for(let G=0,q=v.length;G<q;G++){let $=v[G];if(g($)){let he=b(R),de=i.get($).__webglTexture;t.bindTexture(he,de),w(he),t.unbindTexture()}}}let ge=[],Be=[];function Oe(R){if(R.samples>0){if(Xe(R)===!1){let v=R.textures,G=R.width,q=R.height,$=n.COLOR_BUFFER_BIT,he=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,de=i.get(R),Z=v.length>1;if(Z)for(let xe=0;xe<v.length;xe++)t.bindFramebuffer(n.FRAMEBUFFER,de.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,de.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);let te=R.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let xe=0;xe<v.length;xe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),Z){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,de.__webglColorRenderbuffer[xe]);let Pe=i.get(v[xe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Pe,0)}n.blitFramebuffer(0,0,G,q,0,0,G,q,$,n.NEAREST),c===!0&&(ge.length=0,Be.length=0,ge.push(n.COLOR_ATTACHMENT0+xe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ge.push(he),Be.push(he),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Be)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ge))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Z)for(let xe=0;xe<v.length;xe++){t.bindFramebuffer(n.FRAMEBUFFER,de.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.RENDERBUFFER,de.__webglColorRenderbuffer[xe]);let Pe=i.get(v[xe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,de.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.TEXTURE_2D,Pe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){let v=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function We(R){return Math.min(s.maxSamples,R.samples)}function Xe(R){let v=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function N(R){let v=o.render.frame;u.get(R)!==v&&(u.set(R,v),R.update())}function dt(R,v){let G=R.colorSpace,q=R.format,$=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==Qr&&G!==_i&&(at.getTransfer(G)===ft?(q!==pn||$!==on)&&ke("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ve("WebGLTextures: Unsupported texture color space:",G)),v}function Qe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=X,this.resetTextureUnits=F,this.getTextureUnits=B,this.setTextureUnits=H,this.setTexture2D=V,this.setTexture2DArray=j,this.setTexture3D=W,this.setTextureCube=ie,this.rebindTextures=ce,this.setupRenderTarget=ne,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=re,this.setupFrameBufferTexture=Le,this.useMultisampledRTT=Xe,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function uS(n,e){function t(i,s=_i){let r,o=at.getTransfer(s);if(i===on)return n.UNSIGNED_BYTE;if(i===Sc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Ec)return n.UNSIGNED_SHORT_5_5_5_1;if(i===rh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===oh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===ih)return n.BYTE;if(i===sh)return n.SHORT;if(i===gr)return n.UNSIGNED_SHORT;if(i===Mc)return n.INT;if(i===Xn)return n.UNSIGNED_INT;if(i===qn)return n.FLOAT;if(i===ii)return n.HALF_FLOAT;if(i===ah)return n.ALPHA;if(i===ch)return n.RGB;if(i===pn)return n.RGBA;if(i===Qn)return n.DEPTH_COMPONENT;if(i===qi)return n.DEPTH_STENCIL;if(i===lh)return n.RED;if(i===wc)return n.RED_INTEGER;if(i===Yi)return n.RG;if(i===Tc)return n.RG_INTEGER;if(i===Ac)return n.RGBA_INTEGER;if(i===Ao||i===Co||i===Ro||i===Po)if(o===ft)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ao)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Co)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ao)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Co)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Cc||i===Rc||i===Pc||i===Ic)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Cc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Rc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Pc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ic)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Dc||i===Lc||i===Oc||i===Nc||i===Fc||i===Io||i===Uc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Dc||i===Lc)return o===ft?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Oc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Nc)return r.COMPRESSED_R11_EAC;if(i===Fc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Io)return r.COMPRESSED_RG11_EAC;if(i===Uc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Bc||i===kc||i===zc||i===Hc||i===Vc||i===Gc||i===Wc||i===Xc||i===qc||i===Yc||i===$c||i===jc||i===Zc||i===Kc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Bc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===kc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===zc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Hc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Vc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Wc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Xc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===qc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Yc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===$c)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===jc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Zc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Kc)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Jc||i===Qc||i===el)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Jc)return o===ft?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Qc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===el)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===tl||i===nl||i===Do||i===il)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===tl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===nl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Do)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===il)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===xr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var hS=\`
void main() {

	gl_Position = vec4( position, 1.0 );

}\`,dS=\`
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

}\`,Ih=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ao(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new en({vertexShader:hS,fragmentShader:dS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new nt(new xo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Dh=class extends Wn{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,p=null,x=typeof XRWebGLBinding<"u",m=new Ih,g={},w=t.getContextAttributes(),b=null,y=null,T=[],S=[],C=new ae,_=null,A=new Kt;A.viewport=new wt;let I=new Kt;I.viewport=new wt;let P=[A,I],k=new vc,F=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let le=T[K];return le===void 0&&(le=new or,T[K]=le),le.getTargetRaySpace()},this.getControllerGrip=function(K){let le=T[K];return le===void 0&&(le=new or,T[K]=le),le.getGripSpace()},this.getHand=function(K){let le=T[K];return le===void 0&&(le=new or,T[K]=le),le.getHandSpace()};function H(K){let le=S.indexOf(K.inputSource);if(le===-1)return;let oe=T[le];oe!==void 0&&(oe.update(K.inputSource,K.frame,l||o),oe.dispatchEvent({type:K.type,data:K.inputSource}))}function X(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",Y);for(let K=0;K<T.length;K++){let le=S[K];le!==null&&(S[K]=null,T[K].disconnect(le))}F=null,B=null,m.reset();for(let K in g)delete g[K];e.setRenderTarget(b),f=null,d=null,h=null,s=null,y=null,qe.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&ke("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,i.isPresenting===!0&&ke("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(b=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",X),s.addEventListener("inputsourceschange",Y),w.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let oe=null,Re=null,He=null;w.depth&&(He=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=w.stencil?qi:Qn,Re=w.stencil?xr:Xn);let Le={colorFormat:t.RGBA8,depthFormat:He,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Le),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Mn(d.textureWidth,d.textureHeight,{format:pn,type:on,depthTexture:new mi(d.textureWidth,d.textureHeight,Re,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let oe={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,oe),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Mn(f.framebufferWidth,f.framebufferHeight,{format:pn,type:on,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),qe.setContext(s),qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Y(K){for(let le=0;le<K.removed.length;le++){let oe=K.removed[le],Re=S.indexOf(oe);Re>=0&&(S[Re]=null,T[Re].disconnect(oe))}for(let le=0;le<K.added.length;le++){let oe=K.added[le],Re=S.indexOf(oe);if(Re===-1){for(let Le=0;Le<T.length;Le++)if(Le>=S.length){S.push(oe),Re=Le;break}else if(S[Le]===null){S[Le]=oe,Re=Le;break}if(Re===-1)break}let He=T[Re];He&&He.connect(oe)}}let V=new D,j=new D;function W(K,le,oe){V.setFromMatrixPosition(le.matrixWorld),j.setFromMatrixPosition(oe.matrixWorld);let Re=V.distanceTo(j),He=le.projectionMatrix.elements,Le=oe.projectionMatrix.elements,Je=He[14]/(He[10]-1),ze=He[14]/(He[10]+1),re=(He[9]+1)/He[5],ce=(He[9]-1)/He[5],ne=(He[8]-1)/He[0],fe=(Le[8]+1)/Le[0],ge=Je*ne,Be=Je*fe,Oe=Re/(-ne+fe),We=Oe*-ne;if(le.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(We),K.translateZ(Oe),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),He[10]===-1)K.projectionMatrix.copy(le.projectionMatrix),K.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{let Xe=Je+Oe,N=ze+Oe,dt=ge-We,Qe=Be+(Re-We),R=re*ze/N*Xe,v=ce*ze/N*Xe;K.projectionMatrix.makePerspective(dt,Qe,R,v,Xe,N),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function ie(K,le){le===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(le.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let le=K.near,oe=K.far;m.texture!==null&&(m.depthNear>0&&(le=m.depthNear),m.depthFar>0&&(oe=m.depthFar)),k.near=I.near=A.near=le,k.far=I.far=A.far=oe,(F!==k.near||B!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),F=k.near,B=k.far),k.layers.mask=K.layers.mask|6,A.layers.mask=k.layers.mask&-5,I.layers.mask=k.layers.mask&-3;let Re=K.parent,He=k.cameras;ie(k,Re);for(let Le=0;Le<He.length;Le++)ie(He[Le],Re);He.length===2?W(k,A,I):k.projectionMatrix.copy(A.projectionMatrix),J(K,k,Re)};function J(K,le,oe){oe===null?K.matrix.copy(le.matrixWorld):(K.matrix.copy(oe.matrixWorld),K.matrix.invert(),K.matrix.multiply(le.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(le.projectionMatrix),K.projectionMatrixInverse.copy(le.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=xs*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(K){c=K,d!==null&&(d.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(K){return g[K]};let Ee=null;function Ye(K,le){if(u=le.getViewerPose(l||o),p=le,u!==null){let oe=u.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let Re=!1;oe.length!==k.cameras.length&&(k.cameras.length=0,Re=!0);for(let ze=0;ze<oe.length;ze++){let re=oe[ze],ce=null;if(f!==null)ce=f.getViewport(re);else{let fe=h.getViewSubImage(d,re);ce=fe.viewport,ze===0&&(e.setRenderTargetTextures(y,fe.colorTexture,fe.depthStencilTexture),e.setRenderTarget(y))}let ne=P[ze];ne===void 0&&(ne=new Kt,ne.layers.enable(ze),ne.viewport=new wt,P[ze]=ne),ne.matrix.fromArray(re.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(re.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(ce.x,ce.y,ce.width,ce.height),ze===0&&(k.matrix.copy(ne.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Re===!0&&k.cameras.push(ne)}let He=s.enabledFeatures;if(He&&He.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let ze=h.getDepthInformation(oe[0]);ze&&ze.isValid&&ze.texture&&m.init(ze,s.renderState)}if(He&&He.includes("camera-access")&&x){e.state.unbindTexture(),h=i.getBinding();for(let ze=0;ze<oe.length;ze++){let re=oe[ze].camera;if(re){let ce=g[re];ce||(ce=new ao,g[re]=ce);let ne=h.getCameraImage(re);ce.sourceTexture=ne}}}}for(let oe=0;oe<T.length;oe++){let Re=S[oe],He=T[oe];Re!==null&&He!==void 0&&He.update(Re,le,l||o)}Ee&&Ee(K,le),le.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:le}),p=null}let qe=new Np;qe.setAnimationLoop(Ye),this.setAnimationLoop=function(K){Ee=K},this.dispose=function(){}}},fS=new St,Hp=new Ke;Hp.set(-1,0,0,0,1,0,0,0,1);function pS(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,ph(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,w,b,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),h(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,y)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?c(m,g,w,b):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===un&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===un&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let w=e.get(g),b=w.envMap,y=w.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(fS.makeRotationFromEuler(y)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Hp),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,w,b){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*w,m.scale.value=b*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,w){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===un&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let w=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function mS(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,T){let S=T.program;i.uniformBlockBinding(y,S)}function l(y,T){let S=s[y.id];S===void 0&&(m(y),S=u(y),s[y.id]=S,y.addEventListener("dispose",w));let C=T.program;i.updateUBOMapping(y,C);let _=e.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function u(y){let T=h();y.__bindingPointIndex=T;let S=n.createBuffer(),C=y.__size,_=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,C,_),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,T,S),S}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Ve("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let T=s[y.id],S=y.uniforms,C=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,T);for(let _=0,A=S.length;_<A;_++){let I=S[_];if(Array.isArray(I))for(let P=0,k=I.length;P<k;P++)f(I[P],_,P,C);else f(I,_,0,C)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(y,T,S,C){if(x(y,T,S,C)===!0){let _=y.__offset,A=y.value;if(Array.isArray(A)){let I=0;for(let P=0;P<A.length;P++){let k=A[P],F=g(k);p(k,y.__data,I),typeof k!="number"&&typeof k!="boolean"&&!k.isMatrix3&&!ArrayBuffer.isView(k)&&(I+=F.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(A,y.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,_,y.__data)}}function p(y,T,S){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,S)}function x(y,T,S,C){let _=y.value,A=T+"_"+S;if(C[A]===void 0)return typeof _=="number"||typeof _=="boolean"?C[A]=_:ArrayBuffer.isView(_)?C[A]=_.slice():C[A]=_.clone(),!0;{let I=C[A];if(typeof _=="number"||typeof _=="boolean"){if(I!==_)return C[A]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(I.equals(_)===!1)return I.copy(_),!0}}return!1}function m(y){let T=y.uniforms,S=0,C=16;for(let A=0,I=T.length;A<I;A++){let P=Array.isArray(T[A])?T[A]:[T[A]];for(let k=0,F=P.length;k<F;k++){let B=P[k],H=Array.isArray(B.value)?B.value:[B.value];for(let X=0,Y=H.length;X<Y;X++){let V=H[X],j=g(V),W=S%C,ie=W%j.boundary,J=W+ie;S+=ie,J!==0&&C-J<j.storage&&(S+=C-J),B.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=S,S+=j.storage}}}let _=S%C;return _>0&&(S+=C-_),y.__size=S,y.__cache={},this}function g(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?ke("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):ke("WebGLRenderer: Unsupported uniform value type.",y),T}function w(y){let T=y.target;T.removeEventListener("dispose",w);let S=o.indexOf(T.__bindingPointIndex);o.splice(S,1),n.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function b(){for(let y in s)n.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:c,update:l,dispose:b}}var gS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),si=null;function xS(){return si===null&&(si=new ei(gS,16,16,Yi,ii),si.name="DFG_LUT",si.minFilter=At,si.magFilter=At,si.wrapS=Jn,si.wrapT=Jn,si.generateMipmaps=!1,si.needsUpdate=!0),si}var hl=class{constructor(e={}){let{canvas:t=np(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=on}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;let x=f,m=new Set([Ac,Tc,wc]),g=new Set([on,Xn,gr,xr,Sc,Ec]),w=new Uint32Array(4),b=new Int32Array(4),y=new D,T=null,S=null,C=[],_=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=An,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,P=!1,k=null,F=null,B=null,H=null;this._outputColorSpace=Nt;let X=0,Y=0,V=null,j=-1,W=null,ie=new wt,J=new wt,Ee=null,Ye=new Ge(0),qe=0,K=t.width,le=t.height,oe=1,Re=null,He=null,Le=new wt(0,0,K,le),Je=new wt(0,0,K,le),ze=!1,re=new cr,ce=!1,ne=!1,fe=new St,ge=new D,Be=new wt,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},We=!1;function Xe(){return V===null?oe:1}let N=i;function dt(M,E){return t.getContext(M,E)}try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",\`three.js r\${"185"}\`),t.addEventListener("webglcontextlost",Et,!1),t.addEventListener("webglcontextrestored",mt,!1),t.addEventListener("webglcontextcreationerror",In,!1),N===null){let E="webgl2";if(N=dt(E,M),N===null)throw dt(E)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw Ve("WebGLRenderer: "+M.message),M}let Qe,R,v,G,q,$,he,de,Z,te,xe,Pe,ye,_e,Fe,Ne,$e,U,pe,ee,ve,Me,se;function Ie(){Qe=new Eb(N),Qe.init(),ve=new uS(N,Qe),R=new gb(N,Qe,e,ve),v=new cS(N,Qe),R.reversedDepthBuffer&&d&&v.buffers.depth.setReversed(!0),F=N.createFramebuffer(),B=N.createFramebuffer(),H=N.createFramebuffer(),G=new Ab(N),q=new $M,$=new lS(N,Qe,v,q,R,ve,G),he=new Sb(I),de=new Iv(N),Me=new pb(N,de),Z=new wb(N,de,G,Me),te=new Rb(N,Z,de,Me,G),U=new Cb(N,R,$),Fe=new xb(q),xe=new YM(I,he,Qe,R,Me,Fe),Pe=new pS(I,q),ye=new ZM,_e=new nS(Qe),$e=new fb(I,he,v,te,p,c),Ne=new aS(I,te,R),se=new mS(N,G,R,v),pe=new mb(N,Qe,G),ee=new Tb(N,Qe,G),G.programs=xe.programs,I.capabilities=R,I.extensions=Qe,I.properties=q,I.renderLists=ye,I.shadowMap=Ne,I.state=v,I.info=G}Ie(),x!==on&&(A=new Ib(x,t.width,t.height,a,s,r));let Te=new Dh(I,N);this.xr=Te,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let M=Qe.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Qe.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(M){M!==void 0&&(oe=M,this.setSize(K,le,!1))},this.getSize=function(M){return M.set(K,le)},this.setSize=function(M,E,L=!0){if(Te.isPresenting){ke("WebGLRenderer: Can't change size while VR device is presenting.");return}K=M,le=E,t.width=Math.floor(M*oe),t.height=Math.floor(E*oe),L===!0&&(t.style.width=M+"px",t.style.height=E+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,M,E)},this.getDrawingBufferSize=function(M){return M.set(K*oe,le*oe).floor()},this.setDrawingBufferSize=function(M,E,L){K=M,le=E,oe=L,t.width=Math.floor(M*L),t.height=Math.floor(E*L),this.setViewport(0,0,M,E)},this.setEffects=function(M){if(x===on){Ve("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let E=0;E<M.length;E++)if(M[E].isOutputPass===!0){ke("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(ie)},this.getViewport=function(M){return M.copy(Le)},this.setViewport=function(M,E,L,O){M.isVector4?Le.set(M.x,M.y,M.z,M.w):Le.set(M,E,L,O),v.viewport(ie.copy(Le).multiplyScalar(oe).round())},this.getScissor=function(M){return M.copy(Je)},this.setScissor=function(M,E,L,O){M.isVector4?Je.set(M.x,M.y,M.z,M.w):Je.set(M,E,L,O),v.scissor(J.copy(Je).multiplyScalar(oe).round())},this.getScissorTest=function(){return ze},this.setScissorTest=function(M){v.setScissorTest(ze=M)},this.setOpaqueSort=function(M){Re=M},this.setTransparentSort=function(M){He=M},this.getClearColor=function(M){return M.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(M=!0,E=!0,L=!0){let O=0;if(M){let z=!1;if(V!==null){let Q=V.texture.format;z=m.has(Q)}if(z){let Q=V.texture.type,ue=g.has(Q),me=$e.getClearColor(),Se=$e.getClearAlpha(),Ae=me.r,je=me.g,Ze=me.b;ue?(w[0]=Ae,w[1]=je,w[2]=Ze,w[3]=Se,N.clearBufferuiv(N.COLOR,0,w)):(b[0]=Ae,b[1]=je,b[2]=Ze,b[3]=Se,N.clearBufferiv(N.COLOR,0,b))}else O|=N.COLOR_BUFFER_BIT}E&&(O|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),L&&(O|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&N.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),k=M},this.dispose=function(){t.removeEventListener("webglcontextlost",Et,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",In,!1),$e.dispose(),ye.dispose(),_e.dispose(),q.dispose(),he.dispose(),te.dispose(),Me.dispose(),se.dispose(),xe.dispose(),Te.dispose(),Te.removeEventListener("sessionstart",jn),Te.removeEventListener("sessionend",ia),Bn.stop()};function Et(M){M.preventDefault(),hh("WebGLRenderer: Context Lost."),P=!0}function mt(){hh("WebGLRenderer: Context Restored."),P=!1;let M=G.autoReset,E=Ne.enabled,L=Ne.autoUpdate,O=Ne.needsUpdate,z=Ne.type;Ie(),G.autoReset=M,Ne.enabled=E,Ne.autoUpdate=L,Ne.needsUpdate=O,Ne.type=z}function In(M){Ve("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function xn(M){let E=M.target;E.removeEventListener("dispose",xn),ql(E)}function ql(M){Yl(M),q.remove(M)}function Yl(M){let E=q.get(M).programs;E!==void 0&&(E.forEach(function(L){xe.releaseProgram(L)}),M.isShaderMaterial&&xe.releaseShaderCache(M))}this.renderBufferDirect=function(M,E,L,O,z,Q){E===null&&(E=Oe);let ue=z.isMesh&&z.matrixWorld.determinantAffine()<0,me=ra(M,E,L,O,z);v.setMaterial(O,ue);let Se=L.index,Ae=1;if(O.wireframe===!0){if(Se=Z.getWireframeAttribute(L),Se===void 0)return;Ae=2}let je=L.drawRange,Ze=L.attributes.position,Ce=je.start*Ae,gt=(je.start+je.count)*Ae;Q!==null&&(Ce=Math.max(Ce,Q.start*Ae),gt=Math.min(gt,(Q.start+Q.count)*Ae)),Se!==null?(Ce=Math.max(Ce,0),gt=Math.min(gt,Se.count)):Ze!=null&&(Ce=Math.max(Ce,0),gt=Math.min(gt,Ze.count));let Dt=gt-Ce;if(Dt<0||Dt===1/0)return;Me.setup(z,O,me,L,Se);let Pt,vt=pe;if(Se!==null&&(Pt=de.get(Se),vt=ee,vt.setIndex(Pt)),z.isMesh)O.wireframe===!0?(v.setLineWidth(O.wireframeLinewidth*Xe()),vt.setMode(N.LINES)):vt.setMode(N.TRIANGLES);else if(z.isLine){let nn=O.linewidth;nn===void 0&&(nn=1),v.setLineWidth(nn*Xe()),z.isLineSegments?vt.setMode(N.LINES):z.isLineLoop?vt.setMode(N.LINE_LOOP):vt.setMode(N.LINE_STRIP)}else z.isPoints?vt.setMode(N.POINTS):z.isSprite&&vt.setMode(N.TRIANGLES);if(z.isBatchedMesh)if(Qe.get("WEBGL_multi_draw"))vt.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let nn=z._multiDrawStarts,we=z._multiDrawCounts,vn=z._multiDrawCount,ut=Se?de.get(Se).bytesPerElement:1,Ln=q.get(O).currentProgram.getUniforms();for(let Zn=0;Zn<vn;Zn++)Ln.setValue(N,"_gl_DrawID",Zn),vt.render(nn[Zn]/ut,we[Zn])}else if(z.isInstancedMesh)vt.renderInstances(Ce,Dt,z.count);else if(L.isInstancedBufferGeometry){let nn=L._maxInstanceCount!==void 0?L._maxInstanceCount:1/0,we=Math.min(L.instanceCount,nn);vt.renderInstances(Ce,Dt,we)}else vt.render(Ce,Dt)};function na(M,E,L){M.transparent===!0&&M.side===Ct&&M.forceSinglePass===!1?(M.side=un,M.needsUpdate=!0,ss(M,E,L),M.side=dn,M.needsUpdate=!0,ss(M,E,L),M.side=Ct):ss(M,E,L)}this.compile=function(M,E,L=null){L===null&&(L=M),S=_e.get(L),S.init(E),_.push(S),L.traverseVisible(function(z){z.isLight&&z.layers.test(E.layers)&&(S.pushLight(z),z.castShadow&&S.pushShadow(z))}),M!==L&&M.traverseVisible(function(z){z.isLight&&z.layers.test(E.layers)&&(S.pushLight(z),z.castShadow&&S.pushShadow(z))}),S.setupLights();let O=new Set;return M.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let Q=z.material;if(Q)if(Array.isArray(Q))for(let ue=0;ue<Q.length;ue++){let me=Q[ue];na(me,L,z),O.add(me)}else na(Q,L,z),O.add(Q)}),S=_.pop(),O},this.compileAsync=function(M,E,L=null){let O=this.compile(M,E,L);return new Promise(z=>{function Q(){if(O.forEach(function(ue){q.get(ue).currentProgram.isReady()&&O.delete(ue)}),O.size===0){z(M);return}setTimeout(Q,10)}Qe.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Ur=null;function Dn(M){Ur&&Ur(M)}function jn(){Bn.stop()}function ia(){Bn.start()}let Bn=new Np;Bn.setAnimationLoop(Dn),typeof self<"u"&&Bn.setContext(self),this.setAnimationLoop=function(M){Ur=M,Te.setAnimationLoop(M),M===null?Bn.stop():Bn.start()},Te.addEventListener("sessionstart",jn),Te.addEventListener("sessionend",ia),this.render=function(M,E){if(E!==void 0&&E.isCamera!==!0){Ve("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;k!==null&&k.renderStart(M,E);let L=Te.enabled===!0&&Te.isPresenting===!0,O=A!==null&&(V===null||L)&&A.begin(I,V);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),E.parent===null&&E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),Te.enabled===!0&&Te.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Te.cameraAutoUpdate===!0&&Te.updateCamera(E),E=Te.getCamera()),M.isScene===!0&&M.onBeforeRender(I,M,E,V),S=_e.get(M,_.length),S.init(E),S.state.textureUnits=$.getTextureUnits(),_.push(S),fe.multiplyMatrices(E.projectionMatrix,E.matrixWorldInverse),re.setFromProjectionMatrix(fe,Gn,E.reversedDepth),ne=this.localClippingEnabled,ce=Fe.init(this.clippingPlanes,ne),T=ye.get(M,C.length),T.init(),C.push(T),Te.enabled===!0&&Te.isPresenting===!0){let ue=I.xr.getDepthSensingMesh();ue!==null&&Os(ue,E,-1/0,I.sortObjects)}Os(M,E,0,I.sortObjects),T.finish(),I.sortObjects===!0&&T.sort(Re,He,E.reversedDepth),We=Te.enabled===!1||Te.isPresenting===!1||Te.hasDepthSensing()===!1,We&&$e.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ce===!0&&Fe.beginShadows();let z=S.state.shadowsArray;if(Ne.render(z,M,E),ce===!0&&Fe.endShadows(),(O&&A.hasRenderPass())===!1){let ue=T.opaque,me=T.transmissive;if(S.setupLights(),E.isArrayCamera){let Se=E.cameras;if(me.length>0)for(let Ae=0,je=Se.length;Ae<je;Ae++){let Ze=Se[Ae];sa(ue,me,M,Ze)}We&&$e.render(M);for(let Ae=0,je=Se.length;Ae<je;Ae++){let Ze=Se[Ae];Ns(T,M,Ze,Ze.viewport)}}else me.length>0&&sa(ue,me,M,E),We&&$e.render(M),Ns(T,M,E)}V!==null&&Y===0&&($.updateMultisampleRenderTarget(V),$.updateRenderTargetMipmap(V)),O&&A.end(I),M.isScene===!0&&M.onAfterRender(I,M,E),Me.resetDefaultState(),j=-1,W=null,_.pop(),_.length>0?(S=_[_.length-1],$.setTextureUnits(S.state.textureUnits),ce===!0&&Fe.setGlobalState(I.clippingPlanes,S.state.camera)):S=null,C.pop(),C.length>0?T=C[C.length-1]:T=null,k!==null&&k.renderEnd()};function Os(M,E,L,O){if(M.visible===!1)return;if(M.layers.test(E.layers)){if(M.isGroup)L=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(E);else if(M.isLightProbeGrid)S.pushLightProbeGrid(M);else if(M.isLight)S.pushLight(M),M.castShadow&&S.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||re.intersectsSprite(M)){O&&Be.setFromMatrixPosition(M.matrixWorld).applyMatrix4(fe);let ue=te.update(M),me=M.material;me.visible&&T.push(M,ue,me,L,Be.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||re.intersectsObject(M))){let ue=te.update(M),me=M.material;if(O&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Be.copy(M.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),Be.copy(ue.boundingSphere.center)),Be.applyMatrix4(M.matrixWorld).applyMatrix4(fe)),Array.isArray(me)){let Se=ue.groups;for(let Ae=0,je=Se.length;Ae<je;Ae++){let Ze=Se[Ae],Ce=me[Ze.materialIndex];Ce&&Ce.visible&&T.push(M,ue,Ce,L,Be.z,Ze)}}else me.visible&&T.push(M,ue,me,L,Be.z,null)}}let Q=M.children;for(let ue=0,me=Q.length;ue<me;ue++)Os(Q[ue],E,L,O)}function Ns(M,E,L,O){let{opaque:z,transmissive:Q,transparent:ue}=M;S.setupLightsView(L),ce===!0&&Fe.setGlobalState(I.clippingPlanes,L),O&&v.viewport(ie.copy(O)),z.length>0&&is(z,E,L),Q.length>0&&is(Q,E,L),ue.length>0&&is(ue,E,L),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function sa(M,E,L,O){if((L.isScene===!0?L.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[O.id]===void 0){let Ce=Qe.has("EXT_color_buffer_half_float")||Qe.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[O.id]=new Mn(1,1,{generateMipmaps:!0,type:Ce?ii:on,minFilter:ni,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:at.workingColorSpace})}let Q=S.state.transmissionRenderTarget[O.id],ue=O.viewport||ie;Q.setSize(ue.z*I.transmissionResolutionScale,ue.w*I.transmissionResolutionScale);let me=I.getRenderTarget(),Se=I.getActiveCubeFace(),Ae=I.getActiveMipmapLevel();I.setRenderTarget(Q),I.getClearColor(Ye),qe=I.getClearAlpha(),qe<1&&I.setClearColor(16777215,.5),I.clear(),We&&$e.render(L);let je=I.toneMapping;I.toneMapping=An;let Ze=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),S.setupLightsView(O),ce===!0&&Fe.setGlobalState(I.clippingPlanes,O),is(M,L,O),$.updateMultisampleRenderTarget(Q),$.updateRenderTargetMipmap(Q),Qe.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let gt=0,Dt=E.length;gt<Dt;gt++){let Pt=E[gt],{object:vt,geometry:nn,material:we,group:vn}=Pt;if(we.side===Ct&&vt.layers.test(O.layers)){let ut=we.side;we.side=un,we.needsUpdate=!0,Fs(vt,L,O,nn,we,vn),we.side=ut,we.needsUpdate=!0,Ce=!0}}Ce===!0&&($.updateMultisampleRenderTarget(Q),$.updateRenderTargetMipmap(Q))}I.setRenderTarget(me,Se,Ae),I.setClearColor(Ye,qe),Ze!==void 0&&(O.viewport=Ze),I.toneMapping=je}function is(M,E,L){let O=E.isScene===!0?E.overrideMaterial:null;for(let z=0,Q=M.length;z<Q;z++){let ue=M[z],{object:me,geometry:Se,group:Ae}=ue,je=ue.material;je.allowOverride===!0&&O!==null&&(je=O),me.layers.test(L.layers)&&Fs(me,E,L,Se,je,Ae)}}function Fs(M,E,L,O,z,Q){M.onBeforeRender(I,E,L,O,z,Q),M.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),z.onBeforeRender(I,E,L,O,M,Q),z.transparent===!0&&z.side===Ct&&z.forceSinglePass===!1?(z.side=un,z.needsUpdate=!0,I.renderBufferDirect(L,E,O,z,M,Q),z.side=dn,z.needsUpdate=!0,I.renderBufferDirect(L,E,O,z,M,Q),z.side=Ct):I.renderBufferDirect(L,E,O,z,M,Q),M.onAfterRender(I,E,L,O,z,Q)}function ss(M,E,L){E.isScene!==!0&&(E=Oe);let O=q.get(M),z=S.state.lights,Q=S.state.shadowsArray,ue=z.state.version,me=xe.getParameters(M,z.state,Q,E,L,S.state.lightProbeGridArray),Se=xe.getProgramCacheKey(me),Ae=O.programs;O.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?E.environment:null,O.fog=E.fog;let je=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;O.envMap=he.get(M.envMap||O.environment,je),O.envMapRotation=O.environment!==null&&M.envMap===null?E.environmentRotation:M.envMapRotation,Ae===void 0&&(M.addEventListener("dispose",xn),Ae=new Map,O.programs=Ae);let Ze=Ae.get(Se);if(Ze!==void 0){if(O.currentProgram===Ze&&O.lightsStateVersion===ue)return kr(M,me),Ze}else me.uniforms=xe.getUniforms(M),k!==null&&M.isNodeMaterial&&k.build(M,L,me),M.onBeforeCompile(me,I),Ze=xe.acquireProgram(me,Se),Ae.set(Se,Ze),O.uniforms=me.uniforms;let Ce=O.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Ce.clippingPlanes=Fe.uniform),kr(M,me),O.needsLights=oa(M),O.lightsStateVersion=ue,O.needsLights&&(Ce.ambientLightColor.value=z.state.ambient,Ce.lightProbe.value=z.state.probe,Ce.directionalLights.value=z.state.directional,Ce.directionalLightShadows.value=z.state.directionalShadow,Ce.spotLights.value=z.state.spot,Ce.spotLightShadows.value=z.state.spotShadow,Ce.rectAreaLights.value=z.state.rectArea,Ce.ltc_1.value=z.state.rectAreaLTC1,Ce.ltc_2.value=z.state.rectAreaLTC2,Ce.pointLights.value=z.state.point,Ce.pointLightShadows.value=z.state.pointShadow,Ce.hemisphereLights.value=z.state.hemi,Ce.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Ce.spotLightMatrix.value=z.state.spotLightMatrix,Ce.spotLightMap.value=z.state.spotLightMap,Ce.pointShadowMatrix.value=z.state.pointShadowMatrix),O.lightProbeGrid=S.state.lightProbeGridArray.length>0,O.currentProgram=Ze,O.uniformsList=null,Ze}function Br(M){if(M.uniformsList===null){let E=M.currentProgram.getUniforms();M.uniformsList=_r.seqWithValue(E.seq,M.uniforms)}return M.uniformsList}function kr(M,E){let L=q.get(M);L.outputColorSpace=E.outputColorSpace,L.batching=E.batching,L.batchingColor=E.batchingColor,L.instancing=E.instancing,L.instancingColor=E.instancingColor,L.instancingMorph=E.instancingMorph,L.skinning=E.skinning,L.morphTargets=E.morphTargets,L.morphNormals=E.morphNormals,L.morphColors=E.morphColors,L.morphTargetsCount=E.morphTargetsCount,L.numClippingPlanes=E.numClippingPlanes,L.numIntersection=E.numClipIntersection,L.vertexAlphas=E.vertexAlphas,L.vertexTangents=E.vertexTangents,L.toneMapping=E.toneMapping}function Us(M,E){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(E.matrixWorld);for(let L=0,O=M.length;L<O;L++){let z=M[L];if(z.texture!==null&&z.boundingBox.containsPoint(y))return z}return null}function ra(M,E,L,O,z){E.isScene!==!0&&(E=Oe),$.resetTextureUnits();let Q=E.fog,ue=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?E.environment:null,me=V===null?I.outputColorSpace:V.isXRRenderTarget===!0?V.texture.colorSpace:at.workingColorSpace,Se=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,Ae=he.get(O.envMap||ue,Se),je=O.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,Ze=!!L.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),Ce=!!L.morphAttributes.position,gt=!!L.morphAttributes.normal,Dt=!!L.morphAttributes.color,Pt=An;O.toneMapped&&(V===null||V.isXRRenderTarget===!0)&&(Pt=I.toneMapping);let vt=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,nn=vt!==void 0?vt.length:0,we=q.get(O),vn=S.state.lights;if(ce===!0&&(ne===!0||M!==W)){let yt=M===W&&O.id===j;Fe.setState(O,M,yt)}let ut=!1;O.version===we.__version?(we.needsLights&&we.lightsStateVersion!==vn.state.version||we.outputColorSpace!==me||z.isBatchedMesh&&we.batching===!1||!z.isBatchedMesh&&we.batching===!0||z.isBatchedMesh&&we.batchingColor===!0&&z.colorTexture===null||z.isBatchedMesh&&we.batchingColor===!1&&z.colorTexture!==null||z.isInstancedMesh&&we.instancing===!1||!z.isInstancedMesh&&we.instancing===!0||z.isSkinnedMesh&&we.skinning===!1||!z.isSkinnedMesh&&we.skinning===!0||z.isInstancedMesh&&we.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&we.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&we.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&we.instancingMorph===!1&&z.morphTexture!==null||we.envMap!==Ae||O.fog===!0&&we.fog!==Q||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Fe.numPlanes||we.numIntersection!==Fe.numIntersection)||we.vertexAlphas!==je||we.vertexTangents!==Ze||we.morphTargets!==Ce||we.morphNormals!==gt||we.morphColors!==Dt||we.toneMapping!==Pt||we.morphTargetsCount!==nn||!!we.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ut=!0):(ut=!0,we.__version=O.version);let Ln=we.currentProgram;ut===!0&&(Ln=ss(O,E,z),k&&O.isNodeMaterial&&k.onUpdateProgram(O,Ln,we));let Zn=!1,wi=!1,Bs=!1,_t=Ln.getUniforms(),Lt=we.uniforms;if(v.useProgram(Ln.program)&&(Zn=!0,wi=!0,Bs=!0),O.id!==j&&(j=O.id,wi=!0),we.needsLights){let yt=Us(S.state.lightProbeGridArray,z);we.lightProbeGrid!==yt&&(we.lightProbeGrid=yt,wi=!0)}if(Zn||W!==M){v.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),_t.setValue(N,"projectionMatrix",M.projectionMatrix),_t.setValue(N,"viewMatrix",M.matrixWorldInverse);let Ai=_t.map.cameraPosition;Ai!==void 0&&Ai.setValue(N,ge.setFromMatrixPosition(M.matrixWorld)),R.logarithmicDepthBuffer&&_t.setValue(N,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&_t.setValue(N,"isOrthographic",M.isOrthographicCamera===!0),W!==M&&(W=M,wi=!0,Bs=!0)}if(we.needsLights&&(vn.state.directionalShadowMap.length>0&&_t.setValue(N,"directionalShadowMap",vn.state.directionalShadowMap,$),vn.state.spotShadowMap.length>0&&_t.setValue(N,"spotShadowMap",vn.state.spotShadowMap,$),vn.state.pointShadowMap.length>0&&_t.setValue(N,"pointShadowMap",vn.state.pointShadowMap,$)),z.isSkinnedMesh){_t.setOptional(N,z,"bindMatrix"),_t.setOptional(N,z,"bindMatrixInverse");let yt=z.skeleton;yt&&(yt.boneTexture===null&&yt.computeBoneTexture(),_t.setValue(N,"boneTexture",yt.boneTexture,$))}z.isBatchedMesh&&(_t.setOptional(N,z,"batchingTexture"),_t.setValue(N,"batchingTexture",z._matricesTexture,$),_t.setOptional(N,z,"batchingIdTexture"),_t.setValue(N,"batchingIdTexture",z._indirectTexture,$),_t.setOptional(N,z,"batchingColorTexture"),z._colorsTexture!==null&&_t.setValue(N,"batchingColorTexture",z._colorsTexture,$));let Ti=L.morphAttributes;if((Ti.position!==void 0||Ti.normal!==void 0||Ti.color!==void 0)&&U.update(z,L,Ln),(wi||we.receiveShadow!==z.receiveShadow)&&(we.receiveShadow=z.receiveShadow,_t.setValue(N,"receiveShadow",z.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&E.environment!==null&&(Lt.envMapIntensity.value=E.environmentIntensity),Lt.dfgLUT!==void 0&&(Lt.dfgLUT.value=xS()),wi){if(_t.setValue(N,"toneMappingExposure",I.toneMappingExposure),we.needsLights&&$l(Lt,Bs),Q&&O.fog===!0&&Pe.refreshFogUniforms(Lt,Q),Pe.refreshMaterialUniforms(Lt,O,oe,le,S.state.transmissionRenderTarget[M.id]),we.needsLights&&we.lightProbeGrid){let yt=we.lightProbeGrid;Lt.probesSH.value=yt.texture,Lt.probesMin.value.copy(yt.boundingBox.min),Lt.probesMax.value.copy(yt.boundingBox.max),Lt.probesResolution.value.copy(yt.resolution)}_r.upload(N,Br(we),Lt,$)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(_r.upload(N,Br(we),Lt,$),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&_t.setValue(N,"center",z.center),_t.setValue(N,"modelViewMatrix",z.modelViewMatrix),_t.setValue(N,"normalMatrix",z.normalMatrix),_t.setValue(N,"modelMatrix",z.matrixWorld),O.uniformsGroups!==void 0){let yt=O.uniformsGroups;for(let Ai=0,ks=yt.length;Ai<ks;Ai++){let Cd=yt[Ai];se.update(Cd,Ln),se.bind(Cd,Ln)}}return Ln}function $l(M,E){M.ambientLightColor.needsUpdate=E,M.lightProbe.needsUpdate=E,M.directionalLights.needsUpdate=E,M.directionalLightShadows.needsUpdate=E,M.pointLights.needsUpdate=E,M.pointLightShadows.needsUpdate=E,M.spotLights.needsUpdate=E,M.spotLightShadows.needsUpdate=E,M.rectAreaLights.needsUpdate=E,M.hemisphereLights.needsUpdate=E}function oa(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return V},this.setRenderTargetTextures=function(M,E,L){let O=q.get(M);O.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),q.get(M.texture).__webglTexture=E,q.get(M.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:L,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,E){let L=q.get(M);L.__webglFramebuffer=E,L.__useDefaultFramebuffer=E===void 0},this.setRenderTarget=function(M,E=0,L=0){V=M,X=E,Y=L;let O=null,z=!1,Q=!1;if(M){let me=q.get(M);if(me.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(N.FRAMEBUFFER,me.__webglFramebuffer),ie.copy(M.viewport),J.copy(M.scissor),Ee=M.scissorTest,v.viewport(ie),v.scissor(J),v.setScissorTest(Ee),j=-1;return}else if(me.__webglFramebuffer===void 0)$.setupRenderTarget(M);else if(me.__hasExternalTextures)$.rebindTextures(M,q.get(M.texture).__webglTexture,q.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let je=M.depthTexture;if(me.__boundDepthTexture!==je){if(je!==null&&q.has(je)&&(M.width!==je.image.width||M.height!==je.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(M)}}let Se=M.texture;(Se.isData3DTexture||Se.isDataArrayTexture||Se.isCompressedArrayTexture)&&(Q=!0);let Ae=q.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ae[E])?O=Ae[E][L]:O=Ae[E],z=!0):M.samples>0&&$.useMultisampledRTT(M)===!1?O=q.get(M).__webglMultisampledFramebuffer:Array.isArray(Ae)?O=Ae[L]:O=Ae,ie.copy(M.viewport),J.copy(M.scissor),Ee=M.scissorTest}else ie.copy(Le).multiplyScalar(oe).floor(),J.copy(Je).multiplyScalar(oe).floor(),Ee=ze;if(L!==0&&(O=F),v.bindFramebuffer(N.FRAMEBUFFER,O)&&v.drawBuffers(M,O),v.viewport(ie),v.scissor(J),v.setScissorTest(Ee),z){let me=q.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+E,me.__webglTexture,L)}else if(Q){let me=E;for(let Se=0;Se<M.textures.length;Se++){let Ae=q.get(M.textures[Se]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+Se,Ae.__webglTexture,L,me)}}else if(M!==null&&L!==0){let me=q.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,me.__webglTexture,L)}j=-1},this.readRenderTargetPixels=function(M,E,L,O,z,Q,ue,me=0){if(!(M&&M.isWebGLRenderTarget)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=q.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ue!==void 0&&(Se=Se[ue]),Se){v.bindFramebuffer(N.FRAMEBUFFER,Se);try{let Ae=M.textures[me],je=Ae.format,Ze=Ae.type;if(M.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+me),!R.textureFormatReadable(je)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!R.textureTypeReadable(Ze)){Ve("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}E>=0&&E<=M.width-O&&L>=0&&L<=M.height-z&&N.readPixels(E,L,O,z,ve.convert(je),ve.convert(Ze),Q)}finally{let Ae=V!==null?q.get(V).__webglFramebuffer:null;v.bindFramebuffer(N.FRAMEBUFFER,Ae)}}},this.readRenderTargetPixelsAsync=async function(M,E,L,O,z,Q,ue,me=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=q.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ue!==void 0&&(Se=Se[ue]),Se)if(E>=0&&E<=M.width-O&&L>=0&&L<=M.height-z){v.bindFramebuffer(N.FRAMEBUFFER,Se);let Ae=M.textures[me],je=Ae.format,Ze=Ae.type;if(M.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+me),!R.textureFormatReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!R.textureTypeReadable(Ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ce=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Ce),N.bufferData(N.PIXEL_PACK_BUFFER,Q.byteLength,N.STREAM_READ),N.readPixels(E,L,O,z,ve.convert(je),ve.convert(Ze),0);let gt=V!==null?q.get(V).__webglFramebuffer:null;v.bindFramebuffer(N.FRAMEBUFFER,gt);let Dt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await sp(N,Dt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Ce),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,Q),N.deleteBuffer(Ce),N.deleteSync(Dt),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,E=null,L=0){let O=Math.pow(2,-L),z=Math.floor(M.image.width*O),Q=Math.floor(M.image.height*O),ue=E!==null?E.x:0,me=E!==null?E.y:0;$.setTexture2D(M,0),N.copyTexSubImage2D(N.TEXTURE_2D,L,0,0,ue,me,z,Q),v.unbindTexture()},this.copyTextureToTexture=function(M,E,L=null,O=null,z=0,Q=0){let ue,me,Se,Ae,je,Ze,Ce,gt,Dt,Pt=M.isCompressedTexture?M.mipmaps[Q]:M.image;if(L!==null)ue=L.max.x-L.min.x,me=L.max.y-L.min.y,Se=L.isBox3?L.max.z-L.min.z:1,Ae=L.min.x,je=L.min.y,Ze=L.isBox3?L.min.z:0;else{let Lt=Math.pow(2,-z);ue=Math.floor(Pt.width*Lt),me=Math.floor(Pt.height*Lt),M.isDataArrayTexture?Se=Pt.depth:M.isData3DTexture?Se=Math.floor(Pt.depth*Lt):Se=1,Ae=0,je=0,Ze=0}O!==null?(Ce=O.x,gt=O.y,Dt=O.z):(Ce=0,gt=0,Dt=0);let vt=ve.convert(E.format),nn=ve.convert(E.type),we;E.isData3DTexture?($.setTexture3D(E,0),we=N.TEXTURE_3D):E.isDataArrayTexture||E.isCompressedArrayTexture?($.setTexture2DArray(E,0),we=N.TEXTURE_2D_ARRAY):($.setTexture2D(E,0),we=N.TEXTURE_2D),v.activeTexture(N.TEXTURE0),v.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,E.flipY),v.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),v.pixelStorei(N.UNPACK_ALIGNMENT,E.unpackAlignment);let vn=v.getParameter(N.UNPACK_ROW_LENGTH),ut=v.getParameter(N.UNPACK_IMAGE_HEIGHT),Ln=v.getParameter(N.UNPACK_SKIP_PIXELS),Zn=v.getParameter(N.UNPACK_SKIP_ROWS),wi=v.getParameter(N.UNPACK_SKIP_IMAGES);v.pixelStorei(N.UNPACK_ROW_LENGTH,Pt.width),v.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Pt.height),v.pixelStorei(N.UNPACK_SKIP_PIXELS,Ae),v.pixelStorei(N.UNPACK_SKIP_ROWS,je),v.pixelStorei(N.UNPACK_SKIP_IMAGES,Ze);let Bs=M.isDataArrayTexture||M.isData3DTexture,_t=E.isDataArrayTexture||E.isData3DTexture;if(M.isDepthTexture){let Lt=q.get(M),Ti=q.get(E),yt=q.get(Lt.__renderTarget),Ai=q.get(Ti.__renderTarget);v.bindFramebuffer(N.READ_FRAMEBUFFER,yt.__webglFramebuffer),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,Ai.__webglFramebuffer);for(let ks=0;ks<Se;ks++)Bs&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,q.get(M).__webglTexture,z,Ze+ks),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,q.get(E).__webglTexture,Q,Dt+ks)),N.blitFramebuffer(Ae,je,ue,me,Ce,gt,ue,me,N.DEPTH_BUFFER_BIT,N.NEAREST);v.bindFramebuffer(N.READ_FRAMEBUFFER,null),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(z!==0||M.isRenderTargetTexture||q.has(M)){let Lt=q.get(M),Ti=q.get(E);v.bindFramebuffer(N.READ_FRAMEBUFFER,B),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,H);for(let yt=0;yt<Se;yt++)Bs?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Lt.__webglTexture,z,Ze+yt):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Lt.__webglTexture,z),_t?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ti.__webglTexture,Q,Dt+yt):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ti.__webglTexture,Q),z!==0?N.blitFramebuffer(Ae,je,ue,me,Ce,gt,ue,me,N.COLOR_BUFFER_BIT,N.NEAREST):_t?N.copyTexSubImage3D(we,Q,Ce,gt,Dt+yt,Ae,je,ue,me):N.copyTexSubImage2D(we,Q,Ce,gt,Ae,je,ue,me);v.bindFramebuffer(N.READ_FRAMEBUFFER,null),v.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else _t?M.isDataTexture||M.isData3DTexture?N.texSubImage3D(we,Q,Ce,gt,Dt,ue,me,Se,vt,nn,Pt.data):E.isCompressedArrayTexture?N.compressedTexSubImage3D(we,Q,Ce,gt,Dt,ue,me,Se,vt,Pt.data):N.texSubImage3D(we,Q,Ce,gt,Dt,ue,me,Se,vt,nn,Pt):M.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,Q,Ce,gt,ue,me,vt,nn,Pt.data):M.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,Q,Ce,gt,Pt.width,Pt.height,vt,Pt.data):N.texSubImage2D(N.TEXTURE_2D,Q,Ce,gt,ue,me,vt,nn,Pt);v.pixelStorei(N.UNPACK_ROW_LENGTH,vn),v.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ut),v.pixelStorei(N.UNPACK_SKIP_PIXELS,Ln),v.pixelStorei(N.UNPACK_SKIP_ROWS,Zn),v.pixelStorei(N.UNPACK_SKIP_IMAGES,wi),Q===0&&E.generateMipmaps&&N.generateMipmap(we),v.unbindTexture()},this.initRenderTarget=function(M){q.get(M).__webglFramebuffer===void 0&&$.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?$.setTextureCube(M,0):M.isData3DTexture?$.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?$.setTexture2DArray(M,0):$.setTexture2D(M,0),v.unbindTexture()},this.resetState=function(){X=0,Y=0,V=null,v.reset(),Me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Gn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=at._getDrawingBufferColorSpace(e),t.unpackColorSpace=at._getUnpackColorSpace()}};var Vp={type:"change"},Oh={type:"start"},Wp={type:"end"},pl=new vs,Gp=new Nn,vS=Math.cos(70*it.DEG2RAD),Xt=new D,mn=2*Math.PI,xt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Lh=1e-6,ml=class extends Eo{constructor(e,t=null){super(e,t),this.state=xt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Vi.ROTATE,MIDDLE:Vi.DOLLY,RIGHT:Vi.PAN},this.touches={ONE:Gi.ROTATE,TWO:Gi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new bn,this._lastTargetPosition=new D,this._quat=new bn().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new fr,this._sphericalDelta=new fr,this._scale=1,this._panOffset=new D,this._rotateStart=new ae,this._rotateEnd=new ae,this._rotateDelta=new ae,this._panStart=new ae,this._panEnd=new ae,this._panDelta=new ae,this._dollyStart=new ae,this._dollyEnd=new ae,this._dollyDelta=new ae,this._dollyDirection=new D,this._mouse=new ae,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=yS.bind(this),this._onPointerDown=_S.bind(this),this._onPointerUp=bS.bind(this),this._onContextMenu=CS.bind(this),this._onMouseWheel=ES.bind(this),this._onKeyDown=wS.bind(this),this._onTouchStart=TS.bind(this),this._onTouchMove=AS.bind(this),this._onMouseDown=MS.bind(this),this._onMouseMove=SS.bind(this),this._interceptControlDown=RS.bind(this),this._interceptControlUp=PS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Vp),this.update(),this.state=xt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Xt.copy(t).sub(this.target),Xt.applyQuaternion(this._quat),this._spherical.setFromVector3(Xt),this.autoRotate&&this.state===xt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=mn:i>Math.PI&&(i-=mn),s<-Math.PI?s+=mn:s>Math.PI&&(s-=mn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Xt.setFromSpherical(this._spherical),Xt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Xt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Xt.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Xt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(pl.origin.copy(this.object.position),pl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(pl.direction))<vS?this.object.lookAt(this.target):(Gp.setFromNormalAndCoplanarPoint(this.object.up,this.target),pl.intersectPlane(Gp,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Lh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Lh||this._lastTargetPosition.distanceToSquared(this.target)>Lh?(this.dispatchEvent(Vp),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?mn/60*this.autoRotateSpeed*e:mn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Xt.setFromMatrixColumn(t,0),Xt.multiplyScalar(-e),this._panOffset.add(Xt)}_panUp(e,t){this.screenSpacePanning===!0?Xt.setFromMatrixColumn(t,1):(Xt.setFromMatrixColumn(t,0),Xt.crossVectors(this.object.up,Xt)),Xt.multiplyScalar(e),this._panOffset.add(Xt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Xt.copy(s).sub(this.target);let r=Xt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(mn*this._rotateDelta.x/t.clientHeight),this._rotateUp(mn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-mn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(mn*this._rotateDelta.x/t.clientHeight),this._rotateUp(mn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ae,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function _S(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function yS(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function bS(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Wp),this.state=xt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function MS(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Vi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=xt.DOLLY;break;case Vi.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=xt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=xt.ROTATE}break;case Vi.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=xt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=xt.PAN}break;default:this.state=xt.NONE}this.state!==xt.NONE&&this.dispatchEvent(Oh)}function SS(n){switch(this.state){case xt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case xt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case xt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function ES(n){this.enabled===!1||this.enableZoom===!1||this.state!==xt.NONE||(n.preventDefault(),this.dispatchEvent(Oh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Wp))}function wS(n){this.enabled!==!1&&this._handleKeyDown(n)}function TS(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Gi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=xt.TOUCH_ROTATE;break;case Gi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=xt.TOUCH_PAN;break;default:this.state=xt.NONE}break;case 2:switch(this.touches.TWO){case Gi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=xt.TOUCH_DOLLY_PAN;break;case Gi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=xt.TOUCH_DOLLY_ROTATE;break;default:this.state=xt.NONE}break;default:this.state=xt.NONE}this.state!==xt.NONE&&this.dispatchEvent(Oh)}function AS(n){switch(this._trackPointer(n),this.state){case xt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case xt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case xt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case xt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=xt.NONE}}function CS(n){this.enabled!==!1&&n.preventDefault()}function RS(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function PS(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Ym=kn(Zl());var Rt=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),mattress:Object.freeze({materialKey:"fabric",baseColor:"#E4E0D8",roughness:.94,metallic:0,opacity:1}),countertop:Object.freeze({materialKey:"custom",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1})});function pt(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Xp({width:n,height:e,depth:t}){let i=e*.38,s=t*.2,r=n*.1,o=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),a=Math.max(e*.16,.035),c=Math.max(Math.min(n*.012,.018),.006),l=[pt("seat","cushions",[n,i,t],[0,-e/2+i/2,0]),pt("back","body",[n,e*.62,s],[0,e*.19,-t/2+s/2]),pt("left-arm","body",[r,e*.46,t],[-n/2+r/2,-e*.08,0]),pt("right-arm","body",[r,e*.46,t],[n/2-r/2,-e*.08,0])];for(let u of[-n*.4,n*.4])for(let h of[-t*.32,t*.32])l.push(pt("leg","legs",[o,a,o],[u,-e/2+a/2,h]));return l.push(pt("cushion-seam","cushions",[c,Math.max(i*.035,.006),t*.78],[0,-e/2+i+.003,t*.02])),{parts:l,materialDefaults:{body:Rt.fabric,cushions:Rt.fabric,legs:Rt.metal}}}function qp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.08,.024),r=[pt("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),pt("back","back",[n*.9,e*.46,Math.max(t*.14,.035)],[0,e*.26,-t*.36],"seat")];for(let o of[-n*.36,n*.36])for(let a of[-t*.3,t*.3])r.push(pt("leg","frame",[s,e*.44,s],[o,-e*.28,a]));return{parts:r,yawOffsetDegrees:180,materialDefaults:{seat:Rt.fabric,back:Rt.fabric,frame:Rt.wood}}}function Nh({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.max(Math.min(Math.min(n,t)*.09,.075),.025),r=Math.max(e-i,.02),o=[pt("top","top",[n,i,t],[0,e/2-i/2,0]),pt("top-surface","top",[n*.965,.012,t*.965],[0,e/2-.006,0])];for(let a of[-n*.4,n*.4])for(let c of[-t*.4,t*.4])o.push(pt("leg","legs",[s,r,s],[a,-i/2,c]));return{parts:o,materialDefaults:{top:Rt.wood,legs:Rt.metal}}}function Fh({width:n,height:e,depth:t}){let i=e*.4,s=e*.38,r=Math.max(e*.1,.045);return{parts:[pt("frame","frame",[n,i,t],[0,-e/2+i/2,0]),pt("mattress","mattress",[n*.93,s,t*.9],[0,-e/2+i+s/2,t*.025]),pt("headboard","headboard",[n*.98,e*.72,Math.max(t*.065,.055)],[0,-e/2+e*.64,-t/2+Math.max(t*.0325,.0275)],"frame"),pt("left-pillow","mattress",[n*.38,r,t*.2],[-n*.23,e*.27,-t*.29]),pt("right-pillow","mattress",[n*.38,r,t*.2],[n*.23,e*.27,-t*.29])],yawOffsetDegrees:180,materialDefaults:{frame:Rt.wood,mattress:Rt.mattress,headboard:Rt.wood}}}function Yp({width:n,height:e,depth:t}){let i=Math.max(e*.06,.025),s=Math.max(t*.05,.016),r=Math.max(e-i,.02),o=r*.92,a=n*.94/3,c=Math.max(s*.7,.012),l=[pt("body","body",[n,r,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let u=0;u<3;u+=1){let h=-n*.47+a*(u+.5);l.push(pt("front","front",[a*.96,o,s],[h,-i/2,t/2-s/2]));let d=h+a*(u<1?.3:-.3);l.push(pt("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),c],[d,0,t/2-c/2]))}return l.push(pt("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:l,materialDefaults:{body:Rt.cabinet,front:Rt.cabinetFront,top:Rt.wood,handles:Rt.metal}}}function $p({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.045,.016),r=Math.max(s*.7,.012),o=[pt("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let a of[-n*.245,n*.245])o.push(pt("front","front",[n*.47,Math.max(e-i,.02)*.94,s],[a,-i/2,t/2-s/2])),o.push(pt("handle","handles",[n*.25,Math.max(e*.016,.01),r],[a,e*.3,t/2-r/2]));return o.push(pt("worktop","top",[n,i,t],[0,e*.46,0])),{parts:o,materialDefaults:{body:Rt.cabinet,front:Rt.cabinetFront,top:Rt.countertop,handles:Rt.metal}}}function jp({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.05,.016),r=n*.305,o=Math.max(s*.7,.012),a=Math.max(e*.12,.018),c=[pt("body","body",[n,e*.76-i,Math.max(t-s,.02)],[0,e*.08-i/2,-s/2])];for(let l of[-1,0,1]){let u=l*n*.323;c.push(pt("front","front",[r,e*.58,s],[u,e*.04,t/2-s/2])),c.push(pt("handle","handles",[r*.28,Math.max(e*.018,.009),o],[u,e*.25,t/2-o/2]))}return c.push(pt("top","top",[n,i,t],[0,e*.46-i/2,0])),c.push(pt("foot","body",[n*.82,a,t*.72],[0,-e*.44,0])),{parts:c,materialDefaults:{body:Rt.cabinet,front:Rt.cabinetFront,top:Rt.wood,handles:Rt.metal}}}var ot=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"paint",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),counter:Object.freeze({materialKey:"stone",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1})});function Ue(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Fo(n,e,t,i,s,r=void 0,o=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:o,radius:t,height:i,position:s,rotation:r}}var Uh=Object.freeze({seat:ot.fabric,back:ot.fabric,frame:ot.wood,arms:ot.fabric});function Zp({width:n,height:e,depth:t}){let i=e*.4,s=t*.84,r=t*.24,o=n*.17,a=Math.max(Math.min(n,t)*.07,.018),c=Math.max(e*.16,.035),l=[Ue("seat","seat",[n,i,s],[0,-e/2+i/2,t*.08]),Ue("back","back",[n,e*.64,r],[0,e*.18,-t/2+r/2]),Ue("left-arm","arms",[o,e*.5,t*.88],[-n/2+o/2,-e*.06,t*.06],"seat"),Ue("right-arm","arms",[o,e*.5,t*.88],[n/2-o/2,-e*.06,t*.06],"seat")];for(let u of[-n*.33,n*.33])for(let h of[-t*.3,t*.3])l.push(Ue("leg","frame",[a,c,a],[u,-e/2+c/2,h]));return{parts:l,yawOffsetDegrees:180,materialDefaults:Uh}}function Kp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.075,.026),r=e*.45,o=[Ue("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02])];for(let a of[-n*.36,n*.36]){for(let c of[-t*.3,t*.3])o.push(Ue("leg","frame",[s,r,s],[a,-e/2+r/2,c]));o.push(Ue("back-post","frame",[s,e*.51,s],[a,e*.23,-t*.34]))}for(let a of[e*.18,e*.34])o.push(Ue("back-slat","back",[n*.76,e*.085,Math.max(t*.07,.028)],[0,a,-t*.34],"frame"));return{parts:o,yawOffsetDegrees:180,materialDefaults:Uh}}function Jp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.045,.02),r=[Ue("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),Ue("back","back",[n*.88,e*.42,Math.max(t*.13,.035)],[0,e*.27,-t*.31],"seat")];for(let o of[-n*.37,n*.37])r.push(Ue("base-rail","frame",[s,s,t*.84],[o,-e/2+s/2,0])),r.push(Ue("front-post","frame",[s,e*.48,s],[o,-e*.26,t*.34])),r.push(Ue("back-post","frame",[s,e*.58,s],[o,e*.14,-t*.31]));return{parts:r,yawOffsetDegrees:180,materialDefaults:Uh}}function Qp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.min(n,t)/2;return{parts:[Fo("top","top",s,i,[0,e/2-i/2,0]),Fo("top-surface","top",s*.965,.012,[0,e/2-.006,0]),Fo("pedestal","legs",s*.13,Math.max(e-i-.055,.02),[0,-i/2+.028,0]),Fo("foot","legs",s*.34,.055,[0,-e/2+.0275,0])],materialDefaults:{top:ot.wood,legs:ot.metal}}}function em({width:n,height:e,depth:t}){let i=Math.max(Math.min(n*.055,.055),.028),s=Math.max(Math.min(e*.025,.04),.025),r=[Ue("left-side","body",[i,e,t],[-n/2+i/2,0,0]),Ue("right-side","body",[i,e,t],[n/2-i/2,0,0]),Ue("bottom","body",[n,s,t],[0,-e/2+s/2,0])];for(let o=1;o<=5;o+=1){let a=-e/2+e*o/5;r.push(Ue(o===5?"top":"shelf",o===5?"top":"body",[n,s,t],[0,Math.min(a,e/2-s/2),0]))}return r.push(Ue("back","body",[n-i*2,e*.96,Math.max(t*.045,.016)],[0,0,-t/2+Math.max(t*.0225,.008)])),{parts:r,materialDefaults:{body:ot.cabinet,top:ot.wood}}}function gl({width:n,height:e,depth:t},i="cabinet"){let s=Math.max(e*.06,.025),r=Math.max(t*.05,.016),o=Math.max(e-s,.02),a=o*.92,c=-s/2,l=[Ue("body","body",[n,o,Math.max(t-r,.02)],[0,-s/2,-r/2])];if(i==="nightstand")for(let u=0;u<2;u+=1){let h=c+(u===0?a*.25:-a*.25),d=Math.max(r*.7,.012);l.push(Ue("front","front",[n*.94,a*.46,r],[0,h,t/2-r/2])),l.push(Ue("handle","handles",[n*.22,Math.max(e*.018,.008),d],[0,h+a*.12,t/2-d/2]))}else{let u=i==="wardrobe"?3:2,h=n*.94/u;for(let d=0;d<u;d+=1){let f=-n*.47+h*(d+.5),p=f+h*(d<u/2?.3:-.3),x=Math.max(r*.7,.012);l.push(Ue("front","front",[h*.96,a,r],[f,c,t/2-r/2])),l.push(Ue("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),x],[p,0,t/2-x/2]))}}return l.push(Ue("top","top",[n,s,t],[0,e/2-s/2,0])),{parts:l,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.wood,handles:ot.metal}}}function tm({width:n,height:e,depth:t}){let i=Math.max(e*.025,.03),s=Math.max(t*.045,.016),r=[Ue("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let[o,a]of[[e*.25,e*.45],[-e*.25,e*.45]]){let c=Math.max(s*.7,.012);r.push(Ue("front","front",[n*.95,a,s],[0,o,t/2-s/2])),r.push(Ue("handle","handles",[Math.max(n*.025,.012),a*.44,c],[n*.38,o,t/2-c/2]))}return r.push(Ue("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:r,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal}}}function nm({width:n,height:e,depth:t}){let i=Math.max(t*.055,.018),s=Math.max(e*.025,.028),r=e*.34,o=Math.max(e*.007,.008),a=Math.max(t*.06,.016);return{parts:[Ue("body","body",[n,e-s,Math.max(t-i,.02)],[0,-s/2,-i/2]),Ue("door","front",[n*.97,e-r-o*1.5,i],[0,r/2+o*.25,t/2-i/2]),Ue("freezer-door","front",[n*.97,r-o*1.5,i],[0,-e/2+r/2,t/2-i/2]),Ue("handle","handles",[Math.max(n*.018,.009),e*.3,a],[n*.38,e*.25,t/2-a/2]),Ue("freezer-handle","handles",[Math.max(n*.018,.009),e*.19,a],[n*.38,-e*.25,t/2-a/2]),Ue("top","top",[n,s,t],[0,e/2-s/2,0])],materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.metal,handles:ot.metal}}}function im({width:n,height:e,depth:t}){let i=Math.max(e*.075,.03),s=t*.13,r=t-s,o=Math.max(t*.035,.016),a=[Ue("body","body",[n*.94,e-i,r],[0,-i/2,-s/2])];for(let c=-1;c<=1;c+=1){let l=c*n*.31;a.push(Ue("front","front",[n*.29,e*.8,o],[l,-i/2,t/2-s-o/2])),a.push(Ue("handle","handles",[n*.16,Math.max(e*.014,.009),Math.max(o*.75,.012)],[l,e*.31,t/2-s+.003]))}return a.push(Ue("worktop","top",[n,i,t],[0,e/2-i/2,0])),{parts:a,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal}}}function sm({width:n,height:e,depth:t}){let i=Math.min(e*.22,.24),s=e-i,r=Math.max(s*.075,.03),o=Math.max(t*.045,.016),a=-e/2+s/2,c=-e/2+s-r/2,l=n*.48,u=t*.52,h=Math.max(Math.min(l,u)*.075,.025),d=c+r/2-Math.max(r*.08,.005),f=[Ue("body","body",[n,s-r,Math.max(t-o,.02)],[0,a-r/2,-o/2])];for(let m of[-n*.245,n*.245]){let g=Math.max(o*.75,.012);f.push(Ue("front","front",[n*.47,s*.78,o],[m,a-r*.3,t/2-o/2])),f.push(Ue("handle","handles",[n*.22,Math.max(s*.014,.009),g],[m,c-s*.12,t/2-g/2]))}f.push(Ue("worktop","top",[n,r,t],[0,c,0])),f.push(Ue("basin-back","basin",[l,Math.max(r*.16,.01),h],[-n*.12,d,-u/2])),f.push(Ue("basin-front","basin",[l,Math.max(r*.16,.01),h],[-n*.12,d,u/2])),f.push(Ue("basin-left","basin",[h,Math.max(r*.16,.01),u],[-n*.12-l/2+h/2,d,0])),f.push(Ue("basin-right","basin",[h,Math.max(r*.16,.01),u],[-n*.12+l/2-h/2,d,0]));let p=i*.72,x=c+r/2;return f.push(Fo("faucet","fittings",Math.max(n*.018,.012),p,[n*.28,x+p/2,t*.12])),f.push(Ue("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.2,Math.min(x+p,e/2-.01),t*.05])),{parts:f,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal,basin:ot.metal,fittings:ot.metal}}}function rm({width:n,height:e,depth:t}){let i=Math.max(Math.min(t*.34,.055),.018);return{parts:[Ue("frame","frame",[n,e*.88,i],[0,e*.06,0]),Ue("display","display",[n*.92,e*.76,Math.max(i*.12,.008)],[0,e*.06,i*.52]),Ue("stand","stand",[n*.34,Math.max(e*.045,.018),t],[0,-e*.46,0])],materialDefaults:{frame:ot.metal,display:ot.screen,stand:ot.metal}}}function om({width:n,height:e,depth:t}){let i=Math.min(Math.max(Math.min(n,t)*.045,.025),.09),s=Math.max(e*.72,.018),r=Math.max(e*.55,.014),o=-e/2+r/2;return{parts:[Ue("pile","pile",[Math.max(n-i*2,.08),s,Math.max(t-i*2,.08)],[0,e/2-s/2+.002,0]),Ue("border-back","border",[n,r,i],[0,o,-t/2+i/2]),Ue("border-front","border",[n,r,i],[0,o,t/2-i/2]),Ue("border-left","border",[i,r,Math.max(t-i*2,.08)],[-n/2+i/2,o,0]),Ue("border-right","border",[i,r,Math.max(t-i*2,.08)],[n/2-i/2,o,0])],materialDefaults:{pile:ot.fabric,border:ot.fabric}}}function am({width:n,height:e,depth:t}){return{parts:[Ue("body","body",[n*.96,e*.96,t*.96],[0,0,0]),Ue("top","top",[n*.72,Math.max(e*.025,.018),t*.72],[0,e*.44,0])],materialDefaults:{body:ot.cabinet,top:ot.wood}}}var st=Object.freeze({paint:Object.freeze({materialKey:"paint",baseColor:"#D8D5CE",roughness:.7,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E7E4DE",roughness:.64,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),darkMetal:Object.freeze({materialKey:"metal",baseColor:"#34393C",roughness:.48,metallic:.62,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#22282C",roughness:.16,metallic:.08,opacity:.86}),counter:Object.freeze({materialKey:"stone",baseColor:"#5F6467",roughness:.52,metallic:.04,opacity:1}),blue:Object.freeze({materialKey:"custom",baseColor:"#4E82A6",roughness:.64,metallic:0,opacity:1})});function rt(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function ji(n,e,t,i,s,r=void 0,o=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:o,radius:t,height:i,position:s,rotation:r}}function cm({width:n,height:e,depth:t}){let i=Math.max(e*.075,.032),s=Math.max(t*.05,.018),r=Math.max(s*.82,.014),o=s*1.05,a=[rt("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2]),rt("oven-front","front",[n*.94,e*.6,s],[0,-e*.12,t/2-s/2]),rt("controls","controls",[n*.94,e*.17,o],[0,e*.28,t/2-o/2]),rt("handle","handles",[n*.62,Math.max(e*.022,.012),r],[0,e*.12,t/2-r/2]),rt("worktop","top",[n,i,t],[0,e/2-i/2,0])];for(let c of[-n*.23,n*.23])for(let l of[-t*.22,t*.22])a.push(ji("burner","cooktop",Math.min(n,t)*.105,Math.max(i*.15,.008),[c,e/2-.004,l]));return{parts:a,materialDefaults:{body:st.paint,front:st.front,controls:st.screen,handles:st.metal,top:st.counter,cooktop:st.darkMetal}}}function lm({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(i.bodyHeight??.28,e*.12),e*.62),r=Math.min(Math.max(i.chimneyHeight??.52,e-s),e-s/2),o=Math.min(Math.max(i.chimneyWidth??.3,n*.18),n*.72),a=Math.max(t*.025,.012);return{parts:[rt("hood","body",[n,s,t],[0,-e/2+s/2,0]),rt("rim","frame",[n*.82,Math.max(s*.1,.018),t],[0,-e/2+s*.08,0]),rt("chimney","body",[o,r,t*.42],[0,e/2-r/2,-t*.15]),rt("controls","controls",[n*.3,Math.max(s*.075,.014),a],[n*.25,-e/2+s*.72,t/2-a/2])],materialDefaults:{body:st.metal,frame:st.darkMetal,controls:st.screen}}}function xl({width:n,height:e,depth:t},i="washingMachine"){let s=Math.max(e*.045,.028),r=Math.max(t*.055,.02),o=Math.max(r*.7,.018),a=i==="tumbleDryer"?n*.34:n*.25,c=Math.max(r*.78,.016),l=Math.max(r*.8,.018),u=[rt("body","body",[n,e-s,Math.max(t-r,.02)],[0,-s/2,-r/2]),rt("front","front",[n*.96,e*.92,r],[0,-s/2,t/2-r/2]),rt("top","top",[n,s,t],[0,e/2-s/2,0]),ji("door","door",Math.min(n,e)*.31,o,[0,-e*.08,t/2-o/2],[Math.PI/2,0,0]),rt("display","display",[a,e*.1,c],[n*.22,e*.33,t/2-c/2]),ji("control","handles",Math.max(n*.055,.022),l,[-n*.26,e*.33,t/2-l/2],[Math.PI/2,0,0])];if(i==="washerDryer"){let h=Math.max(r*.84,.018);u.push(rt("mode","display",[n*.18,Math.max(e*.018,.01),h],[n*.2,e*.24,t/2-h/2]))}else if(i==="tumbleDryer")for(let h=0;h<3;h+=1){let d=h*Math.PI*2/3,f=Math.max(r*.86,.018);u.push(rt("drum-vane","door",[n*.055,n*.018,f],[Math.cos(d)*n*.13,-e*.08+Math.sin(d)*n*.13,t/2-f/2]))}return{yawOffsetDegrees:180,parts:u,materialDefaults:{body:st.paint,front:st.front,top:st.paint,door:st.glass,display:st.screen,handles:st.metal}}}function um({width:n,height:e,depth:t}){let i=Math.min(n,t)*.47,s=Math.max(e*.62,.045),r=Math.max(t*.1,.025),o=Math.max(i*.19,.035),a=[Math.max(n*.1,.028),Math.max(e*.28,.022),Math.max(t*.3,.07)];return{parts:[ji("body","body",i,s,[0,-e/2+s/2,0]),rt("bumper","bumper",[n*.78,s*.68,r],[0,-e*.15,t*.43]),ji("sensor","sensor",o,Math.max(e*.25,.02),[0,e*.3,-t*.1]),rt("left-wheel","wheels",a,[-n*.34,-e*.34,0]),rt("right-wheel","wheels",a,[n*.34,-e*.34,0])],materialDefaults:{body:st.darkMetal,bumper:st.darkMetal,sensor:st.screen,wheels:st.darkMetal}}}function hm({width:n,height:e,depth:t}){let i=Math.max(t*.12,.018),s=Math.max(t*.1,.018),r=-e*.31,o=Math.max(n*.014,.01),a=[rt("body","body",[n*.96,e*.86,t*.82],[0,e*.04,-t*.05]),rt("front","front",[n*.9,e*.58,i],[0,e*.09,t/2-i/2]),rt("outlet","outlet",[n*.82,e*.18,s],[0,r,t/2-s/2])];for(let c=-3;c<=3;c+=1)a.push(rt("louver","louvers",[o,e*.13,Math.max(t*.035,.01)],[c*n*.105,r,t*.475]));return a.push(rt("controls","controls",[n*.12,e*.075,Math.max(t*.035,.01)],[n*.34,e*.17,t*.465])),a.push(rt("rear-frame","frame",[n*.58,e*.42,Math.max(t*.055,.012)],[0,e*.04,-t*.46])),{parts:a,materialDefaults:{body:st.paint,front:st.front,outlet:st.screen,louvers:st.darkMetal,controls:st.screen,frame:st.metal}}}function dm({width:n,height:e,depth:t}){let i=e*.92,s=Math.max(t*.045,.018),r=Math.max(e*.045,.03),o=e*.08,a=Math.max(s*1.1,.02),c=[rt("body","body",[n*.94,i,t*.88],[0,-e/2+i/2,-t*.03]),rt("upper-front","front",[n*.88,e*.42,s],[0,e*.2,t/2-s/2]),rt("lower-front","front",[n*.88,e*.39,s],[0,-e*.255,t/2-s/2]),rt("controls","controls",[n*.24,e*.075,a],[n*.22,e*.3,t/2-a/2]),rt("foot","foot",[n*.82,r,t*.72],[0,-e/2+r/2,0])];for(let l of[-n*.22,0,n*.22])c.push(ji("connection","connections",Math.max(n*.035,.018),o,[l,e/2-o/2,-t*.13]));return{parts:c,materialDefaults:{body:st.paint,front:st.front,controls:st.screen,foot:st.metal,connections:st.metal}}}function fm({width:n,height:e,depth:t}){let i=e*.74,s=-e/2+i/2,r=Math.max(t*.045,.022),o=Math.max(e*.035,.025),a=-e/2+i,c=e-i;return{yawOffsetDegrees:180,parts:[rt("body","body",[n*.92,i,t*.88],[0,s,0]),rt("window","glass",[n*.62,i*.55,r],[0,s+i*.04,t/2-r/2]),rt("handle","handles",[n*.035,i*.38,r],[n*.29,s+i*.03,t/2-r/2]),rt("top","top",[n,o,t*.94],[0,a-o/2,0]),ji("flue","flue",Math.min(n,t)*.13,c,[0,a+c/2,-t*.18])],materialDefaults:{body:st.darkMetal,glass:st.glass,handles:st.metal,top:st.darkMetal,flue:st.darkMetal}}}function pm({width:n,height:e,depth:t}){let i=Math.min(n,t),s=i*.52,r=i*.114,o=[ji("motor","body",i*.156,e*.3,[0,e*.14,0])];for(let a=0;a<4;a+=1){let c=a*Math.PI/2,l=rt("blade","frame",[s,e*.072,r],[Math.cos(c)*i*.235,-e*.016,-Math.sin(c)*i*.235]);l.rotation=[0,-c,0],o.push(l)}return{parts:o,materialDefaults:{body:st.metal,frame:st.darkMetal}}}function mm({width:n,height:e,depth:t}){let i=e*.29,s=n*.55,r=(n-s)/2,o=[rt("base","body",[n*.92,e*.087,t*.92],[0,-e/2+e*.0435,0]),rt("stand","frame",[n*.104,e*.64,t*.104],[0,-e*.15,0]),rt("housing","body",[n,e*.36,t*.23],[0,i,0])];for(let a=0;a<3;a+=1){let c=a*Math.PI*2/3,l=rt("blade","frame",[s,e*.062,t*.19],[Math.cos(c)*r,i+Math.sin(c)*e*.12,t*.14]);l.rotation=[0,0,c],o.push(l)}return{parts:o,materialDefaults:{body:st.metal,frame:st.blue}}}var gn=Object.freeze({ceramic:Object.freeze({materialKey:"custom",baseColor:"#F0F0E8",roughness:.68,metallic:0,opacity:1}),seat:Object.freeze({materialKey:"custom",baseColor:"#E5E4DC",roughness:.62,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#B8BDBD",roughness:.24,metallic:.82,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#B8DBE3",roughness:.08,metallic:0,opacity:.24})});function qt(n,e,t,i){return{type:"box",name:n,slot:e,size:t,position:i}}function Zi(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function gm({width:n,height:e,depth:t}){let i=t*.3,s=e*.5,r=e*.42,o=Math.min(n*.46,t*.25);return{yawOffsetDegrees:180,parts:[qt("tank","ceramic",[n*.88,s,i],[0,e/2-s/2,-t/2+i/2]),qt("pedestal","ceramic",[n*.56,r,t*.38],[0,-e/2+r/2,t*.08]),Zi("bowl","ceramic",o,e*.24,[0,-e*.08,t*.15]),Zi("seat","seat",o*.92,Math.max(e*.035,.018),[0,e*.07,t*.15]),Zi("flush","handles",Math.max(n*.055,.02),Math.max(e*.018,.01),[0,e/2-.006,-t*.35])],materialDefaults:{ceramic:gn.ceramic,seat:gn.seat,handles:gn.metal}}}function xm({width:n,height:e,depth:t}){let i=e*.58,s=e*.18,r=e*.2,o=-e/2+i+s;return{yawOffsetDegrees:180,parts:[Zi("pedestal","ceramic",Math.min(n,t)*.22,i,[0,-e/2+i/2,-t*.08]),qt("basin","ceramic",[n,s,t*.84],[0,-e/2+i+s/2,0]),qt("basin-inset","basin",[n*.66,Math.max(s*.22,.018),t*.5],[0,-e/2+i+s*.74,t*.04]),Zi("faucet","fittings",Math.max(n*.018,.012),r,[n*.24,o+r/2,-t*.24]),qt("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.16,Math.min(o+r,e/2-.01),-t*.16])],materialDefaults:{ceramic:gn.ceramic,basin:gn.seat,fittings:gn.metal}}}function vm({width:n,height:e,depth:t}){let i=Math.max(e*.14,.055),s=Math.max(Math.min(n,t)*.075,.045),r=Math.max(t*.025,.014);return{parts:[qt("rear-side","ceramic",[n,e*.72,s],[0,-e*.14,-t/2+s/2]),qt("front-side","ceramic",[n,e*.72,s],[0,-e*.14,t/2-s/2]),qt("left-side","ceramic",[s,e*.72,t-s*2],[-n/2+s/2,-e*.14,0]),qt("right-side","ceramic",[s,e*.72,t-s*2],[n/2-s/2,-e*.14,0]),qt("tub","tub",[n-s*2,i,t-s*2],[0,-e/2+i/2,0]),qt("rear-rim","ceramic",[n,i,s],[0,e/2-i/2,-t/2+s/2]),Zi("faucet","fittings",r,e*.28,[n*.34,e*.34,-t*.33]),qt("spout","fittings",[n*.16,r*1.5,r*1.5],[n*.27,e*.41,-t*.28])],materialDefaults:{ceramic:gn.ceramic,tub:gn.seat,fittings:gn.metal}}}function _m({width:n,height:e,depth:t}){let i=Math.min(n,t),s=Math.min(Math.max(e*.035,.045),e*.12),r=Math.min(Math.max(i*.014,.01),.018),o=Math.min(Math.max(i*.02,.014),.026),a=Math.max(e-s,.08),c=-e/2+s+a/2,l=n*.43,u=[qt("tray","tub",[n,s,t],[0,-e/2+s/2,0]),qt("rear-glass","glass",[n*.96,a,r],[0,c,-t/2+r/2]),qt("side-glass","glass",[r,a,t*.96],[-n/2+r/2,c,0]),qt("front-glass","glass",[l,a,r],[n/2-l/2,c,t/2-r/2])];for(let d of[[-n/2+o/2,c,-t/2+o/2],[n/2-o/2,c,-t/2+o/2],[n/2-o/2,c,t/2-o/2]])u.push(qt("post","frame",[o,a,o],d));u.push(Zi("drain","fittings",Math.min(Math.max(i*.055,.026),.05),Math.max(s*.16,.008),[n*.2,-e/2+s+Math.max(s*.08,.004),t*.18])),u.push(Zi("rail","fittings",Math.max(o*.44,.008),a*.58,[n*.27,-e/2+s+a*.48,-t/2+r*2.2])),u.push(qt("shower-head","fittings",[n*.2,Math.max(o*.78,.012),t*.085],[n*.2,-e/2+s+a*.82,-t*.4]));let h=Math.max(r*1.35,.014);return u.push(qt("handle","handles",[o,a*.18,h],[n*.22,c,t/2-h/2])),{parts:u,materialDefaults:{tub:gn.ceramic,glass:gn.glass,frame:gn.metal,fittings:gn.metal,handles:gn.metal}}}var vl=Object.freeze({pot:Object.freeze({materialKey:"custom",baseColor:"#9D7256",roughness:.82,metallic:0,opacity:1}),soil:Object.freeze({materialKey:"custom",baseColor:"#51402F",roughness:.96,metallic:0,opacity:1}),leaves:Object.freeze({materialKey:"custom",baseColor:"#64805E",roughness:.88,metallic:0,opacity:1}),ceramic:Object.freeze({materialKey:"custom",baseColor:"#B98568",roughness:.7,metallic:0,opacity:1})});function Uo(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function IS(n,e,t,i,s,r){return{type:"sphere",name:n,slot:e,radius:t,scale:i,position:s,rotation:r}}function Bh({width:n,height:e,depth:t},i=!1){let s=e*(i?.24:.36),r=Math.min(n,t)*(i?.32:.38),o=i?11:7,a=-e/2+s*.78,c=e-s*.72,l=[Uo("pot","pot",r,s,[0,-e/2+s/2,0]),Uo("soil","soil",r*.86,Math.max(s*.08,.018),[0,-e/2+s*.92,0])];for(let u=0;u<o;u+=1){let h=u/o*Math.PI*2,d=u%3/2,f=Math.min(n,t)*(.16+d*.13),p=a+c*(.28+d*.24);l.push(IS("leaf","leaves",Math.min(n,t)*.18,[.55,i?1.35:1.05,.34],[Math.cos(h)*f,Math.min(p,e*.4),Math.sin(h)*f],[0,h,Math.cos(h)*.42]))}return{parts:l,materialDefaults:{pot:vl.pot,soil:vl.soil,leaves:vl.leaves}}}function ym({width:n,height:e,depth:t}){let i=e*.7,s=e*.25;return{parts:[Uo("body","ceramic",Math.min(n,t)*.46,i,[0,-e/2+i/2,0]),Uo("neck","ceramic",Math.min(n,t)*.2,s,[0,e/2-s/2,0]),Uo("lip","ceramic",Math.min(n,t)*.27,Math.max(e*.05,.018),[0,e/2-Math.max(e*.025,.009),0])],materialDefaults:{ceramic:vl.ceramic}}}var oi=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),cabinetTop:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),stair:Object.freeze({materialKey:"wood",baseColor:"#A8835F",roughness:.7,metallic:0,opacity:1})});function Cn(n,e,t,i,s){return{type:"box",name:n,slot:e,size:t,position:i,rotation:s}}function Rs({width:n,height:e,depth:t},i={},s="3_seater"){if(s==="ottoman"){let S=e*.72,C=e-S;return{parts:[Cn("cushion","cushions",[n,S,t],[0,e/2-S/2,0]),Cn("base","body",[n*.94,C,t*.92],[0,-e/2+C/2,0])],materialDefaults:{cushions:oi.fabric,body:oi.fabric}}}let r=Math.min(Math.max(Number(i.leftExtensionLength)||0,0),3.5),o=Math.min(Math.max(Number(i.rightExtensionLength)||0,0),3.5),a=r>.05||o>.05,c=a?Math.min(t,.9):t,l=-t/2,u=l+c,h=(l+u)/2,d=Math.min(Math.max(n*.34,.62),1.05),f=e*.38,p=c*.2,x=n*.1,m=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),g=Math.max(e*.16,.035),w=Math.max(Math.min(n*.012,.018),.006),b=[Cn("seat","cushions",[n,f,c],[0,-e/2+f/2,h]),Cn("back","body",[n,e*.62,p],[0,e*.19,l+p/2]),Cn("left-arm","body",[x,e*.46,c],[-n/2+x/2,-e*.08,h]),Cn("right-arm","body",[x,e*.46,c],[n/2-x/2,-e*.08,h])];for(let S of[-n*.4,n*.4])for(let C of[h-c*.32,h+c*.32])b.push(Cn("leg","legs",[m,g,m],[S,-e/2+g/2,C]));let y=a?3:2;for(let S=1;S<y;S+=1){let C=-n/2+n*S/y;b.push(Cn("cushion-seam","cushions",[w,Math.max(f*.035,.006),c*.78],[C,-e/2+f+.003,h+c*.02]))}let T=(S,C)=>{if(C<=.05)return;let _=Math.min(Math.max(C,c),3.5),A=S==="left"?-n/2+d/2:n/2-d/2,I=l+_/2;b.push(Cn(\`\${S}-return\`,"cushions",[d,f,_],[A,-e/2+f/2,I])),b.push(Cn(\`\${S}-return-seam\`,"cushions",[d*.82,Math.max(f*.055,.012),_*.72],[A,-e/2+f+.004,I+_*.03]))};return T("left",r),T("right",o),{parts:b,materialDefaults:{body:oi.fabric,cushions:oi.fabric,legs:oi.metal}}}function bm({width:n,height:e,depth:t},i={}){let r=(k,F)=>Math.min(Math.max(Number(k)||F*.42,Math.min(.05,F/2)),Math.max(F-Math.min(.05,F/2),F/2)),o=r(i.leftLegLength,n),a=r(i.rightLegLength,t),c=[[-n/2,-t/2],[n/2,-t/2],[n/2,-t/2+a],[-n/2+o,t/2],[-n/2,t/2]],l=c[2],u=c[3],h=u[0]-l[0],d=u[1]-l[1],f=Math.hypot(h,d),p=[h/f,d/f],x=[p[1],-p[0]],m=[(l[0]+u[0])/2,(l[1]+u[1])/2],g=Math.min(Math.max(e*.06,.025),.08),w=Math.max(e-g,.02),b=Math.min(Math.max(Math.min(n,t)*.025,.014),.026),y=w*.9,T=-g/2,S=-Math.atan2(p[1],p[0]),C=[{type:"extrude",name:"body",slot:"body",outline:c,height:w,position:[0,-g/2,0]},{type:"extrude",name:"top",slot:"top",outline:c,height:g,position:[0,e/2-g/2,0]}],_=f*.44;for(let k of[-f*.225,f*.225]){let F=[m[0]+p[0]*k+x[0]*b/2,m[1]+p[1]*k+x[1]*b/2];C.push(Cn("front","front",[_,y,b],[F[0],T,F[1]],[0,S,0]))}let A=Math.min(Math.max(e*.18,.12),.3),I=Math.min(Math.max(f*.018,.01),.018),P=Math.min(Math.max(b*.55,.009),.014);for(let k of[-f*.055,f*.055]){let F=[m[0]+p[0]*k+x[0]*(b+P/2),m[1]+p[1]*k+x[1]*(b+P/2)];C.push(Cn("handle","handles",[I,A,P],[F[0],T,F[1]],[0,S,0]))}return{parts:C,materialDefaults:{body:oi.cabinet,front:oi.cabinetFront,top:oi.cabinetTop,handles:oi.metal}}}function Mm({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(Math.round(Number(i.stepCount)||e/.18),2),30),r=i.direction==="down"?"down":"up",o=t/s,a=e/s,c=Math.min(Math.max(a*.22,.025),.055),l=[];for(let u=0;u<s;u+=1){let h=-t/2+o*(u+.5),d=r==="up"?h:-h,f=-e/2+a*(u+1)-c/2;l.push(Cn("tread","body",[n,c,o],[0,f,d]))}return{parts:l,materialDefaults:{body:oi.stair}}}var DS=Object.freeze({sofa_basic:Object.freeze({variants:Object.freeze({default:(n,e)=>Rs(n,e,"default"),"2_seater":(n,e)=>Rs(n,e,"2_seater"),"3_seater":Xp,corner_left:(n,e)=>Rs(n,e,"corner_left"),corner_right:(n,e)=>Rs(n,e,"corner_right"),u_shaped:(n,e)=>Rs(n,e,"u_shaped"),ottoman:(n,e)=>Rs(n,e,"ottoman")})}),chair_basic:Object.freeze({variants:Object.freeze({dining:qp,lounge:Zp,wooden:Kp,cantilever:Jp})}),table_basic:Object.freeze({variants:Object.freeze({coffee:Nh,round:Qp,rectangular:Nh})}),bed_basic:Object.freeze({variants:Object.freeze({single:Fh,queen:Fh})}),wardrobe:Object.freeze({variants:Object.freeze({default:Yp})}),nightstand:Object.freeze({variants:Object.freeze({default:n=>gl(n,"nightstand")})}),shelf:Object.freeze({variants:Object.freeze({default:em})}),cabinet:Object.freeze({variants:Object.freeze({default:gl})}),cornerCabinet:Object.freeze({variants:Object.freeze({default:bm})}),genericStorage:Object.freeze({variants:Object.freeze({default:gl})}),kitchenBase:Object.freeze({variants:Object.freeze({default:$p})}),kitchenTallUnit:Object.freeze({variants:Object.freeze({default:tm})}),refrigerator:Object.freeze({variants:Object.freeze({default:nm})}),stove:Object.freeze({variants:Object.freeze({default:cm})}),rangeHood:Object.freeze({variants:Object.freeze({default:lm})}),kitchenSink:Object.freeze({variants:Object.freeze({default:sm})}),kitchenIsland:Object.freeze({variants:Object.freeze({default:im})}),tvLowboard:Object.freeze({variants:Object.freeze({default:jp})}),television:Object.freeze({variants:Object.freeze({default:rm})}),robotVacuum:Object.freeze({variants:Object.freeze({default:um})}),ceilingFan:Object.freeze({variants:Object.freeze({default:pm})}),standingFan:Object.freeze({variants:Object.freeze({default:mm})}),airConditioner:Object.freeze({variants:Object.freeze({default:hm})}),heatPumpIndoorUnit:Object.freeze({variants:Object.freeze({default:dm})}),fireplaceStove:Object.freeze({variants:Object.freeze({default:fm})}),washerDryer:Object.freeze({variants:Object.freeze({default:n=>xl(n,"washerDryer")})}),washingMachine:Object.freeze({variants:Object.freeze({default:n=>xl(n,"washingMachine")})}),tumbleDryer:Object.freeze({variants:Object.freeze({default:n=>xl(n,"tumbleDryer")})}),toilet:Object.freeze({variants:Object.freeze({default:gm})}),bathroomSink:Object.freeze({variants:Object.freeze({default:xm})}),bathtub:Object.freeze({variants:Object.freeze({default:vm})}),shower:Object.freeze({variants:Object.freeze({default:_m})}),straightStair:Object.freeze({variants:Object.freeze({default:Mm})}),smallPlant:Object.freeze({variants:Object.freeze({default:n=>Bh(n,!1)})}),floorPlant:Object.freeze({variants:Object.freeze({default:n=>Bh(n,!0)})}),decorativeVase:Object.freeze({variants:Object.freeze({default:ym})}),rug:Object.freeze({variants:Object.freeze({default:om})}),genericObject:Object.freeze({variants:Object.freeze({default:am})})});function Sm(n,e){return DS[n]?.variants?.[e]??null}var Am=Object.freeze({fabric:Object.freeze({roughness:.9,metallic:0}),wood:Object.freeze({roughness:.68,metallic:0}),metal:Object.freeze({roughness:.42,metallic:.72}),glass:Object.freeze({roughness:.18,metallic:0}),paint:Object.freeze({roughness:.84,metallic:0}),tile:Object.freeze({roughness:.62,metallic:0}),concrete:Object.freeze({roughness:.9,metallic:0}),stone:Object.freeze({roughness:.58,metallic:.02}),custom:Object.freeze({roughness:.7,metallic:0})}),Rn=256,Em=Object.freeze({automatic:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"longestBoundary"}),tile:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),laminate:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),carpet:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"local"}),wood:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),fabric:Object.freeze({elementSize:.06,lineWidth:.001,orientation:"local"}),concrete:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),stone:Object.freeze({elementSize:.6,lineWidth:.003,orientation:"local"})});function br(n){return Number(n).toFixed(6)}function LS(n){return n==="wallPaint"?"paint":Object.hasOwn(Am,n)?n:"custom"}function OS(n,e,t){let i=n?.pattern??e?.pattern,s=["wood","fabric","tile","concrete","stone"].includes(t)?t:null,r=i?.kind??s;if(!r||!Object.hasOwn(Em,r))return null;let o=Em[r];return{kind:r,elementSize:i?.elementSize??o.elementSize,lineWidth:i?.lineWidth??o.lineWidth,orientation:i?.orientation??o.orientation}}function wm(n={},e={}){let t=n?.materialKey??e?.materialKey??"custom",i=LS(t),s=Am[i],r={materialKey:i,baseColor:n?.baseColor??e?.baseColor??"#B8B3AA",roughness:n?.roughness??e?.roughness??s.roughness,metallic:n?.metallic??e?.metallic??s.metallic,opacity:n?.opacity??e?.opacity??1},o=OS(n,e,i);return o?{...r,pattern:o}:r}function Cm(n){return n?[n.kind,br(n.elementSize),br(n.lineWidth),n.orientation].join(":"):"no-pattern"}function NS(n){return[n.materialKey,new Ge(n.baseColor).getHexString().toUpperCase(),Cm(n.pattern)].join(":")}function FS(n,e){return[e.physical?"physical":"standard",n.materialKey,new Ge(n.baseColor).getHexString().toUpperCase(),br(n.roughness),br(n.metallic),br(n.opacity),Cm(n.pattern),br(e.transmission??0),e.depthWrite===!1?"no-depth-write":"depth-write",e.side??dn].join(":")}function kh(n,e,t){let i=Math.imul(n+1,521288629)^Math.imul(e+1,1597334677)^t;return i=Math.imul(i^i>>>15,73244475),((i^i>>>16)>>>0)/4294967295}function US(n){return Math.min(Math.max(n,0),1)}function zh(n){let e=Math.max(n.elementSize,.001);switch(n.kind){case"laminate":return{x:Math.max(e*5.2,.72),z:e*2};case"wood":return{x:Math.max(e*5.2,.72),z:e};case"fabric":case"carpet":return{x:Math.min(e,.12),z:Math.min(e,.12)};case"automatic":return{x:1,z:e};default:return{x:e,z:e}}}function BS(n){let e=zh(n);return{resolution:Rn,lineWidthMeters:n.lineWidth,lineWidthPixels:{x:n.lineWidth/e.x*Rn,z:n.lineWidth/e.z*Rn},antialiased:!0}}function Ps(n,e,t){let i=1/Rn,s=Math.max(t,0)/2,r=0;for(let o of e){let a=Math.abs(n-o),c=Math.min(a,1-a);r=Math.max(r,US((s+i/2-c)/i))}return r}function kS(n,e,t){let i=zh(n),s=n.lineWidth/i.x,r=n.lineWidth/i.z;switch(n.kind){case"automatic":return Ps(t,[0],r);case"tile":return Math.max(Ps(e,[0],s),Ps(t,[0],r));case"laminate":{let o=t<.5?0:1;return Math.max(Ps(t,[0,.5],r),Ps(e,[o===0?0:.5],s))}case"wood":return Math.max(Ps(e,[0],s),Ps(t,[0],r));default:return 0}}function _l(n,e,t){return Math.round(n+(e-n)*t)}function zS(n,e,t){let i=(e+.5)/Rn,s=(t+.5)/Rn,r=kS(n,i,s);switch(n.kind){case"automatic":return _l(255,226,r);case"tile":return _l(255,208,r);case"laminate":{let o=Math.sin((i*7.5+s*.7)*Math.PI*2)*.7,a=Math.sin((i*25+s*1.2)*Math.PI*2)*.35;return _l(Math.min(Math.round(254+o+a),255),228,r)}case"wood":{let o=Math.sin((i*8.5+s*.55)*Math.PI*2)*.65,a=Math.sin((i*29+s*1.1)*Math.PI*2)*.3,c=(kh(Math.floor(e/4),t,194075)-.5)*.6;return _l(Math.min(Math.round(254+o+a+c),255),230,r)}case"fabric":case"carpet":{let o=e%6===2||t%6===2?-24:0,a=e%6===5||t%6===5?8:0;return 247+o+a}case"concrete":return Math.round(246-kh(e,t,277015)*18);case"stone":{let o=kh(Math.floor(e/3),Math.floor(t/3),597045),a=Math.abs(Math.sin((i*2.1+s*1.35)*Math.PI*2));return Math.round(246-o*12-(a<.055?20:0))}default:return 255}}function HS(n){let e=new Uint8Array(Rn*Rn*4);for(let i=0;i<Rn;i+=1)for(let s=0;s<Rn;s+=1){let r=Math.min(Math.max(zS(n,s,i),0),255),o=(i*Rn+s)*4;e[o]=r,e[o+1]=r,e[o+2]=r,e[o+3]=255}let t=new ei(e,Rn,Rn,pn,on);return t.wrapS=gs,t.wrapT=gs,t.magFilter=At,t.minFilter=ni,t.generateMipmaps=!0,t.anisotropy=4,t.colorSpace=Nt,t.userData.portablePattern={...n},t.userData.meterPeriod=zh(n),t.userData.portablePatternRaster=BS(n),t.needsUpdate=!0,t}function Tm(n,e={},t=null){let i={color:n.baseColor,roughness:n.roughness,metalness:n.metallic,transparent:n.opacity<1,opacity:n.opacity,depthWrite:e.depthWrite??!0,side:e.side??dn,map:t},s=e.physical?new _o({...i,transmission:e.transmission??0}):new wn(i);return s.userData.materialKey=n.materialKey,s.userData.portableAppearance={...n},s}function yi(){let n=new Map,e=new Map;function t(i){if(!i.pattern)return null;let s=NS(i);return e.has(s)||e.set(s,HS(i.pattern)),e.get(s)}return{material(i,s,r={}){let o=wm(i,s),a={...r,physical:r.physical??o.materialKey==="glass"},c=FS(o,a);return n.has(c)||n.set(c,Tm(o,a,t(o))),n.get(c)},instance(i,s,r={}){let o=wm(i,s);return Tm(o,{...r,physical:r.physical??o.materialKey==="glass"},t(o))}}}function Rm(n){return Number(n).toFixed(6)}function Hh(){let n=new Map,e=yi();return{boxGeometry(t){let i=\`box:\${t.map(Rm).join(":")}\`;return n.has(i)||n.set(i,new Vt(...t)),n.get(i)},geometry(t){let i,s;switch(t.type){case"extrude":i=[t.height,...t.outline.flat()],s=()=>{let o=new En;t.outline.forEach(([c,l],u)=>{u===0?o.moveTo(c,-l):o.lineTo(c,-l)}),o.closePath();let a=new xi(o,{depth:t.height,bevelEnabled:!1,steps:1});return a.translate(0,0,-t.height/2),a.rotateX(-Math.PI/2),a};break;case"cylinder":i=[t.radius,t.height,t.radialSegments??24],s=()=>new gi(t.radius,t.radius,t.height,t.radialSegments??24);break;case"sphere":i=[t.radius,t.widthSegments??20,t.heightSegments??14],s=()=>new vi(t.radius,t.widthSegments??20,t.heightSegments??14);break;default:return this.boxGeometry(t.size)}let r=\`\${t.type}:\${i.map(Rm).join(":")}\`;return n.has(r)||n.set(r,s()),n.get(r)},material(t){return e.material(t)}}}function VS(n,e,t){let i=t.appearance?.materialSlots??{},s=e.materialDefaults[n.slot]??e.materialDefaults[n.fallbackSlot]??{materialKey:"custom",baseColor:"#B8B3AA",roughness:.7,metallic:0,opacity:1},r=i[n.slot]??(n.fallbackSlot?i[n.fallbackSlot]:void 0);return{...s,...r}}function Pm(n,e){n.userData.sceneObjectId=e.id,n.userData.sceneElementType="object",n.userData.kind=e.kind,n.userData.binding=e.binding??null,n.userData.assetKey=e.assetKey,n.userData.variantKey=e.variantKey}function Im(n,e,t=Hh()){let i=Sm(e.assetKey,e.variantKey);if(!i)return console.warn(\`Mikonus interior asset \${e.assetKey}/\${e.variantKey} is not supported; skipping \${e.id}.\`),null;let s=e.dimensions,r=i(s,e.parameters??{}),o=new ct;o.position.set(e.position.x,e.position.y,e.position.z),o.rotation.y=it.degToRad(e.rotation.y),Pm(o,e),o.userData.anchor="groundCenter",o.userData.forwardAxis="+Z",o.userData.dimensions={...s},o.userData.recipeYawOffsetDegrees=r.yawOffsetDegrees??0;let a=new ct;a.rotation.y=it.degToRad(r.yawOffsetDegrees??0),o.add(a);for(let c of r.parts){let l=new nt(t.geometry(c),t.material(VS(c,r,e)));l.name=\`\${e.assetKey}:\${c.name}\`,l.position.set(c.position[0],c.position[1]+s.height/2,c.position[2]),c.rotation&&l.rotation.set(...c.rotation),c.scale&&l.scale.set(...c.scale),Pm(l,e),l.userData.materialSlot=c.slot,l.userData.recipePart=c.name,a.add(l)}return n.add(o),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:o,pickables:[],visual:{type:"furniture",assetKey:e.assetKey,variantKey:e.variantKey,pathMotionRoot:a}}}function Mr(n,e,t,i){return{type:"box",name:n,role:e,size:t,position:i}}function Zt(n,e,t,i,s,r=void 0){return{type:"cylinder",name:n,role:e,radius:t,height:i,position:s,rotation:r}}function GS(n,e,t,i){return{type:"sphere",name:n,role:e,radius:t,position:i}}function WS(n,e,t,i,s,r){return{type:"frustum",name:n,role:e,topRadius:t,bottomRadius:i,height:s,position:r}}function XS(n){let e=Math.min(n.width,n.depth),t=Math.max(n.height*.2,.018),i=Math.max(n.height*.42,.035),s=Math.max(n.height*.22,.018);return[Zt("mount","body",e*.3,t,[0,n.height/2-t/2,0]),Zt("shade","body",e*.48,i,[0,n.height*.05,0]),Zt("diffuser","diffuser",e*.41,s,[0,-n.height/2+s/2,0])]}function Bo(n,e,t=1){let i=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),s=Math.max(n.height*.045,.025),r=t===1?Math.min(n.width*.42,n.depth):n.width*.88,o=n.height*.43-i,a=Math.max(n.height*.14,.08),c=Math.min(n.depth*.44,n.width/(t*2.35)),l=(e.shadeDiameter??.35)/2,u=Math.min(c,Math.max(l,c*.72)),h=Math.max(n.width-u*2.25,0),d=[Mr("mount","body",[r,s,n.depth*.58],[0,n.height/2-s/2,0])];for(let f=0;f<t;f+=1){let p=t===1?.5:f/(t-1),x=-h/2+h*p,m=Math.max(a*.16,.012);d.push(Zt(\`cable-\${f}\`,"body",Math.max(n.width*.007,.006),i,[x,n.height/2-s-i/2,0])),d.push(Zt(\`shade-\${f}\`,"body",u,a,[x,o,0])),d.push(Zt(\`diffuser-\${f}\`,"diffuser",u*.82,m,[x,o-a/2+m/2,0]))}return d}function qS(n,e){let t=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),i=Math.max(n.height*.045,.025),s=n.height*.43-t,r=Math.max(n.height*.075,.045),o=Math.max(r*.22,.012);return[Mr("mount","body",[n.width*.42,i,n.depth*.62],[0,n.height/2-i/2,0]),Zt("cable-left","body",.006,t,[-n.width*.34,n.height/2-i-t/2,0]),Zt("cable-right","body",.006,t,[n.width*.34,n.height/2-i-t/2,0]),Mr("bar","body",[n.width,r,n.depth*.72],[0,s,0]),Mr("diffuser","diffuser",[n.width*.94,o,n.depth*.56],[0,s-r/2+o/2,0])]}function YS(n,e){let t=Math.max(Math.min(n.width,n.depth),.12),i=Math.max(n.height,.3),s=Number.isFinite(e.shadeDiameter)?e.shadeDiameter:t*.9,o=Math.min(Math.max(s,t*.82),t)/2,a=o*.64,c=Math.min(Math.max(i*.3,.24),i*.38),l=i/2-c/2-i*.025,u=Math.max(n.height*.035,.025),h=l+c*.16,d=-n.height/2+u;return[Zt("base","body",n.width*.38,u,[0,-n.height/2+u/2,0]),Zt("stem","body",Math.max(n.width*.025,.009),Math.max(h-d,.12),[0,(h+d)/2,0]),WS("shade","shade",a,o,c,[0,l,0]),GS("diffuser","diffuser",Math.max(a*.5,.045),[0,l-c*.08,0])]}function $S(n,e){let t=Math.max(n.height*.035,.025),i=n.height*.28,s=n.height/2-i/2,r=Math.min(e.shadeDiameter??.35,Math.min(n.width,n.depth))/2;return[Zt("base","body",n.width*.38,t,[0,-n.height/2+t/2,0]),Zt("stem","body",Math.max(n.width*.025,.009),n.height*.62,[0,-n.height*.13,0]),Zt("shade","shade",r,i,[0,s,0]),Zt("diffuser","diffuser",Math.max(r*.45,.035),Math.max(i*.28,.02),[0,s-i*.14,0])]}function jS(n){let e=Math.max(n.depth*.18,.018),t=n.depth*.62,i=Math.max(n.depth*.16,.016);return[Mr("mount","body",[n.width*.58,n.height*.58,e],[0,0,-n.depth/2+e/2]),Zt("shade","body",Math.min(n.width,n.height)*.44,t,[0,0,-n.depth/2+e+t/2],[Math.PI/2,0,0]),Zt("diffuser","diffuser",Math.min(n.width,n.height)*.34,i,[0,0,n.depth/2-i/2],[Math.PI/2,0,0])]}function ZS(n){let e=n.height*.32;return[Zt("shade","body",Math.min(n.width,n.depth)*.48,n.height,[0,0,0]),Zt("diffuser","diffuser",Math.min(n.width,n.depth)*.32,e,[0,-n.height/2+e/2,0])]}function KS(n,e){let t=Math.max(e.stripThickness??.025,.008);return[Mr("strip","diffuser",[Math.max(n.width-Math.min(n.width*.2,.008),.008),t,t],[0,0,0])]}var JS=Object.freeze({ceilingLight:(n,e)=>XS(n,e),pendantLight:(n,e)=>Bo(n,e,1),pendantSpot1:(n,e)=>Bo(n,e,1),pendantSpot2:(n,e)=>Bo(n,e,2),pendantSpot3:(n,e)=>Bo(n,e,3),pendantSpot4:(n,e)=>Bo(n,e,4),pendantLED:qS,floorLamp:YS,tableLamp:$S,wallLight:(n,e)=>jS(n,e),recessedSpot:(n,e)=>ZS(n,e),ledStrip:KS});function Dm(n,e,t={}){let i=JS[n];return i?i(e,t):null}var Vh=.24,QS=.25;function eE(){let e=new Uint8Array(16384);for(let i=0;i<64;i++)for(let s=0;s<64;s++){let r=Math.abs((s+.5)/64*2-1),o=Math.abs((i+.5)/64*2-1),a=Math.pow(r**4+o**4,.25),c=it.clamp((1-a)/.38,0,1),l=c*c*(3-2*c),u=(i*64+s)*4;e[u]=e[u+1]=e[u+2]=255,e[u+3]=Math.round(l*255)}let t=new ei(e,64,64);return t.minFilter=t.magFilter=At,t.needsUpdate=!0,t}function tE(n,e,t,i){let s=[];for(let r=0;r<n.length;r++){let o=n[r],a=n[(r+1)%n.length],c=i*(o[e]-t)<=0,l=i*(a[e]-t)<=0;if(c&&s.push(o),c!==l){let u=(t-o[e])/(a[e]-o[e]);s.push({x:o.x+(a.x-o.x)*u,z:o.z+(a.z-o.z)*u})}}return s}function Lm(n,e,t){let i=new ct;i.name="DashboardFurnitureContactShadows";let s=e.rooms.map(o=>{let a=o.polygon.map(c=>new ae(c.x,c.z));return{...o,triangles:Fn.triangulateShape(a,[]).map(c=>c.map(l=>o.polygon[l]))}}),r;for(let o of e.objects){if(o.kind!=="furniture"||!t.has(o.id)||["rug","robotVacuum"].includes(o.assetKey)||(o.dimensions??o.size).height<.08)continue;let{width:a,depth:c}=o.dimensions??o.size,l=it.degToRad(o.rotation.y),u=Math.cos(l),h=Math.sin(l),{x:d,y:f,z:p}=o.position,x=a/2+.08,m=c/2+.08,g=[],w=[];for(let T of s){let S=f-T.elevation;if(!(S<-.02||S>QS))for(let C of T.triangles){let _=C.map(A=>({x:u*(A.x-d)-h*(A.z-p),z:h*(A.x-d)+u*(A.z-p)}));for(let[A,I,P]of[["x",x,1],["x",-x,-1],["z",m,1],["z",-m,-1]])if(_=tE(_,A,I,P),!_.length)break;for(let A=1;A+1<_.length;A++)for(let I of[_[0],_[A],_[A+1]])g.push(d+u*I.x+h*I.z,T.elevation+.004,p-h*I.x+u*I.z),w.push(I.x/(x*2)+.5,I.z/(m*2)+.5)}}if(!g.length)continue;r??=new Qt({color:0,map:eE(),transparent:!0,opacity:Vh,depthWrite:!1,toneMapped:!1,side:Ct,forceSinglePass:!0});let b=new Ht;b.setAttribute("position",new ht(g,3)),b.setAttribute("uv",new ht(w,2));let y=new nt(b,r);y.name=\`FurnitureContactShadow:\${o.id}\`,y.userData.isContactShadow=!0,y.userData.excludeFromDevicePicking=!0,y.userData.excludeFromCameraFit=!0,y.renderOrder=1,i.add(y)}return i.children.length&&n.add(i),{group:i,material:r}}var Sr=2,Ki=Object.freeze({hemisphere:Object.freeze({skyColor:16776179,groundColor:8358552,intensity:.82}),key:Object.freeze({color:16773852,intensity:2.15,direction:Object.freeze({x:-.48,y:1,z:.62})}),fill:Object.freeze({color:12177646,intensity:.24,direction:Object.freeze({x:.72,y:.62,z:-.58})}),globalShadow:Object.freeze({mapSize:2048,bias:-35e-5,normalBias:.025,radius:3})});function Nm(n){n.shadowMap.enabled=!0,n.shadowMap.type=Es,n.shadowMap.autoUpdate=!1,n.shadowMap.needsUpdate=!0}function Wh(n,e){n.shadowMap.enabled=!0,n.shadowMap.needsUpdate=!0}function Gh(n){return n?(n.userData.dashboardBaseIntensity??=n.intensity,n.userData.dashboardBaseIntensity):0}function Fm(n){let e=n.userData.dashboardAmbientBrightnessFactor??1,t=n.userData.dashboardEnvironmentIntensityFactor??1;n.intensity=Gh(n)*e*t}function Xh(n,e){let t=n?.hemisphere;t&&(t.userData.dashboardAmbientBrightnessFactor=Number.isFinite(e)?Math.max(e,0):1,Fm(t))}function Um(n,e){if(!n||!e)return;let t=e.ambientIntensityFactor??1,i=e.keyIntensityFactor??1,s=e.fillIntensityFactor??1;if(n.hemisphere&&(n.hemisphere.userData.dashboardEnvironmentIntensityFactor=t,Fm(n.hemisphere)),n.keyLight){n.keyLight.intensity=Gh(n.keyLight)*i,Array.isArray(e.keyRGB)&&n.keyLight.color.setRGB(...e.keyRGB,Nt);let r=e.sunPositionDirection,o=n.shadowFit;r&&o&&n.keyLight.position.set(o.center.x+r.x*o.horizontalRadius,o.center.y+Math.max(r.y,.08)*o.horizontalRadius,o.center.z+r.z*o.horizontalRadius)}n.fillLight&&(n.fillLight.intensity=Gh(n.fillLight)*s,Array.isArray(e.fillRGB)&&n.fillLight.color.setRGB(...e.fillRGB,Nt))}function qh(n,e,t){let i=Number.isFinite(t)?Math.min(Math.max(t,0),1):1;n?.keyLight?.shadow&&(n.keyLight.shadow.intensity=i),n?.contactShadows?.material&&(n.contactShadows.material.opacity=Vh*i)}function yl(n,e,t){n?.keyLight&&(n.keyLight.castShadow=t),n?.contactShadows&&(n.contactShadows.group.visible=t)}function nE(n){return(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean)}function Om(n){return nE(n).some(e=>e.transparent===!0&&e.opacity<.98||e.transmission>0)}function iE(n){n.traverse(e=>{if(!e.isMesh)return;if(e.userData.isPhysicalLightOccluder){e.castShadow=!0,e.receiveShadow=!1;return}if(e.userData.isPickProxy||e.userData.isContactShadow||e.userData.isLinearLightProjection||e.userData.isLinearLightReceiver||e.userData.isRoomSpotProjection){e.castShadow=!1,e.receiveShadow=!1;return}let t=e.userData.sceneElementType==="room",i=e.userData.lightRole==="diffuser";e.castShadow=!t&&!i&&!Om(e),e.receiveShadow=!Om(e)})}function sE(n){n.updateWorldMatrix(!0,!0);let e=new zt,t=new zt;return n.traverse(i=>{!i.isMesh||i.userData.isPhysicalLightOccluder||i.userData.isContactShadow||i.userData.isLinearLightProjection||i.userData.isLinearLightReceiver||i.userData.isRoomSpotProjection||e.union(t.setFromObject(i))}),e.isEmpty()&&(e.min.set(-1,0,-1),e.max.set(1,2,1)),e}function rE(n,e){let t=e.getCenter(new D),i=e.getSize(new D),s=Math.max(Math.hypot(i.x,i.z)/2+.65,1.5),r=Ki.key.direction;n.position.set(t.x+r.x*s,e.max.y+r.y*s,t.z+r.z*s),n.target.position.set(t.x,e.min.y+Math.min(i.y*.28,.75),t.z);let o=n.shadow.camera;return o.left=-s,o.right=s,o.top=s,o.bottom=-s,o.near=.1,o.far=s*3.4+i.y,o.updateProjectionMatrix(),{bounds:e,center:t,horizontalRadius:s}}function Bm(n,e){iE(e);let t=sE(e),i=Ki.hemisphere,s=new bo(i.skyColor,i.groundColor,i.intensity);s.name="DashboardAmbientHemisphere",n.add(s);let r=Ki.key,o=new dr(r.color,r.intensity);o.name="DashboardShadowKey",o.castShadow=!0,o.shadow.mapSize.setScalar(Ki.globalShadow.mapSize),o.shadow.bias=Ki.globalShadow.bias,o.shadow.normalBias=Ki.globalShadow.normalBias,o.shadow.radius=Ki.globalShadow.radius,n.add(o,o.target);let a=rE(o,t),c=Ki.fill,l=new dr(c.color,c.intensity);return l.name="DashboardSkyFill",l.castShadow=!1,l.position.set(a.center.x+c.direction.x*a.horizontalRadius,t.max.y+c.direction.y*a.horizontalRadius,a.center.z+c.direction.z*a.horizontalRadius),l.target.position.copy(a.center),n.add(l,l.target),{hemisphere:s,keyLight:o,fillLight:l,shadowFit:a}}var km=.72,zm=.64,oE=new Set(["robotVacuum","rug"]);function aE(n,e){let t=!1;for(let i=0,s=e.length-1;i<e.length;s=i++){let r=e[i],o=e[s];r.z>n.z!=o.z>n.z&&n.x<(o.x-r.x)*(n.z-r.z)/(o.z-r.z)+r.x&&(t=!t)}return t}function cE(){let e=new Uint8Array(65536);for(let i=0;i<128;i+=1)for(let s=0;s<128;s+=1){let r=Math.abs((s+.5)/128*2-1),o=Math.abs((i+.5)/128*2-1),a=Math.max(r-.55,0)/.45,c=Math.hypot(a,o),l=Math.max(1-c**2,0)**2,u=(i*128+s)*4;e[u]=e[u+1]=e[u+2]=255,e[u+3]=Math.round(l*255)}let t=new ei(e,128,128);return t.minFilter=t.magFilter=At,t.needsUpdate=!0,t}function bl(n,e){return n.rooms.filter(i=>aE(e,i.polygon)).sort((i,s)=>{let r=i.elevation<=e.y+.05,o=s.elevation<=e.y+.05;return r!==o?r?-1:1:Math.abs(e.y-i.elevation)-Math.abs(e.y-s.elevation)})[0]??null}function Yh(n,e,t,i,s){let r=new En;n.polygon.forEach((h,d)=>{d===0?r.moveTo(h.x,-h.z):r.lineTo(h.x,-h.z)}),r.closePath();let o=new ys(r);o.rotateX(-Math.PI/2);let a=o.getAttribute("position"),c=new Float32Array(a.count*2),l=Math.cos(t),u=Math.sin(t);for(let h=0;h<a.count;h+=1){let d=a.getX(h)-e.x,f=a.getZ(h)-e.z,p=l*d-u*f,x=u*d+l*f;c[h*2]=p/i+.5,c[h*2+1]=x/s+.5}return o.setAttribute("uv",new Jt(c,2)),o}function lE(n,e,t,i,s){let r=new D(Math.cos(e),0,-Math.sin(e)),o=new D(Math.sin(e),0,Math.cos(e));return new en({uniforms:{lightColor:{value:new Ge(16777215)},lightPosition:{value:n.clone()},alongAxis:{value:r},acrossAxis:{value:o},halfWidth:{value:t/2},halfDepth:{value:i/2},distance:{value:s},intensity:{value:0}},vertexShader:\`
      varying vec3 receiverWorldPosition;
      varying vec3 receiverWorldNormal;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        receiverWorldPosition = worldPosition.xyz;
        receiverWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    \`,fragmentShader:\`
      uniform vec3 lightColor;
      uniform vec3 lightPosition;
      uniform vec3 alongAxis;
      uniform vec3 acrossAxis;
      uniform float halfWidth;
      uniform float halfDepth;
      uniform float distance;
      uniform float intensity;
      varying vec3 receiverWorldPosition;
      varying vec3 receiverWorldNormal;
      void main() {
        vec3 offset = receiverWorldPosition - lightPosition;
        vec3 towardLight = lightPosition - receiverWorldPosition;
        float lightDistance = length(towardLight);
        float along = abs(dot(offset, alongAxis));
        float across = abs(dot(offset, acrossAxis));
        float alongFalloff = 1.0 - smoothstep(halfWidth * 0.72, halfWidth, along);
        float acrossFalloff = 1.0 - smoothstep(halfDepth * 0.42, halfDepth, across);
        float distanceFalloff = 1.0 - smoothstep(distance * 0.36, distance, lightDistance);
        float belowEmitter = smoothstep(-0.02, 0.08, towardLight.y);
        float facing = max(dot(normalize(receiverWorldNormal), normalize(towardLight)), 0.0);
        float illumination = alongFalloff * acrossFalloff * distanceFalloff
          * belowEmitter * mix(0.16, 1.0, facing) * intensity;
        gl_FragColor = vec4(lightColor, illumination);
      }
    \`,transparent:!0,blending:Wi,depthTest:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:!1,side:dn})}function uE(n,e,t){return!["furniture","decor"].includes(n.kind)||oE.has(n.visual?.assetKey)?!1:bl(e,n.root.position)?.id===t.id}function hE(n){return!n.isMesh||n.isSkinnedMesh||!n.visible||n.userData.isPickProxy||n.userData.excludeFromCameraFit||n.userData.isPhysicalLightOccluder?!1:(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean).some(t=>t.visible!==!1&&t.opacity>.05&&!(t.transparent===!0&&t.opacity<.98)&&!(t.transmission>0))}function dE(n,e){let t=new zt().setFromObject(n.root);if(t.isEmpty())return!1;let i=t.getCenter(new D),s=t.getSize(new D),r=Math.hypot(s.x,s.z)/2,o=i.sub(e.uniforms.lightPosition.value);return Math.abs(o.dot(e.uniforms.alongAxis.value))<=e.uniforms.halfWidth.value+r&&Math.abs(o.dot(e.uniforms.acrossAxis.value))<=e.uniforms.halfDepth.value+r&&t.min.y<e.uniforms.lightPosition.value.y+.02&&e.uniforms.lightPosition.value.y-t.max.y<=e.uniforms.distance.value}function fE(n,e,t,i,s,r,o){n.updateWorldMatrix(!0,!0),i.root.updateWorldMatrix(!0,!0);let a=i.visual.light.getWorldPosition(new D),c=lE(a,i.root.rotation.y,s,r,i.visual.lightProfile.distance),l=new ct;l.name=\`LinearLightFurnitureReceivers:\${i.id}\`,l.visible=!1,l.userData.excludeFromCameraFit=!0;let u=n.matrixWorld.clone().invert();for(let h of o)uE(h,e,t)&&(h.root.updateWorldMatrix(!0,!0),dE(h,c)&&h.root.traverse(d=>{if(!hE(d))return;let f=new nt(d.geometry,c);f.name=\`LinearLightFurnitureReceiver:\${i.id}:\${h.id}\`,f.matrixAutoUpdate=!1,f.matrix.multiplyMatrices(u,d.matrixWorld),f.renderOrder=3,f.frustumCulled=d.frustumCulled,f.userData.isLinearLightReceiver=!0,f.userData.sourceEntityId=h.id,f.userData.roomId=t.id,f.userData.excludeFromDevicePicking=!0,f.userData.excludeFromCameraFit=!0,l.add(f)}));return l.children.length?{group:l,material:c,count:l.children.length}:(c.dispose(),{group:null,material:null,count:0})}function Hm(n,e,t){let i=new ct;i.name="DashboardLinearLightProjections";let s=null;for(let r of t.values()){let{visual:o}=r;if(r.kind!=="light"||!o?.light?.isRectAreaLight)continue;let a=bl(e,r.root.position);if(!a)continue;s??=cE();let c=Math.min(o.lightProfile.distance*.38,1.15),l=o.light.width+c,u=Math.min(o.lightProfile.distance*(o.lightProfile.projectionDepthScale??.92),o.lightProfile.projectionMaxDepth??3.2),h=new Qt({color:16777215,map:s,transparent:!0,opacity:0,blending:Wi,depthWrite:!1,toneMapped:!1,side:Ct,forceSinglePass:!0}),d=new nt(Yh(a,r.root.position,r.root.rotation.y,l,u),h);d.name=\`LinearLightProjection:\${r.id}\`,d.position.y=a.elevation+.006,d.visible=!1,d.renderOrder=2,d.userData.isLinearLightProjection=!0,d.userData.roomId=a.id,d.userData.excludeFromDevicePicking=!0,d.userData.excludeFromCameraFit=!0,i.add(d);let f=fE(n,e,a,r,l,u,t.values());f.group&&i.add(f.group),o.linearProjection={mesh:d,material:h,roomId:a.id,width:l,depth:u,receiverGroup:f.group,receiverMaterial:f.material,receiverCount:f.count}}return i.children.length&&n.add(i),{group:i,texture:s}}var Vm=.06;function pE(n){let e="#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )",t="#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",i=n.indexOf(e),s=n.indexOf(t,i);if(i<0||s<0)throw new Error("The Three.js lighting shader no longer exposes the expected spotlight block.");return\`\${n.slice(0,i)}\${n.slice(s)}\`}var mE=pE(et.lights_fragment_begin);function Gm(n){let e=n.onBeforeCompile;return n.onBeforeCompile=(t,i)=>{if(e.call(n,t,i),!t.fragmentShader.includes("#include <lights_fragment_begin>"))throw new Error("The room floor material cannot isolate local spotlights.");t.fragmentShader=t.fragmentShader.replace("#include <lights_fragment_begin>",mE)},n.customProgramCacheKey=()=>"mikonus-room-floor-without-spotlights-v1",n.userData.excludesLocalSpotLights=!0,n}function gE(n,e,t){let i=n.getWorldPosition(new D),s=e.getWorldPosition(new D).sub(i).normalize();return new en({uniforms:{lightColor:{value:new Ge(16777215)},lightPosition:{value:i},lightDirection:{value:s},distance:{value:t.distance},coneCos:{value:Math.cos(n.angle)},penumbraCos:{value:Math.cos(n.angle*(1-n.penumbra))},intensity:{value:0}},vertexShader:\`
      varying vec3 floorWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        floorWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    \`,fragmentShader:\`
      uniform vec3 lightColor;
      uniform vec3 lightPosition;
      uniform vec3 lightDirection;
      uniform float distance;
      uniform float coneCos;
      uniform float penumbraCos;
      uniform float intensity;
      varying vec3 floorWorldPosition;
      void main() {
        vec3 fromLight = floorWorldPosition - lightPosition;
        float lightDistance = length(fromLight);
        vec3 rayDirection = normalize(fromLight);
        float cone = smoothstep(coneCos, penumbraCos, dot(rayDirection, lightDirection));
        float normalizedDistance = lightDistance / max(distance, 0.001);
        float cutoff = pow(max(1.0 - pow(normalizedDistance, 4.0), 0.0), 2.0);
        float attenuation = cutoff / max(lightDistance * lightDistance, 0.08);
        float facing = max(-rayDirection.y, 0.0);
        float illumination = min(cone * attenuation * facing * intensity, 0.82);
        gl_FragColor = vec4(lightColor, illumination);
      }
    \`,transparent:!0,blending:Wi,depthTest:!0,depthWrite:!1,toneMapped:!1,side:Ct,forceSinglePass:!0})}function Wm(n,e,t){let i=new ct;i.name="DashboardRoomSpotProjections",n.updateWorldMatrix(!0,!0);for(let s of t.values()){let{visual:r}=s;if(s.kind!=="light"||!r?.light?.isSpotLight||!r.lightTarget)continue;let o=bl(e,s.root.position);if(!o)continue;s.root.updateWorldMatrix(!0,!0);let a=gE(r.light,r.lightTarget,r.lightProfile),c=new nt(Yh(o,s.root.position,s.root.rotation.y,1,1),a);c.name=\`RoomSpotProjection:\${s.id}\`,c.position.y=o.elevation+.007,c.visible=!1,c.renderOrder=2,c.userData.isRoomSpotProjection=!0,c.userData.roomId=o.id,c.userData.excludeFromDevicePicking=!0,c.userData.excludeFromCameraFit=!0,i.add(c),r.roomSpotProjection={mesh:c,material:a,roomId:o.id}}return i.children.length&&n.add(i),{group:i}}var xE=4,vE=512,Xm=Object.freeze({ceilingLight:Object.freeze({intensity:54,distance:5,inner:26,outer:76,priority:9}),pendantLight:Object.freeze({intensity:44,distance:4.8,inner:30,outer:78,priority:8}),pendantSpot1:Object.freeze({intensity:56,distance:4.2,inner:14,outer:44,priority:10}),pendantSpot2:Object.freeze({intensity:58,distance:4.8,inner:24,outer:70,priority:10}),pendantSpot3:Object.freeze({intensity:62,distance:5,inner:26,outer:78,priority:10}),pendantSpot4:Object.freeze({intensity:66,distance:5.2,inner:28,outer:84,priority:10}),pendantLED:Object.freeze({intensity:48,distance:4.6,inner:34,outer:82,priority:8,projectionOpacity:.44,receiverIntensity:.48,projectionDepthScale:.62,projectionMaxDepth:2.6}),floorLamp:Object.freeze({intensity:30,distance:4,inner:72,outer:124,priority:6}),tableLamp:Object.freeze({intensity:22,distance:2.8,inner:34,outer:82,priority:5}),wallLight:Object.freeze({intensity:38,distance:3.6,inner:26,outer:74,priority:7,direction:"forward"}),recessedSpot:Object.freeze({intensity:52,distance:4,inner:14,outer:42,priority:10}),ledStrip:Object.freeze({intensity:26,distance:2.8,inner:46,outer:104,priority:5})}),_E=Xm.ceilingLight;function $h(n){return n.reduce((e,t)=>e+t,0)/Math.max(n.length,1)}function qm(n,e,t,i){let s=Xm[e]??_E,r=i.filter(h=>h.role==="diffuser"),o=r.length>0?r:i,a=new D($h(o.map(h=>h.position[0])),$h(o.map(h=>h.position[1]+t/2)),$h(o.map(h=>h.position[2]))),c=s.direction==="forward"?new D(0,0,1):new D(0,-1,0);if(a.addScaledVector(c,.035),e==="ledStrip"||e==="pendantLED"){let h=r[0],d=Math.max(h?.size?.[0]??.1,.008),f=Math.max(h?.size?.[2]??.025,.008),p=new So(16777215,0,d,f);p.name=\`DashboardSmartLight:\${e}\`,p.position.copy(a),p.rotation.x=-Math.PI/2,p.castShadow=!1,p.visible=!1;let x={...s,intensity:s.intensity/f};return p.userData.smartLightProfile=x,p.userData.selectedForIllumination=!1,n.add(p),{light:p,target:null,profile:x}}let l=new Mo(16777215,0,s.distance,it.degToRad(s.outer/2),.68,2);l.name=\`DashboardSmartLight:\${e}\`,l.position.copy(a),l.castShadow=!1,l.shadow.mapSize.setScalar(vE),l.shadow.bias=-45e-5,l.shadow.normalBias=.025,l.shadow.camera.near=.03,l.shadow.camera.far=s.distance,l.shadow.camera.layers.set(Sr),l.userData.smartLightProfile=s,l.userData.selectedForIllumination=!1;let u=new Ut;return u.name=\`DashboardSmartLightTarget:\${e}\`,u.position.copy(a).add(c),l.target=u,n.add(l,u),{light:l,target:u,profile:s}}function jh(n,e=xE){let t=[...n.values()].filter(s=>s.kind==="light"&&s.visual?.type==="light"&&s.visual.lightState?.known&&s.visual.lightState.on&&s.visual.lightState.brightness>.001).sort((s,r)=>{let o=s.visual.lightProfile.priority+s.visual.lightState.brightness;return r.visual.lightProfile.priority+r.visual.lightState.brightness-o||s.id.localeCompare(r.id)}),i=new Set(t.slice(0,e).map(s=>s.id));for(let s of n.values()){if(s.kind!=="light"||s.visual?.type!=="light")continue;let{light:r,lightProfile:o,lightState:a}=s.visual,c=i.has(s.id);r.userData.selectedForIllumination=c,r.castShadow=c&&r.isSpotLight,r.intensity=c&&!r.isRectAreaLight?o.intensity*a.brightness**2:0;let l=s.visual.linearProjection;l&&(l.material.color.copy(r.color),l.material.opacity=c?(o.projectionOpacity??km)*a.brightness**1.25:0,l.mesh.visible=c,l.receiverMaterial&&(l.receiverMaterial.uniforms.lightColor.value.copy(r.color),l.receiverMaterial.uniforms.intensity.value=c?(o.receiverIntensity??zm)*a.brightness**1.25:0,l.receiverGroup.visible=c));let u=s.visual.roomSpotProjection;u&&(u.material.uniforms.lightColor.value.copy(r.color),u.material.uniforms.intensity.value=c?o.intensity*Vm*a.brightness**2:0,u.mesh.visible=c)}return i}var{DOLLHOUSE_WALL_HEIGHT:Jh,buildWallPanels:yE,collectWallOpenings:bE,joinedWallPanel:ME,resolveWallPresentation:SE,resolveWallJoinTopology:$m,roundedCornerFootprint:Zh,wallFrame:EE}=Ym.default,Un=Object.freeze({height:.055,overhang:.018,color:2434081}),wE=.075,bi={floor:15262682,wall:16250352,sofa:8559003,wood:11041109,darkWood:5588026,kitchen:14209736,counter:5988967,metal:9147029,rug:12101775,green:7901816,pot:10318422,hob:1975079,fridge:11449783,door:12094306,window:10405330,lampOff:14209724,lampOn:16766044,unavailable:9410201};function Ji(n){return n.layers.enable(Sr),n.castShadow=!0,n.userData.blocksLocalLight=!0,n}var TE={hob:{roughness:.35,metalness:.2},metal:{roughness:.6,metalness:.15},window:{roughness:.25,metalness:.08,transparent:!0,opacity:.62}};function AE(n,e={}){let t=TE[n]??{};return new wn({color:bi[n]??bi.wall,roughness:e.roughness??t.roughness??.82,metalness:e.metalness??t.metalness??0,transparent:e.transparent??t.transparent??!1,opacity:e.opacity??t.opacity??1})}function wr(n){return it.degToRad(n)}function It(n,e,t){n.userData.sceneObjectId=e.id,n.userData.sceneElementType=t,n.userData.kind=e.kind??t,n.userData.binding=e.binding??null}function CE(n,e="local"){if(e!=="longestBoundary"||n.length<2)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let t={x:1,z:0},i=0;if(n.forEach((o,a)=>{let c=n[(a+1)%n.length],l={x:c.x-o.x,z:c.z-o.z},u=l.x*l.x+l.z*l.z;u>i&&(t=l,i=u)}),i<=1e-6)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let s=Math.sqrt(i),r={x:t.x/s,z:t.z/s};return(r.x<-1e-4||Math.abs(r.x)<=1e-4&&r.z<0)&&(r={x:-r.x,z:-r.z}),{xAxis:r,zAxis:{x:-r.z,z:r.x}}}function RE(n,e,t){let i=t.map?.userData?.portablePattern,s=t.map?.userData?.meterPeriod;if(!i||!s)return null;let r=CE(e,i.orientation),o=n.getAttribute("position"),a=new Float32Array(o.count*2);for(let c=0;c<o.count;c+=1){let l=o.getX(c),u=o.getZ(c);a[c*2]=(l*r.xAxis.x+u*r.xAxis.z)/s.x,a[c*2+1]=(l*r.zAxis.x+u*r.zAxis.z)/s.z}return n.setAttribute("uv",new Jt(a,2)),r}function PE(n,e,t=yi()){let i=new En;e.polygon.forEach((c,l)=>{l===0?i.moveTo(c.x,-c.z):i.lineTo(c.x,-c.z)}),i.closePath();let s=new ys(i);s.rotateX(-Math.PI/2);let r=Gm(t.instance(e.material,{materialKey:"custom",baseColor:"#E8E3DA",roughness:.88,metallic:0,opacity:1})),o=RE(s,e.polygon,r),a=new nt(s,r);return a.position.y=e.elevation,a.userData.floorThickness=e.floorThickness,o&&(a.userData.floorPatternAlignment=o),It(a,e,"room"),n.add(a),a}function IE(n){let e=[...n.rooms.map(i=>i.elevation-wE/2),...n.walls.map(i=>i.baseY)].filter(Number.isFinite),t=e.length>0?Math.min(...e):0;return{...n,foundationBaseY:t,walls:n.walls.map(i=>({...i,authoredBaseY:i.baseY,baseY:t}))}}function jm(n,e,t){let i=n/2,s=e/2,r=Math.min(Math.max(t,.001),i,s),o=new En;return o.moveTo(-i+r,-s),o.lineTo(i-r,-s),o.quadraticCurveTo(i,-s,i,-s+r),o.lineTo(i,s-r),o.quadraticCurveTo(i,s,i-r,s),o.lineTo(-i+r,s),o.quadraticCurveTo(-i,s,-i,s-r),o.lineTo(-i,-s+r),o.quadraticCurveTo(-i,-s,-i+r,-s),o.closePath(),o}function DE(n,e){let t=Math.min(Un.height*.45,e*.22),i=new xi(jm(e,Un.height,t),{depth:n,bevelEnabled:!1,steps:1,curveSegments:5});return i.translate(0,0,-n/2),i.rotateY(Math.PI/2),i}function LE(n,e){let t={materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1},i=e.material(n.materials?.body,t),s=e.material(n.materials?.positiveSide,t),r=e.material(n.materials?.negativeSide,t);return{body:i,positive:s,negative:r,box:[i,i,i,i,s,r]}}function OE(n,e,t={doors:[],windows:[]},i,s=yi()){let r=EE(e),o=bE(t,e),a=yE(e,o),c=i??$m(t.walls??[e]),l=new ct;It(l,e,"wall"),l.userData.authoredBaseY=e.authoredBaseY??e.baseY,l.userData.foundationBaseY=e.baseY,l.userData.physicalHeight=e.height,l.userData.presentationHeight=Math.min(e.height,Jh),l.userData.lightOccluderPanels=[];let u=LE(e,s),h=new Qt({color:Un.color}),d=new Qt({color:0,colorWrite:!1,depthWrite:!1});for(let f of a){let p=ME(f,e,c),x=SE(p,e.height);l.userData.lightOccluderPanels.push(...x.lightOccluderPanels.map(S=>({...S})));let m=Math.abs(f.minimumOffset)<=.003,g=Math.abs(f.maximumOffset-r.length)<=.003,w=m&&c.joinedEndpoints.has(\`\${e.id}:start\`),b=g&&c.joinedEndpoints.has(\`\${e.id}:end\`),y=w?0:Un.overhang,T=b?0:Un.overhang;for(let S of x.visiblePanels){let C=new nt(new Vt(S.width,S.height,e.thickness),u.box);C.position.set(e.start.x+r.direction.x*S.centerOffset,e.baseY+S.centerY,e.start.z+r.direction.z*S.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.userData.wallPart="body",C.userData.physicalWallHeight=e.height,Ji(C),It(C,e,"wall");let _=S.width+y+T,A=new nt(DE(_,e.thickness+Un.overhang*2),h);A.position.set((T-y)/2,S.height/2+Un.height/2-Math.min(Un.height*.22,.012),0),A.userData.wallPart="cap",It(A,e,"wall"),C.add(A),l.add(C)}for(let S of x.lightOccluderPanels){let C=new nt(new Vt(S.width,S.height,e.thickness),d);C.name=\`PhysicalWallOccluder:\${e.id}\`,C.position.set(e.start.x+r.direction.x*S.centerOffset,e.baseY+S.centerY,e.start.z+r.direction.z*S.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.layers.set(Sr),C.castShadow=!0,C.receiveShadow=!1,C.userData.wallPart="physical-light-occluder",C.userData.isPhysicalLightOccluder=!0,C.userData.excludeFromCameraFit=!0,It(C,e,"wall"),l.add(C)}}return n.add(l),l}function Kh(n,e){let t=new En;n.forEach((s,r)=>{r===0?t.moveTo(s.x,-s.z):t.lineTo(s.x,-s.z)}),t.closePath();let i=new xi(t,{depth:e,bevelEnabled:!1,steps:1});return i.rotateX(-Math.PI/2),i}function NE(n,e,t=yi()){let i=[];for(let[s,r]of e.roundedCorners.entries()){let o=[r.first.wall,r.second.wall].sort((d,f)=>d.id.localeCompare(f.id))[0],a=new ct;a.name=\`rounded-wall-corner-\${s}\`,a.userData.roundedWallIds=[r.first.wall.id,r.second.wall.id],a.userData.physicalHeight=r.height,a.userData.presentationHeight=Math.min(r.height,Jh),It(a,o,"wall");let c=Math.min(r.height,Jh),l=new nt(Kh(Zh(r),c),t.material(o.materials?.body,{materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1}));l.position.y=r.elevation,l.userData.wallPart="rounded-corner-body",Ji(l),It(l,o,"wall");let u=new nt(Kh(Zh(r,Un.overhang),Un.height),new Qt({color:Un.color}));u.position.y=r.elevation+c-Math.min(Un.height*.22,.012),u.userData.wallPart="rounded-corner-cap",It(u,o,"wall"),a.add(l,u);let h=r.height-c;if(h>=.04){let d=new nt(Kh(Zh(r),h),new Qt({color:0,colorWrite:!1,depthWrite:!1}));d.name=\`PhysicalRoundedWallOccluder:\${s}\`,d.position.y=r.elevation+c,d.layers.set(Sr),d.castShadow=!0,d.receiveShadow=!1,d.userData.wallPart="physical-rounded-light-occluder",d.userData.isPhysicalLightOccluder=!0,d.userData.excludeFromCameraFit=!0,It(d,o,"wall"),a.add(d)}n.add(a),i.push(a)}return i}function FE(n,e){let{width:t,depth:i,height:s}=e.size,r;e.shape==="cylinder"?(r=new gi(.5,.5,s,18),r.scale(t,1,i)):e.shape==="ellipsoid"?(r=new vi(.5,18,12),r.scale(t,s,i)):r=new Vt(t,s,i);let o=new nt(r,AE(e.appearance));return o.position.set(e.position.x,e.position.y+s/2,e.position.z),o.rotation.y=wr(e.rotation.y),It(o,e,"object"),n.add(o),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:o,pickables:e.kind==="light"?[o]:[]}}function UE(n,e){let t=n.type==="box"?n.size:n.type==="sphere"?[n.radius]:n.type==="frustum"?[n.topRadius,n.bottomRadius,n.height]:[n.radius,n.height],i=\`\${n.type}:\${t.map(r=>Number(r).toFixed(6)).join(":")}\`;if(e.has(i))return e.get(i);let s;switch(n.type){case"box":s=new Vt(...n.size);break;case"sphere":s=new vi(n.radius,24,16);break;case"frustum":s=new gi(n.topRadius,n.bottomRadius,n.height,32,1,!0);break;default:s=new gi(n.radius,n.radius,n.height,24);break}return e.set(i,s),s}function BE(n,e,t=new Map){let i=e.visualType??(e.appearance==="table-lamp"?"tableLamp":"floorLamp"),s=Dm(i,e.size,e.parameters);if(!s)return console.warn(\`Mikonus light visual type \${i} is not supported; skipping \${e.id}.\`),null;let r=new ct;r.position.set(e.position.x,e.position.y,e.position.z),r.rotation.y=wr(e.rotation.y),It(r,e,"object");let{width:o,height:a,depth:c}=e.size,l=new wn({color:5984585,roughness:.62,metalness:.18}),u=new wn({color:bi.lampOff,emissive:0,emissiveIntensity:0,roughness:.45}),h=new wn({color:12819559,emissive:0,emissiveIntensity:0,roughness:.75,side:Ct}),d=[];for(let x of s){let m=x.role==="diffuser"?u:x.role==="shade"?h:l,g=new nt(UE(x,t),m);g.name=\`\${i}:\${x.name}\`,g.position.set(x.position[0],x.position[1]+a/2,x.position[2]),x.rotation&&g.rotation.set(...x.rotation),g.userData.recipePart=x.name,g.userData.lightRole=x.role,It(g,e,"object"),r.add(g),d.push(g)}let f=qm(r,i,a,s),p=[];if(e.binding){let x=new Qt({side:Ct});x.visible=!1;let m=new nt(new vi(1,12,8),x);m.position.y=a/2,m.scale.set(Math.max(o*.65,.24),Math.max(a*.5,.24),Math.max(c*.65,o*.65,.24)),m.userData.isPickProxy=!0,It(m,e,"object"),r.add(m),p.push(m,...d)}return n.add(r),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:r,pickables:p,visual:{type:"light",visualType:i,bulbMaterial:u,shadeMaterial:h,emissiveMaterials:[u],bodyMaterials:[l,h],light:f.light,lightTarget:f.target,lightProfile:f.profile,lightState:null}}}function kE(n,e,t,i){return e.kind==="light"?BE(n,e,i):e.assetKey?Im(n,e,t):FE(n,e)}function zE(n){let e=[],t=new Set;for(let i of n)if(i.binding){for(let s of i.pickables??[])t.has(s)||(t.add(s),e.push(s));i.root.traverse(s=>{!s.isMesh||t.has(s)||s.userData.excludeFromDevicePicking||(t.add(s),e.push(s))})}return e}function Er(n,e,t,i,s,r,o){let a=new nt(e,t);return a.position.set(...i),a.userData.architectureRole=o,It(a,s,r),n.add(a),a}function ko({parent:n,width:e,height:t,depth:i,thickness:s,material:r,description:o,elementType:a,role:c,offsetX:l=0,offsetY:u=0}){let h=new Vt(s,t,i),d=new Vt(e,s,i);return[Er(n,h,r,[l+s/2,u+t/2,0],o,a,c),Er(n,h,r,[l+e-s/2,u+t/2,0],o,a,c),Er(n,d,r,[l+e/2,u+s/2,0],o,a,c),Er(n,d,r,[l+e/2,u+t-s/2,0],o,a,c)]}function HE(n,e,t,i){let s=new xi(jm(n,e,i),{depth:t,bevelEnabled:!1,steps:1,curveSegments:5});return s.translate(0,0,-t/2),s.userData.cornerRadius=i,s}function VE(n,e,t,i=yi()){let s=new ct;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=wr(e.rotation.y),It(s,e,"door");let{width:r,depth:o,height:a}=e.size,c=Math.min(Math.max(Math.min(r,a)*.075,.025),.055),l=Math.max(o,.018)+.012,u=Math.max(t?.thickness??0,o,l),h=Math.min(c,.025),d=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),f={materialKey:"wood",baseColor:"#BBAA88",roughness:.86,metallic:0,opacity:1},p=i.material(e.materials?.frame,f),x=i.instance(e.materials?.panel,f),m=x.color.getHex(),g=new ct;g.name="DoorReveal",g.userData.architectureRole="door-reveal",It(g,e,"door"),ko({parent:g,width:r,height:a,depth:u,thickness:h,material:d,description:e,elementType:"door",role:"door-reveal"}).forEach(Ji),s.add(g);let b=new ct;b.name="DoorFrame",b.userData.architectureRole="door-frame",It(b,e,"door"),ko({parent:b,width:r,height:a,depth:l,thickness:c,material:p,description:e,elementType:"door",role:"door-frame"}).forEach(Ji),s.add(b);let T=new ct;T.name="DoorLeaf",T.userData.architectureRole="door-leaf-hinge",It(T,e,"door");let S=Er(T,HE(r,a,Math.max(o,.018),.008),x,[r/2,a/2,0],e,"door","door-leaf");return Ji(S),s.add(T),n.add(s),{id:e.id,elementType:"door",kind:"door",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:T,panelMaterial:x,frameMaterial:p,baseColor:m,stateMaterials:[{material:S.material,baseColor:m}],closedAngle:0,openAngle:wr(e.openAngle)}}}function GE(n,e,t,i=yi()){let s=new ct;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=wr(e.rotation.y),It(s,e,"window");let{width:r,depth:o,height:a}=e.size,c=Math.min(Math.max(Math.min(r,a)*.075,.025),.055),l=Math.max(o,.014)+.012,u=Math.max(t?.thickness??0,o,l),h=Math.min(c,.025),d=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),f=i.material(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),p=i.instance(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),x=i.instance(e.materials?.panel,{materialKey:"glass",baseColor:"#B8CCD1",roughness:.36,metallic:0,opacity:.3},{physical:!0,transmission:.22,depthWrite:!1,side:Ct});Object.assign(x,{depthWrite:!1,side:Ct});let m=x.color.getHex(),g=p.color.getHex(),w=new ct;w.name="WindowReveal",w.userData.architectureRole="window-reveal",It(w,e,"window"),ko({parent:w,width:r,height:a,depth:u,thickness:h,material:d,description:e,elementType:"window",role:"window-reveal"}).forEach(Ji),s.add(w);let y=new ct;y.name="WindowFrame",y.userData.architectureRole="window-frame",It(y,e,"window"),ko({parent:y,width:r,height:a,depth:l,thickness:c,material:f,description:e,elementType:"window",role:"window-frame"}).forEach(Ji),s.add(y);let S=new ct;S.name="WindowSash",S.userData.architectureRole="window-sash",It(S,e,"window");let C=c,_=Math.max(r-C*2,c),A=Math.max(a-C*2,c),I=Math.min(Math.max(c*.58,.014),.028),P=Math.max(o,.014)+.006,k=ko({parent:S,width:_,height:A,depth:P,thickness:I,material:p,description:e,elementType:"window",role:"window-sash-frame",offsetX:C,offsetY:C});k.forEach(Ji);let F=Math.max(_-I*2,.01),B=Math.max(A-I*2,.01),H=Er(S,new Vt(F,B,Math.min(Math.max(o,.008),.022)),x,[r/2,a/2,0],e,"window","window-glass");return H.renderOrder=1,s.add(S),n.add(s),{id:e.id,elementType:"window",kind:"window",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:S,panelMaterial:x,frameMaterial:f,baseColor:m,stateMaterials:[{material:x,baseColor:m},...k.map(X=>({material:X.material,baseColor:g}))],closedAngle:0,openAngle:wr(e.openAngle),size:{width:r,height:a,depth:o},glass:H}}}function Zm(n){let e=n.floors.find(i=>i.id===n.activeFloorId);if(!e)throw new Error(\`Active floor \${n.activeFloorId} does not exist.\`);let t=new io;try{let i=new ct;i.userData.sceneId=n.sceneId,i.userData.activeFloorId=e.id,t.add(i);let s=yi();e.rooms.forEach(g=>PE(i,g,s));let r=IE(e);i.userData.foundationBaseY=r.foundationBaseY;let o=$m(r.walls);r.walls.forEach(g=>OE(i,g,r,o,s)),NE(i,o,s);let a=Hh(),c=new Map,l=[...e.objects.map(g=>kE(i,g,a,c)),...e.doors.map(g=>VE(i,g,r.walls.find(w=>w.id===g.wallId),s)),...e.windows.map(g=>GE(i,g,r.walls.find(w=>w.id===g.wallId),s))].filter(Boolean),u=new Map(l.map(g=>[g.id,g])),h=l.flatMap(g=>g.pickables),d=zE(l),f=Lm(i,e,u),p=Hm(i,e,u),x=Wm(i,e,u),m=Bm(t,i);return m.contactShadows=f,m.linearLightProjections=p,m.roomSpotProjections=x,{scene:t,sceneRoot:i,activeFloor:e,entities:u,lighting:m,pickables:h,devicePickables:d}}catch(i){throw Ml(t),i}}function Ml(n){if(!n)return;let e=new Set,t=new Set,i=new Set,s=new Set;n.traverse(r=>{r.shadow?.map&&s.add(r.shadow.map),r.shadow?.mapPass&&s.add(r.shadow.mapPass),r.geometry&&e.add(r.geometry),(Array.isArray(r.material)?r.material:[r.material]).filter(Boolean).forEach(a=>{t.add(a),Object.values(a).forEach(c=>{c?.isTexture&&i.add(c)})})}),i.forEach(r=>r.dispose()),s.forEach(r=>r.dispose()),e.forEach(r=>r.dispose()),t.forEach(r=>r.dispose()),n.clear()}var WE=new Set(["room","wall","door","window"]),Qh=1.1,XE=.02,Tr=34,qE=.55,YE=2.5,ed=new D(0,1,0);function Km(n,e){let t=n.geometry?.getAttribute("position");if(!t)return;let i=new D;for(let s=0;s<t.count;s+=1)i.fromBufferAttribute(t,s).applyMatrix4(n.matrixWorld),e.push(i.clone())}function $E(n,e){n.updateWorldMatrix(!0,!0),n.traverse(t=>{t.isMesh&&Km(t,e)})}function Ho(n,e=new Map){let t=[];n.updateWorldMatrix(!0,!0),n.traverse(i=>{i.isMesh&&!i.userData.excludeFromCameraFit&&WE.has(i.userData.sceneElementType)&&Km(i,t)});for(let i of e.values()){if(i.visual?.type!=="contact")continue;let s=i.visual.motionRoot??i.root,r=s.rotation.y;for(let o of[i.visual.closedAngle,i.visual.closedAngle+i.visual.openAngle])s.rotation.y=o,$E(i.root,t);s.rotation.y=r,i.root.updateWorldMatrix(!0,!0)}return n.updateWorldMatrix(!0,!0),t}function jE(n){if(!n.length)return null;let e=new zt().setFromPoints(n);if(e.isEmpty())return null;let t=e.getSize(new D);return new D((e.min.x+e.max.x)/2,e.min.y+t.y*.25,(e.min.z+e.max.z)/2)}function ZE(n){let e=n.clone().normalize(),t=new Ms;return t.position.copy(e),t.up.copy(ed),t.lookAt(0,0,0),t.quaternion.clone()}function zo(n,e){if(!e.length)return null;n.updateMatrixWorld(!0),n.updateProjectionMatrix();let t=new D,i={minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0};for(let s of e)t.copy(s).project(n),i.minX=Math.min(i.minX,t.x),i.maxX=Math.max(i.maxX,t.x),i.minY=Math.min(i.minY,t.y),i.maxY=Math.max(i.maxY,t.y);return{...i,width:i.maxX-i.minX,height:i.maxY-i.minY,centerX:(i.minX+i.maxX)/2,centerY:(i.minY+i.maxY)/2,maximumAbsolute:Math.max(Math.abs(i.minX),Math.abs(i.maxX),Math.abs(i.minY),Math.abs(i.maxY))}}function Jm(n,e,t,i,s=Tr,r=Qh,o=n){let a=Math.max(i,.05),c=it.clamp(s,1,120),l=Math.tan(it.degToRad(c)/2),u=l*a,h=t.clone().invert(),d=n.map(y=>y.clone().sub(e).applyQuaternion(h)),f=o.map(y=>y.clone().sub(e).applyQuaternion(h)),p=KE(n,e,t,a,c,r),x=Math.max(...d.map(y=>y.z+.1),.1),m=p.distance,g=1/r,w=(y,T)=>{let S=1/0,C=-1/0,_=1/0,A=-1/0;for(let I of y){let P=T-I.z,k=I.x/(P*u),F=I.y/(P*l);S=Math.min(S,k),C=Math.max(C,k),_=Math.min(_,F),A=Math.max(A,F)}return{minX:S,maxX:C,minY:_,maxY:A}},b=y=>{let T=w(f,y),S=(T.minX+T.maxX)/2,C=(T.minY+T.maxY)/2,_=w(d,y);return Math.max(Math.abs(_.minX-S),Math.abs(_.maxX-S),Math.abs(_.minY-C),Math.abs(_.maxY-C))};for(;b(m)>g;)m*=1.5;for(let y=0;y<48;y+=1){let T=(x+m)/2;b(T)>g?x=T:m=T}return{distance:m,fovDegrees:c}}function Is(n,e){if(!n?.isPerspectiveCamera||!e.length)return null;n.view?.enabled?n.clearViewOffset():n.updateProjectionMatrix();let t=zo(n,e),i=2,s=i*n.aspect;return n.setViewOffset(s,i,t.centerX*n.aspect,-t.centerY,s,i),n.updateProjectionMatrix(),{ndcBounds:zo(n,e),rawBounds:t}}function KE(n,e,t,i,s=Tr,r=Qh){let o=Math.max(i,.05),a=it.clamp(s,1,120),c=Math.tan(it.degToRad(a)/2),l=c*o,u=t.clone().invert(),h=new D,d=0,f=-1/0;for(let p of n)h.copy(p).sub(e).applyQuaternion(u),f=Math.max(f,h.z),d=Math.max(d,h.z+Math.abs(h.x)*r/l,h.z+Math.abs(h.y)*r/c);return{distance:Math.max(d,f+.1,.1),fovDegrees:a}}function JE(n,e,t,i,{allowQuarterTurn:s=!0,centeringPoints:r=n,fovDegrees:o=Tr,padding:a=Qh,minimumImprovement:c=XE}={}){let l=[t.clone().normalize()];s&&l.push(t.clone().applyAxisAngle(ed,Math.PI/2).normalize());let u=l.map((h,d)=>{let f=ZE(h);return{...Jm(n,e,f,i,o,a,r),direction:h,orientationDegrees:d*90,quaternion:f}});return u[1]?.distance<u[0].distance*(1-c)?u[1]:u[0]}function QE(n,e){let t=0;for(let i of n)t=Math.max(t,i.distanceTo(e));return Math.max(t,1)}function td(n,e,t){let i=n.position.distanceTo(e),s=Math.max(.25,t*.08);return n.near=Math.max(.03,i-t-s),n.far=Math.max(n.near+1,i+t+s),n.updateProjectionMatrix(),{distance:i,far:n.far,near:n.near,radius:t}}function Qm(n,e,t,i,s,r={}){let o=r.centeringPoints?.length?r.centeringPoints:e,a=r.targetPoints?.length?r.targetPoints:o,c=jE(a);if(!c)return null;let l=r.fovDegrees??Tr,u=JE(e,c,s,i,{...r,centeringPoints:o,fovDegrees:l});n.aspect=Math.max(i,.05),n.fov=l,n.zoom=1,n.position.copy(c).addScaledVector(u.direction,u.distance),n.up.copy(ed),n.lookAt(c),n.updateMatrixWorld(!0);let h=QE([...t,...e],c),d=Math.max(u.distance*qE,h*1.05),f=Math.max(u.distance*YE,d*1.1),p=td(n,c,h),x=Is(n,o);return{...u,...p,maxDistance:f,minDistance:d,centeringBounds:x.ndcBounds,ndcBounds:zo(n,e),target:c}}function ew(n,e=1,t=.001){return n.minX>=-e-t&&n.maxX<=e+t&&n.minY>=-e-t&&n.maxY<=e+t}function e0(n,e,{worldPoints:t=[],centeringPoints:i=t,target:s=null,clippingPadding:r=1.02}={}){let o=i.length?Is(n,i):null,a=t.length?zo(n,t):null,c=a?ew(a):!1,l=s?n.position.distanceTo(s):0,u=Math.max(e,.05),h=l,d=!1;if(n.aspect=u,c&&s){let p=Jm(t,s,n.quaternion,u,n.fov,r,i);if(p.distance>l){let x=n.position.clone().sub(s).normalize();n.position.copy(s).addScaledVector(x,p.distance),n.lookAt(s),n.updateMatrixWorld(!0),h=p.distance,d=!0}}n.updateProjectionMatrix();let f=i.length?Is(n,i):null;return{distance:h,expandedForClipping:d,centeringBounds:f?.ndcBounds??null,ndcBounds:t.length?zo(n,t):null,previousBounds:a}}function tw(n){return 1-(1-n)**3}var Sl=class{constructor({camera:e,controls:t,requestRender:i,updateClipping:s=()=>{},onComplete:r=()=>{},isBlocked:o=()=>!1,delayMs:a=0,durationMs:c=700,setTimeoutFn:l=(f,p)=>window.setTimeout(f,p),clearTimeoutFn:u=f=>window.clearTimeout(f),requestAnimationFrameFn:h=f=>window.requestAnimationFrame(f),cancelAnimationFrameFn:d=f=>window.cancelAnimationFrame(f)}){this.camera=e,this.controls=t,this.requestRender=i,this.updateClipping=s,this.onComplete=r,this.isBlocked=o,this.delayMs=a,this.durationMs=c,this.setTimeoutFn=l,this.clearTimeoutFn=u,this.requestAnimationFrameFn=h,this.cancelAnimationFrameFn=d,this.homeView=null,this.timeoutId=null,this.animationFrameId=null}setHomeView({position:e,target:t}){this.homeView={position:e.clone(),target:t.clone()}}cancelTimer(){this.timeoutId!==null&&(this.clearTimeoutFn(this.timeoutId),this.timeoutId=null)}cancelAnimation(){this.animationFrameId!==null&&(this.cancelAnimationFrameFn(this.animationFrameId),this.animationFrameId=null)}cancel(){this.cancelTimer(),this.cancelAnimation()}schedule(){return this.cancelTimer(),this.delayMs<=0||!this.homeView||this.isBlocked()?!1:(this.timeoutId=this.setTimeoutFn(()=>{this.timeoutId=null,this.start()},this.delayMs),!0)}start(){if(this.cancelAnimation(),!this.homeView||this.isBlocked())return!1;let e=this.camera.position.clone(),t=this.controls.target.clone(),i=this.homeView.position,s=this.homeView.target;if(e.distanceToSquared(i)<1e-12&&t.distanceToSquared(s)<1e-12)return this.onComplete(),!1;let r=null,o=a=>{if(this.isBlocked()){this.animationFrameId=null;return}r??=a;let c=Math.min(Math.max((a-r)/this.durationMs,0),1),l=tw(c);if(this.camera.position.lerpVectors(e,i,l),this.controls.target.lerpVectors(t,s,l),this.camera.lookAt(this.controls.target),this.updateClipping(),this.requestRender(),c<1){this.animationFrameId=this.requestAnimationFrameFn(o);return}this.animationFrameId=null,this.controls.update(),this.onComplete()};return this.animationFrameId=this.requestAnimationFrameFn(o),!0}dispose(){this.cancel(),this.homeView=null}};function t0(n){return Array.isArray(n?.floors)?n.floors.map(e=>e.id):[]}function n0(n,e){let t=new Set(t0(n));return typeof e=="string"&&t.has(e)?e:typeof n?.defaultFloorId=="string"&&t.has(n.defaultFloorId)?n.defaultFloorId:t0(n)[0]??null}function i0(n,e,t){let i=n?.sceneId===e?t:null;return n0(n,i)}function wl(n,e){return\`mikonus.active-floor:\${typeof e=="string"&&e?e:"default"}:\${n}\`}var El=class{constructor({description:e,initialFloorId:t,createRuntime:i,disposeRuntime:s,maxCachedRuntimes:r=3}){if(!e||!Array.isArray(e.floors)||e.floors.length===0)throw new TypeError("DashboardFloorController requires at least one floor.");if(typeof i!="function"||typeof s!="function")throw new TypeError("DashboardFloorController requires runtime lifecycle callbacks.");if(!Number.isInteger(r)||r<1)throw new TypeError("maxCachedRuntimes must be a positive integer.");this.description=e,this.floorsById=new Map(e.floors.map(o=>[o.id,o])),this.createRuntime=i,this.disposeRuntime=s,this.maxCachedRuntimes=r,this.runtimes=new Map,this.activeFloorId=n0(e,t),this.activeRuntime=null}activate(e=this.activeFloorId){if(!this.floorsById.has(e))throw new RangeError(\`Floor \${String(e)} does not exist in the dashboard scene.\`);let t=this.runtimes.get(e),i=!t;if(t?this.runtimes.delete(e):t=this.createRuntime(e),!t)throw new Error(\`Floor runtime \${e} could not be created.\`);this.runtimes.set(e,t),this.activeFloorId=e,this.activeRuntime=t;let s=[];for(;this.runtimes.size>this.maxCachedRuntimes;){let r=this.runtimes.keys().next().value;if(r===this.activeFloorId)break;let o=this.runtimes.get(r);this.runtimes.delete(r),this.disposeRuntime(o),s.push(r)}return{created:i,evictedFloorIds:s,floorId:e,runtime:t}}get cachedFloorIds(){return[...this.runtimes.keys()]}get cachedRuntimes(){return[...this.runtimes.values()]}dispose(){for(let e of this.runtimes.values())this.disposeRuntime(e);this.runtimes.clear(),this.activeRuntime=null}};function nw(n,e,t){if(!Array.isArray(n)||n.length<=1)return"hidden";if(n.length>4)return"compact";let i=n.map(r=>Math.ceil(t(String(r.name??""))));return i.some(r=>r>112)?"compact":i.reduce((r,o)=>r+o+28,Math.max(n.length-1,0)*3)<=Math.max(Number(e)||0,0)?"segmented":"compact"}function iw(n){let t=n.ownerDocument.createElement("canvas").getContext("2d");return i=>{if(!t)return String(i).length*8;let s=getComputedStyle(n);return t.font=s.font||\`\${s.fontWeight} \${s.fontSize} \${s.fontFamily}\`,t.measureText(String(i)).width}}var Tl=class{constructor({host:e,onSelect:t,translate:i=(s,r)=>r}){if(!e||typeof t!="function")throw new TypeError("DashboardFloorSelector requires a host and selection callback.");this.host=e,this.hadHostClass=e.classList.contains("floor-selector"),e.classList.add("floor-selector"),this.onSelect=t,this.floors=[],this.activeFloorId=null,this.availableWidth=0,this.measureText=iw(e),this.translate=i,this.segments=e.ownerDocument.createElement("div"),this.segments.className="floor-selector-segments",this.segments.setAttribute("role","tablist"),this.segments.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.compact=e.ownerDocument.createElement("span"),this.compact.className="floor-selector-compact",this.select=e.ownerDocument.createElement("select"),this.select.className="floor-selector-select",this.select.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.chevron=e.ownerDocument.createElement("span"),this.chevron.className="floor-selector-chevron",this.chevron.setAttribute("aria-hidden","true"),this.chevron.textContent="\\u2304",this.compact.append(this.select,this.chevron),e.append(this.segments,this.compact),this.onCompactChange=()=>this.requestSelection(this.select.value),this.select.addEventListener("change",this.onCompactChange)}update({floors:e,activeFloorId:t,availableWidth:i}){this.floors=Array.isArray(e)?e:[],this.activeFloorId=t,this.availableWidth=Math.max(Number(i)||0,0),this.render()}layout(e){let t=Math.max(Number(e)||0,0);Math.abs(t-this.availableWidth)<1||(this.availableWidth=t,this.render())}requestSelection(e){!e||e===this.activeFloorId||this.onSelect(e)}render(){let e=nw(this.floors,this.availableWidth,this.measureText);if(this.host.hidden=e==="hidden",this.segments.hidden=e!=="segmented",this.compact.hidden=e!=="compact",this.host.dataset.mode=e,e==="hidden"){this.segments.replaceChildren(),this.select.replaceChildren();return}this.select.replaceChildren(...this.floors.map(i=>{let s=this.host.ownerDocument.createElement("option");return s.value=i.id,s.textContent=i.name,s})),this.select.value=this.activeFloorId;let t=this.floors.find(i=>i.id===this.activeFloorId);if(this.select.title=t?.name??"",e==="compact"){this.segments.replaceChildren();let i=this.measureText(t?.name??"")+56;this.compact.style.width=\`\${Math.min(this.availableWidth,Math.max(116,i))}px\`;return}this.segments.replaceChildren(...this.floors.map((i,s)=>{let r=this.host.ownerDocument.createElement("button"),o=i.id===this.activeFloorId;return r.type="button",r.className="floor-selector-segment",r.textContent=i.name,r.title=i.name,r.dataset.floorId=i.id,r.setAttribute("role","tab"),r.setAttribute("aria-selected",String(o)),r.tabIndex=o?0:-1,r.addEventListener("click",()=>this.requestSelection(i.id)),r.addEventListener("keydown",a=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(a.key))return;a.preventDefault();let l=s;a.key==="Home"?l=0:a.key==="End"?l=this.floors.length-1:a.key==="ArrowLeft"||a.key==="ArrowUp"?l=(s-1+this.floors.length)%this.floors.length:l=(s+1)%this.floors.length,[...this.segments.children].find(h=>h.dataset.floorId===this.floors[l].id)?.focus(),this.requestSelection(this.floors[l].id)}),r}))}dispose(){this.hadHostClass||this.host.classList.remove("floor-selector"),this.select.removeEventListener("change",this.onCompactChange),this.host.replaceChildren()}};var h0=kn(Qi()),{DEVICE_COMMAND:Mi,hasCleaningState:hw,hasClimateState:dw,hasCoverState:fw,hasPowerState:pw,isUsableCleaningState:mw,isUsableClimateState:gw,isUsableCoverState:xw,isUsablePowerState:l0}=h0.default;function u0(n,e,t){return e<=t*2?e/2:Math.min(Math.max(n,t),e-t)}function vw({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:o=4}){let a=Math.max(s/2+o,0),c=Math.max(r/2+o,0);return{left:u0(n,Math.max(t,0),a),top:u0(e,Math.max(i,0),c)}}function d0(n,e,t){return{left:n.left-e/2,right:n.left+e/2,top:n.top-t/2,bottom:n.top+t/2}}function _w(n,e,t){return e.reduce((i,s)=>{let r=Math.max(0,Math.min(n.right,s.right+t)-Math.max(n.left,s.left-t)),o=Math.max(0,Math.min(n.bottom,s.bottom+t)-Math.max(n.top,s.top-t));return i+r*o},0)}function yw(n,e,t){let i=Math.max(52,n*.58+t),s=Math.max(52,e+t),r=[{x:0,y:0}];for(let o=1;o<=3;o+=1){let a=i*o,c=s*o;r.push({x:0,y:-c},{x:0,y:c},{x:-a,y:0},{x:a,y:0},{x:-a,y:-c},{x:a,y:-c},{x:-a,y:c},{x:a,y:c})}return r}function nd({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:o=4,collisionGap:a=8,obstacles:c=[]}){let l=null,u=new Set;for(let h of yw(s,r,a)){let d=vw({left:n+h.x,top:e+h.y,width:t,height:i,controlWidth:s,controlHeight:r,edgePadding:o}),f=\`\${d.left.toFixed(3)}:\${d.top.toFixed(3)}\`;if(u.has(f))continue;u.add(f);let p=d0(d,s,r),x=_w(p,c,a),m=Math.hypot(d.left-n,d.top-e),g={position:d,rectangle:p,score:x,displacement:m};if(x===0)return g;(!l||x<l.score||x===l.score&&m<l.displacement)&&(l=g)}return l}function bw(n){return!!(n?.controls?.openCover||n?.controls?.closeCover||n?.controls?.stopCover||n?.controls?.setCoverPosition)}function Mw(n){return fw(n)&&bw(n)?"cover":dw(n)&&n?.controls?.setTargetTemperature?"climate":hw(n)&&[n?.controls?.startCleaning,n?.controls?.pauseCleaning,n?.controls?.stopCleaning,n?.controls?.returnToBase].some(Boolean)?"vacuum":pw(n)&&n?.controls?.setPower!==!1?"power":null}function f0(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function Sw(n,e){let t=n?.controls?.setTargetTemperature,i=n?.climate?.targetTemperature;if(!t||!Number.isFinite(i)||![-1,1].includes(e))return null;let s=Number.isFinite(t.min)?t.min:4,r=Number.isFinite(t.max)?t.max:35,o=Number.isFinite(t.step)&&t.step>0?t.step:.5,a=Math.min(Math.max(i+e*o,s),r);return Number(a.toFixed(f0(o)))}function Al(n){n.preventDefault(),n.stopPropagation()}var Vo=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.records=new Map,this.busyDeviceIds=new Set,this.bounds=new zt,this.anchor=new D,this.projected=new D,this.objectCenter=new D,this.objectProjected=new D,this.size=new D,this.layer=document.createElement("div"),this.layer.className="quick-controls-layer",this.layer.setAttribute("aria-label",this.translate("quickControls.label","Quick controls")),this.layer.hidden=!0,e.appendChild(this.layer)}prepareElement(e){for(let t of["pointerdown","pointerup","pointercancel"])e.addEventListener(t,Al);return e}createPowerRecord(e,t){let i=this.prepareElement(document.createElement("button"));return i.type="button",i.className="quick-control-chip",i.dataset.sceneObjectId=e,i.innerHTML='<span aria-hidden="true">&#x23FB;</span>',i.addEventListener("click",s=>{Al(s);let r=this.records.get(e)?.state;l0(r)&&this.onCommand(e,{type:Mi.SET_POWER,value:!r.power.isOn})}),{type:"power",element:i,entity:t,deviceId:null,state:null}}createCoverButton(e,t,i,s,r){let o=this.prepareElement(document.createElement("button"));o.type="button",o.className="quick-control-action",o.innerHTML=\`<span aria-hidden="true">\${s}</span>\`;let a=this.translate(t,i);return o.setAttribute("aria-label",a),o.title=a,o.addEventListener("click",c=>{Al(c),this.onCommand(e,{type:r})}),o}createCoverRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-cover",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.cover.open","Open cover","&#x2191;",Mi.OPEN_COVER),r=this.createCoverButton(e,"quickControls.cover.stop","Stop cover","&#x25A0;",Mi.STOP_COVER),o=this.createCoverButton(e,"quickControls.cover.close","Close cover","&#x2193;",Mi.CLOSE_COVER),a=document.createElement("span");return a.className="quick-control-value",a.setAttribute("aria-hidden","true"),i.append(s,r,o,a),{type:"cover",element:i,openButton:s,stopButton:r,closeButton:o,value:a,entity:t,deviceId:null,state:null}}createClimateButton(e,t,i,s,r){let o=this.prepareElement(document.createElement("button"));return o.type="button",o.className="quick-control-action",o.innerHTML=\`<span aria-hidden="true">\${r}</span>\`,o.dataset.labelKey=i,o.dataset.labelFallback=s,o.addEventListener("click",a=>{Al(a);let c=this.records.get(e)?.state,l=Sw(c,t);l!==null&&this.onCommand(e,{type:Mi.SET_TARGET_TEMPERATURE,value:l})}),o}createClimateRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-climate",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createClimateButton(e,-1,"quickControls.climate.decrease","Decrease target temperature","&#x2212;"),r=document.createElement("span");r.className="quick-control-temperature",r.setAttribute("aria-hidden","true");let o=this.createClimateButton(e,1,"quickControls.climate.increase","Increase target temperature","&#x2B;");return i.append(s,r,o),{type:"climate",element:i,decreaseButton:s,increaseButton:o,value:r,entity:t,deviceId:null,state:null}}createVacuumRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-vacuum",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.vacuum.start","Start cleaning","&#x25B6;",Mi.START_CLEANING),r=this.createCoverButton(e,"quickControls.vacuum.pause","Pause cleaning","&#x2016;",Mi.PAUSE_CLEANING),o=this.createCoverButton(e,"quickControls.vacuum.stop","Stop cleaning","&#x25A0;",Mi.STOP_CLEANING),a=this.createCoverButton(e,"quickControls.vacuum.return","Return to base","&#x2302;",Mi.RETURN_TO_BASE);return i.append(s,r,o,a),{type:"vacuum",element:i,startButton:s,pauseButton:r,stopButton:o,returnButton:a,entity:t,deviceId:null,state:null}}createRecord(e,t,i){let s=i==="cover"?this.createCoverRecord(e,t):i==="climate"?this.createClimateRecord(e,t):i==="vacuum"?this.createVacuumRecord(e,t):this.createPowerRecord(e,t);return this.layer.appendChild(s.element),this.records.set(e,s),s}updatePowerRecord(e,t,i){let s=t.power?.isOn===!0,r=l0(t);e.element.classList.toggle("is-on",s),e.element.classList.toggle("is-unavailable",!r),e.element.classList.toggle("is-busy",i),e.element.disabled=!r||i,e.element.setAttribute("aria-pressed",String(s));let o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),a=s?this.translate("quickControls.power.turnOff","Turn off"):this.translate("quickControls.power.turnOn","Turn on");e.element.setAttribute("aria-label",\`\${o}: \${a}\`),e.element.title=a}updateCoverRecord(e,t,i){let s=xw(t),r=t.controls??{},o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),a=typeof t.cover?.position=="number"?Math.round(t.cover.position*100):null;e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${o}: \${this.translate("quickControls.cover.label","Cover")}\`),e.value.textContent=a===null?"\\u2013":\`\${a}%\`,e.openButton.disabled=!s||i||!r.openCover,e.stopButton.disabled=!s||i||!r.stopCover,e.closeButton.disabled=!s||i||!r.closeCover}updateClimateRecord(e,t,i){let s=t.controls?.setTargetTemperature,r=t.climate?.targetTemperature,o=gw(t)&&s&&Number.isFinite(r),a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),c=t.climate?.unit??s?.unit??"\\xB0C",l=f0(s?.step??.5);e.element.classList.toggle("is-unavailable",!o),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${a}: \${this.translate("quickControls.climate.label","Climate")}\`),e.value.textContent=Number.isFinite(r)?\`\${r.toFixed(l)} \${c}\`:"\\u2013";let u=this.translate(e.decreaseButton.dataset.labelKey,e.decreaseButton.dataset.labelFallback),h=this.translate(e.increaseButton.dataset.labelKey,e.increaseButton.dataset.labelFallback);e.decreaseButton.setAttribute("aria-label",\`\${a}: \${u}\`),e.increaseButton.setAttribute("aria-label",\`\${a}: \${h}\`),e.decreaseButton.title=u,e.increaseButton.title=h,e.decreaseButton.disabled=!o||i||r<=s.min,e.increaseButton.disabled=!o||i||r>=s.max}updateVacuumRecord(e,t,i){let s=mw(t),r=t.controls??{},o=t.cleaning?.state??"unknown",a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device");e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${a}: \${this.translate("quickControls.vacuum.label","Robot vacuum")}\`),e.startButton.disabled=!s||i||!r.startCleaning||o==="cleaning",e.pauseButton.disabled=!s||i||!r.pauseCleaning||o!=="cleaning",e.stopButton.disabled=!s||i||!r.stopCleaning||["idle","docked"].includes(o),e.returnButton.disabled=!s||i||!r.returnToBase||["docked","returning"].includes(o)}updateRecord(e,t){e.state=t;let i=this.busyDeviceIds.has(e.deviceId);e.type==="cover"?this.updateCoverRecord(e,t,i):e.type==="climate"?this.updateClimateRecord(e,t,i):e.type==="vacuum"?this.updateVacuumRecord(e,t,i):this.updatePowerRecord(e,t,i)}sync({enabled:e,entities:t,bindings:i,statesByDeviceId:s}){if(this.layer.hidden=!e,!e){this.clear();return}let r=new Set;for(let o of t.values()){let a=i.get(o.id),c=s.get(a?.deviceId),l=Mw(c);if(!a?.deviceId||!l)continue;r.add(o.id);let u=this.records.get(o.id);u&&u.type!==l&&(u.element.remove(),this.records.delete(o.id),u=null),u??=this.createRecord(o.id,o,l),u.entity=o,u.deviceId=a.deviceId,this.updateRecord(u,c)}for(let[o,a]of this.records)r.has(o)||(a.element.remove(),this.records.delete(o))}setDeviceBusy(e,t){t?this.busyDeviceIds.add(e):this.busyDeviceIds.delete(e);for(let i of this.records.values())i.deviceId!==e||!i.state||this.updateRecord(i,i.state)}layout(e,t){if(this.layer.hidden)return[];let i=Math.max(t.clientWidth,1),s=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let r=[];for(let[l,u]of this.records){let h=u.entity.controlAnchor;h?(h.updateWorldMatrix(!0,!1),h.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):(u.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(u.entity.root)),!h&&this.bounds.isEmpty()?(u.entity.root.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):h||(this.bounds.getCenter(this.anchor),this.objectCenter.copy(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.28,this.size.y*.08)),this.projected.copy(this.anchor).project(e),this.objectProjected.copy(this.objectCenter).project(e);let d=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;if(u.element.hidden=!d,!d)continue;let f=u.element.offsetWidth||(u.type==="power"?44:146),p=u.element.offsetHeight||44;r.push({sceneObjectId:l,record:u,left:(this.projected.x*.5+.5)*i,top:(-this.projected.y*.5+.5)*s,controlWidth:f,controlHeight:p,objectRectangle:d0({left:(this.objectProjected.x*.5+.5)*i,top:(-this.objectProjected.y*.5+.5)*s},36,36)})}let o={power:0,climate:1,vacuum:1,cover:2};r.sort((l,u)=>(o[l.record.type]??3)-(o[u.record.type]??3)||l.top-u.top||l.left-u.left||l.sceneObjectId.localeCompare(u.sceneObjectId));let a=r.filter(({record:l})=>l.type==="power").map(({sceneObjectId:l,objectRectangle:u})=>({sceneObjectId:l,rectangle:u})),c=[];for(let l of r){let u=l.record.type==="power"?[]:a.filter(({sceneObjectId:d})=>d!==l.sceneObjectId).map(({rectangle:d})=>d),h=nd({left:l.left,top:l.top,width:i,height:s,controlWidth:l.controlWidth,controlHeight:l.controlHeight,obstacles:[...c,...u]});h&&(l.record.element.style.left=\`\${h.position.left}px\`,l.record.element.style.top=\`\${h.position.top}px\`,c.push(h.rectangle))}return c}clear(){for(let e of this.records.values())e.element.remove();this.records.clear(),this.busyDeviceIds.clear()}dispose(){this.clear(),this.layer.remove()}};var Ew=7,ww=520;var Cr=class{constructor({movementThreshold:e=Ew,longPressDelayMs:t=ww,onLongPress:i=()=>!1,schedule:s=(o,a)=>setTimeout(o,a),cancelSchedule:r=o=>clearTimeout(o)}={}){this.activePointers=new Map,this.candidate=null,this.movementThreshold=e,this.longPressDelayMs=t,this.onLongPress=i,this.schedule=s,this.cancelSchedule=r}cancelTimer(e=this.candidate){e?.timer!=null&&(this.cancelSchedule(e.timer),e.timer=null)}pointerDown({pointerId:e,clientX:t,clientY:i}){if(this.activePointers.set(e,{x:t,y:i}),this.activePointers.size!==1){this.candidate&&(this.candidate.moved=!0),this.cancelTimer();return}let s={pointerId:e,x:t,y:i,moved:!1,longPressFired:!1,timer:null};s.timer=this.schedule(()=>{s.timer=null,!(this.candidate!==s||s.moved||this.activePointers.size!==1)&&(s.longPressFired=this.onLongPress({clientX:s.x,clientY:s.y,pointerId:s.pointerId})===!0)},this.longPressDelayMs),this.candidate=s}pointerMove({pointerId:e,clientX:t,clientY:i}){!this.candidate||this.candidate.pointerId!==e||Math.hypot(t-this.candidate.x,i-this.candidate.y)<=this.movementThreshold||(this.candidate.moved=!0,this.cancelTimer())}pointerUp({pointerId:e,clientX:t,clientY:i}){let s=this.candidate;return this.activePointers.delete(e),!s||s.pointerId!==e||(this.cancelTimer(s),this.candidate=null,s.moved||s.longPressFired||this.activePointers.size>0)?null:{type:"tap",clientX:t,clientY:i,pointerId:e}}pointerCancel({pointerId:e}){this.activePointers.delete(e),this.candidate?.pointerId===e&&(this.cancelTimer(),this.candidate=null)}reset(){this.cancelTimer(),this.activePointers.clear(),this.candidate=null}dispose(){this.reset()}};function Tw(n,e,t,i=new ae){let s=t.getBoundingClientRect();return!(s.width>0)||!(s.height>0)?null:(i.x=(n-s.left)/s.width*2-1,i.y=-((e-s.top)/s.height)*2+1,i)}function p0({camera:n,canvas:e,clientX:t,clientY:i,pickables:s,pointer:r=new ae,raycaster:o=new Ss,scene:a=null}){let c=Tw(t,i,e,r);if(!c)return null;n.updateProjectionMatrix(),n.updateMatrixWorld(!0),a?.updateMatrixWorld(!0),o.setFromCamera(c,n);let l=o.intersectObjects(s??[],!1).find(u=>u.object.userData.sceneObjectId);return l?{intersection:l,sceneObjectId:l.object.userData.sceneObjectId}:null}function m0(n){if(!n||typeof n!="object")return[];let e=[];n.power&&!n.cleaning&&e.push("power"),n.light&&n.controls?.setBrightness&&e.push("brightness"),n.light&&n.controls?.setColorTemperature&&e.push("colorTemperature"),n.light&&n.controls?.setColor===!0&&e.push("color"),n.contact&&e.push("contact"),n.cover&&e.push("cover"),n.climate&&e.push("climate"),n.activity&&e.push("activity"),n.safety&&e.push("safety"),n.fan&&e.push("fan"),Array.isArray(n.environment)&&n.environment.length>0&&e.push("environment"),Array.isArray(n.energy)&&n.energy.length>0&&e.push("energy");let t=n.health?.alerts?.some(i=>i.active===!0)===!0;return n.health&&(!n.cleaning||t)&&e.push("health"),n.cleaning&&e.push("cleaning"),n.lock&&e.push("lock"),e}function g0({entityId:n,binding:e,state:t}){return typeof n!="string"||!n||typeof e?.provider!="string"||!e.provider||typeof e?.deviceId!="string"||!e.deviceId?null:{entityId:n,provider:e.provider,targetId:e.deviceId,bindingCapability:e.capability??null,capabilities:m0(t),state:t??null}}var Cl=class{constructor({adapters:e={},onOpenChange:t=()=>{}}={}){this.adapters=new Map(Object.entries(e)),this.onOpenChange=t,this.active=null}open(e){if(!e||typeof e.provider!="string")return!1;let t=this.adapters.get(e.provider);return!t||typeof t.open!="function"||(this.close(),t.open(e,{onClose:()=>this.handleAdapterClose(t)})===!1)?!1:(this.active={adapter:t,context:e},this.onOpenChange(!0,e),!0)}handleAdapterClose(e){this.active?.adapter===e&&(this.active=null,this.onOpenChange(!1,null))}updateState(e,t){if(!this.active||this.active.context.targetId!==e)return!1;let i={...this.active.context,capabilities:m0(t),state:t};return this.active.context=i,this.active.adapter.update?.(i),!0}setBusy(e,t){return!this.active||this.active.context.targetId!==e?!1:(this.active.adapter.setBusy?.(!!t),!0)}close(){if(!this.active)return;let{adapter:e}=this.active;this.active=null,e.close?.(),this.onOpenChange(!1,null)}dispose(){let e=!!this.active;this.active=null;for(let t of new Set(this.adapters.values()))t.dispose?.();this.adapters.clear(),e&&this.onOpenChange(!1,null)}};var v0=kn(Qi()),{DEVICE_COMMAND:Yt}=v0.default;function x0(n,e){return n?.values?.some(t=>t.id===e)===!0}function Si(n,e){if(n?.availability!=="available"||!e)return!1;switch(e.type){case Yt.SET_POWER:return n.controls?.setPower===!0&&typeof e.value=="boolean";case Yt.SET_BRIGHTNESS:return!!n.controls?.setBrightness&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case Yt.SET_COLOR:return n.controls?.setColor===!0&&Number.isFinite(e.value?.hue)&&e.value.hue>=0&&e.value.hue<=1&&Number.isFinite(e.value?.saturation)&&e.value.saturation>=0&&e.value.saturation<=1;case Yt.SET_COLOR_TEMPERATURE:return!!n.controls?.setColorTemperature&&Number.isFinite(e.value)&&e.value>=n.controls.setColorTemperature.min&&e.value<=n.controls.setColorTemperature.max;case Yt.OPEN_COVER:return n.controls?.openCover===!0;case Yt.CLOSE_COVER:return n.controls?.closeCover===!0;case Yt.STOP_COVER:return n.controls?.stopCover===!0;case Yt.SET_COVER_POSITION:return!!n.controls?.setCoverPosition&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case Yt.SET_TARGET_TEMPERATURE:{let t=n.controls?.setTargetTemperature;return!!t&&Number.isFinite(e.value)&&e.value>=t.min&&e.value<=t.max}case Yt.SET_THERMOSTAT_MODE:return x0(n.controls?.setThermostatMode,e.value);case Yt.SET_FAN_SPEED:return!!n.controls?.setFanSpeed&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case Yt.SET_FAN_MODE:return x0(n.controls?.setFanMode,e.value);case Yt.SET_TARGET_HUMIDITY:return!!n.controls?.setTargetHumidity&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case Yt.START_CLEANING:return n.controls?.startCleaning===!0;case Yt.PAUSE_CLEANING:return n.controls?.pauseCleaning===!0;case Yt.STOP_CLEANING:return n.controls?.stopCleaning===!0;case Yt.RETURN_TO_BASE:return n.controls?.returnToBase===!0;case Yt.LOCK:return n.controls?.lock===!0;case Yt.UNLOCK:return n.controls?.unlock===!0;default:return!1}}var y0=kn(Qi()),{DEVICE_COMMAND:_0}=y0.default,Go=class{constructor({document:e=globalThis.document,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.interacting=!1,this.disposed=!1,this.element=e.createElement("div"),this.element.className="device-details-cover-position";let s=o=>{let a=e.createElement("div");a.className="device-details-range-label";let c=e.createElement("span");c.textContent=o;let l=e.createElement("span");return l.className="device-details-range-value",a.append(c,l),this.element.append(a),l};this.current=s(i("deviceDetails.position","Position"));let r=i("deviceDetails.targetPosition","Target position");this.target=s(r),this.slider=e.createElement("input"),this.slider.className="device-details-range device-details-cover-range",this.slider.type="range",this.slider.min="0",this.slider.max="100",this.slider.setAttribute("aria-label",r),this.element.append(this.slider),this.slider.addEventListener("pointerdown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("keydown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("input",()=>this.showTarget()),this.slider.addEventListener("change",()=>{this.interacting=!1;let o={type:_0.SET_COVER_POSITION,value:Number(this.slider.value)/100};!this.disposed&&!this.slider.disabled&&Si(this.state,o)&&this.onCommand(o)}),this.slider.addEventListener("pointerup",()=>{this.interacting=!1}),this.slider.addEventListener("keyup",()=>{this.interacting=!1}),this.slider.addEventListener("blur",()=>{this.interacting=!1}),this.slider.addEventListener("pointercancel",()=>{this.interacting=!1,this.update(this.state,this.busy)})}showTarget(){let e=Number(this.slider.value);this.target.textContent=\`\${e}%\`,this.slider.style.setProperty("--range-progress",\`\${e}%\`),this.slider.setAttribute("aria-valuetext",\`\${e}%\`)}update(e,t=!1,i=null){this.state=e,this.busy=t;let s=e?.cover?.position,r=Number.isFinite(s)&&s>=0&&s<=1;if(this.current.textContent=r?\`\${Math.round(s*100)}%\`:"\\u2013",this.slider.disabled=t||!r||!Si(e,{type:_0.SET_COVER_POSITION,value:s}),this.slider.step=String(Math.max(1,Math.round((e?.controls?.setCoverPosition?.step??.01)*100))),this.slider.disabled&&(this.interacting=!1),!this.interacting){let o=Number.isFinite(i)?i:s;this.slider.value=String(r?Math.round(o*100):0),this.showTarget(),r||(this.target.textContent="\\u2013")}}dispose(){this.disposed=!0,this.interacting=!1,this.slider.disabled=!0,this.element.remove()}};var E0=kn(Qi());var b0=Object.freeze({capture:!0,passive:!1});function Rl(n){let e=n.style.touchAction,t=i=>{i.cancelable&&i.preventDefault()};return n.style.touchAction="none",n.addEventListener("touchmove",t,b0),()=>{n.removeEventListener("touchmove",t,b0),n.style.touchAction=e}}var{DEVICE_COMMAND:Bt}=E0.default,Aw=Object.freeze(["#ffffff","#ff9138","#ffd400","#0bc9bd","#49c7ef","#1594e8","#d735e5","#ff3d63"]),Cw=700,Pr=Object.freeze({width:300,height:210,centerX:150,centerY:133,startDegrees:155,sweepDegrees:230});function Rw(n){return Number.isFinite(n)?Math.round(Math.min(Math.max(n,0),1)*100):null}function Yn(n,e,t){return Math.min(Math.max(n,e),t)}function M0(n){if(!Number.isFinite(n?.hue)||!Number.isFinite(n?.saturation))return"#ffffff";let e=(n.hue%1+1)%1,t=Yn(n.saturation,0,1),i=e*6,s=Math.floor(i),r=i-s,o=1-t,a=1-r*t,c=1-(1-r)*t,[l,u,h]=[[1,c,o],[a,1,o],[o,1,c],[o,a,1],[c,o,1],[1,o,a]][s%6];return\`#\${[l,u,h].map(d=>Math.round(d*255).toString(16).padStart(2,"0")).join("")}\`}function Pw(n){if(typeof n!="string"||!/^#[0-9a-f]{6}$/i.test(n))return null;let e=Number.parseInt(n.slice(1,3),16)/255,t=Number.parseInt(n.slice(3,5),16)/255,i=Number.parseInt(n.slice(5,7),16)/255,s=Math.max(e,t,i),r=Math.min(e,t,i),o=s-r,a=0;return o>0&&(s===e?a=(t-i)/o%6:s===t?a=(i-e)/o+2:a=(e-t)/o+4,a=(a/6+1)%1),{hue:a,saturation:s===0?0:o/s}}function w0(n){let e=Number.isFinite(n?.hue)?(n.hue%1+1)%1:0,t=Number.isFinite(n?.saturation)?Yn(n.saturation,0,1):0;return{hue:e,saturation:t}}function Iw(n){let e=w0(n),t=e.hue*Math.PI*2,i=e.saturation*45;return{left:50+Math.cos(t)*i,top:50+Math.sin(t)*i}}function Dw(n,e,t,i){if(![n,e,t,i].every(Number.isFinite)||t<=0||i<=0)return null;let s=t/2,r=i/2,o=n-s,a=e-r,c=Math.min(t,i)/2;return{hue:(Math.atan2(a,o)/(Math.PI*2)+1)%1,saturation:Yn(Math.hypot(o,a)/c,0,1)}}function Lw(n,e,t){return![n,e,t].every(Number.isFinite)||t<=e?0:Yn((n-e)/(t-e)*100,0,100)}function Rr(n,e,t,i){n.style.setProperty("--range-progress",\`\${Lw(e,t,i)}%\`)}function Pl(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function Il(n){let e=Number.isFinite(n?.min)?n.min:4,t=Number.isFinite(n?.max)&&n.max>e?n.max:35,i=Number.isFinite(n?.step)&&n.step>0?n.step:.5;return{minimum:e,maximum:t,step:i}}function rd(n,e){if(!Number.isFinite(n))return null;let{minimum:t,maximum:i,step:s}=Il(e),r=t+Math.round((n-t)/s)*s,o=Math.max(Pl(t),Pl(i),Pl(s));return Number(Yn(r,t,i).toFixed(o))}function Ow(n,e){if(!Number.isFinite(n))return 0;let{minimum:t,maximum:i}=Il(e);return Yn((n-t)/(i-t),0,1)}function id(n,e=100){let t=Pr,i=(t.startDegrees+Yn(n,0,1)*t.sweepDegrees)*Math.PI/180;return{x:t.centerX+Math.cos(i)*e,y:t.centerY+Math.sin(i)*e}}function Nw(n,e,t){if(![n,e].every(Number.isFinite))return null;let i=Pr,s=Math.atan2(e-i.centerY,n-i.centerX)*180/Math.PI;s<0&&(s+=360),s<i.startDegrees&&(s+=360);let r=s-i.startDegrees;r>i.sweepDegrees&&(r=n<i.centerX?0:i.sweepDegrees);let{minimum:o,maximum:a}=Il(t);return rd(o+r/i.sweepDegrees*(a-o),t)}function S0(n,e){if(!Number.isFinite(n))return"\\u2013";let t=Math.max(0,Pl(e));return n.toFixed(t)}var od=class{constructor({delay:e=Cw,onCommit:t,setTimer:i=(r,o)=>globalThis.setTimeout(r,o),clearTimer:s=r=>globalThis.clearTimeout(r)}){this.delay=e,this.onCommit=t,this.setTimer=i,this.clearTimer=s,this.timer=null,this.value=null}get pending(){return this.timer!==null}cancel(){return this.timer===null?!1:(this.clearTimer(this.timer),this.timer=null,this.value=null,!0)}schedule(e){this.cancel(),this.value=e;let t=null;t=this.setTimer(()=>{if(this.timer!==t)return;let i=this.value;this.timer=null,this.value=null,this.onCommit?.(i)},this.delay),this.timer=t}dispose(){this.cancel()}};function De(n,e,t=null){let i=document.createElement(n);return e&&(i.className=e),t!==null&&(i.textContent=t),i}function sd(n,e={}){let t=document.createElementNS("http://www.w3.org/2000/svg",n);for(let[i,s]of Object.entries(e))t.setAttribute(i,String(s));return t}function Fw(n){n.stopPropagation()}var Wo=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.context=null,this.busy=!1,this.onClose=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureCommit=new od({onCommit:r=>{!r||this.layer.hidden||this.context?.entityId!==r.entityId||(this.setTargetTemperaturePendingVisual(!1),this.send({type:Bt.SET_TARGET_TEMPERATURE,value:r.value}))}}),this.layer=De("div","device-details-layer"),this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.panel=De("section","device-details-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","true"),this.panel.setAttribute("aria-labelledby","device-details-title"),this.panel.setAttribute("tabindex","-1");let s=De("header","device-details-header");this.title=De("h2","device-details-title"),this.title.id="device-details-title",this.closeButton=De("button","device-details-close","\\xD7"),this.closeButton.type="button",this.closeButton.addEventListener("click",()=>this.close()),s.append(this.title,this.closeButton),this.body=De("div","device-details-body"),this.panel.append(s,this.body),this.layer.appendChild(this.panel),e.appendChild(this.layer),this.onLayerClick=r=>{r.target===this.layer&&this.close()},this.onKeyDown=r=>{r.key==="Escape"&&!this.layer.hidden&&this.close()},this.layer.addEventListener("click",this.onLayerClick);for(let r of["pointerdown","pointermove","pointerup","pointercancel"])this.layer.addEventListener(r,Fw);document.addEventListener("keydown",this.onKeyDown)}text(e,t){return this.translate(\`deviceDetails.\${e}\`,t)}open(e,{onClose:t=null}={}){globalThis.getSelection?.()?.removeAllRanges(),this.resetTargetTemperatureInteraction(),this.coverPositionDraft=null,this.context=e,this.busy=!1,this.onClose=t,this.render(),this.layer.hidden=!1,this.layer.setAttribute("aria-hidden","false"),this.panel.focus({preventScroll:!0})}update(e){if(this.layer.hidden||e.targetId!==this.context?.targetId)return;let t=this.targetTemperatureDraft,i=e.state?.climate?.targetTemperature;t?.entityId===e.entityId&&Number.isFinite(i)&&Math.abs(i-t.value)<1e-6&&(this.targetTemperatureCommit.cancel(),this.targetTemperatureDraft=null),this.coverPositionDraft?.entityId===e.entityId&&e.state?.cover?.position===this.coverPositionDraft.value&&(this.coverPositionDraft=null),this.context=e,!(this.coverPositionControl?.interacting&&(this.coverPositionControl.update(e.state,this.busy),this.coverPositionControl.interacting))&&this.render()}setBusy(e){this.layer.hidden||this.busy===e||(this.busy=e,this.render())}close({notify:e=!0}={}){if(this.layer.hidden)return;let t=this.onClose;this.resetTargetTemperatureInteraction(),this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.coverPositionDraft=null,this.coverPositionHadFocus=!1,this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.context=null,this.busy=!1,this.onClose=null,e&&t?.()}resetTargetTemperatureInteraction(){this.targetTemperatureCommit.cancel(),this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null}setTargetTemperaturePendingVisual(e){this.targetTemperaturePendingIndicator&&(this.targetTemperaturePendingIndicator.hidden=!e),this.targetTemperatureDial?.classList.toggle("is-pending",e)}cancelTargetTemperatureCommit(){this.targetTemperatureCommit.cancel(),this.setTargetTemperaturePendingVisual(!1)}scheduleTargetTemperatureCommit(e){if(!this.context||!Number.isFinite(e))return;let t=this.context.state?.climate?.targetTemperature;if(Number.isFinite(t)&&Math.abs(t-e)<1e-6){this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null;return}let i={entityId:this.context.entityId,value:e};this.targetTemperatureDraft=i,this.targetTemperatureCommit.schedule(i),this.setTargetTemperaturePendingVisual(!0)}createSection(e,t=""){let i=De("section",\`device-details-section\${t?\` \${t}\`:""}\`);return i.appendChild(De("h3","device-details-section-title",e)),this.body.appendChild(i),i}appendValue(e,t,i){let s=De("div","device-details-value-row");s.append(De("span","device-details-value-label",t),De("span","device-details-value",i)),e.appendChild(s)}capabilityLabel(e,t=null){if(typeof t=="string"&&t.trim())return t.trim();let s={alarm_motion:"Motion",alarm_presence:"Presence",alarm_occupancy:"Occupancy",alarm_smoke:"Smoke",alarm_fire:"Fire",alarm_co:"Carbon monoxide",alarm_gas:"Gas",alarm_water:"Water",alarm_moisture:"Moisture",alarm_heat:"Heat",measure_temperature:"Temperature",measure_humidity:"Humidity",measure_luminance:"Illuminance",measure_aqi:"Air quality index",measure_co2:"CO\\u2082",measure_pm25:"PM2.5",measure_tvoc:"TVOC",measure_pressure:"Pressure",measure_noise:"Noise",measure_power:"Power",meter_power:"Energy",measure_current:"Current",measure_voltage:"Voltage",meter_gas:"Gas meter",meter_water:"Water meter",alarm_battery:"Battery warning",alarm_connectivity:"Connectivity warning"}[e]??e;return this.text(\`capability.\${e}\`,s)}appendEnumControl(e,t,i,s,r){if(!s||!Array.isArray(s.values)||s.values.length===0){typeof i=="string"&&i&&this.appendValue(e,t,i);return}let o=De("div","device-details-choice-row");o.appendChild(De("span","device-details-value-label",t));let a=De("div","device-details-choices");for(let c of s.values){let l=De("button","device-details-choice",c.label??c.id);l.type="button",l.disabled=this.busy||this.context?.state?.availability!=="available",l.classList.toggle("is-selected",c.id===i),l.setAttribute("aria-pressed",String(c.id===i)),l.addEventListener("click",()=>this.send({type:r,value:c.id})),a.appendChild(l)}o.appendChild(a),e.appendChild(o)}appendNormalizedRange(e,{label:t,value:i,control:s,commandType:r}){let o=Number.isFinite(i)?Math.round(Yn(i,0,1)*100):null,a=De("span","device-details-range-value",o===null?"\\u2013":\`\${o}%\`),c=De("div","device-details-range-label");c.append(De("span",null,t),a);let l=De("input","device-details-range");l.type="range",l.min="0",l.max="100",l.step=String(Math.max(1,Math.round((s?.step??.01)*100))),l.value=String(o??0),l.disabled=this.busy||this.context?.state?.availability!=="available"||o===null||!s,l.setAttribute("aria-label",t),Rr(l,o??0,0,100),l.addEventListener("input",()=>{a.textContent=\`\${l.value}%\`,Rr(l,Number(l.value),0,100)}),l.addEventListener("change",()=>this.send({type:r,value:Number(l.value)/100})),e.append(c,l)}createAction(e,t,i,s=!0){let r=De("button","device-details-action");return r.type="button",r.disabled=this.busy||!s||this.context?.state?.availability!=="available",r.setAttribute("aria-label",e),r.title=e,r.append(De("span","device-details-action-symbol",t),De("span","device-details-action-label",e)),r.addEventListener("click",()=>this.send(i)),r}send(e){!this.context||this.busy||this.onCommand(this.context.entityId,e)}renderPower(e){let t=e.power?.isOn===!0,i=e.availability==="available"&&typeof e.power?.isOn=="boolean",s=this.createSection(this.text("power","Power")),r=De("button",\`device-details-toggle\${t?" is-on":""}\`);r.type="button",r.disabled=this.busy||!i||e.controls?.setPower!==!0,r.setAttribute("aria-pressed",String(t));let o=t?this.text("on","On"):this.text("off","Off");r.setAttribute("aria-label",\`\${this.text("power","Power")}: \${o}\`),r.append(De("span","device-details-toggle-label",o),De("span","device-details-toggle-indicator")),r.addEventListener("click",()=>this.send({type:Bt.SET_POWER,value:!t})),s.appendChild(r)}renderBrightness(e){let t=this.createSection(this.text("brightness","Brightness")),i=Rw(e.light?.brightness),s=De("span","device-details-range-value",i===null?"\\u2013":\`\${i}%\`),r=De("div","device-details-range-label");r.append(De("span",null,this.text("brightness","Brightness")),s);let o=De("input","device-details-range device-details-brightness-range");o.type="range",o.min="0",o.max="100",o.step=String(Math.max(1,Math.round((e.controls.setBrightness.step??.01)*100))),o.value=String(i??0),o.disabled=this.busy||e.availability!=="available"||i===null,o.setAttribute("aria-label",this.text("brightness","Brightness")),Rr(o,i??0,0,100),o.addEventListener("input",()=>{s.textContent=\`\${o.value}%\`,Rr(o,Number(o.value),0,100)}),o.addEventListener("change",()=>this.send({type:Bt.SET_BRIGHTNESS,value:Number(o.value)/100})),t.append(r,o)}renderColorTemperature(e){let t=e.controls?.setColorTemperature,i=Number.isFinite(t?.min)?t.min:2e3,s=Number.isFinite(t?.max)?t.max:6500,r=Number.isFinite(t?.step)&&t.step>0?t.step:50,o=Number.isFinite(e.light?.colorTemperatureKelvin)?Yn(e.light.colorTemperatureKelvin,i,s):null,a=this.createSection(this.text("colorTemperature","Color temperature")),c=De("span","device-details-range-value",o===null?"\\u2013":\`\${Math.round(o)} K\`),l=De("div","device-details-range-label");l.append(De("span",null,this.text("colorTemperature","Color temperature")),c);let u=De("input","device-details-range device-details-temperature-range");u.type="range",u.min=String(i),u.max=String(s),u.step=String(r),u.value=String(o??(i+s)/2),u.disabled=this.busy||e.availability!=="available"||!t,u.setAttribute("aria-label",this.text("colorTemperature","Color temperature")),Rr(u,o??(i+s)/2,i,s),u.addEventListener("input",()=>{c.textContent=\`\${Math.round(Number(u.value))} K\`,Rr(u,Number(u.value),i,s)}),u.addEventListener("change",()=>this.send({type:Bt.SET_COLOR_TEMPERATURE,value:Number(u.value)})),a.append(l,u)}renderColor(e){let t=this.createSection(this.text("color","Color")),i=!this.busy&&e.availability==="available",s=w0(e.light?.color),r=De("button","device-details-color-wheel");r.type="button",r.disabled=!i,r.setAttribute("aria-label",this.text("selectColor","Select color"));let o=De("span","device-details-color-wheel-marker");o.setAttribute("aria-hidden","true"),r.appendChild(o);let a=De("div","device-details-color-presets-label",this.text("presets","Presets")),c=De("div","device-details-color-presets"),l=Aw.map(f=>{let p=Pw(f),x=De("button","device-details-color-preset");return x.type="button",x.disabled=!i,x.style.setProperty("--preset-color",f),x.setAttribute("aria-label",\`\${this.text("selectColor","Select color")}: \${f}\`),x.addEventListener("click",()=>{s=p,u(),this.send({type:Bt.SET_COLOR,value:p})}),c.appendChild(x),{button:x,color:p}}),u=()=>{let f=Iw(s);o.style.left=\`\${f.left}%\`,o.style.top=\`\${f.top}%\`,o.style.background=M0(s),r.setAttribute("aria-valuetext",M0(s));for(let p of l){let x=Math.abs(p.color.saturation-s.saturation),m=Math.min(Math.abs(p.color.hue-s.hue),1-Math.abs(p.color.hue-s.hue)),g=x<.025&&(s.saturation<.025||m<.0125);p.button.classList.toggle("is-selected",g),p.button.setAttribute("aria-pressed",String(g))}},h=f=>{let p=r.getBoundingClientRect(),x=Dw(f.clientX-p.left,f.clientY-p.top,p.width,p.height);return x?(s=x,u(),!0):!1},d=null;r.addEventListener("pointerdown",f=>{i&&(d=f.pointerId,r.setPointerCapture?.(f.pointerId),h(f),f.preventDefault())}),r.addEventListener("pointermove",f=>{f.pointerId===d&&(h(f),f.preventDefault())}),r.addEventListener("pointerup",f=>{if(f.pointerId!==d)return;let p=h(f);d=null,r.releasePointerCapture?.(f.pointerId),p&&this.send({type:Bt.SET_COLOR,value:s}),f.preventDefault()}),r.addEventListener("pointercancel",f=>{f.pointerId===d&&(d=null)}),r.addEventListener("keydown",f=>{let p=.013888888888888888,x=.05;if(f.key==="ArrowLeft")s.hue=(s.hue-p+1)%1;else if(f.key==="ArrowRight")s.hue=(s.hue+p)%1;else if(f.key==="ArrowUp")s.saturation=Yn(s.saturation+x,0,1);else if(f.key==="ArrowDown")s.saturation=Yn(s.saturation-x,0,1);else return;u(),this.send({type:Bt.SET_COLOR,value:s}),f.preventDefault()}),u(),t.append(r,a,c)}renderContact(e){let t=this.createSection(this.text("contact","Contact")),i=e.contact?.state??"unknown",s={open:this.text("open","Open"),closed:this.text("closed","Closed"),unknown:this.text("unknown","Unknown")};this.appendValue(t,this.text("status","Status"),s[i]??s.unknown)}renderCover(e){let t=this.createSection(this.text("cover","Cover"));this.coverPositionControl=new Go({onCommand:a=>{this.coverPositionDraft={entityId:this.context.entityId,value:a.value},this.send(a)},translate:this.translate});let i=this.coverPositionDraft?.entityId===this.context.entityId?this.coverPositionDraft.value:null;this.coverPositionControl.update(e,this.busy,i),t.appendChild(this.coverPositionControl.element);let s=e.cover?.movement??"unknown",r=this.text(\`coverState.\${s}\`,s);s!=="unknown"&&this.appendValue(t,this.text("status","Status"),r);let o=De("div","device-details-actions");o.append(this.createAction(this.text("openCover","Open"),"\\u2191",{type:Bt.OPEN_COVER},e.controls?.openCover===!0),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Bt.STOP_COVER},e.controls?.stopCover===!0),this.createAction(this.text("closeCover","Close"),"\\u2193",{type:Bt.CLOSE_COVER},e.controls?.closeCover===!0)),t.appendChild(o)}renderThermostatDial(e,t,i,s,r){let{minimum:o,maximum:a,step:c}=Il(s),l=!!s&&!this.busy&&t.availability==="available",u=this.context?.entityId,h=this.targetTemperatureDraft?.entityId===u?this.targetTemperatureDraft.value:null,d=rd(Number.isFinite(h)?h:i,s),f=De("div","device-details-thermostat-dial");f.setAttribute("role","slider"),f.setAttribute("aria-label",this.text("targetTemperature","Target temperature")),f.setAttribute("aria-valuemin",String(o)),f.setAttribute("aria-valuemax",String(a)),f.setAttribute("aria-disabled",String(!l)),f.tabIndex=l?0:-1,this.targetTemperatureDial=f,this.disposeTargetTemperatureTouchGuard=Rl(f);let p=sd("svg",{viewBox:\`0 0 \${Pr.width} \${Pr.height}\`,"aria-hidden":"true"});p.classList.add("device-details-thermostat-scale");let x=[],m=41;for(let J=0;J<m;J+=1){let Ee=J/(m-1),Ye=J%5===0,qe=id(Ee,119),K=id(Ee,Ye?101:108),le=sd("line",{x1:K.x,y1:K.y,x2:qe.x,y2:qe.y});le.classList.add("device-details-thermostat-tick"),Ye&&le.classList.add("is-major"),p.appendChild(le),x.push({element:le,fraction:Ee})}let g=sd("circle",{r:8});g.classList.add("device-details-thermostat-thumb"),p.appendChild(g);let w=De("div","device-details-thermostat-readout"),b=De("span","device-details-thermostat-target-label",this.text("targetTemperature","Target temperature")),y=De("span","device-details-thermostat-target-value"),T=De("span","device-details-thermostat-target-number"),S=De("span","device-details-thermostat-target-unit",r);y.append(T,S);let C=Number.isFinite(t.climate?.currentTemperature)?\`\${t.climate.currentTemperature.toFixed(1)} \${r}\`:this.text("unknown","Unknown"),_=De("span","device-details-thermostat-current",\`\${this.text("currentTemperature","Current temperature")}: \${C}\`);w.append(b,y,_),f.append(p,w);let A=De("div","device-details-thermostat-feedback"),I=De("span","device-details-thermostat-hint",l?this.text("temperatureDialHint","Drag along the arc to adjust"):""),P=De("span","device-details-thermostat-pending",this.text("temperaturePending","Will be sent shortly\\u2026"));P.setAttribute("role","status"),P.setAttribute("aria-live","polite");let k=this.targetTemperatureCommit.pending&&this.targetTemperatureDraft?.entityId===u;P.hidden=!k,A.append(I,P),this.targetTemperaturePendingIndicator=P,f.classList.toggle("is-pending",k);let F=De("div","device-details-thermostat-controls"),B=De("button","device-details-thermostat-step");B.type="button",B.setAttribute("aria-label",this.text("decreaseTemperature","Decrease target temperature")),B.append(De("span","device-details-thermostat-step-symbol","\\u2212"),De("span","device-details-thermostat-step-label",this.text("decreaseTemperature","Decrease target temperature")));let H=De("button","device-details-thermostat-step");H.type="button",H.setAttribute("aria-label",this.text("increaseTemperature","Increase target temperature")),H.append(De("span","device-details-thermostat-step-symbol","+"),De("span","device-details-thermostat-step-label",this.text("increaseTemperature","Increase target temperature"))),F.append(B,H);let X=(J,Ee=!0)=>{let Ye=rd(J,s);if(!Number.isFinite(Ye))return!1;d=Ye,Ee&&(this.targetTemperatureDraft={entityId:u,value:d});let qe=Ow(d,s);for(let oe of x)oe.element.classList.toggle("is-active",oe.fraction<=qe+1e-6);let K=id(qe,103);g.setAttribute("cx",String(K.x)),g.setAttribute("cy",String(K.y)),T.textContent=S0(d,c);let le=\`\${S0(d,c)} \${r}\`;return f.setAttribute("aria-valuenow",String(d)),f.setAttribute("aria-valuetext",le),B.disabled=!l||d<=o,H.disabled=!l||d>=a,!0},Y=J=>{let Ee=f.getBoundingClientRect();return!(Ee.width>0)||!(Ee.height>0)?!1:X(Nw((J.clientX-Ee.left)*Pr.width/Ee.width,(J.clientY-Ee.top)*Pr.height/Ee.height,s))},V=null;f.addEventListener("pointerdown",J=>{l&&(this.cancelTargetTemperatureCommit(),V=J.pointerId,f.classList.add("is-adjusting"),f.setPointerCapture?.(J.pointerId),Y(J),J.preventDefault())}),f.addEventListener("pointermove",J=>{J.pointerId===V&&(Y(J),J.preventDefault())}),f.addEventListener("pointerup",J=>{J.pointerId===V&&(Y(J),V=null,f.classList.remove("is-adjusting"),f.releasePointerCapture?.(J.pointerId),this.scheduleTargetTemperatureCommit(d),J.preventDefault())}),f.addEventListener("pointercancel",J=>{J.pointerId===V&&(V=null,f.classList.remove("is-adjusting"),this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null,X(i,!1))});let j=new Set(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"]),W=!1;f.addEventListener("keydown",J=>{if(!l||!j.has(J.key))return;this.cancelTargetTemperatureCommit();let Ee=d;(J.key==="ArrowLeft"||J.key==="ArrowDown")&&(Ee-=c),(J.key==="ArrowRight"||J.key==="ArrowUp")&&(Ee+=c),J.key==="Home"&&(Ee=o),J.key==="End"&&(Ee=a),W=X(Ee)||W,J.preventDefault()}),f.addEventListener("keyup",J=>{!j.has(J.key)||!W||(W=!1,this.scheduleTargetTemperatureCommit(d),J.preventDefault())});let ie=J=>{this.cancelTargetTemperatureCommit(),X(d+J*c)&&this.scheduleTargetTemperatureCommit(d)};B.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),H.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),B.addEventListener("click",()=>ie(-1)),H.addEventListener("click",()=>ie(1)),X(d,!1),e.append(f,F,A)}renderClimate(e){let t=this.createSection(this.text("climate","Climate"),"device-details-climate-section"),i=e.climate?.unit??"\\xB0C",s=e.climate?.targetTemperature,r=e.controls?.setTargetTemperature;Number.isFinite(s)?this.renderThermostatDial(t,e,s,r,i):Number.isFinite(e.climate?.currentTemperature)&&this.appendValue(t,this.text("currentTemperature","Current temperature"),\`\${e.climate.currentTemperature.toFixed(1)} \${i}\`),Number.isFinite(e.climate?.humidity)&&this.appendValue(t,this.text("humidity","Humidity"),\`\${Math.round(e.climate.humidity)}%\`),(typeof e.climate?.mode=="string"||e.controls?.setThermostatMode)&&this.appendEnumControl(t,this.text("mode","Mode"),e.climate.mode,e.controls?.setThermostatMode,Bt.SET_THERMOSTAT_MODE)}renderActivity(e){let t=this.createSection(this.text("activity","Activity")),i={alarm_motion:[this.text("detected","Detected"),this.text("clear","Clear")],alarm_presence:[this.text("present","Present"),this.text("away","Away")],alarm_occupancy:[this.text("occupied","Occupied"),this.text("unoccupied","Unoccupied")]};for(let s of e.activity??[]){let r=s.baseId??s.id,[o,a]=i[r]??[this.text("active","Active"),this.text("normal","Normal")];this.appendValue(t,this.capabilityLabel(r,s.label),s.active===null?this.text("unknown","Unknown"):s.active?o:a)}}renderSafety(e){let t=(e.safety??[]).some(s=>s.active===!0),i=this.createSection(this.text("safety","Safety"),t?"is-alert":"");for(let s of e.safety??[])this.appendValue(i,this.capabilityLabel(s.baseId??s.id,s.label),s.active===null?this.text("unknown","Unknown"):s.active?this.text("alarm","Alarm"):this.text("normal","Normal"))}renderFan(e){let t=this.createSection(this.text("fan","Fan"));e.fan&&(Number.isFinite(e.fan.speed)||e.controls?.setFanSpeed)&&this.appendNormalizedRange(t,{label:this.text("fanSpeed","Fan speed"),value:e.fan.speed,control:e.controls?.setFanSpeed,commandType:Bt.SET_FAN_SPEED}),(typeof e.fan?.mode=="string"||e.controls?.setFanMode)&&this.appendEnumControl(t,this.text("fanMode","Fan mode"),e.fan.mode,e.controls?.setFanMode,Bt.SET_FAN_MODE),e.fan&&(Number.isFinite(e.fan.targetHumidity)||e.controls?.setTargetHumidity)&&this.appendNormalizedRange(t,{label:this.text("targetHumidity","Target humidity"),value:e.fan.targetHumidity,control:e.controls?.setTargetHumidity,commandType:Bt.SET_TARGET_HUMIDITY})}renderMeasurements(e,t){let i=t==="environment",s=(e[t]??[]).filter(o=>!i||!e.climate||!["measure_temperature","measure_humidity"].includes(o.baseId??o.id));if(s.length===0)return;let r=this.createSection(this.text(i?"environment":"energy",i?"Environment":"Energy"));for(let o of s){let a=Number.isFinite(o.value)?\`\${Number(o.value.toFixed(2))}\${o.unit?\` \${o.unit}\`:""}\`:"\\u2013";this.appendValue(r,this.capabilityLabel(o.baseId??o.id,o.label),a)}}renderHealth(e){let t=(e.health?.alerts??[]).filter(r=>r.active===!0),i=Number.isFinite(e.health?.batteryPercent);if(!i&&t.length===0)return;let s=this.createSection(this.text("deviceHealth","Device health"),t.length>0?"is-warning":"");i&&this.appendValue(s,this.text("battery","Battery"),\`\${Math.round(e.health.batteryPercent)}%\`);for(let r of t)this.appendValue(s,this.capabilityLabel(r.id,r.label),this.text("attentionRequired","Attention required"))}renderCleaning(e){let t=this.createSection(this.text("cleaning","Cleaning")),i=e.cleaning?.state??"unknown";this.appendValue(t,this.text("status","Status"),this.text(\`cleaningState.\${i}\`,i)),Number.isFinite(e.cleaning?.batteryPercent)&&this.appendValue(t,this.text("battery","Battery"),\`\${Math.round(e.cleaning.batteryPercent)}%\`);let s=De("div","device-details-actions");s.append(this.createAction(this.text("start","Start"),"\\u25B6",{type:Bt.START_CLEANING},e.controls?.startCleaning===!0&&i!=="cleaning"),this.createAction(this.text("pause","Pause"),"\\u2016",{type:Bt.PAUSE_CLEANING},e.controls?.pauseCleaning===!0&&i==="cleaning"),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Bt.STOP_CLEANING},e.controls?.stopCleaning===!0&&!["idle","docked"].includes(i)),this.createAction(this.text("returnToBase","Return to base"),"\\u2302",{type:Bt.RETURN_TO_BASE},e.controls?.returnToBase===!0&&!["docked","returning"].includes(i))),t.appendChild(s)}renderLock(e){let t=this.createSection(this.text("lock","Lock")),i=typeof e.lock?.isLocked=="boolean"?e.lock.isLocked:null,s=i===null?this.text("unknown","Unknown"):i?this.text("locked","Locked"):this.text("unlocked","Unlocked");this.appendValue(t,this.text("status","Status"),s);let r=De("div","device-details-actions");r.append(this.createAction(this.text("unlock","Unlock"),"\\u{1F513}",{type:Bt.UNLOCK},e.controls?.unlock===!0&&i!==!1),this.createAction(this.text("lockAction","Lock"),"\\u{1F512}",{type:Bt.LOCK},e.controls?.lock===!0&&i!==!0)),t.appendChild(r)}render(){let e=this.context?.state??{},t=typeof e.name=="string"&&e.name.trim()?e.name.trim():this.text("device","Device");this.title.textContent=t;let i=this.text("close","Close");this.closeButton.setAttribute("aria-label",i),this.closeButton.title=i,this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.coverPositionHadFocus||=this.coverPositionControl?.slider===document.activeElement,this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.body.replaceChildren(),this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,e.availability!=="available"&&this.body.appendChild(De("div","device-details-unavailable",this.text("unavailable","Unavailable")));let s=new Set(this.context?.capabilities??[]);s.has("safety")&&this.renderSafety(e),s.has("activity")&&this.renderActivity(e),s.has("power")&&this.renderPower(e),s.has("brightness")&&this.renderBrightness(e),s.has("colorTemperature")&&this.renderColorTemperature(e),s.has("color")&&this.renderColor(e),s.has("contact")&&this.renderContact(e),s.has("cover")&&this.renderCover(e),s.has("climate")&&this.renderClimate(e),s.has("fan")&&this.renderFan(e),s.has("environment")&&this.renderMeasurements(e,"environment"),s.has("energy")&&this.renderMeasurements(e,"energy"),s.has("health")&&this.renderHealth(e),s.has("cleaning")&&this.renderCleaning(e),s.has("lock")&&this.renderLock(e),this.coverPositionHadFocus&&!this.busy&&(this.coverPositionControl?.slider.disabled||this.coverPositionControl?.slider.focus({preventScroll:!0}),this.coverPositionHadFocus=!1),s.size===0&&this.body.appendChild(De("p","device-details-empty",this.text("noInformation","No supported device information")))}dispose(){this.disposed||(this.disposed=!0,this.close({notify:!1}),this.targetTemperatureCommit.dispose(),document.removeEventListener("keydown",this.onKeyDown),this.layer.remove())}};var Xo=class{constructor({overlay:e}){this.overlay=e}open(e,t){return this.overlay.open(e,t),!0}update(e){this.overlay.update(e)}setBusy(e){this.overlay.setBusy(e)}close(){this.overlay.close({notify:!1})}dispose(){this.overlay.dispose()}};var Uw=Object.freeze({power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v9"/><path d="M6.6 5.4a8 8 0 1 0 10.8 0"/></svg>',cover:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M9 19l3-2 3 2"/></svg>',climate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M13 7v9"/></svg>',cleaning:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M6 17.5h12"/></svg>',contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="13" height="18" rx="1"/><circle cx="14.5" cy="12" r=".8"/></svg>',lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>',activity:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></svg>',safety:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 19h17L12 3Z"/><path d="M12 9v4.5M12 17h.01"/></svg>',fan:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1.5-4.8 1-7 3.5-6 2.2.9 1.6 4.8-1.9 7M13.8 13c4.9 1.1 5.6 4.4 3.5 6-1.9 1.5-5-1-5.2-5M10.3 13c-3.4 3.7-6.5 2.6-6.8 0-.3-2.4 3.4-3.8 6.6-1.3"/></svg>',environment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5C5 11 9 6.5 18.5 5c.5 8.5-3.6 14-9 14A4.5 4.5 0 0 1 5 15.5Z"/><path d="M7 18c2-4 5-6 9-9"/></svg>',energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/></svg>',health:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l2-5 4 10 2-5h4"/><path d="M5 5h14v14H5z"/></svg>',details:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>'}),qo=Object.freeze({minimumVisible:6,maximumVisible:20,horizontalPitch:48});function Bw(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();if(!e)return null;let t=e.split(".")[0];return e.startsWith("windowcoverings_")||t==="garagedoor_closed"?"cover":["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(t)?"safety":["alarm_motion","alarm_presence","alarm_occupancy"].includes(t)?"activity":e.startsWith("vacuum_")||e.startsWith("vacuumcleaner_")?"cleaning":e==="target_temperature"||e.startsWith("thermostat_")?"climate":["fan_speed","fan_mode","target_humidity"].includes(t)?"fan":t==="onoff"?"power":["locked","locked_status","lock","unlock","deadbolt"].includes(t)?"lock":t==="alarm_contact"?"contact":t==="measure_temperature"?"climate":["measure_humidity","measure_luminance","measure_aqi","measure_co2","measure_pm25","measure_tvoc","measure_pressure","measure_noise"].includes(t)?"environment":["measure_power","meter_power","measure_current","measure_voltage","meter_gas","meter_water"].includes(t)?"energy":t==="measure_battery"||t.startsWith("alarm_")?"health":null}function kw(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();return["windowcoverings","blinds","curtain","shutter"].includes(e)?"cover":["vacuumcleaner","vacuum"].includes(e)?"cleaning":["thermostat","heater"].includes(e)?"climate":["fan","airconditioning","airpurifier","humidifier","dehumidifier"].includes(e)?"fan":e==="lock"?"lock":["garagedoor","gate"].includes(e)?"cover":["meter","smartmeter"].includes(e)?"energy":["light","socket"].includes(e)?"power":null}function zw(n,e=null,t=null){if(n?.safety)return"safety";let i=kw(n?.deviceClass);if(i==="lock")return"lock";let s=Bw(t);return s||i||(n?.cleaning?"cleaning":n?.cover?"cover":n?.lock?"lock":n?.activity?"activity":n?.fan?"fan":e==="light"&&n?.power?"power":n?.climate?"climate":n?.power?"power":n?.energy?"energy":n?.environment?"environment":n?.health?"health":n?.contact?"contact":"details")}function Hw(n,e){let t=typeof n=="string"?n.trim().toLowerCase():"",i=t.split(".")[0];return["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(i)?900:["alarm_motion","alarm_presence","alarm_occupancy"].includes(i)?800:t.startsWith("vacuum_")||t.startsWith("vacuumcleaner_")?600:t.startsWith("windowcoverings_")?500:t==="target_temperature"||t.startsWith("thermostat_")?400:["locked","locked_status","lock","unlock","deadbolt"].includes(t)?375:t==="onoff"?350:t==="alarm_contact"?300:t==="measure_temperature"?100:{safety:90,activity:80,cleaning:60,cover:50,climate:40,lock:38,power:35,contact:30,fan:28,energy:20,environment:18,health:16,details:0}[e]??0}function Vw(n){let e=Number.isFinite(n)&&n>0?n:qo.minimumVisible*qo.horizontalPitch;return Math.min(qo.maximumVisible,Math.max(qo.minimumVisible,Math.floor(e/qo.horizontalPitch)))}function Gw(n){let e=n?.state,t=Number.isFinite(n?.priority)?n.priority:0;return(e?.safety??[]).some(s=>s.active===!0)||e?.health?.alerts?.some(s=>s.active===!0)===!0?t+3e3:n?.type==="power"&&e?.power?.isOn===!0?t+1400:(e?.activity??[]).some(s=>s.active===!0)?t+1200:e?.cleaning&&!["docked","idle"].includes(e.cleaning.state)?t+1e3:e?.cover?.movement&&e.cover.movement!=="stopped"?t+800:e?.climate?.heatingActive===!0?t+700:n?.type==="fan"&&(e?.power?.isOn===!0||Number.isFinite(e?.fan?.speed)&&e.fan.speed>0)?t+600:e?.availability==="unavailable"?t-100:t}function T0(n,e){return(n.left-e.left)**2+(n.top-e.top)**2}function Ww(n,e,t,i,s){let r=[...n],o=[];for(;o.length<e&&r.length>0;){let a=0,c=-1/0;for(let l=0;l<r.length;l+=1){let u=r[l],h=[...t,...o],d=h.length>0?Math.min(...h.map(p=>T0(u,p))):-T0(u,{left:i/2,top:s/2}),f=r[a];(d>c||d===c&&u.sceneObjectId.localeCompare(f.sceneObjectId)<0)&&(a=l,c=d)}o.push(r.splice(a,1)[0])}return o}function Xw(n,e,t){let i=Vw(e);if(n.length<=i)return n;let s=new Map;for(let o of n){let a=Gw(o.record);s.has(a)||s.set(a,[]),s.get(a).push(o)}let r=[];for(let o of[...s.keys()].sort((a,c)=>c-a)){let a=s.get(o),c=i-r.length;if(c<=0)break;a.length<=c?r.push(...a):r.push(...Ww(a,c,r,e,t))}return r}function qw({entities:n,bindings:e,statesByDeviceId:t}){let i=new Map;for(let s of n.values()){let r=e.get(s.id);if(!r?.deviceId)continue;let o=t.get(r.deviceId),a=zw(o,s.kind,r.capability),c={binding:r,entity:s,priority:Hw(r.capability,a),state:o,type:a},l=i.get(r.deviceId);(!l||c.priority>l.priority)&&i.set(r.deviceId,c)}return[...i.values()]}function Ir(n){n.preventDefault(),n.stopPropagation()}var Yo=class{constructor({host:e,onOpenDetails:t,onTogglePower:i,translate:s=(r,o)=>o}){this.onOpenDetails=t,this.onTogglePower=i,this.translate=s,this.records=new Map,this.enabled=!0,this.suppressed=!1,this.bounds=new zt,this.anchor=new D,this.projected=new D,this.size=new D,this.layer=document.createElement("div"),this.layer.className="device-affordance-layer",this.layer.hidden=!0,this.layer.setAttribute("aria-label",this.translate("deviceDetails.label","Device details")),e.appendChild(this.layer)}createRecord(e,t,i){let s=document.createElement("button");s.type="button",s.className="device-affordance-button",s.dataset.markerType=i,s.dataset.sceneObjectId=e,s.innerHTML=\`\${Uw[i]}<span class="device-affordance-device-icon" aria-hidden="true"></span>\`;let r={deviceId:null,element:s,entity:t,pressGesture:null,priority:0,state:null,suppressClickUntil:0,type:i};r.pressGesture=new Cr({onLongPress:()=>{if(this.records.get(e)!==r)return!1;let a=this.onOpenDetails(e)===!0;return a&&(r.suppressClickUntil=Date.now()+1e3,globalThis.getSelection?.()?.removeAllRanges()),a}});let o=()=>{this.records.get(e)===r&&(r.type==="power"&&r.state?.availability==="available"&&typeof r.state.power?.isOn=="boolean"&&r.state.controls?.setPower===!0?this.onTogglePower(e):this.onOpenDetails(e))};return s.addEventListener("pointerdown",a=>{Ir(a);try{s.setPointerCapture?.(a.pointerId)}catch{}r.pressGesture.pointerDown(a)}),s.addEventListener("pointermove",a=>{Ir(a),r.pressGesture.pointerMove(a)}),s.addEventListener("pointerup",a=>{Ir(a);let c=r.pressGesture.pointerUp(a);r.suppressClickUntil=Math.max(r.suppressClickUntil,Date.now()+500),c&&o()}),s.addEventListener("pointercancel",a=>{Ir(a),r.pressGesture.pointerCancel(a)}),s.addEventListener("lostpointercapture",a=>{r.pressGesture.pointerCancel(a)}),s.addEventListener("contextmenu",Ir),s.addEventListener("click",a=>{Ir(a),!(Date.now()<r.suppressClickUntil)&&o()}),this.layer.appendChild(s),this.records.set(e,r),r}removeRecord(e,t){t.pressGesture.dispose(),t.element.remove(),this.records.delete(e)}updateRecord(e,t){e.state=t;let i=typeof t?.icon?.dataUrl=="string"&&t.icon.dataUrl.startsWith("data:image/svg+xml;base64,")?t.icon.dataUrl:null;e.element.classList.toggle("has-device-icon",!!i),i?e.element.style.setProperty("--device-affordance-icon",\`url("\${i}")\`):e.element.style.removeProperty("--device-affordance-icon");let s=e.type==="power",r=s&&t?.power?.isOn===!0,o=t?.availability!=="available",a=(t?.safety??[]).some(d=>d.active===!0)||t?.health?.alerts?.some(d=>d.active===!0)===!0,c=String(t?.cleaning?.state??"").toLowerCase(),l=(t?.activity??[]).some(d=>d.active===!0)||e.type==="cleaning"&&t?.availability==="available"&&c.length>0&&!["docked","idle","paused"].includes(c)||e.type==="fan"&&(t?.power?.isOn===!0||Number.isFinite(t?.fan?.speed)&&t.fan.speed>0||t?.fan?.mode==="on");e.element.classList.toggle("is-on",r),e.element.classList.toggle("is-alert",a),e.element.classList.toggle("is-active",l),e.element.classList.toggle("is-unavailable",o),s?e.element.setAttribute("aria-pressed",String(r)):e.element.removeAttribute("aria-pressed");let u=typeof t?.name=="string"&&t.name.trim()?t.name.trim():this.translate("deviceDetails.device","Device"),h=s&&!o?this.translate(r?"quickControls.power.turnOff":"quickControls.power.turnOn",r?"Turn off":"Turn on"):this.translate("deviceDetails.label","Device details");e.element.setAttribute("aria-label",\`\${u}: \${h}\`),e.element.title=h}sync({entities:e,bindings:t,statesByDeviceId:i}){let s=new Set,r=qw({entities:e,bindings:t,statesByDeviceId:i});for(let{binding:o,entity:a,priority:c,state:l,type:u}of r){s.add(a.id);let h=this.records.get(a.id);h&&h.type!==u&&(this.removeRecord(a.id,h),h=null),h??=this.createRecord(a.id,a,u),h.entity=a,h.deviceId=o.deviceId,h.priority=c,this.updateRecord(h,l)}for(let[o,a]of this.records)s.has(o)||this.removeRecord(o,a);this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setEnabled(e){this.enabled=!!e,this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setSuppressed(e){if(this.suppressed=!!e,this.suppressed)for(let t of this.records.values()){let i=[...t.pressGesture.activePointers.keys()];t.pressGesture.reset();for(let s of i)try{t.element.hasPointerCapture?.(s)&&t.element.releasePointerCapture(s)}catch{}}this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}layout(e,t,i=[]){if(this.layer.hidden)return[];let s=Math.max(t.clientWidth,1),r=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let o=[];for(let[u,h]of this.records){let d=h.entity.controlAnchor;d?(d.updateWorldMatrix(!0,!1),d.getWorldPosition(this.anchor),this.anchor.y+=.35):(h.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(h.entity.root)),!d&&this.bounds.isEmpty()?(h.entity.root.getWorldPosition(this.anchor),this.anchor.y+=.35):d||(this.bounds.getCenter(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.16,this.size.y*.05)),this.projected.copy(this.anchor).project(e);let f=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;h.element.hidden=!f,f&&o.push({left:(this.projected.x*.5+.5)*s,record:h,sceneObjectId:u,top:(-this.projected.y*.5+.5)*r})}let a=Xw(o,s,r),c=new Set(a.map(({sceneObjectId:u})=>u));for(let u of o)u.record.element.hidden=!c.has(u.sceneObjectId);a.sort((u,h)=>u.top-h.top||u.left-h.left||u.sceneObjectId.localeCompare(h.sceneObjectId));let l=[...i];for(let u of a){let h=nd({left:u.left,top:u.top,width:s,height:r,controlWidth:u.record.element.offsetWidth||38,controlHeight:u.record.element.offsetHeight||38,collisionGap:5,obstacles:l});h&&(u.record.element.style.left=\`\${h.position.left}px\`,u.record.element.style.top=\`\${h.position.top}px\`,l.push(h.rectangle))}return l}clear(){for(let[e,t]of this.records)this.removeRecord(e,t);this.layer.hidden=!0}dispose(){this.clear(),this.layer.remove()}};var dg=kn(Qi());var D0=kn(I0()),{FALLBACK_SUNRISE_HOUR:xR,FALLBACK_SUNSET_HOUR:vR,calculateDashboardSolarPosition:Jw,fallbackDashboardSolarPosition:Qw,normalizeDashboardSolarPosition:eT,resolveDashboardSolarState:cd}=D0.default;var tT=Object.freeze(["auto","light","dark"]),F0=Object.freeze(["auto","day","evening","night"]),nT=.52,iT=.36,ld=Object.freeze({resolvedTheme:"light",backgroundStyle:"neutral-light",uiContrast:"dark",ambientIntensityFactor:1,keyIntensityFactor:1,fillIntensityFactor:1,toneMappingExposure:1.05}),sT=Object.freeze({resolvedTheme:"dark",backgroundStyle:"warm-evening",uiContrast:"light",ambientIntensityFactor:.62,keyIntensityFactor:.58,fillIntensityFactor:.55,toneMappingExposure:1.025}),L0=Object.freeze({resolvedTheme:"dark",backgroundStyle:"neutral-dark",uiContrast:"light",ambientIntensityFactor:.28,keyIntensityFactor:.24,fillIntensityFactor:.22,toneMappingExposure:1}),rT=Object.freeze({day:ld,evening:sT,night:L0,light:ld,dark:L0});function oT(n){return tT.includes(n)?n:"auto"}function $o(n){return F0.includes(n)?n:"auto"}function O0(n){return n==="dark"||n==="light"?n:null}function N0(n){return\`rgb(\${n.map(e=>Math.round(Math.min(Math.max(e,0),1)*255)).join(", ")})\`}function Ll(n,e,t){typeof n?.setProperty=="function"?n.setProperty(e,t):n&&(n[e]=t)}function aT(n,e){let t=i=>i[0]*.2126+i[1]*.7152+i[2]*.0722;return(t(n)+t(e))/2}function Ol({mode:n="auto",timeOfDay:e="auto",autoBrightness:t=!0,indoorBrightnessInDarkness:i=!0,hostTheme:s=null,systemTheme:r="light",at:o=new Date,solarPosition:a=null,modelNorthDegrees:c=0}={}){let l=oT(n),u=l==="auto"?O0(s)??O0(r)??"light":l,h=$o(e),d=cd({at:o,solarPosition:a,modelNorthDegrees:c,timeOfDay:h}),f=d.resolvedTimeOfDay,p=rT[f],x=t?h==="auto"?d:p:ld,m=t!==!1&&i!==!1;return Object.freeze({themeMode:l,timeOfDayMode:h,resolvedTimeOfDay:f,...p,resolvedTheme:u,uiContrast:u==="dark"?"light":"dark",solar:d,solarSignature:d.signature,sunPositionDirection:d.sunPositionDirection,keyRGB:d.keyRGB,fillRGB:d.fillRGB,backdropTopRGB:d.backdropTopRGB,backdropBottomRGB:d.backdropBottomRGB,sceneContrast:aT(d.backdropTopRGB,d.backdropBottomRGB)<.55?"light":"dark",autoBrightness:t!==!1,indoorBrightnessInDarkness:i!==!1,ambientIntensityFactor:m?Math.max(x.ambientIntensityFactor,nT):x.ambientIntensityFactor,keyIntensityFactor:x.keyIntensityFactor,fillIntensityFactor:m?Math.max(x.fillIntensityFactor,iT):x.fillIntensityFactor,toneMappingExposure:x.toneMappingExposure})}function cT(n,e){return!!(n&&e&&n.themeMode===e.themeMode&&n.timeOfDayMode===e.timeOfDayMode&&n.resolvedTimeOfDay===e.resolvedTimeOfDay&&n.autoBrightness===e.autoBrightness&&n.indoorBrightnessInDarkness===e.indoorBrightnessInDarkness&&n.resolvedTheme===e.resolvedTheme&&n.solarSignature===e.solarSignature)}function Nl(n,{renderer:e=null,rootElement:t=null,runtimes:i=[]}={}){if(n){t&&(t.dataset.dashboardThemeMode=n.themeMode,t.dataset.dashboardTheme=n.resolvedTheme,t.dataset.dashboardTimeOfDayMode=n.timeOfDayMode,t.dataset.dashboardTimeOfDay=n.resolvedTimeOfDay,t.dataset.dashboardBackground=n.backgroundStyle,t.dataset.dashboardContrast=n.uiContrast,t.dataset.dashboardSceneContrast=n.sceneContrast,t.style.colorScheme=n.resolvedTheme,Ll(t.style,"--dashboard-scene-backdrop-top",N0(n.backdropTopRGB)),Ll(t.style,"--dashboard-scene-backdrop-bottom",N0(n.backdropBottomRGB)),Ll(t.style,"--dashboard-scene-text-primary",n.sceneContrast==="light"?"rgb(242, 244, 245)":"rgb(38, 49, 60)"),Ll(t.style,"--dashboard-scene-text-secondary",n.sceneContrast==="light"?"rgba(236, 239, 241, 0.76)":"rgba(38, 49, 60, 0.7)")),e&&(e.toneMappingExposure=n.toneMappingExposure);for(let s of i)Um(s?.lighting,n)}}function jo(n,e,{mode:t="auto",timeOfDay:i="auto",autoBrightness:s=!0,indoorBrightnessInDarkness:r=!0,at:o=new Date,solarPosition:a=null,modelNorthDegrees:c=0,renderer:l=null,rootElement:u=null,runtimes:h=[],afterApply:d=null,requestRender:f=null}={}){let p=Ol({mode:t,timeOfDay:i,autoBrightness:s,indoorBrightnessInDarkness:r,at:o,solarPosition:a,modelNorthDegrees:c,...e});return cT(n,p)?n:(Nl(p,{renderer:l,rootElement:u,runtimes:h}),d?.(p),f?.(),p)}var ts=Object.freeze({compactWidth:320,spaciousWidth:640,shortHeight:320,tallHeight:720,portraitAspect:.8,landscapeAspect:1.2,maxDevicePixelRatio:2,maxRenderPixels:21e5});function ud(n,e=1){return Number.isFinite(n)&&n>0?n:e}function hd({width:n,height:e,devicePixelRatio:t=1}={}){let i=ud(n),s=ud(e),r=i/s,o=i<ts.compactWidth?"compact":i>=ts.spaciousWidth?"spacious":"standard",a=s<ts.shortHeight?"short":s>=ts.tallHeight?"tall":"standard",c=r<=ts.portraitAspect?"portrait":r>=ts.landscapeAspect?"landscape":"balanced",l=Math.min(Math.max(ud(t),1),ts.maxDevicePixelRatio),u=Math.sqrt(ts.maxRenderPixels/(i*s)),h=Math.round(Math.max(1,Math.min(l,u))*1e3)/1e3;return Object.freeze({width:i,height:s,aspect:r,size:o,heightClass:a,orientation:c,renderPixelRatio:h})}function U0(n,e){return!!(n&&e&&n.size===e.size&&n.heightClass===e.heightClass&&n.orientation===e.orientation&&n.renderPixelRatio===e.renderPixelRatio)}function dd(n,{rootElement:e=null,shellElement:t=null}={}){if(n)for(let i of[e,t])i&&(i.dataset.dashboardLayoutSize=n.size,i.dataset.dashboardLayoutHeight=n.heightClass,i.dataset.dashboardLayoutOrientation=n.orientation)}function Fl(n,e){let t=Math.max(Number(e)||0,0);return n?.orientation!=="landscape"?t:Math.min(t,Math.max(116,Math.floor(t*.58)))}var ER=Object.freeze({minimumKelvin:2e3,maximumKelvin:6500}),lT=2850;function Zo(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function Ul(n){return typeof n=="number"&&Number.isFinite(n)?n:null}function B0(n){let e=Zo(n,2e3,6500)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,i=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,s=e>=66?255:e<=19?0:138.5177312231*Math.log(e-10)-305.0447927307,r=o=>Zo(o/255*.88+.12);return{r:r(t),g:r(i),b:r(s)}}function uT(n,e){let t=(n%1+1)%1,i=Zo(e),s=t*6,r=i,o=r*(1-Math.abs(s%2-1)),a;s<1?a=[r,o,0]:s<2?a=[o,r,0]:s<3?a=[0,r,o]:s<4?a=[0,o,r]:s<5?a=[o,0,r]:a=[r,0,o];let c=1-r,l=u=>{let h=Zo(u+c);return Math.abs(h)<1e-12?0:Math.abs(1-h)<1e-12?1:h};return{r:l(a[0]),g:l(a[1]),b:l(a[2])}}function k0(n){let e=n?.availability==="available"&&typeof n?.power?.isOn=="boolean",t=e&&n.power.isOn,i=Ul(n?.light?.brightness),s=i===null?1:Zo(i),r=Ul(n?.light?.color?.hue),o=Ul(n?.light?.color?.saturation),a=Ul(n?.light?.colorTemperatureKelvin),c=r!==null&&o!==null,l=a!==null,u=["color","temperature","white"].includes(n?.light?.mode)?n.light.mode:c?"color":l?"temperature":"white",h=u==="color"&&!c?l?"temperature":"white":u==="temperature"&&!l?c?"color":"white":u,d,f=null;return h==="color"&&c?d=uT(r,o):h==="temperature"&&l?(f=a,d=B0(a)):d=B0(lT),{known:e,on:t,brightness:s,hasDim:i!==null,colorMode:h,rgb:d,...f===null?{}:{colorTemperature:f}}}var z0=14,hT=280,H0=1776928,dT=5593180;function fd(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function fT(n){return n<.5?4*n*n*n:1-(-2*n+2)**3/2}function Bl(n,e){let t=fd(e);n.slats.forEach((i,s)=>{let r=n.topY-n.headrailHeight-(s+.5)*n.fullSpacing,o=n.topY-n.headrailHeight-(s+.5)*n.stackSpacing;i.position.y=it.lerp(r,o,t),i.rotation.x=-.05*(1-t)}),n.fraction=t}function pT(n){let e=n.visual?.coverVisual;if(e)return e;if(n.elementType!=="window"||!n.visual?.size)return null;let{width:t,height:i,depth:s}=n.visual.size,r=Math.max(t-.1,.18),o=Math.max(i-.1,.32),a=Math.min(Math.max(o*.04,.035),.055),c=Math.max((o-a)/z0,.018),l=Math.min(Math.max(o*.004,.0035),.006),u=Math.max(c+.006,.024),h=new wn({color:H0,roughness:.58,metalness:.08}),d=new ct;d.name="DashboardWindowCover",d.position.set(t/2,.05,Math.max(s,.02)*.1),d.userData.deviceVisual="cover",n.root.add(d);let f=new Vt(r,a,.06),p=new nt(f,h);p.name="DashboardWindowCoverRail",p.position.y=o-a/2,p.castShadow=!0,p.receiveShadow=!0,d.add(p);let x=new Vt(r*.98,u,.052),m=Array.from({length:z0},(w,b)=>{let y=new nt(x,h);return y.name=\`DashboardWindowCoverSlat:\${b}\`,y.castShadow=!0,y.receiveShadow=!0,d.add(y),y}),g={root:d,rail:p,slats:m,material:h,topY:o,headrailHeight:a,fullSpacing:c,stackSpacing:l,fraction:1,transition:null,initialized:!1};return Bl(g,1),n.visual.coverVisual=g,g}function V0(n,e,t=0){if(n.elementType!=="window")return!1;if(!e?.cover)return n.visual?.coverVisual&&(n.visual.coverVisual.root.visible=!1),!1;let i=pT(n);if(!i)return!1;i.root.visible=!0;let s=e.availability==="available";i.material.color.setHex(s?H0:dT),i.root.userData.coverAvailability=e.availability,i.root.userData.coverMovement=e.cover.movement;let r=typeof e.cover.position=="number"&&Number.isFinite(e.cover.position)?fd(e.cover.position):null;return r===null?(i.initialized||Bl(i,1),i.initialized=!0,i.transition=null,!1):i.initialized?Math.abs(r-i.fraction)<=1e-6?(i.transition=null,!1):(i.transition={from:i.fraction,to:r,startedAt:t,duration:hT},!0):(Bl(i,r),i.initialized=!0,!0)}function mT(n,e){let t=n.visual?.coverVisual,i=t?.transition;if(!i)return!1;let s=fd((e-i.startedAt)/i.duration);return Bl(t,it.lerp(i.from,i.to,fT(s))),s>=1&&(t.transition=null),s<1}function G0(n,e){let t=!1;for(let i of n.values())t=mT(i,e)||t;return t}var Z0=new Set(["alarm_occupancy","alarm_presence","occupancy","presence"]),W0=5680504,K0=5680504,gT=6662616,xT=14179671,cn=Object.freeze({fadeInMs:600,fadeOutMs:1500,floorOffset:.006,wallGap:.02,innerWidth:.035,outerWidth:.11,innerVerticalOffset:8e-4,innerOpacity:.42,outerOpacity:.14,pulseDurationMs:3600,minimumPulseOpacity:.72}),J0=Object.freeze({coreOpacity:.34}),ai=Object.freeze({maximumFrameDeltaMs:100,maximumPathPoints:128,maximumSpeedMetersPerSecond:2,minimumSegmentLength:.01,minimumSpeedMetersPerSecond:.02}),Ei=Object.freeze({gridSpacing:.25,maximumGridPoints:2400,maximumLandmarks:5,maximumRobotClearance:.34,minimumLandmarkDistance:.8,minimumRobotClearance:.18,robotClearancePadding:.04,speedMetersPerSecond:.22}),vT=new Set(["chair_basic","climate","device","rug","table_basic"]),pd=.002,_T=4;function gd(n){return typeof n=="string"?n.trim().toLowerCase().split(".")[0]:""}function yT(n){return Z0.has(gd(n?.capability))}function bT(n){return Z0.has(gd(n?.baseId??n?.id))}function MT(n){return n?.availability==="available"&&(n.activity??[]).some(e=>bT(e)&&e.active===!0)}function ST(n){if(n?.availability!=="available")return"inactive";let e=String(n?.cleaning?.state??"").trim().toLowerCase(),t=String(n?.cleaning?.error??"").trim().toLowerCase();return["error","fault","blocked"].includes(e)||t&&!["no error","none","ok"].includes(t)?"error":["returning","returning_to_base","return-to-base","docking"].includes(e)?"returning":["active","cleaning","mowing","on","running"].includes(e)?"working":"inactive"}function xd(n){if(!n||(n.coordinateSpace??"floor")!=="floor")return null;let e=[];for(let s of n.path??[]){if(e.length>=ai.maximumPathPoints)break;if(!Number.isFinite(s?.x)||!Number.isFinite(s?.z))continue;let r={x:s.x,z:s.z};(e.length===0||Math.sqrt($n(e[e.length-1],r))>=ai.minimumSegmentLength)&&e.push(r)}if(e.length<2)return null;let t=it.clamp(Number(n.speedMetersPerSecond)||.25,ai.minimumSpeedMetersPerSecond,ai.maximumSpeedMetersPerSecond);return{coordinateSpace:"floor",loop:n.loop===!0,path:e,speedMetersPerSecond:t}}function Q0(n){let e=xd(n);if(!e)return null;let{loop:t,path:i,speedMetersPerSecond:s}=e,r=[],o=t?i.length:i.length-1,a=0;for(let c=0;c<o;c+=1){let l=i[c],u=i[(c+1)%i.length],h=Math.sqrt($n(l,u));h<ai.minimumSegmentLength||(r.push({end:u,length:h,start:l,startDistance:a}),a+=h)}return r.length===0||a<=0?null:{...e,segments:r,signature:JSON.stringify(e),totalDistance:a}}function $n(n,e){return(n.x-e.x)**2+(n.z-e.z)**2}function ns(n){return n.length<3?0:n.reduce((e,t,i)=>{let s=n[(i+1)%n.length];return e+t.x*s.z-s.x*t.z},0)/2}function Lr(n,e){return n.x*e.z-n.z*e.x}function Pn(n,e){return{x:n.x-e.x,z:n.z-e.z}}function zl(n,e,t){return{x:n.x+e.x*t,z:n.z+e.z*t}}function X0(n){let e=Math.hypot(n.x,n.z);return e<=pd?null:{x:n.x/e,z:n.z/e}}function vd(n){let e=[];for(let t of n??[])!Number.isFinite(t?.x)||!Number.isFinite(t?.z)||(e.length===0||$n(e[e.length-1],t)>pd**2)&&e.push({x:t.x,z:t.z});return e.length>1&&$n(e[0],e[e.length-1])<=pd**2&&e.pop(),ns(e)<0&&e.reverse(),e}function Nr(n,e){if(!n||e.length<3)return!1;let t=!1,i=e[e.length-1];for(let s of e){if(s.z>n.z!=i.z>n.z){let o=(i.x-s.x)*(n.z-s.z)/(i.z-s.z)+s.x;n.x<o&&(t=!t)}i=s}return t}function ET(n,e,t,i){let s=Lr(Pn(e,n),Pn(t,n)),r=Lr(Pn(e,n),Pn(i,n)),o=Lr(Pn(i,t),Pn(n,t)),a=Lr(Pn(i,t),Pn(e,t));return s*r<-1e-6&&o*a<-1e-6}function eg(n){if(n.length<4)return!1;for(let e=0;e<n.length;e+=1){let t=(e+1)%n.length;for(let i=e+1;i<n.length;i+=1){let s=(i+1)%n.length;if(!(t===i||s===e||e===i)&&ET(n[e],n[t],n[i],n[s]))return!0}}return!1}function wT(n,e,t){let i=Pn(t,e),s=i.x**2+i.z**2;if(s<=1e-6)return Math.sqrt($n(n,e));let r=Pn(n,e),o=it.clamp((r.x*i.x+r.z*i.z)/s,0,1);return Math.sqrt($n(n,zl(e,i,o)))}function tg(n,e){return e.reduce((t,i,s)=>Math.min(t,wT(n,i,e[(s+1)%e.length])),1/0)}function TT(n){let e=String(n?.assetKey??n?.visualType??"").trim();if(n?.kind==="light"||e==="robotVacuum"||vT.has(e))return null;let t=n?.dimensions??n?.size,i=Number(t?.width),s=Number(t?.depth),r=Number(n?.position?.x),o=Number(n?.position?.z);return![i,s,r,o].every(Number.isFinite)||i<=.04||s<=.04?null:{depth:s,rotation:it.degToRad(Number(n?.rotation?.y)||0),width:i,x:r,z:o}}function ng(n,e,t){let i=n.x-e.x,s=n.z-e.z,r=Math.cos(e.rotation),o=Math.sin(e.rotation),a=r*i+o*s,c=-o*i+r*s;return Math.abs(a)<=e.width/2+t&&Math.abs(c)<=e.depth/2+t}function AT(n,e,t,i){return Nr(n,e)&&tg(n,e)>=i&&!t.some(s=>ng(n,s,i))}function ig(n,e,t,i){let s=Math.sqrt($n(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let o=0;o<=r;o+=1){let a=o/r;if(!t({x:it.lerp(n.x,e.x,a),z:it.lerp(n.z,e.z,a)}))return!1}return!0}function CT(n,e,t,i){let s=Math.sqrt($n(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let o=1;o<=r;o+=1){let a=o/r;if(!t({x:it.lerp(n.x,e.x,a),z:it.lerp(n.z,e.z,a)}))return!1}return!0}function RT(n,e,t){n[e].push(t),n[t].push(e)}function sg(n,e){let t=[],i=[e],s=new Set(i);for(let r=0;r<i.length;r+=1){let o=i[r];t.push(o);for(let a of n[o])s.has(a)||(s.add(a),i.push(a))}return t}function PT(n){let e=[],t=new Map;for(let i=0;i<n.length;i+=1){if(t.has(i))continue;let s=sg(n,i),r=e.length;e.push(s);for(let o of s)t.set(o,r)}return{componentByPoint:t,components:e}}function q0(n,e,t){if(e===t)return[e];let i=[e],s=new Map([[e,null]]);for(let r=0;r<i.length;r+=1){let o=i[r];for(let a of n[o])if(!s.has(a)){if(s.set(a,o),a===t){let c=[t],l=o;for(;l!==null;)c.push(l),l=s.get(l);return c.reverse()}i.push(a)}}return null}function Y0(n,e,t){if(n.length<=2)return n;let i=[n[0]],s=0;for(;s<n.length-1;){let r=s+1;for(let o=n.length-1;o>s+1;o-=1)if(ig(n[s],n[o],e,t)){r=o;break}i.push(n[r]),s=r}return i}function IT(n,e){return(n?.rooms??[]).map(t=>({room:t,boundary:vd(t?.polygon)})).filter(({boundary:t})=>Nr(e,t)).sort((t,i)=>Math.abs(ns(t.boundary))-Math.abs(ns(i.boundary)))[0]??null}function rg({activeFloor:n,excludedObjectId:e=null,origin:t,robotSize:i=null}={}){if(!Number.isFinite(t?.x)||!Number.isFinite(t?.z))return null;let s=IT(n,t);if(!s||s.boundary.length<3)return null;let r=Math.max(Number(i?.width)||.42,.18),o=Math.max(Number(i?.depth)||.42,.18),a=it.clamp(Math.max(r,o)/2+Ei.robotClearancePadding,Ei.minimumRobotClearance,Ei.maximumRobotClearance),c=(n?.objects??[]).filter(V=>V?.id!==e&&Nr(V?.position,s.boundary)).map(TT).filter(Boolean),l=V=>AT(V,s.boundary,c,a),u=V=>Nr(V,s.boundary)&&!c.some(j=>ng(V,j,.02)),h=s.boundary.reduce((V,j)=>({maximumX:Math.max(V.maximumX,j.x),maximumZ:Math.max(V.maximumZ,j.z),minimumX:Math.min(V.minimumX,j.x),minimumZ:Math.min(V.minimumZ,j.z)}),{maximumX:-1/0,maximumZ:-1/0,minimumX:1/0,minimumZ:1/0}),d=Math.max(0,h.maximumX-h.minimumX-a*2),f=Math.max(0,h.maximumZ-h.minimumZ-a*2),p=Ei.gridSpacing;d*f/p**2>Ei.maximumGridPoints&&(p=Math.sqrt(d*f/Ei.maximumGridPoints));let m=[],g=new Map,w=Math.floor(d/p)+1,b=Math.floor(f/p)+1;for(let V=0;V<b;V+=1)for(let j=0;j<w;j+=1){let W={x:h.minimumX+a+j*p,z:h.minimumZ+a+V*p};l(W)&&(g.set(\`\${j}:\${V}\`,m.length),m.push(W))}if(m.length<2)return null;let y=m.map(()=>[]),T=[[1,0],[0,1],[1,1],[-1,1]];for(let[V,j]of g){let[W,ie]=V.split(":").map(Number);for(let[J,Ee]of T){let Ye=g.get(\`\${W+J}:\${ie+Ee}\`);Ye!==void 0&&(J!==0&&Ee!==0&&(!g.has(\`\${W+J}:\${ie}\`)||!g.has(\`\${W}:\${ie+Ee}\`))||ig(m[j],m[Ye],l,p)&&RT(y,j,Ye))}}let S=m.map((V,j)=>({index:j,distance:$n(t,V)})).sort((V,j)=>V.distance-j.distance),{componentByPoint:C,components:_}=PT(y),A=S.filter(({index:V})=>_[C.get(V)].length>=2),I=A.filter(({index:V})=>CT(t,m[V],u,p)),P=(I.length>0?I:A).sort((V,j)=>_[C.get(j.index)].length-_[C.get(V.index)].length||V.distance-j.distance)[0]?.index;if(P===void 0)return null;let k=sg(y,P);if(k.length<2)return null;let F=[P];for(;F.length<=Ei.maximumLandmarks;){let V=null;for(let j of k){if(F.includes(j))continue;let W=Math.min(...F.map(ie=>$n(m[j],m[ie])));(!V||W>V.separation)&&(V={index:j,separation:W})}if(!V||Math.sqrt(V.separation)<Ei.minimumLandmarkDistance)break;F.push(V.index)}if(F.length<2)return null;let B=[{x:t.x,z:t.z},m[P]],H=new Set(F.slice(1)),X=P;for(;H.size>0;){let V=null;for(let W of H){let ie=q0(y,X,W);!ie||V&&ie.length>=V.graphPath.length||(V={graphPath:ie,target:W})}if(!V)break;let j=Y0(V.graphPath.map(W=>m[W]),l,p);B.push(...j.slice(1)),X=V.target,H.delete(X)}let Y=q0(y,X,P);if(Y){let V=Y0(Y.map(j=>m[j]),l,p);B.push(...V.slice(1))}return xd({coordinateSpace:"floor",loop:!0,path:B,speedMetersPerSecond:Ei.speedMetersPerSecond})}function kl(n,e){if(e<=0)return n.map(s=>({...s}));let t=[];for(let s=0;s<n.length;s+=1){let r=n[(s-1+n.length)%n.length],o=n[s],a=n[(s+1)%n.length],c=X0(Pn(o,r)),l=X0(Pn(a,o));if(!c||!l)return null;let u={x:-c.z,z:c.x},h={x:-l.z,z:l.x},d=zl(o,u,e),f=zl(o,h,e),p=Lr(c,l),x;if(Math.abs(p)<=1e-5){if(!(c.x*l.x+c.z*l.z>0))return null;x=d}else{let g=Lr(Pn(f,d),l)/p;x=zl(d,c,g)}let m=Math.sqrt($n(o,x));if(!Number.isFinite(x.x)||!Number.isFinite(x.z)||m>e*_T)return null;t.push(x)}let i=ns(t);return t.length!==n.length||i<=0||i>=ns(n)||eg(t)||t.some(s=>!Nr(s,n))||t.some(s=>tg(s,n)<e-.001)?null:t}function DT(n,e){let t=vd(n?.polygon);if(t.length<3||ns(t)<=0||eg(t))return null;let i=Math.max(e,0)+cn.wallGap,s=i+cn.outerWidth,r=i+(cn.outerWidth-cn.innerWidth)/2,o=r+cn.innerWidth,a=kl(t,i),c=kl(t,s),l=kl(t,r),u=kl(t,o);return!a||!c||!l||!u?null:{boundary:t,softOuter:a,softInner:c,coreOuter:l,coreInner:u}}function $0(n,e,t){let i=[],s=[];for(let o=0;o<n.length;o+=1){let a=(o+1)%n.length,c=i.length/3;i.push(n[o].x,t,n[o].z,n[a].x,t,n[a].z,e[a].x,t,e[a].z,e[o].x,t,e[o].z),s.push(c,c+2,c+1,c,c+3,c+2)}let r=new Ht;return r.setAttribute("position",new ht(i,3)),r.setIndex(s),r.computeVertexNormals(),r}function md(n,e){let t=new Qt({color:n,depthTest:!0,depthWrite:!1,opacity:0,side:Ct,toneMapped:!1,transparent:!0});return t.userData.baseOpacity=e,t}function Or(n){n.userData.excludeFromCameraFit=!0,n.userData.excludeFromDevicePicking=!0}function LT(n,e,t){let i=DT(n,e);if(!i)return null;let s=n.elevation+cn.floorOffset,r=md(W0,cn.outerOpacity),o=md(W0,cn.innerOpacity),a=new ct;a.name=\`OccupancyRoomGlow:\${n.id}\`,a.visible=!1,Or(a);let c=new nt($0(i.softOuter,i.softInner,s),r),l=new nt($0(i.coreOuter,i.coreInner,s+cn.innerVerticalOffset),o);return c.renderOrder=2,l.renderOrder=3,Or(c),Or(l),a.add(c,l),t.add(a),{currentOpacity:0,duration:0,group:a,innerMaterial:o,outerMaterial:r,roomId:n.id,startOpacity:0,transitionStartedAt:0,targetOccupied:!1}}function OT(n,e=null){let t=n.root.userData.dimensions??{width:.42,depth:.42},i=Math.max(Number(t.width)||.42,.18),s=Math.max(Number(t.depth)||.42,.18),r=n.visual?.pathMotionRoot??n.root,o=new ct;o.name=\`RobotWorkGlow:\${n.id}\`,o.position.y=.008,o.visible=!1,Or(o);let a=md(K0,J0.coreOpacity),c=new nt(new vo(.54,.76,64),a);return c.rotation.x=-Math.PI/2,c.scale.set(i,s,1),c.renderOrder=4,Or(c),o.add(c),r.add(o),n.controlAnchor=n.root,{baseEntityPosition:n.root.position.clone(),baseEntityRotationY:n.root.rotation.y,baseMotionPosition:r.position.clone(),baseMotionRotationY:r.rotation.y,core:c,coreMaterial:a,distance:0,entityRoot:n.root,errorTravelRemaining:0,group:o,illustrativeMotion:Q0(e),lastMotionAt:null,mode:"inactive",motion:null,motionRoot:r,motionSignature:null}}function NT(n,e){let t={x:e.root.position.x,z:e.root.position.z};return(n.rooms??[]).map(s=>({room:s,polygon:vd(s.polygon)})).filter(({polygon:s})=>Nr(t,s)).sort((s,r)=>Math.abs(ns(s.polygon))-Math.abs(ns(r.polygon)))[0]?.room??null}function FT(n){let e=it.clamp(n,0,1);return e**3*(e*(e*6-15)+10)}function j0(n,e,t){if(n.duration>0){let a=(e-n.transitionStartedAt)/n.duration;n.currentOpacity=n.startOpacity+((n.targetOccupied?1:0)-n.startOpacity)*FT(a),(a>=1||t)&&(n.currentOpacity=n.targetOccupied?1:0,n.duration=0)}let i=e%cn.pulseDurationMs/cn.pulseDurationMs,s=(1-Math.cos(i*2*Math.PI))/2,r=n.targetOccupied&&!t&&n.duration===0?1-s*(1-cn.minimumPulseOpacity):1,o=n.currentOpacity*r;return n.outerMaterial.opacity=cn.outerOpacity*o,n.innerMaterial.opacity=cn.innerOpacity*o,n.group.visible=o>1e-4||n.duration>0,n.duration>0||n.targetOccupied&&!t}function _d(n){if(!n.motion)return!1;let e=n.motion.loop?n.distance%n.motion.totalDistance:it.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.find(h=>e<=h.startDistance+h.length)??n.motion.segments[n.motion.segments.length-1],i=it.clamp((e-t.startDistance)/t.length,0,1),s=it.lerp(t.start.x,t.end.x,i),r=it.lerp(t.start.z,t.end.z,i),o=Math.atan2(t.end.x-t.start.x,t.end.z-t.start.z),a=s,c=r,l=o;if(n.motionRoot!==n.entityRoot){let h=s-n.baseEntityPosition.x,d=r-n.baseEntityPosition.z,f=Math.cos(n.baseEntityRotationY),p=Math.sin(n.baseEntityRotationY);a=n.baseMotionPosition.x+f*h-p*d,c=n.baseMotionPosition.z+p*h+f*d,l=n.baseMotionRotationY+o-n.baseEntityRotationY}let u=Math.abs(n.motionRoot.position.x-a)>1e-5||Math.abs(n.motionRoot.position.z-c)>1e-5;return n.motionRoot.position.x=a,n.motionRoot.position.z=c,n.motionRoot.rotation.y=l,u}function UT(n,e,t){let i=Q0(e?.motion)??n.illustrativeMotion;return i?.signature===n.motionSignature?!1:(n.motion=i,n.motionSignature=i?.signature??null,n.distance=0,n.lastMotionAt=t,i?_d(n):(n.motionRoot.position.copy(n.baseMotionPosition),n.motionRoot.rotation.y=n.baseMotionRotationY),!0)}function BT(n){if(n?.availability!=="available")return!1;let e=String(n?.cleaning?.state??"").trim().toLowerCase();return["docked","charging","charged"].includes(e)}function kT(n){if(!n.motion){n.errorTravelRemaining=0;return}let e=n.motion.loop?n.distance%n.motion.totalDistance:it.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.findIndex(o=>e<=o.startDistance+o.length),i=t<0?n.motion.segments.length-1:t,s=n.motion.segments[i],r=Math.max(0,s.startDistance+s.length-e);if(r<Math.max(ai.minimumSegmentLength*4,.12)&&(n.motion.loop||i<n.motion.segments.length-1)){let o=n.motion.segments[(i+1)%n.motion.segments.length];r+=o.length}n.errorTravelRemaining=r}function zT(n,e,t){let i=n.mode!=="inactive",s=!1;if(n.motion){let l=n.lastMotionAt===null?0:it.clamp(e-n.lastMotionAt,0,ai.maximumFrameDeltaMs);n.lastMotionAt=e;let u=t?n.errorTravelRemaining:l/1e3*n.motion.speedMetersPerSecond;if(i&&l>0&&u>0){let h=u;n.mode==="error"&&(h=Math.min(h,n.errorTravelRemaining),n.errorTravelRemaining=Math.max(0,n.errorTravelRemaining-h)),(!t||n.mode==="error")&&(n.distance=n.mode==="returning"?Math.max(0,n.distance-h):n.motion.loop?(n.distance+h)%n.motion.totalDistance:Math.min(n.motion.totalDistance,n.distance+h)),s=_d(n)}}else n.lastMotionAt=e;let r=n.mode==="returning"&&n.motion&&n.distance<=ai.minimumSegmentLength,o=i&&!r;if(n.group.visible=o,!o)return{active:!1,moved:s};let a=n.mode==="error"?xT:n.mode==="returning"?gT:K0;return n.coreMaterial.color.setHex(a),n.coreMaterial.opacity=J0.coreOpacity,{active:!t&&!!n.motion&&(n.mode==="working"&&(n.motion.loop||n.distance<n.motion.totalDistance-ai.minimumSegmentLength)||n.mode==="returning"&&!r||n.mode==="error"&&n.errorTravelRemaining>ai.minimumSegmentLength),moved:s}}function og({activeFloor:n,bindings:e,entities:t,sceneRoot:i,reduceMotion:s=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches===!0}){let r=new ct;r.name="DashboardStateVisuals",Or(r),i.add(r);let o=new Map,a=new Map,c=new Map,l=!1,u=Math.max(.15,...(n.walls??[]).map(f=>Number(f.thickness)||0));for(let f of t.values()){let p=e.get(f.id);if(!p?.deviceId||((f.visual?.assetKey==="robotVacuum"||gd(p.capability).startsWith("vacuum"))&&c.set(f.id,OT(f,f.visual?.pathMotionRoot?rg({activeFloor:n,excludedObjectId:f.id,origin:{x:f.root.position.x,z:f.root.position.z},robotSize:f.root.userData.dimensions}):null)),!yT(p)))continue;let m=NT(n,f);if(!m)continue;if(!o.has(m.id)){let w=LT(m,u/2,r);w&&o.set(m.id,w)}let g=a.get(m.id)??new Set;g.add(p.deviceId),a.set(m.id,g)}return Object.freeze({layer:r,occupancyByRoomId:o,robotByEntityId:c,didMoveRobot:()=>l,step:(f=globalThis.performance?.now()??Date.now())=>{let p=!1;l=!1;for(let x of o.values())p=j0(x,f,s)||p;for(let x of c.values()){let m=zT(x,f,s);p=m.active||p,l=m.moved||l}return p},sync:(f,p=globalThis.performance?.now()??Date.now())=>{for(let[x,m]of c){let g=e.get(x),w=f.get(g?.deviceId),b=m.mode;m.mode=ST(w);let y=UT(m,w,p);m.mode==="error"&&(b!=="error"||y)?kT(m):m.mode!=="error"&&(m.errorTravelRemaining=0),BT(w)&&m.motion&&m.distance!==0&&(m.distance=0,_d(m))}for(let[x,m]of o){let g=[...a.get(x)??[]].some(w=>MT(f.get(w)));m.targetOccupied!==g&&(j0(m,p,s),m.targetOccupied=g,m.startOpacity=m.currentOpacity,m.transitionStartedAt=p,m.duration=s?0:g?cn.fadeInMs:cn.fadeOutMs,s&&(m.currentOpacity=g?1:0))}}})}var ag=Object.freeze({off:0,"30s":3e4,"60s":6e4,"120s":12e4}),tn=Object.freeze({themeMode:"auto",ambientBrightnessPercent:100,shadowsEnabled:!0,shadowIntensityPercent:100,autoBrightness:!0,indoorBrightnessInDarkness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0,autoReturn:"off"});function Fr(n={}){(!n||typeof n!="object")&&(n={});let e=["auto","light","dark"].includes(n.themeMode)?n.themeMode:tn.themeMode,t=typeof n.ambientBrightnessPercent=="number"?n.ambientBrightnessPercent:tn.ambientBrightnessPercent,i=Number.isFinite(t)?Math.min(Math.max(t,0),150):tn.ambientBrightnessPercent,s=typeof n.shadowIntensityPercent=="number"?n.shadowIntensityPercent:tn.shadowIntensityPercent,r=Number.isFinite(s)?Math.min(Math.max(s,0),100):tn.shadowIntensityPercent,o=typeof n.shadowsEnabled=="boolean"?n.shadowsEnabled:tn.shadowsEnabled,a=Object.prototype.hasOwnProperty.call(ag,n.autoReturn)?n.autoReturn:tn.autoReturn;return{themeMode:e,ambientBrightnessPercent:i,ambientBrightnessFactor:i/100,shadowsEnabled:o,shadowIntensityPercent:r,shadowIntensityFactor:r/100,shadowsActive:o&&r>0,autoBrightness:typeof n.autoBrightness=="boolean"?n.autoBrightness:tn.autoBrightness,indoorBrightnessInDarkness:typeof n.indoorBrightnessInDarkness=="boolean"?n.indoorBrightnessInDarkness:tn.indoorBrightnessInDarkness,cameraLocked:typeof n.cameraLocked=="boolean"?n.cameraLocked:tn.cameraLocked,cameraRotationEnabled:typeof n.cameraRotationEnabled=="boolean"?n.cameraRotationEnabled:tn.cameraRotationEnabled,cameraZoomEnabled:typeof n.cameraZoomEnabled=="boolean"?n.cameraZoomEnabled:tn.cameraZoomEnabled,cameraPanEnabled:typeof n.cameraPanEnabled=="boolean"?n.cameraPanEnabled:tn.cameraPanEnabled,showFloorSelector:typeof n.showFloorSelector=="boolean"?n.showFloorSelector:tn.showFloorSelector,showQuickControls:typeof n.showQuickControls=="boolean"?n.showQuickControls:tn.showQuickControls,showDeviceMarkers:typeof n.showDeviceMarkers=="boolean"?n.showDeviceMarkers:tn.showDeviceMarkers,autoReturn:a,autoReturnDelayMs:ag[a]}}var{DEVICE_COMMAND:cg,contactState:Gl,hasPowerState:VT}=dg.default,GT=new D(8.5,12.5,10.5).normalize(),Vl=Object.freeze({outputColorSpace:Nt,toneMapping:mr,toneMappingExposure:1.05}),Jo=["livingLight","patioDoor","window"];function WT(n){let e=Array.isArray(n?.providers)?n.providers:[n?.provider];return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function bd(n,{provider:e=null,providers:t=null}={}){return n?e?n.provider===e:t?t.has(n.provider):!0:!1}function fg(n){n.outputColorSpace=Vl.outputColorSpace,n.toneMapping=Vl.toneMapping,n.toneMappingExposure=Vl.toneMappingExposure}function pg(n=window.location){return["localhost","127.0.0.1"].includes(n.hostname)}function yd(n,e=window.location){if(!pg(e))return!1;let t=new URLSearchParams(e.search),i=t.get("toneMapping");if(i==="none")n.toneMapping=An;else if(i==="aces")n.toneMapping=mr;else return!1;let s=Number(t.get("exposure"));return Number.isFinite(s)&&s>0&&(n.toneMappingExposure=s),!0}function Ko(n){return n?.availability==="available"&&typeof n?.power?.isOn=="boolean"}function mg(n,e,t){let i=Ko(t),s=k0(t);s.known=i,s.on=i&&t.power.isOn;let r=s.on,{bulbMaterial:o,shadeMaterial:a,emissiveMaterials:c=[o].filter(Boolean)}=n.visual,l=new Ge().setRGB(s.rgb.r,s.rgb.g,s.rgb.b,Nt);return c.forEach(u=>{u.color.setHex(i?bi.lampOff:bi.unavailable),u.emissive.copy(r?l:new Ge(0)),u.emissiveIntensity=r&&s.brightness>.001?.2+s.brightness**.72*3.25:0}),a&&(a.color.setHex(i?12819559:9145999),a.emissive.copy(r?l:new Ge(0)),a.emissiveIntensity=r&&s.brightness>.001?.06+s.brightness**.72*.48:0),n.visual.light.color.copy(l),n.visual.lightState=s,s}function gg(n,e,t){let i=Gl(t),s=i!=="unknown",r=i==="open",{panelMaterial:o,frameMaterial:a,baseColor:c,closedAngle:l,openAngle:u,motionRoot:h=n.root,stateMaterials:d}=n.visual,f=h.rotation.y;return h.rotation.y=l+(r?u:0),Array.isArray(d)?d.forEach(({material:p,baseColor:x})=>{p.color.setHex(s?x:bi.unavailable)}):(o.color.setHex(s?c:bi.unavailable),a.color.setHex(s?bi.metal:7633276)),Math.abs(f-h.rotation.y)>1e-8}function lg(n,e,t){let i=!1;return n.kind==="light"&&n.visual?.type==="light"&&mg(n,e,t),n.visual?.type==="contact"&&t?.contact&&(i=gg(n,e,t)),V0(n,t,globalThis.performance?.now()??Date.now()),i}function ug(n,e){return n.size===e.size&&[...n].every(t=>e.has(t))}function Md(n,e=Jo){return new Map(e.map((t,i)=>[t,n[i]??null]))}function Sd(n,e,t=null){return!n||t&&n.provider!==t?null:n.deviceId??e.get(n.slot)??null}function xg(n,e,{bindingSlots:t=Jo,provider:i=null,providers:s=null}={}){let r=Md(e,t),o=new Map;for(let a of n.values()){if(!a.binding)continue;let c=bd(a.binding,{provider:i,providers:s}),l=c?Sd(a.binding,r):null;if(o.set(a.id,{...a.binding,deviceId:l}),c)a.binding.slot&&!r.has(a.binding.slot)&&console.warn(\`Mikonus scene binding \${a.id} uses unknown selector slot \${a.binding.slot}.\`);else{let u=i??[...s??[]].join(", ");console.warn(\`Mikonus scene binding \${a.id} uses unsupported provider \${a.binding.provider}; the active runtime handles \${u}.\`)}}return o}function vg(n,e,{bindingSlots:t=Jo,provider:i=null,providers:s=null}={}){let r=Md(e,t),o=new Set;for(let a of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of a[c]??[]){if(!bd(l.binding,{provider:i,providers:s}))continue;let u=Sd(l.binding,r);u&&o.add(u)}return o}function _g(n,e,{bindingSlots:t=Jo,provider:i=null,providers:s=null}={}){let r=Md(e,t),o=[];for(let a of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of a[c]??[]){if(!bd(l.binding,{provider:i,providers:s}))continue;let u=Sd(l.binding,r);u&&o.push({...l.binding,deviceId:u})}return o}function yg(n,e,t,i){return!n||typeof n.id!="string"||!e.has(n.id)?!1:(i.set(n.id,n),t.has(n.id))}function hg(n,e,t,i){if(!e?.deviceId||!t)return;let s=null;t.missing?s="device is missing":t.availability!=="available"?s="device is unavailable":n.kind==="light"&&!VT(t)?s="power state is missing":n.visual?.type==="contact"&&e.capability==="alarm_contact"&&!t.contact?s="contact state is missing":n.kind==="light"&&!Ko(t)?s="power state is unknown":n.visual?.type==="contact"&&(t.contact||e.capability==="alarm_contact")&&Gl(t)==="unknown"&&(s="contact state is unknown");let r=\`\${n.id}:\${e.deviceId}:\${s}\`;!s||i.has(r)||(i.add(r),console.warn(\`Mikonus binding \${n.id} is neutral because \${s}.\`,t))}function Hl(n,e,t,i){let s=[...e.values()].filter(h=>h.elementType==="door"||h.elementType==="window").map(h=>t.get(h.id)).filter(h=>h&&(h.capability==="alarm_contact"||i.get(h.deviceId)?.contact)),r=s.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>Gl(h)!=="unknown"),o=r.filter(({state:h})=>Gl(h)==="open").length,a;if(r.length===s.length&&s.length>0&&o===0)a="Alles geschlossen";else if(o>0){let h=r.length<s.length?" \\xB7 Status unvollst\\xE4ndig":"";a=\`\${o} offen\${h}\`}else s.length===0||s.every(h=>!h.deviceId)?a="Kontakte nicht zugeordnet":a="Kontaktstatus unvollst\\xE4ndig";let c=[...e.values()].filter(h=>h.kind==="light").map(h=>t.get(h.id)).filter(Boolean),l=c.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>Ko(h)),u="Licht nicht zugeordnet";if(l.length>0){let h=l.filter(({state:d})=>d.power.isOn).length;u=\`\${h} \${h===1?"Licht":"Lichter"} an\`,l.length<c.length&&(u+=" \\xB7 Status unvollst\\xE4ndig")}else c.some(h=>h.deviceId)&&(u="Lichtstatus unbekannt");n.textContent=\`\${a} \\xB7 \${u}\`}function XT(n,{sceneLoad:e=!1}={}){console.error(e?"Mikonus dashboard scene could not be loaded":"Mikonus 3D initialization failed",n);let t=document.getElementById("error");if(!t)return;let i=t.querySelector("strong"),s=t.querySelector("span");e&&(i&&(i.textContent="Mikonus 3D"),s&&(s.textContent="Scene could not be loaded.")),t.hidden=!1}async function Ed({container:n,sceneSource:e,deviceRuntime:t,host:i,options:s={},signal:r=s.signal}){let o=new aa(r),a=()=>o.dispose();o.defer(()=>t?.dispose?.());try{if(o.check(),window.addEventListener("pagehide",a,{once:!0}),o.defer(()=>window.removeEventListener("pagehide",a)),typeof e?.loadScene!="function")throw new TypeError("Dashboard viewer requires a SceneSource with loadScene().");if(typeof t?.loadStates!="function"||typeof t?.subscribe!="function"||typeof t?.execute!="function")throw new TypeError("Dashboard viewer requires a DeviceRuntime.");if(!i||typeof i.getSettings!="function"||typeof i.readTheme!="function")throw new TypeError("Dashboard viewer requires a HostAdapter.");let c=WT(t);if(c.length===0)throw new TypeError("Dashboard DeviceRuntime requires at least one provider id.");let l=s.summaryElement??document.getElementById("floor-summary"),u=s.floorLabel??document.getElementById("floor-label"),h=s.floorSelectorElement??document.getElementById("floor-selector"),d=s.statusHeader??document.querySelector(".status-header"),f=s.sceneShell??n?.closest(".scene-shell");if(!n||!l||!u||!h||!d||!f)throw new Error("Widget container is missing.");let p=(E,L)=>i.translate?.(E,L)??L,x=typeof s.now=="function"?s.now:()=>new Date,m=Number(s.modelNorthDegrees),g=Number.isFinite(m)?m:0,w=i.readSolar?.()??null,b=Fr(i.getSettings()),y=$o(s.timeOfDay),T=Ol({mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,...i.readTheme()}),S=hd({width:f.clientWidth,height:f.clientHeight,devicePixelRatio:window.devicePixelRatio});dd(S,{rootElement:document.documentElement,shellElement:f}),f.classList.toggle("camera-locked",b.cameraLocked);let C=ru({container:n,sceneShell:f,statusHeader:d,summaryElement:l});o.defer(()=>C.dispose()),C.setEnvironment(T);let _=async(E={})=>{let L=await o.wait(e.loadScene({...E,signal:o.signal}));return o.check(),qd(L)},A;try{A=await _(),o.check()}catch(E){throw E.dashboardSceneLoad=!0,E}let I=Number(A.scene?.metadata?.modelNorthDegrees);Number.isFinite(I)&&(g=I),T=Ol({mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,...i.readTheme()}),C.setEnvironment(T);let P=new hl({alpha:!0,antialias:!0,powerPreference:"high-performance"});o.defer(()=>P.forceContextLoss()),o.defer(()=>P.dispose()),o.defer(()=>P.domElement.remove()),P.domElement.classList.add("mikonus-renderer-canvas"),P.setClearColor(0,0),fg(P),Nl(T,{renderer:P,rootElement:document.documentElement});let k=yd(P,i.location??window.location);s.onEnvironmentChange?.(T),o.check(),Nm(P),Wh(P,b.shadowsActive),P.setPixelRatio(S.renderPixelRatio),P.domElement.setAttribute("aria-label",p("deviceDetails.sceneLabel","Rotate and zoom the Mikonus floor; tap a light or hold a device for details")),P.domElement.setAttribute("tabindex","0"),n.appendChild(P.domElement);let F=new Kt(Tr,1,.1,100);F.position.set(8.5,12.5,10.5);let B=new ml(F,P.domElement);o.defer(()=>B.dispose());let H=Rl(P.domElement);o.defer(H),B.target.set(0,.55,0),B.enableDamping=!1,B.enablePan=b.cameraPanEnabled,B.enableRotate=b.cameraRotationEnabled,B.enableZoom=b.cameraZoomEnabled,B.rotateSpeed=.65,B.zoomSpeed=.8,B.minDistance=5,B.maxDistance=100,B.minPolarAngle=it.degToRad(18),B.maxPolarAngle=1.28,B.zoomToCursor=!0,B.enabled=!b.cameraLocked,B.update();let X=i.getSelectedDeviceIds?.()??[],Y={bindingSlots:i.bindingSlots??Jo,providers:new Set(c)},V=new Map,j=new Set,W=null,ie=null,J=null,Ee=new Set,Ye=null,qe=null,K=null,le=null,oe=0,Re=!1,He=!1,Le=!1,Je=!1,ze=!0,re=()=>{},ce=()=>{f.classList.toggle("camera-locked",b.cameraLocked),B.enabled=!He&&!b.cameraLocked,B.enableRotate=!b.cameraLocked&&b.cameraRotationEnabled,B.enableZoom=!b.cameraLocked&&b.cameraZoomEnabled,B.enablePan=!b.cameraLocked&&b.cameraPanEnabled};o.defer(()=>{oe&&window.cancelAnimationFrame(oe),ie?.dispose(),ie=null,W=null,J=null,Ee.clear(),V.clear()});let ne=()=>{o.disposed||oe||!W||(oe=window.requestAnimationFrame(E=>{if(oe=0,W){let L=G0(W.entities,E),O=W.stateVisuals?.step(E)===!0;L&&(ze=!0),W.stateVisuals?.didMoveRobot()===!0&&b.shadowsActive&&(ze=!0),ze&&(P.shadowMap.needsUpdate=!0),P.render(W.scene,F);let z=K?.layout(F,P.domElement)??[];qe?.layout(F,P.domElement,z),ze=!1,(L||O)&&ne()}}))},fe=E=>{ze=!0,W&&(W.shadowInvalidationReasons??=new Set,W.shadowInvalidationReasons.add(E)),ne()},ge=E=>{k&&yd(P),C.setEnvironment(E),s.onEnvironmentChange?.(E),fe("environmentChanged")},Be=E=>(o.disposed||(y=$o(E),T=jo(T,i.readTheme(),{mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,renderer:P,rootElement:document.documentElement,runtimes:ie?.cachedRuntimes??[],afterApply:ge,requestRender:ne})),T),Oe=()=>{if(o.disposed)return!1;let E=hd({width:f.clientWidth,height:f.clientHeight,devicePixelRatio:window.devicePixelRatio}),L=!U0(S,E);return S=E,L&&dd(S,{rootElement:document.documentElement,shellElement:f}),le?.layout(Fl(S,d.clientWidth)),L},We=E=>{o.disposed||(T=jo(T,E,{mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,renderer:P,rootElement:document.documentElement,runtimes:ie?.cachedRuntimes??[],afterApply:ge,requestRender:ne}))};re=i.subscribeTheme?.(We)??(()=>{}),o.defer(re);let Xe=(E=i.readSolar?.()??null)=>{o.disposed||(w=E,T=jo(T,i.readTheme(),{mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,renderer:P,rootElement:document.documentElement,runtimes:ie?.cachedRuntimes??[],afterApply:ge,requestRender:ne}))},N=i.subscribeSolar?.(Xe)??(()=>{});o.defer(N);let dt=window.setInterval(()=>Xe(),6e4);o.defer(()=>window.clearInterval(dt)),o.check();let Qe=()=>{if(!W?.cameraFit)return;let E=B.target.distanceTo(W.cameraFit.target);td(F,B.target,W.cameraFit.radius+E),Is(F,W.architectureCenterPoints)},R=E=>E.schemaVersion!==2?null:i.readFloor?.(E.sceneId)??null,v=(E,L)=>{E.schemaVersion===2&&i.writeFloor?.(E.sceneId,L)},G=()=>{!J?.sceneId||!W?.floorId||i.writeCamera?.(J.sceneId,W.floorId,{position:F.position.toArray(),target:B.target.toArray(),fov:F.fov,zoom:F.zoom,minDistance:B.minDistance,maxDistance:B.maxDistance,userAdjustedView:Je})},q=()=>{!J?.sceneId||!W?.floorId||i.removeCamera?.(J.sceneId,W.floorId)},$=new Sl({camera:F,controls:B,delayMs:b.autoReturnDelayMs,isBlocked:()=>b.cameraLocked,requestRender:ne,updateClipping:Qe,onComplete:()=>{Je=!1,q(),ne()}});o.defer(()=>$.dispose());let he=()=>{if(!W)return;let E=Math.max(n.clientWidth,1),L=Math.max(n.clientHeight,1),O=Qm(F,W.architectureFitPoints,W.sceneBoundsPoints,E/L,GT,{centeringPoints:W.architectureCenterPoints,targetPoints:W.architectureCenterPoints,allowQuarterTurn:!1});O&&(W.cameraFit={distance:O.distance,radius:O.radius,target:O.target.clone()},B.target.copy(O.target),B.minDistance=O.minDistance,B.maxDistance=O.maxDistance,B.update(),$.setHomeView({position:F.position,target:B.target})),ne()},de=(E,L)=>{Je=!1,he();let O=i.readCamera?.(E?.sceneId,L);return O?(F.position.fromArray(O.position),F.fov=O.fov,F.zoom=O.zoom,B.target.fromArray(O.target),B.minDistance=O.minDistance,B.maxDistance=O.maxDistance,F.lookAt(B.target),B.update(),Je=O.userAdjustedView,Qe(),Je&&$.schedule(),ne(),!0):!1},Z=()=>{if(o.disposed)return;Oe();let E=Math.max(n.clientWidth,1),L=Math.max(n.clientHeight,1);if(P.setPixelRatio(S.renderPixelRatio),P.setSize(E,L,!1),W&&!Je)he();else if(W){let O=e0(F,E/L,{worldPoints:W.architectureFitPoints,centeringPoints:W.architectureCenterPoints,target:B.target});O.expandedForClipping&&(B.maxDistance=Math.max(B.maxDistance,O.distance*1.05),B.update()),ne()}},te=()=>{Re=!0,Le=!1},xe=()=>{Re&&(Le||$.cancel(),Le=!0,Je=!0),Qe(),ne()},Pe=()=>{Re=!1,Le&&(G(),$.schedule()),Le=!1};o.defer(()=>{B.removeEventListener("start",te),B.removeEventListener("change",xe),B.removeEventListener("end",Pe)}),B.addEventListener("start",te),B.addEventListener("change",xe),B.addEventListener("end",Pe);let ye=new ResizeObserver(Z);o.defer(()=>ye.disconnect()),ye.observe(n);let _e=({scene:E,metadata:L},O)=>{let z=Zm({...E,activeFloorId:O});try{Xh(z.lighting,b.ambientBrightnessFactor),Nl(T,{runtimes:[z]}),qh(z.lighting,z.entities,b.shadowIntensityFactor);let Q=Ho(z.sceneRoot),ue=Ho(z.sceneRoot,z.entities),me=ue.map(Ze=>Ze.clone()),Se=xg(z.entities,X,Y),Ae=new Set([...Se.values()].map(Ze=>Ze.deviceId).filter(Boolean)),je=og({activeFloor:z.activeFloor,bindings:Se,entities:z.entities,sceneRoot:z.sceneRoot});return{...z,description:E,floorId:O,bindings:Se,metadata:L,architectureCenterPoints:Q,architectureFitPoints:ue,sceneBoundsPoints:me,stateVisuals:je,runtimeDeviceIds:Ae,warnedBindings:new Set}}catch(Q){throw Ml(z.scene),Q}},Fe=E=>{let L=E.activeSmartLights??new Set,O=!1;for(let z of E.entities.values()){let Q=E.bindings.get(z.id),ue=V.get(Q?.deviceId);Q&&hg(z,Q,ue,E.warnedBindings),O=lg(z,Q,ue)||O}return O&&(E.architectureCenterPoints=Ho(E.sceneRoot)),E.activeSmartLights=jh(E.entities),E.stateVisuals.sync(V),yl(E.lighting,E.entities,b.shadowsActive),Hl(l,E.entities,E.bindings,V),{contactGeometryChanged:O,lightShadowSelectionChanged:!ug(L,E.activeSmartLights)}},Ne=(E=W)=>{E&&(qe?.sync({entities:E.entities,bindings:E.bindings,statesByDeviceId:V}),qe?.setEnabled(b.showDeviceMarkers),K?.sync({enabled:b.showQuickControls&&!He,entities:E.entities,bindings:E.bindings,statesByDeviceId:V}))},$e=()=>{let E=f.getBoundingClientRect(),L=d.getBoundingClientRect(),O=Math.max(0,Math.ceil(L.bottom-E.top+4));f.style.setProperty("--scene-header-height",\`\${O}px\`)},U=(E=J,L=W?.floorId)=>{let O=b.showFloorSelector&&E?.schemaVersion===2&&E.floors.length>1;u.hidden=O,le?.update({floors:O?E.floors:[],activeFloorId:L,availableWidth:Fl(S,d.clientWidth)}),$e()},pe=()=>({position:F.position.clone(),quaternion:F.quaternion.clone(),aspect:F.aspect,fov:F.fov,zoom:F.zoom,near:F.near,far:F.far,target:B.target.clone(),minDistance:B.minDistance,maxDistance:B.maxDistance,cameraFit:W?.cameraFit,homeView:$.homeView&&{position:$.homeView.position.clone(),target:$.homeView.target.clone()},userAdjustedView:Je}),ee=(E,L)=>{F.position.copy(E.position),F.quaternion.copy(E.quaternion),F.aspect=E.aspect,F.fov=E.fov,F.zoom=E.zoom,F.near=E.near,F.far=E.far,F.updateProjectionMatrix(),B.target.copy(E.target),B.minDistance=E.minDistance,B.maxDistance=E.maxDistance,L&&(L.cameraFit=E.cameraFit),E.homeView?$.setHomeView(E.homeView):$.homeView=null,Je=E.userAdjustedView},ve=(E,{sceneUpdate:L=!1}={})=>{o.check(),Ye?.close(),$.cancel(),G(),o.check();let O=Number(E.scene?.metadata?.modelNorthDegrees),z=Number.isFinite(O)?O:Number.isFinite(m)?m:0;z!==g&&(g=z,Xe(w));let Q,ue;try{Q=new El({description:E.scene,initialFloorId:L?i0(E.scene,J?.sceneId,W?.floorId):R(E.scene),createRuntime:Ce=>_e(E,Ce),disposeRuntime:Ce=>Ml(Ce.scene)}),ue=Q.activate().runtime,Fe(ue)}catch(Ce){throw Q?.dispose(),Ce}let me=ie,Se=W,Ae=J,je=Ee,Ze=pe();ie=Q,W=ue,J=E.scene,Ee=vg(E.scene,X,Y);try{t.configureBindings?.(_g(E.scene,X,Y)),o.check(),fe("sceneChanged"),u.textContent=ue.activeFloor.name,U(E.scene,ue.floorId),de(E.scene,ue.floorId),Ne(ue),v(E.scene,ue.floorId),o.check()}catch(Ce){throw o.disposed?(me?.dispose(),Q.dispose(),ie=null,W=null,o.signal.reason):(ie=me,W=Se,J=Ae,Ee=je,ee(Ze,Se),u.textContent=Se?.activeFloor.name??"\\u2013",Se&&Hl(l,Se.entities,Se.bindings,V),Ne(Se),U(Ae,Se?.floorId),Q.dispose(),ne(),Ce)}return me?.dispose(),ue},Me=E=>{if(o.disposed||!W||!yg(E,Ee,W.runtimeDeviceIds,V))return;let O=W.activeSmartLights??new Set,z=!1;for(let Q of W.entities.values()){let ue=W.bindings.get(Q.id);ue?.deviceId===E.id&&(hg(Q,ue,E,W.warnedBindings),z=lg(Q,ue,E)||z)}z&&(W.architectureCenterPoints=Ho(W.sceneRoot),Is(F,W.architectureCenterPoints)),W.activeSmartLights=jh(W.entities),W.stateVisuals.sync(V),yl(W.lighting,W.entities,b.shadowsActive),Hl(l,W.entities,W.bindings,V),Ye?.updateState(E.id,E),Ne(),z?fe("contactGeometryChanged"):ug(O,W.activeSmartLights)||fe("lightStateChanged"),ne()},se=async E=>{o.check();let L=[...E.runtimeDeviceIds];if(L.length!==0)try{let O=await o.wait(t.loadStates(L,{signal:o.signal}));if(o.check(),W!==E||!Array.isArray(O))return;O.forEach(Q=>{Q&&typeof Q.id=="string"&&V.set(Q.id,Q)});let z=Fe(E);Ne(E),z.contactGeometryChanged?(Is(F,E.architectureCenterPoints),fe("contactGeometryChanged")):z.lightShadowSelectionChanged&&fe("lightStateChanged"),ne()}catch(O){if(o.disposed)throw o.signal.reason;console.warn("Could not load the configured dashboard device states.",O)}},Ie=async E=>{if(o.disposed||!ie||!J)return null;if(E===ie.activeFloorId)return U(J,E),W;Ye?.close(),$.cancel(),G(),o.check();let L=W,O=ie.activeFloorId,z=pe(),Q;try{Q=ie.activate(E).runtime,Fe(Q),W=Q,fe("floorChanged"),u.textContent=Q.activeFloor.name,U(J,E),de(J,E),Ne(Q),v(J,E),o.check()}catch(ue){throw o.disposed?o.signal.reason:(O&&ie.activate(O),W=L,ee(z,L),u.textContent=L?.activeFloor.name??"\\u2013",L&&Hl(l,L.entities,L.bindings,V),Ne(L),U(J,O),ne(),ue)}return await se(Q),Q},Te=Promise.resolve(),Et=async E=>{if(o.disposed||typeof E?.revision=="string"&&E.revision===W?.metadata?.revision)return;let L=await _({allowFallback:!1});if(o.check(),L.metadata.revision===W?.metadata?.revision)return;let O=ve(L,{sceneUpdate:!0});await se(O)},mt=E=>{Te=Te.then(()=>Et(E)).catch(L=>{o.disposed||console.error("Runtime dashboard scene reload failed; keeping the current scene.",L)})},In=E=>{Te=Te.then(()=>Ie(E)).catch(L=>{o.disposed||(console.error("Floor switch failed; keeping the current floor.",L),U())})};le=new Tl({host:h,translate:p,onSelect:In}),o.defer(()=>le.dispose());let xn=new ResizeObserver(()=>{o.disposed||(le?.layout(Fl(S,d.clientWidth)),$e())});o.defer(()=>xn.disconnect()),xn.observe(d),$e();let ql=t.subscribe(Me);o.defer(ql),o.check();let Yl=e.subscribe?.(mt)??(()=>{});o.defer(Yl),o.check();let na=new Ss,Ur=new ae,Dn=null,jn=null,ia=()=>{let E=Dn?[...Dn.activePointers.keys()]:[];Dn?.reset(),jn=null;for(let L of E)try{P.domElement.hasPointerCapture?.(L)&&P.domElement.releasePointerCapture(L)}catch{}},Bn=async(E,L,{directLightTap:O=!1}={})=>{if(o.disposed)return;let z=W?.entities.get(E),Q=W?.bindings.get(E),ue=V.get(Q?.deviceId),me=!!(z&&Q?.deviceId);if(!(O?me&&z.kind==="light"&&Ko(ue)&&L.type===cg.SET_POWER:me&&Si(ue,L))){console.warn(\`The 3D object \${E} cannot execute \${L.type} because its state or control is unavailable.\`);return}if(!j.has(Q.deviceId)){j.add(Q.deviceId),Ye?.setBusy(Q.deviceId,!0),K?.setDeviceBusy(Q.deviceId,!0),i.feedback?.();try{await t.execute(Q.deviceId,L,Q)}catch(Ae){console.warn(\`Could not execute \${L.type} for \${E}.\`,Ae)}finally{if(o.disposed)return;j.delete(Q.deviceId),Ye?.setBusy(Q.deviceId,!1),K?.setDeviceBusy(Q.deviceId,!1)}}},Os=E=>{let L=W?.bindings.get(E),O=V.get(L?.deviceId);Ko(O)&&Bn(E,{type:cg.SET_POWER,value:!O.power.isOn},{directLightTap:!0})},Ns=new Wo({host:C.popupHost,onCommand:Bn,translate:p});o.defer(()=>Ns.dispose());let sa=s.createDeviceDetailsAdapter?.({overlay:Ns})??new Xo({overlay:Ns});Ye=new Cl({adapters:Object.fromEntries(c.map(E=>[E,sa])),onOpenChange:E=>{He=E,E&&ia(),f.classList.toggle("device-details-open",E),qe?.setSuppressed(E),ce(),Ne(),E?$.cancel():ne()}}),o.defer(()=>Ye.dispose()),o.check();let is=(E,L,O)=>p0({camera:F,canvas:P.domElement,clientX:E,clientY:L,pickables:O,pointer:Ur,raycaster:na,scene:W?.scene}),Fs=E=>{if(o.disposed)return!1;let L=W?.bindings.get(E),O=g0({entityId:E,binding:L,state:V.get(L?.deviceId)});return!O||!Ye?.open(O)?!1:(i.feedback?.(),!0)};K=new Vo({host:C.markerHost,onCommand:Bn,translate:p}),o.defer(()=>K.dispose()),qe=new Yo({host:C.markerHost,onOpenDetails:Fs,onTogglePower:Os,translate:p}),o.defer(()=>qe.dispose()),Dn=new Cr({onLongPress:({clientX:E,clientY:L})=>{let O=is(E,L,W?.devicePickables??[]);return!O||(jn&&(ee(jn,W),jn=null,Le=!1,Re=!1,Qe(),ne()),!Fs(O.sceneObjectId))?!1:(window.getSelection?.()?.removeAllRanges(),!0)}}),o.defer(()=>Dn.dispose());let ss=E=>{E.cancelable&&E.preventDefault(),Dn.activePointers.size===0&&(jn=pe()),Dn.pointerDown(E)},Br=E=>{Dn.pointerMove(E)},kr=E=>{let L=Dn.pointerUp(E);if(jn=null,!L)return;let O=is(L.clientX,L.clientY,W?.pickables??[]);O&&Os(O.sceneObjectId)},Us=E=>{Dn.pointerCancel(E),jn=null},ra=E=>E.preventDefault();o.defer(()=>{P.domElement.removeEventListener("pointerdown",ss,!0),P.domElement.removeEventListener("pointermove",Br,!0),P.domElement.removeEventListener("pointerup",kr,!0),P.domElement.removeEventListener("pointercancel",Us,!0),P.domElement.removeEventListener("lostpointercapture",Us,!0),P.domElement.removeEventListener("contextmenu",ra)}),P.domElement.addEventListener("pointerdown",ss,!0),P.domElement.addEventListener("pointermove",Br,!0),P.domElement.addEventListener("pointerup",kr,!0),P.domElement.addEventListener("pointercancel",Us,!0),P.domElement.addEventListener("lostpointercapture",Us,!0),P.domElement.addEventListener("contextmenu",ra);let $l=E=>{if(o.disposed)return b;let L=b,O=Fr(E);if(JSON.stringify(L)===JSON.stringify(O))return b;b=O,ce(),$.delayMs=b.autoReturnDelayMs,b.cameraLocked||b.autoReturnDelayMs<=0?$.cancel():Je&&$.schedule();let z=ie?.cachedRuntimes??[];T=jo(T,i.readTheme(),{mode:b.themeMode,timeOfDay:y,autoBrightness:b.autoBrightness,indoorBrightnessInDarkness:b.indoorBrightnessInDarkness,at:x(),solarPosition:w,modelNorthDegrees:g,renderer:P,rootElement:document.documentElement,runtimes:z,afterApply:ge,requestRender:ne});for(let Q of z)Xh(Q.lighting,b.ambientBrightnessFactor),qh(Q.lighting,Q.entities,b.shadowIntensityFactor),yl(Q.lighting,Q.entities,b.shadowsActive);return Wh(P,b.shadowsActive),U(),Ne(),b.shadowsActive&&(!L.shadowsActive||L.shadowIntensityPercent!==b.shadowIntensityPercent)?fe("settingsChanged"):ne(),b},oa=ve(A);Z(),await se(oa),o.check();let M=i.getInitialDetailsDeviceId?.();if(M){let E=[...oa.bindings].find(([,L])=>L.deviceId===M);E&&Fs(E[0])}return Object.freeze({dispose:a,destroy:a,getEnvironment:()=>T,getSettings:()=>b,requestRender:ne,updateSettings:$l,setTimeOfDay:Be})}catch(c){throw a(),c.name!=="AbortError"&&XT(c,{sceneLoad:c.dashboardSceneLoad===!0}),c}}var qT="mikonus.camera-view-v2";function wd(n,e,t){return[qT,typeof t=="string"&&t?t:"default",n,e].map(s=>encodeURIComponent(String(s))).join(":")}function bg(n){return Array.isArray(n)&&n.length===3&&n.every(Number.isFinite)}function Mg(n){return!n||typeof n!="object"||!bg(n.position)||!bg(n.target)||!Number.isFinite(n.fov)||n.fov<=0||n.fov>=180||!Number.isFinite(n.zoom)||n.zoom<=0||!Number.isFinite(n.minDistance)||n.minDistance<=0||!Number.isFinite(n.maxDistance)||n.maxDistance<n.minDistance?null:{position:[...n.position],target:[...n.target],fov:n.fov,zoom:n.zoom,minDistance:n.minDistance,maxDistance:n.maxDistance,userAdjustedView:n.userAdjustedView===!0}}var Qo=class{constructor({storage:e,widgetInstanceId:t}){this.storage=e,this.widgetInstanceId=t}read(e,t){try{let i=this.storage?.getItem(wd(e,t,this.widgetInstanceId));return i?Mg(JSON.parse(i)):null}catch(i){return console.debug("Could not read the preserved floor camera view.",i),null}}write(e,t,i){let s=Mg(i);if(!s)return!1;try{return this.storage?.setItem(wd(e,t,this.widgetInstanceId),JSON.stringify(s)),!0}catch(r){return console.debug("Could not preserve the floor camera view.",r),!1}}remove(e,t){try{this.storage?.removeItem(wd(e,t,this.widgetInstanceId))}catch(i){console.debug("Could not clear the preserved floor camera view.",i)}}};function Td(n){if(typeof n!="function")return"light";try{return n("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"light"}}var Wl=class{constructor(){this.values=new Map}getItem(e){return this.values.get(e)??null}setItem(e,t){this.values.set(e,String(t))}removeItem(e){this.values.delete(e)}},ea=class{constructor({settings:e={},translations:t={},initialDetailsDeviceId:i=null,instanceId:s="browser-host",windowObject:r=window,storage:o=new Wl}={}){this.window=r,this.location=r.location,this.settings=Fr(e),this.translations=t,this.initialDetailsDeviceId=i,this.storage=o,this.cameraViewStore=new Qo({storage:o,widgetInstanceId:s}),this.instanceId=s}translate(e,t){return this.translations[e]??t}getSettings(){return this.settings}getSelectedDeviceIds(){return[]}getInitialDetailsDeviceId(){return this.initialDetailsDeviceId}readTheme(){return{hostTheme:null,systemTheme:Td(this.window.matchMedia?.bind(this.window))}}subscribeTheme(e){let t=this.window.matchMedia?.("(prefers-color-scheme: dark)"),i=()=>e(this.readTheme());return typeof t?.addEventListener=="function"?t.addEventListener("change",i):t?.addListener?.(i),i(),()=>{typeof t?.removeEventListener=="function"?t.removeEventListener("change",i):t?.removeListener?.(i)}}readSolar(){return null}subscribeSolar(){return()=>{}}feedback(){}readFloor(e){return this.storage.getItem(wl(e,this.instanceId))}writeFloor(e,t){this.storage.setItem(wl(e,this.instanceId),t)}readCamera(e,t){return this.cameraViewStore.read(e,t)}writeCamera(e,t,i){return this.cameraViewStore.write(e,t,i)}removeCamera(e,t){this.cameraViewStore.remove(e,t)}};var Sg=kn(Qi()),{DEVICE_COMMAND:lP}=Sg.default;var Ad=kn(tu()),ta=class{constructor({url:e,transformScene:t=s=>s,load:i=Ad.default.loadDashboardScene}){this.url=e,this.transformScene=t,this.load=i}async loadScene({signal:e}={}){e?.throwIfAborted();let t=await this.load(this.url,{signal:e});e?.throwIfAborted();let i=this.transformScene(t),{activeFloorId:s,...r}=i,o=Ad.default.validateDashboardScene(r);return{scene:o,metadata:{schemaVersion:o.schemaVersion,sceneId:o.sceneId,revision:\`\${o.sceneId}:static\`,source:"static"}}}subscribe(){return()=>{}}};var Eg=kn(Qi()),xP=Eg.default.DEVICE_COMMAND;var Xl=class extends ea{constructor({themeSource:e,solarSource:t,...i}){super(i),this.themeSource=e,this.solarSource=t}readTheme(){return{...super.readTheme(),hostTheme:this.themeSource?.read()??null}}subscribeTheme(e){let t=()=>e(this.readTheme()),i=this.themeSource?.subscribe(t)??(()=>{}),s=super.subscribeTheme(t);return()=>{i(),s()}}readSolar(){return this.solarSource?.read()??null}subscribeSolar(e){return this.solarSource?.subscribe(e)??(()=>{})}};document.addEventListener("mikonus-connect",async n=>{let{runtime:e,scene:t,sceneSource:i,themeSource:s,solarSource:r,storage:o,presentationSettings:a,signal:c,initializeRuntime:l,onReady:u,onError:h}=n.detail;try{l(Si);let d=!0,f=i?{async loadScene(x){let m=await(d?i.waitUntilReady(x):i.loadScene(x));return d=!1,m},subscribe:x=>i.subscribe(x)}:new ta({url:"reference",load:async()=>t}),p=await Ed({container:document.getElementById("viewport"),sceneSource:f,deviceRuntime:e,host:new Xl({instanceId:"ha-card",storage:o,themeSource:s,solarSource:r,settings:a}),signal:c,options:{timeOfDay:"auto",sceneShell:document.getElementById("shell"),statusHeader:document.getElementById("header"),summaryElement:document.getElementById("summary"),floorLabel:document.getElementById("floor-label"),floorSelectorElement:document.getElementById("floor-selector")}});u(p)}catch(d){h(d)}},{once:!0});window.frameElement.dispatchEvent(new CustomEvent("mikonus-frame-ready"));})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
`;var be=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;font:14px system-ui,sans-serif;color:#222;background:transparent}
#shell{position:relative;display:flex;flex-direction:column;width:100%;height:100%}
#header{position:absolute;inset:0 0 auto;z-index:4;background:transparent;pointer-events:none;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:12px;min-height:56px}
#header>*{pointer-events:auto}
#viewport{position:relative;flex:1;width:100%;min-height:180px;overflow:hidden}
#viewport canvas{display:block;width:100%;height:100%}
#summary{color:var(--dashboard-scene-text-secondary,var(--dashboard-ui-text-primary));flex:0 0 auto;margin:0;padding:4px 12px}button,select,input{font:inherit}button,select{min-height:44px}
[hidden]{display:none!important}#error{padding:12px}
</style></head><body><main id="shell"><header id="header"><span id="floor-label"></span><div id="floor-selector"></div></header><div id="viewport"></div><p id="summary"></p></main><p id="error" hidden></p></body></html>`;function ae({container:i,runtime:e,scene:t,sceneSource:r,themeSource:n,solarSource:a,storage:s,presentationSettings:o,onReady:l,onError:M}){let c=document.createElement("iframe");c.title="Mikonus 3D Dashboard",c.style.cssText="display:block;width:100%;height:100%;border:0";let u=null,h=!1,g=o,v=new AbortController,d=URL.createObjectURL(new Blob([ne],{type:"text/javascript"})),f=()=>{if(!h){h=!0,v.abort(),c.removeEventListener("mikonus-frame-ready",V),c.removeEventListener("load",H);try{u?.dispose()}finally{u=null,e.dispose(),c.remove(),URL.revokeObjectURL(d)}}},_=p=>{h||(f(),M(p))},V=()=>{if(!h)try{c.contentDocument.dispatchEvent(new c.contentWindow.CustomEvent("mikonus-connect",{detail:{runtime:e,scene:t,sceneSource:r,themeSource:n,solarSource:a,storage:s,presentationSettings:g,signal:v.signal,initializeRuntime:p=>e.configureCommandSupport(p),onReady:p=>{if(URL.revokeObjectURL(d),h){p.dispose();return}u=p,u.updateSettings?.(g),l()},onError:_}}))}catch(p){_(p)}},H=()=>{if(!h)try{let p=c.contentDocument.createElement("script");p.src=d,p.onerror=()=>_(new Error("Renderer script could not be loaded. Check the browser content policy.")),c.contentDocument.body.append(p)}catch(p){_(p)}};return c.addEventListener("load",H,{once:!0}),c.addEventListener("mikonus-frame-ready",V,{once:!0}),c.srcdoc=be,i.append(c),{dispose:f,updateSettings(p){g=p,u?.updateSettings?.(p)}}}document.querySelector("home-assistant")&&await customElements.whenDefined("home-assistant");var O="mikonus-3d-card",se="mikonus-3d-card-editor";customElements.get(se)||customElements.define(se,re());customElements.get(O)||customElements.define(O,te(ae));window.customCards??=[];window.customCards.some(i=>i.type===O)||window.customCards.push({type:O,name:"Mikonus 3D",preview:!1,description:"Mikonus Dashboard Scene v2 mit Home Assistant Ger\xE4ten."});
