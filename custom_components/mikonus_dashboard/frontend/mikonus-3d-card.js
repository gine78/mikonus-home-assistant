var w="homeAssistant",E=/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/,H=new Set(["light","switch","cover","climate","lock","vacuum","binary_sensor"]),ae={light:["power","brightness","color","colorTemperature"],switch:["power"],cover:["position","coverMovement","openState"],climate:["currentTemperature","targetTemperature","humidity","hvacMode","hvacAction"],lock:["lockState"],vacuum:["startStop","cleaningState","returnToBase","batteryLevel","chargingState"],binary_sensor:["motion","occupancy","openState","smokeAlarm","waterLeak","alarm"]},se={motion:["motion","activity","motion"],occupancy:["occupancy","activity","occupancy"],presence:["occupancy","activity","presence"],opening:["contact","contact","openState"],door:["contact","contact","openState"],window:["contact","contact","openState"],smoke:["smoke","safety","smoke"],moisture:["water","safety","water"]},g=i=>typeof i=="number"&&Number.isFinite(i)?i:null,M=(i,e,t)=>g(i)===null?null:Math.max(e,Math.min(t,i)),V=i=>Array.isArray(i)?[...new Set(i.filter(e=>typeof e=="string"))].sort():[],O=(i,e,t)=>Object.hasOwn(i?.services?.[e]??{},t);function N(i){if(!i||i.provider!==w)return"unsupported provider";if(typeof i.deviceId!="string"||!E.test(i.deviceId))return"invalid entity id";if(Object.hasOwn(i,"slot"))return"HA bindings require deviceId, not slot";let e=i.deviceId.split(".")[0];return H.has(e)?ae[e].includes(i.capability)?null:"capability does not match entity domain":"unsupported domain"}function S(i,e="missing"){return{id:i,provider:w,name:null,deviceClass:null,availability:e,missing:e==="missing",power:null,light:null,contact:null,cover:null,climate:null,lock:null,cleaning:null,activity:null,safety:null,health:null,motion:null,controls:{}}}function oe(i){let e=i.hs_color;if(Array.isArray(e)&&g(e[0])!==null&&g(e[1])!==null)return{hue:M(e[0],0,360)/360,saturation:M(e[1],0,100)/100};let t=i.rgb_color;if(!Array.isArray(t)||t.length!==3||t.some(u=>g(u)===null))return null;let[r,n,a]=t.map(u=>M(u,0,255)/255),s=Math.max(r,n,a),o=Math.min(r,n,a),l=s-o;return{hue:((l===0?0:s===r?(n-a)/l%6:s===n?(a-r)/l+2:(r-n)/l+4)/6+1)%1,saturation:s===0?0:l/s}}function G(i,e,t,r=[]){if(!e)return S(i);let n=i.split(".")[0],a=S(i,"unavailable"),s=e.attributes??{};if(a.name=typeof s.friendly_name=="string"?s.friendly_name:i,a.deviceClass=n,!E.test(i)||e.entity_id!==i||!H.has(n)||!r.some(h=>!N(h))||typeof e.state!="string"||["unknown","unavailable"].includes(e.state))return a;let o=e.state;a.availability="available";let l=h=>O(t,n,h),p=Number.isInteger(s.supported_features)?s.supported_features:0,u=h=>(p&h)===h,c=a.controls;if(n==="light"||n==="switch"){if(!["on","off"].includes(o))return{...a,availability:"unavailable"};if(a.power={isOn:o==="on"},c.setPower=l("turn_on")&&l("turn_off"),n==="light"){let h=V(s.supported_color_modes),_=h.some(y=>["brightness","color_temp","hs","xy","rgb","rgbw","rgbww","white"].includes(y)),v=h.some(y=>["hs","xy","rgb","rgbw","rgbww"].includes(y)),m=g(s.min_color_temp_kelvin),f=g(s.max_color_temp_kelvin);a.light={brightness:g(s.brightness)===null?null:M(s.brightness,0,255)/255,color:oe(s),colorTemperatureKelvin:g(s.color_temp_kelvin),mode:s.color_mode==="color_temp"?"temperature":["hs","xy","rgb","rgbw","rgbww"].includes(s.color_mode)?"color":null},_&&l("turn_on")&&(c.setBrightness={min:0,max:1,step:1/255}),c.setColor=v&&l("turn_on"),h.includes("color_temp")&&m>0&&f>=m&&l("turn_on")&&(c.setColorTemperature={min:m,max:f,step:1,unit:"K"})}}else if(n==="cover")a.cover={position:g(s.current_position)===null?o==="closed"?0:null:M(s.current_position,0,100)/100,movement:["opening","closing"].includes(o)?o:["open","closed"].includes(o)?"stopped":"unknown"},c.openCover=u(1)&&l("open_cover"),c.closeCover=u(2)&&l("close_cover"),c.stopCover=u(8)&&l("stop_cover"),u(4)&&l("set_cover_position")&&(c.setCoverPosition={min:0,max:1,step:.01});else if(n==="climate"){let h=s.temperature_unit??t?.config?.unit_system?.temperature;a.climate={currentTemperature:g(s.current_temperature),targetTemperature:g(s.temperature),humidity:M(s.current_humidity,0,100),unit:["\xB0C","\xB0F"].includes(h)?h:null,mode:o,heatingActive:typeof s.hvac_action=="string"?s.hvac_action==="heating":null};let _=g(s.min_temp),v=g(s.max_temp);u(1)&&_!==null&&v!==null&&v>_&&l("set_temperature")&&a.climate.unit&&(c.setTargetTemperature={min:_,max:v,step:g(s.target_temp_step)>0?s.target_temp_step:.5,unit:a.climate.unit});let m=V(s.hvac_modes).filter(f=>["off","heat","cool","heat_cool","auto","dry","fan_only"].includes(f));m.length&&l("set_hvac_mode")&&(c.setThermostatMode={values:m.map(f=>({id:f,label:f}))})}else if(n==="lock"){a.lock={isLocked:o==="locked"?!0:o==="unlocked"?!1:null};let h=["locked","unlocked"].includes(o)&&!s.code_format;c.lock=h&&l("lock"),c.unlock=h&&l("unlock")}else if(n==="vacuum")a.cleaning={state:["cleaning","paused","returning","docked","idle","error"].includes(o)?o:"unknown",batteryPercent:M(s.battery_level,0,100),error:o==="error"?typeof s.error=="string"?s.error:"Device error":null},a.cleaning.batteryPercent!==null&&(a.health={batteryPercent:a.cleaning.batteryPercent,alerts:[]}),c.startCleaning=u(8192)&&l("start"),c.pauseCleaning=u(4)&&l("pause"),c.stopCleaning=u(8)&&l("stop"),c.returnToBase=u(16)&&l("return_to_base");else if(n==="binary_sensor"){let h=se[s.device_class];if(!h||!["on","off"].includes(o))return{...a,availability:"unavailable"};let[_,v,m]=h,f=m==="presence"?["occupancy"]:m==="smoke"?["smokeAlarm","alarm"]:m==="water"?["waterLeak","alarm"]:[m];if(!r.some(y=>f.includes(y.capability)))return{...a,availability:"unavailable"};a.deviceClass=_,v==="contact"?a.contact={state:o==="on"?"open":"closed"}:a[v]=[{id:m,baseId:m,active:o==="on",label:a.name}]}return a}function W(i,e,t,r){let n=i.id.split(".")[0],s=e?.type==="togglePower"?{type:"setPower",value:!i.power?.isOn}:e;if(typeof r!="function"||!r(i,s)||e?.type==="setCoverPosition"&&(e.value<0||e.value>1))throw new Error(`Unsupported action ${e?.type??"(missing)"} for ${i.id}.`);let o,l={entity_id:i.id};switch(e.type){case"togglePower":o="toggle";break;case"setPower":o=e.value?"turn_on":"turn_off";break;case"setBrightness":o="turn_on",l.brightness=Math.round(e.value*255);break;case"setColor":o="turn_on",l.hs_color=[e.value.hue*360,e.value.saturation*100];break;case"setColorTemperature":o="turn_on",l.color_temp_kelvin=Math.round(e.value);break;case"openCover":o="open_cover";break;case"closeCover":o="close_cover";break;case"stopCover":o="stop_cover";break;case"setCoverPosition":o="set_cover_position",l.position=Math.round(e.value*100);break;case"setTargetTemperature":o="set_temperature",l.temperature=e.value;break;case"setThermostatMode":o="set_hvac_mode",l.hvac_mode=e.value;break;case"lock":o="lock";break;case"unlock":o="unlock";break;case"startCleaning":o="start";break;case"pauseCleaning":o="pause";break;case"stopCleaning":o="stop";break;case"returnToBase":o="return_to_base";break;default:throw new Error("Unsupported action.")}if(!O(t,n,o))throw new Error(`Service ${n}.${o} is unavailable.`);return{domain:n,service:o,data:l}}var T=class{provider=w;bindings=new Map;states=new Map;listeners=new Set;disposed=!1;constructor(e=null,{supportsCommand:t=null}={}){this.hass=e,this.supportsCommand=t}configureCommandSupport(e){if(!this.disposed){if(typeof e!="function")throw new TypeError("A neutral command validator is required.");this.supportsCommand=e}}configureBindings(e){if(this.disposed)return;let t=new Map;for(let r of e??[])N(r)||t.set(r.deviceId,[...t.get(r.deviceId)??[],{...r}]);this.bindings=t;for(let r of this.states.keys())t.has(r)||this.states.delete(r);this.updateHass(this.hass)}normalize(e){let t=this.bindings.get(e);return t?G(e,this.hass?.states?.[e],this.hass,t):S(e,"unavailable")}updateHass(e){if(!this.disposed){this.hass=e;for(let t of this.bindings.keys()){let r=this.normalize(t);if(JSON.stringify(r)!==JSON.stringify(this.states.get(t))){this.states.set(t,r);for(let n of this.listeners)n(structuredClone(r))}}}}async loadStates(e){return this.disposed?[]:e.map(t=>structuredClone(this.states.get(t)??this.normalize(t)))}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),()=>this.listeners.delete(e))}async execute(e,t){if(this.disposed)throw new Error("Home Assistant runtime has been disposed.");if(!this.bindings.has(e))throw new Error("Entity is not bound to this scene.");let r=this.normalize(e),{domain:n,service:a,data:s}=W(r,t,this.hass,this.supportsCommand);if(typeof this.hass?.callService!="function")throw new Error("Home Assistant is not connected.");return await this.hass.callService(n,a,s),{accepted:!0,deviceId:e,command:structuredClone(t)}}dispose(){this.disposed||(this.disposed=!0,this.listeners.clear(),this.states.clear(),this.bindings.clear(),this.hass=null,this.supportsCommand=null)}};var A="mikonus_dashboard/scene/",le=[500,1e3,2e3,4e3,8e3],ce=new Set(["unknown_command","integration_not_setup","disconnected","connection_lost","cannot_connect","timeout","transport_error","store_unavailable","storage_error"]),he={unknown_command:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste hinzuf\xFCgen. Warte auf die Integration \u2026",integration_not_setup:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste einrichten oder neu laden. Warte auf die Integration \u2026",scene_not_found:"Diese Scene wurde noch nicht aus Mikonus ver\xF6ffentlicht.",no_scenes:"Noch kein Dashboard ver\xF6ffentlicht. Ver\xF6ffentliche zuerst eine Scene aus Mikonus.",multiple_scenes:"Mehrere Dashboards vorhanden. Bitte scene_id in der Card-Konfiguration angeben.",invalid_scene_id:"Ung\xFCltige scene_id in der Card-Konfiguration.",invalid_scene:"Die ver\xF6ffentlichte Scene ist ung\xFCltig.",unauthorized:"Keine Berechtigung zum Laden dieses Dashboards.",permission_denied:"Keine Berechtigung zum Laden dieses Dashboards.",forbidden:"Keine Berechtigung zum Laden dieses Dashboards.",disconnected:"Verbindung zu Home Assistant unterbrochen."};function b(i){let e=typeof i=="number"?i:i?.code,t=[1,3].includes(e)?"disconnected":e;return Object.assign(new Error(he[t]??i?.message??"Dashboard konnte nicht geladen werden."),{code:t})}function U(i){return ce.has(b(i).code)||i?.name==="NetworkError"}var x=()=>new DOMException("Scene source stopped or superseded.","AbortError");function j(i,e){return e.throwIfAborted(),new Promise((t,r)=>{let n=()=>r(x());e.addEventListener("abort",n,{once:!0}),Promise.resolve(i).then(t,r).finally(()=>e.removeEventListener("abort",n))})}var C=i=>{try{Promise.resolve(i?.()).catch(()=>{})}catch{}},R=class{constructor(e,{sceneId:t,onStatus:r=()=>{},retryDelays:n=le}={}){this.connection=e,this.sceneId=t,this.onStatus=r,this.revision=null,this.notifiedRevision=0,this.epoch=0,this.wakeRevision=0,this.transportGeneration=0,this.listeners=new Set,this.disposed=!1,this.unsubscribe=null,this.starting=null,this.pending=null,this.unavailable=!1,this.observers=new Map,this.retryDelays=n,this.retryIndex=0,this.timer=null,this.lifetime=new AbortController,this.transport=new AbortController,this.onDisconnect=()=>{this.disposed||(this.unavailable=!0,this.invalidate(),this.clearRetry(),this.onStatus(b({code:"disconnected"})))},this.onReconnect=()=>{this.disposed||(this.invalidate(),this.recover())},e?.addEventListener?.("disconnected",this.onDisconnect),e?.addEventListener?.("ready",this.onReconnect)}clearRetry(){clearTimeout(this.timer),this.timer=null}retry(e){this.disposed||!U(e)||this.timer!==null||this.connection?.connected===!1||this.retryIndex>=this.retryDelays.length||(this.timer=setTimeout(()=>{this.timer=null,this.wake()},this.retryDelays[this.retryIndex++]))}wake(){this.disposed||this.emit({revision:`recovery:${++this.wakeRevision}:${this.epoch}`})}recover(){this.clearRetry(),this.retryIndex=0,this.unavailable=!1,this.wake()}invalidate(){this.transport.abort(),this.transport=new AbortController,++this.epoch,++this.transportGeneration,this.pending=null,this.starting=null,this.revision=null,this.notifiedRevision=0,C(this.unsubscribe),this.unsubscribe=null;for(let e of this.observers.values())C(e.unsubscribe);this.observers.clear()}async observe(e,t,r){if(this.observers.has(e))return this.observers.get(e).promise;let n={};return this.observers.set(e,n),n.promise=this.connection.subscribeMessage(a=>{!this.disposed&&this.observers.get(e)===n&&r(a)},t,{resubscribe:!1}).then(a=>{if(this.disposed||this.observers.get(e)!==n)throw C(a),x();n.unsubscribe=a}).catch(a=>{throw this.observers.get(e)===n&&this.observers.delete(e),a}),n.promise}async start(){if(this.starting)return this.starting;let e=this.epoch,t=(async()=>{if(typeof this.connection?.sendMessagePromise!="function"||typeof this.connection?.subscribeMessage!="function"||this.connection.connected===!1)throw b({code:"disconnected"});if(await this.observe("component",{type:"subscribe_events",event_type:"component_loaded"},a=>{a.data?.component==="mikonus_dashboard"&&this.recover()}),await this.observe("watch",{type:A+"watch"},a=>{(a.type==="ready"||a.type==="updated"&&!this.unsubscribe&&(!this.sceneId||a.sceneId===this.sceneId))&&this.recover()}),!this.sceneId){let{scenes:a}=await this.connection.sendMessagePromise({type:A+"list"});if(this.disposed||e!==this.epoch)throw x();if(!a.length)throw b({code:"no_scenes"});if(a.length!==1)throw b({code:"multiple_scenes"});this.sceneId=a[0].sceneId}if(this.disposed||e!==this.epoch)throw x();if(this.unsubscribe)return;let r=this.transportGeneration,n=await this.connection.subscribeMessage(a=>{r===this.transportGeneration&&this.onEvent(a)},{type:A+"subscribe",scene_id:this.sceneId},{resubscribe:!1});if(this.disposed||e!==this.epoch)throw C(n),x();this.unsubscribe=n})();this.starting=t;try{return await t}finally{this.starting===t&&(this.starting=null)}}onEvent(e){if(!this.disposed){if(e.type==="unavailable"){this.unavailable=!0,this.onStatus(b(e)),U(e)||this.clearRetry(),this.retry(e);return}e.sceneId!==this.sceneId||!Number.isSafeInteger(e.revision)||(this.unavailable&&(this.unavailable=!1,this.revision=null,this.notifiedRevision=0,++this.epoch),!(e.revision<=(this.revision??0)||e.revision<=this.notifiedRevision)&&(this.notifiedRevision=e.revision,this.clearRetry(),this.retryIndex=0,this.listeners.size&&this.emit({sceneId:this.sceneId,revision:`${e.revision}:${this.epoch}`})))}}emit(e){for(let t of this.listeners)t(e)}async loadScene({signal:e}={}){if(e?.throwIfAborted(),this.disposed)throw x();let t=this.epoch,r=AbortSignal.any([this.lifetime.signal,this.transport.signal,...e?[e]:[]]);try{if(await j(this.start(),r),e?.throwIfAborted(),this.disposed||t!==this.epoch)throw x();this.pending??=this.connection.sendMessagePromise({type:A+"get",scene_id:this.sceneId});let n=this.pending,a;try{a=await j(n,r)}finally{this.pending===n&&(this.pending=null)}if(e?.throwIfAborted(),this.disposed||t!==this.epoch)throw x();let s=a?.metadata?.revision;if(a?.scene?.sceneId!==this.sceneId||!Number.isSafeInteger(s)||s<1)throw b({code:"invalid_scene"});return this.revision=s,this.clearRetry(),this.retryIndex=0,this.onStatus(null),{scene:a.scene,metadata:{...a.metadata,revision:`${s}:${t}`,source:"homeAssistant"}}}catch(n){if(this.disposed||t!==this.epoch||n?.name==="AbortError")throw x();let a=b(n);throw this.onStatus(a),U(n)||this.clearRetry(),this.retry(n),a}}async waitUntilReady({signal:e}={}){let t=[this.lifetime.signal,...e?[e]:[]],r=!0,n,a=()=>{r=!0,n?.()},s=this.subscribe(a);for(let o of t)o.addEventListener("abort",a);try{for(;;){for(let o of t)o.throwIfAborted();r||await new Promise(o=>{n=o}),n=null;for(let o of t)o.throwIfAborted();r=!1;try{return await this.loadScene({signal:e})}catch{if(this.disposed||e?.aborted)throw x()}}}finally{s();for(let o of t)o.removeEventListener("abort",a)}}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),this.notifiedRevision>(this.revision??0)&&e({sceneId:this.sceneId,revision:`${this.notifiedRevision}:${this.epoch}`}),()=>this.listeners.delete(e))}dispose(){this.disposed||(this.disposed=!0,this.lifetime.abort(),this.clearRetry(),this.invalidate(),this.listeners.clear(),this.connection?.removeEventListener?.("disconnected",this.onDisconnect),this.connection?.removeEventListener?.("ready",this.onReconnect))}};var X={schemaVersion:2,sceneId:"mikonus:ha-reference",name:"Mikonus HA Reference",metadata:{generator:"mikonus-ha-development-fixture",revision:"1"},defaultFloorId:"floor-eg",floors:[{id:"floor-ug",name:"UG",level:-1,sortOrder:0,elevation:-2.8,rooms:[{id:"room-ug-storage",name:"Keller",polygon:[{x:-2.4,z:-1.8},{x:2.4,z:-1.8},{x:2.4,z:1.8},{x:-2.4,z:1.8}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"object-ug-storage",kind:"furniture",shape:"box",position:{x:0,y:.45,z:0},rotation:{y:0},size:{width:1.2,depth:.6,height:.9},appearance:"cabinet"}]},{id:"floor-eg",name:"EG",level:0,sortOrder:1,elevation:0,rooms:[{id:"room-eg-living",name:"Wohnzimmer",polygon:[{x:-3.2,z:-2.4},{x:3.2,z:-2.4},{x:3.2,z:2.4},{x:-3.2,z:2.4}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[{id:"wall-eg-north",start:{x:-3.2,z:-2.4},end:{x:3.2,z:-2.4},baseY:0,height:2.8,thickness:.15}],doors:[],windows:[{id:"cover-eg-window",wallId:"wall-eg-north",position:{x:0,y:.7,z:-2.4},rotation:{y:0},size:{width:1.8,height:1.7,depth:.08},openAngle:0,binding:{provider:"homeAssistant",deviceId:"cover.mikonus_reference",capability:"position"}}],objects:[{id:"light-eg-living",kind:"light",position:{x:-.8,y:2.35,z:.4},rotation:{y:0},size:{width:.42,depth:.42,height:.16},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_reference",capability:"power"}}]},{id:"floor-og",name:"OG",level:1,sortOrder:2,elevation:2.8,rooms:[{id:"room-og-bedroom",name:"Schlafzimmer",polygon:[{x:-2.8,z:-2.1},{x:2.8,z:-2.1},{x:2.8,z:2.1},{x:-2.8,z:2.1}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"light-og-bedroom",kind:"light",position:{x:.9,y:2.35,z:-.3},rotation:{y:0},size:{width:.38,depth:.38,height:.14},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_upstairs",capability:"power"}}]}]};var de={"light.mikonus_reference":"light","light.mikonus_upstairs":"upstairs_light","cover.mikonus_reference":"cover"};function Y(i={}){let e=structuredClone(X);for(let t of e.floors)for(let r of["objects","doors","windows"])for(let n of t[r])n.binding&&(n.binding.deviceId=i[de[n.binding.deviceId]]??n.binding.deviceId);return e}var P=class{#e=null;#t=new Set;#i=!1;read(){return this.#e}updateHass(e){if(this.#i)return;let t=e?.themes?.darkMode,r=typeof t=="boolean"?t?"dark":"light":null;if(r!==this.#e){this.#e=r;for(let n of this.#t)n(r)}}subscribe(e){return this.#i?()=>{}:(this.#t.add(e),()=>this.#t.delete(e))}dispose(){this.#i=!0,this.#t.clear()}};var D=Object.freeze(["ambientLight","shadowsEnabled","shadowStrength","theme","autoBrightness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),$=new Set(["shadowsEnabled","autoBrightness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),K=Object.freeze({ambientLight:100,shadowsEnabled:!0,shadowStrength:100,theme:"auto",autoBrightness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0});function q(i,e,t,r){if(typeof i!="number"||!Number.isFinite(i))throw new Error(`${e} must be a finite number.`);return Math.min(Math.max(i,t),r)}function I(i={}){let e={};for(let t of D){let r=i[t];if(r!==void 0){if($.has(t)){if(typeof r!="boolean")throw new Error(`${t} must be a boolean.`);e[t]=r;continue}if(t==="ambientLight"){e[t]=q(r,t,0,150);continue}if(t==="shadowStrength"){e[t]=q(r,t,0,100);continue}if(t==="theme"){if(!["auto","light","dark"].includes(r))throw new Error("theme must be auto, light or dark.");e[t]=r}}}return e}function F(i={}){let e=I(i),t={};e.ambientLight!==void 0&&(t.ambientBrightnessPercent=e.ambientLight),e.shadowStrength!==void 0&&(t.shadowIntensityPercent=e.shadowStrength),e.theme!==void 0&&(t.themeMode=e.theme);for(let r of $)e[r]!==void 0&&(t[r]=e[r]);return t}function k(i={}){return Object.freeze({...K,...I(i)})}function Z(i={}){let e=k(i);return Object.fromEntries(D.filter(t=>e[t]!==K[t]).map(t=>[t,e[t]]))}function J(i){if(!i||i.type!=="custom:mikonus-3d-card")throw new Error("Expected type: custom:mikonus-3d-card.");let e=I(i);if(i.scene==="published"){if(i.scene_id!==void 0&&(typeof i.scene_id!="string"||!/^mikonus:[A-Za-z0-9][A-Za-z0-9:_-]{0,190}$/.test(i.scene_id)))throw new Error("Invalid scene_id.");if(i.entities!==void 0)throw new Error("entities applies only to scene: reference.");return{type:"custom:mikonus-3d-card",scene:"published",...i.scene_id?{scene_id:i.scene_id}:{},...e}}if(i.scene!==void 0&&i.scene!=="reference")throw new Error("Expected scene: reference or published.");if(i.scene_id!==void 0)throw new Error("scene_id requires scene: published.");let t=i.entities??{};if(!t||typeof t!="object"||Array.isArray(t))throw new Error("entities must be a mapping.");let r={};for(let n of Object.keys(t).sort()){let a={light:"light",upstairs_light:"light",cover:"cover"}[n],s=t[n];if(!a||typeof s!="string"||!E.test(s)||!s.startsWith(`${a}.`))throw new Error(`Invalid reference entity mapping: ${n}.`);r[n]=s}return{type:"custom:mikonus-3d-card",scene:"reference",entities:r,...e}}function z(i){return i.scene==="published"?{scene:"published",...i.scene_id?{scene_id:i.scene_id}:{}}:{scene:"reference",entities:i.entities}}function Q(i){return class extends HTMLElement{#e=null;#t=null;#i=null;#r=null;#a=0;#u=new Map;#n=null;#s=null;#h=t=>{t.persisted&&(this.#c(),this.#l())};constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML='<style>:host{display:block;height:100%;min-height:360px}.card{position:relative;height:100%;min-height:360px;border-radius:var(--ha-card-border-radius,12px);overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff))}.viewport{position:absolute;inset:0}p{position:absolute;inset:16px auto auto 16px;margin:0;max-width:calc(100% - 32px);font:14px system-ui;color:var(--primary-text-color,#222)}[hidden]{display:none}</style><div class="card"><div class="viewport"></div><p role="status">Warte auf Home Assistant \u2026</p></div>'}setConfig(t){let r=J(t);if(JSON.stringify(r)===JSON.stringify(this.#e))return;let n=this.#e&&JSON.stringify(z(r))===JSON.stringify(z(this.#e));if(this.#e=r,n&&!this.#r?.disposed){this.#i?.updateSettings?.(F(r));return}this.#c(),this.#l()}set hass(t){let r=this.#t&&this.#t.connection!==t?.connection;this.#t=t,r&&this.#e?.scene==="published"&&this.#c(),this.#s?.updateHass(t),this.#r?.updateHass(t),this.#l()}get hass(){return this.#t}connectedCallback(){window.addEventListener("pageshow",this.#h),this.#l()}disconnectedCallback(){window.removeEventListener("pageshow",this.#h),this.#c()}getCardSize(){return 8}getGridOptions(){return{columns:"full",rows:7,min_columns:6,min_rows:6}}static getStubConfig(){return{scene:"published"}}static getConfigElement(){return document.createElement("mikonus-3d-card-editor")}#o(t){let r=this.shadowRoot.querySelector("[role=status]");r.textContent=t,r.hidden=!t}#l(){if(!this.isConnected||!this.#e||!this.#t||this.#r)return;let t=++this.#a,r=new T(this.#t);this.#r=r,this.#s=new P,this.#s.updateHass(this.#t),this.#o("Mikonus wird geladen \u2026");let n=this.#u,a={getItem:s=>n.get(s)??null,setItem:(s,o)=>n.set(s,String(o)),removeItem:s=>n.delete(s)};this.#e.scene==="published"&&(this.#n=new R(this.#t.connection,{sceneId:this.#e.scene_id,onStatus:s=>{t===this.#a&&this.#o(s?.message??"")}}));try{let s=i({container:this.shadowRoot.querySelector(".viewport"),runtime:r,scene:this.#n?void 0:Y(this.#e.entities),sceneSource:this.#n,themeSource:this.#s,storage:a,presentationSettings:F(this.#e),onReady:()=>{t===this.#a&&this.#o("")},onError:o=>{t===this.#a&&(r.dispose(),this.#n?.dispose(),this.#o(`Mikonus konnte nicht geladen werden: ${o.message??"Unbekannter Fehler"}`))}});t!==this.#a?s.dispose():this.#i=s}catch(s){r.dispose(),this.#n?.dispose(),this.#o(`Mikonus konnte nicht geladen werden: ${s.message}`)}}#c(){++this.#a;try{this.#i?.dispose()}finally{this.#n?.dispose(),this.#n=null,this.#s?.dispose(),this.#s=null,this.#r?.dispose(),this.#r=null,this.#i=null,this.shadowRoot.querySelector(".viewport").replaceChildren()}}}}var ee=Object.freeze({de:{intro:"Die Szene bleibt unver\xE4ndert. Diese Einstellungen gelten nur f\xFCr diese Karteninstanz.",sceneSection:"Dashboard Scene",scene:"Szenenquelle",scene_id:"Scene-ID (optional)",sceneHelp:"Leer lassen, wenn genau eine ver\xF6ffentlichte Scene vorhanden ist.",published:"Ver\xF6ffentlichte Scene",reference:"Entwicklungs-Referenzscene",displaySection:"Darstellung",ambientLight:"Umgebungshelligkeit",shadowsEnabled:"Schatten aktivieren",shadowStrength:"Schattenst\xE4rke",theme:"Theme",autoBrightness:"Automatische Helligkeit",auto:"Automatisch",light:"Hell",dark:"Dunkel",cameraSection:"Kamera",cameraLocked:"Kamera sperren",cameraRotationEnabled:"Rotation erlauben",cameraZoomEnabled:"Zoom erlauben",cameraPanEnabled:"Verschieben erlauben",uiSection:"Dashboard UI",showFloorSelector:"Etagenumschalter anzeigen",showQuickControls:"Quick-Control-Chips anzeigen",showDeviceMarkers:"Device-Marker anzeigen"},en:{intro:"The scene stays unchanged. These settings apply only to this card instance.",sceneSection:"Dashboard Scene",scene:"Scene source",scene_id:"Scene ID (optional)",sceneHelp:"Leave empty when exactly one published scene is available.",published:"Published scene",reference:"Development reference scene",displaySection:"Appearance",ambientLight:"Ambient light",shadowsEnabled:"Enable shadows",shadowStrength:"Shadow strength",theme:"Theme",autoBrightness:"Automatic brightness",auto:"Auto",light:"Light",dark:"Dark",cameraSection:"Camera",cameraLocked:"Lock camera",cameraRotationEnabled:"Allow rotation",cameraZoomEnabled:"Allow zoom",cameraPanEnabled:"Allow pan",uiSection:"Dashboard UI",showFloorSelector:"Show floor selector",showQuickControls:"Show quick-control chips",showDeviceMarkers:"Show device markers"}});function pe(i){return[{type:"expandable",name:"sceneSettings",title:i.sceneSection,flatten:!0,schema:[{name:"scene",required:!0,selector:{select:{mode:"dropdown",options:[{value:"published",label:i.published},{value:"reference",label:i.reference}]}}},{name:"scene_id",selector:{text:{}}}]},{type:"expandable",name:"displaySettings",title:i.displaySection,flatten:!0,schema:[{name:"ambientLight",required:!0,selector:{number:{min:0,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"shadowsEnabled",required:!0,selector:{boolean:{}}},{name:"shadowStrength",required:!0,selector:{number:{min:0,max:100,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"theme",required:!0,selector:{select:{mode:"dropdown",options:[{value:"auto",label:i.auto},{value:"light",label:i.light},{value:"dark",label:i.dark}]}}},{name:"autoBrightness",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"cameraSettings",title:i.cameraSection,flatten:!0,schema:[{name:"cameraLocked",required:!0,selector:{boolean:{}}},{name:"cameraRotationEnabled",required:!0,selector:{boolean:{}}},{name:"cameraZoomEnabled",required:!0,selector:{boolean:{}}},{name:"cameraPanEnabled",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"uiSettings",title:i.uiSection,flatten:!0,schema:[{name:"showFloorSelector",required:!0,selector:{boolean:{}}},{name:"showQuickControls",required:!0,selector:{boolean:{}}},{name:"showDeviceMarkers",required:!0,selector:{boolean:{}}}]}]}function me(i){return{scene:i.scene??"published",...i.scene_id?{scene_id:i.scene_id}:{},...k(i)}}function fe(i,e){let t={...i,type:"custom:mikonus-3d-card"};t.scene=e.scene==="reference"?"reference":"published",t.scene==="published"?(delete t.entities,typeof e.scene_id=="string"&&e.scene_id.trim()?t.scene_id=e.scene_id.trim():delete t.scene_id):(delete t.scene_id,t.entities??={});for(let r of D)delete t[r];return Object.assign(t,Z(e)),t}function te(){return class extends HTMLElement{#e={type:"custom:mikonus-3d-card",scene:"published"};#t=null;#i;constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>
        :host{display:block}.intro{margin:0 0 12px;color:var(--secondary-text-color);font-size:14px;line-height:1.4}
        ha-form{display:block}
      </style><p class="intro"></p><ha-form></ha-form>`,this.#i=this.shadowRoot.querySelector("ha-form"),this.#i.addEventListener("value-changed",e=>{e.stopPropagation();let t=fe(this.#e,e.detail?.value??{});this.#e=t,this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:t}}))}),this.#r()}setConfig(e){this.#e={...e},this.#r()}set hass(e){this.#t=e,this.#r()}get hass(){return this.#t}#r(){if(!this.#i)return;let t=(this.#t?.locale?.language??this.#t?.language??"en").toLowerCase().startsWith("de")?ee.de:ee.en;this.shadowRoot.querySelector(".intro").textContent=t.intro,this.#i.hass=this.#t,this.#i.data=me(this.#e),this.#i.schema=pe(t),this.#i.computeLabel=r=>t[r.name],this.#i.computeHelper=r=>r.name==="scene_id"?t.sceneHelp:void 0}}}var ie=`(()=>{var K0=Object.create;var md=Object.defineProperty;var J0=Object.getOwnPropertyDescriptor;var Q0=Object.getOwnPropertyNames;var eg=Object.getPrototypeOf,tg=Object.prototype.hasOwnProperty;var eo=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var ng=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Q0(e))!tg.call(n,s)&&s!==t&&md(n,s,{get:()=>e[s],enumerable:!(i=J0(e,s))||i.enumerable});return n};var Qn=(n,e,t)=>(t=n!=null?K0(eg(n)):{},ng(e||!n||!n.__esModule?md(t,"default",{value:n,enumerable:!0}):t,n));var kl=eo((Zw,gd)=>{"use strict";function as(n,e){return\`\${n}:\${e}\`}function Os(n){let e=n.end.x-n.start.x,t=n.end.z-n.start.z,i=Math.hypot(e,t);if(!Number.isFinite(i)||i<=0)throw new TypeError(\`Wall \${n.id??"<unknown>"} must have a positive length.\`);return{length:i,direction:{x:e/i,z:t/i},perpendicular:{x:-t/i,z:e/i}}}function Bl(n,e,t){let i=Os(n),s=e.rotation.y*Math.PI/180,r={x:Math.cos(s),z:-Math.sin(s)},a={x:e.position.x+r.x*e.size.width/2,z:e.position.z+r.z*e.size.width/2},o=(a.x-n.start.x)*i.direction.x+(a.z-n.start.z)*i.direction.z,c=t==="door"?0:e.position.y-n.baseY;return{id:e.id,kind:t,wallId:n.id,centerOffset:o,minimumOffset:o-e.size.width/2,maximumOffset:o+e.size.width/2,minimumY:c,maximumY:c+e.size.height,width:e.size.width,height:e.size.height}}function ig(n,e){return[...n.doors.filter(t=>t.wallId===e.id).map(t=>Bl(e,t,"door")),...n.windows.filter(t=>t.wallId===e.id).map(t=>Bl(e,t,"window"))].sort((t,i)=>t.minimumOffset-i.minimumOffset||t.minimumY-i.minimumY||t.id.localeCompare(i.id))}function sg(n,e,t){let i=Math.max(0,Math.min(n.minimumOffset,e)),s=Math.max(0,Math.min(n.maximumOffset,e)),r=Math.max(0,Math.min(n.minimumY,t)),a=Math.max(0,Math.min(n.maximumY,t));return s-i<.001||a-r<.001?null:{minimumOffset:i,maximumOffset:s,minimumY:r,maximumY:a}}function rg(n){let e=[...n].sort((i,s)=>i-s),t=[];for(let i of e)(t.length===0||Math.abs(i-t[t.length-1])>=.001)&&t.push(i);return t}function ag(n,e){let{length:t}=Os(n),i=e.map(a=>sg(a,t,n.height)).filter(Boolean);if(i.length===0)return[{minimumOffset:0,maximumOffset:t,minimumY:0,maximumY:n.height,width:t,height:n.height,centerOffset:t/2,centerY:n.height/2}];let s=rg(new Set([0,t,...i.flatMap(a=>[a.minimumOffset,a.maximumOffset])])),r=[];for(let a=1;a<s.length;a+=1){let o=s[a-1],c=s[a];if(c-o<.001)continue;let l=(o+c)/2,u=i.filter(d=>l>=d.minimumOffset-.001&&l<=d.maximumOffset+.001).map(d=>[d.minimumY,d.maximumY]).sort((d,p)=>d[0]-p[0]),h=[];for(let d of u){let p=h[h.length-1];p&&d[0]<=p[1]+.001?p[1]=Math.max(p[1],d[1]):h.push([...d])}let f=0;for(let d of h)d[0]-f>=.001&&r.push(Ur(o,c,f,d[0])),f=Math.max(f,d[1]);n.height-f>=.001&&r.push(Ur(o,c,f,n.height))}return r}function Ur(n,e,t,i){return{minimumOffset:n,maximumOffset:e,minimumY:t,maximumY:i,width:e-n,height:i-t,centerOffset:(n+e)/2,centerY:(t+i)/2}}function og(n,e,t=1.38,i=.04){let s=n.minimumY<=.002,r=n.maximumY<e-.002,a=null;s&&r?a=n.maximumY:s&&(a=Math.min(n.maximumY,Math.max(t,i)));let o=[],c=[];return a!==null&&a-n.minimumY>=i?(o.push(Ur(n.minimumOffset,n.maximumOffset,n.minimumY,a)),n.maximumY-a>=i&&c.push(Ur(n.minimumOffset,n.maximumOffset,a,n.maximumY))):c.push(n),{visiblePanels:o,lightOccluderPanels:c}}function cg(n,e,t=.01){let i=Math.min(n.maximumOffset,e.maximumOffset)-Math.max(n.minimumOffset,e.minimumOffset),s=Math.min(n.maximumY,e.maximumY)-Math.max(n.minimumY,e.minimumY);return i>t&&s>t}function lg(n,e=.11){let t=n.flatMap((d,p)=>{let x=Os(d);return[{wall:d,wallIndex:p,end:"start",point:d.start,inward:x.direction},{wall:d,wallIndex:p,end:"end",point:d.end,inward:{x:-x.direction.x,z:-x.direction.z}}]}),i=t.map((d,p)=>p),s=d=>{let p=d;for(;i[p]!==p;)p=i[p];return p},r=(d,p)=>{let x=s(d),m=s(p);x!==m&&(i[m]=x)},a=e*e;for(let d=0;d<t.length;d+=1)for(let p=d+1;p<t.length;p+=1){let x=t[d],m=t[p];if(x.wall.id===m.wall.id||Math.abs(x.wall.baseY-m.wall.baseY)>e)continue;let g=x.point.x-m.point.x,w=x.point.z-m.point.z;g*g+w*w<=a&&r(d,p)}let o=new Map;t.forEach((d,p)=>{let x=s(p);o.has(x)||o.set(x,[]),o.get(x).push(p)});let c=new Set,l=new Set,u=new Set,h=new Map,f=[];for(let d of o.values()){if(new Set(d.map(E=>t[E].wall.id)).size<2||(d.forEach(E=>c.add(as(t[E].wall.id,t[E].end))),d.length!==2))continue;let p=t[d[0]],x=t[d[1]],m=p.inward.x*x.inward.x+p.inward.z*x.inward.z,g=p.inward.x*x.inward.z-p.inward.z*x.inward.x,w={x:(p.point.x+x.point.x)/2,z:(p.point.z+x.point.z)/2};if(Math.abs(m)<=.2&&Math.abs(g)>=.96){g<0&&([p,x]=[x,p]);let E=Math.max(p.wall.thickness,x.wall.thickness),y=E/2,T={x:w.x+(p.inward.x+x.inward.x)*y,z:w.z+(p.inward.z+x.inward.z)*y},b={center:w,arcCenter:T,first:p,second:x,thickness:E,elevation:(p.wall.baseY+x.wall.baseY)/2,height:Math.min(p.wall.height,x.wall.height)};f.push(b),l.add(as(p.wall.id,p.end)),l.add(as(x.wall.id,x.end))}else if(m<=-.98&&Math.abs(g)<=.08)for(let E of[p,x]){let y=as(E.wall.id,E.end),T={x:-E.inward.x,z:-E.inward.z};u.add(y),h.set(y,(w.x-E.point.x)*T.x+(w.z-E.point.z)*T.z)}}return t.forEach(d=>{let p=as(d.wall.id,d.end);if(!c.has(p))for(let x of n){if(x.id===d.wall.id||Math.abs(x.baseY-d.wall.baseY)>e)continue;let m=Os(x),g=d.point.x-x.start.x,w=d.point.z-x.start.z,E=(g*m.direction.x+w*m.direction.z)/m.length;if(E<=.03||E>=.97)continue;let y={x:x.start.x+m.direction.x*m.length*E,z:x.start.z+m.direction.z*m.length*E},T=d.point.x-y.x,b=d.point.z-y.z;if(T*T+b*b<=a){c.add(p);break}}}),f.sort((d,p)=>d.center.x-p.center.x||d.center.z-p.center.z),{joinedEndpoints:c,roundedEndpoints:l,continuationEndpoints:u,continuationAlignmentOffsets:h,roundedCorners:f}}function ug(n,e=0,t=16){let i=Math.max(Math.round(t),4),s=Math.max(n.thickness+Math.max(e,0),.001),r=[{...n.arcCenter}];for(let a=i;a>=0;a-=1){let o=a/i*Math.PI/2;r.push({x:n.arcCenter.x-n.first.inward.x*Math.sin(o)*s-n.second.inward.x*Math.cos(o)*s,z:n.arcCenter.z-n.first.inward.z*Math.sin(o)*s-n.second.inward.z*Math.cos(o)*s})}return r}function hg(n,e,t){let i=Os(e),s=Math.abs(n.minimumOffset)<=.003,r=Math.abs(n.maximumOffset-i.length)<=.003,a=as(e.id,"start"),o=as(e.id,"end"),c=e.thickness/2,l=n.minimumOffset,u=n.maximumOffset;if(s&&(t.roundedEndpoints.has(a)?l+=c:t.continuationEndpoints.has(a)?l-=t.continuationAlignmentOffsets?.get(a)??0:t.joinedEndpoints.has(a)&&(l-=c)),r&&(t.roundedEndpoints.has(o)?u-=c:t.continuationEndpoints.has(o)?u+=t.continuationAlignmentOffsets?.get(o)??0:t.joinedEndpoints.has(o)&&(u+=c)),u-l<.012){let f=(n.minimumOffset+n.maximumOffset)/2;l=f-.006,u=f+.006}return Ur(l,u,n.minimumY,n.maximumY)}gd.exports={DOLLHOUSE_WALL_HEIGHT:1.38,MINIMUM_PANEL_SIZE:.001,OPENING_OVERLAP_EPSILON:.01,PRESENTATION_MINIMUM_PANEL_SIZE:.04,WALL_CORNER_SEGMENTS:16,WALL_JOIN_TOLERANCE:.11,buildWallPanels:ag,collectWallOpenings:ig,contactOpening:Bl,openingsOverlap:cg,joinedWallPanel:hg,resolveWallPresentation:og,resolveWallJoinTopology:lg,roundedCornerFootprint:ug,wallFrame:Os}});var Cd=eo((Kw,Ad)=>{"use strict";var{contactOpening:dg,openingsOverlap:fg,wallFrame:pg}=kl(),Hl=Object.freeze([1,2]),mg=2,gg=new Set(["light","furniture","decor"]),no=new Set(["box","cylinder","ellipsoid"]),io=.1,so=Object.freeze({maxJsonBytes:2*1024*1024,maxFloors:16,maxRooms:256,maxWalls:4096,maxDoors:1024,maxWindows:2048,maxObjects:8192,maxPolygonPointsPerRoom:1024}),Ns=class extends Error{constructor(e,t){super(e,t),this.name="DashboardSceneError",this.code="invalid_dashboard_scene"}};function ft(n,e){throw new Ns(\`\${n}: \${e}\`)}function Oi(n){return n!==null&&typeof n=="object"&&!Array.isArray(n)}function Vt(n,e){Oi(n)||ft(e,"must be an object.")}function os(n,e){Array.isArray(n)||ft(e,"must be an array.")}function Ct(n,e){(typeof n!="string"||n.trim().length===0)&&ft(e,"must be a non-empty string.")}function Bt(n,e,{positive:t=!1}={}){Number.isFinite(n)||ft(e,"must be a finite number."),t&&n<=0&&ft(e,"must be greater than zero.")}function xd(n,e,{nonNegative:t=!1}={}){Bt(n,e),Number.isInteger(n)||ft(e,"must be an integer."),t&&n<0&&ft(e,"must be zero or greater.")}function zl(n,e){Bt(n,e),(n<0||n>1)&&ft(e,"must be between zero and one.")}function bd(n){return typeof TextEncoder=="function"?new TextEncoder().encode(n).byteLength:typeof Buffer<"u"?Buffer.byteLength(n,"utf8"):unescape(encodeURIComponent(n)).length}function xg(n){let e;try{e=JSON.stringify(n)}catch(t){throw new Ns("scene: must be JSON serializable.",{cause:t})}return typeof e!="string"&&ft("scene","must be a JSON object."),bd(e)}function cs(n,e,t){e>t&&ft(n,\`contains \${e} entries; maximum is \${t}.\`)}function Vl(n,e){Vt(n,e),Bt(n.x,\`\${e}.x\`),Bt(n.z,\`\${e}.z\`)}function Md(n,e){Vt(n,e),Bt(n.x,\`\${e}.x\`),Bt(n.y,\`\${e}.y\`),Bt(n.z,\`\${e}.z\`)}function Sd(n,e){Vt(n,e),Bt(n.y,\`\${e}.y\`)}function Gl(n,e){Vt(n,e),Bt(n.width,\`\${e}.width\`,{positive:!0}),Bt(n.depth,\`\${e}.depth\`,{positive:!0}),Bt(n.height,\`\${e}.height\`,{positive:!0})}function Ed(n,e){if(typeof n>"u")return;Vt(n,e),Ct(n.provider,\`\${e}.provider\`),Ct(n.capability,\`\${e}.capability\`);let t=typeof n.deviceId<"u",i=typeof n.slot<"u";t===i&&ft(e,"must contain exactly one of deviceId or slot."),t&&Ct(n.deviceId,\`\${e}.deviceId\`),i&&Ct(n.slot,\`\${e}.slot\`)}function ro(n,e){typeof n<"u"&&Ct(n,e)}function vg(n,e){if(!(typeof n>"u")){Vt(n,e),Vt(n.materialSlots,\`\${e}.materialSlots\`);for(let[t,i]of Object.entries(n.materialSlots)){Ct(t,\`\${e}.materialSlots key\`);let s=\`\${e}.materialSlots.\${t}\`;Li(i,s)}}}function Li(n,e){typeof n>"u"||(Vt(n,e),Ct(n.materialKey,\`\${e}.materialKey\`),(typeof n.baseColor!="string"||!/^#[0-9A-Fa-f]{6}$/.test(n.baseColor))&&ft(\`\${e}.baseColor\`,"must be an RGB hex color."),zl(n.roughness,\`\${e}.roughness\`),zl(n.metallic,\`\${e}.metallic\`),zl(n.opacity,\`\${e}.opacity\`),typeof n.pattern<"u"&&(Vt(n.pattern,\`\${e}.pattern\`),Ct(n.pattern.kind,\`\${e}.pattern.kind\`),Bt(n.pattern.elementSize,\`\${e}.pattern.elementSize\`,{positive:!0}),Bt(n.pattern.lineWidth,\`\${e}.pattern.lineWidth\`,{positive:!0}),Ct(n.pattern.orientation,\`\${e}.pattern.orientation\`)))}function _g(n,e){typeof n>"u"||(Vt(n,e),Li(n.body,\`\${e}.body\`),Li(n.positiveSide,\`\${e}.positiveSide\`),Li(n.negativeSide,\`\${e}.negativeSide\`))}function yg(n,e){typeof n>"u"||(Vt(n,e),Li(n.panel,\`\${e}.panel\`),Li(n.frame,\`\${e}.frame\`),Li(n.reveal,\`\${e}.reveal\`))}function bg(n,e){if(!(typeof n>"u")){Vt(n,e);for(let[t,i]of Object.entries(n))Ct(t,\`\${e} key\`),typeof i!="string"&&typeof i!="boolean"&&!Number.isFinite(i)&&ft(\`\${e}.\${t}\`,"must be a finite number, string, or boolean.")}}function Br(n,e,t){Ct(n,e),t.has(n)&&ft(e,\`duplicate scene id "\${n}".\`),t.add(n)}function Mg(n){return Oi(n)?{...n,elevation:n.elevation??0,floorThickness:n.floorThickness??.2,appearance:n.appearance??"floor"}:n}function Sg(n){return Oi(n)?{...n,baseY:n.baseY??0,appearance:n.appearance??"wall"}:n}function wd(n){return n==null?{y:0}:Oi(n)?{...n,y:n.y??0}:n}function vd(n,e){return Oi(n)?{...n,rotation:wd(n.rotation),openAngle:n.openAngle??70,appearance:n.appearance??e}:n}function Eg(n){if(!Oi(n))return n;let e=n.appearance==="floor-lamp"?"floorLamp":n.appearance==="table-lamp"?"tableLamp":"floorLamp";return{...n,rotation:wd(n.rotation),visualType:n.visualType??(n.kind==="light"?e:void 0),appearance:n.appearance??(n.assetKey?{materialSlots:{}}:n.kind)}}function wg(n,e,t){if(!Oi(n))return n;let i={...n,rooms:Array.isArray(n.rooms)?n.rooms.map(Mg):n.rooms??[],walls:Array.isArray(n.walls)?n.walls.map(Sg):n.walls??[],doors:Array.isArray(n.doors)?n.doors.map(s=>vd(s,"door")):n.doors??[],windows:Array.isArray(n.windows)?n.windows.map(s=>vd(s,"window")):n.windows??[],objects:Array.isArray(n.objects)?n.objects.map(Eg):n.objects??[]};return e!==1?i:{...i,level:0,sortOrder:t,elevation:0}}function Tg(n,e){let t=n.sortOrder-e.sortOrder;if(t!==0)return t;let i=n.level-e.level;return i!==0?i:n.id<e.id?-1:n.id>e.id?1:0}function Ag(n,e,t,i){Vt(n,e),Br(n.id,\`\${e}.id\`,t),Ct(n.name,\`\${e}.name\`),os(n.polygon,\`\${e}.polygon\`),n.polygon.length<3&&ft(\`\${e}.polygon\`,"must contain at least three points."),cs(\`\${e}.polygon\`,n.polygon.length,i.maxPolygonPointsPerRoom),n.polygon.forEach((s,r)=>Vl(s,\`\${e}.polygon[\${r}]\`)),Bt(n.elevation,\`\${e}.elevation\`),Bt(n.floorThickness,\`\${e}.floorThickness\`,{positive:!0}),ro(n.appearance,\`\${e}.appearance\`),Li(n.material,\`\${e}.material\`)}function Cg(n,e,t){Vt(n,e),Br(n.id,\`\${e}.id\`,t),Vl(n.start,\`\${e}.start\`),Vl(n.end,\`\${e}.end\`),n.start.x===n.end.x&&n.start.z===n.end.z&&ft(e,"start and end must describe a wall with non-zero length."),Bt(n.baseY,\`\${e}.baseY\`),Bt(n.height,\`\${e}.height\`,{positive:!0}),Bt(n.thickness,\`\${e}.thickness\`,{positive:!0}),ro(n.appearance,\`\${e}.appearance\`),_g(n.materials,\`\${e}.materials\`)}function _d(n,e,t){Vt(n,e),Br(n.id,\`\${e}.id\`,t),typeof n.wallId<"u"&&Ct(n.wallId,\`\${e}.wallId\`),Md(n.position,\`\${e}.position\`),Sd(n.rotation,\`\${e}.rotation\`),Gl(n.size,\`\${e}.size\`),Bt(n.openAngle,\`\${e}.openAngle\`),ro(n.appearance,\`\${e}.appearance\`),yg(n.materials,\`\${e}.materials\`),Ed(n.binding,\`\${e}.binding\`)}function yd(n,e,t,i){let s=dg(e,n,t),{length:r}=pg(e);return(s.minimumOffset<-io||s.maximumOffset>r+io)&&ft(i,"opening must lie within its referenced wall."),t==="window"&&s.minimumY<-io&&ft(\`\${i}.position.y\`,"window sill must not be below its referenced wall."),s.maximumY>e.height+io&&ft(i,"opening height must lie within its referenced wall."),s}function Rg(n){for(let e=0;e<n.length;e+=1)for(let t=e+1;t<n.length;t+=1)fg(n[e].opening,n[t].opening)&&ft(n[t].path,"opening overlaps another opening in the same wall.")}function Ig(n,e,t){Vt(n,e),Br(n.id,\`\${e}.id\`,t),Ct(n.kind,\`\${e}.kind\`),gg.has(n.kind)||ft(\`\${e}.kind\`,"must be light, furniture, or decor."),Md(n.position,\`\${e}.position\`),Sd(n.rotation,\`\${e}.rotation\`),Gl(n.size,\`\${e}.size\`),Ed(n.binding,\`\${e}.binding\`),typeof n.visualType<"u"&&Ct(n.visualType,\`\${e}.visualType\`),bg(n.parameters,\`\${e}.parameters\`),typeof n.assetKey<"u"?(Ct(n.assetKey,\`\${e}.assetKey\`),n.kind!=="furniture"&&n.kind!=="decor"&&ft(\`\${e}.kind\`,"an assetKey is only valid for furniture or decor."),typeof n.variantKey<"u"?Ct(n.variantKey,\`\${e}.variantKey\`):ft(\`\${e}.variantKey\`,"must be a non-empty string."),Gl(n.dimensions,\`\${e}.dimensions\`),vg(n.appearance,\`\${e}.appearance\`)):ro(n.appearance,\`\${e}.appearance\`),n.kind!=="light"&&typeof n.assetKey>"u"?(Ct(n.shape,\`\${e}.shape\`),no.has(n.shape)||ft(\`\${e}.shape\`,\`must be one of \${[...no].join(", ")}.\`)):typeof n.shape<"u"&&!no.has(n.shape)&&ft(\`\${e}.shape\`,\`must be one of \${[...no].join(", ")} when provided.\`)}function Pg(n){Vt(n,"metadata"),typeof n.generatedAt<"u"&&Ct(n.generatedAt,"metadata.generatedAt"),typeof n.generator<"u"&&Ct(n.generator,"metadata.generator"),typeof n.revision<"u"&&Ct(n.revision,"metadata.revision")}function Td(n,{limits:e=so}={}){let t={...so,...e};Vt(n,"scene");let i=xg(n);i>t.maxJsonBytes&&ft("scene",\`JSON size is \${i} bytes; maximum is \${t.maxJsonBytes} bytes.\`),Hl.includes(n.schemaVersion)||ft("schemaVersion",\`unsupported version \${String(n.schemaVersion)}; expected one of \${Hl.join(", ")}.\`),Ct(n.sceneId,"sceneId"),Ct(n.name,"name"),os(n.floors,"floors"),n.floors.length===0&&ft("floors","must contain at least one floor."),cs("floors",n.floors.length,t.maxFloors),n.schemaVersion===2&&(Ct(n.defaultFloorId,"defaultFloorId"),typeof n.activeFloorId<"u"&&ft("activeFloorId","must not be stored in a Dashboard Scene v2."));let s={...n,metadata:n.metadata??{},defaultFloorId:n.schemaVersion===1?n.floors[0]?.id:n.defaultFloorId,floors:Array.isArray(n.floors)?n.floors.map((l,u)=>wg(l,n.schemaVersion,u)):n.floors};Pg(s.metadata);let r={rooms:0,walls:0,doors:0,windows:0,objects:0};for(let l of s.floors)if(Oi(l))for(let u of Object.keys(r))Array.isArray(l[u])&&(r[u]+=l[u].length);cs("rooms",r.rooms,t.maxRooms),cs("walls",r.walls,t.maxWalls),cs("doors",r.doors,t.maxDoors),cs("windows",r.windows,t.maxWindows),cs("objects",r.objects,t.maxObjects);let a=new Set([s.sceneId]),o=new Set;s.floors.forEach((l,u)=>{let h=\`floors[\${u}]\`;Vt(l,h),Br(l.id,\`\${h}.id\`,a),o.add(l.id),Ct(l.name,\`\${h}.name\`),xd(l.level,\`\${h}.level\`),xd(l.sortOrder,\`\${h}.sortOrder\`,{nonNegative:!0}),Bt(l.elevation,\`\${h}.elevation\`),os(l.rooms,\`\${h}.rooms\`),os(l.walls,\`\${h}.walls\`),os(l.doors,\`\${h}.doors\`),os(l.windows,\`\${h}.windows\`),os(l.objects,\`\${h}.objects\`),l.rooms.forEach((x,m)=>Ag(x,\`\${h}.rooms[\${m}]\`,a,t)),l.walls.forEach((x,m)=>Cg(x,\`\${h}.walls[\${m}]\`,a)),l.doors.forEach((x,m)=>_d(x,\`\${h}.doors[\${m}]\`,a)),l.windows.forEach((x,m)=>_d(x,\`\${h}.windows[\${m}]\`,a)),l.objects.forEach((x,m)=>Ig(x,\`\${h}.objects[\${m}]\`,a));let f=new Map(l.walls.map(x=>[x.id,x])),d=new Set(f.keys()),p=new Map;l.doors.forEach((x,m)=>{let g=\`\${h}.doors[\${m}]\`;if(x.wallId&&!d.has(x.wallId)&&ft(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=yd(x,f.get(x.wallId),"door",g),E=p.get(x.wallId)??[];E.push({opening:w,path:g}),p.set(x.wallId,E)}}),l.windows.forEach((x,m)=>{let g=\`\${h}.windows[\${m}]\`;if(x.wallId&&!d.has(x.wallId)&&ft(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let w=yd(x,f.get(x.wallId),"window",g),E=p.get(x.wallId)??[];E.push({opening:w,path:g}),p.set(x.wallId,E)}}),p.forEach(Rg)}),o.has(s.defaultFloorId)||ft("defaultFloorId",\`"\${s.defaultFloorId}" does not reference a floor.\`);let c=s.schemaVersion===2?[...s.floors].sort(Tg):s.floors;return{...s,floors:c,activeFloorId:s.defaultFloorId}}function Dg(n,e){typeof n!="string"&&ft("scene","JSON source must be a string.");let t=e?.limits?.maxJsonBytes??so.maxJsonBytes;bd(n)>t&&ft("scene",\`JSON size exceeds the maximum of \${t} bytes.\`);let i;try{i=JSON.parse(n)}catch(s){throw new Ns("Scene JSON could not be parsed.",{cause:s})}return Td(i,e)}Ad.exports={DASHBOARD_SCENE_LIMITS:so,DashboardSceneError:Ns,SUPPORTED_SCHEMA_VERSION:mg,SUPPORTED_SCHEMA_VERSIONS:Hl,parseDashboardScene:Dg,validateDashboardScene:Td}});var Wl=eo((Jw,Id)=>{"use strict";var Rd=Cd(),{DashboardSceneError:ao,parseDashboardScene:Lg}=Rd;async function Og(n,{fetchImpl:e=globalThis.fetch,signal:t}={}){if(typeof e!="function")throw new ao("Scene loading requires fetch support.");let i;try{i=await e(n,{cache:"no-store",...t?{signal:t}:{}})}catch(r){throw new ao(\`Scene could not be fetched from \${n}.\`,{cause:r})}if(!i?.ok)throw new ao(\`Scene request failed with HTTP \${i?.status??"unknown"} for \${n}.\`);let s;try{s=await i.text()}catch(r){throw new ao(\`Scene response from \${n} could not be read.\`,{cause:r})}return Lg(s)}Id.exports={...Rd,loadDashboardScene:Og}});var ns=eo((YC,Hm)=>{"use strict";var Um=Object.freeze({AVAILABLE:"available",UNAVAILABLE:"unavailable",MISSING:"missing"}),gE=Object.freeze({SET_POWER:"setPower",TOGGLE_POWER:"togglePower",SET_BRIGHTNESS:"setBrightness",SET_COLOR:"setColor",SET_COLOR_TEMPERATURE:"setColorTemperature",SET_COVER_POSITION:"setCoverPosition",OPEN_COVER:"openCover",CLOSE_COVER:"closeCover",STOP_COVER:"stopCover",SET_TARGET_TEMPERATURE:"setTargetTemperature",SET_THERMOSTAT_MODE:"setThermostatMode",SET_FAN_SPEED:"setFanSpeed",SET_FAN_MODE:"setFanMode",SET_TARGET_HUMIDITY:"setTargetHumidity",START_CLEANING:"startCleaning",PAUSE_CLEANING:"pauseCleaning",STOP_CLEANING:"stopCleaning",RETURN_TO_BASE:"returnToBase",LOCK:"lock",UNLOCK:"unlock"});function Mr(n){return n?.availability===Um.AVAILABLE}function xE(n){return!!(n?.power&&Object.prototype.hasOwnProperty.call(n.power,"isOn"))}function vE(n){return Mr(n)&&typeof n?.power?.isOn=="boolean"}function _E(n){return Mr(n)?n?.contact?.state??"unknown":"unknown"}function Bm(n){return!!n?.cover}function yE(n){return Mr(n)&&Bm(n)}function km(n){return!!n?.climate}function bE(n){return Mr(n)&&km(n)}function zm(n){return!!n?.cleaning}function ME(n){return Mr(n)&&zm(n)}Hm.exports={DEVICE_AVAILABILITY:Um,DEVICE_COMMAND:gE,contactState:_E,hasCleaningState:zm,hasClimateState:km,hasCoverState:Bm,hasPowerState:xE,isAvailable:Mr,isUsableCleaningState:ME,isUsableClimateState:bE,isUsableCoverState:yE,isUsablePowerState:vE}});var to=class{constructor(e){this.controller=new AbortController,this.signal=this.controller.signal,this.cleanups=[],this.disposed=!1;let t=()=>this.dispose();e?.aborted?this.dispose():e&&(e.addEventListener("abort",t,{once:!0}),this.defer(()=>e.removeEventListener("abort",t)))}defer(e){typeof e=="function"&&(this.disposed?e():this.cleanups.push(e))}check(){this.signal.throwIfAborted()}async wait(e){this.disposed&&(Promise.resolve(e).catch(()=>{}),this.check());let t;try{let i=await Promise.race([e,new Promise((s,r)=>{t=()=>r(this.signal.reason),this.signal.addEventListener("abort",t,{once:!0})})]);return this.check(),i}finally{this.signal.removeEventListener("abort",t)}}dispose(){if(!this.disposed){this.disposed=!0,this.controller.abort(new DOMException("Dashboard viewer was destroyed.","AbortError"));for(let e of this.cleanups.reverse())try{e()}catch(t){console.warn("Dashboard cleanup failed.",t)}this.cleanups.length=0}}};var Pd=Qn(Wl());function Dd(n){let e=n?.scene,t=e&&typeof e=="object"&&!Array.isArray(e)?(({activeFloorId:i,...s})=>s)(e):e;return{...n,scene:Pd.default.validateDashboardScene(t)}}var Ld=\`
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
\`,Xl=new WeakMap;function ql(n=document){let e=Xl.get(n);if(!e){let s=(n.ownerDocument??n).createElement("style");s.dataset.mikonusRendererStyles="",s.textContent=Ld,(n.head??n).appendChild(s),e={element:s,users:0},Xl.set(n,e)}e.users+=1;let t=!1;return()=>{t||(t=!0,--e.users===0&&(e.element.remove(),Xl.delete(n)))}}function Yl({container:n,sceneShell:e=n}){let t=e.getRootNode(),s=[ql(t)],r=e.ownerDocument,a=r.defaultView;for(let u of new Set([e,n])){let h=u.classList.contains("mikonus-renderer-ui");h||u.classList.add("mikonus-renderer-ui");let f=u.style.position;a.getComputedStyle(u).position==="static"&&(u.style.position="relative");let d=u.style.isolation;u.style.isolation="isolate",s.push(()=>{h||u.classList.remove("mikonus-renderer-ui"),u.style.position=f,u.style.isolation=d})}let o=r.createElement("div");o.className="mikonus-marker-host",n.appendChild(o);let c=r.createElement("div");c.className="mikonus-popup-host",e.appendChild(c);let l=!1;return{markerHost:o,popupHost:c,setEnvironment(u){for(let h of new Set([e,n]))h.dataset.dashboardTheme=u.resolvedTheme},dispose(){if(!l){l=!0,o.remove(),c.remove();for(let u of s.reverse())u()}}}}var Yi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},$i={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},uf=0,Ou=1,hf=2;var Ss=1,df=2,ur=3,Bn=0,pn=1,sn=2,si=0,ms=1,Nu=2,Fu=3,Uu=4,ff=5;var Vi=100,pf=101,mf=102,gf=103,xf=104,vf=200,_f=201,yf=202,bf=203,Po=204,Do=205,Mf=206,Sf=207,Ef=208,wf=209,Tf=210,Af=211,Cf=212,Rf=213,If=214,Lo=0,Oo=1,No=2,gs=3,Fo=4,Uo=5,Bo=6,ko=7,Bu=0,Pf=1,Df=2,In=0,ku=1,zu=2,Hu=3,hr=4,Vu=5,Gu=6,Wu=7;var Xu=300,ji=301,Es=302,pc=303,mc=304,ya=306,xs=1e3,ti=1001,zo=1002,Jt=1003,Lf=1004;var ba=1005;var Gt=1006,gc=1007;var ri=1008;var cn=1009,qu=1010,Yu=1011,dr=1012,xc=1013,Yn=1014,$n=1015,ai=1016,vc=1017,_c=1018,fr=1020,$u=35902,ju=35899,Zu=1021,Ku=1022,xn=1023,ii=1026,Zi=1027,Ju=1028,yc=1029,Ki=1030,bc=1031;var Mc=1033,Ma=33776,Sa=33777,Ea=33778,wa=33779,Sc=35840,Ec=35841,wc=35842,Tc=35843,Ac=36196,Cc=37492,Rc=37496,Ic=37488,Pc=37489,Ta=37490,Dc=37491,Lc=37808,Oc=37809,Nc=37810,Fc=37811,Uc=37812,Bc=37813,kc=37814,zc=37815,Hc=37816,Vc=37817,Gc=37818,Wc=37819,Xc=37820,qc=37821,Yc=36492,$c=36494,jc=36495,Zc=36283,Kc=36284,Aa=36285,Jc=36286;var $r=2300,Ho=2301,Io=2302,_u=2303,yu=2400,bu=2401,Mu=2402;var Of=3200;var Qc=0,Nf=1,Si="",Kt="srgb",jr="srgb-linear",Zr="linear",vt="srgb";var fs=7680;var Su=519,Ff=512,Uf=513,Bf=514,el=515,kf=516,zf=517,tl=518,Hf=519,Eu=35044;var Qu="300 es",Wn=2e3,Zs=2001;function Ng(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Fg(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Kr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Vf(){let n=Kr("canvas");return n.style.display="block",n}var Od={},Ks=null;function eh(...n){let e="THREE."+n.shift();Ks?Ks("log",e,...n):console.log(e,...n)}function Gf(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ve(...n){n=Gf(n);let e="THREE."+n.shift();if(Ks)Ks("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function We(...n){n=Gf(n);let e="THREE."+n.shift();if(Ks)Ks("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function ps(...n){let e=n.join(" ");e in Od||(Od[e]=!0,Ve(...n))}function Wf(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Xf={[Lo]:Oo,[No]:Bo,[Fo]:ko,[gs]:Uo,[Oo]:Lo,[Bo]:No,[ko]:Fo,[Uo]:gs},Xn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},an=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Nd=1234567,Wr=Math.PI/180,vs=180/Math.PI;function ws(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(an[n&255]+an[n>>8&255]+an[n>>16&255]+an[n>>24&255]+"-"+an[e&255]+an[e>>8&255]+"-"+an[e>>16&15|64]+an[e>>24&255]+"-"+an[t&63|128]+an[t>>8&255]+"-"+an[t>>16&255]+an[t>>24&255]+an[i&255]+an[i>>8&255]+an[i>>16&255]+an[i>>24&255]).toLowerCase()}function nt(n,e,t){return Math.max(e,Math.min(t,n))}function th(n,e){return(n%e+e)%e}function Ug(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Bg(n,e,t){return n!==e?(t-n)/(e-n):0}function Xr(n,e,t){return(1-t)*n+t*e}function kg(n,e,t,i){return Xr(n,e,1-Math.exp(-t*i))}function zg(n,e=1){return e-Math.abs(th(n,e*2)-e)}function Hg(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Vg(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Gg(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Wg(n,e){return n+Math.random()*(e-n)}function Xg(n){return n*(.5-Math.random())}function qg(n){n!==void 0&&(Nd=n);let e=Nd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Yg(n){return n*Wr}function $g(n){return n*vs}function jg(n){return(n&n-1)===0&&n!==0}function Zg(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Kg(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Jg(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+i)/2),u=a((e+i)/2),h=r((e-i)/2),f=a((e-i)/2),d=r((i-e)/2),p=a((i-e)/2);switch(s){case"XYX":n.set(o*u,c*h,c*f,o*l);break;case"YZY":n.set(c*f,o*u,c*h,o*l);break;case"ZXZ":n.set(c*h,c*f,o*u,o*l);break;case"XZX":n.set(o*u,c*p,c*d,o*l);break;case"YXY":n.set(c*d,o*u,c*p,o*l);break;case"ZYZ":n.set(c*p,c*d,o*u,o*l);break;default:Ve("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function $s(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function dn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ht={DEG2RAD:Wr,RAD2DEG:vs,generateUUID:ws,clamp:nt,euclideanModulo:th,mapLinear:Ug,inverseLerp:Bg,lerp:Xr,damp:kg,pingpong:zg,smoothstep:Hg,smootherstep:Vg,randInt:Gg,randFloat:Wg,randFloatSpread:Xg,seededRandom:qg,degToRad:Yg,radToDeg:$g,isPowerOfTwo:jg,ceilPowerOfTwo:Zg,floorPowerOfTwo:Kg,setQuaternionFromProperEuler:Jg,normalize:dn,denormalize:$s},ce=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Sn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3],f=r[a+0],d=r[a+1],p=r[a+2],x=r[a+3];if(h!==x||c!==f||l!==d||u!==p){let m=c*f+l*d+u*p+h*x;m<0&&(f=-f,d=-d,p=-p,x=-x,m=-m);let g=1-o;if(m<.9995){let w=Math.acos(m),E=Math.sin(w);g=Math.sin(g*w)/E,o=Math.sin(o*w)/E,c=c*g+f*o,l=l*g+d*o,u=u*g+p*o,h=h*g+x*o}else{c=c*g+f*o,l=l*g+d*o,u=u*g+p*o,h=h*g+x*o;let w=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=w,l*=w,u*=w,h*=w}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[a],f=r[a+1],d=r[a+2],p=r[a+3];return e[t]=o*p+u*h+c*d-l*f,e[t+1]=c*p+u*f+l*h-o*d,e[t+2]=l*p+u*d+o*f-c*h,e[t+3]=u*p-o*h-c*f-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),u=o(s/2),h=o(r/2),f=c(i/2),d=c(s/2),p=c(r/2);switch(a){case"XYZ":this._x=f*u*h+l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h-f*d*p;break;case"YXZ":this._x=f*u*h+l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h+f*d*p;break;case"ZXY":this._x=f*u*h-l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h-f*d*p;break;case"ZYX":this._x=f*u*h-l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h+f*d*p;break;case"YZX":this._x=f*u*h+l*d*p,this._y=l*d*h+f*u*p,this._z=l*u*p-f*d*h,this._w=l*u*h-f*d*p;break;case"XZY":this._x=f*u*h-l*d*p,this._y=l*d*h-f*u*p,this._z=l*u*p+f*d*h,this._w=l*u*h+f*d*p;break;default:Ve("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],h=t[10],f=i+o+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-c)*d,this._y=(r-l)*d,this._z=(a-s)*d}else if(i>o&&i>h){let d=2*Math.sqrt(1+i-o-h);this._w=(u-c)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+l)/d}else if(o>h){let d=2*Math.sqrt(1+o-i-h);this._w=(r-l)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(c+u)/d}else{let d=2*Math.sqrt(1+h-i-o);this._w=(a-s)/d,this._x=(r+l)/d,this._y=(c+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-i*l,this._z=r*u+a*l+i*c-s*o,this._w=a*u-i*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Fd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Fd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*i),u=2*(o*t-r*s),h=2*(r*i-a*t);return this.x=t+c*l+a*h-o*u,this.y=i+c*u+o*l-r*h,this.z=s+c*h+r*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-i*c,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return $l.copy(this).projectOnVector(e),this.sub($l)}reflect(e){return this.sub($l.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(nt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},$l=new D,Fd=new Sn,Je=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l)}set(e,t,i,s,r,a,o,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],u=i[4],h=i[7],f=i[2],d=i[5],p=i[8],x=s[0],m=s[3],g=s[6],w=s[1],E=s[4],y=s[7],T=s[2],b=s[5],C=s[8];return r[0]=a*x+o*w+c*T,r[3]=a*m+o*E+c*b,r[6]=a*g+o*y+c*C,r[1]=l*x+u*w+h*T,r[4]=l*m+u*E+h*b,r[7]=l*g+u*y+h*C,r[2]=f*x+d*w+p*T,r[5]=f*m+d*E+p*b,r[8]=f*g+d*y+p*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-i*r*u+i*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=u*a-o*l,f=o*c-u*r,d=l*r-a*c,p=t*h+i*f+s*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=h*x,e[1]=(s*l-u*i)*x,e[2]=(o*i-s*a)*x,e[3]=f*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-o*t)*x,e[6]=d*x,e[7]=(i*c-l*t)*x,e[8]=(a*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return ps("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(jl.makeScale(e,t)),this}rotate(e){return ps("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(jl.makeRotation(-e)),this}translate(e,t){return ps("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(jl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},jl=new Je,Ud=new Je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Bd=new Je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Qg(){let n={enabled:!0,workingColorSpace:jr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===vt&&(s.r=xi(s.r),s.g=xi(s.g),s.b=xi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===vt&&(s.r=js(s.r),s.g=js(s.g),s.b=js(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Si?Zr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ps("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ps("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[jr]:{primaries:e,whitePoint:i,transfer:Zr,toXYZ:Ud,fromXYZ:Bd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Kt},outputColorSpaceConfig:{drawingBufferColorSpace:Kt}},[Kt]:{primaries:e,whitePoint:i,transfer:vt,toXYZ:Ud,fromXYZ:Bd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Kt}}}),n}var ut=Qg();function xi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function js(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Fs,Vo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Fs===void 0&&(Fs=Kr("canvas")),Fs.width=e.width,Fs.height=e.height;let s=Fs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Fs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Kr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=xi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(xi(t[i]/255)*255):t[i]=xi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ve("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ex=0,Js=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ex++}),this.uuid=ws(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Zl(s[a].image)):r.push(Zl(s[a]))}else r=Zl(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Zl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Vo.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ve("Texture: Unable to serialize Texture."),{})}var tx=0,Kl=new D,gn=class n extends Xn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=ti,s=ti,r=Gt,a=ri,o=xn,c=cn,l=n.DEFAULT_ANISOTROPY,u=Si){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tx++}),this.uuid=ws(),this.name="",this.source=new Js(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Kl).x}get height(){return this.source.getSize(Kl).y}get depth(){return this.source.getSize(Kl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Ve(\`Texture.setValues(): parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){Ve(\`Texture.setValues(): property '\${t}' does not exist.\`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Xu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case xs:e.x=e.x-Math.floor(e.x);break;case ti:e.x=e.x<0?0:1;break;case zo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case xs:e.y=e.y-Math.floor(e.y);break;case ti:e.y=e.y<0?0:1;break;case zo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=Xu;gn.DEFAULT_ANISOTROPY=1;var Pt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],f=c[1],d=c[5],p=c[9],x=c[2],m=c[6],g=c[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(p+m)<.1&&Math.abs(l+d+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,y=(d+1)/2,T=(g+1)/2,b=(u+f)/4,C=(h+x)/4,v=(p+m)/4;return E>y&&E>T?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=b/i,r=C/i):y>T?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=b/s,r=v/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=C/r,s=v/r),this.set(i,s,r,t),this}let w=Math.sqrt((m-p)*(m-p)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(w)<.001&&(w=1),this.x=(m-p)/w,this.y=(h-x)/w,this.z=(f-u)/w,this.w=Math.acos((l+d+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(nt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Go=class extends Xn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Pt(0,0,e,t),this.scissorTest=!1,this.viewport=new Pt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new gn(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Gt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Js(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},En=class extends Go{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Jr=class extends gn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Wo=class extends gn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var It=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m)}set(e,t,i,s,r,a,o,c,l,u,h,f,d,p,x,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=l,g[6]=u,g[10]=h,g[14]=f,g[3]=d,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/Us.setFromMatrixColumn(e,0).length(),r=1/Us.setFromMatrixColumn(e,1).length(),a=1/Us.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=a*u,d=a*h,p=o*u,x=o*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=d+p*l,t[5]=f-x*l,t[9]=-o*c,t[2]=x-f*l,t[6]=p+d*l,t[10]=a*c}else if(e.order==="YXZ"){let f=c*u,d=c*h,p=l*u,x=l*h;t[0]=f+x*o,t[4]=p*o-d,t[8]=a*l,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=d*o-p,t[6]=x+f*o,t[10]=a*c}else if(e.order==="ZXY"){let f=c*u,d=c*h,p=l*u,x=l*h;t[0]=f-x*o,t[4]=-a*h,t[8]=p+d*o,t[1]=d+p*o,t[5]=a*u,t[9]=x-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let f=a*u,d=a*h,p=o*u,x=o*h;t[0]=c*u,t[4]=p*l-d,t[8]=f*l+x,t[1]=c*h,t[5]=x*l+f,t[9]=d*l-p,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let f=a*c,d=a*l,p=o*c,x=o*l;t[0]=c*u,t[4]=x-f*h,t[8]=p*h+d,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=d*h+p,t[10]=f-x*h}else if(e.order==="XZY"){let f=a*c,d=a*l,p=o*c,x=o*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=f*h+x,t[5]=a*u,t[9]=d*h-p,t[2]=p*h-d,t[6]=o*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(nx,e,ix)}lookAt(e,t,i){let s=this.elements;return bn.subVectors(e,t),bn.lengthSq()===0&&(bn.z=1),bn.normalize(),Ni.crossVectors(i,bn),Ni.lengthSq()===0&&(Math.abs(i.z)===1?bn.x+=1e-4:bn.z+=1e-4,bn.normalize(),Ni.crossVectors(i,bn)),Ni.normalize(),oo.crossVectors(bn,Ni),s[0]=Ni.x,s[4]=oo.x,s[8]=bn.x,s[1]=Ni.y,s[5]=oo.y,s[9]=bn.y,s[2]=Ni.z,s[6]=oo.z,s[10]=bn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],u=i[1],h=i[5],f=i[9],d=i[13],p=i[2],x=i[6],m=i[10],g=i[14],w=i[3],E=i[7],y=i[11],T=i[15],b=s[0],C=s[4],v=s[8],S=s[12],P=s[1],I=s[5],O=s[9],U=s[13],Y=s[2],R=s[6],V=s[10],z=s[14],k=s[3],$=s[7],ie=s[11],re=s[15];return r[0]=a*b+o*P+c*Y+l*k,r[4]=a*C+o*I+c*R+l*$,r[8]=a*v+o*O+c*V+l*ie,r[12]=a*S+o*U+c*z+l*re,r[1]=u*b+h*P+f*Y+d*k,r[5]=u*C+h*I+f*R+d*$,r[9]=u*v+h*O+f*V+d*ie,r[13]=u*S+h*U+f*z+d*re,r[2]=p*b+x*P+m*Y+g*k,r[6]=p*C+x*I+m*R+g*$,r[10]=p*v+x*O+m*V+g*ie,r[14]=p*S+x*U+m*z+g*re,r[3]=w*b+E*P+y*Y+T*k,r[7]=w*C+E*I+y*R+T*$,r[11]=w*v+E*O+y*V+T*ie,r[15]=w*S+E*U+y*z+T*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],h=e[6],f=e[10],d=e[14],p=e[3],x=e[7],m=e[11],g=e[15],w=c*d-l*f,E=o*d-l*h,y=o*f-c*h,T=a*d-l*u,b=a*f-c*u,C=a*h-o*u;return t*(x*w-m*E+g*y)-i*(p*w-m*T+g*b)+s*(p*E-x*T+g*C)-r*(p*y-x*b+m*C)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],u=e[10];return t*(a*u-o*l)-i*(r*u-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],h=e[9],f=e[10],d=e[11],p=e[12],x=e[13],m=e[14],g=e[15],w=t*o-i*a,E=t*c-s*a,y=t*l-r*a,T=i*c-s*o,b=i*l-r*o,C=s*l-r*c,v=u*x-h*p,S=u*m-f*p,P=u*g-d*p,I=h*m-f*x,O=h*g-d*x,U=f*g-d*m,Y=w*U-E*O+y*I+T*P-b*S+C*v;if(Y===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/Y;return e[0]=(o*U-c*O+l*I)*R,e[1]=(s*O-i*U-r*I)*R,e[2]=(x*C-m*b+g*T)*R,e[3]=(f*b-h*C-d*T)*R,e[4]=(c*P-a*U-l*S)*R,e[5]=(t*U-s*P+r*S)*R,e[6]=(m*y-p*C-g*E)*R,e[7]=(u*C-f*y+d*E)*R,e[8]=(a*O-o*P+l*v)*R,e[9]=(i*P-t*O-r*v)*R,e[10]=(p*b-x*y+g*w)*R,e[11]=(h*y-u*b-d*w)*R,e[12]=(o*S-a*I-c*v)*R,e[13]=(t*I-i*S+s*v)*R,e[14]=(x*E-p*T-m*w)*R,e[15]=(u*T-h*E+f*w)*R,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,c=e.z,l=r*a,u=r*o;return this.set(l*a+i,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+i,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,u=a+a,h=o+o,f=r*l,d=r*u,p=r*h,x=a*u,m=a*h,g=o*h,w=c*l,E=c*u,y=c*h,T=i.x,b=i.y,C=i.z;return s[0]=(1-(x+g))*T,s[1]=(d+y)*T,s[2]=(p-E)*T,s[3]=0,s[4]=(d-y)*b,s[5]=(1-(f+g))*b,s[6]=(m+w)*b,s[7]=0,s[8]=(p+E)*C,s[9]=(m-w)*C,s[10]=(1-(f+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=Us.set(s[0],s[1],s[2]).length(),o=Us.set(s[4],s[5],s[6]).length(),c=Us.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Hn.copy(this);let l=1/a,u=1/o,h=1/c;return Hn.elements[0]*=l,Hn.elements[1]*=l,Hn.elements[2]*=l,Hn.elements[4]*=u,Hn.elements[5]*=u,Hn.elements[6]*=u,Hn.elements[8]*=h,Hn.elements[9]*=h,Hn.elements[10]*=h,t.setFromRotationMatrix(Hn),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,s,r,a,o=Wn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(i-s),f=(t+e)/(t-e),d=(i+s)/(i-s),p,x;if(c)p=r/(a-r),x=a*r/(a-r);else if(o===Wn)p=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Zs)p=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=Wn,c=!1){let l=this.elements,u=2/(t-e),h=2/(i-s),f=-(t+e)/(t-e),d=-(i+s)/(i-s),p,x;if(c)p=1/(a-r),x=a/(a-r);else if(o===Wn)p=-2/(a-r),x=-(a+r)/(a-r);else if(o===Zs)p=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=h,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Us=new D,Hn=new It,nx=new D(0,0,0),ix=new D(1,1,1),Ni=new D,oo=new D,bn=new D,kd=new It,zd=new Sn,vi=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(nt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Ve("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return kd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(kd,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return zd.setFromEuler(this),this.setFromQuaternion(zd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vi.DEFAULT_ORDER="XYZ";var Qs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},sx=0,Hd=new D,Bs=new Sn,di=new It,co=new D,kr=new D,rx=new D,ax=new Sn,Vd=new D(1,0,0),Gd=new D(0,1,0),Wd=new D(0,0,1),Xd={type:"added"},ox={type:"removed"},ks={type:"childadded",child:null},Jl={type:"childremoved",child:null},zt=class n extends Xn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sx++}),this.uuid=ws(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new D,t=new vi,i=new Sn,s=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new It},normalMatrix:{value:new Je}}),this.matrix=new It,this.matrixWorld=new It,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.premultiply(Bs),this}rotateX(e){return this.rotateOnAxis(Vd,e)}rotateY(e){return this.rotateOnAxis(Gd,e)}rotateZ(e){return this.rotateOnAxis(Wd,e)}translateOnAxis(e,t){return Hd.copy(e).applyQuaternion(this.quaternion),this.position.add(Hd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vd,e)}translateY(e){return this.translateOnAxis(Gd,e)}translateZ(e){return this.translateOnAxis(Wd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?co.copy(e):co.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),kr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(kr,co,this.up):di.lookAt(co,kr,this.up),this.quaternion.setFromRotationMatrix(di),s&&(di.extractRotation(s.matrixWorld),Bs.setFromRotationMatrix(di),this.quaternion.premultiply(Bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Xd),ks.child=e,this.dispatchEvent(ks),ks.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ox),Jl.child=e,this.dispatchEvent(Jl),Jl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Xd),ks.child=e,this.dispatchEvent(ks),ks.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,e,rx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,ax,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),d=a(e.animations),p=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),p.length>0&&(i.nodes=p)}return i.object=s,i;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};zt.DEFAULT_UP=new D(0,1,0);zt.DEFAULT_MATRIX_AUTO_UPDATE=!0;zt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var yt=class extends zt{constructor(){super(),this.isGroup=!0,this.type="Group"}},cx={type:"move"},er=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new yt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new yt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new yt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),g=this._getHandJoint(l,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,p=.005;l.inputState.pinching&&f>d+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=d-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(cx)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new yt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},qf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Fi={h:0,s:0,l:0},lo={h:0,s:0,l:0};function Ql(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ke=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ut.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=ut.workingColorSpace){return this.r=e,this.g=t,this.b=i,ut.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=ut.workingColorSpace){if(e=th(e,1),t=nt(t,0,1),i=nt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=Ql(a,r,e+1/3),this.g=Ql(a,r,e),this.b=Ql(a,r,e-1/3)}return ut.colorSpaceToWorking(this,s),this}setStyle(e,t=Kt){function i(r){r!==void 0&&parseFloat(r)<1&&Ve("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\\w+)\\(([^\\)]*)\\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\\s*(\\d*\\.?\\d+)\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ve("Color: Unknown color model "+e)}}else if(s=/^\\#([A-Fa-f\\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ve("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){let i=qf[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ve("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=js(e.r),this.g=js(e.g),this.b=js(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return ut.workingToColorSpace(on.copy(this),e),Math.round(nt(on.r*255,0,255))*65536+Math.round(nt(on.g*255,0,255))*256+Math.round(nt(on.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ut.workingColorSpace){ut.workingToColorSpace(on.copy(this),t);let i=on.r,s=on.g,r=on.b,a=Math.max(i,s,r),o=Math.min(i,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let h=a-o;switch(l=u<=.5?h/(a+o):h/(2-a-o),a){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=ut.workingColorSpace){return ut.workingToColorSpace(on.copy(this),t),e.r=on.r,e.g=on.g,e.b=on.b,e}getStyle(e=Kt){ut.workingToColorSpace(on.copy(this),e);let t=on.r,i=on.g,s=on.b;return e!==Kt?\`color(\${e} \${t.toFixed(3)} \${i.toFixed(3)} \${s.toFixed(3)})\`:\`rgb(\${Math.round(t*255)},\${Math.round(i*255)},\${Math.round(s*255)})\`}offsetHSL(e,t,i){return this.getHSL(Fi),this.setHSL(Fi.h+e,Fi.s+t,Fi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Fi),e.getHSL(lo);let i=Xr(Fi.h,lo.h,t),s=Xr(Fi.s,lo.s,t),r=Xr(Fi.l,lo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},on=new Ke;Ke.NAMES=qf;var Qr=class extends zt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vi,this.environmentIntensity=1,this.environmentRotation=new vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Vn=new D,fi=new D,eu=new D,pi=new D,zs=new D,Hs=new D,qd=new D,tu=new D,nu=new D,iu=new D,su=new Pt,ru=new Pt,au=new Pt,Hi=class n{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Vn.subVectors(e,t),s.cross(Vn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Vn.subVectors(s,t),fi.subVectors(i,t),eu.subVectors(e,t);let a=Vn.dot(Vn),o=Vn.dot(fi),c=Vn.dot(eu),l=fi.dot(fi),u=fi.dot(eu),h=a*l-o*o;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(l*c-o*u)*f,p=(a*u-o*c)*f;return r.set(1-d-p,p,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,i,s,r,a,o,c){return this.getBarycoord(e,t,i,s,pi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,pi.x),c.addScaledVector(a,pi.y),c.addScaledVector(o,pi.z),c)}static getInterpolatedAttribute(e,t,i,s,r,a){return su.setScalar(0),ru.setScalar(0),au.setScalar(0),su.fromBufferAttribute(e,t),ru.fromBufferAttribute(e,i),au.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(su,r.x),a.addScaledVector(ru,r.y),a.addScaledVector(au,r.z),a}static isFrontFacing(e,t,i,s){return Vn.subVectors(i,t),fi.subVectors(e,t),Vn.cross(fi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Vn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Vn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;zs.subVectors(s,i),Hs.subVectors(r,i),tu.subVectors(e,i);let c=zs.dot(tu),l=Hs.dot(tu);if(c<=0&&l<=0)return t.copy(i);nu.subVectors(e,s);let u=zs.dot(nu),h=Hs.dot(nu);if(u>=0&&h<=u)return t.copy(s);let f=c*h-u*l;if(f<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(i).addScaledVector(zs,a);iu.subVectors(e,r);let d=zs.dot(iu),p=Hs.dot(iu);if(p>=0&&d<=p)return t.copy(r);let x=d*l-c*p;if(x<=0&&l>=0&&p<=0)return o=l/(l-p),t.copy(i).addScaledVector(Hs,o);let m=u*p-d*h;if(m<=0&&h-u>=0&&d-p>=0)return qd.subVectors(r,s),o=(h-u)/(h-u+(d-p)),t.copy(s).addScaledVector(qd,o);let g=1/(m+x+f);return a=x*g,o=f*g,t.copy(i).addScaledVector(zs,a).addScaledVector(Hs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},tn=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Gn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Gn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Gn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Gn):Gn.fromBufferAttribute(r,a),Gn.applyMatrix4(e.matrixWorld),this.expandByPoint(Gn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),uo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),uo.copy(i.boundingBox)),uo.applyMatrix4(e.matrixWorld),this.union(uo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Gn),Gn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zr),ho.subVectors(this.max,zr),Vs.subVectors(e.a,zr),Gs.subVectors(e.b,zr),Ws.subVectors(e.c,zr),Ui.subVectors(Gs,Vs),Bi.subVectors(Ws,Gs),ls.subVectors(Vs,Ws);let t=[0,-Ui.z,Ui.y,0,-Bi.z,Bi.y,0,-ls.z,ls.y,Ui.z,0,-Ui.x,Bi.z,0,-Bi.x,ls.z,0,-ls.x,-Ui.y,Ui.x,0,-Bi.y,Bi.x,0,-ls.y,ls.x,0];return!ou(t,Vs,Gs,Ws,ho)||(t=[1,0,0,0,1,0,0,0,1],!ou(t,Vs,Gs,Ws,ho))?!1:(fo.crossVectors(Ui,Bi),t=[fo.x,fo.y,fo.z],ou(t,Vs,Gs,Ws,ho))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},mi=[new D,new D,new D,new D,new D,new D,new D,new D],Gn=new D,uo=new tn,Vs=new D,Gs=new D,Ws=new D,Ui=new D,Bi=new D,ls=new D,zr=new D,ho=new D,fo=new D,us=new D;function ou(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){us.fromArray(n,r);let o=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),c=e.dot(us),l=t.dot(us),u=i.dot(us);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var kt=new D,po=new ce,lx=0,fn=class extends Xn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:lx++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Eu,this.updateRanges=[],this.gpuType=$n,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)po.fromBufferAttribute(this,t),po.applyMatrix3(e),this.setXY(t,po.x,po.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=$s(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=dn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=$s(t,this.array)),t}setX(e,t){return this.normalized&&(t=dn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=$s(t,this.array)),t}setY(e,t){return this.normalized&&(t=dn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=$s(t,this.array)),t}setZ(e,t){return this.normalized&&(t=dn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=$s(t,this.array)),t}setW(e,t){return this.normalized&&(t=dn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=dn(t,this.array),i=dn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=dn(t,this.array),i=dn(i,this.array),s=dn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=dn(t,this.array),i=dn(i,this.array),s=dn(s,this.array),r=dn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Eu&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var ea=class extends fn{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ta=class extends fn{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Mt=class extends fn{constructor(e,t,i){super(new Float32Array(e),t,i)}},ux=new tn,Hr=new D,cu=new D,tr=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):ux.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Hr.subVectors(e,this.center);let t=Hr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Hr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(cu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Hr.copy(e.center).add(cu)),this.expandByPoint(Hr.copy(e.center).sub(cu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},hx=0,Fn=new It,lu=new zt,Xs=new D,Mn=new tn,Vr=new tn,Zt=new D,nn=class n extends Xn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hx++}),this.uuid=ws(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ng(e)?ta:ea)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Je().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Fn.makeRotationFromQuaternion(e),this.applyMatrix4(Fn),this}rotateX(e){return Fn.makeRotationX(e),this.applyMatrix4(Fn),this}rotateY(e){return Fn.makeRotationY(e),this.applyMatrix4(Fn),this}rotateZ(e){return Fn.makeRotationZ(e),this.applyMatrix4(Fn),this}translate(e,t,i){return Fn.makeTranslation(e,t,i),this.applyMatrix4(Fn),this}scale(e,t,i){return Fn.makeScale(e,t,i),this.applyMatrix4(Fn),this}lookAt(e){return lu.lookAt(e),lu.updateMatrix(),this.applyMatrix4(lu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xs).negate(),this.translate(Xs.x,Xs.y,Xs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Mt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ve("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new tn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];Mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Zt.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(Zt),Zt.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(Zt)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let i=this.boundingSphere.center;if(Mn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Vr.setFromBufferAttribute(o),this.morphTargetsRelative?(Zt.addVectors(Mn.min,Vr.min),Mn.expandByPoint(Zt),Zt.addVectors(Mn.max,Vr.max),Mn.expandByPoint(Zt)):(Mn.expandByPoint(Vr.min),Mn.expandByPoint(Vr.max))}Mn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Zt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Zt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Zt.fromBufferAttribute(o,l),c&&(Xs.fromBufferAttribute(e,l),Zt.add(Xs)),s=Math.max(s,i.distanceToSquared(Zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new fn(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let v=0;v<i.count;v++)o[v]=new D,c[v]=new D;let l=new D,u=new D,h=new D,f=new ce,d=new ce,p=new ce,x=new D,m=new D;function g(v,S,P){l.fromBufferAttribute(i,v),u.fromBufferAttribute(i,S),h.fromBufferAttribute(i,P),f.fromBufferAttribute(r,v),d.fromBufferAttribute(r,S),p.fromBufferAttribute(r,P),u.sub(l),h.sub(l),d.sub(f),p.sub(f);let I=1/(d.x*p.y-p.x*d.y);isFinite(I)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(h,-d.y).multiplyScalar(I),m.copy(h).multiplyScalar(d.x).addScaledVector(u,-p.x).multiplyScalar(I),o[v].add(x),o[S].add(x),o[P].add(x),c[v].add(m),c[S].add(m),c[P].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let v=0,S=w.length;v<S;++v){let P=w[v],I=P.start,O=P.count;for(let U=I,Y=I+O;U<Y;U+=3)g(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let E=new D,y=new D,T=new D,b=new D;function C(v){T.fromBufferAttribute(s,v),b.copy(T);let S=o[v];E.copy(S),E.sub(T.multiplyScalar(T.dot(S))).normalize(),y.crossVectors(b,S);let I=y.dot(c[v])<0?-1:1;a.setXYZW(v,E.x,E.y,E.z,I)}for(let v=0,S=w.length;v<S;++v){let P=w[v],I=P.start,O=P.count;for(let U=I,Y=I+O;U<Y;U+=3)C(e.getX(U+0)),C(e.getX(U+1)),C(e.getX(U+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new fn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let s=new D,r=new D,a=new D,o=new D,c=new D,l=new D,u=new D,h=new D;if(e)for(let f=0,d=e.count;f<d;f+=3){let p=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(i,p),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),o.add(u),c.add(u),l.add(u),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Zt.fromBufferAttribute(e,t),Zt.normalize(),e.setXYZ(t,Zt.x,Zt.y,Zt.z)}toNonIndexed(){function e(o,c){let l=o.array,u=o.itemSize,h=o.normalized,f=new l.constructor(c.length*u),d=0,p=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?d=c[x]*o.data.stride+o.offset:d=c[x]*u;for(let g=0;g<u;g++)f[p++]=l[d++]}return new fn(f,u,h)}if(this.index===null)return Ve("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,i);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,h=l.length;u<h;u++){let f=l[u],d=e(f,i);c.push(d)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,f=l.length;h<f;h++){let d=l[h];u.push(d.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,u=a.length;l<u;l++){let h=a[l];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var dx=0,Gi=class extends Xn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dx++}),this.uuid=ws(),this.name="",this.type="Material",this.blending=ms,this.side=Bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Po,this.blendDst=Do,this.blendEquation=Vi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ke(0,0,0),this.blendAlpha=0,this.depthFunc=gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Su,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fs,this.stencilZFail=fs,this.stencilZPass=fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Ve(\`Material: parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){Ve(\`Material: '\${t}' is not a property of THREE.\${this.type}.\`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ms&&(i.blending=this.blending),this.side!==Bn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Po&&(i.blendSrc=this.blendSrc),this.blendDst!==Do&&(i.blendDst=this.blendDst),this.blendEquation!==Vi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==gs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Su&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==fs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==fs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ce().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ce().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var gi=new D,uu=new D,mo=new D,ki=new D,hu=new D,go=new D,du=new D,_s=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=gi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gi.copy(this.origin).addScaledVector(this.direction,t),gi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){uu.copy(e).add(t).multiplyScalar(.5),mo.copy(t).sub(e).normalize(),ki.copy(this.origin).sub(uu);let r=e.distanceTo(t)*.5,a=-this.direction.dot(mo),o=ki.dot(this.direction),c=-ki.dot(mo),l=ki.lengthSq(),u=Math.abs(1-a*a),h,f,d,p;if(u>0)if(h=a*c-o,f=a*o-c,p=r*u,h>=0)if(f>=-p)if(f<=p){let x=1/u;h*=x,f*=x,d=h*(h+a*f+2*o)+f*(a*h+f+2*c)+l}else f=r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;else f<=-p?(h=Math.max(0,-(-a*r+o)),f=h>0?-r:Math.min(Math.max(-r,-c),r),d=-h*h+f*(f+2*c)+l):f<=p?(h=0,f=Math.min(Math.max(-r,-c),r),d=f*(f+2*c)+l):(h=Math.max(0,-(a*r+o)),f=h>0?r:Math.min(Math.max(-r,-c),r),d=-h*h+f*(f+2*c)+l);else f=a>0?-r:r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(uu).addScaledVector(mo,f),d}intersectSphere(e,t){gi.subVectors(e.center,this.origin);let i=gi.dot(this.direction),s=gi.dot(gi)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(i=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(i=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),u>=0?(r=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),i>c||o>s)||((o>i||i!==i)&&(i=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,gi)!==null}intersectTriangle(e,t,i,s,r){hu.subVectors(t,e),go.subVectors(i,e),du.crossVectors(hu,go);let a=this.direction.dot(du),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;ki.subVectors(this.origin,e);let c=o*this.direction.dot(go.crossVectors(ki,go));if(c<0)return null;let l=o*this.direction.dot(hu.cross(ki));if(l<0||c+l>a)return null;let u=-o*ki.dot(du);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},wn=class extends Gi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=Bu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Yd=new It,hs=new _s,xo=new tr,$d=new D,vo=new D,_o=new D,yo=new D,fu=new D,bo=new D,jd=new D,Mo=new D,gt=class extends zt{constructor(e=new nn,t=new wn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){bo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],h=r[c];u!==0&&(fu.fromBufferAttribute(h,e),a?bo.addScaledVector(fu,u):bo.addScaledVector(fu.sub(t),u))}t.add(bo)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),xo.copy(i.boundingSphere),xo.applyMatrix4(r),hs.copy(e.ray).recast(e.near),!(xo.containsPoint(hs.origin)===!1&&(hs.intersectSphere(xo,$d)===null||hs.origin.distanceToSquared($d)>(e.far-e.near)**2))&&(Yd.copy(r).invert(),hs.copy(e.ray).applyMatrix4(Yd),!(i.boundingBox!==null&&hs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,hs)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,x=f.length;p<x;p++){let m=f[p],g=a[m.materialIndex],w=Math.max(m.start,d.start),E=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=w,T=E;y<T;y+=3){let b=o.getX(y),C=o.getX(y+1),v=o.getX(y+2);s=So(this,g,e,i,l,u,h,b,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(o.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let w=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);s=So(this,a,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let p=0,x=f.length;p<x;p++){let m=f[p],g=a[m.materialIndex],w=Math.max(m.start,d.start),E=Math.min(c.count,Math.min(m.start+m.count,d.start+d.count));for(let y=w,T=E;y<T;y+=3){let b=y,C=y+1,v=y+2;s=So(this,g,e,i,l,u,h,b,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(c.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let w=m,E=m+1,y=m+2;s=So(this,a,e,i,l,u,h,w,E,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function fx(n,e,t,i,s,r,a,o){let c;if(e.side===pn?c=i.intersectTriangle(a,r,s,!0,o):c=i.intersectTriangle(s,r,a,e.side===Bn,o),c===null)return null;Mo.copy(o),Mo.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Mo);return l<t.near||l>t.far?null:{distance:l,point:Mo.clone(),object:n}}function So(n,e,t,i,s,r,a,o,c,l){n.getVertexPosition(o,vo),n.getVertexPosition(c,_o),n.getVertexPosition(l,yo);let u=fx(n,e,t,i,vo,_o,yo,jd);if(u){let h=new D;Hi.getBarycoord(jd,vo,_o,yo,h),s&&(u.uv=Hi.getInterpolatedAttribute(s,o,c,l,h,new ce)),r&&(u.uv1=Hi.getInterpolatedAttribute(r,o,c,l,h,new ce)),a&&(u.normal=Hi.getInterpolatedAttribute(a,o,c,l,h,new D),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a:o,b:c,c:l,normal:new D,materialIndex:0};Hi.getNormal(vo,_o,yo,f.normal),u.face=f,u.barycoord=h}return u}var nr=class extends gn{constructor(e=null,t=1,i=1,s,r,a,o,c,l=Jt,u=Jt,h,f){super(null,a,o,c,l,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var pu=new D,px=new D,mx=new Je,Un=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=pu.subVectors(i,t).cross(px.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(pu),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||mx.getNormalMatrix(e),s=this.coplanarPoint(pu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ds=new tr,gx=new ce(.5,.5),Eo=new D,ir=class{constructor(e=new Un,t=new Un,i=new Un,s=new Un,r=new Un,a=new Un){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Wn,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],h=r[5],f=r[6],d=r[7],p=r[8],x=r[9],m=r[10],g=r[11],w=r[12],E=r[13],y=r[14],T=r[15];if(s[0].setComponents(l-a,d-u,g-p,T-w).normalize(),s[1].setComponents(l+a,d+u,g+p,T+w).normalize(),s[2].setComponents(l+o,d+h,g+x,T+E).normalize(),s[3].setComponents(l-o,d-h,g-x,T-E).normalize(),i)s[4].setComponents(c,f,m,y).normalize(),s[5].setComponents(l-c,d-f,g-m,T-y).normalize();else if(s[4].setComponents(l-c,d-f,g-m,T-y).normalize(),t===Wn)s[5].setComponents(l+c,d+f,g+m,T+y).normalize();else if(t===Zs)s[5].setComponents(c,f,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ds.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ds.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ds)}intersectsSprite(e){ds.center.set(0,0,0);let t=gx.distanceTo(e.center);return ds.radius=.7071067811865476+t,ds.applyMatrix4(e.matrixWorld),this.intersectsSphere(ds)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Eo.x=s.normal.x>0?e.max.x:e.min.x,Eo.y=s.normal.y>0?e.max.y:e.min.y,Eo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Eo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var na=class extends gn{constructor(e=[],t=ji,i,s,r,a,o,c,l,u){super(e,t,i,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var _i=class extends gn{constructor(e,t,i=Yn,s,r,a,o=Jt,c=Jt,l,u=ii,h=1){if(u!==ii&&u!==Zi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:h};super(f,s,r,a,o,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Js(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Xo=class extends _i{constructor(e,t=Yn,i=ji,s,r,a=Jt,o=Jt,c,l=ii){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,i,s,r,a,o,c,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ia=class extends gn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Wt=class n extends nn{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],h=[],f=0,d=0;p("z","y","x",-1,-1,i,t,e,a,r,0),p("z","y","x",1,-1,i,t,-e,a,r,1),p("x","z","y",1,1,e,i,t,s,a,2),p("x","z","y",1,-1,e,i,-t,s,a,3),p("x","y","z",1,-1,e,t,i,s,r,4),p("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new Mt(l,3)),this.setAttribute("normal",new Mt(u,3)),this.setAttribute("uv",new Mt(h,2));function p(x,m,g,w,E,y,T,b,C,v,S){let P=y/C,I=T/v,O=y/2,U=T/2,Y=b/2,R=C+1,V=v+1,z=0,k=0,$=new D;for(let ie=0;ie<V;ie++){let re=ie*I-U;for(let ee=0;ee<R;ee++){let Te=ee*P-O;$[x]=Te*w,$[m]=re*E,$[g]=Y,l.push($.x,$.y,$.z),$[x]=0,$[m]=0,$[g]=b>0?1:-1,u.push($.x,$.y,$.z),h.push(ee/C),h.push(1-ie/v),z+=1}}for(let ie=0;ie<v;ie++)for(let re=0;re<C;re++){let ee=f+re+R*ie,Te=f+re+R*(ie+1),et=f+(re+1)+R*(ie+1),Qe=f+(re+1)+R*ie;c.push(ee,Te,Qe),c.push(Te,et,Qe),k+=6}o.addGroup(d,k,S),d+=k,f+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var yi=class n extends nn{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],p=0,x=[],m=i/2,g=0;w(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new Mt(h,3)),this.setAttribute("normal",new Mt(f,3)),this.setAttribute("uv",new Mt(d,2));function w(){let y=new D,T=new D,b=0,C=(t-e)/i;for(let v=0;v<=r;v++){let S=[],P=v/r,I=P*(t-e)+e;for(let O=0;O<=s;O++){let U=O/s,Y=U*c+o,R=Math.sin(Y),V=Math.cos(Y);T.x=I*R,T.y=-P*i+m,T.z=I*V,h.push(T.x,T.y,T.z),y.set(R,C,V).normalize(),f.push(y.x,y.y,y.z),d.push(U,1-P),S.push(p++)}x.push(S)}for(let v=0;v<s;v++)for(let S=0;S<r;S++){let P=x[S][v],I=x[S+1][v],O=x[S+1][v+1],U=x[S][v+1];(e>0||S!==0)&&(u.push(P,I,U),b+=3),(t>0||S!==r-1)&&(u.push(I,O,U),b+=3)}l.addGroup(g,b,0),g+=b}function E(y){let T=p,b=new ce,C=new D,v=0,S=y===!0?e:t,P=y===!0?1:-1;for(let O=1;O<=s;O++)h.push(0,m*P,0),f.push(0,P,0),d.push(.5,.5),p++;let I=p;for(let O=0;O<=s;O++){let Y=O/s*c+o,R=Math.cos(Y),V=Math.sin(Y);C.x=S*V,C.y=m*P,C.z=S*R,h.push(C.x,C.y,C.z),f.push(0,P,0),b.x=R*.5+.5,b.y=V*.5*P+.5,d.push(b.x,b.y),p++}for(let O=0;O<s;O++){let U=T+O,Y=I+O;y===!0?u.push(Y,Y+1,U):u.push(Y+1,Y,U),v+=3}l.addGroup(g,v,y===!0?1:2),g+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Tn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ve("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=i[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===a)return s/(r-1);let u=i[s],f=i[s+1]-u,d=(a-u)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new ce:new D);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new D,s=[],r=[],a=[],o=new D,c=new It;for(let d=0;d<=e;d++){let p=d/e;s[d]=this.getTangentAt(p,new D)}r[0]=new D,a[0]=new D;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=l&&(l=u,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),f<=l&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(nt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(o,p))}a[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(nt(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(d=-d);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],d*p)),a[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},sr=class extends Tn{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new ce){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=c-this.aX,d=l-this.aY;c=f*u-d*h+this.aX,l=f*h+d*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},qo=class extends sr{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function nh(){let n=0,e=0,t=0,i=0;function s(r,a,o,c){n=r,e=o,t=-3*r+3*a-2*o-c,i=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,u,h){let f=(a-r)/l-(o-r)/(l+u)+(o-a)/u,d=(o-a)/u-(c-a)/(u+h)+(c-o)/h;f*=u,d*=u,s(a,o,f,d)},calc:function(r){let a=r*r,o=a*r;return n+e*r+t*a+i*o}}}var Zd=new D,Kd=new D,mu=new nh,gu=new nh,xu=new nh,Yo=class extends Tn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new D){let i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,u;this.closed||o>0?l=s[(o-1)%r]:(Kd.subVectors(s[0],s[1]).add(s[0]),l=Kd);let h=s[o%r],f=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Zd.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Zd),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,p=Math.pow(l.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),mu.initNonuniformCatmullRom(l.x,h.x,f.x,u.x,p,x,m),gu.initNonuniformCatmullRom(l.y,h.y,f.y,u.y,p,x,m),xu.initNonuniformCatmullRom(l.z,h.z,f.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(mu.initCatmullRom(l.x,h.x,f.x,u.x,this.tension),gu.initCatmullRom(l.y,h.y,f.y,u.y,this.tension),xu.initCatmullRom(l.z,h.z,f.z,u.z,this.tension));return i.set(mu.calc(c),gu.calc(c),xu.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Jd(n,e,t,i,s){let r=(i-e)*.5,a=(s-t)*.5,o=n*n,c=n*o;return(2*t-2*i+r+a)*c+(-3*t+3*i-2*r-a)*o+r*n+t}function xx(n,e){let t=1-n;return t*t*e}function vx(n,e){return 2*(1-n)*n*e}function _x(n,e){return n*n*e}function qr(n,e,t,i){return xx(n,e)+vx(n,t)+_x(n,i)}function yx(n,e){let t=1-n;return t*t*t*e}function bx(n,e){let t=1-n;return 3*t*t*n*e}function Mx(n,e){return 3*(1-n)*n*n*e}function Sx(n,e){return n*n*n*e}function Yr(n,e,t,i,s){return yx(n,e)+bx(n,t)+Mx(n,i)+Sx(n,s)}var sa=class extends Tn{constructor(e=new ce,t=new ce,i=new ce,s=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ce){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Yr(e,s.x,r.x,a.x,o.x),Yr(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},$o=class extends Tn{constructor(e=new D,t=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Yr(e,s.x,r.x,a.x,o.x),Yr(e,s.y,r.y,a.y,o.y),Yr(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ra=class extends Tn{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jo=class extends Tn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},aa=class extends Tn{constructor(e=new ce,t=new ce,i=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ce){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(qr(e,s.x,r.x,a.x),qr(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Zo=class extends Tn{constructor(e=new D,t=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(qr(e,s.x,r.x,a.x),qr(e,s.y,r.y,a.y),qr(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},oa=class extends Tn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){let i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],u=s[a>s.length-2?s.length-1:a+1],h=s[a>s.length-3?s.length-1:a+2];return i.set(Jd(o,c.x,l.x,u.x,h.x),Jd(o,c.y,l.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new ce().fromArray(s))}return this}},wu=Object.freeze({__proto__:null,ArcCurve:qo,CatmullRomCurve3:Yo,CubicBezierCurve:sa,CubicBezierCurve3:$o,EllipseCurve:sr,LineCurve:ra,LineCurve3:jo,QuadraticBezierCurve:aa,QuadraticBezierCurve3:Zo,SplineCurve:oa}),Ko=class extends Tn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new wu[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new wu[s.type]().fromJSON(s))}return this}},ca=class extends Ko{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new ra(this.currentPoint.clone(),new ce(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new aa(this.currentPoint.clone(),new ce(e,t),new ce(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){let o=new sa(this.currentPoint.clone(),new ce(e,t),new ce(i,s),new ce(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new oa(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,s,r,a,o,c),this}absellipse(e,t,i,s,r,a,o,c){let l=new sr(e,t,i,s,r,a,o,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},qn=class extends ca{constructor(e){super(e),this.uuid=ws(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new ca().fromJSON(s))}return this}};function Ex(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=Yf(n,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,c,l;if(i&&(r=Rx(n,e,r,t)),n.length>80*t){o=n[0],c=n[1];let u=o,h=c;for(let f=t;f<s;f+=t){let d=n[f],p=n[f+1];d<o&&(o=d),p<c&&(c=p),d>u&&(u=d),p>h&&(h=p)}l=Math.max(u-o,h-c),l=l!==0?32767/l:0}return la(r,a,t,o,c,l,0),a}function Yf(n,e,t,i,s){let r;if(s===zx(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=Qd(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=Qd(a/i|0,n[a],n[a+1],r);return r&&rr(r,r.next)&&(ha(r),r=r.next),r}function ys(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(rr(t,t.next)||Dt(t.prev,t,t.next)===0)){if(ha(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function la(n,e,t,i,s,r,a){if(!n)return;!a&&r&&Ox(n,i,s,r);let o=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(r?Tx(n,i,s,r):wx(n)){e.push(c.i,n.i,l.i),ha(n),n=l.next,o=l.next;continue}if(n=l,n===o){a?a===1?(n=Ax(ys(n),e),la(n,e,t,i,s,r,2)):a===2&&Cx(n,e,t,i,s,r):la(ys(n),e,t,i,s,r,1);break}}}function wx(n){let e=n.prev,t=n,i=n.next;if(Dt(e,t,i)>=0)return!1;let s=e.x,r=t.x,a=i.x,o=e.y,c=t.y,l=i.y,u=Math.min(s,r,a),h=Math.min(o,c,l),f=Math.max(s,r,a),d=Math.max(o,c,l),p=i.next;for(;p!==e;){if(p.x>=u&&p.x<=f&&p.y>=h&&p.y<=d&&Gr(s,o,r,c,a,l,p.x,p.y)&&Dt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Tx(n,e,t,i){let s=n.prev,r=n,a=n.next;if(Dt(s,r,a)>=0)return!1;let o=s.x,c=r.x,l=a.x,u=s.y,h=r.y,f=a.y,d=Math.min(o,c,l),p=Math.min(u,h,f),x=Math.max(o,c,l),m=Math.max(u,h,f),g=Tu(d,p,e,t,i),w=Tu(x,m,e,t,i),E=n.prevZ,y=n.nextZ;for(;E&&E.z>=g&&y&&y.z<=w;){if(E.x>=d&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==a&&Gr(o,u,c,h,l,f,E.x,E.y)&&Dt(E.prev,E,E.next)>=0||(E=E.prevZ,y.x>=d&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==a&&Gr(o,u,c,h,l,f,y.x,y.y)&&Dt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;E&&E.z>=g;){if(E.x>=d&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==a&&Gr(o,u,c,h,l,f,E.x,E.y)&&Dt(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;y&&y.z<=w;){if(y.x>=d&&y.x<=x&&y.y>=p&&y.y<=m&&y!==s&&y!==a&&Gr(o,u,c,h,l,f,y.x,y.y)&&Dt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Ax(n,e){let t=n;do{let i=t.prev,s=t.next.next;!rr(i,s)&&jf(i,t,t.next,s)&&ua(i,s)&&ua(s,i)&&(e.push(i.i,t.i,s.i),ha(t),ha(t.next),t=n=s),t=t.next}while(t!==n);return ys(t)}function Cx(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Ux(a,o)){let c=Zf(a,o);a=ys(a,a.next),c=ys(c,c.next),la(a,e,t,i,s,r,0),la(c,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function Rx(n,e,t,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,c=r<a-1?e[r+1]*i:n.length,l=Yf(n,o,c,i,!1);l===l.next&&(l.steiner=!0),s.push(Fx(l))}s.sort(Ix);for(let r=0;r<s.length;r++)t=Px(s[r],t);return t}function Ix(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function Px(n,e){let t=Dx(n,e);if(!t)return e;let i=Zf(t,n);return ys(i,i.next),ys(t,t.next)}function Dx(n,e){let t=e,i=n.x,s=n.y,r=-1/0,a;if(rr(n,t))return t;do{if(rr(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,c=a.x,l=a.y,u=1/0;t=a;do{if(i>=t.x&&t.x>=c&&i!==t.x&&$f(s<l?i:r,s,c,l,s<l?r:i,s,t.x,t.y)){let h=Math.abs(s-t.y)/(i-t.x);ua(t,n)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&Lx(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function Lx(n,e){return Dt(n.prev,n,e.prev)<0&&Dt(e.next,n,n.next)<0}function Ox(n,e,t,i){let s=n;do s.z===0&&(s.z=Tu(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Nx(s)}function Nx(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let l=0;l<t&&(o++,a=a.nextZ,!!a);l++);let c=t;for(;o>0||c>0&&a;)o!==0&&(c===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function Tu(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function Fx(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function $f(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function Gr(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&$f(n,e,t,i,s,r,a,o)}function Ux(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Bx(n,e)&&(ua(n,e)&&ua(e,n)&&kx(n,e)&&(Dt(n.prev,n,e.prev)||Dt(n,e.prev,e))||rr(n,e)&&Dt(n.prev,n,n.next)>0&&Dt(e.prev,e,e.next)>0)}function Dt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function rr(n,e){return n.x===e.x&&n.y===e.y}function jf(n,e,t,i){let s=To(Dt(n,e,t)),r=To(Dt(n,e,i)),a=To(Dt(t,i,n)),o=To(Dt(t,i,e));return!!(s!==r&&a!==o||s===0&&wo(n,t,e)||r===0&&wo(n,i,e)||a===0&&wo(t,n,i)||o===0&&wo(t,e,i))}function wo(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function To(n){return n>0?1:n<0?-1:0}function Bx(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&jf(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function ua(n,e){return Dt(n.prev,n,n.next)<0?Dt(n,e,n.next)>=0&&Dt(n,n.prev,e)>=0:Dt(n,e,n.prev)<0||Dt(n,n.next,e)<0}function kx(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Zf(n,e){let t=Au(n.i,n.x,n.y),i=Au(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Qd(n,e,t,i){let s=Au(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function ha(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Au(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function zx(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Cu=class{static triangulate(e,t,i=2){return Ex(e,t,i)}},ni=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];ef(e),tf(i,e);let a=e.length;t.forEach(ef);for(let c=0;c<t.length;c++)s.push(a),a+=t[c].length,tf(i,t[c]);let o=Cu.triangulate(i,s);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}};function ef(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function tf(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var bi=class n extends nn{constructor(e=new qn([new ce(.5,.5),new ce(-.5,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let o=0,c=e.length;o<c;o++){let l=e[o];a(l)}this.setAttribute("position",new Mt(s,3)),this.setAttribute("uv",new Mt(r,2)),this.computeVertexNormals();function a(o){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,w=t.UVGenerator!==void 0?t.UVGenerator:Hx,E,y=!1,T,b,C,v;if(g){E=g.getSpacedPoints(u),y=!0,f=!1;let te=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(u,te),b=new D,C=new D,v=new D}f||(m=0,d=0,p=0,x=0);let S=o.extractPoints(l),P=S.shape,I=S.holes;if(!ni.isClockWise(P)){P=P.reverse();for(let te=0,oe=I.length;te<oe;te++){let ae=I[te];ni.isClockWise(ae)&&(I[te]=ae.reverse())}}function U(te){let ae=10000000000000001e-36,ge=te[0];for(let _e=1;_e<=te.length;_e++){let He=_e%te.length,Ie=te[He],Ye=Ie.x-ge.x,Pe=Ie.y-ge.y,L=Ye*Ye+Pe*Pe,xt=Math.max(Math.abs(Ie.x),Math.abs(Ie.y),Math.abs(ge.x),Math.abs(ge.y)),it=ae*xt*xt;if(L<=it){te.splice(He,1),_e--;continue}ge=Ie}}U(P),I.forEach(U);let Y=I.length,R=P;for(let te=0;te<Y;te++){let oe=I[te];P=P.concat(oe)}function V(te,oe,ae){return oe||We("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(oe,ae)}let z=P.length;function k(te,oe,ae){let ge,_e,He,Ie=te.x-oe.x,Ye=te.y-oe.y,Pe=ae.x-te.x,L=ae.y-te.y,xt=Ie*Ie+Ye*Ye,it=Ie*L-Ye*Pe;if(Math.abs(it)>Number.EPSILON){let A=Math.sqrt(xt),_=Math.sqrt(Pe*Pe+L*L),B=oe.x-Ye/A,W=oe.y+Ie/A,Z=ae.x-L/_,ue=ae.y+Pe/_,he=((Z-B)*L-(ue-W)*Pe)/(Ie*L-Ye*Pe);ge=B+Ie*he-te.x,_e=W+Ye*he-te.y;let j=ge*ge+_e*_e;if(j<=2)return new ce(ge,_e);He=Math.sqrt(j/2)}else{let A=!1;Ie>Number.EPSILON?Pe>Number.EPSILON&&(A=!0):Ie<-Number.EPSILON?Pe<-Number.EPSILON&&(A=!0):Math.sign(Ye)===Math.sign(L)&&(A=!0),A?(ge=-Ye,_e=Ie,He=Math.sqrt(xt)):(ge=Ie,_e=Ye,He=Math.sqrt(xt/2))}return new ce(ge/He,_e/He)}let $=[];for(let te=0,oe=R.length,ae=oe-1,ge=te+1;te<oe;te++,ae++,ge++)ae===oe&&(ae=0),ge===oe&&(ge=0),$[te]=k(R[te],R[ae],R[ge]);let ie=[],re,ee=$.concat();for(let te=0,oe=Y;te<oe;te++){let ae=I[te];re=[];for(let ge=0,_e=ae.length,He=_e-1,Ie=ge+1;ge<_e;ge++,He++,Ie++)He===_e&&(He=0),Ie===_e&&(Ie=0),re[ge]=k(ae[ge],ae[He],ae[Ie]);ie.push(re),ee=ee.concat(re)}let Te;if(m===0)Te=ni.triangulateShape(R,I);else{let te=[],oe=[];for(let ae=0;ae<m;ae++){let ge=ae/m,_e=d*Math.cos(ge*Math.PI/2),He=p*Math.sin(ge*Math.PI/2)+x;for(let Ie=0,Ye=R.length;Ie<Ye;Ie++){let Pe=V(R[Ie],$[Ie],He);Fe(Pe.x,Pe.y,-_e),ge===0&&te.push(Pe)}for(let Ie=0,Ye=Y;Ie<Ye;Ie++){let Pe=I[Ie];re=ie[Ie];let L=[];for(let xt=0,it=Pe.length;xt<it;xt++){let A=V(Pe[xt],re[xt],He);Fe(A.x,A.y,-_e),ge===0&&L.push(A)}ge===0&&oe.push(L)}}Te=ni.triangulateShape(te,oe)}let et=Te.length,Qe=p+x;for(let te=0;te<z;te++){let oe=f?V(P[te],ee[te],Qe):P[te];y?(C.copy(T.normals[0]).multiplyScalar(oe.x),b.copy(T.binormals[0]).multiplyScalar(oe.y),v.copy(E[0]).add(C).add(b),Fe(v.x,v.y,v.z)):Fe(oe.x,oe.y,0)}for(let te=1;te<=u;te++)for(let oe=0;oe<z;oe++){let ae=f?V(P[oe],ee[oe],Qe):P[oe];y?(C.copy(T.normals[te]).multiplyScalar(ae.x),b.copy(T.binormals[te]).multiplyScalar(ae.y),v.copy(E[te]).add(C).add(b),Fe(v.x,v.y,v.z)):Fe(ae.x,ae.y,h/u*te)}for(let te=m-1;te>=0;te--){let oe=te/m,ae=d*Math.cos(oe*Math.PI/2),ge=p*Math.sin(oe*Math.PI/2)+x;for(let _e=0,He=R.length;_e<He;_e++){let Ie=V(R[_e],$[_e],ge);Fe(Ie.x,Ie.y,h+ae)}for(let _e=0,He=I.length;_e<He;_e++){let Ie=I[_e];re=ie[_e];for(let Ye=0,Pe=Ie.length;Ye<Pe;Ye++){let L=V(Ie[Ye],re[Ye],ge);y?Fe(L.x,L.y+E[u-1].y,E[u-1].x+ae):Fe(L.x,L.y,h+ae)}}}K(),le();function K(){let te=s.length/3;if(f){let oe=0,ae=z*oe;for(let ge=0;ge<et;ge++){let _e=Te[ge];Xe(_e[2]+ae,_e[1]+ae,_e[0]+ae)}oe=u+m*2,ae=z*oe;for(let ge=0;ge<et;ge++){let _e=Te[ge];Xe(_e[0]+ae,_e[1]+ae,_e[2]+ae)}}else{for(let oe=0;oe<et;oe++){let ae=Te[oe];Xe(ae[2],ae[1],ae[0])}for(let oe=0;oe<et;oe++){let ae=Te[oe];Xe(ae[0]+z*u,ae[1]+z*u,ae[2]+z*u)}}i.addGroup(te,s.length/3-te,0)}function le(){let te=s.length/3,oe=0;se(R,oe),oe+=R.length;for(let ae=0,ge=I.length;ae<ge;ae++){let _e=I[ae];se(_e,oe),oe+=_e.length}i.addGroup(te,s.length/3-te,1)}function se(te,oe){let ae=te.length;for(;--ae>=0;){let ge=ae,_e=ae-1;_e<0&&(_e=te.length-1);for(let He=0,Ie=u+m*2;He<Ie;He++){let Ye=z*He,Pe=z*(He+1),L=oe+ge+Ye,xt=oe+_e+Ye,it=oe+_e+Pe,A=oe+ge+Pe;we(L,xt,it,A)}}}function Fe(te,oe,ae){c.push(te),c.push(oe),c.push(ae)}function Xe(te,oe,ae){rt(te),rt(oe),rt(ae);let ge=s.length/3,_e=w.generateTopUV(i,s,ge-3,ge-2,ge-1);qe(_e[0]),qe(_e[1]),qe(_e[2])}function we(te,oe,ae,ge){rt(te),rt(oe),rt(ge),rt(oe),rt(ae),rt(ge);let _e=s.length/3,He=w.generateSideWallUV(i,s,_e-6,_e-3,_e-2,_e-1);qe(He[0]),qe(He[1]),qe(He[3]),qe(He[1]),qe(He[2]),qe(He[3])}function rt(te){s.push(c[te*3+0]),s.push(c[te*3+1]),s.push(c[te*3+2])}function qe(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return Vx(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new wu[s.type]().fromJSON(s)),new n(i,e.options)}},Hx={generateTopUV:function(n,e,t,i,s){let r=e[t*3],a=e[t*3+1],o=e[i*3],c=e[i*3+1],l=e[s*3],u=e[s*3+1];return[new ce(r,a),new ce(o,c),new ce(l,u)]},generateSideWallUV:function(n,e,t,i,s,r){let a=e[t*3],o=e[t*3+1],c=e[t*3+2],l=e[i*3],u=e[i*3+1],h=e[i*3+2],f=e[s*3],d=e[s*3+1],p=e[s*3+2],x=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-u)<Math.abs(a-l)?[new ce(a,1-c),new ce(l,1-h),new ce(f,1-p),new ce(x,1-g)]:[new ce(o,1-c),new ce(u,1-h),new ce(d,1-p),new ce(m,1-g)]}};function Vx(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var da=class n extends nn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),c=Math.floor(s),l=o+1,u=c+1,h=e/o,f=t/c,d=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let w=g*f-a;for(let E=0;E<l;E++){let y=E*h-r;p.push(y,-w,0),x.push(0,0,1),m.push(E/o),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let w=0;w<o;w++){let E=w+l*g,y=w+l*(g+1),T=w+1+l*(g+1),b=w+1+l*g;d.push(E,y,b),d.push(y,T,b)}this.setIndex(d),this.setAttribute("position",new Mt(p,3)),this.setAttribute("normal",new Mt(x,3)),this.setAttribute("uv",new Mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},fa=class n extends nn{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],c=[],l=[],u=[],h=e,f=(t-e)/s,d=new D,p=new ce;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let g=r+m/i*a;d.x=h*Math.cos(g),d.y=h*Math.sin(g),c.push(d.x,d.y,d.z),l.push(0,0,1),p.x=(d.x/t+1)/2,p.y=(d.y/t+1)/2,u.push(p.x,p.y)}h+=f}for(let x=0;x<s;x++){let m=x*(i+1);for(let g=0;g<i;g++){let w=g+m,E=w,y=w+i+1,T=w+i+2,b=w+1;o.push(E,y,b),o.push(y,T,b)}}this.setIndex(o),this.setAttribute("position",new Mt(c,3)),this.setAttribute("normal",new Mt(l,3)),this.setAttribute("uv",new Mt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},pa=class n extends nn{constructor(e=new qn([new ce(0,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],s=[],r=[],a=[],o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(o,c,u),o+=c,c=0;this.setIndex(i),this.setAttribute("position",new Mt(s,3)),this.setAttribute("normal",new Mt(r,3)),this.setAttribute("uv",new Mt(a,2));function l(u){let h=s.length/3,f=u.extractPoints(t),d=f.shape,p=f.holes;ni.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,g=p.length;m<g;m++){let w=p[m];ni.isClockWise(w)===!0&&(p[m]=w.reverse())}let x=ni.triangulateShape(d,p);for(let m=0,g=p.length;m<g;m++){let w=p[m];d=d.concat(w)}for(let m=0,g=d.length;m<g;m++){let w=d[m];s.push(w.x,w.y,0),r.push(0,0,1),a.push(w.x,w.y)}for(let m=0,g=x.length;m<g;m++){let w=x[m],E=w[0]+h,y=w[1]+h,T=w[2]+h;i.push(E,y,T),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Gx(t,e)}static fromJSON(e,t){let i=[];for(let s=0,r=e.shapes.length;s<r;s++){let a=t[e.shapes[s]];i.push(a)}return new n(i,e.curveSegments)}};function Gx(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}var Mi=class n extends nn{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,u=[],h=new D,f=new D,d=[],p=[],x=[],m=[];for(let g=0;g<=i;g++){let w=[],E=g/i,y=a+E*o,T=e*Math.cos(y),b=Math.sqrt(e*e-T*T),C=0;g===0&&a===0?C=.5/t:g===i&&c===Math.PI&&(C=-.5/t);for(let v=0;v<=t;v++){let S=v/t,P=s+S*r;h.x=-b*Math.cos(P),h.y=T,h.z=b*Math.sin(P),p.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),m.push(S+C,1-E),w.push(l++)}u.push(w)}for(let g=0;g<i;g++)for(let w=0;w<t;w++){let E=u[g][w+1],y=u[g][w],T=u[g+1][w],b=u[g+1][w+1];(g!==0||a>0)&&d.push(E,y,b),(g!==i-1||c<Math.PI)&&d.push(y,T,b)}this.setIndex(d),this.setAttribute("position",new Mt(p,3)),this.setAttribute("normal",new Mt(x,3)),this.setAttribute("uv",new Mt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ts(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(nf(s))s.isRenderTargetTexture?(Ve("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(nf(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function ln(n){let e={};for(let t=0;t<n.length;t++){let i=Ts(n[t]);for(let s in i)e[s]=i[s]}return e}function nf(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Wx(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ih(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ut.workingColorSpace}var Kf={clone:Ts,merge:ln},Xx=\`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}\`,qx=\`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}\`,An=class extends Gi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xx,this.fragmentShader=qx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ts(e.uniforms),this.uniformsGroups=Wx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ke().setHex(s.value);break;case"v2":this.uniforms[i].value=new ce().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Pt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Je().fromArray(s.value);break;case"m4":this.uniforms[i].value=new It().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Jo=class extends An{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Cn=class extends Gi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Qc,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ma=class extends Cn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Qo=class extends Gi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Of,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ec=class extends Gi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ao(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}var Wi=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break n}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},tc=class extends Wi{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:yu,endingEnd:yu}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case bu:r=e,o=2*t-i;break;case Mu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case bu:a=e,c=2*i-t;break;case Mu:a=1,c=i+s[1]-s[0];break;default:a=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,p=(i-t)/(s-t),x=p*p,m=x*p,g=-f*m+2*f*x-f*p,w=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*p+1,E=(-1-d)*m+(1.5+d)*x+.5*p,y=d*m-d*x;for(let T=0;T!==o;++T)r[T]=g*a[u+T]+w*a[l+T]+E*a[c+T]+y*a[h+T];return r}},nc=class extends Wi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(i-t)/(s-t),h=1-u;for(let f=0;f!==o;++f)r[f]=a[l+f]*h+a[c+f]*u;return r}},ic=class extends Wi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},sc=class extends Wi{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(i-t)/(s-t),x=1-p;for(let m=0;m!==o;++m)r[m]=a[l+m]*x+a[c+m]*p;return r}let f=o*2,d=e-1;for(let p=0;p!==o;++p){let x=a[l+p],m=a[c+p],g=d*f+p*2,w=h[g],E=h[g+1],y=e*f+p*2,T=u[y],b=u[y+1],C=(i-t)/(s-t),v,S,P,I,O;for(let U=0;U<8;U++){v=C*C,S=v*C,P=1-C,I=P*P,O=I*P;let R=O*t+3*I*C*w+3*P*v*T+S*s-i;if(Math.abs(R)<1e-10)break;let V=3*I*(w-t)+6*P*C*(T-w)+3*v*(s-T);if(Math.abs(V)<1e-10)break;C=C-R/V,C=Math.max(0,Math.min(1,C))}r[p]=O*x+3*I*C*E+3*P*v*b+S*m}return r}},Rn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ao(t,this.TimeBufferType),this.values=Ao(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ao(e.times,Array),values:Ao(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new ic(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new nc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new tc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new sc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case $r:t=this.InterpolantFactoryMethodDiscrete;break;case Ho:t=this.InterpolantFactoryMethodLinear;break;case Io:t=this.InterpolantFactoryMethodSmooth;break;case _u:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ve("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return $r;case this.InterpolantFactoryMethodLinear:return Ho;case this.InterpolantFactoryMethodSmooth:return Io;case this.InterpolantFactoryMethodBezier:return _u}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){We("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){We("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Fg(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){We("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Io,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(s)c=!0;else{let h=o*i,f=h-i,d=h+i;for(let p=0;p!==i;++p){let x=t[h+p];if(x!==t[f+p]||x!==t[d+p]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let h=o*i,f=a*i;for(let d=0;d!==i;++d)t[f+d]=t[h+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Rn.prototype.ValueTypeName="";Rn.prototype.TimeBufferType=Float32Array;Rn.prototype.ValueBufferType=Float32Array;Rn.prototype.DefaultInterpolation=Ho;var Xi=class extends Rn{constructor(e,t,i){super(e,t,i)}};Xi.prototype.ValueTypeName="bool";Xi.prototype.ValueBufferType=Array;Xi.prototype.DefaultInterpolation=$r;Xi.prototype.InterpolantFactoryMethodLinear=void 0;Xi.prototype.InterpolantFactoryMethodSmooth=void 0;var rc=class extends Rn{constructor(e,t,i,s){super(e,t,i,s)}};rc.prototype.ValueTypeName="color";var ac=class extends Rn{constructor(e,t,i,s){super(e,t,i,s)}};ac.prototype.ValueTypeName="number";var oc=class extends Wi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(s-t),l=e*o;for(let u=l+o;l!==u;l+=4)Sn.slerpFlat(r,0,a,l-o,a,l,c);return r}},ga=class extends Rn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new oc(this.times,this.values,this.getValueSize(),e)}};ga.prototype.ValueTypeName="quaternion";ga.prototype.InterpolantFactoryMethodSmooth=void 0;var qi=class extends Rn{constructor(e,t,i){super(e,t,i)}};qi.prototype.ValueTypeName="string";qi.prototype.ValueBufferType=Array;qi.prototype.DefaultInterpolation=$r;qi.prototype.InterpolantFactoryMethodLinear=void 0;qi.prototype.InterpolantFactoryMethodSmooth=void 0;var cc=class extends Rn{constructor(e,t,i,s){super(e,t,i,s)}};cc.prototype.ValueTypeName="vector";var lc=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=l.length;h<f;h+=2){let d=l[h],p=l[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Jf=new lc,uc=class{constructor(e){this.manager=e!==void 0?e:Jf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};uc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ar=class extends zt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ke(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},xa=class extends ar{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},vu=new It,sf=new D,rf=new D,hc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.mapType=cn,this.map=null,this.mapPass=null,this.matrix=new It,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ir,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new Pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;sf.setFromMatrixPosition(e.matrixWorld),t.position.copy(sf),rf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rf),t.updateMatrixWorld(),vu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vu,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Zs||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(vu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Co=new D,Ro=new Sn,ei=new D,bs=class extends zt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new It,this.projectionMatrix=new It,this.projectionMatrixInverse=new It,this.coordinateSystem=Wn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Co,Ro,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Co,Ro,ei.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Co,Ro,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Co,Ro,ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},zi=new D,af=new ce,of=new ce,en=class extends bs{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=vs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Wr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return vs*2*Math.atan(Math.tan(Wr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(zi.x,zi.y).multiplyScalar(-e/zi.z),zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(zi.x,zi.y).multiplyScalar(-e/zi.z)}getViewSize(e,t){return this.getViewBounds(e,af,of),t.subVectors(of,af)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Wr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*i/l,s*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ru=class extends hc{constructor(){super(new en(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=vs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},va=class extends ar{constructor(e,t,i=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.target=new zt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Ru}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}};var or=class extends bs{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Iu=class extends hc{constructor(){super(new or(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},cr=class extends ar{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(zt.DEFAULT_UP),this.updateMatrix(),this.target=new zt,this.shadow=new Iu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var qs=-90,Ys=1,dc=class extends zt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new en(qs,Ys,e,t);s.layers=this.layers,this.add(s);let r=new en(qs,Ys,e,t);r.layers=this.layers,this.add(r);let a=new en(qs,Ys,e,t);a.layers=this.layers,this.add(a);let o=new en(qs,Ys,e,t);o.layers=this.layers,this.add(o);let c=new en(qs,Ys,e,t);c.layers=this.layers,this.add(c);let l=new en(qs,Ys,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===Wn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Zs)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},fc=class extends en{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var sh="\\\\[\\\\]\\\\.:\\\\/",Yx=new RegExp("["+sh+"]","g"),rh="[^"+sh+"]",$x="[^"+sh.replace("\\\\.","")+"]",jx=/((?:WC+[\\/:])*)/.source.replace("WC",rh),Zx=/(WCOD+)?/.source.replace("WCOD",$x),Kx=/(?:\\.(WC+)(?:\\[(.+)\\])?)?/.source.replace("WC",rh),Jx=/\\.(WC+)(?:\\[(.+)\\])?/.source.replace("WC",rh),Qx=new RegExp("^"+jx+Zx+Kx+Jx+"$"),ev=["material","materials","bones","map"],Pu=class{constructor(e,t,i){let s=i||Rt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Rt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\\s/g,"_").replace(Yx,"")}static parseTrackName(e){let t=Qx.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);ev.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ve("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){We("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){We("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){We("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){We("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){We("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){We("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;We("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){We("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Rt.Composite=Pu;Rt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Rt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Rt.prototype.GetterByBindingType=[Rt.prototype._getValue_direct,Rt.prototype._getValue_array,Rt.prototype._getValue_arrayElement,Rt.prototype._getValue_toArray];Rt.prototype.SetterByBindingTypeAndVersioning=[[Rt.prototype._setValue_direct,Rt.prototype._setValue_direct_setNeedsUpdate,Rt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_array,Rt.prototype._setValue_array_setNeedsUpdate,Rt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_arrayElement,Rt.prototype._setValue_arrayElement_setNeedsUpdate,Rt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_fromArray,Rt.prototype._setValue_fromArray_setNeedsUpdate,Rt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var iT=new Float32Array(1);var cf=new It,Ms=class{constructor(e,t,i=0,s=1/0){this.ray=new _s(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Qs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):We("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return cf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(cf),this}intersectObject(e,t=!0,i=[]){return Du(e,this,i,t),i.sort(lf),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Du(e[s],this,i,t);return i.sort(lf),i}};function lf(n,e){return n.distance-e.distance}function Du(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)Du(r[a],e,t,!0)}}var lr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=nt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(nt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Lu=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};var _a=class extends Xn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Ve("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function ah(n,e,t,i){let s=tv(i);switch(t){case Zu:return n*e;case Ju:return n*e/s.components*s.byteLength;case yc:return n*e/s.components*s.byteLength;case Ki:return n*e*2/s.components*s.byteLength;case bc:return n*e*2/s.components*s.byteLength;case Ku:return n*e*3/s.components*s.byteLength;case xn:return n*e*4/s.components*s.byteLength;case Mc:return n*e*4/s.components*s.byteLength;case Ma:case Sa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ea:case wa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ec:case Tc:return Math.max(n,16)*Math.max(e,8)/4;case Sc:case wc:return Math.max(n,8)*Math.max(e,8)/2;case Ac:case Cc:case Ic:case Pc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Rc:case Ta:case Dc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Lc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Oc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Nc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Fc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Uc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Bc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case kc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case zc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Hc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Vc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Gc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Wc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Xc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case qc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Yc:case $c:case jc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Zc:case Kc:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Aa:case Jc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(\`Unable to determine texture byte length for \${t} format.\`)}function tv(n){switch(n){case cn:case qu:return{byteLength:1,components:1};case dr:case Yu:case ai:return{byteLength:2,components:1};case vc:case _c:return{byteLength:2,components:4};case Yn:case xc:case $n:return{byteLength:4,components:1};case $u:case ju:return{byteLength:4,components:3}}throw new Error(\`THREE.TextureUtils: Unknown texture type \${n}.\`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Ve("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function bp(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function iv(n){let e=new WeakMap;function t(o,c){let l=o.array,u=o.usage,h=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,u),o.onUploadCallback();let d;if(l instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)d=n.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=n.SHORT;else if(l instanceof Uint32Array)d=n.UNSIGNED_INT;else if(l instanceof Int32Array)d=n.INT;else if(l instanceof Int8Array)d=n.BYTE;else if(l instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,c,l){let u=c.array,h=c.updateRanges;if(n.bindBuffer(l,o),h.length===0)n.bufferSubData(l,0,u);else{h.sort((d,p)=>d.start-p.start);let f=0;for(let d=1;d<h.length;d++){let p=h[f],x=h[d];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++f,h[f]=x)}h.length=f+1;for(let d=0,p=h.length;d<p;d++){let x=h[d];n.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(n.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var sv=\`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif\`,rv=\`#ifdef USE_ALPHAHASH
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
#endif\`,av=\`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif\`,ov=\`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif\`,cv=\`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif\`,lv=\`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif\`,uv=\`#ifdef USE_AOMAP
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
#endif\`,hv=\`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif\`,dv=\`#ifdef USE_BATCHING
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
#endif\`,fv=\`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif\`,pv=\`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif\`,mv=\`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif\`,gv=\`float G_BlinnPhong_Implicit( ) {
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
} // validated\`,xv=\`#ifdef USE_IRIDESCENCE
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
#endif\`,vv=\`#ifdef USE_BUMPMAP
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
#endif\`,_v=\`#if NUM_CLIPPING_PLANES > 0
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
#endif\`,yv=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif\`,bv=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif\`,Mv=\`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif\`,Sv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif\`,Ev=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif\`,wv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif\`,Tv=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif\`,Av=\`#define PI 3.141592653589793
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
} // validated\`,Cv=\`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif\`,Rv=\`vec3 transformedNormal = objectNormal;
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
#endif\`,Iv=\`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif\`,Pv=\`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif\`,Dv=\`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif\`,Lv=\`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif\`,Ov="gl_FragColor = linearToOutputTexel( gl_FragColor );",Nv=\`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}\`,Fv=\`#ifdef USE_ENVMAP
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
#endif\`,Uv=\`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif\`,Bv=\`#ifdef USE_ENVMAP
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
#endif\`,kv=\`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif\`,zv=\`#ifdef USE_ENVMAP
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
#endif\`,Hv=\`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif\`,Vv=\`#ifdef USE_FOG
	varying float vFogDepth;
#endif\`,Gv=\`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif\`,Wv=\`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif\`,Xv=\`#ifdef USE_GRADIENTMAP
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
}\`,qv=\`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif\`,Yv=\`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;\`,$v=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert\`,jv=\`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>\`,Zv=\`#ifdef USE_ENVMAP
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
#endif\`,Kv=\`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;\`,Jv=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon\`,Qv=\`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;\`,e_=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong\`,t_=\`PhysicalMaterial material;
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
#endif\`,n_=\`uniform sampler2D dfgLUT;
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
}\`,i_=\`
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
#endif\`,s_=\`#if defined( RE_IndirectDiffuse )
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
#endif\`,r_=\`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif\`,a_=\`#ifdef USE_LIGHT_PROBES_GRID
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
#endif\`,o_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif\`,c_=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,l_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,u_=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif\`,h_=\`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif\`,d_=\`#ifdef USE_MAP
	uniform sampler2D map;
#endif\`,f_=\`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif\`,p_=\`#if defined( USE_POINTS_UV )
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
#endif\`,m_=\`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif\`,g_=\`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif\`,x_=\`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif\`,v_=\`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif\`,__=\`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,y_=\`#ifdef USE_MORPHTARGETS
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
#endif\`,b_=\`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,M_=\`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;\`,S_=\`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif\`,E_=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,w_=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,T_=\`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif\`,A_=\`#ifdef USE_NORMALMAP
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
#endif\`,C_=\`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif\`,R_=\`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif\`,I_=\`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif\`,P_=\`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif\`,D_=\`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );\`,L_=\`vec3 packNormalToRGB( const in vec3 normal ) {
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
}\`,O_=\`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif\`,N_=\`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;\`,F_=\`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif\`,U_=\`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif\`,B_=\`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif\`,k_=\`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif\`,z_=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,H_=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,V_=\`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif\`,G_=\`float getShadowMask() {
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
}\`,W_=\`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif\`,X_=\`#ifdef USE_SKINNING
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
#endif\`,q_=\`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif\`,Y_=\`#ifdef USE_SKINNING
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
#endif\`,$_=\`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif\`,j_=\`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif\`,Z_=\`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif\`,K_=\`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }\`,J_=\`#ifdef USE_TRANSMISSION
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
#endif\`,Q_=\`#ifdef USE_TRANSMISSION
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
#endif\`,ey=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,ty=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,ny=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,iy=\`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif\`,sy=\`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}\`,ry=\`uniform sampler2D t2D;
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
}\`,ay=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,oy=\`#ifdef ENVMAP_TYPE_CUBE
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
}\`,cy=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,ly=\`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,uy=\`#include <common>
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
}\`,hy=\`#if DEPTH_PACKING == 3200
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
}\`,dy=\`#define DISTANCE
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
}\`,fy=\`#define DISTANCE
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
}\`,py=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}\`,my=\`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,gy=\`uniform float scale;
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
}\`,xy=\`uniform vec3 diffuse;
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
}\`,vy=\`#include <common>
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
}\`,_y=\`uniform vec3 diffuse;
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
}\`,yy=\`#define LAMBERT
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
}\`,by=\`#define LAMBERT
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
}\`,My=\`#define MATCAP
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
}\`,Sy=\`#define MATCAP
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
}\`,Ey=\`#define NORMAL
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
}\`,wy=\`#define NORMAL
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
}\`,Ty=\`#define PHONG
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
}\`,Ay=\`#define PHONG
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
}\`,Cy=\`#define STANDARD
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
}\`,Ry=\`#define STANDARD
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
}\`,Iy=\`#define TOON
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
}\`,Py=\`#define TOON
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
}\`,Dy=\`uniform float size;
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
}\`,Ly=\`uniform vec3 diffuse;
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
}\`,Oy=\`#include <common>
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
}\`,Ny=\`uniform vec3 color;
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
}\`,Fy=\`uniform float rotation;
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
}\`,Uy=\`uniform vec3 diffuse;
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
}\`,st={alphahash_fragment:sv,alphahash_pars_fragment:rv,alphamap_fragment:av,alphamap_pars_fragment:ov,alphatest_fragment:cv,alphatest_pars_fragment:lv,aomap_fragment:uv,aomap_pars_fragment:hv,batching_pars_vertex:dv,batching_vertex:fv,begin_vertex:pv,beginnormal_vertex:mv,bsdfs:gv,iridescence_fragment:xv,bumpmap_pars_fragment:vv,clipping_planes_fragment:_v,clipping_planes_pars_fragment:yv,clipping_planes_pars_vertex:bv,clipping_planes_vertex:Mv,color_fragment:Sv,color_pars_fragment:Ev,color_pars_vertex:wv,color_vertex:Tv,common:Av,cube_uv_reflection_fragment:Cv,defaultnormal_vertex:Rv,displacementmap_pars_vertex:Iv,displacementmap_vertex:Pv,emissivemap_fragment:Dv,emissivemap_pars_fragment:Lv,colorspace_fragment:Ov,colorspace_pars_fragment:Nv,envmap_fragment:Fv,envmap_common_pars_fragment:Uv,envmap_pars_fragment:Bv,envmap_pars_vertex:kv,envmap_physical_pars_fragment:Zv,envmap_vertex:zv,fog_vertex:Hv,fog_pars_vertex:Vv,fog_fragment:Gv,fog_pars_fragment:Wv,gradientmap_pars_fragment:Xv,lightmap_pars_fragment:qv,lights_lambert_fragment:Yv,lights_lambert_pars_fragment:$v,lights_pars_begin:jv,lights_toon_fragment:Kv,lights_toon_pars_fragment:Jv,lights_phong_fragment:Qv,lights_phong_pars_fragment:e_,lights_physical_fragment:t_,lights_physical_pars_fragment:n_,lights_fragment_begin:i_,lights_fragment_maps:s_,lights_fragment_end:r_,lightprobes_pars_fragment:a_,logdepthbuf_fragment:o_,logdepthbuf_pars_fragment:c_,logdepthbuf_pars_vertex:l_,logdepthbuf_vertex:u_,map_fragment:h_,map_pars_fragment:d_,map_particle_fragment:f_,map_particle_pars_fragment:p_,metalnessmap_fragment:m_,metalnessmap_pars_fragment:g_,morphinstance_vertex:x_,morphcolor_vertex:v_,morphnormal_vertex:__,morphtarget_pars_vertex:y_,morphtarget_vertex:b_,normal_fragment_begin:M_,normal_fragment_maps:S_,normal_pars_fragment:E_,normal_pars_vertex:w_,normal_vertex:T_,normalmap_pars_fragment:A_,clearcoat_normal_fragment_begin:C_,clearcoat_normal_fragment_maps:R_,clearcoat_pars_fragment:I_,iridescence_pars_fragment:P_,opaque_fragment:D_,packing:L_,premultiplied_alpha_fragment:O_,project_vertex:N_,dithering_fragment:F_,dithering_pars_fragment:U_,roughnessmap_fragment:B_,roughnessmap_pars_fragment:k_,shadowmap_pars_fragment:z_,shadowmap_pars_vertex:H_,shadowmap_vertex:V_,shadowmask_pars_fragment:G_,skinbase_vertex:W_,skinning_pars_vertex:X_,skinning_vertex:q_,skinnormal_vertex:Y_,specularmap_fragment:$_,specularmap_pars_fragment:j_,tonemapping_fragment:Z_,tonemapping_pars_fragment:K_,transmission_fragment:J_,transmission_pars_fragment:Q_,uv_pars_fragment:ey,uv_pars_vertex:ty,uv_vertex:ny,worldpos_vertex:iy,background_vert:sy,background_frag:ry,backgroundCube_vert:ay,backgroundCube_frag:oy,cube_vert:cy,cube_frag:ly,depth_vert:uy,depth_frag:hy,distance_vert:dy,distance_frag:fy,equirect_vert:py,equirect_frag:my,linedashed_vert:gy,linedashed_frag:xy,meshbasic_vert:vy,meshbasic_frag:_y,meshlambert_vert:yy,meshlambert_frag:by,meshmatcap_vert:My,meshmatcap_frag:Sy,meshnormal_vert:Ey,meshnormal_frag:wy,meshphong_vert:Ty,meshphong_frag:Ay,meshphysical_vert:Cy,meshphysical_frag:Ry,meshtoon_vert:Iy,meshtoon_frag:Py,points_vert:Dy,points_frag:Ly,shadow_vert:Oy,shadow_frag:Ny,sprite_vert:Fy,sprite_frag:Uy},be={common:{diffuse:{value:new Ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Je}},envmap:{envMap:{value:null},envMapRotation:{value:new Je},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Je},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0},uvTransform:{value:new Je}},sprite:{diffuse:{value:new Ke(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}}},ci={basic:{uniforms:ln([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:ln([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ke(0)},envMapIntensity:{value:1}}]),vertexShader:st.meshlambert_vert,fragmentShader:st.meshlambert_frag},phong:{uniforms:ln([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ke(0)},specular:{value:new Ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:st.meshphong_vert,fragmentShader:st.meshphong_frag},standard:{uniforms:ln([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:ln([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Ke(0)}}]),vertexShader:st.meshtoon_vert,fragmentShader:st.meshtoon_frag},matcap:{uniforms:ln([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:st.meshmatcap_vert,fragmentShader:st.meshmatcap_frag},points:{uniforms:ln([be.points,be.fog]),vertexShader:st.points_vert,fragmentShader:st.points_frag},dashed:{uniforms:ln([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:st.linedashed_vert,fragmentShader:st.linedashed_frag},depth:{uniforms:ln([be.common,be.displacementmap]),vertexShader:st.depth_vert,fragmentShader:st.depth_frag},normal:{uniforms:ln([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:st.meshnormal_vert,fragmentShader:st.meshnormal_frag},sprite:{uniforms:ln([be.sprite,be.fog]),vertexShader:st.sprite_vert,fragmentShader:st.sprite_frag},background:{uniforms:{uvTransform:{value:new Je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Je}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distance:{uniforms:ln([be.common,be.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:st.distance_vert,fragmentShader:st.distance_frag},shadow:{uniforms:ln([be.lights,be.fog,{color:{value:new Ke(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};ci.physical={uniforms:ln([ci.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Je},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Je},sheen:{value:0},sheenColor:{value:new Ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Je},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Je},attenuationDistance:{value:0},attenuationColor:{value:new Ke(0)},specularColor:{value:new Ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Je},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Je}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};var nl={r:0,b:0,g:0},By=new It,Mp=new Je;Mp.set(-1,0,0,0,1,0,0,0,1);function ky(n,e,t,i,s,r){let a=new Ke(0),o=s===!0?0:1,c,l,u=null,h=0,f=null;function d(w){let E=w.isScene===!0?w.background:null;if(E&&E.isTexture){let y=w.backgroundBlurriness>0;E=e.get(E,y)}return E}function p(w){let E=!1,y=d(w);y===null?m(a,o):y&&y.isColor&&(m(y,1),E=!0);let T=n.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(w,E){let y=d(E);y&&(y.isCubeTexture||y.mapping===ya)?(l===void 0&&(l=new gt(new Wt(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:Ts(ci.backgroundCube.uniforms),vertexShader:ci.backgroundCube.vertexShader,fragmentShader:ci.backgroundCube.fragmentShader,side:pn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,b,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(By.makeRotationFromEuler(E.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Mp),l.material.toneMapped=ut.getTransfer(y.colorSpace)!==vt,(u!==y||h!==y.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,u=y,h=y.version,f=n.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new gt(new da(2,2),new An({name:"BackgroundMaterial",uniforms:Ts(ci.background.uniforms),vertexShader:ci.background.vertexShader,fragmentShader:ci.background.fragmentShader,side:Bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=ut.getTransfer(y.colorSpace)!==vt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||h!==y.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=y,h=y.version,f=n.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function m(w,E){w.getRGB(nl,ih(n)),t.buffers.color.setClear(nl.r,nl.g,nl.b,E,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(w,E=1){a.set(w),o=E,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(w){o=w,m(a,o)},render:p,addToRenderList:x,dispose:g}}function zy(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,a=!1;function o(I,O,U,Y,R){let V=!1,z=h(I,Y,U,O);r!==z&&(r=z,l(r.object)),V=d(I,Y,U,R),V&&p(I,Y,U,R),R!==null&&e.update(R,n.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,y(I,O,U,Y),R!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(R).buffer))}function c(){return n.createVertexArray()}function l(I){return n.bindVertexArray(I)}function u(I){return n.deleteVertexArray(I)}function h(I,O,U,Y){let R=Y.wireframe===!0,V=i[O.id];V===void 0&&(V={},i[O.id]=V);let z=I.isInstancedMesh===!0?I.id:0,k=V[z];k===void 0&&(k={},V[z]=k);let $=k[U.id];$===void 0&&($={},k[U.id]=$);let ie=$[R];return ie===void 0&&(ie=f(c()),$[R]=ie),ie}function f(I){let O=[],U=[],Y=[];for(let R=0;R<t;R++)O[R]=0,U[R]=0,Y[R]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:U,attributeDivisors:Y,object:I,attributes:{},index:null}}function d(I,O,U,Y){let R=r.attributes,V=O.attributes,z=0,k=U.getAttributes();for(let $ in k)if(k[$].location>=0){let re=R[$],ee=V[$];if(ee===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor)),re===void 0||re.attribute!==ee||ee&&re.data!==ee.data)return!0;z++}return r.attributesNum!==z||r.index!==Y}function p(I,O,U,Y){let R={},V=O.attributes,z=0,k=U.getAttributes();for(let $ in k)if(k[$].location>=0){let re=V[$];re===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(re=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(re=I.instanceColor));let ee={};ee.attribute=re,re&&re.data&&(ee.data=re.data),R[$]=ee,z++}r.attributes=R,r.attributesNum=z,r.index=Y}function x(){let I=r.newAttributes;for(let O=0,U=I.length;O<U;O++)I[O]=0}function m(I){g(I,0)}function g(I,O){let U=r.newAttributes,Y=r.enabledAttributes,R=r.attributeDivisors;U[I]=1,Y[I]===0&&(n.enableVertexAttribArray(I),Y[I]=1),R[I]!==O&&(n.vertexAttribDivisor(I,O),R[I]=O)}function w(){let I=r.newAttributes,O=r.enabledAttributes;for(let U=0,Y=O.length;U<Y;U++)O[U]!==I[U]&&(n.disableVertexAttribArray(U),O[U]=0)}function E(I,O,U,Y,R,V,z){z===!0?n.vertexAttribIPointer(I,O,U,R,V):n.vertexAttribPointer(I,O,U,Y,R,V)}function y(I,O,U,Y){x();let R=Y.attributes,V=U.getAttributes(),z=O.defaultAttributeValues;for(let k in V){let $=V[k];if($.location>=0){let ie=R[k];if(ie===void 0&&(k==="instanceMatrix"&&I.instanceMatrix&&(ie=I.instanceMatrix),k==="instanceColor"&&I.instanceColor&&(ie=I.instanceColor)),ie!==void 0){let re=ie.normalized,ee=ie.itemSize,Te=e.get(ie);if(Te===void 0)continue;let et=Te.buffer,Qe=Te.type,K=Te.bytesPerElement,le=Qe===n.INT||Qe===n.UNSIGNED_INT||ie.gpuType===xc;if(ie.isInterleavedBufferAttribute){let se=ie.data,Fe=se.stride,Xe=ie.offset;if(se.isInstancedInterleavedBuffer){for(let we=0;we<$.locationSize;we++)g($.location+we,se.meshPerAttribute);I.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let we=0;we<$.locationSize;we++)m($.location+we);n.bindBuffer(n.ARRAY_BUFFER,et);for(let we=0;we<$.locationSize;we++)E($.location+we,ee/$.locationSize,Qe,re,Fe*K,(Xe+ee/$.locationSize*we)*K,le)}else{if(ie.isInstancedBufferAttribute){for(let se=0;se<$.locationSize;se++)g($.location+se,ie.meshPerAttribute);I.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let se=0;se<$.locationSize;se++)m($.location+se);n.bindBuffer(n.ARRAY_BUFFER,et);for(let se=0;se<$.locationSize;se++)E($.location+se,ee/$.locationSize,Qe,re,ee*K,ee/$.locationSize*se*K,le)}}else if(z!==void 0){let re=z[k];if(re!==void 0)switch(re.length){case 2:n.vertexAttrib2fv($.location,re);break;case 3:n.vertexAttrib3fv($.location,re);break;case 4:n.vertexAttrib4fv($.location,re);break;default:n.vertexAttrib1fv($.location,re)}}}}w()}function T(){S();for(let I in i){let O=i[I];for(let U in O){let Y=O[U];for(let R in Y){let V=Y[R];for(let z in V)u(V[z].object),delete V[z];delete Y[R]}}delete i[I]}}function b(I){if(i[I.id]===void 0)return;let O=i[I.id];for(let U in O){let Y=O[U];for(let R in Y){let V=Y[R];for(let z in V)u(V[z].object),delete V[z];delete Y[R]}}delete i[I.id]}function C(I){for(let O in i){let U=i[O];for(let Y in U){let R=U[Y];if(R[I.id]===void 0)continue;let V=R[I.id];for(let z in V)u(V[z].object),delete V[z];delete R[I.id]}}}function v(I){for(let O in i){let U=i[O],Y=I.isInstancedMesh===!0?I.id:0,R=U[Y];if(R!==void 0){for(let V in R){let z=R[V];for(let k in z)u(z[k].object),delete z[k];delete R[V]}delete U[Y],Object.keys(U).length===0&&delete i[O]}}}function S(){P(),a=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:S,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:b,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:w}}function Hy(n,e,t){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function a(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function o(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let f=0;for(let d=0;d<u;d++)f+=l[d];t.update(f,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Vy(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==xn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let v=C===ai&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==cn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==$n&&!v)}function c(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(Ve("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Ve("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:y,maxSamples:T,samples:b}}function Gy(n){let e=this,t=null,i=0,s=!1,r=!1,a=new Un,o=new Je,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||i!==0||s;return s=f,i=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let p=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,g=n.get(h);if(!s||p===null||p.length===0||r&&!m)r?u(null):l();else{let w=r?0:i,E=w*4,y=g.clippingState||null;c.value=y,y=u(p,f,E,d);for(let T=0;T!==E;++T)y[T]=t[T];g.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,d,p){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,p!==!0||m===null){let g=d+x*4,w=f.matrixWorldInverse;o.getNormalMatrix(w),(m===null||m.length<g)&&(m=new Float32Array(g));for(let E=0,y=d;E!==x;++E,y+=4)a.copy(h[E]).applyMatrix4(w,o),a.normal.toArray(m,y),m[y+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var Ji=4,Qf=[.125,.215,.35,.446,.526,.582],As=20,Wy=256,Ca=new or,ep=new Ke,oh=null,ch=0,lh=0,uh=!1,Xy=new D,sl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=Xy}=r;oh=this._renderer.getRenderTarget(),ch=this._renderer.getActiveCubeFace(),lh=this._renderer.getActiveMipmapLevel(),uh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ip(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=np(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(oh,ch,lh),this._renderer.xr.enabled=uh,e.scissorTest=!1,pr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ji||e.mapping===Es?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),oh=this._renderer.getRenderTarget(),ch=this._renderer.getActiveCubeFace(),lh=this._renderer.getActiveMipmapLevel(),uh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Gt,minFilter:Gt,generateMipmaps:!1,type:ai,format:xn,colorSpace:jr,depthBuffer:!1},s=tp(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=tp(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=qy(r)),this._blurMaterial=$y(r,e,t),this._ggxMaterial=Yy(r,e,t)}return s}_compileMaterial(e){let t=new gt(new nn,e);this._renderer.compile(t,Ca)}_sceneToCubeUV(e,t,i,s,r){let c=new en(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(ep),h.toneMapping=In,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new Wt,new wn({name:"PMREM.Background",side:pn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,g=!1,w=e.background;w?w.isColor&&(m.color.copy(w),e.background=null,g=!0):(m.color.copy(ep),g=!0);for(let E=0;E<6;E++){let y=E%3;y===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[E],r.y,r.z)):y===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[E]));let T=this._cubeSize;pr(s,y*T,E>2?T:0,T,T),h.setRenderTarget(s),g&&h.render(x,c),h.render(e,c)}h.toneMapping=d,h.autoClear=f,e.background=w}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===ji||e.mapping===Es;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ip()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=np());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;pr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(a,Ca)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let c=a.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-u*u),f=0+l*1.25,d=h*f,{_lodMax:p}=this,x=this._sizeLods[i],m=3*x*(i>p-Ji?i-p+Ji:0),g=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=p-t,pr(r,m,g,3*x,2*x),s.setRenderTarget(r),s.render(o,Ca),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=p-i,pr(e,m,g,3*x,2*x),s.setRenderTarget(e),s.render(o,Ca)}_blur(e,t,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&We("blur direction must be either latitudinal or longitudinal!");let u=3,h=this._lodMeshes[s];h.material=l;let f=l.uniforms,d=this._sizeLods[i]-1,p=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*As-1),x=r/p,m=isFinite(r)?1+Math.floor(u*x):As;m>As&&Ve(\`sigmaRadians, \${r}, is too large and will clip, as it requested \${m} samples when the maximum is set to \${As}\`);let g=[],w=0;for(let C=0;C<As;++C){let v=C/x,S=Math.exp(-v*v/2);g.push(S),C===0?w+=S:C<m&&(w+=2*S)}for(let C=0;C<g.length;C++)g[C]=g[C]/w;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=g,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:E}=this;f.dTheta.value=p,f.mipInt.value=E-i;let y=this._sizeLods[s],T=3*y*(s>E-Ji?s-E+Ji:0),b=4*(this._cubeSize-y);pr(t,T,b,3*y,2*y),c.setRenderTarget(t),c.render(h,Ca)}};function qy(n){let e=[],t=[],i=[],s=n,r=n-Ji+1+Qf.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>n-Ji?c=Qf[a-n+Ji-1]:a===0&&(c=0),t.push(c);let l=1/(o-2),u=-l,h=1+l,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,p=6,x=3,m=2,g=1,w=new Float32Array(x*p*d),E=new Float32Array(m*p*d),y=new Float32Array(g*p*d);for(let b=0;b<d;b++){let C=b%3*2/3-1,v=b>2?0:-1,S=[C,v,0,C+2/3,v,0,C+2/3,v+1,0,C,v,0,C+2/3,v+1,0,C,v+1,0];w.set(S,x*p*b),E.set(f,m*p*b);let P=[b,b,b,b,b,b];y.set(P,g*p*b)}let T=new nn;T.setAttribute("position",new fn(w,x)),T.setAttribute("uv",new fn(E,m)),T.setAttribute("faceIndex",new fn(y,g)),i.push(new gt(T,null)),s>Ji&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function tp(n,e,t){let i=new En(n,e,t);return i.texture.mapping=ya,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function pr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Yy(n,e,t){return new An({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Wy,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ol(),fragmentShader:\`

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
		\`,blending:si,depthTest:!1,depthWrite:!1})}function $y(n,e,t){let i=new Float32Array(As),s=new D(0,1,0);return new An({name:"SphericalGaussianBlur",defines:{n:As,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ol(),fragmentShader:\`

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
		\`,blending:si,depthTest:!1,depthWrite:!1})}function np(){return new An({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ol(),fragmentShader:\`

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
		\`,blending:si,depthTest:!1,depthWrite:!1})}function ip(){return new An({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ol(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		\`,blending:si,depthTest:!1,depthWrite:!1})}function ol(){return\`

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
	\`}var rl=class extends En{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new na(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:\`

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
			\`},s=new Wt(5,5,5),r=new An({name:"CubemapFromEquirect",uniforms:Ts(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:pn,blending:si});r.uniforms.tEquirect.value=t;let a=new gt(s,r),o=t.minFilter;return t.minFilter===ri&&(t.minFilter=Gt),new dc(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function jy(n){let e=new WeakMap,t=new WeakMap,i=null;function s(f,d=!1){return f==null?null:d?a(f):r(f)}function r(f){if(f&&f.isTexture){let d=f.mapping;if(d===pc||d===mc)if(e.has(f)){let p=e.get(f).texture;return o(p,f.mapping)}else{let p=f.image;if(p&&p.height>0){let x=new rl(p.height);return x.fromEquirectangularTexture(n,f),e.set(f,x),f.addEventListener("dispose",l),o(x.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){let d=f.mapping,p=d===pc||d===mc,x=d===ji||d===Es;if(p||x){let m=t.get(f),g=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return i===null&&(i=new sl(n)),m=p?i.fromEquirectangular(f,m):i.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let w=f.image;return p&&w&&w.height>0||x&&w&&c(w)?(i===null&&(i=new sl(n)),m=p?i.fromEquirectangular(f):i.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function o(f,d){return d===pc?f.mapping=ji:d===mc&&(f.mapping=Es),f}function c(f){let d=0,p=6;for(let x=0;x<p;x++)f[x]!==void 0&&d++;return d===p}function l(f){let d=f.target;d.removeEventListener("dispose",l);let p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function u(f){let d=f.target;d.removeEventListener("dispose",u);let p=t.get(d);p!==void 0&&(t.delete(d),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:h}}function Zy(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&ps("WebGLRenderer: "+i+" extension not supported."),s}}}function Ky(n,e,t,i){let s={},r=new WeakMap;function a(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let p in f.attributes)e.remove(f.attributes[p]);f.removeEventListener("dispose",a),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function c(h){let f=h.attributes;for(let d in f)e.update(f[d],n.ARRAY_BUFFER)}function l(h){let f=[],d=h.index,p=h.attributes.position,x=0;if(p===void 0)return;if(d!==null){let w=d.array;x=d.version;for(let E=0,y=w.length;E<y;E+=3){let T=w[E+0],b=w[E+1],C=w[E+2];f.push(T,b,b,C,C,T)}}else{let w=p.array;x=p.version;for(let E=0,y=w.length/3-1;E<y;E+=3){let T=E+0,b=E+1,C=E+2;f.push(T,b,b,C,C,T)}}let m=new(p.count>=65535?ta:ea)(f,1);m.version=x;let g=r.get(h);g&&e.remove(g),r.set(h,m)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&l(h)}else l(h);return r.get(h)}return{get:o,update:c,getWireframeAttribute:u}}function Jy(n,e,t){let i;function s(h){i=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function c(h,f){n.drawElements(i,f,r,h*a),t.update(f,i,1)}function l(h,f,d){d!==0&&(n.drawElementsInstanced(i,f,r,h*a,d),t.update(f,i,d))}function u(h,f,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,h,0,d);let x=0;for(let m=0;m<d;m++)x+=f[m];t.update(x,i,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Qy(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:We("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function eb(n,e,t){let i=new WeakMap,s=new Pt;function r(a,o,c){let l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,f=i.get(o);if(f===void 0||f.count!==h){let S=function(){C.dispose(),i.delete(o),o.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let d=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],E=0;d===!0&&(E=1),p===!0&&(E=2),x===!0&&(E=3);let y=o.attributes.position.count*E,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let b=new Float32Array(y*T*4*h),C=new Jr(b,y,T,h);C.type=$n,C.needsUpdate=!0;let v=E*4;for(let P=0;P<h;P++){let I=m[P],O=g[P],U=w[P],Y=y*T*4*P;for(let R=0;R<I.count;R++){let V=R*v;d===!0&&(s.fromBufferAttribute(I,R),b[Y+V+0]=s.x,b[Y+V+1]=s.y,b[Y+V+2]=s.z,b[Y+V+3]=0),p===!0&&(s.fromBufferAttribute(O,R),b[Y+V+4]=s.x,b[Y+V+5]=s.y,b[Y+V+6]=s.z,b[Y+V+7]=0),x===!0&&(s.fromBufferAttribute(U,R),b[Y+V+8]=s.x,b[Y+V+9]=s.y,b[Y+V+10]=s.z,b[Y+V+11]=U.itemSize===4?s.w:1)}}f={count:h,texture:C,size:new ce(y,T)},i.set(o,f),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let d=0;for(let x=0;x<l.length;x++)d+=l[x];let p=o.morphTargetsRelative?1:1-d;c.getUniforms().setValue(n,"morphTargetBaseInfluence",p),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function tb(n,e,t,i,s){let r=new WeakMap;function a(l){let u=s.render.frame,h=l.geometry,f=e.get(l,h);if(r.get(f)!==u&&(e.update(f),r.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return f}function o(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var nb={[ku]:"LINEAR_TONE_MAPPING",[zu]:"REINHARD_TONE_MAPPING",[Hu]:"CINEON_TONE_MAPPING",[hr]:"ACES_FILMIC_TONE_MAPPING",[Gu]:"AGX_TONE_MAPPING",[Wu]:"NEUTRAL_TONE_MAPPING",[Vu]:"CUSTOM_TONE_MAPPING"};function ib(n,e,t,i,s,r){let a=new En(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new _i(e,t):void 0}),o=new En(e,t,{type:ai,depthBuffer:!1,stencilBuffer:!1}),c=new nn;c.setAttribute("position",new Mt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Mt([0,2,0,0,2,0],2));let l=new Jo({uniforms:{tDiffuse:{value:null}},vertexShader:\`
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
			}\`,depthTest:!1,depthWrite:!1}),u=new gt(c,l),h=new or(-1,1,1,-1,0,1),f=null,d=null,p=!1,x,m=null,g=[],w=!1;this.setSize=function(E,y){a.setSize(E,y),o.setSize(E,y);for(let T=0;T<g.length;T++){let b=g[T];b.setSize&&b.setSize(E,y)}},this.setEffects=function(E){g=E,w=g.length>0&&g[0].isRenderPass===!0;let y=a.width,T=a.height;for(let b=0;b<g.length;b++){let C=g[b];C.setSize&&C.setSize(y,T)}},this.begin=function(E,y){if(p||E.toneMapping===In&&g.length===0)return!1;if(m=y,y!==null){let T=y.width,b=y.height;(a.width!==T||a.height!==b)&&this.setSize(T,b)}return w===!1&&E.setRenderTarget(a),x=E.toneMapping,E.toneMapping=In,!0},this.hasRenderPass=function(){return w},this.end=function(E,y){E.toneMapping=x,p=!0;let T=a,b=o;for(let C=0;C<g.length;C++){let v=g[C];if(v.enabled!==!1&&(v.render(E,b,T,y),v.needsSwap!==!1)){let S=T;T=b,b=S}}if(f!==E.outputColorSpace||d!==E.toneMapping){f=E.outputColorSpace,d=E.toneMapping,l.defines={},ut.getTransfer(f)===vt&&(l.defines.SRGB_TRANSFER="");let C=nb[d];C&&(l.defines[C]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,E.setRenderTarget(m),E.render(u,h),m=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}var Sp=new gn,fh=new _i(1,1),Ep=new Jr,wp=new Wo,Tp=new na,sp=[],rp=[],ap=new Float32Array(16),op=new Float32Array(9),cp=new Float32Array(4);function gr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=sp[s];if(r===void 0&&(r=new Float32Array(s),sp[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function cl(n,e){let t=rp[e];t===void 0&&(t=new Int32Array(e),rp[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function sb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function rb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function ab(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function ob(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function cb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;cp.set(i),n.uniformMatrix2fv(this.addr,!1,cp),qt(t,i)}}function lb(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;op.set(i),n.uniformMatrix3fv(this.addr,!1,op),qt(t,i)}}function ub(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;ap.set(i),n.uniformMatrix4fv(this.addr,!1,ap),qt(t,i)}}function hb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function db(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function fb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function pb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function mb(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function gb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function xb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function vb(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function _b(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(fh.compareFunction=t.isReversedDepthBuffer()?tl:el,r=fh):r=Sp,t.setTexture2D(e||r,s)}function yb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||wp,s)}function bb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Tp,s)}function Mb(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Ep,s)}function Sb(n){switch(n){case 5126:return sb;case 35664:return rb;case 35665:return ab;case 35666:return ob;case 35674:return cb;case 35675:return lb;case 35676:return ub;case 5124:case 35670:return hb;case 35667:case 35671:return db;case 35668:case 35672:return fb;case 35669:case 35673:return pb;case 5125:return mb;case 36294:return gb;case 36295:return xb;case 36296:return vb;case 35678:case 36198:case 36298:case 36306:case 35682:return _b;case 35679:case 36299:case 36307:return yb;case 35680:case 36300:case 36308:case 36293:return bb;case 36289:case 36303:case 36311:case 36292:return Mb}}function Eb(n,e){n.uniform1fv(this.addr,e)}function wb(n,e){let t=gr(e,this.size,2);n.uniform2fv(this.addr,t)}function Tb(n,e){let t=gr(e,this.size,3);n.uniform3fv(this.addr,t)}function Ab(n,e){let t=gr(e,this.size,4);n.uniform4fv(this.addr,t)}function Cb(n,e){let t=gr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Rb(n,e){let t=gr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Ib(n,e){let t=gr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Pb(n,e){n.uniform1iv(this.addr,e)}function Db(n,e){n.uniform2iv(this.addr,e)}function Lb(n,e){n.uniform3iv(this.addr,e)}function Ob(n,e){n.uniform4iv(this.addr,e)}function Nb(n,e){n.uniform1uiv(this.addr,e)}function Fb(n,e){n.uniform2uiv(this.addr,e)}function Ub(n,e){n.uniform3uiv(this.addr,e)}function Bb(n,e){n.uniform4uiv(this.addr,e)}function kb(n,e,t){let i=this.cache,s=e.length,r=cl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=fh:a=Sp;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function zb(n,e,t){let i=this.cache,s=e.length,r=cl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||wp,r[a])}function Hb(n,e,t){let i=this.cache,s=e.length,r=cl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Tp,r[a])}function Vb(n,e,t){let i=this.cache,s=e.length,r=cl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Ep,r[a])}function Gb(n){switch(n){case 5126:return Eb;case 35664:return wb;case 35665:return Tb;case 35666:return Ab;case 35674:return Cb;case 35675:return Rb;case 35676:return Ib;case 5124:case 35670:return Pb;case 35667:case 35671:return Db;case 35668:case 35672:return Lb;case 35669:case 35673:return Ob;case 5125:return Nb;case 36294:return Fb;case 36295:return Ub;case 36296:return Bb;case 35678:case 36198:case 36298:case 36306:case 35682:return kb;case 35679:case 36299:case 36307:return zb;case 35680:case 36300:case 36308:case 36293:return Hb;case 36289:case 36303:case 36311:case 36292:return Vb}}var ph=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Sb(t.type)}},mh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Gb(t.type)}},gh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},hh=/(\\w+)(\\])?(\\[|\\.)?/g;function lp(n,e){n.seq.push(e),n.map[e.id]=e}function Wb(n,e,t){let i=n.name,s=i.length;for(hh.lastIndex=0;;){let r=hh.exec(i),a=hh.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){lp(t,l===void 0?new ph(o,n,e):new mh(o,n,e));break}else{let h=t.map[o];h===void 0&&(h=new gh(o),lp(t,h)),t=h}}}var mr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Wb(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function up(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var Xb=37297,qb=0;function Yb(n,e){let t=n.split(\`
\`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(\`\${o===e?">":" "} \${o}: \${t[a]}\`)}return i.join(\`
\`)}var hp=new Je;function $b(n){ut._getMatrix(hp,ut.workingColorSpace,n);let e=\`mat3( \${hp.elements.map(t=>t.toFixed(4))} )\`;switch(ut.getTransfer(n)){case Zr:return[e,"LinearTransferOETF"];case vt:return[e,"sRGBTransferOETF"];default:return Ve("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function dp(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+\`

\`+r+\`

\`+Yb(n.getShaderSource(e),o)}else return r}function jb(n,e){let t=$b(e);return[\`vec4 \${n}( vec4 value ) {\`,\`	return \${t[1]}( vec4( value.rgb * \${t[0]}, value.a ) );\`,"}"].join(\`
\`)}var Zb={[ku]:"Linear",[zu]:"Reinhard",[Hu]:"Cineon",[hr]:"ACESFilmic",[Gu]:"AgX",[Wu]:"Neutral",[Vu]:"Custom"};function Kb(n,e){let t=Zb[e];return t===void 0?(Ve("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var il=new D;function Jb(){ut.getLuminanceCoefficients(il);let n=il.x.toFixed(4),e=il.y.toFixed(4),t=il.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",\`	const vec3 weights = vec3( \${n}, \${e}, \${t} );\`,"	return dot( weights, rgb );","}"].join(\`
\`)}function Qb(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ia).join(\`
\`)}function eM(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(\`
\`)}function tM(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Ia(n){return n!==""}function fp(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function pp(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var nM=/^[ \\t]*#include +<([\\w\\d./]+)>/gm;function xh(n){return n.replace(nM,sM)}var iM=new Map;function sM(n,e){let t=st[e];if(t===void 0){let i=iM.get(e);if(i!==void 0)t=st[i],Ve('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return xh(t)}var rM=/#pragma unroll_loop_start\\s+for\\s*\\(\\s*int\\s+i\\s*=\\s*(\\d+)\\s*;\\s*i\\s*<\\s*(\\d+)\\s*;\\s*i\\s*\\+\\+\\s*\\)\\s*{([\\s\\S]+?)}\\s+#pragma unroll_loop_end/g;function mp(n){return n.replace(rM,aM)}function aM(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\\[\\s*i\\s*\\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function gp(n){let e=\`precision \${n.precision} float;
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
#define LOW_PRECISION\`),e}var oM={[Ss]:"SHADOWMAP_TYPE_PCF",[ur]:"SHADOWMAP_TYPE_VSM"};function cM(n){return oM[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var lM={[ji]:"ENVMAP_TYPE_CUBE",[Es]:"ENVMAP_TYPE_CUBE",[ya]:"ENVMAP_TYPE_CUBE_UV"};function uM(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":lM[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var hM={[Es]:"ENVMAP_MODE_REFRACTION"};function dM(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":hM[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var fM={[Bu]:"ENVMAP_BLENDING_MULTIPLY",[Pf]:"ENVMAP_BLENDING_MIX",[Df]:"ENVMAP_BLENDING_ADD"};function pM(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":fM[n.combine]||"ENVMAP_BLENDING_NONE"}function mM(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function gM(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=cM(t),l=uM(t),u=dM(t),h=pM(t),f=mM(t),d=Qb(t),p=eM(r),x=s.createProgram(),m,g,w=t.glslVersion?"#version "+t.glslVersion+\`
\`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ia).join(\`
\`),m.length>0&&(m+=\`
\`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Ia).join(\`
\`),g.length>0&&(g+=\`
\`)):(m=[gp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",\`
\`].filter(Ia).join(\`
\`),g=[gp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==In?"#define TONE_MAPPING":"",t.toneMapping!==In?st.tonemapping_pars_fragment:"",t.toneMapping!==In?Kb("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,jb("linearToOutputTexel",t.outputColorSpace),Jb(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",\`
\`].filter(Ia).join(\`
\`)),a=xh(a),a=fp(a,t),a=pp(a,t),o=xh(o),o=fp(o,t),o=pp(o,t),a=mp(a),o=mp(o),t.isRawShaderMaterial!==!0&&(w=\`#version 300 es
\`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(\`
\`)+\`
\`+m,g=["#define varying in",t.glslVersion===Qu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Qu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(\`
\`)+\`
\`+g);let E=w+m+a,y=w+g+o,T=up(s,s.VERTEX_SHADER,E),b=up(s,s.FRAGMENT_SHADER,y);s.attachShader(x,T),s.attachShader(x,b),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(I){if(n.debug.checkShaderErrors){let O=s.getProgramInfoLog(x)||"",U=s.getShaderInfoLog(T)||"",Y=s.getShaderInfoLog(b)||"",R=O.trim(),V=U.trim(),z=Y.trim(),k=!0,$=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(k=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,T,b);else{let ie=dp(s,T,"vertex"),re=dp(s,b,"fragment");We("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+\`

Material Name: \`+I.name+\`
Material Type: \`+I.type+\`

Program Info Log: \`+R+\`
\`+ie+\`
\`+re)}else R!==""?Ve("WebGLProgram: Program Info Log:",R):(V===""||z==="")&&($=!1);$&&(I.diagnostics={runnable:k,programLog:R,vertexShader:{log:V,prefix:m},fragmentShader:{log:z,prefix:g}})}s.deleteShader(T),s.deleteShader(b),v=new mr(s,x),S=tM(s,x)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(x,Xb)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=qb++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=b,this}var xM=0,vh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new _h(e),t.set(e,i)),i}},_h=class{constructor(e){this.id=xM++,this.code=e,this.usedTimes=0}};function vM(n){return n===Ki||n===Ta||n===Aa}function _M(n,e,t,i,s,r){let a=new Qs,o=new vh,c=new Set,l=[],u=new Map,h=i.logarithmicDepthBuffer,f=i.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return c.add(v),v===0?"uv":\`uv\${v}\`}function x(v,S,P,I,O,U){let Y=I.fog,R=O.geometry,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,z=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,k=e.get(v.envMap||V,z),$=k&&k.mapping===ya?k.image.height:null,ie=d[v.type];v.precision!==null&&(f=i.getMaxPrecision(v.precision),f!==v.precision&&Ve("WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));let re=R.morphAttributes.position||R.morphAttributes.normal||R.morphAttributes.color,ee=re!==void 0?re.length:0,Te=0;R.morphAttributes.position!==void 0&&(Te=1),R.morphAttributes.normal!==void 0&&(Te=2),R.morphAttributes.color!==void 0&&(Te=3);let et,Qe,K,le;if(ie){let Re=ci[ie];et=Re.vertexShader,Qe=Re.fragmentShader}else{et=v.vertexShader,Qe=v.fragmentShader;let Re=o.getVertexShaderStage(v),pt=o.getFragmentShaderStage(v);o.update(v,Re,pt),K=Re.id,le=pt.id}let se=n.getRenderTarget(),Fe=n.state.buffers.depth.getReversed(),Xe=O.isInstancedMesh===!0,we=O.isBatchedMesh===!0,rt=!!v.map,qe=!!v.matcap,te=!!k,oe=!!v.aoMap,ae=!!v.lightMap,ge=!!v.bumpMap&&v.wireframe===!1,_e=!!v.normalMap,He=!!v.displacementMap,Ie=!!v.emissiveMap,Ye=!!v.metalnessMap,Pe=!!v.roughnessMap,L=v.anisotropy>0,xt=v.clearcoat>0,it=v.dispersion>0,A=v.iridescence>0,_=v.sheen>0,B=v.transmission>0,W=L&&!!v.anisotropyMap,Z=xt&&!!v.clearcoatMap,ue=xt&&!!v.clearcoatNormalMap,he=xt&&!!v.clearcoatRoughnessMap,j=A&&!!v.iridescenceMap,J=A&&!!v.iridescenceThicknessMap,fe=_&&!!v.sheenColorMap,De=_&&!!v.sheenRoughnessMap,ve=!!v.specularMap,xe=!!v.specularColorMap,Ue=!!v.specularIntensityMap,Ge=B&&!!v.transmissionMap,je=B&&!!v.thicknessMap,N=!!v.gradientMap,pe=!!v.alphaMap,Q=v.alphaTest>0,me=!!v.alphaHash,Me=!!v.extensions,ne=In;v.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(ne=n.toneMapping);let Le={shaderID:ie,shaderType:v.type,shaderName:v.name,vertexShader:et,fragmentShader:Qe,defines:v.defines,customVertexShaderID:K,customFragmentShaderID:le,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:we,batchingColor:we&&O._colorsTexture!==null,instancing:Xe,instancingColor:Xe&&O.instanceColor!==null,instancingMorph:Xe&&O.morphTexture!==null,outputColorSpace:se===null?n.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:ut.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:rt,matcap:qe,envMap:te,envMapMode:te&&k.mapping,envMapCubeUVHeight:$,aoMap:oe,lightMap:ae,bumpMap:ge,normalMap:_e,displacementMap:He,emissiveMap:Ie,normalMapObjectSpace:_e&&v.normalMapType===Nf,normalMapTangentSpace:_e&&v.normalMapType===Qc,packedNormalMap:_e&&v.normalMapType===Qc&&vM(v.normalMap.format),metalnessMap:Ye,roughnessMap:Pe,anisotropy:L,anisotropyMap:W,clearcoat:xt,clearcoatMap:Z,clearcoatNormalMap:ue,clearcoatRoughnessMap:he,dispersion:it,iridescence:A,iridescenceMap:j,iridescenceThicknessMap:J,sheen:_,sheenColorMap:fe,sheenRoughnessMap:De,specularMap:ve,specularColorMap:xe,specularIntensityMap:Ue,transmission:B,transmissionMap:Ge,thicknessMap:je,gradientMap:N,opaque:v.transparent===!1&&v.blending===ms&&v.alphaToCoverage===!1,alphaMap:pe,alphaTest:Q,alphaHash:me,combine:v.combine,mapUv:rt&&p(v.map.channel),aoMapUv:oe&&p(v.aoMap.channel),lightMapUv:ae&&p(v.lightMap.channel),bumpMapUv:ge&&p(v.bumpMap.channel),normalMapUv:_e&&p(v.normalMap.channel),displacementMapUv:He&&p(v.displacementMap.channel),emissiveMapUv:Ie&&p(v.emissiveMap.channel),metalnessMapUv:Ye&&p(v.metalnessMap.channel),roughnessMapUv:Pe&&p(v.roughnessMap.channel),anisotropyMapUv:W&&p(v.anisotropyMap.channel),clearcoatMapUv:Z&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:ue&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:J&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:De&&p(v.sheenRoughnessMap.channel),specularMapUv:ve&&p(v.specularMap.channel),specularColorMapUv:xe&&p(v.specularColorMap.channel),specularIntensityMapUv:Ue&&p(v.specularIntensityMap.channel),transmissionMapUv:Ge&&p(v.transmissionMap.channel),thicknessMapUv:je&&p(v.thicknessMap.channel),alphaMapUv:pe&&p(v.alphaMap.channel),vertexTangents:!!R.attributes.tangent&&(_e||L),vertexNormals:!!R.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!R.attributes.color&&R.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!R.attributes.uv&&(rt||pe),fog:!!Y,useFog:v.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||R.attributes.normal===void 0&&_e===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Fe,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:R.attributes.position!==void 0,morphTargets:R.morphAttributes.position!==void 0,morphNormals:R.morphAttributes.normal!==void 0,morphColors:R.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:Te,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:U.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:ne,decodeVideoTexture:rt&&v.map.isVideoTexture===!0&&ut.getTransfer(v.map.colorSpace)===vt,decodeVideoTextureEmissive:Ie&&v.emissiveMap.isVideoTexture===!0&&ut.getTransfer(v.emissiveMap.colorSpace)===vt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===sn,flipSided:v.side===pn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Me&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Me&&v.extensions.multiDraw===!0||we)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function m(v){let S=[];if(v.shaderID?S.push(v.shaderID):(S.push(v.customVertexShaderID),S.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)S.push(P),S.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(g(S,v),w(S,v),S.push(n.outputColorSpace)),S.push(v.customProgramCacheKey),S.join()}function g(v,S){v.push(S.precision),v.push(S.outputColorSpace),v.push(S.envMapMode),v.push(S.envMapCubeUVHeight),v.push(S.mapUv),v.push(S.alphaMapUv),v.push(S.lightMapUv),v.push(S.aoMapUv),v.push(S.bumpMapUv),v.push(S.normalMapUv),v.push(S.displacementMapUv),v.push(S.emissiveMapUv),v.push(S.metalnessMapUv),v.push(S.roughnessMapUv),v.push(S.anisotropyMapUv),v.push(S.clearcoatMapUv),v.push(S.clearcoatNormalMapUv),v.push(S.clearcoatRoughnessMapUv),v.push(S.iridescenceMapUv),v.push(S.iridescenceThicknessMapUv),v.push(S.sheenColorMapUv),v.push(S.sheenRoughnessMapUv),v.push(S.specularMapUv),v.push(S.specularColorMapUv),v.push(S.specularIntensityMapUv),v.push(S.transmissionMapUv),v.push(S.thicknessMapUv),v.push(S.combine),v.push(S.fogExp2),v.push(S.sizeAttenuation),v.push(S.morphTargetsCount),v.push(S.morphAttributeCount),v.push(S.numDirLights),v.push(S.numPointLights),v.push(S.numSpotLights),v.push(S.numSpotLightMaps),v.push(S.numHemiLights),v.push(S.numRectAreaLights),v.push(S.numDirLightShadows),v.push(S.numPointLightShadows),v.push(S.numSpotLightShadows),v.push(S.numSpotLightShadowsWithMaps),v.push(S.numLightProbes),v.push(S.shadowMapType),v.push(S.toneMapping),v.push(S.numClippingPlanes),v.push(S.numClipIntersection),v.push(S.depthPacking)}function w(v,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function E(v){let S=d[v.type],P;if(S){let I=ci[S];P=Kf.clone(I.uniforms)}else P=v.uniforms;return P}function y(v,S){let P=u.get(S);return P!==void 0?++P.usedTimes:(P=new gM(n,S,v,s),l.push(P),u.set(S,P)),P}function T(v){if(--v.usedTimes===0){let S=l.indexOf(v);l[S]=l[l.length-1],l.pop(),u.delete(v.cacheKey),v.destroy()}}function b(v){o.remove(v)}function C(){o.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:E,acquireProgram:y,releaseProgram:T,releaseShaderCache:b,programs:l,dispose:C}}function yM(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,c){n.get(a)[o]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function bM(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function xp(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function vp(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(f){let d=0;return f.isInstancedMesh&&(d+=2),f.isSkinnedMesh&&(d+=1),d}function o(f,d,p,x,m,g){let w=n[e];return w===void 0?(w={id:f.id,object:f,geometry:d,material:p,materialVariant:a(f),groupOrder:x,renderOrder:f.renderOrder,z:m,group:g},n[e]=w):(w.id=f.id,w.object=f,w.geometry=d,w.material=p,w.materialVariant=a(f),w.groupOrder=x,w.renderOrder=f.renderOrder,w.z=m,w.group=g),e++,w}function c(f,d,p,x,m,g){let w=o(f,d,p,x,m,g);p.transmission>0?i.push(w):p.transparent===!0?s.push(w):t.push(w)}function l(f,d,p,x,m,g){let w=o(f,d,p,x,m,g);p.transmission>0?i.unshift(w):p.transparent===!0?s.unshift(w):t.unshift(w)}function u(f,d,p){t.length>1&&t.sort(f||bM),i.length>1&&i.sort(d||xp),s.length>1&&s.sort(d||xp),p&&(t.reverse(),i.reverse(),s.reverse())}function h(){for(let f=e,d=n.length;f<d;f++){let p=n[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:h,sort:u}}function MM(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new vp,n.set(i,[a])):s>=r.length?(a=new vp,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function SM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Ke};break;case"SpotLight":t={position:new D,direction:new D,color:new Ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Ke,groundColor:new Ke};break;case"RectAreaLight":t={color:new Ke,position:new D,halfWidth:new D,halfHeight:new D};break}return n[e.id]=t,t}}}function EM(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var wM=0;function TM(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function AM(n){let e=new SM,t=EM(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);let s=new D,r=new It,a=new It;function o(l){let u=0,h=0,f=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let d=0,p=0,x=0,m=0,g=0,w=0,E=0,y=0,T=0,b=0,C=0;l.sort(TM);for(let S=0,P=l.length;S<P;S++){let I=l[S],O=I.color,U=I.intensity,Y=I.distance,R=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Ki?R=I.shadow.map.texture:R=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=O.r*U,h+=O.g*U,f+=O.b*U;else if(I.isLightProbe){for(let V=0;V<9;V++)i.probe[V].addScaledVector(I.sh.coefficients[V],U);C++}else if(I.isDirectionalLight){let V=e.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let z=I.shadow,k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,i.directionalShadow[d]=k,i.directionalShadowMap[d]=R,i.directionalShadowMatrix[d]=I.shadow.matrix,w++}i.directional[d]=V,d++}else if(I.isSpotLight){let V=e.get(I);V.position.setFromMatrixPosition(I.matrixWorld),V.color.copy(O).multiplyScalar(U),V.distance=Y,V.coneCos=Math.cos(I.angle),V.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),V.decay=I.decay,i.spot[x]=V;let z=I.shadow;if(I.map&&(i.spotLightMap[T]=I.map,T++,z.updateMatrices(I),I.castShadow&&b++),i.spotLightMatrix[x]=z.matrix,I.castShadow){let k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,i.spotShadow[x]=k,i.spotShadowMap[x]=R,y++}x++}else if(I.isRectAreaLight){let V=e.get(I);V.color.copy(O).multiplyScalar(U),V.halfWidth.set(I.width*.5,0,0),V.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=V,m++}else if(I.isPointLight){let V=e.get(I);if(V.color.copy(I.color).multiplyScalar(I.intensity),V.distance=I.distance,V.decay=I.decay,I.castShadow){let z=I.shadow,k=t.get(I);k.shadowIntensity=z.intensity,k.shadowBias=z.bias,k.shadowNormalBias=z.normalBias,k.shadowRadius=z.radius,k.shadowMapSize=z.mapSize,k.shadowCameraNear=z.camera.near,k.shadowCameraFar=z.camera.far,i.pointShadow[p]=k,i.pointShadowMap[p]=R,i.pointShadowMatrix[p]=I.shadow.matrix,E++}i.point[p]=V,p++}else if(I.isHemisphereLight){let V=e.get(I);V.skyColor.copy(I.color).multiplyScalar(U),V.groundColor.copy(I.groundColor).multiplyScalar(U),i.hemi[g]=V,g++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=be.LTC_FLOAT_1,i.rectAreaLTC2=be.LTC_FLOAT_2):(i.rectAreaLTC1=be.LTC_HALF_1,i.rectAreaLTC2=be.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;let v=i.hash;(v.directionalLength!==d||v.pointLength!==p||v.spotLength!==x||v.rectAreaLength!==m||v.hemiLength!==g||v.numDirectionalShadows!==w||v.numPointShadows!==E||v.numSpotShadows!==y||v.numSpotMaps!==T||v.numLightProbes!==C)&&(i.directional.length=d,i.spot.length=x,i.rectArea.length=m,i.point.length=p,i.hemi.length=g,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=y+T-b,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=C,v.directionalLength=d,v.pointLength=p,v.spotLength=x,v.rectAreaLength=m,v.hemiLength=g,v.numDirectionalShadows=w,v.numPointShadows=E,v.numSpotShadows=y,v.numSpotMaps=T,v.numLightProbes=C,i.version=wM++)}function c(l,u){let h=0,f=0,d=0,p=0,x=0,m=u.matrixWorldInverse;for(let g=0,w=l.length;g<w;g++){let E=l[g];if(E.isDirectionalLight){let y=i.directional[h];y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(E.isSpotLight){let y=i.spot[d];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(E.isRectAreaLight){let y=i.rectArea[p];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(E.width*.5,0,0),y.halfHeight.set(0,E.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),p++}else if(E.isPointLight){let y=i.point[f];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),f++}else if(E.isHemisphereLight){let y=i.hemi[x];y.direction.setFromMatrixPosition(E.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:o,setupView:c,state:i}}function _p(n){let e=new AM(n),t=[],i=[],s=[];function r(f){h.camera=f,t.length=0,i.length=0,s.length=0}function a(f){t.push(f)}function o(f){i.push(f)}function c(f){s.push(f)}function l(){e.setup(t)}function u(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function CM(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new _p(n),e.set(s,[o])):r>=a.length?(o=new _p(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var RM=\`void main() {
	gl_Position = vec4( position, 1.0 );
}\`,IM=\`uniform sampler2D shadow_pass;
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
}\`,PM=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],DM=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],yp=new It,Ra=new D,dh=new D;function LM(n,e,t){let i=new ir,s=new ce,r=new ce,a=new Pt,o=new Qo,c=new ec,l={},u=t.maxTextureSize,h={[Bn]:pn,[pn]:Bn,[sn]:sn},f=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:RM,fragmentShader:IM}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let p=new nn;p.setAttribute("position",new fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new gt(p,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ss;let g=this.type;this.render=function(b,C,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===df&&(Ve("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Ss);let S=n.getRenderTarget(),P=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),O=n.state;O.setBlending(si),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let U=g!==this.type;U&&C.traverse(function(Y){Y.material&&(Array.isArray(Y.material)?Y.material.forEach(R=>R.needsUpdate=!0):Y.material.needsUpdate=!0)});for(let Y=0,R=b.length;Y<R;Y++){let V=b[Y],z=V.shadow;if(z===void 0){Ve("WebGLShadowMap:",V,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let k=z.getFrameExtents();s.multiply(k),r.copy(z.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/k.x),s.x=r.x*k.x,z.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/k.y),s.y=r.y*k.y,z.mapSize.y=r.y));let $=n.state.buffers.depth.getReversed();if(z.camera._reversedDepth=$,z.map===null||U===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===ur){if(V.isPointLight){Ve("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new En(s.x,s.y,{format:Ki,type:ai,minFilter:Gt,magFilter:Gt,generateMipmaps:!1}),z.map.texture.name=V.name+".shadowMap",z.map.depthTexture=new _i(s.x,s.y,$n),z.map.depthTexture.name=V.name+".shadowMapDepth",z.map.depthTexture.format=ii,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Jt,z.map.depthTexture.magFilter=Jt}else V.isPointLight?(z.map=new rl(s.x),z.map.depthTexture=new Xo(s.x,Yn)):(z.map=new En(s.x,s.y),z.map.depthTexture=new _i(s.x,s.y,Yn)),z.map.depthTexture.name=V.name+".shadowMap",z.map.depthTexture.format=ii,this.type===Ss?(z.map.depthTexture.compareFunction=$?tl:el,z.map.depthTexture.minFilter=Gt,z.map.depthTexture.magFilter=Gt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Jt,z.map.depthTexture.magFilter=Jt);z.camera.updateProjectionMatrix()}let ie=z.map.isWebGLCubeRenderTarget?6:1;for(let re=0;re<ie;re++){if(z.map.isWebGLCubeRenderTarget)n.setRenderTarget(z.map,re),n.clear();else{re===0&&(n.setRenderTarget(z.map),n.clear());let ee=z.getViewport(re);a.set(r.x*ee.x,r.y*ee.y,r.x*ee.z,r.y*ee.w),O.viewport(a)}if(V.isPointLight){let ee=z.camera,Te=z.matrix,et=V.distance||ee.far;et!==ee.far&&(ee.far=et,ee.updateProjectionMatrix()),Ra.setFromMatrixPosition(V.matrixWorld),ee.position.copy(Ra),dh.copy(ee.position),dh.add(PM[re]),ee.up.copy(DM[re]),ee.lookAt(dh),ee.updateMatrixWorld(),Te.makeTranslation(-Ra.x,-Ra.y,-Ra.z),yp.multiplyMatrices(ee.projectionMatrix,ee.matrixWorldInverse),z._frustum.setFromProjectionMatrix(yp,ee.coordinateSystem,ee.reversedDepth)}else z.updateMatrices(V);i=z.getFrustum(),y(C,v,z.camera,V,this.type)}z.isPointLightShadow!==!0&&this.type===ur&&w(z,v),z.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(S,P,I)};function w(b,C){let v=e.update(x);f.defines.VSM_SAMPLES!==b.blurSamples&&(f.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new En(s.x,s.y,{format:Ki,type:ai})),f.uniforms.shadow_pass.value=b.map.depthTexture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(C,null,v,f,x,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(C,null,v,d,x,null)}function E(b,C,v,S){let P=null,I=v.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(I!==void 0)P=I;else if(P=v.isPointLight===!0?c:o,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let O=P.uuid,U=C.uuid,Y=l[O];Y===void 0&&(Y={},l[O]=Y);let R=Y[U];R===void 0&&(R=P.clone(),Y[U]=R,C.addEventListener("dispose",T)),P=R}if(P.visible=C.visible,P.wireframe=C.wireframe,S===ur?P.side=C.shadowSide!==null?C.shadowSide:C.side:P.side=C.shadowSide!==null?C.shadowSide:h[C.side],P.alphaMap=C.alphaMap,P.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,P.map=C.map,P.clipShadows=C.clipShadows,P.clippingPlanes=C.clippingPlanes,P.clipIntersection=C.clipIntersection,P.displacementMap=C.displacementMap,P.displacementScale=C.displacementScale,P.displacementBias=C.displacementBias,P.wireframeLinewidth=C.wireframeLinewidth,P.linewidth=C.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let O=n.properties.get(P);O.light=v}return P}function y(b,C,v,S,P){if(b.visible===!1)return;if(b.layers.test(C.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&P===ur)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,b.matrixWorld);let U=e.update(b),Y=b.material;if(Array.isArray(Y)){let R=U.groups;for(let V=0,z=R.length;V<z;V++){let k=R[V],$=Y[k.materialIndex];if($&&$.visible){let ie=E(b,$,S,P);b.onBeforeShadow(n,b,C,v,U,ie,k),n.renderBufferDirect(v,null,U,ie,b,k),b.onAfterShadow(n,b,C,v,U,ie,k)}}}else if(Y.visible){let R=E(b,Y,S,P);b.onBeforeShadow(n,b,C,v,U,R,null),n.renderBufferDirect(v,null,U,R,b,null),b.onAfterShadow(n,b,C,v,U,R,null)}}let O=b.children;for(let U=0,Y=O.length;U<Y;U++)y(O[U],C,v,S,P)}function T(b){b.target.removeEventListener("dispose",T);for(let v in l){let S=l[v],P=b.target.uuid;P in S&&(S[P].dispose(),delete S[P])}}}function OM(n,e){function t(){let N=!1,pe=new Pt,Q=null,me=new Pt(0,0,0,0);return{setMask:function(Me){Q!==Me&&!N&&(n.colorMask(Me,Me,Me,Me),Q=Me)},setLocked:function(Me){N=Me},setClear:function(Me,ne,Le,Re,pt){pt===!0&&(Me*=Re,ne*=Re,Le*=Re),pe.set(Me,ne,Le,Re),me.equals(pe)===!1&&(n.clearColor(Me,ne,Le,Re),me.copy(pe))},reset:function(){N=!1,Q=null,me.set(-1,0,0,0)}}}function i(){let N=!1,pe=!1,Q=null,me=null,Me=null;return{setReversed:function(ne){if(pe!==ne){let Le=e.get("EXT_clip_control");ne?Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.ZERO_TO_ONE_EXT):Le.clipControlEXT(Le.LOWER_LEFT_EXT,Le.NEGATIVE_ONE_TO_ONE_EXT),pe=ne;let Re=Me;Me=null,this.setClear(Re)}},getReversed:function(){return pe},setTest:function(ne){ne?se(n.DEPTH_TEST):Fe(n.DEPTH_TEST)},setMask:function(ne){Q!==ne&&!N&&(n.depthMask(ne),Q=ne)},setFunc:function(ne){if(pe&&(ne=Xf[ne]),me!==ne){switch(ne){case Lo:n.depthFunc(n.NEVER);break;case Oo:n.depthFunc(n.ALWAYS);break;case No:n.depthFunc(n.LESS);break;case gs:n.depthFunc(n.LEQUAL);break;case Fo:n.depthFunc(n.EQUAL);break;case Uo:n.depthFunc(n.GEQUAL);break;case Bo:n.depthFunc(n.GREATER);break;case ko:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}me=ne}},setLocked:function(ne){N=ne},setClear:function(ne){Me!==ne&&(Me=ne,pe&&(ne=1-ne),n.clearDepth(ne))},reset:function(){N=!1,Q=null,me=null,Me=null,pe=!1}}}function s(){let N=!1,pe=null,Q=null,me=null,Me=null,ne=null,Le=null,Re=null,pt=null;return{setTest:function(dt){N||(dt?se(n.STENCIL_TEST):Fe(n.STENCIL_TEST))},setMask:function(dt){pe!==dt&&!N&&(n.stencilMask(dt),pe=dt)},setFunc:function(dt,On,mn){(Q!==dt||me!==On||Me!==mn)&&(n.stencilFunc(dt,On,mn),Q=dt,me=On,Me=mn)},setOp:function(dt,On,mn){(ne!==dt||Le!==On||Re!==mn)&&(n.stencilOp(dt,On,mn),ne=dt,Le=On,Re=mn)},setLocked:function(dt){N=dt},setClear:function(dt){pt!==dt&&(n.clearStencil(dt),pt=dt)},reset:function(){N=!1,pe=null,Q=null,me=null,Me=null,ne=null,Le=null,Re=null,pt=null}}}let r=new t,a=new i,o=new s,c=new WeakMap,l=new WeakMap,u={},h={},f={},d=new WeakMap,p=[],x=null,m=!1,g=null,w=null,E=null,y=null,T=null,b=null,C=null,v=new Ke(0,0,0),S=0,P=!1,I=null,O=null,U=null,Y=null,R=null,V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,k=0,$=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(k=parseFloat(/^WebGL (\\d)/.exec($)[1]),z=k>=1):$.indexOf("OpenGL ES")!==-1&&(k=parseFloat(/^OpenGL ES (\\d)/.exec($)[1]),z=k>=2);let ie=null,re={},ee=n.getParameter(n.SCISSOR_BOX),Te=n.getParameter(n.VIEWPORT),et=new Pt().fromArray(ee),Qe=new Pt().fromArray(Te);function K(N,pe,Q,me){let Me=new Uint8Array(4),ne=n.createTexture();n.bindTexture(N,ne),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Le=0;Le<Q;Le++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(pe,0,n.RGBA,1,1,me,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(pe+Le,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return ne}let le={};le[n.TEXTURE_2D]=K(n.TEXTURE_2D,n.TEXTURE_2D,1),le[n.TEXTURE_CUBE_MAP]=K(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[n.TEXTURE_2D_ARRAY]=K(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),le[n.TEXTURE_3D]=K(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(n.DEPTH_TEST),a.setFunc(gs),ge(!1),_e(Ou),se(n.CULL_FACE),oe(si);function se(N){u[N]!==!0&&(n.enable(N),u[N]=!0)}function Fe(N){u[N]!==!1&&(n.disable(N),u[N]=!1)}function Xe(N,pe){return f[N]!==pe?(n.bindFramebuffer(N,pe),f[N]=pe,N===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=pe),N===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=pe),!0):!1}function we(N,pe){let Q=p,me=!1;if(N){Q=d.get(pe),Q===void 0&&(Q=[],d.set(pe,Q));let Me=N.textures;if(Q.length!==Me.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let ne=0,Le=Me.length;ne<Le;ne++)Q[ne]=n.COLOR_ATTACHMENT0+ne;Q.length=Me.length,me=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,me=!0);me&&n.drawBuffers(Q)}function rt(N){return x!==N?(n.useProgram(N),x=N,!0):!1}let qe={[Vi]:n.FUNC_ADD,[pf]:n.FUNC_SUBTRACT,[mf]:n.FUNC_REVERSE_SUBTRACT};qe[gf]=n.MIN,qe[xf]=n.MAX;let te={[vf]:n.ZERO,[_f]:n.ONE,[yf]:n.SRC_COLOR,[Po]:n.SRC_ALPHA,[Tf]:n.SRC_ALPHA_SATURATE,[Ef]:n.DST_COLOR,[Mf]:n.DST_ALPHA,[bf]:n.ONE_MINUS_SRC_COLOR,[Do]:n.ONE_MINUS_SRC_ALPHA,[wf]:n.ONE_MINUS_DST_COLOR,[Sf]:n.ONE_MINUS_DST_ALPHA,[Af]:n.CONSTANT_COLOR,[Cf]:n.ONE_MINUS_CONSTANT_COLOR,[Rf]:n.CONSTANT_ALPHA,[If]:n.ONE_MINUS_CONSTANT_ALPHA};function oe(N,pe,Q,me,Me,ne,Le,Re,pt,dt){if(N===si){m===!0&&(Fe(n.BLEND),m=!1);return}if(m===!1&&(se(n.BLEND),m=!0),N!==ff){if(N!==g||dt!==P){if((w!==Vi||T!==Vi)&&(n.blendEquation(n.FUNC_ADD),w=Vi,T=Vi),dt)switch(N){case ms:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Nu:n.blendFunc(n.ONE,n.ONE);break;case Fu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Uu:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:We("WebGLState: Invalid blending: ",N);break}else switch(N){case ms:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Nu:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Fu:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Uu:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",N);break}E=null,y=null,b=null,C=null,v.set(0,0,0),S=0,g=N,P=dt}return}Me=Me||pe,ne=ne||Q,Le=Le||me,(pe!==w||Me!==T)&&(n.blendEquationSeparate(qe[pe],qe[Me]),w=pe,T=Me),(Q!==E||me!==y||ne!==b||Le!==C)&&(n.blendFuncSeparate(te[Q],te[me],te[ne],te[Le]),E=Q,y=me,b=ne,C=Le),(Re.equals(v)===!1||pt!==S)&&(n.blendColor(Re.r,Re.g,Re.b,pt),v.copy(Re),S=pt),g=N,P=!1}function ae(N,pe){N.side===sn?Fe(n.CULL_FACE):se(n.CULL_FACE);let Q=N.side===pn;pe&&(Q=!Q),ge(Q),N.blending===ms&&N.transparent===!1?oe(si):oe(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);let me=N.stencilWrite;o.setTest(me),me&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Ie(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?se(n.SAMPLE_ALPHA_TO_COVERAGE):Fe(n.SAMPLE_ALPHA_TO_COVERAGE)}function ge(N){I!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),I=N)}function _e(N){N!==uf?(se(n.CULL_FACE),N!==O&&(N===Ou?n.cullFace(n.BACK):N===hf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Fe(n.CULL_FACE),O=N}function He(N){N!==U&&(z&&n.lineWidth(N),U=N)}function Ie(N,pe,Q){N?(se(n.POLYGON_OFFSET_FILL),(Y!==pe||R!==Q)&&(Y=pe,R=Q,a.getReversed()&&(pe=-pe),n.polygonOffset(pe,Q))):Fe(n.POLYGON_OFFSET_FILL)}function Ye(N){N?se(n.SCISSOR_TEST):Fe(n.SCISSOR_TEST)}function Pe(N){N===void 0&&(N=n.TEXTURE0+V-1),ie!==N&&(n.activeTexture(N),ie=N)}function L(N,pe,Q){Q===void 0&&(ie===null?Q=n.TEXTURE0+V-1:Q=ie);let me=re[Q];me===void 0&&(me={type:void 0,texture:void 0},re[Q]=me),(me.type!==N||me.texture!==pe)&&(ie!==Q&&(n.activeTexture(Q),ie=Q),n.bindTexture(N,pe||le[N]),me.type=N,me.texture=pe)}function xt(){let N=re[ie];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function it(){try{n.compressedTexImage2D(...arguments)}catch(N){We("WebGLState:",N)}}function A(){try{n.compressedTexImage3D(...arguments)}catch(N){We("WebGLState:",N)}}function _(){try{n.texSubImage2D(...arguments)}catch(N){We("WebGLState:",N)}}function B(){try{n.texSubImage3D(...arguments)}catch(N){We("WebGLState:",N)}}function W(){try{n.compressedTexSubImage2D(...arguments)}catch(N){We("WebGLState:",N)}}function Z(){try{n.compressedTexSubImage3D(...arguments)}catch(N){We("WebGLState:",N)}}function ue(){try{n.texStorage2D(...arguments)}catch(N){We("WebGLState:",N)}}function he(){try{n.texStorage3D(...arguments)}catch(N){We("WebGLState:",N)}}function j(){try{n.texImage2D(...arguments)}catch(N){We("WebGLState:",N)}}function J(){try{n.texImage3D(...arguments)}catch(N){We("WebGLState:",N)}}function fe(N){return h[N]!==void 0?h[N]:n.getParameter(N)}function De(N,pe){h[N]!==pe&&(n.pixelStorei(N,pe),h[N]=pe)}function ve(N){et.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),et.copy(N))}function xe(N){Qe.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),Qe.copy(N))}function Ue(N,pe){let Q=l.get(pe);Q===void 0&&(Q=new WeakMap,l.set(pe,Q));let me=Q.get(N);me===void 0&&(me=n.getUniformBlockIndex(pe,N.name),Q.set(N,me))}function Ge(N,pe){let me=l.get(pe).get(N);c.get(pe)!==me&&(n.uniformBlockBinding(pe,me,N.__bindingPointIndex),c.set(pe,me))}function je(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},h={},ie=null,re={},f={},d=new WeakMap,p=[],x=null,m=!1,g=null,w=null,E=null,y=null,T=null,b=null,C=null,v=new Ke(0,0,0),S=0,P=!1,I=null,O=null,U=null,Y=null,R=null,et.set(0,0,n.canvas.width,n.canvas.height),Qe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:Fe,bindFramebuffer:Xe,drawBuffers:we,useProgram:rt,setBlending:oe,setMaterial:ae,setFlipSided:ge,setCullFace:_e,setLineWidth:He,setPolygonOffset:Ie,setScissorTest:Ye,activeTexture:Pe,bindTexture:L,unbindTexture:xt,compressedTexImage2D:it,compressedTexImage3D:A,texImage2D:j,texImage3D:J,pixelStorei:De,getParameter:fe,updateUBOMapping:Ue,uniformBlockBinding:Ge,texStorage2D:ue,texStorage3D:he,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Z,scissor:ve,viewport:xe,reset:je}}function NM(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ce,u=new WeakMap,h=new Set,f,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(A,_){return p?new OffscreenCanvas(A,_):Kr("canvas")}function m(A,_,B){let W=1,Z=it(A);if((Z.width>B||Z.height>B)&&(W=B/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let ue=Math.floor(W*Z.width),he=Math.floor(W*Z.height);f===void 0&&(f=x(ue,he));let j=_?x(ue,he):f;return j.width=ue,j.height=he,j.getContext("2d").drawImage(A,0,0,ue,he),Ve("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ue+"x"+he+")."),j}else return"data"in A&&Ve("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),A;return A}function g(A){return A.generateMipmaps}function w(A){n.generateMipmap(A)}function E(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(A,_,B,W,Z,ue=!1){if(A!==null){if(n[A]!==void 0)return n[A];Ve("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let he;W&&(he=e.get("EXT_texture_norm16"),he||Ve("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=_;if(_===n.RED&&(B===n.FLOAT&&(j=n.R32F),B===n.HALF_FLOAT&&(j=n.R16F),B===n.UNSIGNED_BYTE&&(j=n.R8),B===n.UNSIGNED_SHORT&&he&&(j=he.R16_EXT),B===n.SHORT&&he&&(j=he.R16_SNORM_EXT)),_===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.R8UI),B===n.UNSIGNED_SHORT&&(j=n.R16UI),B===n.UNSIGNED_INT&&(j=n.R32UI),B===n.BYTE&&(j=n.R8I),B===n.SHORT&&(j=n.R16I),B===n.INT&&(j=n.R32I)),_===n.RG&&(B===n.FLOAT&&(j=n.RG32F),B===n.HALF_FLOAT&&(j=n.RG16F),B===n.UNSIGNED_BYTE&&(j=n.RG8),B===n.UNSIGNED_SHORT&&he&&(j=he.RG16_EXT),B===n.SHORT&&he&&(j=he.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RG8UI),B===n.UNSIGNED_SHORT&&(j=n.RG16UI),B===n.UNSIGNED_INT&&(j=n.RG32UI),B===n.BYTE&&(j=n.RG8I),B===n.SHORT&&(j=n.RG16I),B===n.INT&&(j=n.RG32I)),_===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGB8UI),B===n.UNSIGNED_SHORT&&(j=n.RGB16UI),B===n.UNSIGNED_INT&&(j=n.RGB32UI),B===n.BYTE&&(j=n.RGB8I),B===n.SHORT&&(j=n.RGB16I),B===n.INT&&(j=n.RGB32I)),_===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(j=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(j=n.RGBA16UI),B===n.UNSIGNED_INT&&(j=n.RGBA32UI),B===n.BYTE&&(j=n.RGBA8I),B===n.SHORT&&(j=n.RGBA16I),B===n.INT&&(j=n.RGBA32I)),_===n.RGB&&(B===n.UNSIGNED_SHORT&&he&&(j=he.RGB16_EXT),B===n.SHORT&&he&&(j=he.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(j=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(j=n.R11F_G11F_B10F)),_===n.RGBA){let J=ue?Zr:ut.getTransfer(Z);B===n.FLOAT&&(j=n.RGBA32F),B===n.HALF_FLOAT&&(j=n.RGBA16F),B===n.UNSIGNED_BYTE&&(j=J===vt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&he&&(j=he.RGBA16_EXT),B===n.SHORT&&he&&(j=he.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(j=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(j=n.RGB5_A1)}return(j===n.R16F||j===n.R32F||j===n.RG16F||j===n.RG32F||j===n.RGBA16F||j===n.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function T(A,_){let B;return A?_===null||_===Yn||_===fr?B=n.DEPTH24_STENCIL8:_===$n?B=n.DEPTH32F_STENCIL8:_===dr&&(B=n.DEPTH24_STENCIL8,Ve("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Yn||_===fr?B=n.DEPTH_COMPONENT24:_===$n?B=n.DEPTH_COMPONENT32F:_===dr&&(B=n.DEPTH_COMPONENT16),B}function b(A,_){return g(A)===!0||A.isFramebufferTexture&&A.minFilter!==Jt&&A.minFilter!==Gt?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function C(A){let _=A.target;_.removeEventListener("dispose",C),S(_),_.isVideoTexture&&u.delete(_),_.isHTMLTexture&&h.delete(_)}function v(A){let _=A.target;_.removeEventListener("dispose",v),I(_)}function S(A){let _=i.get(A);if(_.__webglInit===void 0)return;let B=A.source,W=d.get(B);if(W){let Z=W[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&P(A),Object.keys(W).length===0&&d.delete(B)}i.remove(A)}function P(A){let _=i.get(A);n.deleteTexture(_.__webglTexture);let B=A.source,W=d.get(B);delete W[_.__cacheKey],a.memory.textures--}function I(A){let _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let Z=0;Z<_.__webglFramebuffer[W].length;Z++)n.deleteFramebuffer(_.__webglFramebuffer[W][Z]);else n.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)n.deleteFramebuffer(_.__webglFramebuffer[W]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=A.textures;for(let W=0,Z=B.length;W<Z;W++){let ue=i.get(B[W]);ue.__webglTexture&&(n.deleteTexture(ue.__webglTexture),a.memory.textures--),i.remove(B[W])}i.remove(A)}let O=0;function U(){O=0}function Y(){return O}function R(A){O=A}function V(){let A=O;return A>=s.maxTextures&&Ve("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),O+=1,A}function z(A){let _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function k(A,_){let B=i.get(A);if(A.isVideoTexture&&L(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){let W=A.image;if(W===null)Ve("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ve("WebGLRenderer: Texture marked for update but image is incomplete");else{Fe(B,A,_);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+_)}function $(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Fe(B,A,_);return}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+_)}function ie(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){Fe(B,A,_);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+_)}function re(A,_){let B=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&B.__version!==A.version){Xe(B,A,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+_)}let ee={[xs]:n.REPEAT,[ti]:n.CLAMP_TO_EDGE,[zo]:n.MIRRORED_REPEAT},Te={[Jt]:n.NEAREST,[Lf]:n.NEAREST_MIPMAP_NEAREST,[ba]:n.NEAREST_MIPMAP_LINEAR,[Gt]:n.LINEAR,[gc]:n.LINEAR_MIPMAP_NEAREST,[ri]:n.LINEAR_MIPMAP_LINEAR},et={[Ff]:n.NEVER,[Hf]:n.ALWAYS,[Uf]:n.LESS,[el]:n.LEQUAL,[Bf]:n.EQUAL,[tl]:n.GEQUAL,[kf]:n.GREATER,[zf]:n.NOTEQUAL};function Qe(A,_){if(_.type===$n&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Gt||_.magFilter===gc||_.magFilter===ba||_.magFilter===ri||_.minFilter===Gt||_.minFilter===gc||_.minFilter===ba||_.minFilter===ri)&&Ve("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,ee[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,ee[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,ee[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,Te[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,Te[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,et[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Jt||_.minFilter!==ba&&_.minFilter!==ri||_.type===$n&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function K(A,_){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",C));let W=_.source,Z=d.get(W);Z===void 0&&(Z={},d.set(W,Z));let ue=z(_);if(ue!==A.__cacheKey){Z[ue]===void 0&&(Z[ue]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),Z[ue].usedTimes++;let he=Z[A.__cacheKey];he!==void 0&&(Z[A.__cacheKey].usedTimes--,he.usedTimes===0&&P(_)),A.__cacheKey=ue,A.__webglTexture=Z[ue].texture}return B}function le(A,_,B){return Math.floor(Math.floor(A/B)/_)}function se(A,_,B,W){let ue=A.updateRanges;if(ue.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,B,W,_.data);else{ue.sort((De,ve)=>De.start-ve.start);let he=0;for(let De=1;De<ue.length;De++){let ve=ue[he],xe=ue[De],Ue=ve.start+ve.count,Ge=le(xe.start,_.width,4),je=le(ve.start,_.width,4);xe.start<=Ue+1&&Ge===je&&le(xe.start+xe.count-1,_.width,4)===Ge?ve.count=Math.max(ve.count,xe.start+xe.count-ve.start):(++he,ue[he]=xe)}ue.length=he+1;let j=t.getParameter(n.UNPACK_ROW_LENGTH),J=t.getParameter(n.UNPACK_SKIP_PIXELS),fe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let De=0,ve=ue.length;De<ve;De++){let xe=ue[De],Ue=Math.floor(xe.start/4),Ge=Math.ceil(xe.count/4),je=Ue%_.width,N=Math.floor(Ue/_.width),pe=Ge,Q=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,je),t.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,je,N,pe,Q,B,W,_.data)}A.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,j),t.pixelStorei(n.UNPACK_SKIP_PIXELS,J),t.pixelStorei(n.UNPACK_SKIP_ROWS,fe)}}function Fe(A,_,B){let W=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=n.TEXTURE_3D);let Z=K(A,_),ue=_.source;t.bindTexture(W,A.__webglTexture,n.TEXTURE0+B);let he=i.get(ue);if(ue.version!==he.__version||Z===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Q=ut.getPrimaries(ut.workingColorSpace),me=_.colorSpace===Si?null:ut.getPrimaries(_.colorSpace),Me=_.colorSpace===Si||Q===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me)}t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let J=m(_.image,!1,s.maxTextureSize);J=xt(_,J);let fe=r.convert(_.format,_.colorSpace),De=r.convert(_.type),ve=y(_.internalFormat,fe,De,_.normalized,_.colorSpace,_.isVideoTexture);Qe(W,_);let xe,Ue=_.mipmaps,Ge=_.isVideoTexture!==!0,je=he.__version===void 0||Z===!0,N=ue.dataReady,pe=b(_,J);if(_.isDepthTexture)ve=T(_.format===Zi,_.type),je&&(Ge?t.texStorage2D(n.TEXTURE_2D,1,ve,J.width,J.height):t.texImage2D(n.TEXTURE_2D,0,ve,J.width,J.height,0,fe,De,null));else if(_.isDataTexture)if(Ue.length>0){Ge&&je&&t.texStorage2D(n.TEXTURE_2D,pe,ve,Ue[0].width,Ue[0].height);for(let Q=0,me=Ue.length;Q<me;Q++)xe=Ue[Q],Ge?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,xe.width,xe.height,fe,De,xe.data):t.texImage2D(n.TEXTURE_2D,Q,ve,xe.width,xe.height,0,fe,De,xe.data);_.generateMipmaps=!1}else Ge?(je&&t.texStorage2D(n.TEXTURE_2D,pe,ve,J.width,J.height),N&&se(_,J,fe,De)):t.texImage2D(n.TEXTURE_2D,0,ve,J.width,J.height,0,fe,De,J.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ge&&je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ve,Ue[0].width,Ue[0].height,J.depth);for(let Q=0,me=Ue.length;Q<me;Q++)if(xe=Ue[Q],_.format!==xn)if(fe!==null)if(Ge){if(N)if(_.layerUpdates.size>0){let Me=ah(xe.width,xe.height,_.format,_.type);for(let ne of _.layerUpdates){let Le=xe.data.subarray(ne*Me/xe.data.BYTES_PER_ELEMENT,(ne+1)*Me/xe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,ne,xe.width,xe.height,1,fe,Le)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,xe.width,xe.height,J.depth,fe,xe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,ve,xe.width,xe.height,J.depth,0,xe.data,0,0);else Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ge?N&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,xe.width,xe.height,J.depth,fe,De,xe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,ve,xe.width,xe.height,J.depth,0,fe,De,xe.data)}else{Ge&&je&&t.texStorage2D(n.TEXTURE_2D,pe,ve,Ue[0].width,Ue[0].height);for(let Q=0,me=Ue.length;Q<me;Q++)xe=Ue[Q],_.format!==xn?fe!==null?Ge?N&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,xe.width,xe.height,fe,xe.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,ve,xe.width,xe.height,0,xe.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ge?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,xe.width,xe.height,fe,De,xe.data):t.texImage2D(n.TEXTURE_2D,Q,ve,xe.width,xe.height,0,fe,De,xe.data)}else if(_.isDataArrayTexture)if(Ge){if(je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,pe,ve,J.width,J.height,J.depth),N)if(_.layerUpdates.size>0){let Q=ah(J.width,J.height,_.format,_.type);for(let me of _.layerUpdates){let Me=J.data.subarray(me*Q/J.data.BYTES_PER_ELEMENT,(me+1)*Q/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,me,J.width,J.height,1,fe,De,Me)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,fe,De,J.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ve,J.width,J.height,J.depth,0,fe,De,J.data);else if(_.isData3DTexture)Ge?(je&&t.texStorage3D(n.TEXTURE_3D,pe,ve,J.width,J.height,J.depth),N&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,fe,De,J.data)):t.texImage3D(n.TEXTURE_3D,0,ve,J.width,J.height,J.depth,0,fe,De,J.data);else if(_.isFramebufferTexture){if(je)if(Ge)t.texStorage2D(n.TEXTURE_2D,pe,ve,J.width,J.height);else{let Q=J.width,me=J.height;for(let Me=0;Me<pe;Me++)t.texImage2D(n.TEXTURE_2D,Me,ve,Q,me,0,fe,De,null),Q>>=1,me>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){let Q=n.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),J.parentNode!==Q){Q.appendChild(J),h.add(_),Q.onpaint=me=>{let Me=me.changedElements;for(let ne of h)Me.includes(ne.image)&&(ne.needsUpdate=!0)},Q.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,J);else{let Me=n.RGBA,ne=n.RGBA,Le=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Me,ne,Le,J)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ue.length>0){if(Ge&&je){let Q=it(Ue[0]);t.texStorage2D(n.TEXTURE_2D,pe,ve,Q.width,Q.height)}for(let Q=0,me=Ue.length;Q<me;Q++)xe=Ue[Q],Ge?N&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,fe,De,xe):t.texImage2D(n.TEXTURE_2D,Q,ve,fe,De,xe);_.generateMipmaps=!1}else if(Ge){if(je){let Q=it(J);t.texStorage2D(n.TEXTURE_2D,pe,ve,Q.width,Q.height)}N&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,fe,De,J)}else t.texImage2D(n.TEXTURE_2D,0,ve,fe,De,J);g(_)&&w(W),he.__version=ue.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function Xe(A,_,B){if(_.image.length!==6)return;let W=K(A,_),Z=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);let ue=i.get(Z);if(Z.version!==ue.__version||W===!0){t.activeTexture(n.TEXTURE0+B);let he=ut.getPrimaries(ut.workingColorSpace),j=_.colorSpace===Si?null:ut.getPrimaries(_.colorSpace),J=_.colorSpace===Si||he===j?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let fe=_.isCompressedTexture||_.image[0].isCompressedTexture,De=_.image[0]&&_.image[0].isDataTexture,ve=[];for(let ne=0;ne<6;ne++)!fe&&!De?ve[ne]=m(_.image[ne],!0,s.maxCubemapSize):ve[ne]=De?_.image[ne].image:_.image[ne],ve[ne]=xt(_,ve[ne]);let xe=ve[0],Ue=r.convert(_.format,_.colorSpace),Ge=r.convert(_.type),je=y(_.internalFormat,Ue,Ge,_.normalized,_.colorSpace),N=_.isVideoTexture!==!0,pe=ue.__version===void 0||W===!0,Q=Z.dataReady,me=b(_,xe);Qe(n.TEXTURE_CUBE_MAP,_);let Me;if(fe){N&&pe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,je,xe.width,xe.height);for(let ne=0;ne<6;ne++){Me=ve[ne].mipmaps;for(let Le=0;Le<Me.length;Le++){let Re=Me[Le];_.format!==xn?Ue!==null?N?Q&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le,0,0,Re.width,Re.height,Ue,Re.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le,je,Re.width,Re.height,0,Re.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le,0,0,Re.width,Re.height,Ue,Ge,Re.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le,je,Re.width,Re.height,0,Ue,Ge,Re.data)}}}else{if(Me=_.mipmaps,N&&pe){Me.length>0&&me++;let ne=it(ve[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,je,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(De){N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,ve[ne].width,ve[ne].height,Ue,Ge,ve[ne].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,je,ve[ne].width,ve[ne].height,0,Ue,Ge,ve[ne].data);for(let Le=0;Le<Me.length;Le++){let pt=Me[Le].image[ne].image;N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le+1,0,0,pt.width,pt.height,Ue,Ge,pt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le+1,je,pt.width,pt.height,0,Ue,Ge,pt.data)}}else{N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ue,Ge,ve[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,je,Ue,Ge,ve[ne]);for(let Le=0;Le<Me.length;Le++){let Re=Me[Le];N?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le+1,0,0,Ue,Ge,Re.image[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Le+1,je,Ue,Ge,Re.image[ne])}}}g(_)&&w(n.TEXTURE_CUBE_MAP),ue.__version=Z.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function we(A,_,B,W,Z,ue){let he=r.convert(B.format,B.colorSpace),j=r.convert(B.type),J=y(B.internalFormat,he,j,B.normalized,B.colorSpace),fe=i.get(_),De=i.get(B);if(De.__renderTarget=_,!fe.__hasExternalTextures){let ve=Math.max(1,_.width>>ue),xe=Math.max(1,_.height>>ue);Z===n.TEXTURE_3D||Z===n.TEXTURE_2D_ARRAY?t.texImage3D(Z,ue,J,ve,xe,_.depth,0,he,j,null):t.texImage2D(Z,ue,J,ve,xe,0,he,j,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),Pe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,W,Z,De.__webglTexture,0,Ye(_)):(Z===n.TEXTURE_2D||Z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,W,Z,De.__webglTexture,ue),t.bindFramebuffer(n.FRAMEBUFFER,null)}function rt(A,_,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){let W=_.depthTexture,Z=W&&W.isDepthTexture?W.type:null,ue=T(_.stencilBuffer,Z),he=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Pe(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ye(_),ue,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ye(_),ue,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ue,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,he,n.RENDERBUFFER,A)}else{let W=_.textures;for(let Z=0;Z<W.length;Z++){let ue=W[Z],he=r.convert(ue.format,ue.colorSpace),j=r.convert(ue.type),J=y(ue.internalFormat,he,j,ue.normalized,ue.colorSpace);Pe(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ye(_),J,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ye(_),J,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,J,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function qe(A,_,B){let W=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=i.get(_.depthTexture);if(Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,_.depthTexture.addEventListener("dispose",C)),Z.__webglTexture===void 0){Z.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),Qe(n.TEXTURE_CUBE_MAP,_.depthTexture);let fe=r.convert(_.depthTexture.format),De=r.convert(_.depthTexture.type),ve;_.depthTexture.format===ii?ve=n.DEPTH_COMPONENT24:_.depthTexture.format===Zi&&(ve=n.DEPTH24_STENCIL8);for(let xe=0;xe<6;xe++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,ve,_.width,_.height,0,fe,De,null)}}else k(_.depthTexture,0);let ue=Z.__webglTexture,he=Ye(_),j=W?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,J=_.depthTexture.format===Zi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===ii)Pe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,j,ue,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,J,j,ue,0);else if(_.depthTexture.format===Zi)Pe(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,j,ue,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,J,j,ue,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(A){let _=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){let W=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){let Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=W}if(A.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)qe(_.__webglFramebuffer[W],A,W);else{let W=A.texture.mipmaps;W&&W.length>0?qe(_.__webglFramebuffer[0],A,0):qe(_.__webglFramebuffer,A,0)}else if(B){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=n.createRenderbuffer(),rt(_.__webglDepthbuffer[W],A,!1);else{let Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ue=_.__webglDepthbuffer[W];n.bindRenderbuffer(n.RENDERBUFFER,ue),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ue)}}else{let W=A.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),rt(_.__webglDepthbuffer,A,!1);else{let Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ue=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ue),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ue)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function oe(A,_,B){let W=i.get(A);_!==void 0&&we(W.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&te(A)}function ae(A){let _=A.texture,B=i.get(A),W=i.get(_);A.addEventListener("dispose",v);let Z=A.textures,ue=A.isWebGLCubeRenderTarget===!0,he=Z.length>1;if(he||(W.__webglTexture===void 0&&(W.__webglTexture=n.createTexture()),W.__version=_.version,a.memory.textures++),ue){B.__webglFramebuffer=[];for(let j=0;j<6;j++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[j]=[];for(let J=0;J<_.mipmaps.length;J++)B.__webglFramebuffer[j][J]=n.createFramebuffer()}else B.__webglFramebuffer[j]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let j=0;j<_.mipmaps.length;j++)B.__webglFramebuffer[j]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(he)for(let j=0,J=Z.length;j<J;j++){let fe=i.get(Z[j]);fe.__webglTexture===void 0&&(fe.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&Pe(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let j=0;j<Z.length;j++){let J=Z[j];B.__webglColorRenderbuffer[j]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[j]);let fe=r.convert(J.format,J.colorSpace),De=r.convert(J.type),ve=y(J.internalFormat,fe,De,J.normalized,J.colorSpace,A.isXRRenderTarget===!0),xe=Ye(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,xe,ve,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+j,n.RENDERBUFFER,B.__webglColorRenderbuffer[j])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),rt(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ue){t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture),Qe(n.TEXTURE_CUBE_MAP,_);for(let j=0;j<6;j++)if(_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)we(B.__webglFramebuffer[j][J],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+j,J);else we(B.__webglFramebuffer[j],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);g(_)&&w(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){for(let j=0,J=Z.length;j<J;j++){let fe=Z[j],De=i.get(fe),ve=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ve=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ve,De.__webglTexture),Qe(ve,fe),we(B.__webglFramebuffer,A,fe,n.COLOR_ATTACHMENT0+j,ve,0),g(fe)&&w(ve)}t.unbindTexture()}else{let j=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(j=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(j,W.__webglTexture),Qe(j,_),_.mipmaps&&_.mipmaps.length>0)for(let J=0;J<_.mipmaps.length;J++)we(B.__webglFramebuffer[J],A,_,n.COLOR_ATTACHMENT0,j,J);else we(B.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,j,0);g(_)&&w(j),t.unbindTexture()}A.depthBuffer&&te(A)}function ge(A){let _=A.textures;for(let B=0,W=_.length;B<W;B++){let Z=_[B];if(g(Z)){let ue=E(A),he=i.get(Z).__webglTexture;t.bindTexture(ue,he),w(ue),t.unbindTexture()}}}let _e=[],He=[];function Ie(A){if(A.samples>0){if(Pe(A)===!1){let _=A.textures,B=A.width,W=A.height,Z=n.COLOR_BUFFER_BIT,ue=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=i.get(A),j=_.length>1;if(j)for(let fe=0;fe<_.length;fe++)t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer);let J=A.texture.mipmaps;J&&J.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let fe=0;fe<_.length;fe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(Z|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(Z|=n.STENCIL_BUFFER_BIT)),j){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,he.__webglColorRenderbuffer[fe]);let De=i.get(_[fe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,De,0)}n.blitFramebuffer(0,0,B,W,0,0,B,W,Z,n.NEAREST),c===!0&&(_e.length=0,He.length=0,_e.push(n.COLOR_ATTACHMENT0+fe),A.depthBuffer&&A.resolveDepthBuffer===!1&&(_e.push(ue),He.push(ue),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,He)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,_e))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),j)for(let fe=0;fe<_.length;fe++){t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,he.__webglColorRenderbuffer[fe]);let De=i.get(_[fe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.TEXTURE_2D,De,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function Ye(A){return Math.min(s.maxSamples,A.samples)}function Pe(A){let _=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function L(A){let _=a.render.frame;u.get(A)!==_&&(u.set(A,_),A.update())}function xt(A,_){let B=A.colorSpace,W=A.format,Z=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==jr&&B!==Si&&(ut.getTransfer(B)===vt?(W!==xn||Z!==cn)&&Ve("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",B)),_}function it(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=V,this.resetTextureUnits=U,this.getTextureUnits=Y,this.setTextureUnits=R,this.setTexture2D=k,this.setTexture2DArray=$,this.setTexture3D=ie,this.setTextureCube=re,this.rebindTextures=oe,this.setupRenderTarget=ae,this.updateRenderTargetMipmap=ge,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=we,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function FM(n,e){function t(i,s=Si){let r,a=ut.getTransfer(s);if(i===cn)return n.UNSIGNED_BYTE;if(i===vc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===_c)return n.UNSIGNED_SHORT_5_5_5_1;if(i===$u)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===ju)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===qu)return n.BYTE;if(i===Yu)return n.SHORT;if(i===dr)return n.UNSIGNED_SHORT;if(i===xc)return n.INT;if(i===Yn)return n.UNSIGNED_INT;if(i===$n)return n.FLOAT;if(i===ai)return n.HALF_FLOAT;if(i===Zu)return n.ALPHA;if(i===Ku)return n.RGB;if(i===xn)return n.RGBA;if(i===ii)return n.DEPTH_COMPONENT;if(i===Zi)return n.DEPTH_STENCIL;if(i===Ju)return n.RED;if(i===yc)return n.RED_INTEGER;if(i===Ki)return n.RG;if(i===bc)return n.RG_INTEGER;if(i===Mc)return n.RGBA_INTEGER;if(i===Ma||i===Sa||i===Ea||i===wa)if(a===vt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Ma)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Sa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Ma)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Sa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ea)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===wa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Sc||i===Ec||i===wc||i===Tc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Sc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ec)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===wc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ac||i===Cc||i===Rc||i===Ic||i===Pc||i===Ta||i===Dc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ac||i===Cc)return a===vt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Rc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Ic)return r.COMPRESSED_R11_EAC;if(i===Pc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ta)return r.COMPRESSED_RG11_EAC;if(i===Dc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Lc||i===Oc||i===Nc||i===Fc||i===Uc||i===Bc||i===kc||i===zc||i===Hc||i===Vc||i===Gc||i===Wc||i===Xc||i===qc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Lc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Oc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Nc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Uc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Bc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===kc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===zc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Hc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Vc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Gc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Wc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Xc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===qc)return a===vt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Yc||i===$c||i===jc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Yc)return a===vt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===$c)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===jc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Zc||i===Kc||i===Aa||i===Jc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Zc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Kc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Aa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Jc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===fr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var UM=\`
void main() {

	gl_Position = vec4( position, 1.0 );

}\`,BM=\`
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

}\`,yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ia(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new An({vertexShader:UM,fragmentShader:BM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new da(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},bh=class extends Xn{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,h=null,f=null,d=null,p=null,x=typeof XRWebGLBinding<"u",m=new yh,g={},w=t.getContextAttributes(),E=null,y=null,T=[],b=[],C=new ce,v=null,S=new en;S.viewport=new Pt;let P=new en;P.viewport=new Pt;let I=[S,P],O=new fc,U=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let le=T[K];return le===void 0&&(le=new er,T[K]=le),le.getTargetRaySpace()},this.getControllerGrip=function(K){let le=T[K];return le===void 0&&(le=new er,T[K]=le),le.getGripSpace()},this.getHand=function(K){let le=T[K];return le===void 0&&(le=new er,T[K]=le),le.getHandSpace()};function R(K){let le=b.indexOf(K.inputSource);if(le===-1)return;let se=T[le];se!==void 0&&(se.update(K.inputSource,K.frame,l||a),se.dispatchEvent({type:K.type,data:K.inputSource}))}function V(){s.removeEventListener("select",R),s.removeEventListener("selectstart",R),s.removeEventListener("selectend",R),s.removeEventListener("squeeze",R),s.removeEventListener("squeezestart",R),s.removeEventListener("squeezeend",R),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",z);for(let K=0;K<T.length;K++){let le=b[K];le!==null&&(b[K]=null,T[K].disconnect(le))}U=null,Y=null,m.reset();for(let K in g)delete g[K];e.setRenderTarget(E),d=null,f=null,h=null,s=null,y=null,Qe.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&Ve("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&Ve("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",R),s.addEventListener("selectstart",R),s.addEventListener("selectend",R),s.addEventListener("squeeze",R),s.addEventListener("squeezestart",R),s.addEventListener("squeezeend",R),s.addEventListener("end",V),s.addEventListener("inputsourceschange",z),w.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,Fe=null,Xe=null;w.depth&&(Xe=w.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=w.stencil?Zi:ii,Fe=w.stencil?fr:Yn);let we={colorFormat:t.RGBA8,depthFormat:Xe,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(we),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),y=new En(f.textureWidth,f.textureHeight,{format:xn,type:cn,depthTexture:new _i(f.textureWidth,f.textureHeight,Fe,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:w.stencil,colorSpace:e.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let se={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,se),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new En(d.framebufferWidth,d.framebufferHeight,{format:xn,type:cn,colorSpace:e.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Qe.setContext(s),Qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function z(K){for(let le=0;le<K.removed.length;le++){let se=K.removed[le],Fe=b.indexOf(se);Fe>=0&&(b[Fe]=null,T[Fe].disconnect(se))}for(let le=0;le<K.added.length;le++){let se=K.added[le],Fe=b.indexOf(se);if(Fe===-1){for(let we=0;we<T.length;we++)if(we>=b.length){b.push(se),Fe=we;break}else if(b[we]===null){b[we]=se,Fe=we;break}if(Fe===-1)break}let Xe=T[Fe];Xe&&Xe.connect(se)}}let k=new D,$=new D;function ie(K,le,se){k.setFromMatrixPosition(le.matrixWorld),$.setFromMatrixPosition(se.matrixWorld);let Fe=k.distanceTo($),Xe=le.projectionMatrix.elements,we=se.projectionMatrix.elements,rt=Xe[14]/(Xe[10]-1),qe=Xe[14]/(Xe[10]+1),te=(Xe[9]+1)/Xe[5],oe=(Xe[9]-1)/Xe[5],ae=(Xe[8]-1)/Xe[0],ge=(we[8]+1)/we[0],_e=rt*ae,He=rt*ge,Ie=Fe/(-ae+ge),Ye=Ie*-ae;if(le.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Ye),K.translateZ(Ie),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Xe[10]===-1)K.projectionMatrix.copy(le.projectionMatrix),K.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{let Pe=rt+Ie,L=qe+Ie,xt=_e-Ye,it=He+(Fe-Ye),A=te*qe/L*Pe,_=oe*qe/L*Pe;K.projectionMatrix.makePerspective(xt,it,A,_,Pe,L),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function re(K,le){le===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(le.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let le=K.near,se=K.far;m.texture!==null&&(m.depthNear>0&&(le=m.depthNear),m.depthFar>0&&(se=m.depthFar)),O.near=P.near=S.near=le,O.far=P.far=S.far=se,(U!==O.near||Y!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),U=O.near,Y=O.far),O.layers.mask=K.layers.mask|6,S.layers.mask=O.layers.mask&-5,P.layers.mask=O.layers.mask&-3;let Fe=K.parent,Xe=O.cameras;re(O,Fe);for(let we=0;we<Xe.length;we++)re(Xe[we],Fe);Xe.length===2?ie(O,S,P):O.projectionMatrix.copy(S.projectionMatrix),ee(K,O,Fe)};function ee(K,le,se){se===null?K.matrix.copy(le.matrixWorld):(K.matrix.copy(se.matrixWorld),K.matrix.invert(),K.matrix.multiply(le.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(le.projectionMatrix),K.projectionMatrixInverse.copy(le.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=vs*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(f===null&&d===null))return c},this.setFoveation=function(K){c=K,f!==null&&(f.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(K){return g[K]};let Te=null;function et(K,le){if(u=le.getViewerPose(l||a),p=le,u!==null){let se=u.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let Fe=!1;se.length!==O.cameras.length&&(O.cameras.length=0,Fe=!0);for(let qe=0;qe<se.length;qe++){let te=se[qe],oe=null;if(d!==null)oe=d.getViewport(te);else{let ge=h.getViewSubImage(f,te);oe=ge.viewport,qe===0&&(e.setRenderTargetTextures(y,ge.colorTexture,ge.depthStencilTexture),e.setRenderTarget(y))}let ae=I[qe];ae===void 0&&(ae=new en,ae.layers.enable(qe),ae.viewport=new Pt,I[qe]=ae),ae.matrix.fromArray(te.transform.matrix),ae.matrix.decompose(ae.position,ae.quaternion,ae.scale),ae.projectionMatrix.fromArray(te.projectionMatrix),ae.projectionMatrixInverse.copy(ae.projectionMatrix).invert(),ae.viewport.set(oe.x,oe.y,oe.width,oe.height),qe===0&&(O.matrix.copy(ae.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Fe===!0&&O.cameras.push(ae)}let Xe=s.enabledFeatures;if(Xe&&Xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let qe=h.getDepthInformation(se[0]);qe&&qe.isValid&&qe.texture&&m.init(qe,s.renderState)}if(Xe&&Xe.includes("camera-access")&&x){e.state.unbindTexture(),h=i.getBinding();for(let qe=0;qe<se.length;qe++){let te=se[qe].camera;if(te){let oe=g[te];oe||(oe=new ia,g[te]=oe);let ae=h.getCameraImage(te);oe.sourceTexture=ae}}}}for(let se=0;se<T.length;se++){let Fe=b[se],Xe=T[se];Fe!==null&&Xe!==void 0&&Xe.update(Fe,le,l||a)}Te&&Te(K,le),le.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:le}),p=null}let Qe=new bp;Qe.setAnimationLoop(et),this.setAnimationLoop=function(K){Te=K},this.dispose=function(){}}},kM=new It,Ap=new Je;Ap.set(-1,0,0,0,1,0,0,0,1);function zM(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,ih(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,w,E,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),h(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),f(m,g),g.isMeshPhysicalMaterial&&d(m,g,y)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?c(m,g,w,E):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===pn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===pn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let w=e.get(g),E=w.envMap,y=w.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(kM.makeRotationFromEuler(y)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Ap),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,w,E){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*w,m.scale.value=E*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function f(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function d(m,g,w){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===pn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let w=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function HM(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,T){let b=T.program;i.uniformBlockBinding(y,b)}function l(y,T){let b=s[y.id];b===void 0&&(m(y),b=u(y),s[y.id]=b,y.addEventListener("dispose",w));let C=T.program;i.updateUBOMapping(y,C);let v=e.render.frame;r[y.id]!==v&&(f(y),r[y.id]=v)}function u(y){let T=h();y.__bindingPointIndex=T;let b=n.createBuffer(),C=y.__size,v=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,C,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,T,b),b}function h(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let T=s[y.id],b=y.uniforms,C=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,T);for(let v=0,S=b.length;v<S;v++){let P=b[v];if(Array.isArray(P))for(let I=0,O=P.length;I<O;I++)d(P[I],v,I,C);else d(P,v,0,C)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,T,b,C){if(x(y,T,b,C)===!0){let v=y.__offset,S=y.value;if(Array.isArray(S)){let P=0;for(let I=0;I<S.length;I++){let O=S[I],U=g(O);p(O,y.__data,P),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(P+=U.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(S,y.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,y.__data)}}function p(y,T,b){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,b)}function x(y,T,b,C){let v=y.value,S=T+"_"+b;if(C[S]===void 0)return typeof v=="number"||typeof v=="boolean"?C[S]=v:ArrayBuffer.isView(v)?C[S]=v.slice():C[S]=v.clone(),!0;{let P=C[S];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return C[S]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function m(y){let T=y.uniforms,b=0,C=16;for(let S=0,P=T.length;S<P;S++){let I=Array.isArray(T[S])?T[S]:[T[S]];for(let O=0,U=I.length;O<U;O++){let Y=I[O],R=Array.isArray(Y.value)?Y.value:[Y.value];for(let V=0,z=R.length;V<z;V++){let k=R[V],$=g(k),ie=b%C,re=ie%$.boundary,ee=ie+re;b+=re,ee!==0&&C-ee<$.storage&&(b+=C-ee),Y.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=b,b+=$.storage}}}let v=b%C;return v>0&&(b+=C-v),y.__size=b,y.__cache={},this}function g(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?Ve("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):Ve("WebGLRenderer: Unsupported uniform value type.",y),T}function w(y){let T=y.target;T.removeEventListener("dispose",w);let b=a.indexOf(T.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function E(){for(let y in s)n.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:c,update:l,dispose:E}}var VM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),oi=null;function GM(){return oi===null&&(oi=new nr(VM,16,16,Ki,ai),oi.name="DFG_LUT",oi.minFilter=Gt,oi.magFilter=Gt,oi.wrapS=ti,oi.wrapT=ti,oi.generateMipmaps=!1,oi.needsUpdate=!0),oi}var al=class{constructor(e={}){let{canvas:t=Vf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1,outputBufferType:d=cn}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let x=d,m=new Set([Mc,bc,yc]),g=new Set([cn,Yn,dr,fr,vc,_c]),w=new Uint32Array(4),E=new Int32Array(4),y=new D,T=null,b=null,C=[],v=[],S=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=In,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,O=null,U=null,Y=null,R=null;this._outputColorSpace=Kt;let V=0,z=0,k=null,$=-1,ie=null,re=new Pt,ee=new Pt,Te=null,et=new Ke(0),Qe=0,K=t.width,le=t.height,se=1,Fe=null,Xe=null,we=new Pt(0,0,K,le),rt=new Pt(0,0,K,le),qe=!1,te=new ir,oe=!1,ae=!1,ge=new It,_e=new D,He=new Pt,Ie={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ye=!1;function Pe(){return k===null?se:1}let L=i;function xt(M,F){return t.getContext(M,F)}try{let M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",\`three.js r\${"185"}\`),t.addEventListener("webglcontextlost",pt,!1),t.addEventListener("webglcontextrestored",dt,!1),t.addEventListener("webglcontextcreationerror",On,!1),L===null){let F="webgl2";if(L=xt(F,M),L===null)throw xt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw We("WebGLRenderer: "+M.message),M}let it,A,_,B,W,Z,ue,he,j,J,fe,De,ve,xe,Ue,Ge,je,N,pe,Q,me,Me,ne;function Le(){it=new Zy(L),it.init(),me=new FM(L,it),A=new Vy(L,it,e,me),_=new OM(L,it),A.reversedDepthBuffer&&f&&_.buffers.depth.setReversed(!0),U=L.createFramebuffer(),Y=L.createFramebuffer(),R=L.createFramebuffer(),B=new Qy(L),W=new yM,Z=new NM(L,it,_,W,A,me,B),ue=new jy(P),he=new iv(L),Me=new zy(L,he),j=new Ky(L,he,B,Me),J=new tb(L,j,he,Me,B),N=new eb(L,A,Z),Ue=new Gy(W),fe=new _M(P,ue,it,A,Me,Ue),De=new zM(P,W),ve=new MM,xe=new CM(it),je=new ky(P,ue,_,J,p,c),Ge=new LM(P,J,A),ne=new HM(L,B,A,_),pe=new Hy(L,it,B),Q=new Jy(L,it,B),B.programs=fe.programs,P.capabilities=A,P.extensions=it,P.properties=W,P.renderLists=ve,P.shadowMap=Ge,P.state=_,P.info=B}Le(),x!==cn&&(S=new ib(x,t.width,t.height,o,s,r));let Re=new bh(P,L);this.xr=Re,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let M=it.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=it.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return se},this.setPixelRatio=function(M){M!==void 0&&(se=M,this.setSize(K,le,!1))},this.getSize=function(M){return M.set(K,le)},this.setSize=function(M,F,X=!0){if(Re.isPresenting){Ve("WebGLRenderer: Can't change size while VR device is presenting.");return}K=M,le=F,t.width=Math.floor(M*se),t.height=Math.floor(F*se),X===!0&&(t.style.width=M+"px",t.style.height=F+"px"),S!==null&&S.setSize(t.width,t.height),this.setViewport(0,0,M,F)},this.getDrawingBufferSize=function(M){return M.set(K*se,le*se).floor()},this.setDrawingBufferSize=function(M,F,X){K=M,le=F,se=X,t.width=Math.floor(M*X),t.height=Math.floor(F*X),this.setViewport(0,0,M,F)},this.setEffects=function(M){if(x===cn){We("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let F=0;F<M.length;F++)if(M[F].isOutputPass===!0){Ve("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}S.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(re)},this.getViewport=function(M){return M.copy(we)},this.setViewport=function(M,F,X,G){M.isVector4?we.set(M.x,M.y,M.z,M.w):we.set(M,F,X,G),_.viewport(re.copy(we).multiplyScalar(se).round())},this.getScissor=function(M){return M.copy(rt)},this.setScissor=function(M,F,X,G){M.isVector4?rt.set(M.x,M.y,M.z,M.w):rt.set(M,F,X,G),_.scissor(ee.copy(rt).multiplyScalar(se).round())},this.getScissorTest=function(){return qe},this.setScissorTest=function(M){_.setScissorTest(qe=M)},this.setOpaqueSort=function(M){Fe=M},this.setTransparentSort=function(M){Xe=M},this.getClearColor=function(M){return M.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(M=!0,F=!0,X=!0){let G=0;if(M){let q=!1;if(k!==null){let Ee=k.texture.format;q=m.has(Ee)}if(q){let Ee=k.texture.type,Ce=g.has(Ee),Se=je.getClearColor(),Oe=je.getClearAlpha(),ke=Se.r,tt=Se.g,at=Se.b;Ce?(w[0]=ke,w[1]=tt,w[2]=at,w[3]=Oe,L.clearBufferuiv(L.COLOR,0,w)):(E[0]=ke,E[1]=tt,E[2]=at,E[3]=Oe,L.clearBufferiv(L.COLOR,0,E))}else G|=L.COLOR_BUFFER_BIT}F&&(G|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(G|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&L.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),O=M},this.dispose=function(){t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",dt,!1),t.removeEventListener("webglcontextcreationerror",On,!1),je.dispose(),ve.dispose(),xe.dispose(),W.dispose(),ue.dispose(),J.dispose(),Me.dispose(),ne.dispose(),fe.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",Lr),Re.removeEventListener("sessionend",Or),Kn.stop()};function pt(M){M.preventDefault(),eh("WebGLRenderer: Context Lost."),I=!0}function dt(){eh("WebGLRenderer: Context Restored."),I=!1;let M=B.autoReset,F=Ge.enabled,X=Ge.autoUpdate,G=Ge.needsUpdate,q=Ge.type;Le(),B.autoReset=M,Ge.enabled=F,Ge.autoUpdate=X,Ge.needsUpdate=G,Ge.type=q}function On(M){We("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function mn(M){let F=M.target;F.removeEventListener("dispose",mn),Ka(F)}function Ka(M){Pr(M),W.remove(M)}function Pr(M){let F=W.get(M).programs;F!==void 0&&(F.forEach(function(X){fe.releaseProgram(X)}),M.isShaderMaterial&&fe.releaseShaderCache(M))}this.renderBufferDirect=function(M,F,X,G,q,Ee){F===null&&(F=Ie);let Ce=q.isMesh&&q.matrixWorld.determinantAffine()<0,Se=$e(M,F,X,G,q);_.setMaterial(G,Ce);let Oe=X.index,ke=1;if(G.wireframe===!0){if(Oe=j.getWireframeAttribute(X),Oe===void 0)return;ke=2}let tt=X.drawRange,at=X.attributes.position,ze=tt.start*ke,bt=(tt.start+tt.count)*ke;Ee!==null&&(ze=Math.max(ze,Ee.start*ke),bt=Math.min(bt,(Ee.start+Ee.count)*ke)),Oe!==null?(ze=Math.max(ze,0),bt=Math.min(bt,Oe.count)):at!=null&&(ze=Math.max(ze,0),bt=Math.min(bt,at.count));let Ft=bt-ze;if(Ft<0||Ft===1/0)return;Me.setup(q,G,Se,X,Oe);let Ot,Et=pe;if(Oe!==null&&(Ot=he.get(Oe),Et=Q,Et.setIndex(Ot)),q.isMesh)G.wireframe===!0?(_.setLineWidth(G.wireframeLinewidth*Pe()),Et.setMode(L.LINES)):Et.setMode(L.TRIANGLES);else if(q.isLine){let rn=G.linewidth;rn===void 0&&(rn=1),_.setLineWidth(rn*Pe()),q.isLineSegments?Et.setMode(L.LINES):q.isLineLoop?Et.setMode(L.LINE_LOOP):Et.setMode(L.LINE_STRIP)}else q.isPoints?Et.setMode(L.POINTS):q.isSprite&&Et.setMode(L.TRIANGLES);if(q.isBatchedMesh)if(it.get("WEBGL_multi_draw"))Et.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let rn=q._multiDrawStarts,Ae=q._multiDrawCounts,yn=q._multiDrawCount,mt=Oe?he.get(Oe).bytesPerElement:1,Nn=W.get(G).currentProgram.getUniforms();for(let Jn=0;Jn<yn;Jn++)Nn.setValue(L,"_gl_DrawID",Jn),Et.render(rn[Jn]/mt,Ae[Jn])}else if(q.isInstancedMesh)Et.renderInstances(ze,Ft,q.count);else if(X.isInstancedBufferGeometry){let rn=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Ae=Math.min(X.instanceCount,rn);Et.renderInstances(ze,Ft,Ae)}else Et.render(ze,Ft)};function Ja(M,F,X){M.transparent===!0&&M.side===sn&&M.forceSinglePass===!1?(M.side=pn,M.needsUpdate=!0,H(M,F,X),M.side=Bn,M.needsUpdate=!0,H(M,F,X),M.side=sn):H(M,F,X)}this.compile=function(M,F,X=null){X===null&&(X=M),b=xe.get(X),b.init(F),v.push(b),X.traverseVisible(function(q){q.isLight&&q.layers.test(F.layers)&&(b.pushLight(q),q.castShadow&&b.pushShadow(q))}),M!==X&&M.traverseVisible(function(q){q.isLight&&q.layers.test(F.layers)&&(b.pushLight(q),q.castShadow&&b.pushShadow(q))}),b.setupLights();let G=new Set;return M.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let Ee=q.material;if(Ee)if(Array.isArray(Ee))for(let Ce=0;Ce<Ee.length;Ce++){let Se=Ee[Ce];Ja(Se,X,q),G.add(Se)}else Ja(Ee,X,q),G.add(Ee)}),b=v.pop(),G},this.compileAsync=function(M,F,X=null){let G=this.compile(M,F,X);return new Promise(q=>{function Ee(){if(G.forEach(function(Ce){W.get(Ce).currentProgram.isReady()&&G.delete(Ce)}),G.size===0){q(M);return}setTimeout(Ee,10)}it.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let Ps=null;function Dr(M){Ps&&Ps(M)}function Lr(){Kn.stop()}function Or(){Kn.start()}let Kn=new bp;Kn.setAnimationLoop(Dr),typeof self<"u"&&Kn.setContext(self),this.setAnimationLoop=function(M){Ps=M,Re.setAnimationLoop(M),M===null?Kn.stop():Kn.start()},Re.addEventListener("sessionstart",Lr),Re.addEventListener("sessionend",Or),this.render=function(M,F){if(F!==void 0&&F.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;O!==null&&O.renderStart(M,F);let X=Re.enabled===!0&&Re.isPresenting===!0,G=S!==null&&(k===null||X)&&S.begin(P,k);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(S===null||S.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(F),F=Re.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,F,k),b=xe.get(M,v.length),b.init(F),b.state.textureUnits=Z.getTextureUnits(),v.push(b),ge.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),te.setFromProjectionMatrix(ge,Wn,F.reversedDepth),ae=this.localClippingEnabled,oe=Ue.init(this.clippingPlanes,ae),T=ve.get(M,C.length),T.init(),C.push(T),Re.enabled===!0&&Re.isPresenting===!0){let Ce=P.xr.getDepthSensingMesh();Ce!==null&&Ri(Ce,F,-1/0,P.sortObjects)}Ri(M,F,0,P.sortObjects),T.finish(),P.sortObjects===!0&&T.sort(Fe,Xe,F.reversedDepth),Ye=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,Ye&&je.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),oe===!0&&Ue.beginShadows();let q=b.state.shadowsArray;if(Ge.render(q,M,F),oe===!0&&Ue.endShadows(),(G&&S.hasRenderPass())===!1){let Ce=T.opaque,Se=T.transmissive;if(b.setupLights(),F.isArrayCamera){let Oe=F.cameras;if(Se.length>0)for(let ke=0,tt=Oe.length;ke<tt;ke++){let at=Oe[ke];Qa(Ce,Se,M,at)}Ye&&je.render(M);for(let ke=0,tt=Oe.length;ke<tt;ke++){let at=Oe[ke];Nr(T,M,at,at.viewport)}}else Se.length>0&&Qa(Ce,Se,M,F),Ye&&je.render(M),Nr(T,M,F)}k!==null&&z===0&&(Z.updateMultisampleRenderTarget(k),Z.updateRenderTargetMipmap(k)),G&&S.end(P),M.isScene===!0&&M.onAfterRender(P,M,F),Me.resetDefaultState(),$=-1,ie=null,v.pop(),v.length>0?(b=v[v.length-1],Z.setTextureUnits(b.state.textureUnits),oe===!0&&Ue.setGlobalState(P.clippingPlanes,b.state.camera)):b=null,C.pop(),C.length>0?T=C[C.length-1]:T=null,O!==null&&O.renderEnd()};function Ri(M,F,X,G){if(M.visible===!1)return;if(M.layers.test(F.layers)){if(M.isGroup)X=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(F);else if(M.isLightProbeGrid)b.pushLightProbeGrid(M);else if(M.isLight)b.pushLight(M),M.castShadow&&b.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||te.intersectsSprite(M)){G&&He.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ge);let Ce=J.update(M),Se=M.material;Se.visible&&T.push(M,Ce,Se,X,He.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||te.intersectsObject(M))){let Ce=J.update(M),Se=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),He.copy(M.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),He.copy(Ce.boundingSphere.center)),He.applyMatrix4(M.matrixWorld).applyMatrix4(ge)),Array.isArray(Se)){let Oe=Ce.groups;for(let ke=0,tt=Oe.length;ke<tt;ke++){let at=Oe[ke],ze=Se[at.materialIndex];ze&&ze.visible&&T.push(M,Ce,ze,X,He.z,at)}}else Se.visible&&T.push(M,Ce,Se,X,He.z,null)}}let Ee=M.children;for(let Ce=0,Se=Ee.length;Ce<Se;Ce++)Ri(Ee[Ce],F,X,G)}function Nr(M,F,X,G){let{opaque:q,transmissive:Ee,transparent:Ce}=M;b.setupLightsView(X),oe===!0&&Ue.setGlobalState(P.clippingPlanes,X),G&&_.viewport(re.copy(G)),q.length>0&&rs(q,F,X),Ee.length>0&&rs(Ee,F,X),Ce.length>0&&rs(Ce,F,X),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Qa(M,F,X,G){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[G.id]===void 0){let ze=it.has("EXT_color_buffer_half_float")||it.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[G.id]=new En(1,1,{generateMipmaps:!0,type:ze?ai:cn,minFilter:ri,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ut.workingColorSpace})}let Ee=b.state.transmissionRenderTarget[G.id],Ce=G.viewport||re;Ee.setSize(Ce.z*P.transmissionResolutionScale,Ce.w*P.transmissionResolutionScale);let Se=P.getRenderTarget(),Oe=P.getActiveCubeFace(),ke=P.getActiveMipmapLevel();P.setRenderTarget(Ee),P.getClearColor(et),Qe=P.getClearAlpha(),Qe<1&&P.setClearColor(16777215,.5),P.clear(),Ye&&je.render(X);let tt=P.toneMapping;P.toneMapping=In;let at=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),b.setupLightsView(G),oe===!0&&Ue.setGlobalState(P.clippingPlanes,G),rs(M,X,G),Z.updateMultisampleRenderTarget(Ee),Z.updateRenderTargetMipmap(Ee),it.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let bt=0,Ft=F.length;bt<Ft;bt++){let Ot=F[bt],{object:Et,geometry:rn,material:Ae,group:yn}=Ot;if(Ae.side===sn&&Et.layers.test(G.layers)){let mt=Ae.side;Ae.side=pn,Ae.needsUpdate=!0,Fr(Et,X,G,rn,Ae,yn),Ae.side=mt,Ae.needsUpdate=!0,ze=!0}}ze===!0&&(Z.updateMultisampleRenderTarget(Ee),Z.updateRenderTargetMipmap(Ee))}P.setRenderTarget(Se,Oe,ke),P.setClearColor(et,Qe),at!==void 0&&(G.viewport=at),P.toneMapping=tt}function rs(M,F,X){let G=F.isScene===!0?F.overrideMaterial:null;for(let q=0,Ee=M.length;q<Ee;q++){let Ce=M[q],{object:Se,geometry:Oe,group:ke}=Ce,tt=Ce.material;tt.allowOverride===!0&&G!==null&&(tt=G),Se.layers.test(X.layers)&&Fr(Se,F,X,Oe,tt,ke)}}function Fr(M,F,X,G,q,Ee){M.onBeforeRender(P,F,X,G,q,Ee),M.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),q.onBeforeRender(P,F,X,G,M,Ee),q.transparent===!0&&q.side===sn&&q.forceSinglePass===!1?(q.side=pn,q.needsUpdate=!0,P.renderBufferDirect(X,F,G,q,M,Ee),q.side=Bn,q.needsUpdate=!0,P.renderBufferDirect(X,F,G,q,M,Ee),q.side=sn):P.renderBufferDirect(X,F,G,q,M,Ee),M.onAfterRender(P,F,X,G,q,Ee)}function H(M,F,X){F.isScene!==!0&&(F=Ie);let G=W.get(M),q=b.state.lights,Ee=b.state.shadowsArray,Ce=q.state.version,Se=fe.getParameters(M,q.state,Ee,F,X,b.state.lightProbeGridArray),Oe=fe.getProgramCacheKey(Se),ke=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;let tt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=ue.get(M.envMap||G.environment,tt),G.envMapRotation=G.environment!==null&&M.envMap===null?F.environmentRotation:M.envMapRotation,ke===void 0&&(M.addEventListener("dispose",mn),ke=new Map,G.programs=ke);let at=ke.get(Oe);if(at!==void 0){if(G.currentProgram===at&&G.lightsStateVersion===Ce)return ye(M,Se),at}else Se.uniforms=fe.getUniforms(M),O!==null&&M.isNodeMaterial&&O.build(M,X,Se),M.onBeforeCompile(Se,P),at=fe.acquireProgram(Se,Oe),ke.set(Oe,at),G.uniforms=Se.uniforms;let ze=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(ze.clippingPlanes=Ue.uniform),ye(M,Se),G.needsLights=hi(M),G.lightsStateVersion=Ce,G.needsLights&&(ze.ambientLightColor.value=q.state.ambient,ze.lightProbe.value=q.state.probe,ze.directionalLights.value=q.state.directional,ze.directionalLightShadows.value=q.state.directionalShadow,ze.spotLights.value=q.state.spot,ze.spotLightShadows.value=q.state.spotShadow,ze.rectAreaLights.value=q.state.rectArea,ze.ltc_1.value=q.state.rectAreaLTC1,ze.ltc_2.value=q.state.rectAreaLTC2,ze.pointLights.value=q.state.point,ze.pointLightShadows.value=q.state.pointShadow,ze.hemisphereLights.value=q.state.hemi,ze.directionalShadowMatrix.value=q.state.directionalShadowMatrix,ze.spotLightMatrix.value=q.state.spotLightMatrix,ze.spotLightMap.value=q.state.spotLightMap,ze.pointShadowMatrix.value=q.state.pointShadowMatrix),G.lightProbeGrid=b.state.lightProbeGridArray.length>0,G.currentProgram=at,G.uniformsList=null,at}function de(M){if(M.uniformsList===null){let F=M.currentProgram.getUniforms();M.uniformsList=mr.seqWithValue(F.seq,M.uniforms)}return M.uniformsList}function ye(M,F){let X=W.get(M);X.outputColorSpace=F.outputColorSpace,X.batching=F.batching,X.batchingColor=F.batchingColor,X.instancing=F.instancing,X.instancingColor=F.instancingColor,X.instancingMorph=F.instancingMorph,X.skinning=F.skinning,X.morphTargets=F.morphTargets,X.morphNormals=F.morphNormals,X.morphColors=F.morphColors,X.morphTargetsCount=F.morphTargetsCount,X.numClippingPlanes=F.numClippingPlanes,X.numIntersection=F.numClipIntersection,X.vertexAlphas=F.vertexAlphas,X.vertexTangents=F.vertexTangents,X.toneMapping=F.toneMapping}function Ze(M,F){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(F.matrixWorld);for(let X=0,G=M.length;X<G;X++){let q=M[X];if(q.texture!==null&&q.boundingBox.containsPoint(y))return q}return null}function $e(M,F,X,G,q){F.isScene!==!0&&(F=Ie),Z.resetTextureUnits();let Ee=F.fog,Ce=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,Se=k===null?P.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:ut.workingColorSpace,Oe=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,ke=ue.get(G.envMap||Ce,Oe),tt=G.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,at=!!X.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),ze=!!X.morphAttributes.position,bt=!!X.morphAttributes.normal,Ft=!!X.morphAttributes.color,Ot=In;G.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Ot=P.toneMapping);let Et=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,rn=Et!==void 0?Et.length:0,Ae=W.get(G),yn=b.state.lights;if(oe===!0&&(ae===!0||M!==ie)){let Tt=M===ie&&G.id===$;Ue.setState(G,M,Tt)}let mt=!1;G.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==yn.state.version||Ae.outputColorSpace!==Se||q.isBatchedMesh&&Ae.batching===!1||!q.isBatchedMesh&&Ae.batching===!0||q.isBatchedMesh&&Ae.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&Ae.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&Ae.instancing===!1||!q.isInstancedMesh&&Ae.instancing===!0||q.isSkinnedMesh&&Ae.skinning===!1||!q.isSkinnedMesh&&Ae.skinning===!0||q.isInstancedMesh&&Ae.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Ae.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Ae.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Ae.instancingMorph===!1&&q.morphTexture!==null||Ae.envMap!==ke||G.fog===!0&&Ae.fog!==Ee||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==Ue.numPlanes||Ae.numIntersection!==Ue.numIntersection)||Ae.vertexAlphas!==tt||Ae.vertexTangents!==at||Ae.morphTargets!==ze||Ae.morphNormals!==bt||Ae.morphColors!==Ft||Ae.toneMapping!==Ot||Ae.morphTargetsCount!==rn||!!Ae.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(mt=!0):(mt=!0,Ae.__version=G.version);let Nn=Ae.currentProgram;mt===!0&&(Nn=H(G,F,q),O&&G.isNodeMaterial&&O.onUpdateProgram(G,Nn,Ae));let Jn=!1,Ii=!1,Ds=!1,wt=Nn.getUniforms(),Ut=Ae.uniforms;if(_.useProgram(Nn.program)&&(Jn=!0,Ii=!0,Ds=!0),G.id!==$&&($=G.id,Ii=!0),Ae.needsLights){let Tt=Ze(b.state.lightProbeGridArray,q);Ae.lightProbeGrid!==Tt&&(Ae.lightProbeGrid=Tt,Ii=!0)}if(Jn||ie!==M){_.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),wt.setValue(L,"projectionMatrix",M.projectionMatrix),wt.setValue(L,"viewMatrix",M.matrixWorldInverse);let Di=wt.map.cameraPosition;Di!==void 0&&Di.setValue(L,_e.setFromMatrixPosition(M.matrixWorld)),A.logarithmicDepthBuffer&&wt.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&wt.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),ie!==M&&(ie=M,Ii=!0,Ds=!0)}if(Ae.needsLights&&(yn.state.directionalShadowMap.length>0&&wt.setValue(L,"directionalShadowMap",yn.state.directionalShadowMap,Z),yn.state.spotShadowMap.length>0&&wt.setValue(L,"spotShadowMap",yn.state.spotShadowMap,Z),yn.state.pointShadowMap.length>0&&wt.setValue(L,"pointShadowMap",yn.state.pointShadowMap,Z)),q.isSkinnedMesh){wt.setOptional(L,q,"bindMatrix"),wt.setOptional(L,q,"bindMatrixInverse");let Tt=q.skeleton;Tt&&(Tt.boneTexture===null&&Tt.computeBoneTexture(),wt.setValue(L,"boneTexture",Tt.boneTexture,Z))}q.isBatchedMesh&&(wt.setOptional(L,q,"batchingTexture"),wt.setValue(L,"batchingTexture",q._matricesTexture,Z),wt.setOptional(L,q,"batchingIdTexture"),wt.setValue(L,"batchingIdTexture",q._indirectTexture,Z),wt.setOptional(L,q,"batchingColorTexture"),q._colorsTexture!==null&&wt.setValue(L,"batchingColorTexture",q._colorsTexture,Z));let Pi=X.morphAttributes;if((Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0)&&N.update(q,X,Nn),(Ii||Ae.receiveShadow!==q.receiveShadow)&&(Ae.receiveShadow=q.receiveShadow,wt.setValue(L,"receiveShadow",q.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(Ut.envMapIntensity.value=F.environmentIntensity),Ut.dfgLUT!==void 0&&(Ut.dfgLUT.value=GM()),Ii){if(wt.setValue(L,"toneMappingExposure",P.toneMappingExposure),Ae.needsLights&&At(Ut,Ds),Ee&&G.fog===!0&&De.refreshFogUniforms(Ut,Ee),De.refreshMaterialUniforms(Ut,G,se,le,b.state.transmissionRenderTarget[M.id]),Ae.needsLights&&Ae.lightProbeGrid){let Tt=Ae.lightProbeGrid;Ut.probesSH.value=Tt.texture,Ut.probesMin.value.copy(Tt.boundingBox.min),Ut.probesMax.value.copy(Tt.boundingBox.max),Ut.probesResolution.value.copy(Tt.resolution)}mr.upload(L,de(Ae),Ut,Z)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(mr.upload(L,de(Ae),Ut,Z),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&wt.setValue(L,"center",q.center),wt.setValue(L,"modelViewMatrix",q.modelViewMatrix),wt.setValue(L,"normalMatrix",q.normalMatrix),wt.setValue(L,"modelMatrix",q.matrixWorld),G.uniformsGroups!==void 0){let Tt=G.uniformsGroups;for(let Di=0,Ls=Tt.length;Di<Ls;Di++){let pd=Tt[Di];ne.update(pd,Nn),ne.bind(pd,Nn)}}return Nn}function At(M,F){M.ambientLightColor.needsUpdate=F,M.lightProbe.needsUpdate=F,M.directionalLights.needsUpdate=F,M.directionalLightShadows.needsUpdate=F,M.pointLights.needsUpdate=F,M.pointLightShadows.needsUpdate=F,M.spotLights.needsUpdate=F,M.spotLightShadows.needsUpdate=F,M.rectAreaLights.needsUpdate=F,M.hemisphereLights.needsUpdate=F}function hi(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(M,F,X){let G=W.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=F,W.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:X,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,F){let X=W.get(M);X.__webglFramebuffer=F,X.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(M,F=0,X=0){k=M,V=F,z=X;let G=null,q=!1,Ee=!1;if(M){let Se=W.get(M);if(Se.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(L.FRAMEBUFFER,Se.__webglFramebuffer),re.copy(M.viewport),ee.copy(M.scissor),Te=M.scissorTest,_.viewport(re),_.scissor(ee),_.setScissorTest(Te),$=-1;return}else if(Se.__webglFramebuffer===void 0)Z.setupRenderTarget(M);else if(Se.__hasExternalTextures)Z.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let tt=M.depthTexture;if(Se.__boundDepthTexture!==tt){if(tt!==null&&W.has(tt)&&(M.width!==tt.image.width||M.height!==tt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(M)}}let Oe=M.texture;(Oe.isData3DTexture||Oe.isDataArrayTexture||Oe.isCompressedArrayTexture)&&(Ee=!0);let ke=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(ke[F])?G=ke[F][X]:G=ke[F],q=!0):M.samples>0&&Z.useMultisampledRTT(M)===!1?G=W.get(M).__webglMultisampledFramebuffer:Array.isArray(ke)?G=ke[X]:G=ke,re.copy(M.viewport),ee.copy(M.scissor),Te=M.scissorTest}else re.copy(we).multiplyScalar(se).floor(),ee.copy(rt).multiplyScalar(se).floor(),Te=qe;if(X!==0&&(G=U),_.bindFramebuffer(L.FRAMEBUFFER,G)&&_.drawBuffers(M,G),_.viewport(re),_.scissor(ee),_.setScissorTest(Te),q){let Se=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,Se.__webglTexture,X)}else if(Ee){let Se=F;for(let Oe=0;Oe<M.textures.length;Oe++){let ke=W.get(M.textures[Oe]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Oe,ke.__webglTexture,X,Se)}}else if(M!==null&&X!==0){let Se=W.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Se.__webglTexture,X)}$=-1},this.readRenderTargetPixels=function(M,F,X,G,q,Ee,Ce,Se=0){if(!(M&&M.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Oe=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Oe=Oe[Ce]),Oe){_.bindFramebuffer(L.FRAMEBUFFER,Oe);try{let ke=M.textures[Se],tt=ke.format,at=ke.type;if(M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Se),!A.textureFormatReadable(tt)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!A.textureTypeReadable(at)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=M.width-G&&X>=0&&X<=M.height-q&&L.readPixels(F,X,G,q,me.convert(tt),me.convert(at),Ee)}finally{let ke=k!==null?W.get(k).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(M,F,X,G,q,Ee,Ce,Se=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Oe=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ce!==void 0&&(Oe=Oe[Ce]),Oe)if(F>=0&&F<=M.width-G&&X>=0&&X<=M.height-q){_.bindFramebuffer(L.FRAMEBUFFER,Oe);let ke=M.textures[Se],tt=ke.format,at=ke.type;if(M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Se),!A.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!A.textureTypeReadable(at))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ze=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ze),L.bufferData(L.PIXEL_PACK_BUFFER,Ee.byteLength,L.STREAM_READ),L.readPixels(F,X,G,q,me.convert(tt),me.convert(at),0);let bt=k!==null?W.get(k).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,bt);let Ft=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Wf(L,Ft,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ze),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Ee),L.deleteBuffer(ze),L.deleteSync(Ft),Ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,F=null,X=0){let G=Math.pow(2,-X),q=Math.floor(M.image.width*G),Ee=Math.floor(M.image.height*G),Ce=F!==null?F.x:0,Se=F!==null?F.y:0;Z.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,X,0,0,Ce,Se,q,Ee),_.unbindTexture()},this.copyTextureToTexture=function(M,F,X=null,G=null,q=0,Ee=0){let Ce,Se,Oe,ke,tt,at,ze,bt,Ft,Ot=M.isCompressedTexture?M.mipmaps[Ee]:M.image;if(X!==null)Ce=X.max.x-X.min.x,Se=X.max.y-X.min.y,Oe=X.isBox3?X.max.z-X.min.z:1,ke=X.min.x,tt=X.min.y,at=X.isBox3?X.min.z:0;else{let Ut=Math.pow(2,-q);Ce=Math.floor(Ot.width*Ut),Se=Math.floor(Ot.height*Ut),M.isDataArrayTexture?Oe=Ot.depth:M.isData3DTexture?Oe=Math.floor(Ot.depth*Ut):Oe=1,ke=0,tt=0,at=0}G!==null?(ze=G.x,bt=G.y,Ft=G.z):(ze=0,bt=0,Ft=0);let Et=me.convert(F.format),rn=me.convert(F.type),Ae;F.isData3DTexture?(Z.setTexture3D(F,0),Ae=L.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Z.setTexture2DArray(F,0),Ae=L.TEXTURE_2D_ARRAY):(Z.setTexture2D(F,0),Ae=L.TEXTURE_2D),_.activeTexture(L.TEXTURE0),_.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,F.flipY),_.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),_.pixelStorei(L.UNPACK_ALIGNMENT,F.unpackAlignment);let yn=_.getParameter(L.UNPACK_ROW_LENGTH),mt=_.getParameter(L.UNPACK_IMAGE_HEIGHT),Nn=_.getParameter(L.UNPACK_SKIP_PIXELS),Jn=_.getParameter(L.UNPACK_SKIP_ROWS),Ii=_.getParameter(L.UNPACK_SKIP_IMAGES);_.pixelStorei(L.UNPACK_ROW_LENGTH,Ot.width),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ot.height),_.pixelStorei(L.UNPACK_SKIP_PIXELS,ke),_.pixelStorei(L.UNPACK_SKIP_ROWS,tt),_.pixelStorei(L.UNPACK_SKIP_IMAGES,at);let Ds=M.isDataArrayTexture||M.isData3DTexture,wt=F.isDataArrayTexture||F.isData3DTexture;if(M.isDepthTexture){let Ut=W.get(M),Pi=W.get(F),Tt=W.get(Ut.__renderTarget),Di=W.get(Pi.__renderTarget);_.bindFramebuffer(L.READ_FRAMEBUFFER,Tt.__webglFramebuffer),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,Di.__webglFramebuffer);for(let Ls=0;Ls<Oe;Ls++)Ds&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(M).__webglTexture,q,at+Ls),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(F).__webglTexture,Ee,Ft+Ls)),L.blitFramebuffer(ke,tt,Ce,Se,ze,bt,Ce,Se,L.DEPTH_BUFFER_BIT,L.NEAREST);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(q!==0||M.isRenderTargetTexture||W.has(M)){let Ut=W.get(M),Pi=W.get(F);_.bindFramebuffer(L.READ_FRAMEBUFFER,Y),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,R);for(let Tt=0;Tt<Oe;Tt++)Ds?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ut.__webglTexture,q,at+Tt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ut.__webglTexture,q),wt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Pi.__webglTexture,Ee,Ft+Tt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Pi.__webglTexture,Ee),q!==0?L.blitFramebuffer(ke,tt,Ce,Se,ze,bt,Ce,Se,L.COLOR_BUFFER_BIT,L.NEAREST):wt?L.copyTexSubImage3D(Ae,Ee,ze,bt,Ft+Tt,ke,tt,Ce,Se):L.copyTexSubImage2D(Ae,Ee,ze,bt,ke,tt,Ce,Se);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else wt?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(Ae,Ee,ze,bt,Ft,Ce,Se,Oe,Et,rn,Ot.data):F.isCompressedArrayTexture?L.compressedTexSubImage3D(Ae,Ee,ze,bt,Ft,Ce,Se,Oe,Et,Ot.data):L.texSubImage3D(Ae,Ee,ze,bt,Ft,Ce,Se,Oe,Et,rn,Ot):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Ee,ze,bt,Ce,Se,Et,rn,Ot.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Ee,ze,bt,Ot.width,Ot.height,Et,Ot.data):L.texSubImage2D(L.TEXTURE_2D,Ee,ze,bt,Ce,Se,Et,rn,Ot);_.pixelStorei(L.UNPACK_ROW_LENGTH,yn),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,mt),_.pixelStorei(L.UNPACK_SKIP_PIXELS,Nn),_.pixelStorei(L.UNPACK_SKIP_ROWS,Jn),_.pixelStorei(L.UNPACK_SKIP_IMAGES,Ii),Ee===0&&F.generateMipmaps&&L.generateMipmap(Ae),_.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&Z.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Z.setTextureCube(M,0):M.isData3DTexture?Z.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Z.setTexture2DArray(M,0):Z.setTexture2D(M,0),_.unbindTexture()},this.resetState=function(){V=0,z=0,k=null,_.reset(),Me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ut._getDrawingBufferColorSpace(e),t.unpackColorSpace=ut._getUnpackColorSpace()}};var Cp={type:"change"},Sh={type:"start"},Ip={type:"end"},ll=new _s,Rp=new Un,WM=Math.cos(70*ht.DEG2RAD),Yt=new D,vn=2*Math.PI,St={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Mh=1e-6,ul=class extends _a{constructor(e,t=null){super(e,t),this.state=St.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Yi.ROTATE,MIDDLE:Yi.DOLLY,RIGHT:Yi.PAN},this.touches={ONE:$i.ROTATE,TWO:$i.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Sn,this._lastTargetPosition=new D,this._quat=new Sn().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new lr,this._sphericalDelta=new lr,this._scale=1,this._panOffset=new D,this._rotateStart=new ce,this._rotateEnd=new ce,this._rotateDelta=new ce,this._panStart=new ce,this._panEnd=new ce,this._panDelta=new ce,this._dollyStart=new ce,this._dollyEnd=new ce,this._dollyDelta=new ce,this._dollyDirection=new D,this._mouse=new ce,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=qM.bind(this),this._onPointerDown=XM.bind(this),this._onPointerUp=YM.bind(this),this._onContextMenu=eS.bind(this),this._onMouseWheel=ZM.bind(this),this._onKeyDown=KM.bind(this),this._onTouchStart=JM.bind(this),this._onTouchMove=QM.bind(this),this._onMouseDown=$M.bind(this),this._onMouseMove=jM.bind(this),this._interceptControlDown=tS.bind(this),this._interceptControlUp=nS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Cp),this.update(),this.state=St.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Yt.copy(t).sub(this.target),Yt.applyQuaternion(this._quat),this._spherical.setFromVector3(Yt),this.autoRotate&&this.state===St.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=vn:i>Math.PI&&(i-=vn),s<-Math.PI?s+=vn:s>Math.PI&&(s-=vn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Yt.setFromSpherical(this._spherical),Yt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Yt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Yt.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let o=new D(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=Yt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(ll.origin.copy(this.object.position),ll.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ll.direction))<WM?this.object.lookAt(this.target):(Rp.setFromNormalAndCoplanarPoint(this.object.up,this.target),ll.intersectPlane(Rp,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Mh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Mh||this._lastTargetPosition.distanceToSquared(this.target)>Mh?(this.dispatchEvent(Cp),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?vn/60*this.autoRotateSpeed*e:vn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Yt.setFromMatrixColumn(t,0),Yt.multiplyScalar(-e),this._panOffset.add(Yt)}_panUp(e,t){this.screenSpacePanning===!0?Yt.setFromMatrixColumn(t,1):(Yt.setFromMatrixColumn(t,0),Yt.crossVectors(this.object.up,Yt)),Yt.multiplyScalar(e),this._panOffset.add(Yt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Yt.copy(s).sub(this.target);let r=Yt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(vn*this._rotateDelta.x/t.clientHeight),this._rotateUp(vn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-vn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(vn*this._rotateDelta.x/t.clientHeight),this._rotateUp(vn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ce,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function XM(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function qM(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function YM(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Ip),this.state=St.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function $M(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Yi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=St.DOLLY;break;case Yi.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=St.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=St.ROTATE}break;case Yi.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=St.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=St.PAN}break;default:this.state=St.NONE}this.state!==St.NONE&&this.dispatchEvent(Sh)}function jM(n){switch(this.state){case St.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case St.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case St.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function ZM(n){this.enabled===!1||this.enableZoom===!1||this.state!==St.NONE||(n.preventDefault(),this.dispatchEvent(Sh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Ip))}function KM(n){this.enabled!==!1&&this._handleKeyDown(n)}function JM(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case $i.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=St.TOUCH_ROTATE;break;case $i.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=St.TOUCH_PAN;break;default:this.state=St.NONE}break;case 2:switch(this.touches.TWO){case $i.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=St.TOUCH_DOLLY_PAN;break;case $i.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=St.TOUCH_DOLLY_ROTATE;break;default:this.state=St.NONE}break;default:this.state=St.NONE}this.state!==St.NONE&&this.dispatchEvent(Sh)}function QM(n){switch(this._trackPointer(n),this.state){case St.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case St.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case St.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case St.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=St.NONE}}function eS(n){this.enabled!==!1&&n.preventDefault()}function tS(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function nS(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Tm=Qn(kl());var Lt=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),mattress:Object.freeze({materialKey:"fabric",baseColor:"#E4E0D8",roughness:.94,metallic:0,opacity:1}),countertop:Object.freeze({materialKey:"custom",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1})});function _t(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Pp({width:n,height:e,depth:t}){let i=e*.38,s=t*.2,r=n*.1,a=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),o=Math.max(e*.16,.035),c=Math.max(Math.min(n*.012,.018),.006),l=[_t("seat","cushions",[n,i,t],[0,-e/2+i/2,0]),_t("back","body",[n,e*.62,s],[0,e*.19,-t/2+s/2]),_t("left-arm","body",[r,e*.46,t],[-n/2+r/2,-e*.08,0]),_t("right-arm","body",[r,e*.46,t],[n/2-r/2,-e*.08,0])];for(let u of[-n*.4,n*.4])for(let h of[-t*.32,t*.32])l.push(_t("leg","legs",[a,o,a],[u,-e/2+o/2,h]));return l.push(_t("cushion-seam","cushions",[c,Math.max(i*.035,.006),t*.78],[0,-e/2+i+.003,t*.02])),{parts:l,materialDefaults:{body:Lt.fabric,cushions:Lt.fabric,legs:Lt.metal}}}function Dp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.08,.024),r=[_t("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),_t("back","back",[n*.9,e*.46,Math.max(t*.14,.035)],[0,e*.26,-t*.36],"seat")];for(let a of[-n*.36,n*.36])for(let o of[-t*.3,t*.3])r.push(_t("leg","frame",[s,e*.44,s],[a,-e*.28,o]));return{parts:r,yawOffsetDegrees:180,materialDefaults:{seat:Lt.fabric,back:Lt.fabric,frame:Lt.wood}}}function Eh({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.max(Math.min(Math.min(n,t)*.09,.075),.025),r=Math.max(e-i,.02),a=[_t("top","top",[n,i,t],[0,e/2-i/2,0]),_t("top-surface","top",[n*.965,.012,t*.965],[0,e/2-.006,0])];for(let o of[-n*.4,n*.4])for(let c of[-t*.4,t*.4])a.push(_t("leg","legs",[s,r,s],[o,-i/2,c]));return{parts:a,materialDefaults:{top:Lt.wood,legs:Lt.metal}}}function wh({width:n,height:e,depth:t}){let i=e*.4,s=e*.38,r=Math.max(e*.1,.045);return{parts:[_t("frame","frame",[n,i,t],[0,-e/2+i/2,0]),_t("mattress","mattress",[n*.93,s,t*.9],[0,-e/2+i+s/2,t*.025]),_t("headboard","headboard",[n*.98,e*.72,Math.max(t*.065,.055)],[0,-e/2+e*.64,-t/2+Math.max(t*.0325,.0275)],"frame"),_t("left-pillow","mattress",[n*.38,r,t*.2],[-n*.23,e*.27,-t*.29]),_t("right-pillow","mattress",[n*.38,r,t*.2],[n*.23,e*.27,-t*.29])],yawOffsetDegrees:180,materialDefaults:{frame:Lt.wood,mattress:Lt.mattress,headboard:Lt.wood}}}function Lp({width:n,height:e,depth:t}){let i=Math.max(e*.06,.025),s=Math.max(t*.05,.016),r=Math.max(e-i,.02),a=r*.92,o=n*.94/3,c=Math.max(s*.7,.012),l=[_t("body","body",[n,r,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let u=0;u<3;u+=1){let h=-n*.47+o*(u+.5);l.push(_t("front","front",[o*.96,a,s],[h,-i/2,t/2-s/2]));let f=h+o*(u<1?.3:-.3);l.push(_t("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),c],[f,0,t/2-c/2]))}return l.push(_t("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:l,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.wood,handles:Lt.metal}}}function Op({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.045,.016),r=Math.max(s*.7,.012),a=[_t("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let o of[-n*.245,n*.245])a.push(_t("front","front",[n*.47,Math.max(e-i,.02)*.94,s],[o,-i/2,t/2-s/2])),a.push(_t("handle","handles",[n*.25,Math.max(e*.016,.01),r],[o,e*.3,t/2-r/2]));return a.push(_t("worktop","top",[n,i,t],[0,e*.46,0])),{parts:a,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.countertop,handles:Lt.metal}}}function Np({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.05,.016),r=n*.305,a=Math.max(s*.7,.012),o=Math.max(e*.12,.018),c=[_t("body","body",[n,e*.76-i,Math.max(t-s,.02)],[0,e*.08-i/2,-s/2])];for(let l of[-1,0,1]){let u=l*n*.323;c.push(_t("front","front",[r,e*.58,s],[u,e*.04,t/2-s/2])),c.push(_t("handle","handles",[r*.28,Math.max(e*.018,.009),a],[u,e*.25,t/2-a/2]))}return c.push(_t("top","top",[n,i,t],[0,e*.46-i/2,0])),c.push(_t("foot","body",[n*.82,o,t*.72],[0,-e*.44,0])),{parts:c,materialDefaults:{body:Lt.cabinet,front:Lt.cabinetFront,top:Lt.wood,handles:Lt.metal}}}var lt=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"paint",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),counter:Object.freeze({materialKey:"stone",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1})});function Be(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Pa(n,e,t,i,s,r=void 0,a=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:a,radius:t,height:i,position:s,rotation:r}}var Th=Object.freeze({seat:lt.fabric,back:lt.fabric,frame:lt.wood,arms:lt.fabric});function Fp({width:n,height:e,depth:t}){let i=e*.4,s=t*.84,r=t*.24,a=n*.17,o=Math.max(Math.min(n,t)*.07,.018),c=Math.max(e*.16,.035),l=[Be("seat","seat",[n,i,s],[0,-e/2+i/2,t*.08]),Be("back","back",[n,e*.64,r],[0,e*.18,-t/2+r/2]),Be("left-arm","arms",[a,e*.5,t*.88],[-n/2+a/2,-e*.06,t*.06],"seat"),Be("right-arm","arms",[a,e*.5,t*.88],[n/2-a/2,-e*.06,t*.06],"seat")];for(let u of[-n*.33,n*.33])for(let h of[-t*.3,t*.3])l.push(Be("leg","frame",[o,c,o],[u,-e/2+c/2,h]));return{parts:l,yawOffsetDegrees:180,materialDefaults:Th}}function Up({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.075,.026),r=e*.45,a=[Be("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02])];for(let o of[-n*.36,n*.36]){for(let c of[-t*.3,t*.3])a.push(Be("leg","frame",[s,r,s],[o,-e/2+r/2,c]));a.push(Be("back-post","frame",[s,e*.51,s],[o,e*.23,-t*.34]))}for(let o of[e*.18,e*.34])a.push(Be("back-slat","back",[n*.76,e*.085,Math.max(t*.07,.028)],[0,o,-t*.34],"frame"));return{parts:a,yawOffsetDegrees:180,materialDefaults:Th}}function Bp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.045,.02),r=[Be("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),Be("back","back",[n*.88,e*.42,Math.max(t*.13,.035)],[0,e*.27,-t*.31],"seat")];for(let a of[-n*.37,n*.37])r.push(Be("base-rail","frame",[s,s,t*.84],[a,-e/2+s/2,0])),r.push(Be("front-post","frame",[s,e*.48,s],[a,-e*.26,t*.34])),r.push(Be("back-post","frame",[s,e*.58,s],[a,e*.14,-t*.31]));return{parts:r,yawOffsetDegrees:180,materialDefaults:Th}}function kp({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.min(n,t)/2;return{parts:[Pa("top","top",s,i,[0,e/2-i/2,0]),Pa("top-surface","top",s*.965,.012,[0,e/2-.006,0]),Pa("pedestal","legs",s*.13,Math.max(e-i-.055,.02),[0,-i/2+.028,0]),Pa("foot","legs",s*.34,.055,[0,-e/2+.0275,0])],materialDefaults:{top:lt.wood,legs:lt.metal}}}function zp({width:n,height:e,depth:t}){let i=Math.max(Math.min(n*.055,.055),.028),s=Math.max(Math.min(e*.025,.04),.025),r=[Be("left-side","body",[i,e,t],[-n/2+i/2,0,0]),Be("right-side","body",[i,e,t],[n/2-i/2,0,0]),Be("bottom","body",[n,s,t],[0,-e/2+s/2,0])];for(let a=1;a<=5;a+=1){let o=-e/2+e*a/5;r.push(Be(a===5?"top":"shelf",a===5?"top":"body",[n,s,t],[0,Math.min(o,e/2-s/2),0]))}return r.push(Be("back","body",[n-i*2,e*.96,Math.max(t*.045,.016)],[0,0,-t/2+Math.max(t*.0225,.008)])),{parts:r,materialDefaults:{body:lt.cabinet,top:lt.wood}}}function hl({width:n,height:e,depth:t},i="cabinet"){let s=Math.max(e*.06,.025),r=Math.max(t*.05,.016),a=Math.max(e-s,.02),o=a*.92,c=-s/2,l=[Be("body","body",[n,a,Math.max(t-r,.02)],[0,-s/2,-r/2])];if(i==="nightstand")for(let u=0;u<2;u+=1){let h=c+(u===0?o*.25:-o*.25),f=Math.max(r*.7,.012);l.push(Be("front","front",[n*.94,o*.46,r],[0,h,t/2-r/2])),l.push(Be("handle","handles",[n*.22,Math.max(e*.018,.008),f],[0,h+o*.12,t/2-f/2]))}else{let u=i==="wardrobe"?3:2,h=n*.94/u;for(let f=0;f<u;f+=1){let d=-n*.47+h*(f+.5),p=d+h*(f<u/2?.3:-.3),x=Math.max(r*.7,.012);l.push(Be("front","front",[h*.96,o,r],[d,c,t/2-r/2])),l.push(Be("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),x],[p,0,t/2-x/2]))}}return l.push(Be("top","top",[n,s,t],[0,e/2-s/2,0])),{parts:l,materialDefaults:{body:lt.cabinet,front:lt.front,top:lt.wood,handles:lt.metal}}}function Hp({width:n,height:e,depth:t}){let i=Math.max(e*.025,.03),s=Math.max(t*.045,.016),r=[Be("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let[a,o]of[[e*.25,e*.45],[-e*.25,e*.45]]){let c=Math.max(s*.7,.012);r.push(Be("front","front",[n*.95,o,s],[0,a,t/2-s/2])),r.push(Be("handle","handles",[Math.max(n*.025,.012),o*.44,c],[n*.38,a,t/2-c/2]))}return r.push(Be("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:r,materialDefaults:{body:lt.cabinet,front:lt.front,top:lt.counter,handles:lt.metal}}}function Vp({width:n,height:e,depth:t}){let i=Math.max(t*.055,.018),s=Math.max(e*.025,.028),r=e*.34,a=Math.max(e*.007,.008),o=Math.max(t*.06,.016);return{parts:[Be("body","body",[n,e-s,Math.max(t-i,.02)],[0,-s/2,-i/2]),Be("door","front",[n*.97,e-r-a*1.5,i],[0,r/2+a*.25,t/2-i/2]),Be("freezer-door","front",[n*.97,r-a*1.5,i],[0,-e/2+r/2,t/2-i/2]),Be("handle","handles",[Math.max(n*.018,.009),e*.3,o],[n*.38,e*.25,t/2-o/2]),Be("freezer-handle","handles",[Math.max(n*.018,.009),e*.19,o],[n*.38,-e*.25,t/2-o/2]),Be("top","top",[n,s,t],[0,e/2-s/2,0])],materialDefaults:{body:lt.cabinet,front:lt.front,top:lt.metal,handles:lt.metal}}}function Gp({width:n,height:e,depth:t}){let i=Math.max(e*.075,.03),s=t*.13,r=t-s,a=Math.max(t*.035,.016),o=[Be("body","body",[n*.94,e-i,r],[0,-i/2,-s/2])];for(let c=-1;c<=1;c+=1){let l=c*n*.31;o.push(Be("front","front",[n*.29,e*.8,a],[l,-i/2,t/2-s-a/2])),o.push(Be("handle","handles",[n*.16,Math.max(e*.014,.009),Math.max(a*.75,.012)],[l,e*.31,t/2-s+.003]))}return o.push(Be("worktop","top",[n,i,t],[0,e/2-i/2,0])),{parts:o,materialDefaults:{body:lt.cabinet,front:lt.front,top:lt.counter,handles:lt.metal}}}function Wp({width:n,height:e,depth:t}){let i=Math.min(e*.22,.24),s=e-i,r=Math.max(s*.075,.03),a=Math.max(t*.045,.016),o=-e/2+s/2,c=-e/2+s-r/2,l=n*.48,u=t*.52,h=Math.max(Math.min(l,u)*.075,.025),f=c+r/2-Math.max(r*.08,.005),d=[Be("body","body",[n,s-r,Math.max(t-a,.02)],[0,o-r/2,-a/2])];for(let m of[-n*.245,n*.245]){let g=Math.max(a*.75,.012);d.push(Be("front","front",[n*.47,s*.78,a],[m,o-r*.3,t/2-a/2])),d.push(Be("handle","handles",[n*.22,Math.max(s*.014,.009),g],[m,c-s*.12,t/2-g/2]))}d.push(Be("worktop","top",[n,r,t],[0,c,0])),d.push(Be("basin-back","basin",[l,Math.max(r*.16,.01),h],[-n*.12,f,-u/2])),d.push(Be("basin-front","basin",[l,Math.max(r*.16,.01),h],[-n*.12,f,u/2])),d.push(Be("basin-left","basin",[h,Math.max(r*.16,.01),u],[-n*.12-l/2+h/2,f,0])),d.push(Be("basin-right","basin",[h,Math.max(r*.16,.01),u],[-n*.12+l/2-h/2,f,0]));let p=i*.72,x=c+r/2;return d.push(Pa("faucet","fittings",Math.max(n*.018,.012),p,[n*.28,x+p/2,-t*.12])),d.push(Be("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.2,Math.min(x+p,e/2-.01),-t*.05])),{parts:d,materialDefaults:{body:lt.cabinet,front:lt.front,top:lt.counter,handles:lt.metal,basin:lt.metal,fittings:lt.metal}}}function Xp({width:n,height:e,depth:t}){let i=Math.max(Math.min(t*.34,.055),.018);return{parts:[Be("frame","frame",[n,e*.88,i],[0,e*.06,0]),Be("display","display",[n*.92,e*.76,Math.max(i*.12,.008)],[0,e*.06,i*.52]),Be("stand","stand",[n*.34,Math.max(e*.045,.018),t],[0,-e*.46,0])],materialDefaults:{frame:lt.metal,display:lt.screen,stand:lt.metal}}}function qp({width:n,height:e,depth:t}){let i=Math.min(Math.max(Math.min(n,t)*.045,.025),.09),s=Math.max(e*.72,.018),r=Math.max(e*.55,.014),a=-e/2+r/2;return{parts:[Be("pile","pile",[Math.max(n-i*2,.08),s,Math.max(t-i*2,.08)],[0,e/2-s/2+.002,0]),Be("border-back","border",[n,r,i],[0,a,-t/2+i/2]),Be("border-front","border",[n,r,i],[0,a,t/2-i/2]),Be("border-left","border",[i,r,Math.max(t-i*2,.08)],[-n/2+i/2,a,0]),Be("border-right","border",[i,r,Math.max(t-i*2,.08)],[n/2-i/2,a,0])],materialDefaults:{pile:lt.fabric,border:lt.fabric}}}function Yp({width:n,height:e,depth:t}){return{parts:[Be("body","body",[n*.96,e*.96,t*.96],[0,0,0]),Be("top","top",[n*.72,Math.max(e*.025,.018),t*.72],[0,e*.44,0])],materialDefaults:{body:lt.cabinet,top:lt.wood}}}var ot=Object.freeze({paint:Object.freeze({materialKey:"paint",baseColor:"#D8D5CE",roughness:.7,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E7E4DE",roughness:.64,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),darkMetal:Object.freeze({materialKey:"metal",baseColor:"#34393C",roughness:.48,metallic:.62,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#22282C",roughness:.16,metallic:.08,opacity:.86}),counter:Object.freeze({materialKey:"stone",baseColor:"#5F6467",roughness:.52,metallic:.04,opacity:1}),blue:Object.freeze({materialKey:"custom",baseColor:"#4E82A6",roughness:.64,metallic:0,opacity:1})});function ct(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Qi(n,e,t,i,s,r=void 0,a=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:a,radius:t,height:i,position:s,rotation:r}}function $p({width:n,height:e,depth:t}){let i=Math.max(e*.075,.032),s=Math.max(t*.05,.018),r=Math.max(s*.82,.014),a=s*1.05,o=[ct("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2]),ct("oven-front","front",[n*.94,e*.6,s],[0,-e*.12,t/2-s/2]),ct("controls","controls",[n*.94,e*.17,a],[0,e*.28,t/2-a/2]),ct("handle","handles",[n*.62,Math.max(e*.022,.012),r],[0,e*.12,t/2-r/2]),ct("worktop","top",[n,i,t],[0,e/2-i/2,0])];for(let c of[-n*.23,n*.23])for(let l of[-t*.22,t*.22])o.push(Qi("burner","cooktop",Math.min(n,t)*.105,Math.max(i*.15,.008),[c,e/2-.004,l]));return{parts:o,materialDefaults:{body:ot.paint,front:ot.front,controls:ot.screen,handles:ot.metal,top:ot.counter,cooktop:ot.darkMetal}}}function jp({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(i.bodyHeight??.28,e*.12),e*.62),r=Math.min(Math.max(i.chimneyHeight??.52,e-s),e-s/2),a=Math.min(Math.max(i.chimneyWidth??.3,n*.18),n*.72),o=Math.max(t*.025,.012);return{parts:[ct("hood","body",[n,s,t],[0,-e/2+s/2,0]),ct("rim","frame",[n*.82,Math.max(s*.1,.018),t],[0,-e/2+s*.08,0]),ct("chimney","body",[a,r,t*.42],[0,e/2-r/2,-t*.15]),ct("controls","controls",[n*.3,Math.max(s*.075,.014),o],[n*.25,-e/2+s*.72,t/2-o/2])],materialDefaults:{body:ot.metal,frame:ot.darkMetal,controls:ot.screen}}}function dl({width:n,height:e,depth:t},i="washingMachine"){let s=Math.max(e*.045,.028),r=Math.max(t*.055,.02),a=Math.max(r*.7,.018),o=i==="tumbleDryer"?n*.34:n*.25,c=Math.max(r*.78,.016),l=Math.max(r*.8,.018),u=[ct("body","body",[n,e-s,Math.max(t-r,.02)],[0,-s/2,-r/2]),ct("front","front",[n*.96,e*.92,r],[0,-s/2,t/2-r/2]),ct("top","top",[n,s,t],[0,e/2-s/2,0]),Qi("door","door",Math.min(n,e)*.31,a,[0,-e*.08,t/2-a/2],[Math.PI/2,0,0]),ct("display","display",[o,e*.1,c],[n*.22,e*.33,t/2-c/2]),Qi("control","handles",Math.max(n*.055,.022),l,[-n*.26,e*.33,t/2-l/2],[Math.PI/2,0,0])];if(i==="washerDryer"){let h=Math.max(r*.84,.018);u.push(ct("mode","display",[n*.18,Math.max(e*.018,.01),h],[n*.2,e*.24,t/2-h/2]))}else if(i==="tumbleDryer")for(let h=0;h<3;h+=1){let f=h*Math.PI*2/3,d=Math.max(r*.86,.018);u.push(ct("drum-vane","door",[n*.055,n*.018,d],[Math.cos(f)*n*.13,-e*.08+Math.sin(f)*n*.13,t/2-d/2]))}return{parts:u,materialDefaults:{body:ot.paint,front:ot.front,top:ot.paint,door:ot.glass,display:ot.screen,handles:ot.metal}}}function Zp({width:n,height:e,depth:t}){let i=Math.min(n,t)*.47,s=Math.max(e*.62,.045),r=Math.max(t*.1,.025),a=Math.max(i*.19,.035),o=[Math.max(n*.1,.028),Math.max(e*.28,.022),Math.max(t*.3,.07)];return{parts:[Qi("body","body",i,s,[0,-e/2+s/2,0]),ct("bumper","bumper",[n*.78,s*.68,r],[0,-e*.15,t*.43]),Qi("sensor","sensor",a,Math.max(e*.25,.02),[0,e*.3,-t*.1]),ct("left-wheel","wheels",o,[-n*.34,-e*.34,0]),ct("right-wheel","wheels",o,[n*.34,-e*.34,0])],materialDefaults:{body:ot.darkMetal,bumper:ot.darkMetal,sensor:ot.screen,wheels:ot.darkMetal}}}function Kp({width:n,height:e,depth:t}){let i=Math.max(t*.12,.018),s=Math.max(t*.1,.018),r=-e*.31,a=Math.max(n*.014,.01),o=[ct("body","body",[n*.96,e*.86,t*.82],[0,e*.04,-t*.05]),ct("front","front",[n*.9,e*.58,i],[0,e*.09,t/2-i/2]),ct("outlet","outlet",[n*.82,e*.18,s],[0,r,t/2-s/2])];for(let c=-3;c<=3;c+=1)o.push(ct("louver","louvers",[a,e*.13,Math.max(t*.035,.01)],[c*n*.105,r,t*.475]));return o.push(ct("controls","controls",[n*.12,e*.075,Math.max(t*.035,.01)],[n*.34,e*.17,t*.465])),o.push(ct("rear-frame","frame",[n*.58,e*.42,Math.max(t*.055,.012)],[0,e*.04,-t*.46])),{parts:o,materialDefaults:{body:ot.paint,front:ot.front,outlet:ot.screen,louvers:ot.darkMetal,controls:ot.screen,frame:ot.metal}}}function Jp({width:n,height:e,depth:t}){let i=e*.92,s=Math.max(t*.045,.018),r=Math.max(e*.045,.03),a=e*.08,o=Math.max(s*1.1,.02),c=[ct("body","body",[n*.94,i,t*.88],[0,-e/2+i/2,-t*.03]),ct("upper-front","front",[n*.88,e*.42,s],[0,e*.2,t/2-s/2]),ct("lower-front","front",[n*.88,e*.39,s],[0,-e*.255,t/2-s/2]),ct("controls","controls",[n*.24,e*.075,o],[n*.22,e*.3,t/2-o/2]),ct("foot","foot",[n*.82,r,t*.72],[0,-e/2+r/2,0])];for(let l of[-n*.22,0,n*.22])c.push(Qi("connection","connections",Math.max(n*.035,.018),a,[l,e/2-a/2,-t*.13]));return{parts:c,materialDefaults:{body:ot.paint,front:ot.front,controls:ot.screen,foot:ot.metal,connections:ot.metal}}}function Qp({width:n,height:e,depth:t}){let i=e*.74,s=-e/2+i/2,r=Math.max(t*.045,.022),a=Math.max(e*.035,.025),o=-e/2+i,c=e-i;return{parts:[ct("body","body",[n*.92,i,t*.88],[0,s,0]),ct("window","glass",[n*.62,i*.55,r],[0,s+i*.04,t/2-r/2]),ct("handle","handles",[n*.035,i*.38,r],[n*.29,s+i*.03,t/2-r/2]),ct("top","top",[n,a,t*.94],[0,o-a/2,0]),Qi("flue","flue",Math.min(n,t)*.13,c,[0,o+c/2,-t*.18])],materialDefaults:{body:ot.darkMetal,glass:ot.glass,handles:ot.metal,top:ot.darkMetal,flue:ot.darkMetal}}}function em({width:n,height:e,depth:t}){let i=Math.min(n,t),s=i*.52,r=i*.114,a=[Qi("motor","body",i*.156,e*.3,[0,e*.14,0])];for(let o=0;o<4;o+=1){let c=o*Math.PI/2,l=ct("blade","frame",[s,e*.072,r],[Math.cos(c)*i*.235,-e*.016,-Math.sin(c)*i*.235]);l.rotation=[0,-c,0],a.push(l)}return{parts:a,materialDefaults:{body:ot.metal,frame:ot.darkMetal}}}function tm({width:n,height:e,depth:t}){let i=e*.29,s=n*.55,r=(n-s)/2,a=[ct("base","body",[n*.92,e*.087,t*.92],[0,-e/2+e*.0435,0]),ct("stand","frame",[n*.104,e*.64,t*.104],[0,-e*.15,0]),ct("housing","body",[n,e*.36,t*.23],[0,i,0])];for(let o=0;o<3;o+=1){let c=o*Math.PI*2/3,l=ct("blade","frame",[s,e*.062,t*.19],[Math.cos(c)*r,i+Math.sin(c)*e*.12,t*.14]);l.rotation=[0,0,c],a.push(l)}return{parts:a,materialDefaults:{body:ot.metal,frame:ot.blue}}}var _n=Object.freeze({ceramic:Object.freeze({materialKey:"custom",baseColor:"#F0F0E8",roughness:.68,metallic:0,opacity:1}),seat:Object.freeze({materialKey:"custom",baseColor:"#E5E4DC",roughness:.62,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#B8BDBD",roughness:.24,metallic:.82,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#B8DBE3",roughness:.08,metallic:0,opacity:.24})});function $t(n,e,t,i){return{type:"box",name:n,slot:e,size:t,position:i}}function es(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function nm({width:n,height:e,depth:t}){let i=t*.3,s=e*.5,r=e*.42,a=Math.min(n*.46,t*.25);return{yawOffsetDegrees:180,parts:[$t("tank","ceramic",[n*.88,s,i],[0,e/2-s/2,-t/2+i/2]),$t("pedestal","ceramic",[n*.56,r,t*.38],[0,-e/2+r/2,t*.08]),es("bowl","ceramic",a,e*.24,[0,-e*.08,t*.15]),es("seat","seat",a*.92,Math.max(e*.035,.018),[0,e*.07,t*.15]),es("flush","handles",Math.max(n*.055,.02),Math.max(e*.018,.01),[0,e/2-.006,-t*.35])],materialDefaults:{ceramic:_n.ceramic,seat:_n.seat,handles:_n.metal}}}function im({width:n,height:e,depth:t}){let i=e*.58,s=e*.18,r=e*.2,a=-e/2+i+s;return{parts:[es("pedestal","ceramic",Math.min(n,t)*.22,i,[0,-e/2+i/2,-t*.08]),$t("basin","ceramic",[n,s,t*.84],[0,-e/2+i+s/2,0]),$t("basin-inset","basin",[n*.66,Math.max(s*.22,.018),t*.5],[0,-e/2+i+s*.74,t*.04]),es("faucet","fittings",Math.max(n*.018,.012),r,[n*.24,a+r/2,-t*.24]),$t("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.16,Math.min(a+r,e/2-.01),-t*.16])],materialDefaults:{ceramic:_n.ceramic,basin:_n.seat,fittings:_n.metal}}}function sm({width:n,height:e,depth:t}){let i=Math.max(e*.14,.055),s=Math.max(Math.min(n,t)*.075,.045),r=Math.max(t*.025,.014);return{parts:[$t("rear-side","ceramic",[n,e*.72,s],[0,-e*.14,-t/2+s/2]),$t("front-side","ceramic",[n,e*.72,s],[0,-e*.14,t/2-s/2]),$t("left-side","ceramic",[s,e*.72,t-s*2],[-n/2+s/2,-e*.14,0]),$t("right-side","ceramic",[s,e*.72,t-s*2],[n/2-s/2,-e*.14,0]),$t("tub","tub",[n-s*2,i,t-s*2],[0,-e/2+i/2,0]),$t("rear-rim","ceramic",[n,i,s],[0,e/2-i/2,-t/2+s/2]),es("faucet","fittings",r,e*.28,[n*.34,e*.34,-t*.33]),$t("spout","fittings",[n*.16,r*1.5,r*1.5],[n*.27,e*.41,-t*.28])],materialDefaults:{ceramic:_n.ceramic,tub:_n.seat,fittings:_n.metal}}}function rm({width:n,height:e,depth:t}){let i=Math.min(n,t),s=Math.min(Math.max(e*.035,.045),e*.12),r=Math.min(Math.max(i*.014,.01),.018),a=Math.min(Math.max(i*.02,.014),.026),o=Math.max(e-s,.08),c=-e/2+s+o/2,l=n*.43,u=[$t("tray","tub",[n,s,t],[0,-e/2+s/2,0]),$t("rear-glass","glass",[n*.96,o,r],[0,c,-t/2+r/2]),$t("side-glass","glass",[r,o,t*.96],[-n/2+r/2,c,0]),$t("front-glass","glass",[l,o,r],[n/2-l/2,c,t/2-r/2])];for(let f of[[-n/2+a/2,c,-t/2+a/2],[n/2-a/2,c,-t/2+a/2],[n/2-a/2,c,t/2-a/2]])u.push($t("post","frame",[a,o,a],f));u.push(es("drain","fittings",Math.min(Math.max(i*.055,.026),.05),Math.max(s*.16,.008),[n*.2,-e/2+s+Math.max(s*.08,.004),t*.18])),u.push(es("rail","fittings",Math.max(a*.44,.008),o*.58,[n*.27,-e/2+s+o*.48,-t/2+r*2.2])),u.push($t("shower-head","fittings",[n*.2,Math.max(a*.78,.012),t*.085],[n*.2,-e/2+s+o*.82,-t*.4]));let h=Math.max(r*1.35,.014);return u.push($t("handle","handles",[a,o*.18,h],[n*.22,c,t/2-h/2])),{parts:u,materialDefaults:{tub:_n.ceramic,glass:_n.glass,frame:_n.metal,fittings:_n.metal,handles:_n.metal}}}var fl=Object.freeze({pot:Object.freeze({materialKey:"custom",baseColor:"#9D7256",roughness:.82,metallic:0,opacity:1}),soil:Object.freeze({materialKey:"custom",baseColor:"#51402F",roughness:.96,metallic:0,opacity:1}),leaves:Object.freeze({materialKey:"custom",baseColor:"#64805E",roughness:.88,metallic:0,opacity:1}),ceramic:Object.freeze({materialKey:"custom",baseColor:"#B98568",roughness:.7,metallic:0,opacity:1})});function Da(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function iS(n,e,t,i,s,r){return{type:"sphere",name:n,slot:e,radius:t,scale:i,position:s,rotation:r}}function Ah({width:n,height:e,depth:t},i=!1){let s=e*(i?.24:.36),r=Math.min(n,t)*(i?.32:.38),a=i?11:7,o=-e/2+s*.78,c=e-s*.72,l=[Da("pot","pot",r,s,[0,-e/2+s/2,0]),Da("soil","soil",r*.86,Math.max(s*.08,.018),[0,-e/2+s*.92,0])];for(let u=0;u<a;u+=1){let h=u/a*Math.PI*2,f=u%3/2,d=Math.min(n,t)*(.16+f*.13),p=o+c*(.28+f*.24);l.push(iS("leaf","leaves",Math.min(n,t)*.18,[.55,i?1.35:1.05,.34],[Math.cos(h)*d,Math.min(p,e*.4),Math.sin(h)*d],[0,h,Math.cos(h)*.42]))}return{parts:l,materialDefaults:{pot:fl.pot,soil:fl.soil,leaves:fl.leaves}}}function am({width:n,height:e,depth:t}){let i=e*.7,s=e*.25;return{parts:[Da("body","ceramic",Math.min(n,t)*.46,i,[0,-e/2+i/2,0]),Da("neck","ceramic",Math.min(n,t)*.2,s,[0,e/2-s/2,0]),Da("lip","ceramic",Math.min(n,t)*.27,Math.max(e*.05,.018),[0,e/2-Math.max(e*.025,.009),0])],materialDefaults:{ceramic:fl.ceramic}}}var li=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),cabinetTop:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),stair:Object.freeze({materialKey:"wood",baseColor:"#A8835F",roughness:.7,metallic:0,opacity:1})});function Pn(n,e,t,i,s){return{type:"box",name:n,slot:e,size:t,position:i,rotation:s}}function Cs({width:n,height:e,depth:t},i={},s="3_seater"){if(s==="ottoman"){let b=e*.72,C=e-b;return{parts:[Pn("cushion","cushions",[n,b,t],[0,e/2-b/2,0]),Pn("base","body",[n*.94,C,t*.92],[0,-e/2+C/2,0])],materialDefaults:{cushions:li.fabric,body:li.fabric}}}let r=Math.min(Math.max(Number(i.leftExtensionLength)||0,0),3.5),a=Math.min(Math.max(Number(i.rightExtensionLength)||0,0),3.5),o=r>.05||a>.05,c=o?Math.min(t,.9):t,l=-t/2,u=l+c,h=(l+u)/2,f=Math.min(Math.max(n*.34,.62),1.05),d=e*.38,p=c*.2,x=n*.1,m=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),g=Math.max(e*.16,.035),w=Math.max(Math.min(n*.012,.018),.006),E=[Pn("seat","cushions",[n,d,c],[0,-e/2+d/2,h]),Pn("back","body",[n,e*.62,p],[0,e*.19,l+p/2]),Pn("left-arm","body",[x,e*.46,c],[-n/2+x/2,-e*.08,h]),Pn("right-arm","body",[x,e*.46,c],[n/2-x/2,-e*.08,h])];for(let b of[-n*.4,n*.4])for(let C of[h-c*.32,h+c*.32])E.push(Pn("leg","legs",[m,g,m],[b,-e/2+g/2,C]));let y=o?3:2;for(let b=1;b<y;b+=1){let C=-n/2+n*b/y;E.push(Pn("cushion-seam","cushions",[w,Math.max(d*.035,.006),c*.78],[C,-e/2+d+.003,h+c*.02]))}let T=(b,C)=>{if(C<=.05)return;let v=Math.min(Math.max(C,c),3.5),S=b==="left"?-n/2+f/2:n/2-f/2,P=l+v/2;E.push(Pn(\`\${b}-return\`,"cushions",[f,d,v],[S,-e/2+d/2,P])),E.push(Pn(\`\${b}-return-seam\`,"cushions",[f*.82,Math.max(d*.055,.012),v*.72],[S,-e/2+d+.004,P+v*.03]))};return T("left",r),T("right",a),{parts:E,materialDefaults:{body:li.fabric,cushions:li.fabric,legs:li.metal}}}function om({width:n,height:e,depth:t},i={}){let r=(O,U)=>Math.min(Math.max(Number(O)||U*.42,Math.min(.05,U/2)),Math.max(U-Math.min(.05,U/2),U/2)),a=r(i.leftLegLength,n),o=r(i.rightLegLength,t),c=[[-n/2,-t/2],[n/2,-t/2],[n/2,-t/2+o],[-n/2+a,t/2],[-n/2,t/2]],l=c[2],u=c[3],h=u[0]-l[0],f=u[1]-l[1],d=Math.hypot(h,f),p=[h/d,f/d],x=[p[1],-p[0]],m=[(l[0]+u[0])/2,(l[1]+u[1])/2],g=Math.min(Math.max(e*.06,.025),.08),w=Math.max(e-g,.02),E=Math.min(Math.max(Math.min(n,t)*.025,.014),.026),y=w*.9,T=-g/2,b=-Math.atan2(p[1],p[0]),C=[{type:"extrude",name:"body",slot:"body",outline:c,height:w,position:[0,-g/2,0]},{type:"extrude",name:"top",slot:"top",outline:c,height:g,position:[0,e/2-g/2,0]}],v=d*.44;for(let O of[-d*.225,d*.225]){let U=[m[0]+p[0]*O+x[0]*E/2,m[1]+p[1]*O+x[1]*E/2];C.push(Pn("front","front",[v,y,E],[U[0],T,U[1]],[0,b,0]))}let S=Math.min(Math.max(e*.18,.12),.3),P=Math.min(Math.max(d*.018,.01),.018),I=Math.min(Math.max(E*.55,.009),.014);for(let O of[-d*.055,d*.055]){let U=[m[0]+p[0]*O+x[0]*(E+I/2),m[1]+p[1]*O+x[1]*(E+I/2)];C.push(Pn("handle","handles",[P,S,I],[U[0],T,U[1]],[0,b,0]))}return{parts:C,materialDefaults:{body:li.cabinet,front:li.cabinetFront,top:li.cabinetTop,handles:li.metal}}}function cm({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(Math.round(Number(i.stepCount)||e/.18),2),30),r=i.direction==="down"?"down":"up",a=t/s,o=e/s,c=Math.min(Math.max(o*.22,.025),.055),l=[];for(let u=0;u<s;u+=1){let h=-t/2+a*(u+.5),f=r==="up"?h:-h,d=-e/2+o*(u+1)-c/2;l.push(Pn("tread","body",[n,c,a],[0,d,f]))}return{parts:l,materialDefaults:{body:li.stair}}}var sS=Object.freeze({sofa_basic:Object.freeze({variants:Object.freeze({default:(n,e)=>Cs(n,e,"default"),"2_seater":(n,e)=>Cs(n,e,"2_seater"),"3_seater":Pp,corner_left:(n,e)=>Cs(n,e,"corner_left"),corner_right:(n,e)=>Cs(n,e,"corner_right"),u_shaped:(n,e)=>Cs(n,e,"u_shaped"),ottoman:(n,e)=>Cs(n,e,"ottoman")})}),chair_basic:Object.freeze({variants:Object.freeze({dining:Dp,lounge:Fp,wooden:Up,cantilever:Bp})}),table_basic:Object.freeze({variants:Object.freeze({coffee:Eh,round:kp,rectangular:Eh})}),bed_basic:Object.freeze({variants:Object.freeze({single:wh,queen:wh})}),wardrobe:Object.freeze({variants:Object.freeze({default:Lp})}),nightstand:Object.freeze({variants:Object.freeze({default:n=>hl(n,"nightstand")})}),shelf:Object.freeze({variants:Object.freeze({default:zp})}),cabinet:Object.freeze({variants:Object.freeze({default:hl})}),cornerCabinet:Object.freeze({variants:Object.freeze({default:om})}),genericStorage:Object.freeze({variants:Object.freeze({default:hl})}),kitchenBase:Object.freeze({variants:Object.freeze({default:Op})}),kitchenTallUnit:Object.freeze({variants:Object.freeze({default:Hp})}),refrigerator:Object.freeze({variants:Object.freeze({default:Vp})}),stove:Object.freeze({variants:Object.freeze({default:$p})}),rangeHood:Object.freeze({variants:Object.freeze({default:jp})}),kitchenSink:Object.freeze({variants:Object.freeze({default:Wp})}),kitchenIsland:Object.freeze({variants:Object.freeze({default:Gp})}),tvLowboard:Object.freeze({variants:Object.freeze({default:Np})}),television:Object.freeze({variants:Object.freeze({default:Xp})}),robotVacuum:Object.freeze({variants:Object.freeze({default:Zp})}),ceilingFan:Object.freeze({variants:Object.freeze({default:em})}),standingFan:Object.freeze({variants:Object.freeze({default:tm})}),airConditioner:Object.freeze({variants:Object.freeze({default:Kp})}),heatPumpIndoorUnit:Object.freeze({variants:Object.freeze({default:Jp})}),fireplaceStove:Object.freeze({variants:Object.freeze({default:Qp})}),washerDryer:Object.freeze({variants:Object.freeze({default:n=>dl(n,"washerDryer")})}),washingMachine:Object.freeze({variants:Object.freeze({default:n=>dl(n,"washingMachine")})}),tumbleDryer:Object.freeze({variants:Object.freeze({default:n=>dl(n,"tumbleDryer")})}),toilet:Object.freeze({variants:Object.freeze({default:nm})}),bathroomSink:Object.freeze({variants:Object.freeze({default:im})}),bathtub:Object.freeze({variants:Object.freeze({default:sm})}),shower:Object.freeze({variants:Object.freeze({default:rm})}),straightStair:Object.freeze({variants:Object.freeze({default:cm})}),smallPlant:Object.freeze({variants:Object.freeze({default:n=>Ah(n,!1)})}),floorPlant:Object.freeze({variants:Object.freeze({default:n=>Ah(n,!0)})}),decorativeVase:Object.freeze({variants:Object.freeze({default:am})}),rug:Object.freeze({variants:Object.freeze({default:qp})}),genericObject:Object.freeze({variants:Object.freeze({default:Yp})})});function lm(n,e){return sS[n]?.variants?.[e]??null}var fm=Object.freeze({fabric:Object.freeze({roughness:.9,metallic:0}),wood:Object.freeze({roughness:.68,metallic:0}),metal:Object.freeze({roughness:.42,metallic:.72}),glass:Object.freeze({roughness:.18,metallic:0}),paint:Object.freeze({roughness:.84,metallic:0}),tile:Object.freeze({roughness:.62,metallic:0}),concrete:Object.freeze({roughness:.9,metallic:0}),stone:Object.freeze({roughness:.58,metallic:.02}),custom:Object.freeze({roughness:.7,metallic:0})}),Dn=256,um=Object.freeze({automatic:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"longestBoundary"}),tile:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),laminate:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),carpet:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"local"}),wood:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),fabric:Object.freeze({elementSize:.06,lineWidth:.001,orientation:"local"}),concrete:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),stone:Object.freeze({elementSize:.6,lineWidth:.003,orientation:"local"})});function xr(n){return Number(n).toFixed(6)}function rS(n){return n==="wallPaint"?"paint":Object.hasOwn(fm,n)?n:"custom"}function aS(n,e,t){let i=n?.pattern??e?.pattern,s=["wood","fabric","tile","concrete","stone"].includes(t)?t:null,r=i?.kind??s;if(!r||!Object.hasOwn(um,r))return null;let a=um[r];return{kind:r,elementSize:i?.elementSize??a.elementSize,lineWidth:i?.lineWidth??a.lineWidth,orientation:i?.orientation??a.orientation}}function hm(n={},e={}){let t=n?.materialKey??e?.materialKey??"custom",i=rS(t),s=fm[i],r={materialKey:i,baseColor:n?.baseColor??e?.baseColor??"#B8B3AA",roughness:n?.roughness??e?.roughness??s.roughness,metallic:n?.metallic??e?.metallic??s.metallic,opacity:n?.opacity??e?.opacity??1},a=aS(n,e,i);return a?{...r,pattern:a}:r}function pm(n){return n?[n.kind,xr(n.elementSize),xr(n.lineWidth),n.orientation].join(":"):"no-pattern"}function oS(n){return[n.materialKey,new Ke(n.baseColor).getHexString().toUpperCase(),pm(n.pattern)].join(":")}function cS(n,e){return[e.physical?"physical":"standard",n.materialKey,new Ke(n.baseColor).getHexString().toUpperCase(),xr(n.roughness),xr(n.metallic),xr(n.opacity),pm(n.pattern),xr(e.transmission??0),e.depthWrite===!1?"no-depth-write":"depth-write",e.side??Bn].join(":")}function Ch(n,e,t){let i=Math.imul(n+1,521288629)^Math.imul(e+1,1597334677)^t;return i=Math.imul(i^i>>>15,73244475),((i^i>>>16)>>>0)/4294967295}function lS(n){return Math.min(Math.max(n,0),1)}function Rh(n){let e=Math.max(n.elementSize,.001);switch(n.kind){case"laminate":return{x:Math.max(e*5.2,.72),z:e*2};case"wood":return{x:Math.max(e*5.2,.72),z:e};case"fabric":case"carpet":return{x:Math.min(e,.12),z:Math.min(e,.12)};case"automatic":return{x:1,z:e};default:return{x:e,z:e}}}function uS(n){let e=Rh(n);return{resolution:Dn,lineWidthMeters:n.lineWidth,lineWidthPixels:{x:n.lineWidth/e.x*Dn,z:n.lineWidth/e.z*Dn},antialiased:!0}}function Rs(n,e,t){let i=1/Dn,s=Math.max(t,0)/2,r=0;for(let a of e){let o=Math.abs(n-a),c=Math.min(o,1-o);r=Math.max(r,lS((s+i/2-c)/i))}return r}function hS(n,e,t){let i=Rh(n),s=n.lineWidth/i.x,r=n.lineWidth/i.z;switch(n.kind){case"automatic":return Rs(t,[0],r);case"tile":return Math.max(Rs(e,[0],s),Rs(t,[0],r));case"laminate":{let a=t<.5?0:1;return Math.max(Rs(t,[0,.5],r),Rs(e,[a===0?0:.5],s))}case"wood":return Math.max(Rs(e,[0],s),Rs(t,[0],r));default:return 0}}function pl(n,e,t){return Math.round(n+(e-n)*t)}function dS(n,e,t){let i=(e+.5)/Dn,s=(t+.5)/Dn,r=hS(n,i,s);switch(n.kind){case"automatic":return pl(255,226,r);case"tile":return pl(255,208,r);case"laminate":{let a=Math.sin((i*7.5+s*.7)*Math.PI*2)*.7,o=Math.sin((i*25+s*1.2)*Math.PI*2)*.35;return pl(Math.min(Math.round(254+a+o),255),228,r)}case"wood":{let a=Math.sin((i*8.5+s*.55)*Math.PI*2)*.65,o=Math.sin((i*29+s*1.1)*Math.PI*2)*.3,c=(Ch(Math.floor(e/4),t,194075)-.5)*.6;return pl(Math.min(Math.round(254+a+o+c),255),230,r)}case"fabric":case"carpet":{let a=e%6===2||t%6===2?-24:0,o=e%6===5||t%6===5?8:0;return 247+a+o}case"concrete":return Math.round(246-Ch(e,t,277015)*18);case"stone":{let a=Ch(Math.floor(e/3),Math.floor(t/3),597045),o=Math.abs(Math.sin((i*2.1+s*1.35)*Math.PI*2));return Math.round(246-a*12-(o<.055?20:0))}default:return 255}}function fS(n){let e=new Uint8Array(Dn*Dn*4);for(let i=0;i<Dn;i+=1)for(let s=0;s<Dn;s+=1){let r=Math.min(Math.max(dS(n,s,i),0),255),a=(i*Dn+s)*4;e[a]=r,e[a+1]=r,e[a+2]=r,e[a+3]=255}let t=new nr(e,Dn,Dn,xn,cn);return t.wrapS=xs,t.wrapT=xs,t.magFilter=Gt,t.minFilter=ri,t.generateMipmaps=!0,t.anisotropy=4,t.colorSpace=Kt,t.userData.portablePattern={...n},t.userData.meterPeriod=Rh(n),t.userData.portablePatternRaster=uS(n),t.needsUpdate=!0,t}function dm(n,e={},t=null){let i={color:n.baseColor,roughness:n.roughness,metalness:n.metallic,transparent:n.opacity<1,opacity:n.opacity,depthWrite:e.depthWrite??!0,side:e.side??Bn,map:t},s=e.physical?new ma({...i,transmission:e.transmission??0}):new Cn(i);return s.userData.materialKey=n.materialKey,s.userData.portableAppearance={...n},s}function Ei(){let n=new Map,e=new Map;function t(i){if(!i.pattern)return null;let s=oS(i);return e.has(s)||e.set(s,fS(i.pattern)),e.get(s)}return{material(i,s,r={}){let a=hm(i,s),o={...r,physical:r.physical??a.materialKey==="glass"},c=cS(a,o);return n.has(c)||n.set(c,dm(a,o,t(a))),n.get(c)},instance(i,s,r={}){let a=hm(i,s);return dm(a,{...r,physical:r.physical??a.materialKey==="glass"},t(a))}}}function mm(n){return Number(n).toFixed(6)}function Ih(){let n=new Map,e=Ei();return{boxGeometry(t){let i=\`box:\${t.map(mm).join(":")}\`;return n.has(i)||n.set(i,new Wt(...t)),n.get(i)},geometry(t){let i,s;switch(t.type){case"extrude":i=[t.height,...t.outline.flat()],s=()=>{let a=new qn;t.outline.forEach(([c,l],u)=>{u===0?a.moveTo(c,-l):a.lineTo(c,-l)}),a.closePath();let o=new bi(a,{depth:t.height,bevelEnabled:!1,steps:1});return o.translate(0,0,-t.height/2),o.rotateX(-Math.PI/2),o};break;case"cylinder":i=[t.radius,t.height,t.radialSegments??24],s=()=>new yi(t.radius,t.radius,t.height,t.radialSegments??24);break;case"sphere":i=[t.radius,t.widthSegments??20,t.heightSegments??14],s=()=>new Mi(t.radius,t.widthSegments??20,t.heightSegments??14);break;default:return this.boxGeometry(t.size)}let r=\`\${t.type}:\${i.map(mm).join(":")}\`;return n.has(r)||n.set(r,s()),n.get(r)},material(t){return e.material(t)}}}function pS(n,e,t){let i=t.appearance?.materialSlots??{},s=e.materialDefaults[n.slot]??e.materialDefaults[n.fallbackSlot]??{materialKey:"custom",baseColor:"#B8B3AA",roughness:.7,metallic:0,opacity:1},r=i[n.slot]??(n.fallbackSlot?i[n.fallbackSlot]:void 0);return{...s,...r}}function gm(n,e){n.userData.sceneObjectId=e.id,n.userData.sceneElementType="object",n.userData.kind=e.kind,n.userData.binding=e.binding??null,n.userData.assetKey=e.assetKey,n.userData.variantKey=e.variantKey}function xm(n,e,t=Ih()){let i=lm(e.assetKey,e.variantKey);if(!i)return console.warn(\`Mikonus interior asset \${e.assetKey}/\${e.variantKey} is not supported; skipping \${e.id}.\`),null;let s=e.dimensions,r=i(s,e.parameters??{}),a=new yt;a.position.set(e.position.x,e.position.y,e.position.z),a.rotation.y=ht.degToRad(e.rotation.y),gm(a,e),a.userData.anchor="groundCenter",a.userData.forwardAxis="+Z",a.userData.dimensions={...s},a.userData.recipeYawOffsetDegrees=r.yawOffsetDegrees??0;let o=new yt;o.rotation.y=ht.degToRad(r.yawOffsetDegrees??0),a.add(o);for(let c of r.parts){let l=new gt(t.geometry(c),t.material(pS(c,r,e)));l.name=\`\${e.assetKey}:\${c.name}\`,l.position.set(c.position[0],c.position[1]+s.height/2,c.position[2]),c.rotation&&l.rotation.set(...c.rotation),c.scale&&l.scale.set(...c.scale),gm(l,e),l.userData.materialSlot=c.slot,l.userData.recipePart=c.name,o.add(l)}return n.add(a),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:a,pickables:[],visual:{type:"furniture",assetKey:e.assetKey,variantKey:e.variantKey,pathMotionRoot:o}}}function vr(n,e,t,i){return{type:"box",name:n,role:e,size:t,position:i}}function Qt(n,e,t,i,s,r=void 0){return{type:"cylinder",name:n,role:e,radius:t,height:i,position:s,rotation:r}}function mS(n,e,t,i){return{type:"sphere",name:n,role:e,radius:t,position:i}}function gS(n,e,t,i,s,r){return{type:"frustum",name:n,role:e,topRadius:t,bottomRadius:i,height:s,position:r}}function xS(n){let e=Math.min(n.width,n.depth),t=Math.max(n.height*.2,.018),i=Math.max(n.height*.42,.035),s=Math.max(n.height*.22,.018);return[Qt("mount","body",e*.3,t,[0,n.height/2-t/2,0]),Qt("shade","body",e*.48,i,[0,n.height*.05,0]),Qt("diffuser","diffuser",e*.41,s,[0,-n.height/2+s/2,0])]}function La(n,e,t=1){let i=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),s=Math.max(n.height*.045,.025),r=t===1?Math.min(n.width*.42,n.depth):n.width*.88,a=n.height*.43-i,o=Math.max(n.height*.14,.08),c=Math.min(n.depth*.44,n.width/(t*2.35)),l=(e.shadeDiameter??.35)/2,u=Math.min(c,Math.max(l,c*.72)),h=Math.max(n.width-u*2.25,0),f=[vr("mount","body",[r,s,n.depth*.58],[0,n.height/2-s/2,0])];for(let d=0;d<t;d+=1){let p=t===1?.5:d/(t-1),x=-h/2+h*p,m=Math.max(o*.16,.012);f.push(Qt(\`cable-\${d}\`,"body",Math.max(n.width*.007,.006),i,[x,n.height/2-s-i/2,0])),f.push(Qt(\`shade-\${d}\`,"body",u,o,[x,a,0])),f.push(Qt(\`diffuser-\${d}\`,"diffuser",u*.82,m,[x,a-o/2+m/2,0]))}return f}function vS(n,e){let t=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),i=Math.max(n.height*.045,.025),s=n.height*.43-t,r=Math.max(n.height*.075,.045),a=Math.max(r*.22,.012);return[vr("mount","body",[n.width*.42,i,n.depth*.62],[0,n.height/2-i/2,0]),Qt("cable-left","body",.006,t,[-n.width*.34,n.height/2-i-t/2,0]),Qt("cable-right","body",.006,t,[n.width*.34,n.height/2-i-t/2,0]),vr("bar","body",[n.width,r,n.depth*.72],[0,s,0]),vr("diffuser","diffuser",[n.width*.94,a,n.depth*.56],[0,s-r/2+a/2,0])]}function _S(n,e){let t=Math.max(Math.min(n.width,n.depth),.12),i=Math.max(n.height,.3),s=Number.isFinite(e.shadeDiameter)?e.shadeDiameter:t*.9,a=Math.min(Math.max(s,t*.82),t)/2,o=a*.64,c=Math.min(Math.max(i*.3,.24),i*.38),l=i/2-c/2-i*.025,u=Math.max(n.height*.035,.025),h=l+c*.16,f=-n.height/2+u;return[Qt("base","body",n.width*.38,u,[0,-n.height/2+u/2,0]),Qt("stem","body",Math.max(n.width*.025,.009),Math.max(h-f,.12),[0,(h+f)/2,0]),gS("shade","shade",o,a,c,[0,l,0]),mS("diffuser","diffuser",Math.max(o*.5,.045),[0,l-c*.08,0])]}function yS(n,e){let t=Math.max(n.height*.035,.025),i=n.height*.28,s=n.height/2-i/2,r=Math.min(e.shadeDiameter??.35,Math.min(n.width,n.depth))/2;return[Qt("base","body",n.width*.38,t,[0,-n.height/2+t/2,0]),Qt("stem","body",Math.max(n.width*.025,.009),n.height*.62,[0,-n.height*.13,0]),Qt("shade","shade",r,i,[0,s,0]),Qt("diffuser","diffuser",Math.max(r*.45,.035),Math.max(i*.28,.02),[0,s-i*.14,0])]}function bS(n){let e=Math.max(n.depth*.18,.018),t=n.depth*.62,i=Math.max(n.depth*.16,.016);return[vr("mount","body",[n.width*.58,n.height*.58,e],[0,0,-n.depth/2+e/2]),Qt("shade","body",Math.min(n.width,n.height)*.44,t,[0,0,-n.depth/2+e+t/2],[Math.PI/2,0,0]),Qt("diffuser","diffuser",Math.min(n.width,n.height)*.34,i,[0,0,n.depth/2-i/2],[Math.PI/2,0,0])]}function MS(n){let e=n.height*.32;return[Qt("shade","body",Math.min(n.width,n.depth)*.48,n.height,[0,0,0]),Qt("diffuser","diffuser",Math.min(n.width,n.depth)*.32,e,[0,-n.height/2+e/2,0])]}function SS(n,e){let t=Math.max(e.stripThickness??.025,.008);return[vr("strip","diffuser",[Math.max(n.width-Math.min(n.width*.2,.008),.008),t,t],[0,0,0])]}var ES=Object.freeze({ceilingLight:(n,e)=>xS(n,e),pendantLight:(n,e)=>La(n,e,1),pendantSpot1:(n,e)=>La(n,e,1),pendantSpot2:(n,e)=>La(n,e,2),pendantSpot3:(n,e)=>La(n,e,3),pendantSpot4:(n,e)=>La(n,e,4),pendantLED:vS,floorLamp:_S,tableLamp:yS,wallLight:(n,e)=>bS(n,e),recessedSpot:(n,e)=>MS(n,e),ledStrip:SS});function vm(n,e,t={}){let i=ES[n];return i?i(e,t):null}var Oa=2,ts=Object.freeze({hemisphere:Object.freeze({skyColor:16776179,groundColor:8358552,intensity:.82}),key:Object.freeze({color:16773852,intensity:2.15,direction:Object.freeze({x:-.48,y:1,z:.62})}),fill:Object.freeze({color:12177646,intensity:.24,direction:Object.freeze({x:.72,y:.62,z:-.58})}),globalShadow:Object.freeze({mapSize:2048,bias:-35e-5,normalBias:.025,radius:3})});function ym(n){n.shadowMap.enabled=!0,n.shadowMap.type=Ss,n.shadowMap.autoUpdate=!1,n.shadowMap.needsUpdate=!0}function Dh(n,e){n.shadowMap.enabled=e,n.shadowMap.needsUpdate=e}function Ph(n){return n?(n.userData.dashboardBaseIntensity??=n.intensity,n.userData.dashboardBaseIntensity):0}function bm(n){let e=n.userData.dashboardAmbientBrightnessFactor??1,t=n.userData.dashboardEnvironmentIntensityFactor??1;n.intensity=Ph(n)*e*t}function Lh(n,e){let t=n?.hemisphere;t&&(t.userData.dashboardAmbientBrightnessFactor=Number.isFinite(e)?Math.max(e,0):1,bm(t))}function Mm(n,e){if(!n||!e)return;let t=e.ambientIntensityFactor??1,i=e.keyIntensityFactor??1,s=e.fillIntensityFactor??1;n.hemisphere&&(n.hemisphere.userData.dashboardEnvironmentIntensityFactor=t,bm(n.hemisphere)),n.keyLight&&(n.keyLight.intensity=Ph(n.keyLight)*i),n.fillLight&&(n.fillLight.intensity=Ph(n.fillLight)*s)}function Oh(n,e,t){let i=Number.isFinite(t)?Math.min(Math.max(t,0),1):1;n?.keyLight?.shadow&&(n.keyLight.shadow.intensity=i)}function ml(n,e,t){n?.keyLight&&(n.keyLight.castShadow=t);for(let i of e?.values?.()??[]){let s=i.visual?.light;s?.isLight&&(s.castShadow=!1)}}function wS(n){return(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean)}function _m(n){return wS(n).some(e=>e.transparent===!0&&e.opacity<.98||e.transmission>0)}function TS(n){n.traverse(e=>{if(!e.isMesh)return;if(e.userData.isPhysicalLightOccluder){e.castShadow=!0,e.receiveShadow=!1;return}if(e.userData.isPickProxy){e.castShadow=!1,e.receiveShadow=!1;return}let t=e.userData.sceneElementType==="room",i=e.userData.lightRole==="diffuser";e.castShadow=!t&&!i&&!_m(e),e.receiveShadow=!_m(e)})}function AS(n){n.updateWorldMatrix(!0,!0);let e=new tn,t=new tn;return n.traverse(i=>{!i.isMesh||i.userData.isPhysicalLightOccluder||e.union(t.setFromObject(i))}),e.isEmpty()&&(e.min.set(-1,0,-1),e.max.set(1,2,1)),e}function CS(n,e){let t=e.getCenter(new D),i=e.getSize(new D),s=Math.max(Math.hypot(i.x,i.z)/2+.65,1.5),r=ts.key.direction;n.position.set(t.x+r.x*s,e.max.y+r.y*s,t.z+r.z*s),n.target.position.set(t.x,e.min.y+Math.min(i.y*.28,.75),t.z);let a=n.shadow.camera;return a.left=-s,a.right=s,a.top=s,a.bottom=-s,a.near=.1,a.far=s*3.4+i.y,a.updateProjectionMatrix(),{bounds:e,center:t,horizontalRadius:s}}function Sm(n,e){TS(e);let t=AS(e),i=ts.hemisphere,s=new xa(i.skyColor,i.groundColor,i.intensity);s.name="DashboardAmbientHemisphere",n.add(s);let r=ts.key,a=new cr(r.color,r.intensity);a.name="DashboardShadowKey",a.castShadow=!0,a.shadow.mapSize.setScalar(ts.globalShadow.mapSize),a.shadow.bias=ts.globalShadow.bias,a.shadow.normalBias=ts.globalShadow.normalBias,a.shadow.radius=ts.globalShadow.radius,n.add(a,a.target);let o=CS(a,t),c=ts.fill,l=new cr(c.color,c.intensity);return l.name="DashboardSkyFill",l.castShadow=!1,l.position.set(o.center.x+c.direction.x*o.horizontalRadius,t.max.y+c.direction.y*o.horizontalRadius,o.center.z+c.direction.z*o.horizontalRadius),l.target.position.copy(o.center),n.add(l,l.target),{hemisphere:s,keyLight:a,fillLight:l,shadowFit:o}}var RS=4,IS=512,Em=Object.freeze({ceilingLight:Object.freeze({intensity:54,distance:5,inner:26,outer:76,priority:9}),pendantLight:Object.freeze({intensity:44,distance:4.8,inner:30,outer:78,priority:8}),pendantSpot1:Object.freeze({intensity:56,distance:4.2,inner:14,outer:44,priority:10}),pendantSpot2:Object.freeze({intensity:58,distance:4.8,inner:24,outer:70,priority:10}),pendantSpot3:Object.freeze({intensity:62,distance:5,inner:26,outer:78,priority:10}),pendantSpot4:Object.freeze({intensity:66,distance:5.2,inner:28,outer:84,priority:10}),pendantLED:Object.freeze({intensity:48,distance:4.6,inner:34,outer:82,priority:8}),floorLamp:Object.freeze({intensity:30,distance:4,inner:72,outer:124,priority:6}),tableLamp:Object.freeze({intensity:22,distance:2.8,inner:34,outer:82,priority:5}),wallLight:Object.freeze({intensity:38,distance:3.6,inner:26,outer:74,priority:7,direction:"forward"}),recessedSpot:Object.freeze({intensity:52,distance:4,inner:14,outer:42,priority:10}),ledStrip:Object.freeze({intensity:26,distance:2.8,inner:46,outer:104,priority:5})}),PS=Em.ceilingLight;function Nh(n){return n.reduce((e,t)=>e+t,0)/Math.max(n.length,1)}function wm(n,e,t,i){let s=Em[e]??PS,r=i.filter(h=>h.role==="diffuser"),a=r.length>0?r:i,o=new D(Nh(a.map(h=>h.position[0])),Nh(a.map(h=>h.position[1]+t/2)),Nh(a.map(h=>h.position[2]))),c=s.direction==="forward"?new D(0,0,1):new D(0,-1,0);o.addScaledVector(c,.035);let l=new va(16777215,0,s.distance,ht.degToRad(s.outer/2),.68,2);l.name=\`DashboardSmartLight:\${e}\`,l.position.copy(o),l.castShadow=!1,l.shadow.mapSize.setScalar(IS),l.shadow.bias=-45e-5,l.shadow.normalBias=.025,l.shadow.camera.near=.03,l.shadow.camera.far=s.distance,l.shadow.camera.layers.enable(Oa),l.userData.smartLightProfile=s,l.userData.selectedForIllumination=!1;let u=new zt;return u.name=\`DashboardSmartLightTarget:\${e}\`,u.position.copy(o).add(c),l.target=u,n.add(l,u),{light:l,target:u,profile:s}}function Fh(n,e=RS){let t=[...n.values()].filter(s=>s.kind==="light"&&s.visual?.type==="light"&&s.visual.lightState?.known&&s.visual.lightState.on&&s.visual.lightState.brightness>.001).sort((s,r)=>{let a=s.visual.lightProfile.priority+s.visual.lightState.brightness;return r.visual.lightProfile.priority+r.visual.lightState.brightness-a||s.id.localeCompare(r.id)}),i=new Set(t.slice(0,e).map(s=>s.id));for(let s of n.values()){if(s.kind!=="light"||s.visual?.type!=="light")continue;let{light:r,lightProfile:a,lightState:o}=s.visual,c=i.has(s.id);r.userData.selectedForIllumination=c,r.castShadow=!1,r.intensity=c?a.intensity*o.brightness**2:0}return i}var{DOLLHOUSE_WALL_HEIGHT:kh,buildWallPanels:DS,collectWallOpenings:LS,joinedWallPanel:OS,resolveWallPresentation:NS,resolveWallJoinTopology:Am,roundedCornerFootprint:Uh,wallFrame:FS}=Tm.default,zn=Object.freeze({height:.055,overhang:.018,color:2434081}),US=.075,wi={floor:15262682,wall:16250352,sofa:8559003,wood:11041109,darkWood:5588026,kitchen:14209736,counter:5988967,metal:9147029,rug:12101775,green:7901816,pot:10318422,hob:1975079,fridge:11449783,door:12094306,window:10405330,lampOff:14209724,lampOn:16766044,unavailable:9410201},BS={hob:{roughness:.35,metalness:.2},metal:{roughness:.6,metalness:.15},window:{roughness:.25,metalness:.08,transparent:!0,opacity:.62}};function kS(n,e={}){let t=BS[n]??{};return new Cn({color:wi[n]??wi.wall,roughness:e.roughness??t.roughness??.82,metalness:e.metalness??t.metalness??0,transparent:e.transparent??t.transparent??!1,opacity:e.opacity??t.opacity??1})}function yr(n){return ht.degToRad(n)}function Nt(n,e,t){n.userData.sceneObjectId=e.id,n.userData.sceneElementType=t,n.userData.kind=e.kind??t,n.userData.binding=e.binding??null}function zS(n,e="local"){if(e!=="longestBoundary"||n.length<2)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let t={x:1,z:0},i=0;if(n.forEach((a,o)=>{let c=n[(o+1)%n.length],l={x:c.x-a.x,z:c.z-a.z},u=l.x*l.x+l.z*l.z;u>i&&(t=l,i=u)}),i<=1e-6)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let s=Math.sqrt(i),r={x:t.x/s,z:t.z/s};return(r.x<-1e-4||Math.abs(r.x)<=1e-4&&r.z<0)&&(r={x:-r.x,z:-r.z}),{xAxis:r,zAxis:{x:-r.z,z:r.x}}}function HS(n,e,t){let i=t.map?.userData?.portablePattern,s=t.map?.userData?.meterPeriod;if(!i||!s)return null;let r=zS(e,i.orientation),a=n.getAttribute("position"),o=new Float32Array(a.count*2);for(let c=0;c<a.count;c+=1){let l=a.getX(c),u=a.getZ(c);o[c*2]=(l*r.xAxis.x+u*r.xAxis.z)/s.x,o[c*2+1]=(l*r.zAxis.x+u*r.zAxis.z)/s.z}return n.setAttribute("uv",new fn(o,2)),r}function VS(n,e,t=Ei()){let i=new qn;e.polygon.forEach((c,l)=>{l===0?i.moveTo(c.x,-c.z):i.lineTo(c.x,-c.z)}),i.closePath();let s=new pa(i);s.rotateX(-Math.PI/2);let r=t.material(e.material,{materialKey:"custom",baseColor:"#E8E3DA",roughness:.88,metallic:0,opacity:1}),a=HS(s,e.polygon,r),o=new gt(s,r);return o.position.y=e.elevation,o.userData.floorThickness=e.floorThickness,a&&(o.userData.floorPatternAlignment=a),Nt(o,e,"room"),n.add(o),o}function GS(n){let e=[...n.rooms.map(i=>i.elevation-US/2),...n.walls.map(i=>i.baseY)].filter(Number.isFinite),t=e.length>0?Math.min(...e):0;return{...n,foundationBaseY:t,walls:n.walls.map(i=>({...i,authoredBaseY:i.baseY,baseY:t}))}}function Cm(n,e,t){let i=n/2,s=e/2,r=Math.min(Math.max(t,.001),i,s),a=new qn;return a.moveTo(-i+r,-s),a.lineTo(i-r,-s),a.quadraticCurveTo(i,-s,i,-s+r),a.lineTo(i,s-r),a.quadraticCurveTo(i,s,i-r,s),a.lineTo(-i+r,s),a.quadraticCurveTo(-i,s,-i,s-r),a.lineTo(-i,-s+r),a.quadraticCurveTo(-i,-s,-i+r,-s),a.closePath(),a}function WS(n,e){let t=Math.min(zn.height*.45,e*.22),i=new bi(Cm(e,zn.height,t),{depth:n,bevelEnabled:!1,steps:1,curveSegments:5});return i.translate(0,0,-n/2),i.rotateY(Math.PI/2),i}function XS(n,e){let t={materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1},i=e.material(n.materials?.body,t),s=e.material(n.materials?.positiveSide,t),r=e.material(n.materials?.negativeSide,t);return{body:i,positive:s,negative:r,box:[i,i,i,i,s,r]}}function qS(n,e,t={doors:[],windows:[]},i,s=Ei()){let r=FS(e),a=LS(t,e),o=DS(e,a),c=i??Am(t.walls??[e]),l=new yt;Nt(l,e,"wall"),l.userData.authoredBaseY=e.authoredBaseY??e.baseY,l.userData.foundationBaseY=e.baseY,l.userData.physicalHeight=e.height,l.userData.presentationHeight=Math.min(e.height,kh),l.userData.lightOccluderPanels=[];let u=XS(e,s),h=new wn({color:zn.color}),f=new wn({color:0,colorWrite:!1,depthWrite:!1});for(let d of o){let p=OS(d,e,c),x=NS(p,e.height);l.userData.lightOccluderPanels.push(...x.lightOccluderPanels.map(b=>({...b})));let m=Math.abs(d.minimumOffset)<=.003,g=Math.abs(d.maximumOffset-r.length)<=.003,w=m&&c.joinedEndpoints.has(\`\${e.id}:start\`),E=g&&c.joinedEndpoints.has(\`\${e.id}:end\`),y=w?0:zn.overhang,T=E?0:zn.overhang;for(let b of x.visiblePanels){let C=new gt(new Wt(b.width,b.height,e.thickness),u.box);C.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.userData.wallPart="body",C.userData.physicalWallHeight=e.height,Nt(C,e,"wall");let v=b.width+y+T,S=new gt(WS(v,e.thickness+zn.overhang*2),h);S.position.set((T-y)/2,b.height/2+zn.height/2-Math.min(zn.height*.22,.012),0),S.userData.wallPart="cap",Nt(S,e,"wall"),C.add(S),l.add(C)}for(let b of x.lightOccluderPanels){let C=new gt(new Wt(b.width,b.height,e.thickness),f);C.name=\`PhysicalWallOccluder:\${e.id}\`,C.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),C.rotation.y=-Math.atan2(r.direction.z,r.direction.x),C.layers.set(Oa),C.castShadow=!0,C.receiveShadow=!1,C.userData.wallPart="physical-light-occluder",C.userData.isPhysicalLightOccluder=!0,C.userData.excludeFromCameraFit=!0,Nt(C,e,"wall"),l.add(C)}}return n.add(l),l}function Bh(n,e){let t=new qn;n.forEach((s,r)=>{r===0?t.moveTo(s.x,-s.z):t.lineTo(s.x,-s.z)}),t.closePath();let i=new bi(t,{depth:e,bevelEnabled:!1,steps:1});return i.rotateX(-Math.PI/2),i}function YS(n,e,t=Ei()){let i=[];for(let[s,r]of e.roundedCorners.entries()){let a=[r.first.wall,r.second.wall].sort((f,d)=>f.id.localeCompare(d.id))[0],o=new yt;o.name=\`rounded-wall-corner-\${s}\`,o.userData.roundedWallIds=[r.first.wall.id,r.second.wall.id],o.userData.physicalHeight=r.height,o.userData.presentationHeight=Math.min(r.height,kh),Nt(o,a,"wall");let c=Math.min(r.height,kh),l=new gt(Bh(Uh(r),c),t.material(a.materials?.body,{materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1}));l.position.y=r.elevation,l.userData.wallPart="rounded-corner-body",Nt(l,a,"wall");let u=new gt(Bh(Uh(r,zn.overhang),zn.height),new wn({color:zn.color}));u.position.y=r.elevation+c-Math.min(zn.height*.22,.012),u.userData.wallPart="rounded-corner-cap",Nt(u,a,"wall"),o.add(l,u);let h=r.height-c;if(h>=.04){let f=new gt(Bh(Uh(r),h),new wn({color:0,colorWrite:!1,depthWrite:!1}));f.name=\`PhysicalRoundedWallOccluder:\${s}\`,f.position.y=r.elevation+c,f.layers.set(Oa),f.castShadow=!0,f.receiveShadow=!1,f.userData.wallPart="physical-rounded-light-occluder",f.userData.isPhysicalLightOccluder=!0,f.userData.excludeFromCameraFit=!0,Nt(f,a,"wall"),o.add(f)}n.add(o),i.push(o)}return i}function $S(n,e){let{width:t,depth:i,height:s}=e.size,r;e.shape==="cylinder"?(r=new yi(.5,.5,s,18),r.scale(t,1,i)):e.shape==="ellipsoid"?(r=new Mi(.5,18,12),r.scale(t,s,i)):r=new Wt(t,s,i);let a=new gt(r,kS(e.appearance));return a.position.set(e.position.x,e.position.y+s/2,e.position.z),a.rotation.y=yr(e.rotation.y),Nt(a,e,"object"),n.add(a),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:a,pickables:e.kind==="light"?[a]:[]}}function jS(n,e){let t=n.type==="box"?n.size:n.type==="sphere"?[n.radius]:n.type==="frustum"?[n.topRadius,n.bottomRadius,n.height]:[n.radius,n.height],i=\`\${n.type}:\${t.map(r=>Number(r).toFixed(6)).join(":")}\`;if(e.has(i))return e.get(i);let s;switch(n.type){case"box":s=new Wt(...n.size);break;case"sphere":s=new Mi(n.radius,24,16);break;case"frustum":s=new yi(n.topRadius,n.bottomRadius,n.height,32,1,!0);break;default:s=new yi(n.radius,n.radius,n.height,24);break}return e.set(i,s),s}function ZS(n,e,t=new Map){let i=e.visualType??(e.appearance==="table-lamp"?"tableLamp":"floorLamp"),s=vm(i,e.size,e.parameters);if(!s)return console.warn(\`Mikonus light visual type \${i} is not supported; skipping \${e.id}.\`),null;let r=new yt;r.position.set(e.position.x,e.position.y,e.position.z),r.rotation.y=yr(e.rotation.y),Nt(r,e,"object");let{width:a,height:o,depth:c}=e.size,l=new Cn({color:5984585,roughness:.62,metalness:.18}),u=new Cn({color:wi.lampOff,emissive:0,emissiveIntensity:0,roughness:.45}),h=new Cn({color:12819559,emissive:0,emissiveIntensity:0,roughness:.75,side:sn}),f=[];for(let x of s){let m=x.role==="diffuser"?u:x.role==="shade"?h:l,g=new gt(jS(x,t),m);g.name=\`\${i}:\${x.name}\`,g.position.set(x.position[0],x.position[1]+o/2,x.position[2]),x.rotation&&g.rotation.set(...x.rotation),g.userData.recipePart=x.name,g.userData.lightRole=x.role,Nt(g,e,"object"),r.add(g),f.push(g)}let d=wm(r,i,o,s),p=[];if(e.binding){let x=new wn({side:sn});x.visible=!1;let m=new gt(new Mi(1,12,8),x);m.position.y=o/2,m.scale.set(Math.max(a*.65,.24),Math.max(o*.5,.24),Math.max(c*.65,a*.65,.24)),m.userData.isPickProxy=!0,Nt(m,e,"object"),r.add(m),p.push(m,...f)}return n.add(r),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:r,pickables:p,visual:{type:"light",visualType:i,bulbMaterial:u,shadeMaterial:h,emissiveMaterials:[u],bodyMaterials:[l,h],light:d.light,lightTarget:d.target,lightProfile:d.profile,lightState:null}}}function KS(n,e,t,i){return e.kind==="light"?ZS(n,e,i):e.assetKey?xm(n,e,t):$S(n,e)}function JS(n){let e=[],t=new Set;for(let i of n)if(i.binding){for(let s of i.pickables??[])t.has(s)||(t.add(s),e.push(s));i.root.traverse(s=>{!s.isMesh||t.has(s)||s.userData.excludeFromDevicePicking||(t.add(s),e.push(s))})}return e}function _r(n,e,t,i,s,r,a){let o=new gt(e,t);return o.position.set(...i),o.userData.architectureRole=a,Nt(o,s,r),n.add(o),o}function Na({parent:n,width:e,height:t,depth:i,thickness:s,material:r,description:a,elementType:o,role:c,offsetX:l=0,offsetY:u=0}){let h=new Wt(s,t,i),f=new Wt(e,s,i);return[_r(n,h,r,[l+s/2,u+t/2,0],a,o,c),_r(n,h,r,[l+e-s/2,u+t/2,0],a,o,c),_r(n,f,r,[l+e/2,u+s/2,0],a,o,c),_r(n,f,r,[l+e/2,u+t-s/2,0],a,o,c)]}function QS(n,e,t,i){let s=new bi(Cm(n,e,i),{depth:t,bevelEnabled:!1,steps:1,curveSegments:5});return s.translate(0,0,-t/2),s.userData.cornerRadius=i,s}function eE(n,e,t,i=Ei()){let s=new yt;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=yr(e.rotation.y),Nt(s,e,"door");let{width:r,depth:a,height:o}=e.size,c=Math.min(Math.max(Math.min(r,o)*.075,.025),.055),l=Math.max(a,.018)+.012,u=Math.max(t?.thickness??0,a,l),h=Math.min(c,.025),f=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),d={materialKey:"wood",baseColor:"#BBAA88",roughness:.86,metallic:0,opacity:1},p=i.material(e.materials?.frame,d),x=i.instance(e.materials?.panel,d),m=x.color.getHex(),g=new yt;g.name="DoorReveal",g.userData.architectureRole="door-reveal",Nt(g,e,"door"),Na({parent:g,width:r,height:o,depth:u,thickness:h,material:f,description:e,elementType:"door",role:"door-reveal"}),s.add(g);let w=new yt;w.name="DoorFrame",w.userData.architectureRole="door-frame",Nt(w,e,"door"),Na({parent:w,width:r,height:o,depth:l,thickness:c,material:p,description:e,elementType:"door",role:"door-frame"}),s.add(w);let E=new yt;E.name="DoorLeaf",E.userData.architectureRole="door-leaf-hinge",Nt(E,e,"door");let y=_r(E,QS(r,o,Math.max(a,.018),.008),x,[r/2,o/2,0],e,"door","door-leaf");return s.add(E),n.add(s),{id:e.id,elementType:"door",kind:"door",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:E,panelMaterial:x,frameMaterial:p,baseColor:m,stateMaterials:[{material:y.material,baseColor:m}],closedAngle:0,openAngle:yr(e.openAngle)}}}function tE(n,e,t,i=Ei()){let s=new yt;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=yr(e.rotation.y),Nt(s,e,"window");let{width:r,depth:a,height:o}=e.size,c=Math.min(Math.max(Math.min(r,o)*.075,.025),.055),l=Math.max(a,.014)+.012,u=Math.max(t?.thickness??0,a,l),h=Math.min(c,.025),f=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),d=i.material(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),p=i.instance(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),x=i.instance(e.materials?.panel,{materialKey:"glass",baseColor:"#B8CCD1",roughness:.36,metallic:0,opacity:.3},{physical:!0,transmission:.22,depthWrite:!1,side:sn});Object.assign(x,{depthWrite:!1,side:sn});let m=x.color.getHex(),g=p.color.getHex(),w=new yt;w.name="WindowReveal",w.userData.architectureRole="window-reveal",Nt(w,e,"window"),Na({parent:w,width:r,height:o,depth:u,thickness:h,material:f,description:e,elementType:"window",role:"window-reveal"}),s.add(w);let E=new yt;E.name="WindowFrame",E.userData.architectureRole="window-frame",Nt(E,e,"window"),Na({parent:E,width:r,height:o,depth:l,thickness:c,material:d,description:e,elementType:"window",role:"window-frame"}),s.add(E);let y=new yt;y.name="WindowSash",y.userData.architectureRole="window-sash",Nt(y,e,"window");let T=c,b=Math.max(r-T*2,c),C=Math.max(o-T*2,c),v=Math.min(Math.max(c*.58,.014),.028),S=Math.max(a,.014)+.006,P=Na({parent:y,width:b,height:C,depth:S,thickness:v,material:p,description:e,elementType:"window",role:"window-sash-frame",offsetX:T,offsetY:T}),I=Math.max(b-v*2,.01),O=Math.max(C-v*2,.01),U=_r(y,new Wt(I,O,Math.min(Math.max(a,.008),.022)),x,[r/2,o/2,0],e,"window","window-glass");return U.renderOrder=1,s.add(y),n.add(s),{id:e.id,elementType:"window",kind:"window",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:y,panelMaterial:x,frameMaterial:d,baseColor:m,stateMaterials:[{material:x,baseColor:m},...P.map(Y=>({material:Y.material,baseColor:g}))],closedAngle:0,openAngle:yr(e.openAngle),size:{width:r,height:o,depth:a},glass:U}}}function Rm(n){let e=n.floors.find(i=>i.id===n.activeFloorId);if(!e)throw new Error(\`Active floor \${n.activeFloorId} does not exist.\`);let t=new Qr;try{let i=new yt;i.userData.sceneId=n.sceneId,i.userData.activeFloorId=e.id,t.add(i);let s=Ei();e.rooms.forEach(p=>VS(i,p,s));let r=GS(e);i.userData.foundationBaseY=r.foundationBaseY;let a=Am(r.walls);r.walls.forEach(p=>qS(i,p,r,a,s)),YS(i,a,s);let o=Ih(),c=new Map,l=[...e.objects.map(p=>KS(i,p,o,c)),...e.doors.map(p=>eE(i,p,r.walls.find(x=>x.id===p.wallId),s)),...e.windows.map(p=>tE(i,p,r.walls.find(x=>x.id===p.wallId),s))].filter(Boolean),u=new Map(l.map(p=>[p.id,p])),h=l.flatMap(p=>p.pickables),f=JS(l),d=Sm(t,i);return{scene:t,sceneRoot:i,activeFloor:e,entities:u,lighting:d,pickables:h,devicePickables:f}}catch(i){throw gl(t),i}}function gl(n){if(!n)return;let e=new Set,t=new Set,i=new Set,s=new Set;n.traverse(r=>{r.shadow?.map&&s.add(r.shadow.map),r.shadow?.mapPass&&s.add(r.shadow.mapPass),r.geometry&&e.add(r.geometry),(Array.isArray(r.material)?r.material:[r.material]).filter(Boolean).forEach(o=>{t.add(o),Object.values(o).forEach(c=>{c?.isTexture&&i.add(c)})})}),i.forEach(r=>r.dispose()),s.forEach(r=>r.dispose()),e.forEach(r=>r.dispose()),t.forEach(r=>r.dispose()),n.clear()}var nE=new Set(["room","wall","door","window"]),zh=1.1,iE=.02,br=34,sE=.55,rE=2.5,Hh=new D(0,1,0);function Im(n,e){let t=n.geometry?.getAttribute("position");if(!t)return;let i=new D;for(let s=0;s<t.count;s+=1)i.fromBufferAttribute(t,s).applyMatrix4(n.matrixWorld),e.push(i.clone())}function aE(n,e){n.updateWorldMatrix(!0,!0),n.traverse(t=>{t.isMesh&&Im(t,e)})}function Ua(n,e=new Map){let t=[];n.updateWorldMatrix(!0,!0),n.traverse(i=>{i.isMesh&&!i.userData.excludeFromCameraFit&&nE.has(i.userData.sceneElementType)&&Im(i,t)});for(let i of e.values()){if(i.visual?.type!=="contact")continue;let s=i.visual.motionRoot??i.root,r=s.rotation.y;for(let a of[i.visual.closedAngle,i.visual.closedAngle+i.visual.openAngle])s.rotation.y=a,aE(i.root,t);s.rotation.y=r,i.root.updateWorldMatrix(!0,!0)}return n.updateWorldMatrix(!0,!0),t}function oE(n){if(!n.length)return null;let e=new tn().setFromPoints(n);if(e.isEmpty())return null;let t=e.getSize(new D);return new D((e.min.x+e.max.x)/2,e.min.y+t.y*.25,(e.min.z+e.max.z)/2)}function cE(n){let e=n.clone().normalize(),t=new bs;return t.position.copy(e),t.up.copy(Hh),t.lookAt(0,0,0),t.quaternion.clone()}function Fa(n,e){if(!e.length)return null;n.updateMatrixWorld(!0),n.updateProjectionMatrix();let t=new D,i={minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0};for(let s of e)t.copy(s).project(n),i.minX=Math.min(i.minX,t.x),i.maxX=Math.max(i.maxX,t.x),i.minY=Math.min(i.minY,t.y),i.maxY=Math.max(i.maxY,t.y);return{...i,width:i.maxX-i.minX,height:i.maxY-i.minY,centerX:(i.minX+i.maxX)/2,centerY:(i.minY+i.maxY)/2,maximumAbsolute:Math.max(Math.abs(i.minX),Math.abs(i.maxX),Math.abs(i.minY),Math.abs(i.maxY))}}function Pm(n,e,t,i,s=br,r=zh,a=n){let o=Math.max(i,.05),c=ht.clamp(s,1,120),l=Math.tan(ht.degToRad(c)/2),u=l*o,h=t.clone().invert(),f=n.map(y=>y.clone().sub(e).applyQuaternion(h)),d=a.map(y=>y.clone().sub(e).applyQuaternion(h)),p=lE(n,e,t,o,c,r),x=Math.max(...f.map(y=>y.z+.1),.1),m=p.distance,g=1/r,w=(y,T)=>{let b=1/0,C=-1/0,v=1/0,S=-1/0;for(let P of y){let I=T-P.z,O=P.x/(I*u),U=P.y/(I*l);b=Math.min(b,O),C=Math.max(C,O),v=Math.min(v,U),S=Math.max(S,U)}return{minX:b,maxX:C,minY:v,maxY:S}},E=y=>{let T=w(d,y),b=(T.minX+T.maxX)/2,C=(T.minY+T.maxY)/2,v=w(f,y);return Math.max(Math.abs(v.minX-b),Math.abs(v.maxX-b),Math.abs(v.minY-C),Math.abs(v.maxY-C))};for(;E(m)>g;)m*=1.5;for(let y=0;y<48;y+=1){let T=(x+m)/2;E(T)>g?x=T:m=T}return{distance:m,fovDegrees:c}}function Is(n,e){if(!n?.isPerspectiveCamera||!e.length)return null;n.view?.enabled?n.clearViewOffset():n.updateProjectionMatrix();let t=Fa(n,e),i=2,s=i*n.aspect;return n.setViewOffset(s,i,t.centerX*n.aspect,-t.centerY,s,i),n.updateProjectionMatrix(),{ndcBounds:Fa(n,e),rawBounds:t}}function lE(n,e,t,i,s=br,r=zh){let a=Math.max(i,.05),o=ht.clamp(s,1,120),c=Math.tan(ht.degToRad(o)/2),l=c*a,u=t.clone().invert(),h=new D,f=0,d=-1/0;for(let p of n)h.copy(p).sub(e).applyQuaternion(u),d=Math.max(d,h.z),f=Math.max(f,h.z+Math.abs(h.x)*r/l,h.z+Math.abs(h.y)*r/c);return{distance:Math.max(f,d+.1,.1),fovDegrees:o}}function uE(n,e,t,i,{allowQuarterTurn:s=!0,centeringPoints:r=n,fovDegrees:a=br,padding:o=zh,minimumImprovement:c=iE}={}){let l=[t.clone().normalize()];s&&l.push(t.clone().applyAxisAngle(Hh,Math.PI/2).normalize());let u=l.map((h,f)=>{let d=cE(h);return{...Pm(n,e,d,i,a,o,r),direction:h,orientationDegrees:f*90,quaternion:d}});return u[1]?.distance<u[0].distance*(1-c)?u[1]:u[0]}function hE(n,e){let t=0;for(let i of n)t=Math.max(t,i.distanceTo(e));return Math.max(t,1)}function Vh(n,e,t){let i=n.position.distanceTo(e),s=Math.max(.25,t*.08);return n.near=Math.max(.03,i-t-s),n.far=Math.max(n.near+1,i+t+s),n.updateProjectionMatrix(),{distance:i,far:n.far,near:n.near,radius:t}}function Dm(n,e,t,i,s,r={}){let a=r.centeringPoints?.length?r.centeringPoints:e,o=r.targetPoints?.length?r.targetPoints:a,c=oE(o);if(!c)return null;let l=r.fovDegrees??br,u=uE(e,c,s,i,{...r,centeringPoints:a,fovDegrees:l});n.aspect=Math.max(i,.05),n.fov=l,n.zoom=1,n.position.copy(c).addScaledVector(u.direction,u.distance),n.up.copy(Hh),n.lookAt(c),n.updateMatrixWorld(!0);let h=hE([...t,...e],c),f=Math.max(u.distance*sE,h*1.05),d=Math.max(u.distance*rE,f*1.1),p=Vh(n,c,h),x=Is(n,a);return{...u,...p,maxDistance:d,minDistance:f,centeringBounds:x.ndcBounds,ndcBounds:Fa(n,e),target:c}}function dE(n,e=1,t=.001){return n.minX>=-e-t&&n.maxX<=e+t&&n.minY>=-e-t&&n.maxY<=e+t}function Lm(n,e,{worldPoints:t=[],centeringPoints:i=t,target:s=null,clippingPadding:r=1.02}={}){let a=i.length?Is(n,i):null,o=t.length?Fa(n,t):null,c=o?dE(o):!1,l=s?n.position.distanceTo(s):0,u=Math.max(e,.05),h=l,f=!1;if(n.aspect=u,c&&s){let p=Pm(t,s,n.quaternion,u,n.fov,r,i);if(p.distance>l){let x=n.position.clone().sub(s).normalize();n.position.copy(s).addScaledVector(x,p.distance),n.lookAt(s),n.updateMatrixWorld(!0),h=p.distance,f=!0}}n.updateProjectionMatrix();let d=i.length?Is(n,i):null;return{distance:h,expandedForClipping:f,centeringBounds:d?.ndcBounds??null,ndcBounds:t.length?Fa(n,t):null,previousBounds:o}}function fE(n){return 1-(1-n)**3}var xl=class{constructor({camera:e,controls:t,requestRender:i,updateClipping:s=()=>{},onComplete:r=()=>{},isBlocked:a=()=>!1,delayMs:o=0,durationMs:c=700,setTimeoutFn:l=(d,p)=>window.setTimeout(d,p),clearTimeoutFn:u=d=>window.clearTimeout(d),requestAnimationFrameFn:h=d=>window.requestAnimationFrame(d),cancelAnimationFrameFn:f=d=>window.cancelAnimationFrame(d)}){this.camera=e,this.controls=t,this.requestRender=i,this.updateClipping=s,this.onComplete=r,this.isBlocked=a,this.delayMs=o,this.durationMs=c,this.setTimeoutFn=l,this.clearTimeoutFn=u,this.requestAnimationFrameFn=h,this.cancelAnimationFrameFn=f,this.homeView=null,this.timeoutId=null,this.animationFrameId=null}setHomeView({position:e,target:t}){this.homeView={position:e.clone(),target:t.clone()}}cancelTimer(){this.timeoutId!==null&&(this.clearTimeoutFn(this.timeoutId),this.timeoutId=null)}cancelAnimation(){this.animationFrameId!==null&&(this.cancelAnimationFrameFn(this.animationFrameId),this.animationFrameId=null)}cancel(){this.cancelTimer(),this.cancelAnimation()}schedule(){return this.cancelTimer(),this.delayMs<=0||!this.homeView||this.isBlocked()?!1:(this.timeoutId=this.setTimeoutFn(()=>{this.timeoutId=null,this.start()},this.delayMs),!0)}start(){if(this.cancelAnimation(),!this.homeView||this.isBlocked())return!1;let e=this.camera.position.clone(),t=this.controls.target.clone(),i=this.homeView.position,s=this.homeView.target;if(e.distanceToSquared(i)<1e-12&&t.distanceToSquared(s)<1e-12)return this.onComplete(),!1;let r=null,a=o=>{if(this.isBlocked()){this.animationFrameId=null;return}r??=o;let c=Math.min(Math.max((o-r)/this.durationMs,0),1),l=fE(c);if(this.camera.position.lerpVectors(e,i,l),this.controls.target.lerpVectors(t,s,l),this.camera.lookAt(this.controls.target),this.updateClipping(),this.requestRender(),c<1){this.animationFrameId=this.requestAnimationFrameFn(a);return}this.animationFrameId=null,this.controls.update(),this.onComplete()};return this.animationFrameId=this.requestAnimationFrameFn(a),!0}dispose(){this.cancel(),this.homeView=null}};function Om(n){return Array.isArray(n?.floors)?n.floors.map(e=>e.id):[]}function Nm(n,e){let t=new Set(Om(n));return typeof e=="string"&&t.has(e)?e:typeof n?.defaultFloorId=="string"&&t.has(n.defaultFloorId)?n.defaultFloorId:Om(n)[0]??null}function Fm(n,e,t){let i=n?.sceneId===e?t:null;return Nm(n,i)}function _l(n,e){return\`mikonus.active-floor:\${typeof e=="string"&&e?e:"default"}:\${n}\`}var vl=class{constructor({description:e,initialFloorId:t,createRuntime:i,disposeRuntime:s,maxCachedRuntimes:r=3}){if(!e||!Array.isArray(e.floors)||e.floors.length===0)throw new TypeError("DashboardFloorController requires at least one floor.");if(typeof i!="function"||typeof s!="function")throw new TypeError("DashboardFloorController requires runtime lifecycle callbacks.");if(!Number.isInteger(r)||r<1)throw new TypeError("maxCachedRuntimes must be a positive integer.");this.description=e,this.floorsById=new Map(e.floors.map(a=>[a.id,a])),this.createRuntime=i,this.disposeRuntime=s,this.maxCachedRuntimes=r,this.runtimes=new Map,this.activeFloorId=Nm(e,t),this.activeRuntime=null}activate(e=this.activeFloorId){if(!this.floorsById.has(e))throw new RangeError(\`Floor \${String(e)} does not exist in the dashboard scene.\`);let t=this.runtimes.get(e),i=!t;if(t?this.runtimes.delete(e):t=this.createRuntime(e),!t)throw new Error(\`Floor runtime \${e} could not be created.\`);this.runtimes.set(e,t),this.activeFloorId=e,this.activeRuntime=t;let s=[];for(;this.runtimes.size>this.maxCachedRuntimes;){let r=this.runtimes.keys().next().value;if(r===this.activeFloorId)break;let a=this.runtimes.get(r);this.runtimes.delete(r),this.disposeRuntime(a),s.push(r)}return{created:i,evictedFloorIds:s,floorId:e,runtime:t}}get cachedFloorIds(){return[...this.runtimes.keys()]}get cachedRuntimes(){return[...this.runtimes.values()]}dispose(){for(let e of this.runtimes.values())this.disposeRuntime(e);this.runtimes.clear(),this.activeRuntime=null}};function pE(n,e,t){if(!Array.isArray(n)||n.length<=1)return"hidden";if(n.length>4)return"compact";let i=n.map(r=>Math.ceil(t(String(r.name??""))));return i.some(r=>r>112)?"compact":i.reduce((r,a)=>r+a+28,Math.max(n.length-1,0)*3)<=Math.max(Number(e)||0,0)?"segmented":"compact"}function mE(n){let t=n.ownerDocument.createElement("canvas").getContext("2d");return i=>{if(!t)return String(i).length*8;let s=getComputedStyle(n);return t.font=s.font||\`\${s.fontWeight} \${s.fontSize} \${s.fontFamily}\`,t.measureText(String(i)).width}}var yl=class{constructor({host:e,onSelect:t,translate:i=(s,r)=>r}){if(!e||typeof t!="function")throw new TypeError("DashboardFloorSelector requires a host and selection callback.");this.host=e,this.hadHostClass=e.classList.contains("floor-selector"),e.classList.add("floor-selector"),this.onSelect=t,this.floors=[],this.activeFloorId=null,this.availableWidth=0,this.measureText=mE(e),this.translate=i,this.segments=e.ownerDocument.createElement("div"),this.segments.className="floor-selector-segments",this.segments.setAttribute("role","tablist"),this.segments.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.compact=e.ownerDocument.createElement("span"),this.compact.className="floor-selector-compact",this.select=e.ownerDocument.createElement("select"),this.select.className="floor-selector-select",this.select.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.chevron=e.ownerDocument.createElement("span"),this.chevron.className="floor-selector-chevron",this.chevron.setAttribute("aria-hidden","true"),this.chevron.textContent="\\u2304",this.compact.append(this.select,this.chevron),e.append(this.segments,this.compact),this.onCompactChange=()=>this.requestSelection(this.select.value),this.select.addEventListener("change",this.onCompactChange)}update({floors:e,activeFloorId:t,availableWidth:i}){this.floors=Array.isArray(e)?e:[],this.activeFloorId=t,this.availableWidth=Math.max(Number(i)||0,0),this.render()}layout(e){let t=Math.max(Number(e)||0,0);Math.abs(t-this.availableWidth)<1||(this.availableWidth=t,this.render())}requestSelection(e){!e||e===this.activeFloorId||this.onSelect(e)}render(){let e=pE(this.floors,this.availableWidth,this.measureText);if(this.host.hidden=e==="hidden",this.segments.hidden=e!=="segmented",this.compact.hidden=e!=="compact",this.host.dataset.mode=e,e==="hidden"){this.segments.replaceChildren(),this.select.replaceChildren();return}this.select.replaceChildren(...this.floors.map(i=>{let s=this.host.ownerDocument.createElement("option");return s.value=i.id,s.textContent=i.name,s})),this.select.value=this.activeFloorId;let t=this.floors.find(i=>i.id===this.activeFloorId);if(this.select.title=t?.name??"",e==="compact"){this.segments.replaceChildren();let i=this.measureText(t?.name??"")+56;this.compact.style.width=\`\${Math.min(this.availableWidth,Math.max(116,i))}px\`;return}this.segments.replaceChildren(...this.floors.map((i,s)=>{let r=this.host.ownerDocument.createElement("button"),a=i.id===this.activeFloorId;return r.type="button",r.className="floor-selector-segment",r.textContent=i.name,r.title=i.name,r.dataset.floorId=i.id,r.setAttribute("role","tab"),r.setAttribute("aria-selected",String(a)),r.tabIndex=a?0:-1,r.addEventListener("click",()=>this.requestSelection(i.id)),r.addEventListener("keydown",o=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(o.key))return;o.preventDefault();let l=s;o.key==="Home"?l=0:o.key==="End"?l=this.floors.length-1:o.key==="ArrowLeft"||o.key==="ArrowUp"?l=(s-1+this.floors.length)%this.floors.length:l=(s+1)%this.floors.length,[...this.segments.children].find(h=>h.dataset.floorId===this.floors[l].id)?.focus(),this.requestSelection(this.floors[l].id)}),r}))}dispose(){this.hadHostClass||this.host.classList.remove("floor-selector"),this.select.removeEventListener("change",this.onCompactChange),this.host.replaceChildren()}};var Wm=Qn(ns()),{DEVICE_COMMAND:Ti,hasCleaningState:SE,hasClimateState:EE,hasCoverState:wE,hasPowerState:TE,isUsableCleaningState:AE,isUsableClimateState:CE,isUsableCoverState:RE,isUsablePowerState:Vm}=Wm.default;function Gm(n,e,t){return e<=t*2?e/2:Math.min(Math.max(n,t),e-t)}function IE({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:a=4}){let o=Math.max(s/2+a,0),c=Math.max(r/2+a,0);return{left:Gm(n,Math.max(t,0),o),top:Gm(e,Math.max(i,0),c)}}function Xm(n,e,t){return{left:n.left-e/2,right:n.left+e/2,top:n.top-t/2,bottom:n.top+t/2}}function PE(n,e,t){return e.reduce((i,s)=>{let r=Math.max(0,Math.min(n.right,s.right+t)-Math.max(n.left,s.left-t)),a=Math.max(0,Math.min(n.bottom,s.bottom+t)-Math.max(n.top,s.top-t));return i+r*a},0)}function DE(n,e,t){let i=Math.max(52,n*.58+t),s=Math.max(52,e+t),r=[{x:0,y:0}];for(let a=1;a<=3;a+=1){let o=i*a,c=s*a;r.push({x:0,y:-c},{x:0,y:c},{x:-o,y:0},{x:o,y:0},{x:-o,y:-c},{x:o,y:-c},{x:-o,y:c},{x:o,y:c})}return r}function Gh({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:a=4,collisionGap:o=8,obstacles:c=[]}){let l=null,u=new Set;for(let h of DE(s,r,o)){let f=IE({left:n+h.x,top:e+h.y,width:t,height:i,controlWidth:s,controlHeight:r,edgePadding:a}),d=\`\${f.left.toFixed(3)}:\${f.top.toFixed(3)}\`;if(u.has(d))continue;u.add(d);let p=Xm(f,s,r),x=PE(p,c,o),m=Math.hypot(f.left-n,f.top-e),g={position:f,rectangle:p,score:x,displacement:m};if(x===0)return g;(!l||x<l.score||x===l.score&&m<l.displacement)&&(l=g)}return l}function LE(n){return!!(n?.controls?.openCover||n?.controls?.closeCover||n?.controls?.stopCover||n?.controls?.setCoverPosition)}function OE(n){return wE(n)&&LE(n)?"cover":EE(n)&&n?.controls?.setTargetTemperature?"climate":SE(n)&&[n?.controls?.startCleaning,n?.controls?.pauseCleaning,n?.controls?.stopCleaning,n?.controls?.returnToBase].some(Boolean)?"vacuum":TE(n)&&n?.controls?.setPower!==!1?"power":null}function qm(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function NE(n,e){let t=n?.controls?.setTargetTemperature,i=n?.climate?.targetTemperature;if(!t||!Number.isFinite(i)||![-1,1].includes(e))return null;let s=Number.isFinite(t.min)?t.min:4,r=Number.isFinite(t.max)?t.max:35,a=Number.isFinite(t.step)&&t.step>0?t.step:.5,o=Math.min(Math.max(i+e*a,s),r);return Number(o.toFixed(qm(a)))}function bl(n){n.preventDefault(),n.stopPropagation()}var Ba=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.records=new Map,this.busyDeviceIds=new Set,this.bounds=new tn,this.anchor=new D,this.projected=new D,this.objectCenter=new D,this.objectProjected=new D,this.size=new D,this.layer=document.createElement("div"),this.layer.className="quick-controls-layer",this.layer.setAttribute("aria-label",this.translate("quickControls.label","Quick controls")),this.layer.hidden=!0,e.appendChild(this.layer)}prepareElement(e){for(let t of["pointerdown","pointerup","pointercancel"])e.addEventListener(t,bl);return e}createPowerRecord(e,t){let i=this.prepareElement(document.createElement("button"));return i.type="button",i.className="quick-control-chip",i.dataset.sceneObjectId=e,i.innerHTML='<span aria-hidden="true">&#x23FB;</span>',i.addEventListener("click",s=>{bl(s);let r=this.records.get(e)?.state;Vm(r)&&this.onCommand(e,{type:Ti.SET_POWER,value:!r.power.isOn})}),{type:"power",element:i,entity:t,deviceId:null,state:null}}createCoverButton(e,t,i,s,r){let a=this.prepareElement(document.createElement("button"));a.type="button",a.className="quick-control-action",a.innerHTML=\`<span aria-hidden="true">\${s}</span>\`;let o=this.translate(t,i);return a.setAttribute("aria-label",o),a.title=o,a.addEventListener("click",c=>{bl(c),this.onCommand(e,{type:r})}),a}createCoverRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-cover",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.cover.open","Open cover","&#x2191;",Ti.OPEN_COVER),r=this.createCoverButton(e,"quickControls.cover.stop","Stop cover","&#x25A0;",Ti.STOP_COVER),a=this.createCoverButton(e,"quickControls.cover.close","Close cover","&#x2193;",Ti.CLOSE_COVER),o=document.createElement("span");return o.className="quick-control-value",o.setAttribute("aria-hidden","true"),i.append(s,r,a,o),{type:"cover",element:i,openButton:s,stopButton:r,closeButton:a,value:o,entity:t,deviceId:null,state:null}}createClimateButton(e,t,i,s,r){let a=this.prepareElement(document.createElement("button"));return a.type="button",a.className="quick-control-action",a.innerHTML=\`<span aria-hidden="true">\${r}</span>\`,a.dataset.labelKey=i,a.dataset.labelFallback=s,a.addEventListener("click",o=>{bl(o);let c=this.records.get(e)?.state,l=NE(c,t);l!==null&&this.onCommand(e,{type:Ti.SET_TARGET_TEMPERATURE,value:l})}),a}createClimateRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-climate",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createClimateButton(e,-1,"quickControls.climate.decrease","Decrease target temperature","&#x2212;"),r=document.createElement("span");r.className="quick-control-temperature",r.setAttribute("aria-hidden","true");let a=this.createClimateButton(e,1,"quickControls.climate.increase","Increase target temperature","&#x2B;");return i.append(s,r,a),{type:"climate",element:i,decreaseButton:s,increaseButton:a,value:r,entity:t,deviceId:null,state:null}}createVacuumRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-vacuum",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.vacuum.start","Start cleaning","&#x25B6;",Ti.START_CLEANING),r=this.createCoverButton(e,"quickControls.vacuum.pause","Pause cleaning","&#x2016;",Ti.PAUSE_CLEANING),a=this.createCoverButton(e,"quickControls.vacuum.stop","Stop cleaning","&#x25A0;",Ti.STOP_CLEANING),o=this.createCoverButton(e,"quickControls.vacuum.return","Return to base","&#x2302;",Ti.RETURN_TO_BASE);return i.append(s,r,a,o),{type:"vacuum",element:i,startButton:s,pauseButton:r,stopButton:a,returnButton:o,entity:t,deviceId:null,state:null}}createRecord(e,t,i){let s=i==="cover"?this.createCoverRecord(e,t):i==="climate"?this.createClimateRecord(e,t):i==="vacuum"?this.createVacuumRecord(e,t):this.createPowerRecord(e,t);return this.layer.appendChild(s.element),this.records.set(e,s),s}updatePowerRecord(e,t,i){let s=t.power?.isOn===!0,r=Vm(t);e.element.classList.toggle("is-on",s),e.element.classList.toggle("is-unavailable",!r),e.element.classList.toggle("is-busy",i),e.element.disabled=!r||i,e.element.setAttribute("aria-pressed",String(s));let a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),o=s?this.translate("quickControls.power.turnOff","Turn off"):this.translate("quickControls.power.turnOn","Turn on");e.element.setAttribute("aria-label",\`\${a}: \${o}\`),e.element.title=o}updateCoverRecord(e,t,i){let s=RE(t),r=t.controls??{},a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),o=typeof t.cover?.position=="number"?Math.round(t.cover.position*100):null;e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${a}: \${this.translate("quickControls.cover.label","Cover")}\`),e.value.textContent=o===null?"\\u2013":\`\${o}%\`,e.openButton.disabled=!s||i||!r.openCover,e.stopButton.disabled=!s||i||!r.stopCover,e.closeButton.disabled=!s||i||!r.closeCover}updateClimateRecord(e,t,i){let s=t.controls?.setTargetTemperature,r=t.climate?.targetTemperature,a=CE(t)&&s&&Number.isFinite(r),o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),c=t.climate?.unit??s?.unit??"\\xB0C",l=qm(s?.step??.5);e.element.classList.toggle("is-unavailable",!a),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${o}: \${this.translate("quickControls.climate.label","Climate")}\`),e.value.textContent=Number.isFinite(r)?\`\${r.toFixed(l)} \${c}\`:"\\u2013";let u=this.translate(e.decreaseButton.dataset.labelKey,e.decreaseButton.dataset.labelFallback),h=this.translate(e.increaseButton.dataset.labelKey,e.increaseButton.dataset.labelFallback);e.decreaseButton.setAttribute("aria-label",\`\${o}: \${u}\`),e.increaseButton.setAttribute("aria-label",\`\${o}: \${h}\`),e.decreaseButton.title=u,e.increaseButton.title=h,e.decreaseButton.disabled=!a||i||r<=s.min,e.increaseButton.disabled=!a||i||r>=s.max}updateVacuumRecord(e,t,i){let s=AE(t),r=t.controls??{},a=t.cleaning?.state??"unknown",o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device");e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${o}: \${this.translate("quickControls.vacuum.label","Robot vacuum")}\`),e.startButton.disabled=!s||i||!r.startCleaning||a==="cleaning",e.pauseButton.disabled=!s||i||!r.pauseCleaning||a!=="cleaning",e.stopButton.disabled=!s||i||!r.stopCleaning||["idle","docked"].includes(a),e.returnButton.disabled=!s||i||!r.returnToBase||["docked","returning"].includes(a)}updateRecord(e,t){e.state=t;let i=this.busyDeviceIds.has(e.deviceId);e.type==="cover"?this.updateCoverRecord(e,t,i):e.type==="climate"?this.updateClimateRecord(e,t,i):e.type==="vacuum"?this.updateVacuumRecord(e,t,i):this.updatePowerRecord(e,t,i)}sync({enabled:e,entities:t,bindings:i,statesByDeviceId:s}){if(this.layer.hidden=!e,!e){this.clear();return}let r=new Set;for(let a of t.values()){let o=i.get(a.id),c=s.get(o?.deviceId),l=OE(c);if(!o?.deviceId||!l)continue;r.add(a.id);let u=this.records.get(a.id);u&&u.type!==l&&(u.element.remove(),this.records.delete(a.id),u=null),u??=this.createRecord(a.id,a,l),u.entity=a,u.deviceId=o.deviceId,this.updateRecord(u,c)}for(let[a,o]of this.records)r.has(a)||(o.element.remove(),this.records.delete(a))}setDeviceBusy(e,t){t?this.busyDeviceIds.add(e):this.busyDeviceIds.delete(e);for(let i of this.records.values())i.deviceId!==e||!i.state||this.updateRecord(i,i.state)}layout(e,t){if(this.layer.hidden)return[];let i=Math.max(t.clientWidth,1),s=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let r=[];for(let[l,u]of this.records){let h=u.entity.controlAnchor;h?(h.updateWorldMatrix(!0,!1),h.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):(u.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(u.entity.root)),!h&&this.bounds.isEmpty()?(u.entity.root.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):h||(this.bounds.getCenter(this.anchor),this.objectCenter.copy(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.28,this.size.y*.08)),this.projected.copy(this.anchor).project(e),this.objectProjected.copy(this.objectCenter).project(e);let f=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;if(u.element.hidden=!f,!f)continue;let d=u.element.offsetWidth||(u.type==="power"?44:146),p=u.element.offsetHeight||44;r.push({sceneObjectId:l,record:u,left:(this.projected.x*.5+.5)*i,top:(-this.projected.y*.5+.5)*s,controlWidth:d,controlHeight:p,objectRectangle:Xm({left:(this.objectProjected.x*.5+.5)*i,top:(-this.objectProjected.y*.5+.5)*s},36,36)})}let a={power:0,climate:1,vacuum:1,cover:2};r.sort((l,u)=>(a[l.record.type]??3)-(a[u.record.type]??3)||l.top-u.top||l.left-u.left||l.sceneObjectId.localeCompare(u.sceneObjectId));let o=r.filter(({record:l})=>l.type==="power").map(({sceneObjectId:l,objectRectangle:u})=>({sceneObjectId:l,rectangle:u})),c=[];for(let l of r){let u=l.record.type==="power"?[]:o.filter(({sceneObjectId:f})=>f!==l.sceneObjectId).map(({rectangle:f})=>f),h=Gh({left:l.left,top:l.top,width:i,height:s,controlWidth:l.controlWidth,controlHeight:l.controlHeight,obstacles:[...c,...u]});h&&(l.record.element.style.left=\`\${h.position.left}px\`,l.record.element.style.top=\`\${h.position.top}px\`,c.push(h.rectangle))}return c}clear(){for(let e of this.records.values())e.element.remove();this.records.clear(),this.busyDeviceIds.clear()}dispose(){this.clear(),this.layer.remove()}};var FE=7,UE=520;var Sr=class{constructor({movementThreshold:e=FE,longPressDelayMs:t=UE,onLongPress:i=()=>!1,schedule:s=(a,o)=>setTimeout(a,o),cancelSchedule:r=a=>clearTimeout(a)}={}){this.activePointers=new Map,this.candidate=null,this.movementThreshold=e,this.longPressDelayMs=t,this.onLongPress=i,this.schedule=s,this.cancelSchedule=r}cancelTimer(e=this.candidate){e?.timer!=null&&(this.cancelSchedule(e.timer),e.timer=null)}pointerDown({pointerId:e,clientX:t,clientY:i}){if(this.activePointers.set(e,{x:t,y:i}),this.activePointers.size!==1){this.candidate&&(this.candidate.moved=!0),this.cancelTimer();return}let s={pointerId:e,x:t,y:i,moved:!1,longPressFired:!1,timer:null};s.timer=this.schedule(()=>{s.timer=null,!(this.candidate!==s||s.moved||this.activePointers.size!==1)&&(s.longPressFired=this.onLongPress({clientX:s.x,clientY:s.y,pointerId:s.pointerId})===!0)},this.longPressDelayMs),this.candidate=s}pointerMove({pointerId:e,clientX:t,clientY:i}){!this.candidate||this.candidate.pointerId!==e||Math.hypot(t-this.candidate.x,i-this.candidate.y)<=this.movementThreshold||(this.candidate.moved=!0,this.cancelTimer())}pointerUp({pointerId:e,clientX:t,clientY:i}){let s=this.candidate;return this.activePointers.delete(e),!s||s.pointerId!==e||(this.cancelTimer(s),this.candidate=null,s.moved||s.longPressFired||this.activePointers.size>0)?null:{type:"tap",clientX:t,clientY:i,pointerId:e}}pointerCancel({pointerId:e}){this.activePointers.delete(e),this.candidate?.pointerId===e&&(this.cancelTimer(),this.candidate=null)}reset(){this.cancelTimer(),this.activePointers.clear(),this.candidate=null}dispose(){this.reset()}};function BE(n,e,t,i=new ce){let s=t.getBoundingClientRect();return!(s.width>0)||!(s.height>0)?null:(i.x=(n-s.left)/s.width*2-1,i.y=-((e-s.top)/s.height)*2+1,i)}function Ym({camera:n,canvas:e,clientX:t,clientY:i,pickables:s,pointer:r=new ce,raycaster:a=new Ms,scene:o=null}){let c=BE(t,i,e,r);if(!c)return null;n.updateProjectionMatrix(),n.updateMatrixWorld(!0),o?.updateMatrixWorld(!0),a.setFromCamera(c,n);let l=a.intersectObjects(s??[],!1).find(u=>u.object.userData.sceneObjectId);return l?{intersection:l,sceneObjectId:l.object.userData.sceneObjectId}:null}function $m(n){if(!n||typeof n!="object")return[];let e=[];n.power&&!n.cleaning&&e.push("power"),n.light&&n.controls?.setBrightness&&e.push("brightness"),n.light&&n.controls?.setColorTemperature&&e.push("colorTemperature"),n.light&&n.controls?.setColor===!0&&e.push("color"),n.contact&&e.push("contact"),n.cover&&e.push("cover"),n.climate&&e.push("climate"),n.activity&&e.push("activity"),n.safety&&e.push("safety"),n.fan&&e.push("fan"),Array.isArray(n.environment)&&n.environment.length>0&&e.push("environment"),Array.isArray(n.energy)&&n.energy.length>0&&e.push("energy");let t=n.health?.alerts?.some(i=>i.active===!0)===!0;return n.health&&(!n.cleaning||t)&&e.push("health"),n.cleaning&&e.push("cleaning"),n.lock&&e.push("lock"),e}function jm({entityId:n,binding:e,state:t}){return typeof n!="string"||!n||typeof e?.provider!="string"||!e.provider||typeof e?.deviceId!="string"||!e.deviceId?null:{entityId:n,provider:e.provider,targetId:e.deviceId,bindingCapability:e.capability??null,capabilities:$m(t),state:t??null}}var Ml=class{constructor({adapters:e={},onOpenChange:t=()=>{}}={}){this.adapters=new Map(Object.entries(e)),this.onOpenChange=t,this.active=null}open(e){if(!e||typeof e.provider!="string")return!1;let t=this.adapters.get(e.provider);return!t||typeof t.open!="function"||(this.close(),t.open(e,{onClose:()=>this.handleAdapterClose(t)})===!1)?!1:(this.active={adapter:t,context:e},this.onOpenChange(!0,e),!0)}handleAdapterClose(e){this.active?.adapter===e&&(this.active=null,this.onOpenChange(!1,null))}updateState(e,t){if(!this.active||this.active.context.targetId!==e)return!1;let i={...this.active.context,capabilities:$m(t),state:t};return this.active.context=i,this.active.adapter.update?.(i),!0}setBusy(e,t){return!this.active||this.active.context.targetId!==e?!1:(this.active.adapter.setBusy?.(!!t),!0)}close(){if(!this.active)return;let{adapter:e}=this.active;this.active=null,e.close?.(),this.onOpenChange(!1,null)}dispose(){let e=!!this.active;this.active=null;for(let t of new Set(this.adapters.values()))t.dispose?.();this.adapters.clear(),e&&this.onOpenChange(!1,null)}};var Km=Qn(ns()),{DEVICE_COMMAND:jt}=Km.default;function Zm(n,e){return n?.values?.some(t=>t.id===e)===!0}function Ai(n,e){if(n?.availability!=="available"||!e)return!1;switch(e.type){case jt.SET_POWER:return n.controls?.setPower===!0&&typeof e.value=="boolean";case jt.SET_BRIGHTNESS:return!!n.controls?.setBrightness&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_COLOR:return n.controls?.setColor===!0&&Number.isFinite(e.value?.hue)&&e.value.hue>=0&&e.value.hue<=1&&Number.isFinite(e.value?.saturation)&&e.value.saturation>=0&&e.value.saturation<=1;case jt.SET_COLOR_TEMPERATURE:return!!n.controls?.setColorTemperature&&Number.isFinite(e.value)&&e.value>=n.controls.setColorTemperature.min&&e.value<=n.controls.setColorTemperature.max;case jt.OPEN_COVER:return n.controls?.openCover===!0;case jt.CLOSE_COVER:return n.controls?.closeCover===!0;case jt.STOP_COVER:return n.controls?.stopCover===!0;case jt.SET_COVER_POSITION:return!!n.controls?.setCoverPosition&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_TARGET_TEMPERATURE:{let t=n.controls?.setTargetTemperature;return!!t&&Number.isFinite(e.value)&&e.value>=t.min&&e.value<=t.max}case jt.SET_THERMOSTAT_MODE:return Zm(n.controls?.setThermostatMode,e.value);case jt.SET_FAN_SPEED:return!!n.controls?.setFanSpeed&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_FAN_MODE:return Zm(n.controls?.setFanMode,e.value);case jt.SET_TARGET_HUMIDITY:return!!n.controls?.setTargetHumidity&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.START_CLEANING:return n.controls?.startCleaning===!0;case jt.PAUSE_CLEANING:return n.controls?.pauseCleaning===!0;case jt.STOP_CLEANING:return n.controls?.stopCleaning===!0;case jt.RETURN_TO_BASE:return n.controls?.returnToBase===!0;case jt.LOCK:return n.controls?.lock===!0;case jt.UNLOCK:return n.controls?.unlock===!0;default:return!1}}var Qm=Qn(ns()),{DEVICE_COMMAND:Jm}=Qm.default,ka=class{constructor({document:e=globalThis.document,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.interacting=!1,this.disposed=!1,this.element=e.createElement("div"),this.element.className="device-details-cover-position";let s=a=>{let o=e.createElement("div");o.className="device-details-range-label";let c=e.createElement("span");c.textContent=a;let l=e.createElement("span");return l.className="device-details-range-value",o.append(c,l),this.element.append(o),l};this.current=s(i("deviceDetails.position","Position"));let r=i("deviceDetails.targetPosition","Target position");this.target=s(r),this.slider=e.createElement("input"),this.slider.className="device-details-range device-details-cover-range",this.slider.type="range",this.slider.min="0",this.slider.max="100",this.slider.setAttribute("aria-label",r),this.element.append(this.slider),this.slider.addEventListener("pointerdown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("keydown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("input",()=>this.showTarget()),this.slider.addEventListener("change",()=>{this.interacting=!1;let a={type:Jm.SET_COVER_POSITION,value:Number(this.slider.value)/100};!this.disposed&&!this.slider.disabled&&Ai(this.state,a)&&this.onCommand(a)}),this.slider.addEventListener("pointerup",()=>{this.interacting=!1}),this.slider.addEventListener("keyup",()=>{this.interacting=!1}),this.slider.addEventListener("blur",()=>{this.interacting=!1}),this.slider.addEventListener("pointercancel",()=>{this.interacting=!1,this.update(this.state,this.busy)})}showTarget(){let e=Number(this.slider.value);this.target.textContent=\`\${e}%\`,this.slider.style.setProperty("--range-progress",\`\${e}%\`),this.slider.setAttribute("aria-valuetext",\`\${e}%\`)}update(e,t=!1,i=null){this.state=e,this.busy=t;let s=e?.cover?.position,r=Number.isFinite(s)&&s>=0&&s<=1;if(this.current.textContent=r?\`\${Math.round(s*100)}%\`:"\\u2013",this.slider.disabled=t||!r||!Ai(e,{type:Jm.SET_COVER_POSITION,value:s}),this.slider.step=String(Math.max(1,Math.round((e?.controls?.setCoverPosition?.step??.01)*100))),this.slider.disabled&&(this.interacting=!1),!this.interacting){let a=Number.isFinite(i)?i:s;this.slider.value=String(r?Math.round(a*100):0),this.showTarget(),r||(this.target.textContent="\\u2013")}}dispose(){this.disposed=!0,this.interacting=!1,this.slider.disabled=!0,this.element.remove()}};var i0=Qn(ns());var e0=Object.freeze({capture:!0,passive:!1});function Sl(n){let e=n.style.touchAction,t=i=>{i.cancelable&&i.preventDefault()};return n.style.touchAction="none",n.addEventListener("touchmove",t,e0),()=>{n.removeEventListener("touchmove",t,e0),n.style.touchAction=e}}var{DEVICE_COMMAND:Ht}=i0.default,kE=Object.freeze(["#ffffff","#ff9138","#ffd400","#0bc9bd","#49c7ef","#1594e8","#d735e5","#ff3d63"]),zE=700,wr=Object.freeze({width:300,height:210,centerX:150,centerY:133,startDegrees:155,sweepDegrees:230});function HE(n){return Number.isFinite(n)?Math.round(Math.min(Math.max(n,0),1)*100):null}function jn(n,e,t){return Math.min(Math.max(n,e),t)}function t0(n){if(!Number.isFinite(n?.hue)||!Number.isFinite(n?.saturation))return"#ffffff";let e=(n.hue%1+1)%1,t=jn(n.saturation,0,1),i=e*6,s=Math.floor(i),r=i-s,a=1-t,o=1-r*t,c=1-(1-r)*t,[l,u,h]=[[1,c,a],[o,1,a],[a,1,c],[a,o,1],[c,a,1],[1,a,o]][s%6];return\`#\${[l,u,h].map(f=>Math.round(f*255).toString(16).padStart(2,"0")).join("")}\`}function VE(n){if(typeof n!="string"||!/^#[0-9a-f]{6}$/i.test(n))return null;let e=Number.parseInt(n.slice(1,3),16)/255,t=Number.parseInt(n.slice(3,5),16)/255,i=Number.parseInt(n.slice(5,7),16)/255,s=Math.max(e,t,i),r=Math.min(e,t,i),a=s-r,o=0;return a>0&&(s===e?o=(t-i)/a%6:s===t?o=(i-e)/a+2:o=(e-t)/a+4,o=(o/6+1)%1),{hue:o,saturation:s===0?0:a/s}}function s0(n){let e=Number.isFinite(n?.hue)?(n.hue%1+1)%1:0,t=Number.isFinite(n?.saturation)?jn(n.saturation,0,1):0;return{hue:e,saturation:t}}function GE(n){let e=s0(n),t=e.hue*Math.PI*2,i=e.saturation*45;return{left:50+Math.cos(t)*i,top:50+Math.sin(t)*i}}function WE(n,e,t,i){if(![n,e,t,i].every(Number.isFinite)||t<=0||i<=0)return null;let s=t/2,r=i/2,a=n-s,o=e-r,c=Math.min(t,i)/2;return{hue:(Math.atan2(o,a)/(Math.PI*2)+1)%1,saturation:jn(Math.hypot(a,o)/c,0,1)}}function XE(n,e,t){return![n,e,t].every(Number.isFinite)||t<=e?0:jn((n-e)/(t-e)*100,0,100)}function Er(n,e,t,i){n.style.setProperty("--range-progress",\`\${XE(e,t,i)}%\`)}function El(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function wl(n){let e=Number.isFinite(n?.min)?n.min:4,t=Number.isFinite(n?.max)&&n.max>e?n.max:35,i=Number.isFinite(n?.step)&&n.step>0?n.step:.5;return{minimum:e,maximum:t,step:i}}function qh(n,e){if(!Number.isFinite(n))return null;let{minimum:t,maximum:i,step:s}=wl(e),r=t+Math.round((n-t)/s)*s,a=Math.max(El(t),El(i),El(s));return Number(jn(r,t,i).toFixed(a))}function qE(n,e){if(!Number.isFinite(n))return 0;let{minimum:t,maximum:i}=wl(e);return jn((n-t)/(i-t),0,1)}function Wh(n,e=100){let t=wr,i=(t.startDegrees+jn(n,0,1)*t.sweepDegrees)*Math.PI/180;return{x:t.centerX+Math.cos(i)*e,y:t.centerY+Math.sin(i)*e}}function YE(n,e,t){if(![n,e].every(Number.isFinite))return null;let i=wr,s=Math.atan2(e-i.centerY,n-i.centerX)*180/Math.PI;s<0&&(s+=360),s<i.startDegrees&&(s+=360);let r=s-i.startDegrees;r>i.sweepDegrees&&(r=n<i.centerX?0:i.sweepDegrees);let{minimum:a,maximum:o}=wl(t);return qh(a+r/i.sweepDegrees*(o-a),t)}function n0(n,e){if(!Number.isFinite(n))return"\\u2013";let t=Math.max(0,El(e));return n.toFixed(t)}var Yh=class{constructor({delay:e=zE,onCommit:t,setTimer:i=(r,a)=>globalThis.setTimeout(r,a),clearTimer:s=r=>globalThis.clearTimeout(r)}){this.delay=e,this.onCommit=t,this.setTimer=i,this.clearTimer=s,this.timer=null,this.value=null}get pending(){return this.timer!==null}cancel(){return this.timer===null?!1:(this.clearTimer(this.timer),this.timer=null,this.value=null,!0)}schedule(e){this.cancel(),this.value=e;let t=null;t=this.setTimer(()=>{if(this.timer!==t)return;let i=this.value;this.timer=null,this.value=null,this.onCommit?.(i)},this.delay),this.timer=t}dispose(){this.cancel()}};function Ne(n,e,t=null){let i=document.createElement(n);return e&&(i.className=e),t!==null&&(i.textContent=t),i}function Xh(n,e={}){let t=document.createElementNS("http://www.w3.org/2000/svg",n);for(let[i,s]of Object.entries(e))t.setAttribute(i,String(s));return t}function $E(n){n.stopPropagation()}var za=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.context=null,this.busy=!1,this.onClose=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureCommit=new Yh({onCommit:r=>{!r||this.layer.hidden||this.context?.entityId!==r.entityId||(this.setTargetTemperaturePendingVisual(!1),this.send({type:Ht.SET_TARGET_TEMPERATURE,value:r.value}))}}),this.layer=Ne("div","device-details-layer"),this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.panel=Ne("section","device-details-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","true"),this.panel.setAttribute("aria-labelledby","device-details-title"),this.panel.setAttribute("tabindex","-1");let s=Ne("header","device-details-header");this.title=Ne("h2","device-details-title"),this.title.id="device-details-title",this.closeButton=Ne("button","device-details-close","\\xD7"),this.closeButton.type="button",this.closeButton.addEventListener("click",()=>this.close()),s.append(this.title,this.closeButton),this.body=Ne("div","device-details-body"),this.panel.append(s,this.body),this.layer.appendChild(this.panel),e.appendChild(this.layer),this.onLayerClick=r=>{r.target===this.layer&&this.close()},this.onKeyDown=r=>{r.key==="Escape"&&!this.layer.hidden&&this.close()},this.layer.addEventListener("click",this.onLayerClick);for(let r of["pointerdown","pointermove","pointerup","pointercancel"])this.layer.addEventListener(r,$E);document.addEventListener("keydown",this.onKeyDown)}text(e,t){return this.translate(\`deviceDetails.\${e}\`,t)}open(e,{onClose:t=null}={}){globalThis.getSelection?.()?.removeAllRanges(),this.resetTargetTemperatureInteraction(),this.coverPositionDraft=null,this.context=e,this.busy=!1,this.onClose=t,this.render(),this.layer.hidden=!1,this.layer.setAttribute("aria-hidden","false"),this.panel.focus({preventScroll:!0})}update(e){if(this.layer.hidden||e.targetId!==this.context?.targetId)return;let t=this.targetTemperatureDraft,i=e.state?.climate?.targetTemperature;t?.entityId===e.entityId&&Number.isFinite(i)&&Math.abs(i-t.value)<1e-6&&(this.targetTemperatureCommit.cancel(),this.targetTemperatureDraft=null),this.coverPositionDraft?.entityId===e.entityId&&e.state?.cover?.position===this.coverPositionDraft.value&&(this.coverPositionDraft=null),this.context=e,!(this.coverPositionControl?.interacting&&(this.coverPositionControl.update(e.state,this.busy),this.coverPositionControl.interacting))&&this.render()}setBusy(e){this.layer.hidden||this.busy===e||(this.busy=e,this.render())}close({notify:e=!0}={}){if(this.layer.hidden)return;let t=this.onClose;this.resetTargetTemperatureInteraction(),this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.coverPositionDraft=null,this.coverPositionHadFocus=!1,this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.context=null,this.busy=!1,this.onClose=null,e&&t?.()}resetTargetTemperatureInteraction(){this.targetTemperatureCommit.cancel(),this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null}setTargetTemperaturePendingVisual(e){this.targetTemperaturePendingIndicator&&(this.targetTemperaturePendingIndicator.hidden=!e),this.targetTemperatureDial?.classList.toggle("is-pending",e)}cancelTargetTemperatureCommit(){this.targetTemperatureCommit.cancel(),this.setTargetTemperaturePendingVisual(!1)}scheduleTargetTemperatureCommit(e){if(!this.context||!Number.isFinite(e))return;let t=this.context.state?.climate?.targetTemperature;if(Number.isFinite(t)&&Math.abs(t-e)<1e-6){this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null;return}let i={entityId:this.context.entityId,value:e};this.targetTemperatureDraft=i,this.targetTemperatureCommit.schedule(i),this.setTargetTemperaturePendingVisual(!0)}createSection(e,t=""){let i=Ne("section",\`device-details-section\${t?\` \${t}\`:""}\`);return i.appendChild(Ne("h3","device-details-section-title",e)),this.body.appendChild(i),i}appendValue(e,t,i){let s=Ne("div","device-details-value-row");s.append(Ne("span","device-details-value-label",t),Ne("span","device-details-value",i)),e.appendChild(s)}capabilityLabel(e,t=null){if(typeof t=="string"&&t.trim())return t.trim();let s={alarm_motion:"Motion",alarm_presence:"Presence",alarm_occupancy:"Occupancy",alarm_smoke:"Smoke",alarm_fire:"Fire",alarm_co:"Carbon monoxide",alarm_gas:"Gas",alarm_water:"Water",alarm_moisture:"Moisture",alarm_heat:"Heat",measure_temperature:"Temperature",measure_humidity:"Humidity",measure_luminance:"Illuminance",measure_aqi:"Air quality index",measure_co2:"CO\\u2082",measure_pm25:"PM2.5",measure_tvoc:"TVOC",measure_pressure:"Pressure",measure_noise:"Noise",measure_power:"Power",meter_power:"Energy",measure_current:"Current",measure_voltage:"Voltage",meter_gas:"Gas meter",meter_water:"Water meter",alarm_battery:"Battery warning",alarm_connectivity:"Connectivity warning"}[e]??e;return this.text(\`capability.\${e}\`,s)}appendEnumControl(e,t,i,s,r){if(!s||!Array.isArray(s.values)||s.values.length===0){typeof i=="string"&&i&&this.appendValue(e,t,i);return}let a=Ne("div","device-details-choice-row");a.appendChild(Ne("span","device-details-value-label",t));let o=Ne("div","device-details-choices");for(let c of s.values){let l=Ne("button","device-details-choice",c.label??c.id);l.type="button",l.disabled=this.busy||this.context?.state?.availability!=="available",l.classList.toggle("is-selected",c.id===i),l.setAttribute("aria-pressed",String(c.id===i)),l.addEventListener("click",()=>this.send({type:r,value:c.id})),o.appendChild(l)}a.appendChild(o),e.appendChild(a)}appendNormalizedRange(e,{label:t,value:i,control:s,commandType:r}){let a=Number.isFinite(i)?Math.round(jn(i,0,1)*100):null,o=Ne("span","device-details-range-value",a===null?"\\u2013":\`\${a}%\`),c=Ne("div","device-details-range-label");c.append(Ne("span",null,t),o);let l=Ne("input","device-details-range");l.type="range",l.min="0",l.max="100",l.step=String(Math.max(1,Math.round((s?.step??.01)*100))),l.value=String(a??0),l.disabled=this.busy||this.context?.state?.availability!=="available"||a===null||!s,l.setAttribute("aria-label",t),Er(l,a??0,0,100),l.addEventListener("input",()=>{o.textContent=\`\${l.value}%\`,Er(l,Number(l.value),0,100)}),l.addEventListener("change",()=>this.send({type:r,value:Number(l.value)/100})),e.append(c,l)}createAction(e,t,i,s=!0){let r=Ne("button","device-details-action");return r.type="button",r.disabled=this.busy||!s||this.context?.state?.availability!=="available",r.setAttribute("aria-label",e),r.title=e,r.append(Ne("span","device-details-action-symbol",t),Ne("span","device-details-action-label",e)),r.addEventListener("click",()=>this.send(i)),r}send(e){!this.context||this.busy||this.onCommand(this.context.entityId,e)}renderPower(e){let t=e.power?.isOn===!0,i=e.availability==="available"&&typeof e.power?.isOn=="boolean",s=this.createSection(this.text("power","Power")),r=Ne("button",\`device-details-toggle\${t?" is-on":""}\`);r.type="button",r.disabled=this.busy||!i||e.controls?.setPower!==!0,r.setAttribute("aria-pressed",String(t));let a=t?this.text("on","On"):this.text("off","Off");r.setAttribute("aria-label",\`\${this.text("power","Power")}: \${a}\`),r.append(Ne("span","device-details-toggle-label",a),Ne("span","device-details-toggle-indicator")),r.addEventListener("click",()=>this.send({type:Ht.SET_POWER,value:!t})),s.appendChild(r)}renderBrightness(e){let t=this.createSection(this.text("brightness","Brightness")),i=HE(e.light?.brightness),s=Ne("span","device-details-range-value",i===null?"\\u2013":\`\${i}%\`),r=Ne("div","device-details-range-label");r.append(Ne("span",null,this.text("brightness","Brightness")),s);let a=Ne("input","device-details-range device-details-brightness-range");a.type="range",a.min="0",a.max="100",a.step=String(Math.max(1,Math.round((e.controls.setBrightness.step??.01)*100))),a.value=String(i??0),a.disabled=this.busy||e.availability!=="available"||i===null,a.setAttribute("aria-label",this.text("brightness","Brightness")),Er(a,i??0,0,100),a.addEventListener("input",()=>{s.textContent=\`\${a.value}%\`,Er(a,Number(a.value),0,100)}),a.addEventListener("change",()=>this.send({type:Ht.SET_BRIGHTNESS,value:Number(a.value)/100})),t.append(r,a)}renderColorTemperature(e){let t=e.controls?.setColorTemperature,i=Number.isFinite(t?.min)?t.min:2e3,s=Number.isFinite(t?.max)?t.max:6500,r=Number.isFinite(t?.step)&&t.step>0?t.step:50,a=Number.isFinite(e.light?.colorTemperatureKelvin)?jn(e.light.colorTemperatureKelvin,i,s):null,o=this.createSection(this.text("colorTemperature","Color temperature")),c=Ne("span","device-details-range-value",a===null?"\\u2013":\`\${Math.round(a)} K\`),l=Ne("div","device-details-range-label");l.append(Ne("span",null,this.text("colorTemperature","Color temperature")),c);let u=Ne("input","device-details-range device-details-temperature-range");u.type="range",u.min=String(i),u.max=String(s),u.step=String(r),u.value=String(a??(i+s)/2),u.disabled=this.busy||e.availability!=="available"||!t,u.setAttribute("aria-label",this.text("colorTemperature","Color temperature")),Er(u,a??(i+s)/2,i,s),u.addEventListener("input",()=>{c.textContent=\`\${Math.round(Number(u.value))} K\`,Er(u,Number(u.value),i,s)}),u.addEventListener("change",()=>this.send({type:Ht.SET_COLOR_TEMPERATURE,value:Number(u.value)})),o.append(l,u)}renderColor(e){let t=this.createSection(this.text("color","Color")),i=!this.busy&&e.availability==="available",s=s0(e.light?.color),r=Ne("button","device-details-color-wheel");r.type="button",r.disabled=!i,r.setAttribute("aria-label",this.text("selectColor","Select color"));let a=Ne("span","device-details-color-wheel-marker");a.setAttribute("aria-hidden","true"),r.appendChild(a);let o=Ne("div","device-details-color-presets-label",this.text("presets","Presets")),c=Ne("div","device-details-color-presets"),l=kE.map(d=>{let p=VE(d),x=Ne("button","device-details-color-preset");return x.type="button",x.disabled=!i,x.style.setProperty("--preset-color",d),x.setAttribute("aria-label",\`\${this.text("selectColor","Select color")}: \${d}\`),x.addEventListener("click",()=>{s=p,u(),this.send({type:Ht.SET_COLOR,value:p})}),c.appendChild(x),{button:x,color:p}}),u=()=>{let d=GE(s);a.style.left=\`\${d.left}%\`,a.style.top=\`\${d.top}%\`,a.style.background=t0(s),r.setAttribute("aria-valuetext",t0(s));for(let p of l){let x=Math.abs(p.color.saturation-s.saturation),m=Math.min(Math.abs(p.color.hue-s.hue),1-Math.abs(p.color.hue-s.hue)),g=x<.025&&(s.saturation<.025||m<.0125);p.button.classList.toggle("is-selected",g),p.button.setAttribute("aria-pressed",String(g))}},h=d=>{let p=r.getBoundingClientRect(),x=WE(d.clientX-p.left,d.clientY-p.top,p.width,p.height);return x?(s=x,u(),!0):!1},f=null;r.addEventListener("pointerdown",d=>{i&&(f=d.pointerId,r.setPointerCapture?.(d.pointerId),h(d),d.preventDefault())}),r.addEventListener("pointermove",d=>{d.pointerId===f&&(h(d),d.preventDefault())}),r.addEventListener("pointerup",d=>{if(d.pointerId!==f)return;let p=h(d);f=null,r.releasePointerCapture?.(d.pointerId),p&&this.send({type:Ht.SET_COLOR,value:s}),d.preventDefault()}),r.addEventListener("pointercancel",d=>{d.pointerId===f&&(f=null)}),r.addEventListener("keydown",d=>{let p=.013888888888888888,x=.05;if(d.key==="ArrowLeft")s.hue=(s.hue-p+1)%1;else if(d.key==="ArrowRight")s.hue=(s.hue+p)%1;else if(d.key==="ArrowUp")s.saturation=jn(s.saturation+x,0,1);else if(d.key==="ArrowDown")s.saturation=jn(s.saturation-x,0,1);else return;u(),this.send({type:Ht.SET_COLOR,value:s}),d.preventDefault()}),u(),t.append(r,o,c)}renderContact(e){let t=this.createSection(this.text("contact","Contact")),i=e.contact?.state??"unknown",s={open:this.text("open","Open"),closed:this.text("closed","Closed"),unknown:this.text("unknown","Unknown")};this.appendValue(t,this.text("status","Status"),s[i]??s.unknown)}renderCover(e){let t=this.createSection(this.text("cover","Cover"));this.coverPositionControl=new ka({onCommand:o=>{this.coverPositionDraft={entityId:this.context.entityId,value:o.value},this.send(o)},translate:this.translate});let i=this.coverPositionDraft?.entityId===this.context.entityId?this.coverPositionDraft.value:null;this.coverPositionControl.update(e,this.busy,i),t.appendChild(this.coverPositionControl.element);let s=e.cover?.movement??"unknown",r=this.text(\`coverState.\${s}\`,s);s!=="unknown"&&this.appendValue(t,this.text("status","Status"),r);let a=Ne("div","device-details-actions");a.append(this.createAction(this.text("openCover","Open"),"\\u2191",{type:Ht.OPEN_COVER},e.controls?.openCover===!0),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Ht.STOP_COVER},e.controls?.stopCover===!0),this.createAction(this.text("closeCover","Close"),"\\u2193",{type:Ht.CLOSE_COVER},e.controls?.closeCover===!0)),t.appendChild(a)}renderThermostatDial(e,t,i,s,r){let{minimum:a,maximum:o,step:c}=wl(s),l=!!s&&!this.busy&&t.availability==="available",u=this.context?.entityId,h=this.targetTemperatureDraft?.entityId===u?this.targetTemperatureDraft.value:null,f=qh(Number.isFinite(h)?h:i,s),d=Ne("div","device-details-thermostat-dial");d.setAttribute("role","slider"),d.setAttribute("aria-label",this.text("targetTemperature","Target temperature")),d.setAttribute("aria-valuemin",String(a)),d.setAttribute("aria-valuemax",String(o)),d.setAttribute("aria-disabled",String(!l)),d.tabIndex=l?0:-1,this.targetTemperatureDial=d,this.disposeTargetTemperatureTouchGuard=Sl(d);let p=Xh("svg",{viewBox:\`0 0 \${wr.width} \${wr.height}\`,"aria-hidden":"true"});p.classList.add("device-details-thermostat-scale");let x=[],m=41;for(let ee=0;ee<m;ee+=1){let Te=ee/(m-1),et=ee%5===0,Qe=Wh(Te,119),K=Wh(Te,et?101:108),le=Xh("line",{x1:K.x,y1:K.y,x2:Qe.x,y2:Qe.y});le.classList.add("device-details-thermostat-tick"),et&&le.classList.add("is-major"),p.appendChild(le),x.push({element:le,fraction:Te})}let g=Xh("circle",{r:8});g.classList.add("device-details-thermostat-thumb"),p.appendChild(g);let w=Ne("div","device-details-thermostat-readout"),E=Ne("span","device-details-thermostat-target-label",this.text("targetTemperature","Target temperature")),y=Ne("span","device-details-thermostat-target-value"),T=Ne("span","device-details-thermostat-target-number"),b=Ne("span","device-details-thermostat-target-unit",r);y.append(T,b);let C=Number.isFinite(t.climate?.currentTemperature)?\`\${t.climate.currentTemperature.toFixed(1)} \${r}\`:this.text("unknown","Unknown"),v=Ne("span","device-details-thermostat-current",\`\${this.text("currentTemperature","Current temperature")}: \${C}\`);w.append(E,y,v),d.append(p,w);let S=Ne("div","device-details-thermostat-feedback"),P=Ne("span","device-details-thermostat-hint",l?this.text("temperatureDialHint","Drag along the arc to adjust"):""),I=Ne("span","device-details-thermostat-pending",this.text("temperaturePending","Will be sent shortly\\u2026"));I.setAttribute("role","status"),I.setAttribute("aria-live","polite");let O=this.targetTemperatureCommit.pending&&this.targetTemperatureDraft?.entityId===u;I.hidden=!O,S.append(P,I),this.targetTemperaturePendingIndicator=I,d.classList.toggle("is-pending",O);let U=Ne("div","device-details-thermostat-controls"),Y=Ne("button","device-details-thermostat-step");Y.type="button",Y.setAttribute("aria-label",this.text("decreaseTemperature","Decrease target temperature")),Y.append(Ne("span","device-details-thermostat-step-symbol","\\u2212"),Ne("span","device-details-thermostat-step-label",this.text("decreaseTemperature","Decrease target temperature")));let R=Ne("button","device-details-thermostat-step");R.type="button",R.setAttribute("aria-label",this.text("increaseTemperature","Increase target temperature")),R.append(Ne("span","device-details-thermostat-step-symbol","+"),Ne("span","device-details-thermostat-step-label",this.text("increaseTemperature","Increase target temperature"))),U.append(Y,R);let V=(ee,Te=!0)=>{let et=qh(ee,s);if(!Number.isFinite(et))return!1;f=et,Te&&(this.targetTemperatureDraft={entityId:u,value:f});let Qe=qE(f,s);for(let se of x)se.element.classList.toggle("is-active",se.fraction<=Qe+1e-6);let K=Wh(Qe,103);g.setAttribute("cx",String(K.x)),g.setAttribute("cy",String(K.y)),T.textContent=n0(f,c);let le=\`\${n0(f,c)} \${r}\`;return d.setAttribute("aria-valuenow",String(f)),d.setAttribute("aria-valuetext",le),Y.disabled=!l||f<=a,R.disabled=!l||f>=o,!0},z=ee=>{let Te=d.getBoundingClientRect();return!(Te.width>0)||!(Te.height>0)?!1:V(YE((ee.clientX-Te.left)*wr.width/Te.width,(ee.clientY-Te.top)*wr.height/Te.height,s))},k=null;d.addEventListener("pointerdown",ee=>{l&&(this.cancelTargetTemperatureCommit(),k=ee.pointerId,d.classList.add("is-adjusting"),d.setPointerCapture?.(ee.pointerId),z(ee),ee.preventDefault())}),d.addEventListener("pointermove",ee=>{ee.pointerId===k&&(z(ee),ee.preventDefault())}),d.addEventListener("pointerup",ee=>{ee.pointerId===k&&(z(ee),k=null,d.classList.remove("is-adjusting"),d.releasePointerCapture?.(ee.pointerId),this.scheduleTargetTemperatureCommit(f),ee.preventDefault())}),d.addEventListener("pointercancel",ee=>{ee.pointerId===k&&(k=null,d.classList.remove("is-adjusting"),this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null,V(i,!1))});let $=new Set(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"]),ie=!1;d.addEventListener("keydown",ee=>{if(!l||!$.has(ee.key))return;this.cancelTargetTemperatureCommit();let Te=f;(ee.key==="ArrowLeft"||ee.key==="ArrowDown")&&(Te-=c),(ee.key==="ArrowRight"||ee.key==="ArrowUp")&&(Te+=c),ee.key==="Home"&&(Te=a),ee.key==="End"&&(Te=o),ie=V(Te)||ie,ee.preventDefault()}),d.addEventListener("keyup",ee=>{!$.has(ee.key)||!ie||(ie=!1,this.scheduleTargetTemperatureCommit(f),ee.preventDefault())});let re=ee=>{this.cancelTargetTemperatureCommit(),V(f+ee*c)&&this.scheduleTargetTemperatureCommit(f)};Y.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),R.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),Y.addEventListener("click",()=>re(-1)),R.addEventListener("click",()=>re(1)),V(f,!1),e.append(d,U,S)}renderClimate(e){let t=this.createSection(this.text("climate","Climate"),"device-details-climate-section"),i=e.climate?.unit??"\\xB0C",s=e.climate?.targetTemperature,r=e.controls?.setTargetTemperature;Number.isFinite(s)?this.renderThermostatDial(t,e,s,r,i):Number.isFinite(e.climate?.currentTemperature)&&this.appendValue(t,this.text("currentTemperature","Current temperature"),\`\${e.climate.currentTemperature.toFixed(1)} \${i}\`),Number.isFinite(e.climate?.humidity)&&this.appendValue(t,this.text("humidity","Humidity"),\`\${Math.round(e.climate.humidity)}%\`),(typeof e.climate?.mode=="string"||e.controls?.setThermostatMode)&&this.appendEnumControl(t,this.text("mode","Mode"),e.climate.mode,e.controls?.setThermostatMode,Ht.SET_THERMOSTAT_MODE)}renderActivity(e){let t=this.createSection(this.text("activity","Activity")),i={alarm_motion:[this.text("detected","Detected"),this.text("clear","Clear")],alarm_presence:[this.text("present","Present"),this.text("away","Away")],alarm_occupancy:[this.text("occupied","Occupied"),this.text("unoccupied","Unoccupied")]};for(let s of e.activity??[]){let r=s.baseId??s.id,[a,o]=i[r]??[this.text("active","Active"),this.text("normal","Normal")];this.appendValue(t,this.capabilityLabel(r,s.label),s.active===null?this.text("unknown","Unknown"):s.active?a:o)}}renderSafety(e){let t=(e.safety??[]).some(s=>s.active===!0),i=this.createSection(this.text("safety","Safety"),t?"is-alert":"");for(let s of e.safety??[])this.appendValue(i,this.capabilityLabel(s.baseId??s.id,s.label),s.active===null?this.text("unknown","Unknown"):s.active?this.text("alarm","Alarm"):this.text("normal","Normal"))}renderFan(e){let t=this.createSection(this.text("fan","Fan"));e.fan&&(Number.isFinite(e.fan.speed)||e.controls?.setFanSpeed)&&this.appendNormalizedRange(t,{label:this.text("fanSpeed","Fan speed"),value:e.fan.speed,control:e.controls?.setFanSpeed,commandType:Ht.SET_FAN_SPEED}),(typeof e.fan?.mode=="string"||e.controls?.setFanMode)&&this.appendEnumControl(t,this.text("fanMode","Fan mode"),e.fan.mode,e.controls?.setFanMode,Ht.SET_FAN_MODE),e.fan&&(Number.isFinite(e.fan.targetHumidity)||e.controls?.setTargetHumidity)&&this.appendNormalizedRange(t,{label:this.text("targetHumidity","Target humidity"),value:e.fan.targetHumidity,control:e.controls?.setTargetHumidity,commandType:Ht.SET_TARGET_HUMIDITY})}renderMeasurements(e,t){let i=t==="environment",s=(e[t]??[]).filter(a=>!i||!e.climate||!["measure_temperature","measure_humidity"].includes(a.baseId??a.id));if(s.length===0)return;let r=this.createSection(this.text(i?"environment":"energy",i?"Environment":"Energy"));for(let a of s){let o=Number.isFinite(a.value)?\`\${Number(a.value.toFixed(2))}\${a.unit?\` \${a.unit}\`:""}\`:"\\u2013";this.appendValue(r,this.capabilityLabel(a.baseId??a.id,a.label),o)}}renderHealth(e){let t=(e.health?.alerts??[]).filter(r=>r.active===!0),i=Number.isFinite(e.health?.batteryPercent);if(!i&&t.length===0)return;let s=this.createSection(this.text("deviceHealth","Device health"),t.length>0?"is-warning":"");i&&this.appendValue(s,this.text("battery","Battery"),\`\${Math.round(e.health.batteryPercent)}%\`);for(let r of t)this.appendValue(s,this.capabilityLabel(r.id,r.label),this.text("attentionRequired","Attention required"))}renderCleaning(e){let t=this.createSection(this.text("cleaning","Cleaning")),i=e.cleaning?.state??"unknown";this.appendValue(t,this.text("status","Status"),this.text(\`cleaningState.\${i}\`,i)),Number.isFinite(e.cleaning?.batteryPercent)&&this.appendValue(t,this.text("battery","Battery"),\`\${Math.round(e.cleaning.batteryPercent)}%\`);let s=Ne("div","device-details-actions");s.append(this.createAction(this.text("start","Start"),"\\u25B6",{type:Ht.START_CLEANING},e.controls?.startCleaning===!0&&i!=="cleaning"),this.createAction(this.text("pause","Pause"),"\\u2016",{type:Ht.PAUSE_CLEANING},e.controls?.pauseCleaning===!0&&i==="cleaning"),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:Ht.STOP_CLEANING},e.controls?.stopCleaning===!0&&!["idle","docked"].includes(i)),this.createAction(this.text("returnToBase","Return to base"),"\\u2302",{type:Ht.RETURN_TO_BASE},e.controls?.returnToBase===!0&&!["docked","returning"].includes(i))),t.appendChild(s)}renderLock(e){let t=this.createSection(this.text("lock","Lock")),i=typeof e.lock?.isLocked=="boolean"?e.lock.isLocked:null,s=i===null?this.text("unknown","Unknown"):i?this.text("locked","Locked"):this.text("unlocked","Unlocked");this.appendValue(t,this.text("status","Status"),s);let r=Ne("div","device-details-actions");r.append(this.createAction(this.text("unlock","Unlock"),"\\u{1F513}",{type:Ht.UNLOCK},e.controls?.unlock===!0&&i!==!1),this.createAction(this.text("lockAction","Lock"),"\\u{1F512}",{type:Ht.LOCK},e.controls?.lock===!0&&i!==!0)),t.appendChild(r)}render(){let e=this.context?.state??{},t=typeof e.name=="string"&&e.name.trim()?e.name.trim():this.text("device","Device");this.title.textContent=t;let i=this.text("close","Close");this.closeButton.setAttribute("aria-label",i),this.closeButton.title=i,this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.coverPositionHadFocus||=this.coverPositionControl?.slider===document.activeElement,this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.body.replaceChildren(),this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,e.availability!=="available"&&this.body.appendChild(Ne("div","device-details-unavailable",this.text("unavailable","Unavailable")));let s=new Set(this.context?.capabilities??[]);s.has("safety")&&this.renderSafety(e),s.has("activity")&&this.renderActivity(e),s.has("power")&&this.renderPower(e),s.has("brightness")&&this.renderBrightness(e),s.has("colorTemperature")&&this.renderColorTemperature(e),s.has("color")&&this.renderColor(e),s.has("contact")&&this.renderContact(e),s.has("cover")&&this.renderCover(e),s.has("climate")&&this.renderClimate(e),s.has("fan")&&this.renderFan(e),s.has("environment")&&this.renderMeasurements(e,"environment"),s.has("energy")&&this.renderMeasurements(e,"energy"),s.has("health")&&this.renderHealth(e),s.has("cleaning")&&this.renderCleaning(e),s.has("lock")&&this.renderLock(e),this.coverPositionHadFocus&&!this.busy&&(this.coverPositionControl?.slider.disabled||this.coverPositionControl?.slider.focus({preventScroll:!0}),this.coverPositionHadFocus=!1),s.size===0&&this.body.appendChild(Ne("p","device-details-empty",this.text("noInformation","No supported device information")))}dispose(){this.disposed||(this.disposed=!0,this.close({notify:!1}),this.targetTemperatureCommit.dispose(),document.removeEventListener("keydown",this.onKeyDown),this.layer.remove())}};var Ha=class{constructor({overlay:e}){this.overlay=e}open(e,t){return this.overlay.open(e,t),!0}update(e){this.overlay.update(e)}setBusy(e){this.overlay.setBusy(e)}close(){this.overlay.close({notify:!1})}dispose(){this.overlay.dispose()}};var jE=Object.freeze({power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v9"/><path d="M6.6 5.4a8 8 0 1 0 10.8 0"/></svg>',cover:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M9 19l3-2 3 2"/></svg>',climate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M13 7v9"/></svg>',cleaning:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M6 17.5h12"/></svg>',contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="13" height="18" rx="1"/><circle cx="14.5" cy="12" r=".8"/></svg>',lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>',activity:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></svg>',safety:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 19h17L12 3Z"/><path d="M12 9v4.5M12 17h.01"/></svg>',fan:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1.5-4.8 1-7 3.5-6 2.2.9 1.6 4.8-1.9 7M13.8 13c4.9 1.1 5.6 4.4 3.5 6-1.9 1.5-5-1-5.2-5M10.3 13c-3.4 3.7-6.5 2.6-6.8 0-.3-2.4 3.4-3.8 6.6-1.3"/></svg>',environment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5C5 11 9 6.5 18.5 5c.5 8.5-3.6 14-9 14A4.5 4.5 0 0 1 5 15.5Z"/><path d="M7 18c2-4 5-6 9-9"/></svg>',energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/></svg>',health:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l2-5 4 10 2-5h4"/><path d="M5 5h14v14H5z"/></svg>',details:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>'}),Va=Object.freeze({minimumVisible:6,maximumVisible:20,horizontalPitch:48});function ZE(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();if(!e)return null;let t=e.split(".")[0];return e.startsWith("windowcoverings_")||t==="garagedoor_closed"?"cover":["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(t)?"safety":["alarm_motion","alarm_presence","alarm_occupancy"].includes(t)?"activity":e.startsWith("vacuum_")||e.startsWith("vacuumcleaner_")?"cleaning":e==="target_temperature"||e.startsWith("thermostat_")?"climate":["fan_speed","fan_mode","target_humidity"].includes(t)?"fan":t==="onoff"?"power":["locked","locked_status","lock","unlock","deadbolt"].includes(t)?"lock":t==="alarm_contact"?"contact":t==="measure_temperature"?"climate":["measure_humidity","measure_luminance","measure_aqi","measure_co2","measure_pm25","measure_tvoc","measure_pressure","measure_noise"].includes(t)?"environment":["measure_power","meter_power","measure_current","measure_voltage","meter_gas","meter_water"].includes(t)?"energy":t==="measure_battery"||t.startsWith("alarm_")?"health":null}function KE(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();return["windowcoverings","blinds","curtain","shutter"].includes(e)?"cover":["vacuumcleaner","vacuum"].includes(e)?"cleaning":["thermostat","heater"].includes(e)?"climate":["fan","airconditioning","airpurifier","humidifier","dehumidifier"].includes(e)?"fan":e==="lock"?"lock":["garagedoor","gate"].includes(e)?"cover":["meter","smartmeter"].includes(e)?"energy":["light","socket"].includes(e)?"power":null}function JE(n,e=null,t=null){if(n?.safety)return"safety";let i=KE(n?.deviceClass);if(i==="lock")return"lock";let s=ZE(t);return s||i||(n?.cleaning?"cleaning":n?.cover?"cover":n?.lock?"lock":n?.activity?"activity":n?.fan?"fan":e==="light"&&n?.power?"power":n?.climate?"climate":n?.power?"power":n?.energy?"energy":n?.environment?"environment":n?.health?"health":n?.contact?"contact":"details")}function QE(n,e){let t=typeof n=="string"?n.trim().toLowerCase():"",i=t.split(".")[0];return["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(i)?900:["alarm_motion","alarm_presence","alarm_occupancy"].includes(i)?800:t.startsWith("vacuum_")||t.startsWith("vacuumcleaner_")?600:t.startsWith("windowcoverings_")?500:t==="target_temperature"||t.startsWith("thermostat_")?400:["locked","locked_status","lock","unlock","deadbolt"].includes(t)?375:t==="onoff"?350:t==="alarm_contact"?300:t==="measure_temperature"?100:{safety:90,activity:80,cleaning:60,cover:50,climate:40,lock:38,power:35,contact:30,fan:28,energy:20,environment:18,health:16,details:0}[e]??0}function ew(n){let e=Number.isFinite(n)&&n>0?n:Va.minimumVisible*Va.horizontalPitch;return Math.min(Va.maximumVisible,Math.max(Va.minimumVisible,Math.floor(e/Va.horizontalPitch)))}function tw(n){let e=n?.state,t=Number.isFinite(n?.priority)?n.priority:0;return(e?.safety??[]).some(s=>s.active===!0)||e?.health?.alerts?.some(s=>s.active===!0)===!0?t+3e3:n?.type==="power"&&e?.power?.isOn===!0?t+1400:(e?.activity??[]).some(s=>s.active===!0)?t+1200:e?.cleaning&&!["docked","idle"].includes(e.cleaning.state)?t+1e3:e?.cover?.movement&&e.cover.movement!=="stopped"?t+800:e?.climate?.heatingActive===!0?t+700:n?.type==="fan"&&(e?.power?.isOn===!0||Number.isFinite(e?.fan?.speed)&&e.fan.speed>0)?t+600:e?.availability==="unavailable"?t-100:t}function r0(n,e){return(n.left-e.left)**2+(n.top-e.top)**2}function nw(n,e,t,i,s){let r=[...n],a=[];for(;a.length<e&&r.length>0;){let o=0,c=-1/0;for(let l=0;l<r.length;l+=1){let u=r[l],h=[...t,...a],f=h.length>0?Math.min(...h.map(p=>r0(u,p))):-r0(u,{left:i/2,top:s/2}),d=r[o];(f>c||f===c&&u.sceneObjectId.localeCompare(d.sceneObjectId)<0)&&(o=l,c=f)}a.push(r.splice(o,1)[0])}return a}function iw(n,e,t){let i=ew(e);if(n.length<=i)return n;let s=new Map;for(let a of n){let o=tw(a.record);s.has(o)||s.set(o,[]),s.get(o).push(a)}let r=[];for(let a of[...s.keys()].sort((o,c)=>c-o)){let o=s.get(a),c=i-r.length;if(c<=0)break;o.length<=c?r.push(...o):r.push(...nw(o,c,r,e,t))}return r}function sw({entities:n,bindings:e,statesByDeviceId:t}){let i=new Map;for(let s of n.values()){let r=e.get(s.id);if(!r?.deviceId)continue;let a=t.get(r.deviceId),o=JE(a,s.kind,r.capability),c={binding:r,entity:s,priority:QE(r.capability,o),state:a,type:o},l=i.get(r.deviceId);(!l||c.priority>l.priority)&&i.set(r.deviceId,c)}return[...i.values()]}function Tr(n){n.preventDefault(),n.stopPropagation()}var Ga=class{constructor({host:e,onOpenDetails:t,onTogglePower:i,translate:s=(r,a)=>a}){this.onOpenDetails=t,this.onTogglePower=i,this.translate=s,this.records=new Map,this.enabled=!0,this.suppressed=!1,this.bounds=new tn,this.anchor=new D,this.projected=new D,this.size=new D,this.layer=document.createElement("div"),this.layer.className="device-affordance-layer",this.layer.hidden=!0,this.layer.setAttribute("aria-label",this.translate("deviceDetails.label","Device details")),e.appendChild(this.layer)}createRecord(e,t,i){let s=document.createElement("button");s.type="button",s.className="device-affordance-button",s.dataset.markerType=i,s.dataset.sceneObjectId=e,s.innerHTML=\`\${jE[i]}<span class="device-affordance-device-icon" aria-hidden="true"></span>\`;let r={deviceId:null,element:s,entity:t,pressGesture:null,priority:0,state:null,suppressClickUntil:0,type:i};r.pressGesture=new Sr({onLongPress:()=>{if(this.records.get(e)!==r)return!1;let o=this.onOpenDetails(e)===!0;return o&&(r.suppressClickUntil=Date.now()+1e3,globalThis.getSelection?.()?.removeAllRanges()),o}});let a=()=>{this.records.get(e)===r&&(r.type==="power"&&r.state?.availability==="available"&&typeof r.state.power?.isOn=="boolean"&&r.state.controls?.setPower===!0?this.onTogglePower(e):this.onOpenDetails(e))};return s.addEventListener("pointerdown",o=>{Tr(o);try{s.setPointerCapture?.(o.pointerId)}catch{}r.pressGesture.pointerDown(o)}),s.addEventListener("pointermove",o=>{Tr(o),r.pressGesture.pointerMove(o)}),s.addEventListener("pointerup",o=>{Tr(o);let c=r.pressGesture.pointerUp(o);r.suppressClickUntil=Math.max(r.suppressClickUntil,Date.now()+500),c&&a()}),s.addEventListener("pointercancel",o=>{Tr(o),r.pressGesture.pointerCancel(o)}),s.addEventListener("lostpointercapture",o=>{r.pressGesture.pointerCancel(o)}),s.addEventListener("contextmenu",Tr),s.addEventListener("click",o=>{Tr(o),!(Date.now()<r.suppressClickUntil)&&a()}),this.layer.appendChild(s),this.records.set(e,r),r}removeRecord(e,t){t.pressGesture.dispose(),t.element.remove(),this.records.delete(e)}updateRecord(e,t){e.state=t;let i=typeof t?.icon?.dataUrl=="string"&&t.icon.dataUrl.startsWith("data:image/svg+xml;base64,")?t.icon.dataUrl:null;e.element.classList.toggle("has-device-icon",!!i),i?e.element.style.setProperty("--device-affordance-icon",\`url("\${i}")\`):e.element.style.removeProperty("--device-affordance-icon");let s=e.type==="power",r=s&&t?.power?.isOn===!0,a=t?.availability!=="available",o=(t?.safety??[]).some(f=>f.active===!0)||t?.health?.alerts?.some(f=>f.active===!0)===!0,c=String(t?.cleaning?.state??"").toLowerCase(),l=(t?.activity??[]).some(f=>f.active===!0)||e.type==="cleaning"&&t?.availability==="available"&&c.length>0&&!["docked","idle","paused"].includes(c)||e.type==="fan"&&(t?.power?.isOn===!0||Number.isFinite(t?.fan?.speed)&&t.fan.speed>0||t?.fan?.mode==="on");e.element.classList.toggle("is-on",r),e.element.classList.toggle("is-alert",o),e.element.classList.toggle("is-active",l),e.element.classList.toggle("is-unavailable",a),s?e.element.setAttribute("aria-pressed",String(r)):e.element.removeAttribute("aria-pressed");let u=typeof t?.name=="string"&&t.name.trim()?t.name.trim():this.translate("deviceDetails.device","Device"),h=s&&!a?this.translate(r?"quickControls.power.turnOff":"quickControls.power.turnOn",r?"Turn off":"Turn on"):this.translate("deviceDetails.label","Device details");e.element.setAttribute("aria-label",\`\${u}: \${h}\`),e.element.title=h}sync({entities:e,bindings:t,statesByDeviceId:i}){let s=new Set,r=sw({entities:e,bindings:t,statesByDeviceId:i});for(let{binding:a,entity:o,priority:c,state:l,type:u}of r){s.add(o.id);let h=this.records.get(o.id);h&&h.type!==u&&(this.removeRecord(o.id,h),h=null),h??=this.createRecord(o.id,o,u),h.entity=o,h.deviceId=a.deviceId,h.priority=c,this.updateRecord(h,l)}for(let[a,o]of this.records)s.has(a)||this.removeRecord(a,o);this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setEnabled(e){this.enabled=!!e,this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setSuppressed(e){if(this.suppressed=!!e,this.suppressed)for(let t of this.records.values()){let i=[...t.pressGesture.activePointers.keys()];t.pressGesture.reset();for(let s of i)try{t.element.hasPointerCapture?.(s)&&t.element.releasePointerCapture(s)}catch{}}this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}layout(e,t,i=[]){if(this.layer.hidden)return[];let s=Math.max(t.clientWidth,1),r=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let a=[];for(let[u,h]of this.records){let f=h.entity.controlAnchor;f?(f.updateWorldMatrix(!0,!1),f.getWorldPosition(this.anchor),this.anchor.y+=.35):(h.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(h.entity.root)),!f&&this.bounds.isEmpty()?(h.entity.root.getWorldPosition(this.anchor),this.anchor.y+=.35):f||(this.bounds.getCenter(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.16,this.size.y*.05)),this.projected.copy(this.anchor).project(e);let d=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;h.element.hidden=!d,d&&a.push({left:(this.projected.x*.5+.5)*s,record:h,sceneObjectId:u,top:(-this.projected.y*.5+.5)*r})}let o=iw(a,s,r),c=new Set(o.map(({sceneObjectId:u})=>u));for(let u of a)u.record.element.hidden=!c.has(u.sceneObjectId);o.sort((u,h)=>u.top-h.top||u.left-h.left||u.sceneObjectId.localeCompare(h.sceneObjectId));let l=[...i];for(let u of o){let h=Gh({left:u.left,top:u.top,width:s,height:r,controlWidth:u.record.element.offsetWidth||38,controlHeight:u.record.element.offsetHeight||38,collisionGap:5,obstacles:l});h&&(u.record.element.style.left=\`\${h.position.left}px\`,u.record.element.style.top=\`\${h.position.top}px\`,l.push(h.rectangle))}return l}clear(){for(let[e,t]of this.records)this.removeRecord(e,t);this.layer.hidden=!0}dispose(){this.clear(),this.layer.remove()}};var B0=Qn(ns());var rw=Object.freeze(["auto","light","dark"]),c0=Object.freeze(["auto","day","evening","night"]),$h=Object.freeze({resolvedTheme:"light",backgroundStyle:"neutral-light",uiContrast:"dark",ambientIntensityFactor:1,keyIntensityFactor:1,fillIntensityFactor:1,toneMappingExposure:1.05}),aw=Object.freeze({resolvedTheme:"dark",backgroundStyle:"warm-evening",uiContrast:"light",ambientIntensityFactor:.62,keyIntensityFactor:.58,fillIntensityFactor:.55,toneMappingExposure:1.025}),a0=Object.freeze({resolvedTheme:"dark",backgroundStyle:"neutral-dark",uiContrast:"light",ambientIntensityFactor:.28,keyIntensityFactor:.24,fillIntensityFactor:.22,toneMappingExposure:1}),ow=Object.freeze({day:$h,evening:aw,night:a0,light:$h,dark:a0});function cw(n){return rw.includes(n)?n:"auto"}function Wa(n){return c0.includes(n)?n:"auto"}function o0(n){return n==="dark"||n==="light"?n:null}function jh({mode:n="auto",timeOfDay:e="auto",autoBrightness:t=!0,hostTheme:i=null,systemTheme:s="light"}={}){let r=cw(n),a=r==="auto"?o0(i)??o0(s)??"light":r,o=Wa(e),c=o==="auto"?a==="dark"?"night":"day":o,l=ow[c],u=t?l:$h;return Object.freeze({themeMode:r,timeOfDayMode:o,resolvedTimeOfDay:c,...l,autoBrightness:t!==!1,ambientIntensityFactor:u.ambientIntensityFactor,keyIntensityFactor:u.keyIntensityFactor,fillIntensityFactor:u.fillIntensityFactor,toneMappingExposure:u.toneMappingExposure})}function lw(n,e){return!!(n&&e&&n.themeMode===e.themeMode&&n.timeOfDayMode===e.timeOfDayMode&&n.resolvedTimeOfDay===e.resolvedTimeOfDay&&n.autoBrightness===e.autoBrightness&&n.resolvedTheme===e.resolvedTheme)}function Tl(n,{renderer:e=null,rootElement:t=null,runtimes:i=[]}={}){if(n){t&&(t.dataset.dashboardThemeMode=n.themeMode,t.dataset.dashboardTheme=n.resolvedTheme,t.dataset.dashboardTimeOfDayMode=n.timeOfDayMode,t.dataset.dashboardTimeOfDay=n.resolvedTimeOfDay,t.dataset.dashboardBackground=n.backgroundStyle,t.dataset.dashboardContrast=n.uiContrast,t.style.colorScheme=n.resolvedTheme),e&&(e.toneMappingExposure=n.toneMappingExposure);for(let s of i)Mm(s?.lighting,n)}}function Al(n,e,{mode:t="auto",timeOfDay:i="auto",autoBrightness:s=!0,renderer:r=null,rootElement:a=null,runtimes:o=[],afterApply:c=null,requestRender:l=null}={}){let u=jh({mode:t,timeOfDay:i,autoBrightness:s,...e});return lw(n,u)?n:(Tl(u,{renderer:r,rootElement:a,runtimes:o}),c?.(u),l?.(),u)}var is=Object.freeze({compactWidth:320,spaciousWidth:640,shortHeight:320,tallHeight:720,portraitAspect:.8,landscapeAspect:1.2,maxDevicePixelRatio:2,maxRenderPixels:21e5});function Zh(n,e=1){return Number.isFinite(n)&&n>0?n:e}function Kh({width:n,height:e,devicePixelRatio:t=1}={}){let i=Zh(n),s=Zh(e),r=i/s,a=i<is.compactWidth?"compact":i>=is.spaciousWidth?"spacious":"standard",o=s<is.shortHeight?"short":s>=is.tallHeight?"tall":"standard",c=r<=is.portraitAspect?"portrait":r>=is.landscapeAspect?"landscape":"balanced",l=Math.min(Math.max(Zh(t),1),is.maxDevicePixelRatio),u=Math.sqrt(is.maxRenderPixels/(i*s)),h=Math.round(Math.max(1,Math.min(l,u))*1e3)/1e3;return Object.freeze({width:i,height:s,aspect:r,size:a,heightClass:o,orientation:c,renderPixelRatio:h})}function l0(n,e){return!!(n&&e&&n.size===e.size&&n.heightClass===e.heightClass&&n.orientation===e.orientation&&n.renderPixelRatio===e.renderPixelRatio)}function Jh(n,{rootElement:e=null,shellElement:t=null}={}){if(n)for(let i of[e,t])i&&(i.dataset.dashboardLayoutSize=n.size,i.dataset.dashboardLayoutHeight=n.heightClass,i.dataset.dashboardLayoutOrientation=n.orientation)}function Cl(n,e){let t=Math.max(Number(e)||0,0);return n?.orientation!=="landscape"?t:Math.min(t,Math.max(116,Math.floor(t*.58)))}var h2=Object.freeze({minimumKelvin:2e3,maximumKelvin:6500}),uw=2850;function Xa(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function Rl(n){return typeof n=="number"&&Number.isFinite(n)?n:null}function u0(n){let e=Xa(n,2e3,6500)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,i=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,s=e>=66?255:e<=19?0:138.5177312231*Math.log(e-10)-305.0447927307,r=a=>Xa(a/255*.88+.12);return{r:r(t),g:r(i),b:r(s)}}function hw(n,e){let t=(n%1+1)%1,i=Xa(e),s=t*6,r=i,a=r*(1-Math.abs(s%2-1)),o;s<1?o=[r,a,0]:s<2?o=[a,r,0]:s<3?o=[0,r,a]:s<4?o=[0,a,r]:s<5?o=[a,0,r]:o=[r,0,a];let c=1-r,l=u=>{let h=Xa(u+c);return Math.abs(h)<1e-12?0:Math.abs(1-h)<1e-12?1:h};return{r:l(o[0]),g:l(o[1]),b:l(o[2])}}function h0(n){let e=n?.availability==="available"&&typeof n?.power?.isOn=="boolean",t=e&&n.power.isOn,i=Rl(n?.light?.brightness),s=i===null?1:Xa(i),r=Rl(n?.light?.color?.hue),a=Rl(n?.light?.color?.saturation),o=Rl(n?.light?.colorTemperatureKelvin),c=r!==null&&a!==null,l=o!==null,u=["color","temperature","white"].includes(n?.light?.mode)?n.light.mode:c?"color":l?"temperature":"white",h=u==="color"&&!c?l?"temperature":"white":u==="temperature"&&!l?c?"color":"white":u,f,d=null;return h==="color"&&c?f=hw(r,a):h==="temperature"&&l?(d=o,f=u0(o)):f=u0(uw),{known:e,on:t,brightness:s,hasDim:i!==null,colorMode:h,rgb:f,...d===null?{}:{colorTemperature:d}}}var d0=14,dw=280,f0=1776928,fw=5593180;function Qh(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function pw(n){return n<.5?4*n*n*n:1-(-2*n+2)**3/2}function Il(n,e){let t=Qh(e);n.slats.forEach((i,s)=>{let r=n.topY-n.headrailHeight-(s+.5)*n.fullSpacing,a=n.topY-n.headrailHeight-(s+.5)*n.stackSpacing;i.position.y=ht.lerp(r,a,t),i.rotation.x=-.05*(1-t)}),n.fraction=t}function mw(n){let e=n.visual?.coverVisual;if(e)return e;if(n.elementType!=="window"||!n.visual?.size)return null;let{width:t,height:i,depth:s}=n.visual.size,r=Math.max(t-.1,.18),a=Math.max(i-.1,.32),o=Math.min(Math.max(a*.04,.035),.055),c=Math.max((a-o)/d0,.018),l=Math.min(Math.max(a*.004,.0035),.006),u=Math.max(c+.006,.024),h=new Cn({color:f0,roughness:.58,metalness:.08}),f=new yt;f.name="DashboardWindowCover",f.position.set(t/2,.05,Math.max(s,.02)*.1),f.userData.deviceVisual="cover",n.root.add(f);let d=new Wt(r,o,.06),p=new gt(d,h);p.name="DashboardWindowCoverRail",p.position.y=a-o/2,p.castShadow=!0,p.receiveShadow=!0,f.add(p);let x=new Wt(r*.98,u,.052),m=Array.from({length:d0},(w,E)=>{let y=new gt(x,h);return y.name=\`DashboardWindowCoverSlat:\${E}\`,y.castShadow=!0,y.receiveShadow=!0,f.add(y),y}),g={root:f,rail:p,slats:m,material:h,topY:a,headrailHeight:o,fullSpacing:c,stackSpacing:l,fraction:1,transition:null,initialized:!1};return Il(g,1),n.visual.coverVisual=g,g}function p0(n,e,t=0){if(n.elementType!=="window")return!1;if(!e?.cover)return n.visual?.coverVisual&&(n.visual.coverVisual.root.visible=!1),!1;let i=mw(n);if(!i)return!1;i.root.visible=!0;let s=e.availability==="available";i.material.color.setHex(s?f0:fw),i.root.userData.coverAvailability=e.availability,i.root.userData.coverMovement=e.cover.movement;let r=typeof e.cover.position=="number"&&Number.isFinite(e.cover.position)?Qh(e.cover.position):null;return r===null?(i.initialized||Il(i,1),i.initialized=!0,i.transition=null,!1):i.initialized?Math.abs(r-i.fraction)<=1e-6?(i.transition=null,!1):(i.transition={from:i.fraction,to:r,startedAt:t,duration:dw},!0):(Il(i,r),i.initialized=!0,!0)}function gw(n,e){let t=n.visual?.coverVisual,i=t?.transition;if(!i)return!1;let s=Qh((e-i.startedAt)/i.duration);return Il(t,ht.lerp(i.from,i.to,pw(s))),s>=1&&(t.transition=null),s<1}function m0(n,e){let t=!1;for(let i of n.values())t=gw(i,e)||t;return t}var M0=new Set(["alarm_occupancy","alarm_presence","occupancy","presence"]),g0=5680504,S0=5680504,xw=6662616,vw=14179671,un=Object.freeze({fadeInMs:600,fadeOutMs:1500,floorOffset:.006,wallGap:.02,innerWidth:.035,outerWidth:.11,innerVerticalOffset:8e-4,innerOpacity:.42,outerOpacity:.14,pulseDurationMs:3600,minimumPulseOpacity:.72}),E0=Object.freeze({coreOpacity:.34}),ui=Object.freeze({maximumFrameDeltaMs:100,maximumPathPoints:128,maximumSpeedMetersPerSecond:2,minimumSegmentLength:.01,minimumSpeedMetersPerSecond:.02}),Ci=Object.freeze({gridSpacing:.25,maximumGridPoints:2400,maximumLandmarks:5,maximumRobotClearance:.34,minimumLandmarkDistance:.8,minimumRobotClearance:.18,robotClearancePadding:.04,speedMetersPerSecond:.22}),_w=new Set(["chair_basic","climate","device","rug","table_basic"]),ed=.002,yw=4;function nd(n){return typeof n=="string"?n.trim().toLowerCase().split(".")[0]:""}function bw(n){return M0.has(nd(n?.capability))}function Mw(n){return M0.has(nd(n?.baseId??n?.id))}function Sw(n){return n?.availability==="available"&&(n.activity??[]).some(e=>Mw(e)&&e.active===!0)}function Ew(n){if(n?.availability!=="available")return"inactive";let e=String(n?.cleaning?.state??"").trim().toLowerCase(),t=String(n?.cleaning?.error??"").trim().toLowerCase();return["error","fault","blocked"].includes(e)||t&&!["no error","none","ok"].includes(t)?"error":["returning","returning_to_base","return-to-base","docking"].includes(e)?"returning":["active","cleaning","mowing","on","running"].includes(e)?"working":"inactive"}function id(n){if(!n||(n.coordinateSpace??"floor")!=="floor")return null;let e=[];for(let s of n.path??[]){if(e.length>=ui.maximumPathPoints)break;if(!Number.isFinite(s?.x)||!Number.isFinite(s?.z))continue;let r={x:s.x,z:s.z};(e.length===0||Math.sqrt(Zn(e[e.length-1],r))>=ui.minimumSegmentLength)&&e.push(r)}if(e.length<2)return null;let t=ht.clamp(Number(n.speedMetersPerSecond)||.25,ui.minimumSpeedMetersPerSecond,ui.maximumSpeedMetersPerSecond);return{coordinateSpace:"floor",loop:n.loop===!0,path:e,speedMetersPerSecond:t}}function w0(n){let e=id(n);if(!e)return null;let{loop:t,path:i,speedMetersPerSecond:s}=e,r=[],a=t?i.length:i.length-1,o=0;for(let c=0;c<a;c+=1){let l=i[c],u=i[(c+1)%i.length],h=Math.sqrt(Zn(l,u));h<ui.minimumSegmentLength||(r.push({end:u,length:h,start:l,startDistance:o}),o+=h)}return r.length===0||o<=0?null:{...e,segments:r,signature:JSON.stringify(e),totalDistance:o}}function Zn(n,e){return(n.x-e.x)**2+(n.z-e.z)**2}function ss(n){return n.length<3?0:n.reduce((e,t,i)=>{let s=n[(i+1)%n.length];return e+t.x*s.z-s.x*t.z},0)/2}function Ar(n,e){return n.x*e.z-n.z*e.x}function Ln(n,e){return{x:n.x-e.x,z:n.z-e.z}}function Dl(n,e,t){return{x:n.x+e.x*t,z:n.z+e.z*t}}function x0(n){let e=Math.hypot(n.x,n.z);return e<=ed?null:{x:n.x/e,z:n.z/e}}function sd(n){let e=[];for(let t of n??[])!Number.isFinite(t?.x)||!Number.isFinite(t?.z)||(e.length===0||Zn(e[e.length-1],t)>ed**2)&&e.push({x:t.x,z:t.z});return e.length>1&&Zn(e[0],e[e.length-1])<=ed**2&&e.pop(),ss(e)<0&&e.reverse(),e}function Rr(n,e){if(!n||e.length<3)return!1;let t=!1,i=e[e.length-1];for(let s of e){if(s.z>n.z!=i.z>n.z){let a=(i.x-s.x)*(n.z-s.z)/(i.z-s.z)+s.x;n.x<a&&(t=!t)}i=s}return t}function ww(n,e,t,i){let s=Ar(Ln(e,n),Ln(t,n)),r=Ar(Ln(e,n),Ln(i,n)),a=Ar(Ln(i,t),Ln(n,t)),o=Ar(Ln(i,t),Ln(e,t));return s*r<-1e-6&&a*o<-1e-6}function T0(n){if(n.length<4)return!1;for(let e=0;e<n.length;e+=1){let t=(e+1)%n.length;for(let i=e+1;i<n.length;i+=1){let s=(i+1)%n.length;if(!(t===i||s===e||e===i)&&ww(n[e],n[t],n[i],n[s]))return!0}}return!1}function Tw(n,e,t){let i=Ln(t,e),s=i.x**2+i.z**2;if(s<=1e-6)return Math.sqrt(Zn(n,e));let r=Ln(n,e),a=ht.clamp((r.x*i.x+r.z*i.z)/s,0,1);return Math.sqrt(Zn(n,Dl(e,i,a)))}function A0(n,e){return e.reduce((t,i,s)=>Math.min(t,Tw(n,i,e[(s+1)%e.length])),1/0)}function Aw(n){let e=String(n?.assetKey??n?.visualType??"").trim();if(n?.kind==="light"||e==="robotVacuum"||_w.has(e))return null;let t=n?.dimensions??n?.size,i=Number(t?.width),s=Number(t?.depth),r=Number(n?.position?.x),a=Number(n?.position?.z);return![i,s,r,a].every(Number.isFinite)||i<=.04||s<=.04?null:{depth:s,rotation:ht.degToRad(Number(n?.rotation?.y)||0),width:i,x:r,z:a}}function C0(n,e,t){let i=n.x-e.x,s=n.z-e.z,r=Math.cos(e.rotation),a=Math.sin(e.rotation),o=r*i+a*s,c=-a*i+r*s;return Math.abs(o)<=e.width/2+t&&Math.abs(c)<=e.depth/2+t}function Cw(n,e,t,i){return Rr(n,e)&&A0(n,e)>=i&&!t.some(s=>C0(n,s,i))}function R0(n,e,t,i){let s=Math.sqrt(Zn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let a=0;a<=r;a+=1){let o=a/r;if(!t({x:ht.lerp(n.x,e.x,o),z:ht.lerp(n.z,e.z,o)}))return!1}return!0}function Rw(n,e,t,i){let s=Math.sqrt(Zn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let a=1;a<=r;a+=1){let o=a/r;if(!t({x:ht.lerp(n.x,e.x,o),z:ht.lerp(n.z,e.z,o)}))return!1}return!0}function Iw(n,e,t){n[e].push(t),n[t].push(e)}function I0(n,e){let t=[],i=[e],s=new Set(i);for(let r=0;r<i.length;r+=1){let a=i[r];t.push(a);for(let o of n[a])s.has(o)||(s.add(o),i.push(o))}return t}function Pw(n){let e=[],t=new Map;for(let i=0;i<n.length;i+=1){if(t.has(i))continue;let s=I0(n,i),r=e.length;e.push(s);for(let a of s)t.set(a,r)}return{componentByPoint:t,components:e}}function v0(n,e,t){if(e===t)return[e];let i=[e],s=new Map([[e,null]]);for(let r=0;r<i.length;r+=1){let a=i[r];for(let o of n[a])if(!s.has(o)){if(s.set(o,a),o===t){let c=[t],l=a;for(;l!==null;)c.push(l),l=s.get(l);return c.reverse()}i.push(o)}}return null}function _0(n,e,t){if(n.length<=2)return n;let i=[n[0]],s=0;for(;s<n.length-1;){let r=s+1;for(let a=n.length-1;a>s+1;a-=1)if(R0(n[s],n[a],e,t)){r=a;break}i.push(n[r]),s=r}return i}function Dw(n,e){return(n?.rooms??[]).map(t=>({room:t,boundary:sd(t?.polygon)})).filter(({boundary:t})=>Rr(e,t)).sort((t,i)=>Math.abs(ss(t.boundary))-Math.abs(ss(i.boundary)))[0]??null}function P0({activeFloor:n,excludedObjectId:e=null,origin:t,robotSize:i=null}={}){if(!Number.isFinite(t?.x)||!Number.isFinite(t?.z))return null;let s=Dw(n,t);if(!s||s.boundary.length<3)return null;let r=Math.max(Number(i?.width)||.42,.18),a=Math.max(Number(i?.depth)||.42,.18),o=ht.clamp(Math.max(r,a)/2+Ci.robotClearancePadding,Ci.minimumRobotClearance,Ci.maximumRobotClearance),c=(n?.objects??[]).filter(k=>k?.id!==e&&Rr(k?.position,s.boundary)).map(Aw).filter(Boolean),l=k=>Cw(k,s.boundary,c,o),u=k=>Rr(k,s.boundary)&&!c.some($=>C0(k,$,.02)),h=s.boundary.reduce((k,$)=>({maximumX:Math.max(k.maximumX,$.x),maximumZ:Math.max(k.maximumZ,$.z),minimumX:Math.min(k.minimumX,$.x),minimumZ:Math.min(k.minimumZ,$.z)}),{maximumX:-1/0,maximumZ:-1/0,minimumX:1/0,minimumZ:1/0}),f=Math.max(0,h.maximumX-h.minimumX-o*2),d=Math.max(0,h.maximumZ-h.minimumZ-o*2),p=Ci.gridSpacing;f*d/p**2>Ci.maximumGridPoints&&(p=Math.sqrt(f*d/Ci.maximumGridPoints));let m=[],g=new Map,w=Math.floor(f/p)+1,E=Math.floor(d/p)+1;for(let k=0;k<E;k+=1)for(let $=0;$<w;$+=1){let ie={x:h.minimumX+o+$*p,z:h.minimumZ+o+k*p};l(ie)&&(g.set(\`\${$}:\${k}\`,m.length),m.push(ie))}if(m.length<2)return null;let y=m.map(()=>[]),T=[[1,0],[0,1],[1,1],[-1,1]];for(let[k,$]of g){let[ie,re]=k.split(":").map(Number);for(let[ee,Te]of T){let et=g.get(\`\${ie+ee}:\${re+Te}\`);et!==void 0&&(ee!==0&&Te!==0&&(!g.has(\`\${ie+ee}:\${re}\`)||!g.has(\`\${ie}:\${re+Te}\`))||R0(m[$],m[et],l,p)&&Iw(y,$,et))}}let b=m.map((k,$)=>({index:$,distance:Zn(t,k)})).sort((k,$)=>k.distance-$.distance),{componentByPoint:C,components:v}=Pw(y),S=b.filter(({index:k})=>v[C.get(k)].length>=2),P=S.filter(({index:k})=>Rw(t,m[k],u,p)),I=(P.length>0?P:S).sort((k,$)=>v[C.get($.index)].length-v[C.get(k.index)].length||k.distance-$.distance)[0]?.index;if(I===void 0)return null;let O=I0(y,I);if(O.length<2)return null;let U=[I];for(;U.length<=Ci.maximumLandmarks;){let k=null;for(let $ of O){if(U.includes($))continue;let ie=Math.min(...U.map(re=>Zn(m[$],m[re])));(!k||ie>k.separation)&&(k={index:$,separation:ie})}if(!k||Math.sqrt(k.separation)<Ci.minimumLandmarkDistance)break;U.push(k.index)}if(U.length<2)return null;let Y=[{x:t.x,z:t.z},m[I]],R=new Set(U.slice(1)),V=I;for(;R.size>0;){let k=null;for(let ie of R){let re=v0(y,V,ie);!re||k&&re.length>=k.graphPath.length||(k={graphPath:re,target:ie})}if(!k)break;let $=_0(k.graphPath.map(ie=>m[ie]),l,p);Y.push(...$.slice(1)),V=k.target,R.delete(V)}let z=v0(y,V,I);if(z){let k=_0(z.map($=>m[$]),l,p);Y.push(...k.slice(1))}return id({coordinateSpace:"floor",loop:!0,path:Y,speedMetersPerSecond:Ci.speedMetersPerSecond})}function Pl(n,e){if(e<=0)return n.map(s=>({...s}));let t=[];for(let s=0;s<n.length;s+=1){let r=n[(s-1+n.length)%n.length],a=n[s],o=n[(s+1)%n.length],c=x0(Ln(a,r)),l=x0(Ln(o,a));if(!c||!l)return null;let u={x:-c.z,z:c.x},h={x:-l.z,z:l.x},f=Dl(a,u,e),d=Dl(a,h,e),p=Ar(c,l),x;if(Math.abs(p)<=1e-5){if(!(c.x*l.x+c.z*l.z>0))return null;x=f}else{let g=Ar(Ln(d,f),l)/p;x=Dl(f,c,g)}let m=Math.sqrt(Zn(a,x));if(!Number.isFinite(x.x)||!Number.isFinite(x.z)||m>e*yw)return null;t.push(x)}let i=ss(t);return t.length!==n.length||i<=0||i>=ss(n)||T0(t)||t.some(s=>!Rr(s,n))||t.some(s=>A0(s,n)<e-.001)?null:t}function Lw(n,e){let t=sd(n?.polygon);if(t.length<3||ss(t)<=0||T0(t))return null;let i=Math.max(e,0)+un.wallGap,s=i+un.outerWidth,r=i+(un.outerWidth-un.innerWidth)/2,a=r+un.innerWidth,o=Pl(t,i),c=Pl(t,s),l=Pl(t,r),u=Pl(t,a);return!o||!c||!l||!u?null:{boundary:t,softOuter:o,softInner:c,coreOuter:l,coreInner:u}}function y0(n,e,t){let i=[],s=[];for(let a=0;a<n.length;a+=1){let o=(a+1)%n.length,c=i.length/3;i.push(n[a].x,t,n[a].z,n[o].x,t,n[o].z,e[o].x,t,e[o].z,e[a].x,t,e[a].z),s.push(c,c+2,c+1,c,c+3,c+2)}let r=new nn;return r.setAttribute("position",new Mt(i,3)),r.setIndex(s),r.computeVertexNormals(),r}function td(n,e){let t=new wn({color:n,depthTest:!0,depthWrite:!1,opacity:0,side:sn,toneMapped:!1,transparent:!0});return t.userData.baseOpacity=e,t}function Cr(n){n.userData.excludeFromCameraFit=!0,n.userData.excludeFromDevicePicking=!0}function Ow(n,e,t){let i=Lw(n,e);if(!i)return null;let s=n.elevation+un.floorOffset,r=td(g0,un.outerOpacity),a=td(g0,un.innerOpacity),o=new yt;o.name=\`OccupancyRoomGlow:\${n.id}\`,o.visible=!1,Cr(o);let c=new gt(y0(i.softOuter,i.softInner,s),r),l=new gt(y0(i.coreOuter,i.coreInner,s+un.innerVerticalOffset),a);return c.renderOrder=2,l.renderOrder=3,Cr(c),Cr(l),o.add(c,l),t.add(o),{currentOpacity:0,duration:0,group:o,innerMaterial:a,outerMaterial:r,roomId:n.id,startOpacity:0,transitionStartedAt:0,targetOccupied:!1}}function Nw(n,e=null){let t=n.root.userData.dimensions??{width:.42,depth:.42},i=Math.max(Number(t.width)||.42,.18),s=Math.max(Number(t.depth)||.42,.18),r=n.visual?.pathMotionRoot??n.root,a=new yt;a.name=\`RobotWorkGlow:\${n.id}\`,a.position.y=.008,a.visible=!1,Cr(a);let o=td(S0,E0.coreOpacity),c=new gt(new fa(.54,.76,64),o);return c.rotation.x=-Math.PI/2,c.scale.set(i,s,1),c.renderOrder=4,Cr(c),a.add(c),r.add(a),n.controlAnchor=n.root,{baseEntityPosition:n.root.position.clone(),baseEntityRotationY:n.root.rotation.y,baseMotionPosition:r.position.clone(),baseMotionRotationY:r.rotation.y,core:c,coreMaterial:o,distance:0,entityRoot:n.root,errorTravelRemaining:0,group:a,illustrativeMotion:w0(e),lastMotionAt:null,mode:"inactive",motion:null,motionRoot:r,motionSignature:null}}function Fw(n,e){let t={x:e.root.position.x,z:e.root.position.z};return(n.rooms??[]).map(s=>({room:s,polygon:sd(s.polygon)})).filter(({polygon:s})=>Rr(t,s)).sort((s,r)=>Math.abs(ss(s.polygon))-Math.abs(ss(r.polygon)))[0]?.room??null}function Uw(n){let e=ht.clamp(n,0,1);return e**3*(e*(e*6-15)+10)}function b0(n,e,t){if(n.duration>0){let o=(e-n.transitionStartedAt)/n.duration;n.currentOpacity=n.startOpacity+((n.targetOccupied?1:0)-n.startOpacity)*Uw(o),(o>=1||t)&&(n.currentOpacity=n.targetOccupied?1:0,n.duration=0)}let i=e%un.pulseDurationMs/un.pulseDurationMs,s=(1-Math.cos(i*2*Math.PI))/2,r=n.targetOccupied&&!t&&n.duration===0?1-s*(1-un.minimumPulseOpacity):1,a=n.currentOpacity*r;return n.outerMaterial.opacity=un.outerOpacity*a,n.innerMaterial.opacity=un.innerOpacity*a,n.group.visible=a>1e-4||n.duration>0,n.duration>0||n.targetOccupied&&!t}function rd(n){if(!n.motion)return!1;let e=n.motion.loop?n.distance%n.motion.totalDistance:ht.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.find(h=>e<=h.startDistance+h.length)??n.motion.segments[n.motion.segments.length-1],i=ht.clamp((e-t.startDistance)/t.length,0,1),s=ht.lerp(t.start.x,t.end.x,i),r=ht.lerp(t.start.z,t.end.z,i),a=Math.atan2(t.end.x-t.start.x,t.end.z-t.start.z),o=s,c=r,l=a;if(n.motionRoot!==n.entityRoot){let h=s-n.baseEntityPosition.x,f=r-n.baseEntityPosition.z,d=Math.cos(n.baseEntityRotationY),p=Math.sin(n.baseEntityRotationY);o=n.baseMotionPosition.x+d*h-p*f,c=n.baseMotionPosition.z+p*h+d*f,l=n.baseMotionRotationY+a-n.baseEntityRotationY}let u=Math.abs(n.motionRoot.position.x-o)>1e-5||Math.abs(n.motionRoot.position.z-c)>1e-5;return n.motionRoot.position.x=o,n.motionRoot.position.z=c,n.motionRoot.rotation.y=l,u}function Bw(n,e,t){let i=w0(e?.motion)??n.illustrativeMotion;return i?.signature===n.motionSignature?!1:(n.motion=i,n.motionSignature=i?.signature??null,n.distance=0,n.lastMotionAt=t,i?rd(n):(n.motionRoot.position.copy(n.baseMotionPosition),n.motionRoot.rotation.y=n.baseMotionRotationY),!0)}function kw(n){if(n?.availability!=="available")return!1;let e=String(n?.cleaning?.state??"").trim().toLowerCase();return["docked","charging","charged"].includes(e)}function zw(n){if(!n.motion){n.errorTravelRemaining=0;return}let e=n.motion.loop?n.distance%n.motion.totalDistance:ht.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.findIndex(a=>e<=a.startDistance+a.length),i=t<0?n.motion.segments.length-1:t,s=n.motion.segments[i],r=Math.max(0,s.startDistance+s.length-e);if(r<Math.max(ui.minimumSegmentLength*4,.12)&&(n.motion.loop||i<n.motion.segments.length-1)){let a=n.motion.segments[(i+1)%n.motion.segments.length];r+=a.length}n.errorTravelRemaining=r}function Hw(n,e,t){let i=n.mode!=="inactive",s=!1;if(n.motion){let l=n.lastMotionAt===null?0:ht.clamp(e-n.lastMotionAt,0,ui.maximumFrameDeltaMs);n.lastMotionAt=e;let u=t?n.errorTravelRemaining:l/1e3*n.motion.speedMetersPerSecond;if(i&&l>0&&u>0){let h=u;n.mode==="error"&&(h=Math.min(h,n.errorTravelRemaining),n.errorTravelRemaining=Math.max(0,n.errorTravelRemaining-h)),(!t||n.mode==="error")&&(n.distance=n.mode==="returning"?Math.max(0,n.distance-h):n.motion.loop?(n.distance+h)%n.motion.totalDistance:Math.min(n.motion.totalDistance,n.distance+h)),s=rd(n)}}else n.lastMotionAt=e;let r=n.mode==="returning"&&n.motion&&n.distance<=ui.minimumSegmentLength,a=i&&!r;if(n.group.visible=a,!a)return{active:!1,moved:s};let o=n.mode==="error"?vw:n.mode==="returning"?xw:S0;return n.coreMaterial.color.setHex(o),n.coreMaterial.opacity=E0.coreOpacity,{active:!t&&!!n.motion&&(n.mode==="working"&&(n.motion.loop||n.distance<n.motion.totalDistance-ui.minimumSegmentLength)||n.mode==="returning"&&!r||n.mode==="error"&&n.errorTravelRemaining>ui.minimumSegmentLength),moved:s}}function D0({activeFloor:n,bindings:e,entities:t,sceneRoot:i,reduceMotion:s=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches===!0}){let r=new yt;r.name="DashboardStateVisuals",Cr(r),i.add(r);let a=new Map,o=new Map,c=new Map,l=!1,u=Math.max(.15,...(n.walls??[]).map(d=>Number(d.thickness)||0));for(let d of t.values()){let p=e.get(d.id);if(!p?.deviceId||((d.visual?.assetKey==="robotVacuum"||nd(p.capability).startsWith("vacuum"))&&c.set(d.id,Nw(d,d.visual?.pathMotionRoot?P0({activeFloor:n,excludedObjectId:d.id,origin:{x:d.root.position.x,z:d.root.position.z},robotSize:d.root.userData.dimensions}):null)),!bw(p)))continue;let m=Fw(n,d);if(!m)continue;if(!a.has(m.id)){let w=Ow(m,u/2,r);w&&a.set(m.id,w)}let g=o.get(m.id)??new Set;g.add(p.deviceId),o.set(m.id,g)}return Object.freeze({layer:r,occupancyByRoomId:a,robotByEntityId:c,didMoveRobot:()=>l,step:(d=globalThis.performance?.now()??Date.now())=>{let p=!1;l=!1;for(let x of a.values())p=b0(x,d,s)||p;for(let x of c.values()){let m=Hw(x,d,s);p=m.active||p,l=m.moved||l}return p},sync:(d,p=globalThis.performance?.now()??Date.now())=>{for(let[x,m]of c){let g=e.get(x),w=d.get(g?.deviceId),E=m.mode;m.mode=Ew(w);let y=Bw(m,w,p);m.mode==="error"&&(E!=="error"||y)?zw(m):m.mode!=="error"&&(m.errorTravelRemaining=0),kw(w)&&m.motion&&m.distance!==0&&(m.distance=0,rd(m))}for(let[x,m]of a){let g=[...o.get(x)??[]].some(w=>Sw(d.get(w)));m.targetOccupied!==g&&(b0(m,p,s),m.targetOccupied=g,m.startOpacity=m.currentOpacity,m.transitionStartedAt=p,m.duration=s?0:g?un.fadeInMs:un.fadeOutMs,s&&(m.currentOpacity=g?1:0))}}})}var L0=Object.freeze({off:0,"30s":3e4,"60s":6e4,"120s":12e4}),hn=Object.freeze({themeMode:"auto",ambientBrightnessPercent:100,shadowsEnabled:!0,shadowIntensityPercent:100,autoBrightness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0,autoReturn:"off"});function Ir(n={}){(!n||typeof n!="object")&&(n={});let e=["auto","light","dark"].includes(n.themeMode)?n.themeMode:hn.themeMode,t=typeof n.ambientBrightnessPercent=="number"?n.ambientBrightnessPercent:hn.ambientBrightnessPercent,i=Number.isFinite(t)?Math.min(Math.max(t,0),150):hn.ambientBrightnessPercent,s=typeof n.shadowIntensityPercent=="number"?n.shadowIntensityPercent:hn.shadowIntensityPercent,r=Number.isFinite(s)?Math.min(Math.max(s,0),100):hn.shadowIntensityPercent,a=typeof n.shadowsEnabled=="boolean"?n.shadowsEnabled:hn.shadowsEnabled,o=Object.prototype.hasOwnProperty.call(L0,n.autoReturn)?n.autoReturn:hn.autoReturn;return{themeMode:e,ambientBrightnessPercent:i,ambientBrightnessFactor:i/100,shadowsEnabled:a,shadowIntensityPercent:r,shadowIntensityFactor:r/100,shadowsActive:a&&r>0,autoBrightness:typeof n.autoBrightness=="boolean"?n.autoBrightness:hn.autoBrightness,cameraLocked:typeof n.cameraLocked=="boolean"?n.cameraLocked:hn.cameraLocked,cameraRotationEnabled:typeof n.cameraRotationEnabled=="boolean"?n.cameraRotationEnabled:hn.cameraRotationEnabled,cameraZoomEnabled:typeof n.cameraZoomEnabled=="boolean"?n.cameraZoomEnabled:hn.cameraZoomEnabled,cameraPanEnabled:typeof n.cameraPanEnabled=="boolean"?n.cameraPanEnabled:hn.cameraPanEnabled,showFloorSelector:typeof n.showFloorSelector=="boolean"?n.showFloorSelector:hn.showFloorSelector,showQuickControls:typeof n.showQuickControls=="boolean"?n.showQuickControls:hn.showQuickControls,showDeviceMarkers:typeof n.showDeviceMarkers=="boolean"?n.showDeviceMarkers:hn.showDeviceMarkers,autoReturn:o,autoReturnDelayMs:L0[o]}}var{DEVICE_COMMAND:O0,contactState:Nl,hasPowerState:Gw}=B0.default,Ww=new D(8.5,12.5,10.5).normalize(),Ol=Object.freeze({outputColorSpace:Kt,toneMapping:hr,toneMappingExposure:1.05}),Ya=["livingLight","patioDoor","window"];function Xw(n){let e=Array.isArray(n?.providers)?n.providers:[n?.provider];return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function od(n,{provider:e=null,providers:t=null}={}){return n?e?n.provider===e:t?t.has(n.provider):!0:!1}function k0(n){n.outputColorSpace=Ol.outputColorSpace,n.toneMapping=Ol.toneMapping,n.toneMappingExposure=Ol.toneMappingExposure}function z0(n=window.location){return["localhost","127.0.0.1"].includes(n.hostname)}function ad(n,e=window.location){if(!z0(e))return!1;let t=new URLSearchParams(e.search),i=t.get("toneMapping");if(i==="none")n.toneMapping=In;else if(i==="aces")n.toneMapping=hr;else return!1;let s=Number(t.get("exposure"));return Number.isFinite(s)&&s>0&&(n.toneMappingExposure=s),!0}function qa(n){return n?.availability==="available"&&typeof n?.power?.isOn=="boolean"}function H0(n,e,t){let i=qa(t),s=h0(t);s.known=i,s.on=i&&t.power.isOn;let r=s.on,{bulbMaterial:a,shadeMaterial:o,emissiveMaterials:c=[a].filter(Boolean)}=n.visual,l=new Ke().setRGB(s.rgb.r,s.rgb.g,s.rgb.b,Kt);return c.forEach(u=>{u.color.setHex(i?wi.lampOff:wi.unavailable),u.emissive.copy(r?l:new Ke(0)),u.emissiveIntensity=r&&s.brightness>.001?.2+s.brightness**.72*3.25:0}),o&&(o.color.setHex(i?12819559:9145999),o.emissive.copy(r?l:new Ke(0)),o.emissiveIntensity=r&&s.brightness>.001?.06+s.brightness**.72*.48:0),n.visual.light.color.copy(l),n.visual.lightState=s,s}function V0(n,e,t){let i=Nl(t),s=i!=="unknown",r=i==="open",{panelMaterial:a,frameMaterial:o,baseColor:c,closedAngle:l,openAngle:u,motionRoot:h=n.root,stateMaterials:f}=n.visual,d=h.rotation.y;return h.rotation.y=l+(r?u:0),Array.isArray(f)?f.forEach(({material:p,baseColor:x})=>{p.color.setHex(s?x:wi.unavailable)}):(a.color.setHex(s?c:wi.unavailable),o.color.setHex(s?wi.metal:7633276)),Math.abs(d-h.rotation.y)>1e-8}function N0(n,e,t){let i=!1;return n.kind==="light"&&n.visual?.type==="light"&&H0(n,e,t),n.visual?.type==="contact"&&t?.contact&&(i=V0(n,e,t)),p0(n,t,globalThis.performance?.now()??Date.now()),i}function F0(n,e){return n.size===e.size&&[...n].every(t=>e.has(t))}function cd(n,e=Ya){return new Map(e.map((t,i)=>[t,n[i]??null]))}function ld(n,e,t=null){return!n||t&&n.provider!==t?null:n.deviceId??e.get(n.slot)??null}function G0(n,e,{bindingSlots:t=Ya,provider:i=null,providers:s=null}={}){let r=cd(e,t),a=new Map;for(let o of n.values()){if(!o.binding)continue;let c=od(o.binding,{provider:i,providers:s}),l=c?ld(o.binding,r):null;if(a.set(o.id,{...o.binding,deviceId:l}),c)o.binding.slot&&!r.has(o.binding.slot)&&console.warn(\`Mikonus scene binding \${o.id} uses unknown selector slot \${o.binding.slot}.\`);else{let u=i??[...s??[]].join(", ");console.warn(\`Mikonus scene binding \${o.id} uses unsupported provider \${o.binding.provider}; the active runtime handles \${u}.\`)}}return a}function W0(n,e,{bindingSlots:t=Ya,provider:i=null,providers:s=null}={}){let r=cd(e,t),a=new Set;for(let o of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of o[c]??[]){if(!od(l.binding,{provider:i,providers:s}))continue;let u=ld(l.binding,r);u&&a.add(u)}return a}function X0(n,e,{bindingSlots:t=Ya,provider:i=null,providers:s=null}={}){let r=cd(e,t),a=[];for(let o of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of o[c]??[]){if(!od(l.binding,{provider:i,providers:s}))continue;let u=ld(l.binding,r);u&&a.push({...l.binding,deviceId:u})}return a}function q0(n,e,t,i){return!n||typeof n.id!="string"||!e.has(n.id)?!1:(i.set(n.id,n),t.has(n.id))}function U0(n,e,t,i){if(!e?.deviceId||!t)return;let s=null;t.missing?s="device is missing":t.availability!=="available"?s="device is unavailable":n.kind==="light"&&!Gw(t)?s="power state is missing":n.visual?.type==="contact"&&e.capability==="alarm_contact"&&!t.contact?s="contact state is missing":n.kind==="light"&&!qa(t)?s="power state is unknown":n.visual?.type==="contact"&&(t.contact||e.capability==="alarm_contact")&&Nl(t)==="unknown"&&(s="contact state is unknown");let r=\`\${n.id}:\${e.deviceId}:\${s}\`;!s||i.has(r)||(i.add(r),console.warn(\`Mikonus binding \${n.id} is neutral because \${s}.\`,t))}function Ll(n,e,t,i){let s=[...e.values()].filter(h=>h.elementType==="door"||h.elementType==="window").map(h=>t.get(h.id)).filter(h=>h&&(h.capability==="alarm_contact"||i.get(h.deviceId)?.contact)),r=s.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>Nl(h)!=="unknown"),a=r.filter(({state:h})=>Nl(h)==="open").length,o;if(r.length===s.length&&s.length>0&&a===0)o="Alles geschlossen";else if(a>0){let h=r.length<s.length?" \\xB7 Status unvollst\\xE4ndig":"";o=\`\${a} offen\${h}\`}else s.length===0||s.every(h=>!h.deviceId)?o="Kontakte nicht zugeordnet":o="Kontaktstatus unvollst\\xE4ndig";let c=[...e.values()].filter(h=>h.kind==="light").map(h=>t.get(h.id)).filter(Boolean),l=c.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>qa(h)),u="Licht nicht zugeordnet";if(l.length>0){let h=l.filter(({state:f})=>f.power.isOn).length;u=\`\${h} \${h===1?"Licht":"Lichter"} an\`,l.length<c.length&&(u+=" \\xB7 Status unvollst\\xE4ndig")}else c.some(h=>h.deviceId)&&(u="Lichtstatus unbekannt");n.textContent=\`\${o} \\xB7 \${u}\`}function qw(n,{sceneLoad:e=!1}={}){console.error(e?"Mikonus dashboard scene could not be loaded":"Mikonus 3D initialization failed",n);let t=document.getElementById("error");if(!t)return;let i=t.querySelector("strong"),s=t.querySelector("span");e&&(i&&(i.textContent="Mikonus 3D"),s&&(s.textContent="Scene could not be loaded.")),t.hidden=!1}async function ud({container:n,sceneSource:e,deviceRuntime:t,host:i,options:s={},signal:r=s.signal}){let a=new to(r),o=()=>a.dispose();a.defer(()=>t?.dispose?.());try{if(a.check(),window.addEventListener("pagehide",o,{once:!0}),a.defer(()=>window.removeEventListener("pagehide",o)),typeof e?.loadScene!="function")throw new TypeError("Dashboard viewer requires a SceneSource with loadScene().");if(typeof t?.loadStates!="function"||typeof t?.subscribe!="function"||typeof t?.execute!="function")throw new TypeError("Dashboard viewer requires a DeviceRuntime.");if(!i||typeof i.getSettings!="function"||typeof i.readTheme!="function")throw new TypeError("Dashboard viewer requires a HostAdapter.");let c=Xw(t);if(c.length===0)throw new TypeError("Dashboard DeviceRuntime requires at least one provider id.");let l=s.summaryElement??document.getElementById("floor-summary"),u=s.floorLabel??document.getElementById("floor-label"),h=s.floorSelectorElement??document.getElementById("floor-selector"),f=s.statusHeader??document.querySelector(".status-header"),d=s.sceneShell??n?.closest(".scene-shell");if(!n||!l||!u||!h||!f||!d)throw new Error("Widget container is missing.");let p=(H,de)=>i.translate?.(H,de)??de,x=Ir(i.getSettings()),m=Wa(s.timeOfDay),g=jh({mode:x.themeMode,timeOfDay:m,autoBrightness:x.autoBrightness,...i.readTheme()}),w=Kh({width:d.clientWidth,height:d.clientHeight,devicePixelRatio:window.devicePixelRatio});Jh(w,{rootElement:document.documentElement,shellElement:d}),d.classList.toggle("camera-locked",x.cameraLocked);let E=Yl({container:n,sceneShell:d});a.defer(()=>E.dispose()),E.setEnvironment(g);let y=async(H={})=>{let de=await a.wait(e.loadScene({...H,signal:a.signal}));return a.check(),Dd(de)},T;try{T=await y(),a.check()}catch(H){throw H.dashboardSceneLoad=!0,H}let b=new al({alpha:!0,antialias:!0,powerPreference:"high-performance"});a.defer(()=>b.forceContextLoss()),a.defer(()=>b.dispose()),a.defer(()=>b.domElement.remove()),b.domElement.classList.add("mikonus-renderer-canvas"),b.setClearColor(0,0),k0(b),Tl(g,{renderer:b,rootElement:document.documentElement});let C=ad(b,i.location??window.location);s.onEnvironmentChange?.(g),a.check(),ym(b),Dh(b,x.shadowsActive),b.setPixelRatio(w.renderPixelRatio),b.domElement.setAttribute("aria-label",p("deviceDetails.sceneLabel","Rotate and zoom the Mikonus floor; tap a light or hold a device for details")),b.domElement.setAttribute("tabindex","0"),n.appendChild(b.domElement);let v=new en(br,1,.1,100);v.position.set(8.5,12.5,10.5);let S=new ul(v,b.domElement);a.defer(()=>S.dispose());let P=Sl(b.domElement);a.defer(P),S.target.set(0,.55,0),S.enableDamping=!1,S.enablePan=x.cameraPanEnabled,S.enableRotate=x.cameraRotationEnabled,S.enableZoom=x.cameraZoomEnabled,S.rotateSpeed=.65,S.zoomSpeed=.8,S.minDistance=5,S.maxDistance=100,S.minPolarAngle=ht.degToRad(18),S.maxPolarAngle=1.28,S.zoomToCursor=!0,S.enabled=!x.cameraLocked,S.update();let I=i.getSelectedDeviceIds?.()??[],O={bindingSlots:i.bindingSlots??Ya,providers:new Set(c)},U=new Map,Y=new Set,R=null,V=null,z=null,k=new Set,$=null,ie=null,re=null,ee=null,Te=0,et=!1,Qe=!1,K=!1,le=!1,se=x.shadowsActive,Fe=()=>{},Xe=()=>{d.classList.toggle("camera-locked",x.cameraLocked),S.enabled=!Qe&&!x.cameraLocked,S.enableRotate=!x.cameraLocked&&x.cameraRotationEnabled,S.enableZoom=!x.cameraLocked&&x.cameraZoomEnabled,S.enablePan=!x.cameraLocked&&x.cameraPanEnabled};a.defer(()=>{Te&&window.cancelAnimationFrame(Te),V?.dispose(),V=null,R=null,z=null,k.clear(),U.clear()});let we=()=>{a.disposed||Te||!R||(Te=window.requestAnimationFrame(H=>{if(Te=0,R){let de=m0(R.entities,H),ye=R.stateVisuals?.step(H)===!0;de&&x.shadowsActive&&(se=!0),R.stateVisuals?.didMoveRobot()===!0&&x.shadowsActive&&(se=!0),x.shadowsActive&&se&&(b.shadowMap.needsUpdate=!0),b.render(R.scene,v);let Ze=re?.layout(v,b.domElement)??[];ie?.layout(v,b.domElement,Ze),se=!1,(de||ye)&&we()}}))},rt=H=>{se=x.shadowsActive,x.shadowsActive&&R&&(R.shadowInvalidationReasons??=new Set,R.shadowInvalidationReasons.add(H)),we()},qe=H=>{C&&ad(b),E.setEnvironment(H),s.onEnvironmentChange?.(H)},te=H=>(a.disposed||(m=Wa(H),g=Al(g,i.readTheme(),{mode:x.themeMode,timeOfDay:m,autoBrightness:x.autoBrightness,renderer:b,rootElement:document.documentElement,runtimes:V?.cachedRuntimes??[],afterApply:qe,requestRender:we})),g),oe=()=>{if(a.disposed)return!1;let H=Kh({width:d.clientWidth,height:d.clientHeight,devicePixelRatio:window.devicePixelRatio}),de=!l0(w,H);return w=H,de&&Jh(w,{rootElement:document.documentElement,shellElement:d}),ee?.layout(Cl(w,f.clientWidth)),de},ae=H=>{a.disposed||(g=Al(g,H,{mode:x.themeMode,timeOfDay:m,autoBrightness:x.autoBrightness,renderer:b,rootElement:document.documentElement,runtimes:V?.cachedRuntimes??[],afterApply:qe,requestRender:we}))};Fe=i.subscribeTheme?.(ae)??(()=>{}),a.defer(Fe),a.check();let ge=()=>{if(!R?.cameraFit)return;let H=S.target.distanceTo(R.cameraFit.target);Vh(v,S.target,R.cameraFit.radius+H),Is(v,R.architectureCenterPoints)},_e=H=>H.schemaVersion!==2?null:i.readFloor?.(H.sceneId)??null,He=(H,de)=>{H.schemaVersion===2&&i.writeFloor?.(H.sceneId,de)},Ie=()=>{!z?.sceneId||!R?.floorId||i.writeCamera?.(z.sceneId,R.floorId,{position:v.position.toArray(),target:S.target.toArray(),fov:v.fov,zoom:v.zoom,minDistance:S.minDistance,maxDistance:S.maxDistance,userAdjustedView:le})},Ye=()=>{!z?.sceneId||!R?.floorId||i.removeCamera?.(z.sceneId,R.floorId)},Pe=new xl({camera:v,controls:S,delayMs:x.autoReturnDelayMs,isBlocked:()=>x.cameraLocked,requestRender:we,updateClipping:ge,onComplete:()=>{le=!1,Ye(),we()}});a.defer(()=>Pe.dispose());let L=()=>{if(!R)return;let H=Math.max(n.clientWidth,1),de=Math.max(n.clientHeight,1),ye=Dm(v,R.architectureFitPoints,R.sceneBoundsPoints,H/de,Ww,{centeringPoints:R.architectureCenterPoints,targetPoints:R.architectureCenterPoints,allowQuarterTurn:!1});ye&&(R.cameraFit={distance:ye.distance,radius:ye.radius,target:ye.target.clone()},S.target.copy(ye.target),S.minDistance=ye.minDistance,S.maxDistance=ye.maxDistance,S.update(),Pe.setHomeView({position:v.position,target:S.target})),we()},xt=(H,de)=>{le=!1,L();let ye=i.readCamera?.(H?.sceneId,de);return ye?(v.position.fromArray(ye.position),v.fov=ye.fov,v.zoom=ye.zoom,S.target.fromArray(ye.target),S.minDistance=ye.minDistance,S.maxDistance=ye.maxDistance,v.lookAt(S.target),S.update(),le=ye.userAdjustedView,ge(),le&&Pe.schedule(),we(),!0):!1},it=()=>{if(a.disposed)return;oe();let H=Math.max(n.clientWidth,1),de=Math.max(n.clientHeight,1);if(b.setPixelRatio(w.renderPixelRatio),b.setSize(H,de,!1),R&&!le)L();else if(R){let ye=Lm(v,H/de,{worldPoints:R.architectureFitPoints,centeringPoints:R.architectureCenterPoints,target:S.target});ye.expandedForClipping&&(S.maxDistance=Math.max(S.maxDistance,ye.distance*1.05),S.update()),we()}},A=()=>{et=!0,K=!1},_=()=>{et&&(K||Pe.cancel(),K=!0,le=!0),ge(),we()},B=()=>{et=!1,K&&(Ie(),Pe.schedule()),K=!1};a.defer(()=>{S.removeEventListener("start",A),S.removeEventListener("change",_),S.removeEventListener("end",B)}),S.addEventListener("start",A),S.addEventListener("change",_),S.addEventListener("end",B);let W=new ResizeObserver(it);a.defer(()=>W.disconnect()),W.observe(n);let Z=({scene:H,metadata:de},ye)=>{let Ze=Rm({...H,activeFloorId:ye});try{Lh(Ze.lighting,x.ambientBrightnessFactor),Tl(g,{runtimes:[Ze]}),Oh(Ze.lighting,Ze.entities,x.shadowIntensityFactor);let $e=Ua(Ze.sceneRoot),At=Ua(Ze.sceneRoot,Ze.entities),hi=At.map(G=>G.clone()),M=G0(Ze.entities,I,O),F=new Set([...M.values()].map(G=>G.deviceId).filter(Boolean)),X=D0({activeFloor:Ze.activeFloor,bindings:M,entities:Ze.entities,sceneRoot:Ze.sceneRoot});return{...Ze,description:H,floorId:ye,bindings:M,metadata:de,architectureCenterPoints:$e,architectureFitPoints:At,sceneBoundsPoints:hi,stateVisuals:X,runtimeDeviceIds:F,warnedBindings:new Set}}catch($e){throw gl(Ze.scene),$e}},ue=H=>{let de=H.activeSmartLights??new Set,ye=!1;for(let Ze of H.entities.values()){let $e=H.bindings.get(Ze.id),At=U.get($e?.deviceId);$e&&U0(Ze,$e,At,H.warnedBindings),ye=N0(Ze,$e,At)||ye}return ye&&(H.architectureCenterPoints=Ua(H.sceneRoot)),H.activeSmartLights=Fh(H.entities),H.stateVisuals.sync(U),ml(H.lighting,H.entities,x.shadowsActive),Ll(l,H.entities,H.bindings,U),{contactGeometryChanged:ye,lightShadowSelectionChanged:!F0(de,H.activeSmartLights)}},he=(H=R)=>{H&&(ie?.sync({entities:H.entities,bindings:H.bindings,statesByDeviceId:U}),ie?.setEnabled(x.showDeviceMarkers),re?.sync({enabled:x.showQuickControls&&!Qe,entities:H.entities,bindings:H.bindings,statesByDeviceId:U}))},j=()=>{let H=d.getBoundingClientRect(),de=f.getBoundingClientRect(),ye=Math.max(0,Math.ceil(de.bottom-H.top+4));d.style.setProperty("--scene-header-height",\`\${ye}px\`)},J=(H=z,de=R?.floorId)=>{let ye=x.showFloorSelector&&H?.schemaVersion===2&&H.floors.length>1;u.hidden=ye,ee?.update({floors:ye?H.floors:[],activeFloorId:de,availableWidth:Cl(w,f.clientWidth)}),j()},fe=()=>({position:v.position.clone(),quaternion:v.quaternion.clone(),aspect:v.aspect,fov:v.fov,zoom:v.zoom,near:v.near,far:v.far,target:S.target.clone(),minDistance:S.minDistance,maxDistance:S.maxDistance,cameraFit:R?.cameraFit,homeView:Pe.homeView&&{position:Pe.homeView.position.clone(),target:Pe.homeView.target.clone()},userAdjustedView:le}),De=(H,de)=>{v.position.copy(H.position),v.quaternion.copy(H.quaternion),v.aspect=H.aspect,v.fov=H.fov,v.zoom=H.zoom,v.near=H.near,v.far=H.far,v.updateProjectionMatrix(),S.target.copy(H.target),S.minDistance=H.minDistance,S.maxDistance=H.maxDistance,de&&(de.cameraFit=H.cameraFit),H.homeView?Pe.setHomeView(H.homeView):Pe.homeView=null,le=H.userAdjustedView},ve=(H,{sceneUpdate:de=!1}={})=>{a.check(),$?.close(),Pe.cancel(),Ie(),a.check();let ye,Ze;try{ye=new vl({description:H.scene,initialFloorId:de?Fm(H.scene,z?.sceneId,R?.floorId):_e(H.scene),createRuntime:X=>Z(H,X),disposeRuntime:X=>gl(X.scene)}),Ze=ye.activate().runtime,ue(Ze)}catch(X){throw ye?.dispose(),X}let $e=V,At=R,hi=z,M=k,F=fe();V=ye,R=Ze,z=H.scene,k=W0(H.scene,I,O);try{t.configureBindings?.(X0(H.scene,I,O)),a.check(),rt("sceneChanged"),u.textContent=Ze.activeFloor.name,J(H.scene,Ze.floorId),xt(H.scene,Ze.floorId),he(Ze),He(H.scene,Ze.floorId),a.check()}catch(X){throw a.disposed?($e?.dispose(),ye.dispose(),V=null,R=null,a.signal.reason):(V=$e,R=At,z=hi,k=M,De(F,At),u.textContent=At?.activeFloor.name??"\\u2013",At&&Ll(l,At.entities,At.bindings,U),he(At),J(hi,At?.floorId),ye.dispose(),we(),X)}return $e?.dispose(),Ze},xe=H=>{if(a.disposed||!R||!q0(H,k,R.runtimeDeviceIds,U))return;let ye=R.activeSmartLights??new Set,Ze=!1;for(let $e of R.entities.values()){let At=R.bindings.get($e.id);At?.deviceId===H.id&&(U0($e,At,H,R.warnedBindings),Ze=N0($e,At,H)||Ze)}Ze&&(R.architectureCenterPoints=Ua(R.sceneRoot),Is(v,R.architectureCenterPoints)),R.activeSmartLights=Fh(R.entities),R.stateVisuals.sync(U),ml(R.lighting,R.entities,x.shadowsActive),Ll(l,R.entities,R.bindings,U),$?.updateState(H.id,H),he(),Ze?rt("contactGeometryChanged"):F0(ye,R.activeSmartLights)||rt("lightStateChanged"),we()},Ue=async H=>{a.check();let de=[...H.runtimeDeviceIds];if(de.length!==0)try{let ye=await a.wait(t.loadStates(de,{signal:a.signal}));if(a.check(),R!==H||!Array.isArray(ye))return;ye.forEach($e=>{$e&&typeof $e.id=="string"&&U.set($e.id,$e)});let Ze=ue(H);he(H),Ze.contactGeometryChanged?(Is(v,H.architectureCenterPoints),rt("contactGeometryChanged")):Ze.lightShadowSelectionChanged&&rt("lightStateChanged"),we()}catch(ye){if(a.disposed)throw a.signal.reason;console.warn("Could not load the configured dashboard device states.",ye)}},Ge=async H=>{if(a.disposed||!V||!z)return null;if(H===V.activeFloorId)return J(z,H),R;$?.close(),Pe.cancel(),Ie(),a.check();let de=R,ye=V.activeFloorId,Ze=fe(),$e;try{$e=V.activate(H).runtime,ue($e),R=$e,rt("floorChanged"),u.textContent=$e.activeFloor.name,J(z,H),xt(z,H),he($e),He(z,H),a.check()}catch(At){throw a.disposed?a.signal.reason:(ye&&V.activate(ye),R=de,De(Ze,de),u.textContent=de?.activeFloor.name??"\\u2013",de&&Ll(l,de.entities,de.bindings,U),he(de),J(z,ye),we(),At)}return await Ue($e),$e},je=Promise.resolve(),N=async H=>{if(a.disposed||typeof H?.revision=="string"&&H.revision===R?.metadata?.revision)return;let de=await y({allowFallback:!1});if(a.check(),de.metadata.revision===R?.metadata?.revision)return;let ye=ve(de,{sceneUpdate:!0});await Ue(ye)},pe=H=>{je=je.then(()=>N(H)).catch(de=>{a.disposed||console.error("Runtime dashboard scene reload failed; keeping the current scene.",de)})},Q=H=>{je=je.then(()=>Ge(H)).catch(de=>{a.disposed||(console.error("Floor switch failed; keeping the current floor.",de),J())})};ee=new yl({host:h,translate:p,onSelect:Q}),a.defer(()=>ee.dispose());let me=new ResizeObserver(()=>{a.disposed||(ee?.layout(Cl(w,f.clientWidth)),j())});a.defer(()=>me.disconnect()),me.observe(f),j();let Me=t.subscribe(xe);a.defer(Me),a.check();let ne=e.subscribe?.(pe)??(()=>{});a.defer(ne),a.check();let Le=new Ms,Re=new ce,pt=null,dt=null,On=()=>{let H=pt?[...pt.activePointers.keys()]:[];pt?.reset(),dt=null;for(let de of H)try{b.domElement.hasPointerCapture?.(de)&&b.domElement.releasePointerCapture(de)}catch{}},mn=async(H,de,{directLightTap:ye=!1}={})=>{if(a.disposed)return;let Ze=R?.entities.get(H),$e=R?.bindings.get(H),At=U.get($e?.deviceId),hi=!!(Ze&&$e?.deviceId);if(!(ye?hi&&Ze.kind==="light"&&qa(At)&&de.type===O0.SET_POWER:hi&&Ai(At,de))){console.warn(\`The 3D object \${H} cannot execute \${de.type} because its state or control is unavailable.\`);return}if(!Y.has($e.deviceId)){Y.add($e.deviceId),$?.setBusy($e.deviceId,!0),re?.setDeviceBusy($e.deviceId,!0),i.feedback?.();try{await t.execute($e.deviceId,de,$e)}catch(F){console.warn(\`Could not execute \${de.type} for \${H}.\`,F)}finally{if(a.disposed)return;Y.delete($e.deviceId),$?.setBusy($e.deviceId,!1),re?.setDeviceBusy($e.deviceId,!1)}}},Ka=H=>{let de=R?.bindings.get(H),ye=U.get(de?.deviceId);qa(ye)&&mn(H,{type:O0.SET_POWER,value:!ye.power.isOn},{directLightTap:!0})},Pr=new za({host:E.popupHost,onCommand:mn,translate:p});a.defer(()=>Pr.dispose());let Ja=s.createDeviceDetailsAdapter?.({overlay:Pr})??new Ha({overlay:Pr});$=new Ml({adapters:Object.fromEntries(c.map(H=>[H,Ja])),onOpenChange:H=>{Qe=H,H&&On(),d.classList.toggle("device-details-open",H),ie?.setSuppressed(H),Xe(),he(),H?Pe.cancel():we()}}),a.defer(()=>$.dispose()),a.check();let Ps=(H,de,ye)=>Ym({camera:v,canvas:b.domElement,clientX:H,clientY:de,pickables:ye,pointer:Re,raycaster:Le,scene:R?.scene}),Dr=H=>{if(a.disposed)return!1;let de=R?.bindings.get(H),ye=jm({entityId:H,binding:de,state:U.get(de?.deviceId)});return!ye||!$?.open(ye)?!1:(i.feedback?.(),!0)};re=new Ba({host:E.markerHost,onCommand:mn,translate:p}),a.defer(()=>re.dispose()),ie=new Ga({host:E.markerHost,onOpenDetails:Dr,onTogglePower:Ka,translate:p}),a.defer(()=>ie.dispose()),pt=new Sr({onLongPress:({clientX:H,clientY:de})=>{let ye=Ps(H,de,R?.devicePickables??[]);return!ye||(dt&&(De(dt,R),dt=null,K=!1,et=!1,ge(),we()),!Dr(ye.sceneObjectId))?!1:(window.getSelection?.()?.removeAllRanges(),!0)}}),a.defer(()=>pt.dispose());let Lr=H=>{H.cancelable&&H.preventDefault(),pt.activePointers.size===0&&(dt=fe()),pt.pointerDown(H)},Or=H=>{pt.pointerMove(H)},Kn=H=>{let de=pt.pointerUp(H);if(dt=null,!de)return;let ye=Ps(de.clientX,de.clientY,R?.pickables??[]);ye&&Ka(ye.sceneObjectId)},Ri=H=>{pt.pointerCancel(H),dt=null},Nr=H=>H.preventDefault();a.defer(()=>{b.domElement.removeEventListener("pointerdown",Lr,!0),b.domElement.removeEventListener("pointermove",Or,!0),b.domElement.removeEventListener("pointerup",Kn,!0),b.domElement.removeEventListener("pointercancel",Ri,!0),b.domElement.removeEventListener("lostpointercapture",Ri,!0),b.domElement.removeEventListener("contextmenu",Nr)}),b.domElement.addEventListener("pointerdown",Lr,!0),b.domElement.addEventListener("pointermove",Or,!0),b.domElement.addEventListener("pointerup",Kn,!0),b.domElement.addEventListener("pointercancel",Ri,!0),b.domElement.addEventListener("lostpointercapture",Ri,!0),b.domElement.addEventListener("contextmenu",Nr);let Qa=H=>{if(a.disposed)return x;let de=x,ye=Ir(H);if(JSON.stringify(de)===JSON.stringify(ye))return x;x=ye,Xe(),Pe.delayMs=x.autoReturnDelayMs,x.cameraLocked||x.autoReturnDelayMs<=0?Pe.cancel():le&&Pe.schedule();let Ze=V?.cachedRuntimes??[];g=Al(g,i.readTheme(),{mode:x.themeMode,timeOfDay:m,autoBrightness:x.autoBrightness,renderer:b,rootElement:document.documentElement,runtimes:Ze,afterApply:qe,requestRender:we});for(let $e of Ze)Lh($e.lighting,x.ambientBrightnessFactor),Oh($e.lighting,$e.entities,x.shadowIntensityFactor),ml($e.lighting,$e.entities,x.shadowsActive);return Dh(b,x.shadowsActive),J(),he(),x.shadowsActive&&(!de.shadowsActive||de.shadowIntensityPercent!==x.shadowIntensityPercent)?rt("settingsChanged"):we(),x},rs=ve(T);it(),await Ue(rs),a.check();let Fr=i.getInitialDetailsDeviceId?.();if(Fr){let H=[...rs.bindings].find(([,de])=>de.deviceId===Fr);H&&Dr(H[0])}return Object.freeze({dispose:o,destroy:o,getEnvironment:()=>g,getSettings:()=>x,requestRender:we,updateSettings:Qa,setTimeOfDay:te})}catch(c){throw o(),c.name!=="AbortError"&&qw(c,{sceneLoad:c.dashboardSceneLoad===!0}),c}}var Yw="mikonus.camera-view-v2";function hd(n,e,t){return[Yw,typeof t=="string"&&t?t:"default",n,e].map(s=>encodeURIComponent(String(s))).join(":")}function Y0(n){return Array.isArray(n)&&n.length===3&&n.every(Number.isFinite)}function $0(n){return!n||typeof n!="object"||!Y0(n.position)||!Y0(n.target)||!Number.isFinite(n.fov)||n.fov<=0||n.fov>=180||!Number.isFinite(n.zoom)||n.zoom<=0||!Number.isFinite(n.minDistance)||n.minDistance<=0||!Number.isFinite(n.maxDistance)||n.maxDistance<n.minDistance?null:{position:[...n.position],target:[...n.target],fov:n.fov,zoom:n.zoom,minDistance:n.minDistance,maxDistance:n.maxDistance,userAdjustedView:n.userAdjustedView===!0}}var $a=class{constructor({storage:e,widgetInstanceId:t}){this.storage=e,this.widgetInstanceId=t}read(e,t){try{let i=this.storage?.getItem(hd(e,t,this.widgetInstanceId));return i?$0(JSON.parse(i)):null}catch(i){return console.debug("Could not read the preserved floor camera view.",i),null}}write(e,t,i){let s=$0(i);if(!s)return!1;try{return this.storage?.setItem(hd(e,t,this.widgetInstanceId),JSON.stringify(s)),!0}catch(r){return console.debug("Could not preserve the floor camera view.",r),!1}}remove(e,t){try{this.storage?.removeItem(hd(e,t,this.widgetInstanceId))}catch(i){console.debug("Could not clear the preserved floor camera view.",i)}}};function dd(n){if(typeof n!="function")return"light";try{return n("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"light"}}var Fl=class{constructor(){this.values=new Map}getItem(e){return this.values.get(e)??null}setItem(e,t){this.values.set(e,String(t))}removeItem(e){this.values.delete(e)}},ja=class{constructor({settings:e={},translations:t={},initialDetailsDeviceId:i=null,instanceId:s="browser-host",windowObject:r=window,storage:a=new Fl}={}){this.window=r,this.location=r.location,this.settings=Ir(e),this.translations=t,this.initialDetailsDeviceId=i,this.storage=a,this.cameraViewStore=new $a({storage:a,widgetInstanceId:s}),this.instanceId=s}translate(e,t){return this.translations[e]??t}getSettings(){return this.settings}getSelectedDeviceIds(){return[]}getInitialDetailsDeviceId(){return this.initialDetailsDeviceId}readTheme(){return{hostTheme:null,systemTheme:dd(this.window.matchMedia?.bind(this.window))}}subscribeTheme(e){let t=this.window.matchMedia?.("(prefers-color-scheme: dark)"),i=()=>e(this.readTheme());return typeof t?.addEventListener=="function"?t.addEventListener("change",i):t?.addListener?.(i),i(),()=>{typeof t?.removeEventListener=="function"?t.removeEventListener("change",i):t?.removeListener?.(i)}}feedback(){}readFloor(e){return this.storage.getItem(_l(e,this.instanceId))}writeFloor(e,t){this.storage.setItem(_l(e,this.instanceId),t)}readCamera(e,t){return this.cameraViewStore.read(e,t)}writeCamera(e,t,i){return this.cameraViewStore.write(e,t,i)}removeCamera(e,t){this.cameraViewStore.remove(e,t)}};var j0=Qn(ns()),{DEVICE_COMMAND:Z2}=j0.default;var fd=Qn(Wl()),Za=class{constructor({url:e,transformScene:t=s=>s,load:i=fd.default.loadDashboardScene}){this.url=e,this.transformScene=t,this.load=i}async loadScene({signal:e}={}){e?.throwIfAborted();let t=await this.load(this.url,{signal:e});e?.throwIfAborted();let i=this.transformScene(t),{activeFloorId:s,...r}=i,a=fd.default.validateDashboardScene(r);return{scene:a,metadata:{schemaVersion:a.schemaVersion,sceneId:a.sceneId,revision:\`\${a.sceneId}:static\`,source:"static"}}}subscribe(){return()=>{}}};var Z0=Qn(ns()),sR=Z0.default.DEVICE_COMMAND;var Ul=class extends ja{constructor({themeSource:e,...t}){super(t),this.themeSource=e}readTheme(){return{...super.readTheme(),hostTheme:this.themeSource?.read()??null}}subscribeTheme(e){let t=()=>e(this.readTheme()),i=this.themeSource?.subscribe(t)??(()=>{}),s=super.subscribeTheme(t);return()=>{i(),s()}}};document.addEventListener("mikonus-connect",async n=>{let{runtime:e,scene:t,sceneSource:i,themeSource:s,storage:r,presentationSettings:a,signal:o,initializeRuntime:c,onReady:l,onError:u}=n.detail;try{c(Ai);let h=!0,f=i?{async loadScene(p){let x=await(h?i.waitUntilReady(p):i.loadScene(p));return h=!1,x},subscribe:p=>i.subscribe(p)}:new Za({url:"reference",load:async()=>t}),d=await ud({container:document.getElementById("viewport"),sceneSource:f,deviceRuntime:e,host:new Ul({instanceId:"ha-card",storage:r,themeSource:s,settings:a}),signal:o,options:{timeOfDay:"auto",sceneShell:document.getElementById("shell"),statusHeader:document.getElementById("header"),summaryElement:document.getElementById("summary"),floorLabel:document.getElementById("floor-label"),floorSelectorElement:document.getElementById("floor-selector")}});l(d)}catch(h){u(h)}},{once:!0});window.frameElement.dispatchEvent(new CustomEvent("mikonus-frame-ready"));})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
`;var ve=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;font:14px system-ui,sans-serif;color:#222;background:transparent}
#shell{position:relative;display:flex;flex-direction:column;width:100%;height:100%}
#header{position:absolute;inset:0 0 auto;z-index:4;background:transparent;pointer-events:none;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:12px;min-height:56px}
#header>*{pointer-events:auto}
#viewport{position:relative;flex:1;width:100%;min-height:180px;overflow:hidden}
#viewport canvas{display:block;width:100%;height:100%}
#summary{color:var(--dashboard-ui-text-primary);flex:0 0 auto;margin:0;padding:4px 12px}button,select,input{font:inherit}button,select{min-height:44px}
[hidden]{display:none!important}#error{padding:12px}
</style></head><body><main id="shell"><header id="header"><span id="floor-label"></span><div id="floor-selector"></div></header><div id="viewport"></div><p id="summary"></p></main><p id="error" hidden></p></body></html>`;function re({container:i,runtime:e,scene:t,sceneSource:r,themeSource:n,storage:a,presentationSettings:s,onReady:o,onError:l}){let p=document.createElement("iframe");p.title="Mikonus 3D Dashboard",p.style.cssText="display:block;width:100%;height:100%;border:0";let u=null,c=!1,h=s,_=new AbortController,v=URL.createObjectURL(new Blob([ie],{type:"text/javascript"})),m=()=>{if(!c){c=!0,_.abort(),p.removeEventListener("mikonus-frame-ready",y),p.removeEventListener("load",B);try{u?.dispose()}finally{u=null,e.dispose(),p.remove(),URL.revokeObjectURL(v)}}},f=d=>{c||(m(),l(d))},y=()=>{if(!c)try{p.contentDocument.dispatchEvent(new p.contentWindow.CustomEvent("mikonus-connect",{detail:{runtime:e,scene:t,sceneSource:r,themeSource:n,storage:a,presentationSettings:h,signal:_.signal,initializeRuntime:d=>e.configureCommandSupport(d),onReady:d=>{if(URL.revokeObjectURL(v),c){d.dispose();return}u=d,u.updateSettings?.(h),o()},onError:f}}))}catch(d){f(d)}},B=()=>{if(!c)try{let d=p.contentDocument.createElement("script");d.src=v,d.onerror=()=>f(new Error("Renderer script could not be loaded. Check the browser content policy.")),p.contentDocument.body.append(d)}catch(d){f(d)}};return p.addEventListener("load",B,{once:!0}),p.addEventListener("mikonus-frame-ready",y,{once:!0}),p.srcdoc=ve,i.append(p),{dispose:m,updateSettings(d){h=d,u?.updateSettings?.(d)}}}document.querySelector("home-assistant")&&await customElements.whenDefined("home-assistant");var L="mikonus-3d-card",ne="mikonus-3d-card-editor";customElements.get(ne)||customElements.define(ne,te());customElements.get(L)||customElements.define(L,Q(re));window.customCards??=[];window.customCards.some(i=>i.type===L)||window.customCards.push({type:L,name:"Mikonus 3D",preview:!1,description:"Mikonus Dashboard Scene v2 mit Home Assistant Ger\xE4ten."});
