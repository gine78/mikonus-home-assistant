var P="homeAssistant",D=/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/,De={motion:["motion","activity","motion"],occupancy:["occupancy","activity","occupancy"],presence:["occupancy","activity","presence"],moving:["motion","activity","moving"],running:["motion","activity","running"],sound:["motion","activity","sound"],vibration:["motion","activity","vibration"],opening:["contact","contact","open"],door:["contact","contact","open"],garage_door:["contact","contact","open"],window:["contact","contact","open"],smoke:["smoke","safety","smoke"],gas:["gas","safety","gas"],carbon_monoxide:["carbonMonoxide","safety","carbon_monoxide"],moisture:["water","safety","water"],heat:["heat","safety","heat"],cold:["cold","safety","cold"],problem:["problem","safety","problem"],safety:["safety","safety","safety"],tamper:["tamper","safety","tamper"]},Ie={temperature:["environment","measure_temperature"],humidity:["environment","measure_humidity"],illuminance:["environment","measure_luminance"],aqi:["environment","measure_aqi"],carbon_dioxide:["environment","measure_co2"],pm1:["environment","measure_pm1"],pm25:["environment","measure_pm25"],pm10:["environment","measure_pm10"],volatile_organic_compounds:["environment","measure_tvoc"],volatile_organic_compounds_parts:["environment","measure_tvoc"],atmospheric_pressure:["environment","measure_pressure"],pressure:["environment","measure_pressure"],sound_pressure:["environment","measure_noise"],carbon_monoxide:["environment","measure_carbon_monoxide"],nitrogen_dioxide:["environment","measure_nitrogen_dioxide"],nitrogen_monoxide:["environment","measure_nitrogen_monoxide"],nitrous_oxide:["environment","measure_nitrous_oxide"],ozone:["environment","measure_ozone"],sulphur_dioxide:["environment","measure_sulphur_dioxide"],apparent_power:["energy","measure_apparent_power"],current:["energy","measure_current"],energy:["energy","meter_power"],gas:["energy","meter_gas"],power:["energy","measure_power"],power_factor:["energy","measure_power_factor"],reactive_power:["energy","measure_reactive_power"],voltage:["energy","measure_voltage"],water:["energy","meter_water"]},Le=new Set(["apparent_power","current","energy","gas","monetary","power","power_factor","reactive_power","voltage","water"]),f=t=>typeof t=="number"&&Number.isFinite(t)?t:null,ne=t=>{if(f(t)!==null)return t;if(typeof t!="string"||!t.trim())return null;let e=Number(t);return Number.isFinite(e)?e:null},x=(t,e,i)=>f(t)===null?null:Math.max(e,Math.min(i,t)),W=t=>Array.isArray(t)?[...new Set(t.filter(e=>typeof e=="string"))].sort():[],S=t=>typeof t=="string"&&t.trim()?t.trim():null,re=(t,e)=>t instanceof Map?t.get(e):t?.[e],j=(t,e,i)=>Object.hasOwn(t?.services?.[e]??{},i);function X(t){return!t||t.provider!==P?"unsupported provider":typeof t.deviceId!="string"||!D.test(t.deviceId)?"invalid entity id":Object.hasOwn(t,"slot")?"HA bindings require deviceId, not slot":typeof t.capability!="string"||!t.capability.trim()?"missing capability":null}function A(t,e="missing"){return{id:t,provider:P,name:null,deviceClass:null,icon:null,availability:e,missing:e==="missing",power:null,light:null,contact:null,cover:null,climate:null,fan:null,lock:null,cleaning:null,activity:null,safety:null,health:null,motion:null,environment:null,energy:null,entities:[],controls:{}}}function Oe(t){let e=t.hs_color;if(Array.isArray(e)&&f(e[0])!==null&&f(e[1])!==null)return{hue:x(e[0],0,360)/360,saturation:x(e[1],0,100)/100};let i=t.rgb_color;if(!Array.isArray(i)||i.length!==3||i.some(p=>f(p)===null))return null;let[n,r,a]=i.map(p=>x(p,0,255)/255),o=Math.max(n,r,a),s=Math.min(n,r,a),l=o-s;return{hue:((l===0?0:o===n?(r-a)/l%6:o===r?(a-n)/l+2:(n-r)/l+4)/6+1)%1,saturation:o===0?0:l/o}}function ae(t){return{entityId:t}}function Ne(t,e,i){let n=e?.attributes??{},r=re(i?.entities,t),a=!!e&&typeof e.state=="string"&&!["unknown","unavailable"].includes(e.state.toLowerCase());return{id:t,domain:t.split(".")[0],deviceClass:S(n.device_class)??S(r?.device_class),name:S(n.friendly_name)??S(r?.name)??S(r?.original_name)??t,value:e?.state??null,unit:S(n.unit_of_measurement),available:a,icon:ae(t)}}function Ue(t,e,i){let n=ne(e.state);if(n===null)return null;let r=i.deviceClass,[a,o]=Ie[r]??[Le.has(r)?"energy":"environment",`measure_${(r??"value").replace(/[^a-z0-9_]/g,"_")}`];return{group:a,value:{id:t,baseId:o,value:n,unit:i.unit,label:i.name,icon:i.icon}}}function q(t,e,i,n=[]){if(!e)return A(t);let r=t.split(".")[0],a=A(t,"unavailable"),o=e.attributes??{},s=Ne(t,e,i);if(a.name=s.name,a.deviceClass=s.deviceClass??r,a.icon=s.icon,a.entities=[s],!D.test(t)||e.entity_id!==t||!n.some(h=>!X(h))||!s.available)return a;let l=e.state;a.availability="available",a.missing=!1;let c=h=>j(i,r,h),p=Number.isInteger(o.supported_features)?o.supported_features:0,d=h=>(p&h)===h,u=a.controls;if(r==="light"||r==="switch"){if(!["on","off"].includes(l))return{...a,availability:"unavailable"};if(a.power={isOn:l==="on"},u.setPower=c("turn_on")&&c("turn_off"),r==="light"){let h=W(o.supported_color_modes),m=h.some(E=>["brightness","color_temp","hs","xy","rgb","rgbw","rgbww","white"].includes(E)),b=h.some(E=>["hs","xy","rgb","rgbw","rgbww"].includes(E)),_=f(o.min_color_temp_kelvin),y=f(o.max_color_temp_kelvin);a.light={brightness:f(o.brightness)===null?null:x(o.brightness,0,255)/255,color:Oe(o),colorTemperatureKelvin:f(o.color_temp_kelvin),mode:o.color_mode==="color_temp"?"temperature":["hs","xy","rgb","rgbw","rgbww"].includes(o.color_mode)?"color":null},m&&c("turn_on")&&(u.setBrightness={min:0,max:1,step:1/255}),u.setColor=b&&c("turn_on"),h.includes("color_temp")&&_>0&&y>=_&&c("turn_on")&&(u.setColorTemperature={min:_,max:y,step:1,unit:"K"})}}else if(r==="cover")a.cover={position:f(o.current_position)===null?l==="closed"?0:null:x(o.current_position,0,100)/100,movement:["opening","closing"].includes(l)?l:["open","closed"].includes(l)?"stopped":"unknown"},u.openCover=d(1)&&c("open_cover"),u.closeCover=d(2)&&c("close_cover"),u.stopCover=d(8)&&c("stop_cover"),d(4)&&c("set_cover_position")&&(u.setCoverPosition={min:0,max:1,step:.01});else if(r==="climate"){let h=o.temperature_unit??i?.config?.unit_system?.temperature;a.climate={currentTemperature:f(o.current_temperature),targetTemperature:f(o.temperature),humidity:x(o.current_humidity,0,100),unit:["\xB0C","\xB0F"].includes(h)?h:null,mode:l,heatingActive:typeof o.hvac_action=="string"?o.hvac_action==="heating":null};let m=f(o.min_temp),b=f(o.max_temp);d(1)&&m!==null&&b!==null&&b>m&&c("set_temperature")&&a.climate.unit&&(u.setTargetTemperature={min:m,max:b,step:f(o.target_temp_step)>0?o.target_temp_step:.5,unit:a.climate.unit});let _=W(o.hvac_modes).filter(y=>["off","heat","cool","heat_cool","auto","dry","fan_only"].includes(y));_.length&&c("set_hvac_mode")&&(u.setThermostatMode={values:_.map(y=>({id:y,label:y}))})}else if(r==="fan"||r==="humidifier"){let h=f(o.percentage),m=f(o.humidity),b=W(r==="fan"?o.preset_modes:o.available_modes);a.power={isOn:l==="on"},a.fan={speed:h===null?null:x(h,0,100)/100,mode:S(r==="fan"?o.preset_mode:o.mode),targetHumidity:m===null?null:x(m,0,100)/100},u.setPower=c("turn_on")&&c("turn_off"),r==="fan"&&d(1)&&c("set_percentage")&&(u.setFanSpeed={min:0,max:1,step:.01}),b.length&&c(r==="fan"?"set_preset_mode":"set_mode")&&(u.setFanMode={values:b.map(_=>({id:_,label:_}))}),r==="humidifier"&&c("set_humidity")&&(u.setTargetHumidity={min:0,max:1,step:.01})}else if(r==="lock"){a.lock={isLocked:l==="locked"?!0:l==="unlocked"?!1:null};let h=["locked","unlocked"].includes(l)&&!o.code_format;u.lock=h&&c("lock"),u.unlock=h&&c("unlock")}else if(r==="vacuum")a.cleaning={state:["cleaning","paused","returning","docked","idle","error"].includes(l)?l:"unknown",batteryPercent:x(o.battery_level,0,100),error:l==="error"?typeof o.error=="string"?o.error:"Device error":null},a.cleaning.batteryPercent!==null&&(a.health={batteryPercent:a.cleaning.batteryPercent,alerts:[]}),u.startCleaning=d(8192)&&c("start"),u.pauseCleaning=d(4)&&c("pause"),u.stopCleaning=d(8)&&c("stop"),u.returnToBase=d(16)&&c("return_to_base");else if(r==="binary_sensor"){if(!["on","off"].includes(l))return{...a,availability:"unavailable"};let h=l==="on";if(s.deviceClass==="battery"||s.deviceClass==="connectivity"){let m=s.deviceClass==="connectivity"?!h:h;a.health={batteryPercent:null,alerts:[{id:s.deviceClass,baseId:`alarm_${s.deviceClass}`,active:m,label:a.name}]}}else{let m=De[s.deviceClass]??[s.deviceClass??"binary_sensor","activity",s.deviceClass??"binary_sensor"],[b,_,y]=m;a.deviceClass=b,_==="contact"?a.contact={state:h?"open":"closed"}:a[_]=[{id:t,baseId:y,active:h,label:a.name,icon:a.icon}]}}else if(r==="sensor")if(s.deviceClass==="battery"){let h=x(ne(l),0,100);h!==null&&(a.health={batteryPercent:h,alerts:[]})}else{let h=Ue(t,e,s);h&&(a[h.group]=[h.value])}return a}function Fe(t,e){if(!e)return t;if(!t)return structuredClone(e);let i={...t};for(let[n,r]of Object.entries(e))(i[n]===null||typeof i[n]>"u")&&r!==null&&typeof r<"u"&&(i[n]=r);return i}function T(t,e){let i=[...t??[]];for(let n of e??[]){let r=n?.id??n?.baseId;i.some(a=>(a?.id??a?.baseId)===r)||i.push(structuredClone(n))}return i.length?i:null}function se(t,e,{name:i=null,iconEntityId:n=null}={}){let r=e.filter(Boolean);if(r.length===0)return A(t);let a=r.filter(c=>c.availability==="available"),o=r.every(c=>c.missing===!0),s=A(t,o?"missing":a.length?"available":"unavailable");s.missing=r.every(c=>c.missing===!0);let l=a[0]??r[0];s.name=S(i)??l.name,s.deviceClass=l.deviceClass,s.icon=ae(n??l.id);for(let c of r){for(let p of["power","light","contact","cover","climate","fan","lock","cleaning"])s[p]=Fe(s[p],c[p]);s.activity=T(s.activity,c.activity),s.safety=T(s.safety,c.safety),s.environment=T(s.environment,c.environment),s.energy=T(s.energy,c.energy),s.entities=T(s.entities,c.entities)??[],c.health&&(s.health=s.health??{batteryPercent:null,alerts:[]},f(c.health.batteryPercent)!==null&&(s.health.batteryPercent=c.health.batteryPercent),s.health.alerts=T(s.health.alerts,c.health.alerts)??[]);for(let[p,d]of Object.entries(c.controls??{}))(d===!0||d&&typeof d=="object"||!Object.hasOwn(s.controls,p))&&(s.controls[p]=d)}return s}function Y(t,e){return re(t,e)}function oe(t,e,i,n){let r=t.id.split(".")[0],o=e?.type==="togglePower"?{type:"setPower",value:!t.power?.isOn}:e;if(typeof n!="function"||!n(t,o)||e?.type==="setCoverPosition"&&(e.value<0||e.value>1))throw new Error(`Unsupported action ${e?.type??"(missing)"} for ${t.id}.`);let s,l={entity_id:t.id};switch(e.type){case"togglePower":s="toggle";break;case"setPower":s=e.value?"turn_on":"turn_off";break;case"setBrightness":s="turn_on",l.brightness=Math.round(e.value*255);break;case"setColor":s="turn_on",l.hs_color=[e.value.hue*360,e.value.saturation*100];break;case"setColorTemperature":s="turn_on",l.color_temp_kelvin=Math.round(e.value);break;case"openCover":s="open_cover";break;case"closeCover":s="close_cover";break;case"stopCover":s="stop_cover";break;case"setCoverPosition":s="set_cover_position",l.position=Math.round(e.value*100);break;case"setTargetTemperature":s="set_temperature",l.temperature=e.value;break;case"setThermostatMode":s="set_hvac_mode",l.hvac_mode=e.value;break;case"setFanSpeed":s="set_percentage",l.percentage=Math.round(e.value*100);break;case"setFanMode":s=r==="humidifier"?"set_mode":"set_preset_mode",l[r==="humidifier"?"mode":"preset_mode"]=e.value;break;case"setTargetHumidity":s="set_humidity",l.humidity=Math.round(e.value*100);break;case"lock":s="lock";break;case"unlock":s="unlock";break;case"startCleaning":s="start";break;case"pauseCleaning":s="pause";break;case"stopCleaning":s="stop";break;case"returnToBase":s="return_to_base";break;default:throw new Error("Unsupported action.")}if(!j(i,r,s))throw new Error(`Service ${r}.${s} is unavailable.`);return{domain:r,service:s,data:l}}var ke=new Map([["light",0],["switch",1],["cover",2],["climate",3],["fan",4],["humidifier",5],["lock",6],["vacuum",7],["binary_sensor",8],["sensor",9]]),ze={togglePower:"setPower",setPower:"setPower",setBrightness:"setBrightness",setColor:"setColor",setColorTemperature:"setColorTemperature",openCover:"openCover",closeCover:"closeCover",stopCover:"stopCover",setCoverPosition:"setCoverPosition",setTargetTemperature:"setTargetTemperature",setThermostatMode:"setThermostatMode",setFanSpeed:"setFanSpeed",setFanMode:"setFanMode",setTargetHumidity:"setTargetHumidity",lock:"lock",unlock:"unlock",startCleaning:"startCleaning",pauseCleaning:"pauseCleaning",stopCleaning:"stopCleaning",returnToBase:"returnToBase"};function Be(t){return t instanceof Map?[...t.entries()]:Object.entries(t??{})}function le(t){return t?.device_id??t?.deviceId??null}function ce(t,e){let i=e?.states?.[t],n=t.split(".")[0],r=i?.attributes?.device_class,a=r==="temperature"?0:r==="humidity"?1:r==="battery"?9:4;return(ke.get(n)??20)*10+a}function Ve(t,e){let i=Y(e?.devices,t);return i?.name_by_user??i?.nameByUser??i?.name??i?.model??null}var I=class{provider=P;bindings=new Map;states=new Map;entityGroups=new Map;commandTargets=new Map;listeners=new Set;disposed=!1;constructor(e=null,{supportsCommand:i=null}={}){this.hass=e,this.supportsCommand=i,this.registry=e?.entities??null}configureCommandSupport(e){if(!this.disposed){if(typeof e!="function")throw new TypeError("A neutral command validator is required.");this.supportsCommand=e}}configureBindings(e){if(this.disposed)return;let i=new Map;for(let n of e??[])X(n)||i.set(n.deviceId,[...i.get(n.deviceId)??[],{...n}]);this.bindings=i;for(let n of this.states.keys())i.has(n)||this.states.delete(n);this.rebuildEntityGroups(),this.updateHass(this.hass)}rebuildEntityGroups(){let e=new Map,i=Be(this.hass?.entities);for(let n of this.bindings.keys()){let r=le(Y(this.hass?.entities,n)),a=r?i.filter(([,s])=>le(s)===r).map(([s])=>s):[],o=[...new Set([n,...a])].sort((s,l)=>ce(s,this.hass)-ce(l,this.hass)||s.localeCompare(l));e.set(n,{deviceId:r,ids:o})}this.entityGroups=e}normalize(e){let i=this.bindings.get(e);if(!i)return A(e,"unavailable");let n=this.entityGroups.get(e)??{deviceId:null,ids:[e]},r=n.ids.map(s=>q(s,this.hass?.states?.[s],this.hass,i)),a=new Map;for(let s=0;s<r.length;s+=1)for(let[l,c]of Object.entries(r[s].controls??{}))!a.has(l)&&(c===!0||c&&typeof c=="object")&&a.set(l,n.ids[s]);this.commandTargets.set(e,a);let o=r.findIndex(s=>s.missing!==!0);return se(e,r,{name:Ve(n.deviceId,this.hass),iconEntityId:o>=0?n.ids[o]:e})}updateHass(e){if(!this.disposed){this.hass=e,this.registry!==e?.entities&&(this.registry=e?.entities??null,this.rebuildEntityGroups());for(let i of this.bindings.keys()){let n=this.normalize(i);if(JSON.stringify(n)!==JSON.stringify(this.states.get(i))){this.states.set(i,n);for(let r of this.listeners)r(structuredClone(n))}}}}async loadStates(e){return this.disposed?[]:e.map(i=>structuredClone(this.states.get(i)??this.normalize(i)))}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),()=>this.listeners.delete(e))}async execute(e,i){if(this.disposed)throw new Error("Home Assistant runtime has been disposed.");if(!this.bindings.has(e))throw new Error("Entity is not bound to this scene.");let n=this.normalize(e),r=ze[i?.type],a=this.commandTargets.get(e)?.get(r)??e,o=q(a,this.hass?.states?.[a],this.hass,this.bindings.get(e)),{domain:s,service:l,data:c}=oe(o,i,this.hass,this.supportsCommand);if(typeof this.hass?.callService!="function")throw new Error("Home Assistant is not connected.");return await this.hass.callService(s,l,c),{accepted:!0,deviceId:e,entityId:a,command:structuredClone(i)}}dispose(){this.disposed||(this.disposed=!0,this.listeners.clear(),this.states.clear(),this.bindings.clear(),this.entityGroups.clear(),this.commandTargets.clear(),this.hass=null,this.registry=null,this.supportsCommand=null)}};var L="mikonus_dashboard/scene/",He=[500,1e3,2e3,4e3,8e3],Ge=new Set(["unknown_command","integration_not_setup","disconnected","connection_lost","cannot_connect","timeout","transport_error","store_unavailable","storage_error"]),We={unknown_command:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste hinzuf\xFCgen. Warte auf die Integration \u2026",integration_not_setup:"Mikonus Dashboard unter Einstellungen \u2192 Ger\xE4te & Dienste einrichten oder neu laden. Warte auf die Integration \u2026",scene_not_found:"Diese Scene ist in Home Assistant nicht mehr verf\xFCgbar.",no_scenes:"Noch kein Dashboard ver\xF6ffentlicht. Ver\xF6ffentliche zuerst eine Scene aus Mikonus.",multiple_scenes:"Mehrere Dashboards vorhanden. Bitte scene_id in der Card-Konfiguration angeben.",invalid_scene_id:"Ung\xFCltige scene_id in der Card-Konfiguration.",invalid_scene:"Die ver\xF6ffentlichte Scene ist ung\xFCltig.",unauthorized:"Keine Berechtigung zum Laden dieses Dashboards.",permission_denied:"Keine Berechtigung zum Laden dieses Dashboards.",forbidden:"Keine Berechtigung zum Laden dieses Dashboards.",disconnected:"Verbindung zu Home Assistant unterbrochen."};function w(t){let e=typeof t=="number"?t:t?.code,i=[1,3].includes(e)?"disconnected":e;return Object.assign(new Error(We[i]??t?.message??"Dashboard konnte nicht geladen werden."),{code:i})}function $(t){return Ge.has(w(t).code)||t?.name==="NetworkError"}var M=()=>new DOMException("Scene source stopped or superseded.","AbortError");function he(t,e){return e.throwIfAborted(),new Promise((i,n)=>{let r=()=>n(M());e.addEventListener("abort",r,{once:!0}),Promise.resolve(t).then(i,n).finally(()=>e.removeEventListener("abort",r))})}var O=t=>{try{Promise.resolve(t?.()).catch(()=>{})}catch{}},N=class{constructor(e,{sceneId:i,onStatus:n=()=>{},retryDelays:r=He}={}){this.connection=e,this.sceneId=i,this.onStatus=n,this.revision=null,this.notifiedRevision=0,this.epoch=0,this.wakeRevision=0,this.transportGeneration=0,this.listeners=new Set,this.disposed=!1,this.unsubscribe=null,this.starting=null,this.pending=null,this.unavailable=!1,this.observers=new Map,this.retryDelays=r,this.retryIndex=0,this.timer=null,this.lifetime=new AbortController,this.transport=new AbortController,this.onDisconnect=()=>{this.disposed||(this.unavailable=!0,this.invalidate(),this.clearRetry(),this.onStatus(w({code:"disconnected"})))},this.onReconnect=()=>{this.disposed||(this.invalidate(),this.recover())},e?.addEventListener?.("disconnected",this.onDisconnect),e?.addEventListener?.("ready",this.onReconnect)}clearRetry(){clearTimeout(this.timer),this.timer=null}retry(e){this.disposed||!$(e)||this.timer!==null||this.connection?.connected===!1||this.retryIndex>=this.retryDelays.length||(this.timer=setTimeout(()=>{this.timer=null,this.wake()},this.retryDelays[this.retryIndex++]))}wake(){this.disposed||this.emit({revision:`recovery:${++this.wakeRevision}:${this.epoch}`})}recover(){this.clearRetry(),this.retryIndex=0,this.unavailable=!1,this.wake()}invalidate(){this.transport.abort(),this.transport=new AbortController,++this.epoch,++this.transportGeneration,this.pending=null,this.starting=null,this.revision=null,this.notifiedRevision=0,O(this.unsubscribe),this.unsubscribe=null;for(let e of this.observers.values())O(e.unsubscribe);this.observers.clear()}async observe(e,i,n){if(this.observers.has(e))return this.observers.get(e).promise;let r={};return this.observers.set(e,r),r.promise=this.connection.subscribeMessage(a=>{!this.disposed&&this.observers.get(e)===r&&n(a)},i,{resubscribe:!1}).then(a=>{if(this.disposed||this.observers.get(e)!==r)throw O(a),M();r.unsubscribe=a}).catch(a=>{throw this.observers.get(e)===r&&this.observers.delete(e),a}),r.promise}async start(){if(this.starting)return this.starting;let e=this.epoch,i=(async()=>{if(typeof this.connection?.sendMessagePromise!="function"||typeof this.connection?.subscribeMessage!="function"||this.connection.connected===!1)throw w({code:"disconnected"});if(await this.observe("component",{type:"subscribe_events",event_type:"component_loaded"},a=>{a.data?.component==="mikonus_dashboard"&&this.recover()}),await this.observe("watch",{type:L+"watch"},a=>{(a.type==="ready"||a.type==="updated"&&!this.unsubscribe&&(!this.sceneId||a.sceneId===this.sceneId))&&this.recover()}),!this.sceneId){let{scenes:a}=await this.connection.sendMessagePromise({type:L+"list"});if(this.disposed||e!==this.epoch)throw M();if(!a.length)throw w({code:"no_scenes"});if(a.length!==1)throw w({code:"multiple_scenes"});this.sceneId=a[0].sceneId}if(this.disposed||e!==this.epoch)throw M();if(this.unsubscribe)return;let n=this.transportGeneration,r=await this.connection.subscribeMessage(a=>{n===this.transportGeneration&&this.onEvent(a)},{type:L+"subscribe",scene_id:this.sceneId},{resubscribe:!1});if(this.disposed||e!==this.epoch)throw O(r),M();this.unsubscribe=r})();this.starting=i;try{return await i}finally{this.starting===i&&(this.starting=null)}}onEvent(e){if(!this.disposed){if(e.type==="unavailable"){this.unavailable=!0,this.onStatus(w(e)),$(e)||this.clearRetry(),this.retry(e);return}if((e.type==="deleted"||e.type==="removed")&&e.sceneId===this.sceneId){this.unavailable=!0,this.revision=null,this.notifiedRevision=0,++this.epoch,this.clearRetry(),this.onStatus(w({code:"scene_not_found"})),this.emit({sceneId:this.sceneId,revision:`deleted:${++this.wakeRevision}:${this.epoch}`});return}e.sceneId!==this.sceneId||!Number.isSafeInteger(e.revision)||(this.unavailable&&(this.unavailable=!1,this.revision=null,this.notifiedRevision=0,++this.epoch),!(e.revision<=(this.revision??0)||e.revision<=this.notifiedRevision)&&(this.notifiedRevision=e.revision,this.clearRetry(),this.retryIndex=0,this.listeners.size&&this.emit({sceneId:this.sceneId,revision:`${e.revision}:${this.epoch}`})))}}emit(e){for(let i of this.listeners)i(e)}async loadScene({signal:e}={}){if(e?.throwIfAborted(),this.disposed)throw M();let i=this.epoch,n=AbortSignal.any([this.lifetime.signal,this.transport.signal,...e?[e]:[]]);try{if(await he(this.start(),n),e?.throwIfAborted(),this.disposed||i!==this.epoch)throw M();this.pending??=this.connection.sendMessagePromise({type:L+"get",scene_id:this.sceneId});let r=this.pending,a;try{a=await he(r,n)}finally{this.pending===r&&(this.pending=null)}if(e?.throwIfAborted(),this.disposed||i!==this.epoch)throw M();let o=a?.metadata?.revision;if(a?.scene?.sceneId!==this.sceneId||!Number.isSafeInteger(o)||o<1)throw w({code:"invalid_scene"});return this.revision=o,this.clearRetry(),this.retryIndex=0,this.onStatus(null),{scene:a.scene,metadata:{...a.metadata,revision:`${o}:${i}`,source:"homeAssistant"}}}catch(r){if(this.disposed||i!==this.epoch||r?.name==="AbortError")throw M();let a=w(r);throw this.onStatus(a),$(r)||this.clearRetry(),this.retry(r),a}}async waitUntilReady({signal:e}={}){let i=[this.lifetime.signal,...e?[e]:[]],n=!0,r,a=()=>{n=!0,r?.()},o=this.subscribe(a);for(let s of i)s.addEventListener("abort",a);try{for(;;){for(let s of i)s.throwIfAborted();n||await new Promise(s=>{r=s}),r=null;for(let s of i)s.throwIfAborted();n=!1;try{return await this.loadScene({signal:e})}catch{if(this.disposed||e?.aborted)throw M()}}}finally{o();for(let s of i)s.removeEventListener("abort",a)}}subscribe(e){return this.disposed?()=>{}:(this.listeners.add(e),this.notifiedRevision>(this.revision??0)&&e({sceneId:this.sceneId,revision:`${this.notifiedRevision}:${this.epoch}`}),()=>this.listeners.delete(e))}dispose(){this.disposed||(this.disposed=!0,this.lifetime.abort(),this.clearRetry(),this.invalidate(),this.listeners.clear(),this.connection?.removeEventListener?.("disconnected",this.onDisconnect),this.connection?.removeEventListener?.("ready",this.onReconnect))}};var ue={schemaVersion:2,sceneId:"mikonus:ha-reference",name:"Mikonus HA Reference",metadata:{generator:"mikonus-ha-development-fixture",revision:"1"},defaultFloorId:"floor-eg",floors:[{id:"floor-ug",name:"UG",level:-1,sortOrder:0,elevation:-2.8,rooms:[{id:"room-ug-storage",name:"Keller",polygon:[{x:-2.4,z:-1.8},{x:2.4,z:-1.8},{x:2.4,z:1.8},{x:-2.4,z:1.8}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"object-ug-storage",kind:"furniture",shape:"box",position:{x:0,y:.45,z:0},rotation:{y:0},size:{width:1.2,depth:.6,height:.9},appearance:"cabinet"}]},{id:"floor-eg",name:"EG",level:0,sortOrder:1,elevation:0,rooms:[{id:"room-eg-living",name:"Wohnzimmer",polygon:[{x:-3.2,z:-2.4},{x:3.2,z:-2.4},{x:3.2,z:2.4},{x:-3.2,z:2.4}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[{id:"wall-eg-north",start:{x:-3.2,z:-2.4},end:{x:3.2,z:-2.4},baseY:0,height:2.8,thickness:.15}],doors:[],windows:[{id:"cover-eg-window",wallId:"wall-eg-north",position:{x:0,y:.7,z:-2.4},rotation:{y:0},size:{width:1.8,height:1.7,depth:.08},openAngle:0,binding:{provider:"homeAssistant",deviceId:"cover.mikonus_reference",capability:"position"}}],objects:[{id:"light-eg-living",kind:"light",position:{x:-.8,y:2.35,z:.4},rotation:{y:0},size:{width:.42,depth:.42,height:.16},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_reference",capability:"power"}}]},{id:"floor-og",name:"OG",level:1,sortOrder:2,elevation:2.8,rooms:[{id:"room-og-bedroom",name:"Schlafzimmer",polygon:[{x:-2.8,z:-2.1},{x:2.8,z:-2.1},{x:2.8,z:2.1},{x:-2.8,z:2.1}],elevation:0,floorThickness:.2,appearance:"floor"}],walls:[],doors:[],windows:[],objects:[{id:"light-og-bedroom",kind:"light",position:{x:.9,y:2.35,z:-.3},rotation:{y:0},size:{width:.38,depth:.38,height:.14},visualType:"ceilingLight",appearance:"ceiling-light",binding:{provider:"homeAssistant",deviceId:"light.mikonus_upstairs",capability:"power"}}]}]};var Xe={"light.mikonus_reference":"light","light.mikonus_upstairs":"upstairs_light","cover.mikonus_reference":"cover"};function de(t={}){let e=structuredClone(ue);for(let i of e.floors)for(let n of["objects","doors","windows"])for(let r of i[n])r.binding&&(r.binding.deviceId=t[Xe[r.binding.deviceId]]??r.binding.deviceId);return e}var U=class{#e=null;#i=new Set;#t=!1;read(){return this.#e}updateHass(e){if(this.#t)return;let i=e?.themes?.darkMode,n=typeof i=="boolean"?i?"dark":"light":null;if(n!==this.#e){this.#e=n;for(let r of this.#i)r(n)}}subscribe(e){return this.#t?()=>{}:(this.#i.add(e),()=>this.#i.delete(e))}dispose(){this.#t=!0,this.#i.clear()}};function qe(t){let e=t?.states?.["sun.sun"];if(e?.attributes?.elevation===null||e?.attributes?.elevation===void 0||e?.attributes?.azimuth===null||e?.attributes?.azimuth===void 0||e?.attributes?.elevation===""||e?.attributes?.azimuth==="")return null;let i=Number(e?.attributes?.elevation),n=Number(e?.attributes?.azimuth);return!Number.isFinite(i)||!Number.isFinite(n)||i<-90||i>90?null:Object.freeze({elevationDegrees:i,azimuthDegrees:n,source:"home-assistant"})}function Ye(t){return t?`${t.elevationDegrees}:${t.azimuthDegrees}`:"fallback"}var F=class{#e=null;#i="fallback";#t=new Set;#r=!1;read(){return this.#e}updateHass(e){if(this.#r)return;let i=qe(e),n=Ye(i);if(n!==this.#i){this.#e=i,this.#i=n;for(let r of this.#t)r(this.#e)}}subscribe(e){return this.#r?()=>{}:(this.#t.add(e),()=>this.#t.delete(e))}dispose(){this.#r=!0,this.#t.clear(),this.#e=null,this.#i="fallback"}};var k=class{constructor(e=document){this.document=e,this.hass=null}updateHass(e){this.hass=e}create(e){let i=typeof e?.entityId=="string"?e.entityId:null,n=i?this.hass?.states?.[i]:null,r=this.document?.defaultView?.customElements??globalThis.customElements;if(!n||!this.document?.createElement||typeof r?.get!="function"||!r.get("ha-state-icon"))return null;let a=this.document.createElement("ha-state-icon");return a.hass=this.hass,a.stateObj=n,a}dispose(){this.hass=null}};var z=Object.freeze(["ambientLight","shadowsEnabled","shadowStrength","theme","autoBrightness","indoorBrightnessInDarkness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),me=new Set(["shadowsEnabled","autoBrightness","indoorBrightnessInDarkness","cameraLocked","cameraRotationEnabled","cameraZoomEnabled","cameraPanEnabled","showFloorSelector","showQuickControls","showDeviceMarkers"]),fe=Object.freeze({ambientLight:100,shadowsEnabled:!0,shadowStrength:100,theme:"auto",autoBrightness:!0,indoorBrightnessInDarkness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0});function pe(t,e,i,n){if(typeof t!="number"||!Number.isFinite(t))throw new Error(`${e} must be a finite number.`);return Math.min(Math.max(t,i),n)}function B(t={}){let e={};for(let i of z){let n=t[i];if(n!==void 0){if(me.has(i)){if(typeof n!="boolean")throw new Error(`${i} must be a boolean.`);e[i]=n;continue}if(i==="ambientLight"){e[i]=pe(n,i,0,150);continue}if(i==="shadowStrength"){e[i]=pe(n,i,0,100);continue}if(i==="theme"){if(!["auto","light","dark"].includes(n))throw new Error("theme must be auto, light or dark.");e[i]=n}}}return e}function K(t={}){let e=B(t),i={};e.ambientLight!==void 0&&(i.ambientBrightnessPercent=e.ambientLight),e.shadowStrength!==void 0&&(i.shadowIntensityPercent=e.shadowStrength),e.theme!==void 0&&(i.themeMode=e.theme);for(let n of me)e[n]!==void 0&&(i[n]=e[n]);return i}function Z(t={}){return Object.freeze({...fe,...B(t)})}function ge(t={}){let e=Z(t);return Object.fromEntries(z.filter(i=>e[i]!==fe[i]).map(i=>[i,e[i]]))}var $e=new Set(["scene","floor","room"]);function ve(t,e){if(!(t==null||t==="")){if(typeof t!="string"||!t.trim()||t.length>255)throw new Error(`Invalid ${e}.`);return t.trim()}}function _e(t){let e=t.view_mode??"scene";if(!$e.has(e))throw new Error("Invalid view_mode.");let i=ve(t.floor_id,"floor_id"),n=ve(t.room_id,"room_id");return e==="scene"?{}:e==="floor"?{view_mode:"floor",...i?{floor_id:i}:{}}:{view_mode:"room",...i?{floor_id:i}:{},...n?{room_id:n}:{}}}function be(t){if(!t||t.type!=="custom:mikonus-3d-card")throw new Error("Expected type: custom:mikonus-3d-card.");let e=B(t),i=_e(t),n=t.scene??"published";if(n==="published"){if(t.scene_id!==void 0&&(typeof t.scene_id!="string"||!/^mikonus:[A-Za-z0-9][A-Za-z0-9:_-]{0,190}$/.test(t.scene_id)))throw new Error("Invalid scene_id.");if(t.entities!==void 0)throw new Error("entities applies only to scene: reference.");return{type:"custom:mikonus-3d-card",scene:"published",...t.scene_id?{scene_id:t.scene_id}:{},...i,...e}}if(n!=="reference")throw new Error("Expected scene: reference or published.");if(t.scene_id!==void 0)throw new Error("scene_id requires scene: published.");let r=t.entities??{};if(!r||typeof r!="object"||Array.isArray(r))throw new Error("entities must be a mapping.");let a={};for(let o of Object.keys(r).sort()){let s={light:"light",upstairs_light:"light",cover:"cover"}[o],l=r[o];if(!s||typeof l!="string"||!D.test(l)||!l.startsWith(`${s}.`))throw new Error(`Invalid reference entity mapping: ${o}.`);a[o]=l}return{type:"custom:mikonus-3d-card",scene:"reference",entities:a,...i,...e}}function J(t){return{...t.scene==="published"?{scene:"published",...t.scene_id?{scene_id:t.scene_id}:{}}:{scene:"reference",entities:t.entities},..._e(t)}}function ye(t){return{mode:t.view_mode??"scene",...t.floor_id?{floorId:t.floor_id}:{},...t.room_id?{roomId:t.room_id}:{}}}var Ke={floor_not_selected:"Bitte im Karteneditor eine Etage ausw\xE4hlen.",room_not_selected:"Bitte im Karteneditor einen Raum ausw\xE4hlen.",floor_not_found:"Die ausgew\xE4hlte Etage ist in dieser Scene nicht mehr vorhanden.",room_not_found:"Der ausgew\xE4hlte Raum ist in dieser Scene nicht mehr vorhanden."};function xe(t){return Ke[t?.code]??t?.message??"Unbekannter Fehler"}function Me(t){return class extends HTMLElement{#e=null;#i=null;#t=null;#r=null;#a=0;#d=new Map;#n=null;#o=null;#c=null;#l=null;#h=i=>{i.persisted&&(this.#m(),this.#u())};constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML='<style>:host{display:block;height:100%;min-height:360px}.card{position:relative;height:100%;min-height:360px;border-radius:var(--ha-card-border-radius,12px);overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff))}.viewport{position:absolute;inset:0}p{position:absolute;inset:16px auto auto 16px;margin:0;max-width:calc(100% - 32px);font:14px system-ui;color:var(--primary-text-color,#222)}p.terminal{inset:0;max-width:none;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;background:var(--ha-card-background,var(--card-background-color,#fff));z-index:2}[hidden]{display:none!important}</style><div class="card"><div class="viewport"></div><p role="status">Warte auf Home Assistant \u2026</p></div>'}setConfig(i){let n=be(i);if(JSON.stringify(n)===JSON.stringify(this.#e))return;let r=this.#e&&JSON.stringify(J(n))===JSON.stringify(J(this.#e));if(this.#e=n,r&&!this.#r?.disposed){this.#t?.updateSettings?.(K(n));return}this.#m(),this.#u()}set hass(i){let n=this.#i&&this.#i.connection!==i?.connection;this.#i=i,n&&this.#e?.scene==="published"&&this.#m(),this.#o?.updateHass(i),this.#c?.updateHass(i),this.#l?.updateHass(i),this.#r?.updateHass(i),this.#u()}get hass(){return this.#i}connectedCallback(){window.addEventListener("pageshow",this.#h),this.#u()}disconnectedCallback(){window.removeEventListener("pageshow",this.#h),this.#m()}getCardSize(){return 8}getGridOptions(){return{columns:"full",rows:7,min_columns:6,min_rows:6}}static getStubConfig(){return{scene:"published"}}static getConfigElement(){return document.createElement("mikonus-3d-card-editor")}#p(i,n=!1){let r=this.shadowRoot.querySelector("[role=status]");r.textContent=i,r.hidden=!i,r.classList.toggle("terminal",!!i&&n)}#u(){if(!this.isConnected||!this.#e||!this.#i||this.#r)return;let i=++this.#a,n=new I(this.#i);this.#r=n,this.#o=new U,this.#o.updateHass(this.#i),this.#c=new F,this.#c.updateHass(this.#i),this.#l=new k(document),this.#l.updateHass(this.#i),this.#p("Mikonus wird geladen \u2026");let r=this.#d,a={getItem:o=>r.get(o)??null,setItem:(o,s)=>r.set(o,String(s)),removeItem:o=>r.delete(o)};this.#e.scene==="published"&&(this.#n=new N(this.#i.connection,{sceneId:this.#e.scene_id,onStatus:o=>{i===this.#a&&this.#p(o?.message??"",o?.code==="scene_not_found")}}));try{let o=t({container:this.shadowRoot.querySelector(".viewport"),runtime:n,scene:this.#n?void 0:de(this.#e.entities),sceneSource:this.#n,themeSource:this.#o,solarSource:this.#c,iconSource:this.#l,storage:a,presentationSettings:K(this.#e),view:ye(this.#e),onReady:()=>{i===this.#a&&this.#p("")},onError:s=>{i===this.#a&&(n.dispose(),this.#n?.dispose(),this.#p(`Mikonus konnte nicht geladen werden: ${xe(s)}`))}});i!==this.#a?o.dispose():this.#t=o}catch(o){n.dispose(),this.#n?.dispose(),this.#p(`Mikonus konnte nicht geladen werden: ${xe(o)}`)}}#m(){++this.#a;try{this.#t?.dispose()}finally{this.#n?.dispose(),this.#n=null,this.#o?.dispose(),this.#o=null,this.#c?.dispose(),this.#c=null,this.#l?.dispose(),this.#l=null,this.#r?.dispose(),this.#r=null,this.#t=null,this.shadowRoot.querySelector(".viewport").replaceChildren()}}}}var V="mikonus_dashboard/scene/",ee=new Set(["scene","floor","room"]),v=Object.freeze({unknown:"unknown",loading:"loading",loaded:"loaded",error:"error"}),we=Object.freeze({de:{intro:"Die ver\xF6ffentlichte Scene bleibt unver\xE4ndert. Diese Ansicht gilt nur f\xFCr diese Karteninstanz.",sceneSection:"Dashboard Scene",scene:"Szenenquelle",scene_id:"Scene",view_mode:"Ansicht",floor_id:"Etage",room_id:"Raum",published:"Ver\xF6ffentlichte Scene",reference:"Entwicklungs-Referenzscene",entireScene:"Gesamte Scene",floor:"Etage",room:"Raum",loadingScenes:"Ver\xF6ffentlichte Scenes werden geladen \u2026",loadingScene:"Etagen und R\xE4ume werden geladen \u2026",noScenes:"Noch keine Scene vorhanden. Bitte zuerst aus Mikonus nach Home Assistant ver\xF6ffentlichen.",selectScene:"Bitte eine ver\xF6ffentlichte Mikonus Scene ausw\xE4hlen.",sceneUnavailable:"Die ausgew\xE4hlte Scene ist nicht mehr in Home Assistant vorhanden.",catalogError:"Ver\xF6ffentlichte Scenes konnten nicht geladen werden.",retry:"Erneut versuchen",selectedScene:"Ausgew\xE4hlte Scene",sceneError:"Etagen und R\xE4ume dieser Scene konnten nicht geladen werden.",chooseFloor:"Bitte eine Etage ausw\xE4hlen.",chooseRoom:"Bitte einen Raum ausw\xE4hlen. R\xE4ume werden nach der gew\xE4hlten Etage gefiltert.",unnamedScene:"Unbenannte Scene",unavailableScene:"Nicht mehr verf\xFCgbare Scene",revision:"Revision",lastPublished:"Zuletzt ver\xF6ffentlicht",manage:"Ver\xF6ffentlichte Scenes verwalten",manageTitle:"Ver\xF6ffentlichte Mikonus Scenes",technicalId:"Technische Scene-ID",delete:"L\xF6schen",deleteFailed:"Die ver\xF6ffentlichte Scene konnte nicht gel\xF6scht werden.",deleteConfirm:t=>`\u201E${t}\u201C aus Home Assistant l\xF6schen?

Nur die ver\xF6ffentlichte Dashboard-Scene wird aus Home Assistant entfernt. Das Mikonus-Projekt selbst sowie Home-Assistant-Ger\xE4te und Entities werden nicht gel\xF6scht.`,displaySection:"Darstellung",ambientLight:"Umgebungshelligkeit",shadowsEnabled:"Schatten aktivieren",shadowStrength:"Schattenst\xE4rke",theme:"Theme",autoBrightness:"Automatische Helligkeit",indoorBrightnessInDarkness:"Grundhelligkeit bei Dunkelheit",auto:"Automatisch",light:"Hell",dark:"Dunkel",cameraSection:"Kamera",cameraLocked:"Kamera sperren",cameraRotationEnabled:"Rotation erlauben",cameraZoomEnabled:"Zoom erlauben",cameraPanEnabled:"Verschieben erlauben",uiSection:"Dashboard UI",showFloorSelector:"Etagenumschalter anzeigen",showQuickControls:"Quick-Control-Chips anzeigen",showDeviceMarkers:"Device-Marker anzeigen"},en:{intro:"The published scene stays unchanged. This view applies only to this card instance.",sceneSection:"Dashboard Scene",scene:"Scene source",scene_id:"Scene",view_mode:"View",floor_id:"Floor",room_id:"Room",published:"Published scene",reference:"Development reference scene",entireScene:"Entire scene",floor:"Floor",room:"Room",loadingScenes:"Loading published scenes \u2026",loadingScene:"Loading floors and rooms \u2026",noScenes:"No scene has been published yet. Publish one from Mikonus to Home Assistant first.",selectScene:"Select a published Mikonus scene.",sceneUnavailable:"The selected scene is no longer available in Home Assistant.",catalogError:"Published scenes could not be loaded.",retry:"Try again",selectedScene:"Selected scene",sceneError:"The floors and rooms in this scene could not be loaded.",chooseFloor:"Select a floor.",chooseRoom:"Select a room. Rooms are filtered by the selected floor.",unnamedScene:"Unnamed scene",unavailableScene:"Scene no longer available",revision:"Revision",lastPublished:"Last published",manage:"Manage published scenes",manageTitle:"Published Mikonus scenes",technicalId:"Technical scene ID",delete:"Delete",deleteFailed:"The published scene could not be deleted.",deleteConfirm:t=>`Delete \u201C${t}\u201D from Home Assistant?

Only the published dashboard scene is removed from Home Assistant. The Mikonus project itself and Home Assistant devices and entities are not deleted.`,displaySection:"Appearance",ambientLight:"Ambient light",shadowsEnabled:"Enable shadows",shadowStrength:"Shadow strength",theme:"Theme",autoBrightness:"Automatic brightness",indoorBrightnessInDarkness:"Indoor brightness in darkness",auto:"Auto",light:"Light",dark:"Dark",cameraSection:"Camera",cameraLocked:"Lock camera",cameraRotationEnabled:"Allow rotation",cameraZoomEnabled:"Allow zoom",cameraPanEnabled:"Allow pan",uiSection:"Dashboard UI",showFloorSelector:"Show floor selector",showQuickControls:"Show quick-control chips",showDeviceMarkers:"Show device markers"},es:{loadingScenes:"Cargando escenas publicadas \u2026",noScenes:"Todav\xEDa no hay ninguna escena. Publ\xEDcala primero desde Mikonus en Home Assistant.",selectScene:"Selecciona una escena de Mikonus publicada.",sceneUnavailable:"La escena seleccionada ya no est\xE1 disponible en Home Assistant.",catalogError:"No se han podido cargar las escenas publicadas.",retry:"Reintentar",selectedScene:"Escena seleccionada",unavailableScene:"Escena ya no disponible",unnamedScene:"Escena sin nombre",manage:"Gestionar escenas publicadas",manageTitle:"Escenas de Mikonus publicadas",technicalId:"ID t\xE9cnico de la escena",delete:"Eliminar",deleteFailed:"No se ha podido eliminar la escena publicada.",deleteConfirm:t=>`\xBFEliminar \xAB${t}\xBB de Home Assistant?

Solo se elimina de Home Assistant la escena de panel publicada. No se eliminan el proyecto de Mikonus ni los dispositivos o entidades de Home Assistant.`,revision:"Revisi\xF3n",lastPublished:"\xDAltima publicaci\xF3n"},fr:{loadingScenes:"Chargement des sc\xE8nes publi\xE9es \u2026",noScenes:"Aucune sc\xE8ne n\u2019est encore disponible. Publiez-en d\u2019abord une depuis Mikonus vers Home Assistant.",selectScene:"S\xE9lectionnez une sc\xE8ne Mikonus publi\xE9e.",sceneUnavailable:"La sc\xE8ne s\xE9lectionn\xE9e n\u2019est plus disponible dans Home Assistant.",catalogError:"Impossible de charger les sc\xE8nes publi\xE9es.",retry:"R\xE9essayer",selectedScene:"Sc\xE8ne s\xE9lectionn\xE9e",unavailableScene:"Sc\xE8ne plus disponible",unnamedScene:"Sc\xE8ne sans nom",manage:"G\xE9rer les sc\xE8nes publi\xE9es",manageTitle:"Sc\xE8nes Mikonus publi\xE9es",technicalId:"ID technique de la sc\xE8ne",delete:"Supprimer",deleteFailed:"Impossible de supprimer la sc\xE8ne publi\xE9e.",deleteConfirm:t=>`Supprimer \xAB\xA0${t}\xA0\xBB de Home Assistant\xA0?

Seule la sc\xE8ne de tableau de bord publi\xE9e est retir\xE9e de Home Assistant. Le projet Mikonus lui-m\xEAme ainsi que les appareils et entit\xE9s Home Assistant ne sont pas supprim\xE9s.`,revision:"R\xE9vision",lastPublished:"Derni\xE8re publication"},nl:{loadingScenes:"Gepubliceerde sc\xE8nes worden geladen \u2026",noScenes:"Er is nog geen sc\xE8ne beschikbaar. Publiceer er eerst een vanuit Mikonus naar Home Assistant.",selectScene:"Selecteer een gepubliceerde Mikonus-sc\xE8ne.",sceneUnavailable:"De geselecteerde sc\xE8ne is niet meer beschikbaar in Home Assistant.",catalogError:"De gepubliceerde sc\xE8nes konden niet worden geladen.",retry:"Opnieuw proberen",selectedScene:"Geselecteerde sc\xE8ne",unavailableScene:"Sc\xE8ne niet meer beschikbaar",unnamedScene:"Naamloze sc\xE8ne",manage:"Gepubliceerde sc\xE8nes beheren",manageTitle:"Gepubliceerde Mikonus-sc\xE8nes",technicalId:"Technische sc\xE8ne-ID",delete:"Verwijderen",deleteFailed:"De gepubliceerde sc\xE8ne kon niet worden verwijderd.",deleteConfirm:t=>`\u2018${t}\u2019 uit Home Assistant verwijderen?

Alleen de gepubliceerde dashboardsc\xE8ne wordt uit Home Assistant verwijderd. Het Mikonus-project zelf en Home Assistant-apparaten en -entiteiten worden niet verwijderd.`,revision:"Revisie",lastPublished:"Laatst gepubliceerd"}}),C=t=>({select:{mode:"dropdown",options:t}}),Q=(t,e)=>t?.name??t?.projectName??e.unnamedScene;function Ze(t,e){let i=[];return Number.isSafeInteger(t?.revision)&&i.push(`${e.revision} ${t.revision}`),typeof t?.publishedAt=="string"&&i.push(t.publishedAt.replace("T"," ").slice(0,16)),`${Q(t,e)}${i.length?` \u2014 ${i.join(" \xB7 ")}`:""}`}function H(t,e){return t?.floors?.find(i=>i.id===e)}function Te(t){return H(t,t?.defaultFloorId)?.id??t?.floors?.[0]?.id}function Je(t,{config:e={},scenes:i=[],selectedScene:n=null,catalogState:r=v.unknown}={}){let a=e.scene==="reference"?"reference":"published",o=ee.has(e.view_mode)?e.view_mode:"scene",s=i.map(c=>({value:c.sceneId,label:Ze(c,t)}));e.scene_id&&!i.some(c=>c.sceneId===e.scene_id)&&s.push({value:e.scene_id,label:r===v.loaded?t.unavailableScene:t.selectedScene});let l=[];if(a==="published"?l.push({name:"scene_id",required:i.length!==1||!!e.scene_id,disabled:r===v.loading,selector:C(s)}):l.push({name:"scene",required:!0,selector:C([{value:"published",label:t.published},{value:"reference",label:t.reference}])}),l.push({name:"view_mode",required:!0,selector:C([{value:"scene",label:t.entireScene},{value:"floor",label:t.floor},{value:"room",label:t.room}])}),(o==="floor"||o==="room")&&l.push({name:"floor_id",required:!0,selector:C((n?.floors??[]).map(c=>({value:c.id,label:c.name})))}),o==="room"){let c=H(n,e.floor_id??Te(n));l.push({name:"room_id",required:!0,selector:C((c?.rooms??[]).map(p=>({value:p.id,label:p.name})))})}return[{type:"expandable",name:"sceneSettings",title:t.sceneSection,flatten:!0,schema:l},{type:"expandable",name:"displaySettings",title:t.displaySection,flatten:!0,schema:[{name:"ambientLight",required:!0,selector:{number:{min:0,max:150,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"shadowsEnabled",required:!0,selector:{boolean:{}}},{name:"shadowStrength",required:!0,selector:{number:{min:0,max:100,step:5,mode:"slider",unit_of_measurement:"%"}}},{name:"theme",required:!0,selector:C([{value:"auto",label:t.auto},{value:"light",label:t.light},{value:"dark",label:t.dark}])},{name:"autoBrightness",required:!0,selector:{boolean:{}}},{name:"indoorBrightnessInDarkness",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"cameraSettings",title:t.cameraSection,flatten:!0,schema:[{name:"cameraLocked",required:!0,selector:{boolean:{}}},{name:"cameraRotationEnabled",required:!0,selector:{boolean:{}}},{name:"cameraZoomEnabled",required:!0,selector:{boolean:{}}},{name:"cameraPanEnabled",required:!0,selector:{boolean:{}}}]},{type:"expandable",name:"uiSettings",title:t.uiSection,flatten:!0,schema:[{name:"showFloorSelector",required:!0,selector:{boolean:{}}},{name:"showQuickControls",required:!0,selector:{boolean:{}}},{name:"showDeviceMarkers",required:!0,selector:{boolean:{}}}]}]}function Se(t){return{scene:t.scene??"published",...t.scene_id?{scene_id:t.scene_id}:{},view_mode:ee.has(t.view_mode)?t.view_mode:"scene",...t.floor_id?{floor_id:t.floor_id}:{},...t.room_id?{room_id:t.room_id}:{},...Z(t)}}function Ee(t,e,i=null){let n={...t,type:"custom:mikonus-3d-card"},r=t.scene==="reference"?"reference":"published",a=t.scene_id;n.scene=e.scene==="reference"?"reference":"published",n.scene==="published"?(delete n.entities,typeof e.scene_id=="string"&&e.scene_id.trim()?n.scene_id=e.scene_id.trim():delete n.scene_id):(delete n.scene_id,n.entities??={});let o=r!==n.scene||a!==n.scene_id,s=ee.has(e.view_mode)?e.view_mode:"scene";if(delete n.view_mode,delete n.floor_id,delete n.room_id,s!=="scene"&&(n.view_mode=s),s!=="scene"){let l=o?void 0:e.floor_id,c=i?H(i,l)?.id??Te(i):l;if(c&&(n.floor_id=c),s==="room"&&!o&&typeof e.room_id=="string"){let p=H(i,c)?.rooms?.find(d=>d.id===e.room_id);(i?p:e.room_id.trim())&&(n.room_id=e.room_id.trim())}}for(let l of z)delete n[l];return Object.assign(n,ge(e)),n}function Qe(t,e){return JSON.stringify(t)===JSON.stringify(e)}function Ae(){return class extends HTMLElement{#e={type:"custom:mikonus-3d-card",scene:"published"};#i=null;#t=null;#r;#a=[];#d=null;#n=v.unknown;#o=!1;#c=null;#l=null;#h=0;#p=null;#u=null;#m=0;#b=!1;#y=null;#g=!1;#E=()=>{this.isConnected&&(this.#v(),this.#f())};#T=()=>{this.isConnected&&(this.#n=v.error,this.#c={code:"disconnected"},this.#s())};constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML=`<style>
        :host{display:block}.intro,.state{margin:0 0 12px;color:var(--secondary-text-color);font-size:14px;line-height:1.4}
        .state.error{color:var(--error-color,#db4437)}ha-form{display:block}.manage{margin-top:14px}
        button{font:inherit;color:var(--primary-color);background:none;border:0;padding:8px 0;cursor:pointer}
        button[disabled]{cursor:default;opacity:.55}.panel{border-top:1px solid var(--divider-color);padding-top:8px}
        .panel h3{font-size:15px;margin:6px 0}.scene-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;padding:10px 0;border-top:1px solid var(--divider-color)}
        .scene-row:first-of-type{border-top:0}.scene-name{font-weight:600}.meta,.technical{font-size:12px;color:var(--secondary-text-color);overflow-wrap:anywhere}
        .delete{color:var(--error-color,#db4437);grid-column:2;grid-row:1/3;align-self:center;padding:8px}
      </style><p class="intro"></p><p class="state" role="status" hidden></p><button class="catalog-retry" type="button" hidden></button><ha-form></ha-form>
      <div class="manage"><button class="manage-toggle" type="button"></button><section class="panel" hidden><h3></h3><div class="scene-list"></div></section></div>`,this.#r=this.shadowRoot.querySelector("ha-form"),this.#r.addEventListener("value-changed",e=>{e.stopPropagation();let i=e.detail?.value??{},n=i.scene==="reference"?void 0:i.scene_id,r=n&&this.#d?.sceneId===n?this.#d:null,a=`${this.#e.scene??"published"}:${this.#e.scene_id??""}`,o=Ee(this.#e,i,r),s=`${o.scene}:${o.scene_id??""}`;this.#S(o),a!==s?this.#w():this.#s()}),this.shadowRoot.querySelector(".manage-toggle").addEventListener("click",()=>{this.#b=!this.#b,this.#_()}),this.shadowRoot.querySelector(".catalog-retry").addEventListener("click",()=>{this.#g=!1,this.#v(),this.#f()}),this.#s()}connectedCallback(){this.#A(),this.#R()}disconnectedCallback(){++this.#h,this.#v(),this.#C()}setConfig(e){let i=this.#e.scene_id;this.#e={...e},this.#s(),this.isConnected&&i!==this.#e.scene_id&&this.#w()}set hass(e){this.#i=e,this.#t!==e?.connection&&(this.#C(),this.#t=e?.connection??null,this.#v(),this.#n=v.unknown,this.#c=null,this.isConnected&&(this.#A(),this.#f())),this.#s()}get hass(){return this.#i}#x(){let i=(this.#i?.language??this.#i?.locale?.language??"en").toLowerCase().slice(0,2);return{...we.en,...we[i]??{}}}#R(){this.#t?this.#f():this.#s()}#A(){this.#t?.addEventListener?.("ready",this.#E),this.#t?.addEventListener?.("disconnected",this.#T)}#C(){this.#t?.removeEventListener?.("ready",this.#E),this.#t?.removeEventListener?.("disconnected",this.#T)}#v(){++this.#m;try{Promise.resolve(this.#p?.()).catch(()=>{})}catch{}this.#p=null,this.#u=null}async#M(){if(this.#p||this.#u||typeof this.#t?.subscribeMessage!="function")return this.#u;let e=this.#t,i=this.#m,n=(async()=>{try{let r=await e.subscribeMessage(()=>{this.isConnected&&this.#f()},{type:`${V}watch`},{resubscribe:!1});if(i!==this.#m||e!==this.#t||!this.isConnected)try{await r?.()}catch{}else this.#p=r}catch{}})();this.#u=n;try{await n}finally{this.#u===n&&(this.#u=null)}}async#f(){if(typeof this.#t?.sendMessagePromise!="function"){this.#n=v.unknown,this.#s();return}let e=++this.#h;this.#n=v.loading,this.#c=null,this.#s(),this.#M();try{let i=await this.#t.sendMessagePromise({type:`${V}list`});if(e!==this.#h||!this.isConnected)return;this.#a=Array.isArray(i?.scenes)?i.scenes:[],this.#n=v.loaded,(this.#e.scene??"published")==="published"&&!this.#e.scene_id&&this.#a.length===1&&this.#S({...this.#e,scene:"published",scene_id:this.#a[0].sceneId}),await this.#w(e),e===this.#h&&this.#M()}catch(i){if(e!==this.#h||!this.isConnected)return;this.#n=v.error,this.#c=i,this.#s(),this.#M()}}async#w(e=null){let i=e??++this.#h,n=(this.#e.scene??"published")==="published"?this.#e.scene_id:null;if(this.#l=null,!n||this.#n===v.loaded&&!this.#a.some(r=>r.sceneId===n)){this.#d=null,this.#o=!1,this.#s();return}if(this.#n!==v.loaded){this.#o=!1,this.#s();return}this.#d?.sceneId!==n&&(this.#d=null),this.#o=!0,this.#s();try{let r=await this.#t.sendMessagePromise({type:`${V}get`,scene_id:n});if(i!==this.#h||!this.isConnected||this.#e.scene_id!==n)return;this.#d=r?.scene??null,this.#o=!1;let a=Ee(this.#e,Se(this.#e),this.#d);this.#S(a),this.#s()}catch(r){if(i!==this.#h||!this.isConnected)return;this.#o=!1,this.#l=r,this.#s()}}#S(e){Qe(this.#e,e)||(this.#e=e,this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:e}})))}#P(e){return this.#g?[e.deleteFailed,!0]:this.#n===v.unknown||this.#n===v.loading?[e.loadingScenes,!1]:this.#n===v.error?[e.catalogError,!0]:(this.#e.scene??"published")!=="published"?[null,!1]:this.#a.length?this.#e.scene_id?this.#a.some(i=>i.sceneId===this.#e.scene_id)?this.#o?[e.loadingScene,!1]:this.#l?[e.sceneError,!0]:[null,!1]:[e.sceneUnavailable,!0]:[e.selectScene,!1]:[e.noScenes,!1]}#s(){if(!this.#r)return;let e=this.#x();this.shadowRoot.querySelector(".intro").textContent=e.intro;let[i,n]=this.#P(e),r=this.shadowRoot.querySelector(".state");r.textContent=i??"",r.hidden=!i,r.classList.toggle("error",n);let a=this.shadowRoot.querySelector(".catalog-retry");a.textContent=e.retry,a.hidden=this.#n!==v.error&&!this.#g,this.#r.hass=this.#i,this.#r.data=Se(this.#e),this.#r.schema=Je(e,{config:this.#e,scenes:this.#a,selectedScene:this.#d,catalogState:this.#n}),this.#r.computeLabel=o=>e[o.name],this.#r.computeHelper=o=>({floor_id:e.chooseFloor,room_id:e.chooseRoom})[o.name],this.#_()}#_(){let e=this.#x(),i=this.shadowRoot.querySelector(".manage-toggle");i.textContent=e.manage;let n=this.shadowRoot.querySelector(".panel");n.hidden=!this.#b,n.querySelector("h3").textContent=e.manageTitle;let r=n.querySelector(".scene-list");if(r.replaceChildren(),!this.#a.length){let a=document.createElement("p");a.className="meta",a.textContent=this.#n===v.loaded?e.noScenes:e.catalogError,r.append(a);return}for(let a of this.#a){let o=document.createElement("div");o.className="scene-row";let s=document.createElement("div");s.className="scene-name",s.textContent=Q(a,e);let l=document.createElement("div");l.className="meta";let c=[];Number.isSafeInteger(a.revision)&&c.push(`${e.revision} ${a.revision}`),a.publishedAt&&c.push(`${e.lastPublished}: ${a.publishedAt.replace("T"," ").slice(0,16)}`),l.textContent=c.join(" \xB7 ");let p=document.createElement("div");p.className="technical",p.textContent=`${e.technicalId}: ${a.sceneId}`;let d=document.createElement("button");d.className="delete",d.type="button",d.textContent=e.delete,d.disabled=this.#y===a.sceneId||!this.#i?.user?.is_admin,d.addEventListener("click",()=>this.#D(a)),o.append(s,l,p,d),r.append(o)}}async#D(e){let i=this.#x();if(!(!this.#i?.user?.is_admin||!window.confirm(i.deleteConfirm(Q(e,i))))){this.#y=e.sceneId,this.#g=!1,this.#l=null,this.#_();try{await this.#t.sendMessagePromise({type:`${V}delete`,scene_id:e.sceneId,expected_revision:e.revision}),await this.#f()}catch(n){await this.#f(),this.#l=n,this.#g=!0,this.#s()}finally{this.#y=null,this.#_()}}}}}var Ce=`(()=>{var tx=Object.create;var qd=Object.defineProperty;var nx=Object.getOwnPropertyDescriptor;var ix=Object.getOwnPropertyNames;var sx=Object.getPrototypeOf,rx=Object.prototype.hasOwnProperty;var Hr=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var ox=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of ix(e))!rx.call(n,s)&&s!==t&&qd(n,s,{get:()=>e[s],enumerable:!(i=nx(e,s))||i.enumerable});return n};var zn=(n,e,t)=>(t=n!=null?tx(sx(n)):{},ox(e||!n||!n.__esModule?qd(t,"default",{value:n,enumerable:!0}):t,n));var cu=Hr((R1,Yd)=>{"use strict";function us(n,e){return\`\${n}:\${e}\`}function Gs(n){let e=n.end.x-n.start.x,t=n.end.z-n.start.z,i=Math.hypot(e,t);if(!Number.isFinite(i)||i<=0)throw new TypeError(\`Wall \${n.id??"<unknown>"} must have a positive length.\`);return{length:i,direction:{x:e/i,z:t/i},perpendicular:{x:-t/i,z:e/i}}}function au(n,e,t){let i=Gs(n),s=e.rotation.y*Math.PI/180,r={x:Math.cos(s),z:-Math.sin(s)},o={x:e.position.x+r.x*e.size.width/2,z:e.position.z+r.z*e.size.width/2},a=(o.x-n.start.x)*i.direction.x+(o.z-n.start.z)*i.direction.z,c=t==="door"?0:e.position.y-n.baseY;return{id:e.id,kind:t,wallId:n.id,centerOffset:a,minimumOffset:a-e.size.width/2,maximumOffset:a+e.size.width/2,minimumY:c,maximumY:c+e.size.height,width:e.size.width,height:e.size.height}}function ax(n,e){return[...n.doors.filter(t=>t.wallId===e.id).map(t=>au(e,t,"door")),...n.windows.filter(t=>t.wallId===e.id).map(t=>au(e,t,"window"))].sort((t,i)=>t.minimumOffset-i.minimumOffset||t.minimumY-i.minimumY||t.id.localeCompare(i.id))}function cx(n,e,t){let i=Math.max(0,Math.min(n.minimumOffset,e)),s=Math.max(0,Math.min(n.maximumOffset,e)),r=Math.max(0,Math.min(n.minimumY,t)),o=Math.max(0,Math.min(n.maximumY,t));return s-i<.001||o-r<.001?null:{minimumOffset:i,maximumOffset:s,minimumY:r,maximumY:o}}function lx(n){let e=[...n].sort((i,s)=>i-s),t=[];for(let i of e)(t.length===0||Math.abs(i-t[t.length-1])>=.001)&&t.push(i);return t}function ux(n,e){let{length:t}=Gs(n),i=e.map(o=>cx(o,t,n.height)).filter(Boolean);if(i.length===0)return[{minimumOffset:0,maximumOffset:t,minimumY:0,maximumY:n.height,width:t,height:n.height,centerOffset:t/2,centerY:n.height/2}];let s=lx(new Set([0,t,...i.flatMap(o=>[o.minimumOffset,o.maximumOffset])])),r=[];for(let o=1;o<s.length;o+=1){let a=s[o-1],c=s[o];if(c-a<.001)continue;let l=(a+c)/2,u=i.filter(f=>l>=f.minimumOffset-.001&&l<=f.maximumOffset+.001).map(f=>[f.minimumY,f.maximumY]).sort((f,p)=>f[0]-p[0]),h=[];for(let f of u){let p=h[h.length-1];p&&f[0]<=p[1]+.001?p[1]=Math.max(p[1],f[1]):h.push([...f])}let d=0;for(let f of h)f[0]-d>=.001&&r.push(Vr(a,c,d,f[0])),d=Math.max(d,f[1]);n.height-d>=.001&&r.push(Vr(a,c,d,n.height))}return r}function Vr(n,e,t,i){return{minimumOffset:n,maximumOffset:e,minimumY:t,maximumY:i,width:e-n,height:i-t,centerOffset:(n+e)/2,centerY:(t+i)/2}}function hx(n,e,t=1.38,i=.04){let s=n.minimumY<=.002,r=n.maximumY<e-.002,o=null;s&&r?o=n.maximumY:s&&(o=Math.min(n.maximumY,Math.max(t,i)));let a=[],c=[];return o!==null&&o-n.minimumY>=i?(a.push(Vr(n.minimumOffset,n.maximumOffset,n.minimumY,o)),n.maximumY-o>=i&&c.push(Vr(n.minimumOffset,n.maximumOffset,o,n.maximumY))):c.push(n),{visiblePanels:a,lightOccluderPanels:c}}function dx(n,e,t=.01){let i=Math.min(n.maximumOffset,e.maximumOffset)-Math.max(n.minimumOffset,e.minimumOffset),s=Math.min(n.maximumY,e.maximumY)-Math.max(n.minimumY,e.minimumY);return i>t&&s>t}function fx(n,e=.11){let t=n.flatMap((f,p)=>{let x=Gs(f);return[{wall:f,wallIndex:p,end:"start",point:f.start,inward:x.direction},{wall:f,wallIndex:p,end:"end",point:f.end,inward:{x:-x.direction.x,z:-x.direction.z}}]}),i=t.map((f,p)=>p),s=f=>{let p=f;for(;i[p]!==p;)p=i[p];return p},r=(f,p)=>{let x=s(f),m=s(p);x!==m&&(i[m]=x)},o=e*e;for(let f=0;f<t.length;f+=1)for(let p=f+1;p<t.length;p+=1){let x=t[f],m=t[p];if(x.wall.id===m.wall.id||Math.abs(x.wall.baseY-m.wall.baseY)>e)continue;let g=x.point.x-m.point.x,S=x.point.z-m.point.z;g*g+S*S<=o&&r(f,p)}let a=new Map;t.forEach((f,p)=>{let x=s(p);a.has(x)||a.set(x,[]),a.get(x).push(p)});let c=new Set,l=new Set,u=new Set,h=new Map,d=[];for(let f of a.values()){if(new Set(f.map(E=>t[E].wall.id)).size<2||(f.forEach(E=>c.add(us(t[E].wall.id,t[E].end))),f.length!==2))continue;let p=t[f[0]],x=t[f[1]],m=p.inward.x*x.inward.x+p.inward.z*x.inward.z,g=p.inward.x*x.inward.z-p.inward.z*x.inward.x,S={x:(p.point.x+x.point.x)/2,z:(p.point.z+x.point.z)/2};if(Math.abs(m)<=.2&&Math.abs(g)>=.96){g<0&&([p,x]=[x,p]);let E=Math.max(p.wall.thickness,x.wall.thickness),v=E/2,w={x:S.x+(p.inward.x+x.inward.x)*v,z:S.z+(p.inward.z+x.inward.z)*v},b={center:S,arcCenter:w,first:p,second:x,thickness:E,elevation:(p.wall.baseY+x.wall.baseY)/2,height:Math.min(p.wall.height,x.wall.height)};d.push(b),l.add(us(p.wall.id,p.end)),l.add(us(x.wall.id,x.end))}else if(m<=-.98&&Math.abs(g)<=.08)for(let E of[p,x]){let v=us(E.wall.id,E.end),w={x:-E.inward.x,z:-E.inward.z};u.add(v),h.set(v,(S.x-E.point.x)*w.x+(S.z-E.point.z)*w.z)}}return t.forEach(f=>{let p=us(f.wall.id,f.end);if(!c.has(p))for(let x of n){if(x.id===f.wall.id||Math.abs(x.baseY-f.wall.baseY)>e)continue;let m=Gs(x),g=f.point.x-x.start.x,S=f.point.z-x.start.z,E=(g*m.direction.x+S*m.direction.z)/m.length;if(E<=.03||E>=.97)continue;let v={x:x.start.x+m.direction.x*m.length*E,z:x.start.z+m.direction.z*m.length*E},w=f.point.x-v.x,b=f.point.z-v.z;if(w*w+b*b<=o){c.add(p);break}}}),d.sort((f,p)=>f.center.x-p.center.x||f.center.z-p.center.z),{joinedEndpoints:c,roundedEndpoints:l,continuationEndpoints:u,continuationAlignmentOffsets:h,roundedCorners:d}}function px(n,e=0,t=16){let i=Math.max(Math.round(t),4),s=Math.max(n.thickness+Math.max(e,0),.001),r=[{...n.arcCenter}];for(let o=i;o>=0;o-=1){let a=o/i*Math.PI/2;r.push({x:n.arcCenter.x-n.first.inward.x*Math.sin(a)*s-n.second.inward.x*Math.cos(a)*s,z:n.arcCenter.z-n.first.inward.z*Math.sin(a)*s-n.second.inward.z*Math.cos(a)*s})}return r}function mx(n,e,t){let i=Gs(e),s=Math.abs(n.minimumOffset)<=.003,r=Math.abs(n.maximumOffset-i.length)<=.003,o=us(e.id,"start"),a=us(e.id,"end"),c=e.thickness/2,l=n.minimumOffset,u=n.maximumOffset;if(s&&(t.roundedEndpoints.has(o)?l+=c:t.continuationEndpoints.has(o)?l-=t.continuationAlignmentOffsets?.get(o)??0:t.joinedEndpoints.has(o)&&(l-=c)),r&&(t.roundedEndpoints.has(a)?u-=c:t.continuationEndpoints.has(a)?u+=t.continuationAlignmentOffsets?.get(a)??0:t.joinedEndpoints.has(a)&&(u+=c)),u-l<.012){let d=(n.minimumOffset+n.maximumOffset)/2;l=d-.006,u=d+.006}return Vr(l,u,n.minimumY,n.maximumY)}Yd.exports={DOLLHOUSE_WALL_HEIGHT:1.38,MINIMUM_PANEL_SIZE:.001,OPENING_OVERLAP_EPSILON:.01,PRESENTATION_MINIMUM_PANEL_SIZE:.04,WALL_CORNER_SEGMENTS:16,WALL_JOIN_TOLERANCE:.11,buildWallPanels:ux,collectWallOpenings:ax,contactOpening:au,openingsOverlap:dx,joinedWallPanel:mx,resolveWallPresentation:hx,resolveWallJoinTopology:fx,roundedCornerFootprint:px,wallFrame:Gs}});var of=Hr((I1,rf)=>{"use strict";var{contactOpening:gx,openingsOverlap:xx,wallFrame:vx}=cu(),uu=Object.freeze([1,2]),_x=2,yx=new Set(["light","furniture","decor"]),va=new Set(["box","cylinder","ellipsoid"]),_a=.1,ya=Object.freeze({maxJsonBytes:2*1024*1024,maxFloors:16,maxRooms:256,maxWalls:4096,maxDoors:1024,maxWindows:2048,maxObjects:8192,maxPolygonPointsPerRoom:1024}),Ws=class extends Error{constructor(e,t){super(e,t),this.name="DashboardSceneError",this.code="invalid_dashboard_scene"}};function ut(n,e){throw new Ws(\`\${n}: \${e}\`)}function Ni(n){return n!==null&&typeof n=="object"&&!Array.isArray(n)}function zt(n,e){Ni(n)||ut(e,"must be an object.")}function hs(n,e){Array.isArray(n)||ut(e,"must be an array.")}function St(n,e){(typeof n!="string"||n.trim().length===0)&&ut(e,"must be a non-empty string.")}function Nt(n,e,{positive:t=!1}={}){Number.isFinite(n)||ut(e,"must be a finite number."),t&&n<=0&&ut(e,"must be greater than zero.")}function $d(n,e,{nonNegative:t=!1}={}){Nt(n,e),Number.isInteger(n)||ut(e,"must be an integer."),t&&n<0&&ut(e,"must be zero or greater.")}function lu(n,e){Nt(n,e),(n<0||n>1)&&ut(e,"must be between zero and one.")}function Jd(n){return typeof TextEncoder=="function"?new TextEncoder().encode(n).byteLength:typeof Buffer<"u"?Buffer.byteLength(n,"utf8"):unescape(encodeURIComponent(n)).length}function bx(n){let e;try{e=JSON.stringify(n)}catch(t){throw new Ws("scene: must be JSON serializable.",{cause:t})}return typeof e!="string"&&ut("scene","must be a JSON object."),Jd(e)}function ds(n,e,t){e>t&&ut(n,\`contains \${e} entries; maximum is \${t}.\`)}function hu(n,e){zt(n,e),Nt(n.x,\`\${e}.x\`),Nt(n.z,\`\${e}.z\`)}function Qd(n,e){zt(n,e),Nt(n.x,\`\${e}.x\`),Nt(n.y,\`\${e}.y\`),Nt(n.z,\`\${e}.z\`)}function ef(n,e){zt(n,e),Nt(n.y,\`\${e}.y\`)}function du(n,e){zt(n,e),Nt(n.width,\`\${e}.width\`,{positive:!0}),Nt(n.depth,\`\${e}.depth\`,{positive:!0}),Nt(n.height,\`\${e}.height\`,{positive:!0})}function tf(n,e){if(typeof n>"u")return;zt(n,e),St(n.provider,\`\${e}.provider\`),St(n.capability,\`\${e}.capability\`);let t=typeof n.deviceId<"u",i=typeof n.slot<"u";t===i&&ut(e,"must contain exactly one of deviceId or slot."),t&&St(n.deviceId,\`\${e}.deviceId\`),i&&St(n.slot,\`\${e}.slot\`)}function ba(n,e){typeof n<"u"&&St(n,e)}function Mx(n,e){if(!(typeof n>"u")){zt(n,e),zt(n.materialSlots,\`\${e}.materialSlots\`);for(let[t,i]of Object.entries(n.materialSlots)){St(t,\`\${e}.materialSlots key\`);let s=\`\${e}.materialSlots.\${t}\`;Oi(i,s)}}}function Oi(n,e){typeof n>"u"||(zt(n,e),St(n.materialKey,\`\${e}.materialKey\`),(typeof n.baseColor!="string"||!/^#[0-9A-Fa-f]{6}$/.test(n.baseColor))&&ut(\`\${e}.baseColor\`,"must be an RGB hex color."),lu(n.roughness,\`\${e}.roughness\`),lu(n.metallic,\`\${e}.metallic\`),lu(n.opacity,\`\${e}.opacity\`),typeof n.pattern<"u"&&(zt(n.pattern,\`\${e}.pattern\`),St(n.pattern.kind,\`\${e}.pattern.kind\`),Nt(n.pattern.elementSize,\`\${e}.pattern.elementSize\`,{positive:!0}),Nt(n.pattern.lineWidth,\`\${e}.pattern.lineWidth\`,{positive:!0}),St(n.pattern.orientation,\`\${e}.pattern.orientation\`)))}function Sx(n,e){typeof n>"u"||(zt(n,e),Oi(n.body,\`\${e}.body\`),Oi(n.positiveSide,\`\${e}.positiveSide\`),Oi(n.negativeSide,\`\${e}.negativeSide\`))}function Ex(n,e){typeof n>"u"||(zt(n,e),Oi(n.panel,\`\${e}.panel\`),Oi(n.frame,\`\${e}.frame\`),Oi(n.reveal,\`\${e}.reveal\`))}function wx(n,e){if(!(typeof n>"u")){zt(n,e);for(let[t,i]of Object.entries(n))St(t,\`\${e} key\`),typeof i!="string"&&typeof i!="boolean"&&!Number.isFinite(i)&&ut(\`\${e}.\${t}\`,"must be a finite number, string, or boolean.")}}function Gr(n,e,t){St(n,e),t.has(n)&&ut(e,\`duplicate scene id "\${n}".\`),t.add(n)}function Tx(n){return Ni(n)?{...n,elevation:n.elevation??0,floorThickness:n.floorThickness??.2,appearance:n.appearance??"floor"}:n}function Ax(n){return Ni(n)?{...n,baseY:n.baseY??0,appearance:n.appearance??"wall"}:n}function nf(n){return n==null?{y:0}:Ni(n)?{...n,y:n.y??0}:n}function jd(n,e){return Ni(n)?{...n,rotation:nf(n.rotation),openAngle:n.openAngle??70,appearance:n.appearance??e}:n}function Cx(n){if(!Ni(n))return n;let e=n.appearance==="floor-lamp"?"floorLamp":n.appearance==="table-lamp"?"tableLamp":"floorLamp";return{...n,rotation:nf(n.rotation),visualType:n.visualType??(n.kind==="light"?e:void 0),appearance:n.appearance??(n.assetKey?{materialSlots:{}}:n.kind)}}function Rx(n,e,t){if(!Ni(n))return n;let i={...n,rooms:Array.isArray(n.rooms)?n.rooms.map(Tx):n.rooms??[],walls:Array.isArray(n.walls)?n.walls.map(Ax):n.walls??[],doors:Array.isArray(n.doors)?n.doors.map(s=>jd(s,"door")):n.doors??[],windows:Array.isArray(n.windows)?n.windows.map(s=>jd(s,"window")):n.windows??[],objects:Array.isArray(n.objects)?n.objects.map(Cx):n.objects??[]};return e!==1?i:{...i,level:0,sortOrder:t,elevation:0}}function Ix(n,e){let t=n.sortOrder-e.sortOrder;if(t!==0)return t;let i=n.level-e.level;return i!==0?i:n.id<e.id?-1:n.id>e.id?1:0}function Px(n,e,t,i){zt(n,e),Gr(n.id,\`\${e}.id\`,t),St(n.name,\`\${e}.name\`),hs(n.polygon,\`\${e}.polygon\`),n.polygon.length<3&&ut(\`\${e}.polygon\`,"must contain at least three points."),ds(\`\${e}.polygon\`,n.polygon.length,i.maxPolygonPointsPerRoom),n.polygon.forEach((s,r)=>hu(s,\`\${e}.polygon[\${r}]\`)),Nt(n.elevation,\`\${e}.elevation\`),Nt(n.floorThickness,\`\${e}.floorThickness\`,{positive:!0}),ba(n.appearance,\`\${e}.appearance\`),Oi(n.material,\`\${e}.material\`)}function Dx(n,e,t){zt(n,e),Gr(n.id,\`\${e}.id\`,t),hu(n.start,\`\${e}.start\`),hu(n.end,\`\${e}.end\`),n.start.x===n.end.x&&n.start.z===n.end.z&&ut(e,"start and end must describe a wall with non-zero length."),Nt(n.baseY,\`\${e}.baseY\`),Nt(n.height,\`\${e}.height\`,{positive:!0}),Nt(n.thickness,\`\${e}.thickness\`,{positive:!0}),ba(n.appearance,\`\${e}.appearance\`),Sx(n.materials,\`\${e}.materials\`)}function Zd(n,e,t){zt(n,e),Gr(n.id,\`\${e}.id\`,t),typeof n.wallId<"u"&&St(n.wallId,\`\${e}.wallId\`),Qd(n.position,\`\${e}.position\`),ef(n.rotation,\`\${e}.rotation\`),du(n.size,\`\${e}.size\`),Nt(n.openAngle,\`\${e}.openAngle\`),ba(n.appearance,\`\${e}.appearance\`),Ex(n.materials,\`\${e}.materials\`),tf(n.binding,\`\${e}.binding\`)}function Kd(n,e,t,i){let s=gx(e,n,t),{length:r}=vx(e);return(s.minimumOffset<-_a||s.maximumOffset>r+_a)&&ut(i,"opening must lie within its referenced wall."),t==="window"&&s.minimumY<-_a&&ut(\`\${i}.position.y\`,"window sill must not be below its referenced wall."),s.maximumY>e.height+_a&&ut(i,"opening height must lie within its referenced wall."),s}function Lx(n){for(let e=0;e<n.length;e+=1)for(let t=e+1;t<n.length;t+=1)xx(n[e].opening,n[t].opening)&&ut(n[t].path,"opening overlaps another opening in the same wall.")}function Ox(n,e,t){zt(n,e),Gr(n.id,\`\${e}.id\`,t),St(n.kind,\`\${e}.kind\`),yx.has(n.kind)||ut(\`\${e}.kind\`,"must be light, furniture, or decor."),Qd(n.position,\`\${e}.position\`),ef(n.rotation,\`\${e}.rotation\`),du(n.size,\`\${e}.size\`),tf(n.binding,\`\${e}.binding\`),typeof n.visualType<"u"&&St(n.visualType,\`\${e}.visualType\`),wx(n.parameters,\`\${e}.parameters\`),typeof n.assetKey<"u"?(St(n.assetKey,\`\${e}.assetKey\`),n.kind!=="furniture"&&n.kind!=="decor"&&ut(\`\${e}.kind\`,"an assetKey is only valid for furniture or decor."),typeof n.variantKey<"u"?St(n.variantKey,\`\${e}.variantKey\`):ut(\`\${e}.variantKey\`,"must be a non-empty string."),du(n.dimensions,\`\${e}.dimensions\`),Mx(n.appearance,\`\${e}.appearance\`)):ba(n.appearance,\`\${e}.appearance\`),n.kind!=="light"&&typeof n.assetKey>"u"?(St(n.shape,\`\${e}.shape\`),va.has(n.shape)||ut(\`\${e}.shape\`,\`must be one of \${[...va].join(", ")}.\`)):typeof n.shape<"u"&&!va.has(n.shape)&&ut(\`\${e}.shape\`,\`must be one of \${[...va].join(", ")} when provided.\`)}function Nx(n){zt(n,"metadata"),typeof n.generatedAt<"u"&&St(n.generatedAt,"metadata.generatedAt"),typeof n.generator<"u"&&St(n.generator,"metadata.generator"),typeof n.revision<"u"&&St(n.revision,"metadata.revision"),typeof n.modelNorthDegrees<"u"&&Nt(n.modelNorthDegrees,"metadata.modelNorthDegrees")}function sf(n,{limits:e=ya}={}){let t={...ya,...e};zt(n,"scene");let i=bx(n);i>t.maxJsonBytes&&ut("scene",\`JSON size is \${i} bytes; maximum is \${t.maxJsonBytes} bytes.\`),uu.includes(n.schemaVersion)||ut("schemaVersion",\`unsupported version \${String(n.schemaVersion)}; expected one of \${uu.join(", ")}.\`),St(n.sceneId,"sceneId"),St(n.name,"name"),hs(n.floors,"floors"),n.floors.length===0&&ut("floors","must contain at least one floor."),ds("floors",n.floors.length,t.maxFloors),n.schemaVersion===2&&(St(n.defaultFloorId,"defaultFloorId"),typeof n.activeFloorId<"u"&&ut("activeFloorId","must not be stored in a Dashboard Scene v2."));let s={...n,metadata:n.metadata??{},defaultFloorId:n.schemaVersion===1?n.floors[0]?.id:n.defaultFloorId,floors:Array.isArray(n.floors)?n.floors.map((l,u)=>Rx(l,n.schemaVersion,u)):n.floors};Nx(s.metadata);let r={rooms:0,walls:0,doors:0,windows:0,objects:0};for(let l of s.floors)if(Ni(l))for(let u of Object.keys(r))Array.isArray(l[u])&&(r[u]+=l[u].length);ds("rooms",r.rooms,t.maxRooms),ds("walls",r.walls,t.maxWalls),ds("doors",r.doors,t.maxDoors),ds("windows",r.windows,t.maxWindows),ds("objects",r.objects,t.maxObjects);let o=new Set([s.sceneId]),a=new Set;s.floors.forEach((l,u)=>{let h=\`floors[\${u}]\`;zt(l,h),Gr(l.id,\`\${h}.id\`,o),a.add(l.id),St(l.name,\`\${h}.name\`),$d(l.level,\`\${h}.level\`),$d(l.sortOrder,\`\${h}.sortOrder\`,{nonNegative:!0}),Nt(l.elevation,\`\${h}.elevation\`),hs(l.rooms,\`\${h}.rooms\`),hs(l.walls,\`\${h}.walls\`),hs(l.doors,\`\${h}.doors\`),hs(l.windows,\`\${h}.windows\`),hs(l.objects,\`\${h}.objects\`),l.rooms.forEach((x,m)=>Px(x,\`\${h}.rooms[\${m}]\`,o,t)),l.walls.forEach((x,m)=>Dx(x,\`\${h}.walls[\${m}]\`,o)),l.doors.forEach((x,m)=>Zd(x,\`\${h}.doors[\${m}]\`,o)),l.windows.forEach((x,m)=>Zd(x,\`\${h}.windows[\${m}]\`,o)),l.objects.forEach((x,m)=>Ox(x,\`\${h}.objects[\${m}]\`,o));let d=new Map(l.walls.map(x=>[x.id,x])),f=new Set(d.keys()),p=new Map;l.doors.forEach((x,m)=>{let g=\`\${h}.doors[\${m}]\`;if(x.wallId&&!f.has(x.wallId)&&ut(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let S=Kd(x,d.get(x.wallId),"door",g),E=p.get(x.wallId)??[];E.push({opening:S,path:g}),p.set(x.wallId,E)}}),l.windows.forEach((x,m)=>{let g=\`\${h}.windows[\${m}]\`;if(x.wallId&&!f.has(x.wallId)&&ut(\`\${g}.wallId\`,\`"\${x.wallId}" does not reference a wall on this floor.\`),x.wallId){let S=Kd(x,d.get(x.wallId),"window",g),E=p.get(x.wallId)??[];E.push({opening:S,path:g}),p.set(x.wallId,E)}}),p.forEach(Lx)}),a.has(s.defaultFloorId)||ut("defaultFloorId",\`"\${s.defaultFloorId}" does not reference a floor.\`);let c=s.schemaVersion===2?[...s.floors].sort(Ix):s.floors;return{...s,floors:c,activeFloorId:s.defaultFloorId}}function Fx(n,e){typeof n!="string"&&ut("scene","JSON source must be a string.");let t=e?.limits?.maxJsonBytes??ya.maxJsonBytes;Jd(n)>t&&ut("scene",\`JSON size exceeds the maximum of \${t} bytes.\`);let i;try{i=JSON.parse(n)}catch(s){throw new Ws("Scene JSON could not be parsed.",{cause:s})}return sf(i,e)}rf.exports={DASHBOARD_SCENE_LIMITS:ya,DashboardSceneError:Ws,SUPPORTED_SCHEMA_VERSION:_x,SUPPORTED_SCHEMA_VERSIONS:uu,parseDashboardScene:Fx,validateDashboardScene:sf}});var fu=Hr((P1,cf)=>{"use strict";var af=of(),{DashboardSceneError:Ma,parseDashboardScene:Ux}=af;async function Bx(n,{fetchImpl:e=globalThis.fetch,signal:t}={}){if(typeof e!="function")throw new Ma("Scene loading requires fetch support.");let i;try{i=await e(n,{cache:"no-store",...t?{signal:t}:{}})}catch(r){throw new Ma(\`Scene could not be fetched from \${n}.\`,{cause:r})}if(!i?.ok)throw new Ma(\`Scene request failed with HTTP \${i?.status??"unknown"} for \${n}.\`);let s;try{s=await i.text()}catch(r){throw new Ma(\`Scene response from \${n} could not be read.\`,{cause:r})}return Ux(s)}cf.exports={...af,loadDashboardScene:Bx}});var os=Hr((kR,P0)=>{"use strict";var A0=Object.freeze({AVAILABLE:"available",UNAVAILABLE:"unavailable",MISSING:"missing"}),Nw=Object.freeze({SET_POWER:"setPower",TOGGLE_POWER:"togglePower",SET_BRIGHTNESS:"setBrightness",SET_COLOR:"setColor",SET_COLOR_TEMPERATURE:"setColorTemperature",SET_COVER_POSITION:"setCoverPosition",OPEN_COVER:"openCover",CLOSE_COVER:"closeCover",STOP_COVER:"stopCover",SET_TARGET_TEMPERATURE:"setTargetTemperature",SET_THERMOSTAT_MODE:"setThermostatMode",SET_FAN_SPEED:"setFanSpeed",SET_FAN_MODE:"setFanMode",SET_TARGET_HUMIDITY:"setTargetHumidity",START_CLEANING:"startCleaning",PAUSE_CLEANING:"pauseCleaning",STOP_CLEANING:"stopCleaning",RETURN_TO_BASE:"returnToBase",LOCK:"lock",UNLOCK:"unlock"});function Cr(n){return n?.availability===A0.AVAILABLE}function Fw(n){return!!(n?.power&&Object.prototype.hasOwnProperty.call(n.power,"isOn"))}function Uw(n){return Cr(n)&&typeof n?.power?.isOn=="boolean"}function Bw(n){return Cr(n)?n?.contact?.state??"unknown":"unknown"}function C0(n){return!!n?.cover}function kw(n){return Cr(n)&&C0(n)}function R0(n){return!!n?.climate}function zw(n){return Cr(n)&&R0(n)}function I0(n){return!!n?.cleaning}function Hw(n){return Cr(n)&&I0(n)}P0.exports={DEVICE_AVAILABILITY:A0,DEVICE_COMMAND:Nw,contactState:Bw,hasCleaningState:I0,hasClimateState:R0,hasCoverState:C0,hasPowerState:Fw,isAvailable:Cr,isUsableCleaningState:Hw,isUsableClimateState:zw,isUsableCoverState:kw,isUsablePowerState:Uw}});var eg=Hr((eI,Q0)=>{"use strict";function Lr(n,e,t){return Math.min(Math.max(n,e),t)}function as(n,e,t){return n+(e-n)*Lr(t,0,1)}function Bs(n,e,t){return n.map((i,s)=>as(i,e[s],t))}function Hl(n,e,t){let i=Lr((t-n)/(e-n),0,1);return i*i*(3-2*i)}function ks(n){let e=n%360;return e<0?e+360:e}function ET(n){let e=Math.PI*2,t=n%e;return t>Math.PI&&(t-=e),t<-Math.PI&&(t+=e),t}function Z0(n){let e=n instanceof Date?n:new Date(n??Date.now());return Number.isFinite(e.getTime())?e:new Date}function K0(n){if(n?.elevationDegrees===null||n?.elevationDegrees===void 0||n?.azimuthDegrees===null||n?.azimuthDegrees===void 0||n?.elevationDegrees===""||n?.azimuthDegrees==="")return null;let e=Number(n?.elevationDegrees),t=Number(n?.azimuthDegrees);return!Number.isFinite(e)||!Number.isFinite(t)||e<-90||e>90?null:Object.freeze({elevationDegrees:e,azimuthDegrees:ks(t),source:typeof n?.source=="string"&&n.source?n.source:"host"})}function wT({at:n=new Date,latitude:e,longitude:t}={}){if(e==null||e===""||t===null||t===void 0||t==="")return null;let i=Number(e),s=Number(t);if(!Number.isFinite(i)||!Number.isFinite(s)||i<-90||i>90||s<-180||s>180)return null;let a=Z0(n).getTime()/864e5+24405875e-1-2451545,c=ks(280.46+.9856474*a),l=ks(357.528+.9856003*a)*Math.PI/180,u=(c+1.915*Math.sin(l)+.02*Math.sin(2*l))*Math.PI/180,h=(23.439-4e-7*a)*Math.PI/180,d=Math.atan2(Math.cos(h)*Math.sin(u),Math.cos(u)),f=Math.asin(Math.sin(h)*Math.sin(u)),p=a/36525,m=(ks(280.46061837+360.98564736629*a+387933e-9*p*p-p*p*p/3871e4)+s)*Math.PI/180,g=ET(m-d),S=i*Math.PI/180,E=-Math.cos(f)*Math.sin(g),v=Math.cos(S)*Math.sin(f)-Math.sin(S)*Math.cos(f)*Math.cos(g),w=Math.sin(S)*Math.sin(f)+Math.cos(S)*Math.cos(f)*Math.cos(g),b=Math.hypot(E,w,v)||1,A={x:E/b,y:w/b,z:v/b};return Object.freeze({elevationDegrees:Math.asin(Lr(A.y,-1,1))*180/Math.PI,azimuthDegrees:ks(Math.atan2(A.x,A.z)*180/Math.PI),source:"calculated"})}function J0(n=new Date){let e=Z0(n),t=e.getHours()+e.getMinutes()/60,i=Lr((t-5.75)/(21.25-5.75),0,1),s=Math.max(Math.sin(i*Math.PI),0),r=t>5.75&&t<21.25;return Object.freeze({elevationDegrees:r?as(-.833,72,Math.pow(s,.92)):-12,azimuthDegrees:as(90,270,i),source:"local-clock"})}function TT(n,e,t){return n==="day"?{elevationDegrees:62,azimuthDegrees:180,source:"manual-day"}:n==="evening"?{elevationDegrees:5,azimuthDegrees:258,source:"manual-evening"}:n==="night"?{elevationDegrees:-18,azimuthDegrees:0,source:"manual-night"}:K0(t)??J0(e)}function AT(n,e){let t=n.elevationDegrees*Math.PI/180,i=n.azimuthDegrees*Math.PI/180,s=Math.cos(t)*Math.sin(i),r=Math.sin(t),o=Math.cos(t)*Math.cos(i),a=ks(Number(e)||0)*Math.PI/180,c={x:Math.cos(a),z:-Math.sin(a)},l={x:-Math.sin(a),z:-Math.cos(a)},u={x:c.x*s+l.x*o,y:r,z:c.z*s+l.z*o},h=Math.hypot(u.x,u.y,u.z)||1;return Object.freeze({x:u.x/h,y:u.y/h,z:u.z/h})}function bd(n){return Math.round(n*1e4)/1e4}function CT({at:n=new Date,solarPosition:e=null,modelNorthDegrees:t=0,timeOfDay:i="auto"}={}){let s=TT(i,n,e),r=s.elevationDegrees,o=.08+.92*Hl(-6,12,r),a=Lr((o-.08)/.92,0,1),c=Hl(-.833,4,r),l=Math.max(Math.sin(Math.max(r,0)*Math.PI/180),0),u=c*(1-Hl(5,32,r)),h=c*as(.58,1,Math.pow(l,.34)),d=[1,.965,.89],f=[1,.5,.19],p=[.48,.58,.78],x=[.69,.8,.91],m=[.28,.36,.54],g=[.105,.118,.155],S=[.165,.18,.205],E=[.335,.385,.455],v=[.5,.49,.455],w=[.82,.87,.915],b=[.72,.785,.825],A=Bs(p,d,a),_=r<=-6?"night":r<12||u>=.12?"evening":"day",T=AT(s,t),I=ks(Number(t)||0),P=Lr(T.y,0,1),H=Hl(.04,.88,P)*a,F=Bs(g,E,a),L=Bs(S,v,a);return Object.freeze({source:s.source,elevationDegrees:r,azimuthDegrees:s.azimuthDegrees,modelNorthDegrees:I,resolvedTimeOfDay:_,daylightLevel:o,warmth:u,sunPositionDirection:T,keyRGB:Object.freeze(Bs(A,f,u*.92)),fillRGB:Object.freeze(Bs(m,x,a)),backdropTopRGB:Object.freeze(Bs(F,w,H)),backdropBottomRGB:Object.freeze(Bs(L,b,H)),ambientIntensityFactor:as(.28,1,a),keyIntensityFactor:as(.24,1,h),fillIntensityFactor:as(.22,1,a),toneMappingExposure:as(1,1.05,a),signature:[s.source,bd(r),bd(s.azimuthDegrees),bd(I),_].join(":")})}Q0.exports={FALLBACK_SUNRISE_HOUR:5.75,FALLBACK_SUNSET_HOUR:21.25,calculateDashboardSolarPosition:wT,fallbackDashboardSolarPosition:J0,normalizeDashboardSolarPosition:K0,resolveDashboardSolarState:CT}});var xa=class{constructor(e){this.controller=new AbortController,this.signal=this.controller.signal,this.cleanups=[],this.disposed=!1;let t=()=>this.dispose();e?.aborted?this.dispose():e&&(e.addEventListener("abort",t,{once:!0}),this.defer(()=>e.removeEventListener("abort",t)))}defer(e){typeof e=="function"&&(this.disposed?e():this.cleanups.push(e))}check(){this.signal.throwIfAborted()}async wait(e){this.disposed&&(Promise.resolve(e).catch(()=>{}),this.check());let t;try{let i=await Promise.race([e,new Promise((s,r)=>{t=()=>r(this.signal.reason),this.signal.addEventListener("abort",t,{once:!0})})]);return this.check(),i}finally{this.signal.removeEventListener("abort",t)}}dispose(){if(!this.disposed){this.disposed=!0,this.controller.abort(new DOMException("Dashboard viewer was destroyed.","AbortError"));for(let e of this.cleanups.reverse())try{e()}catch(t){console.warn("Dashboard cleanup failed.",t)}this.cleanups.length=0}}};var lf=zn(fu());function uf(n){let e=n?.scene,t=e&&typeof e=="object"&&!Array.isArray(e)?(({activeFloorId:i,...s})=>s)(e):e;return{...n,scene:lf.default.validateDashboardScene(t)}}var hf=\`
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

      :where(.mikonus-renderer-ui) .device-affordance-provider-icon {
        width: 23px;
        height: 23px;
        color: currentColor;
      }

      :where(.mikonus-renderer-ui) .device-affordance-button.has-provider-icon > svg,
      :where(.mikonus-renderer-ui) .device-affordance-button.has-provider-icon .device-affordance-device-icon {
        display: none;
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

      :where(.mikonus-renderer-ui) .device-details-title-icon,
      :where(.mikonus-renderer-ui) .device-details-title-icon > * {
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
      }

      :where(.mikonus-renderer-ui) .device-details-value-label {
        display: inline-flex;
        min-width: 0;
        align-items: center;
        gap: 8px;
      }

      :where(.mikonus-renderer-ui) .device-details-value-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
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
\`,pu=new WeakMap;function mu(n=document){let e=pu.get(n);if(!e){let s=(n.ownerDocument??n).createElement("style");s.dataset.mikonusRendererStyles="",s.textContent=hf,(n.head??n).appendChild(s),e={element:s,users:0},pu.set(n,e)}e.users+=1;let t=!1;return()=>{t||(t=!0,--e.users===0&&(e.element.remove(),pu.delete(n)))}}function gu(n,e,t){if(!n)return;let i=n.classList.contains(e);i||n.classList.add(e),t.push(()=>{i||n.classList.remove(e)})}function xu({container:n,sceneShell:e=n,statusHeader:t=null,summaryElement:i=null}){let s=e.getRootNode(),o=[mu(s)],a=e.ownerDocument,c=a.defaultView;gu(e,"mikonus-renderer-shell",o),gu(t,"mikonus-renderer-status-header",o),gu(i,"mikonus-renderer-summary",o);for(let d of new Set([e,n])){let f=d.classList.contains("mikonus-renderer-ui");f||d.classList.add("mikonus-renderer-ui");let p=d.style.position;c.getComputedStyle(d).position==="static"&&(d.style.position="relative");let x=d.style.isolation;d.style.isolation="isolate",o.push(()=>{f||d.classList.remove("mikonus-renderer-ui"),d.style.position=p,d.style.isolation=x})}let l=a.createElement("div");l.className="mikonus-marker-host",n.appendChild(l);let u=a.createElement("div");u.className="mikonus-popup-host",e.appendChild(u);let h=!1;return{markerHost:l,popupHost:u,setEnvironment(d){for(let f of new Set([e,n]))f.dataset.dashboardTheme=d.resolvedTheme},dispose(){if(!h){h=!0,l.remove(),u.remove();for(let d of o.reverse())d()}}}}var ji={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Zi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Hf=0,sh=1,Vf=2;var Rs=1,Gf=2,gr=3,pn=0,dn=1,Tt=2,ni=0,_s=1,ii=2,rh=3,oh=4,Wf=5;var Gi=100,Xf=101,qf=102,Yf=103,$f=104,jf=200,Zf=201,Kf=202,Jf=203,qa=204,Ya=205,Qf=206,ep=207,tp=208,np=209,ip=210,sp=211,rp=212,op=213,ap=214,$a=0,ja=1,Za=2,ys=3,Ka=4,Ja=5,Qa=6,ec=7,ah=0,cp=1,lp=2,Rn=0,ch=1,lh=2,uh=3,xr=4,hh=5,dh=6,fh=7;var ph=300,Ki=301,Is=302,Rc=303,Ic=304,To=306,bs=1e3,Qn=1001,tc=1002,Kt=1003,up=1004;var Ao=1005;var Pt=1006,Pc=1007;var si=1008;var on=1009,mh=1010,gh=1011,vr=1012,Dc=1013,qn=1014,Yn=1015,ri=1016,Lc=1017,Oc=1018,_r=1020,xh=35902,vh=35899,_h=1021,yh=1022,gn=1023,ei=1026,Ji=1027,bh=1028,Nc=1029,Qi=1030,Fc=1031;var Uc=1033,Co=33776,Ro=33777,Io=33778,Po=33779,Bc=35840,kc=35841,zc=35842,Hc=35843,Vc=36196,Gc=37492,Wc=37496,Xc=37488,qc=37489,Do=37490,Yc=37491,$c=37808,jc=37809,Zc=37810,Kc=37811,Jc=37812,Qc=37813,el=37814,tl=37815,nl=37816,il=37817,sl=37818,rl=37819,ol=37820,al=37821,cl=36492,ll=36494,ul=36495,hl=36283,dl=36284,Lo=36285,fl=36286;var Qr=2300,nc=2301,Xa=2302,Gu=2303,Wu=2400,Xu=2401,qu=2402;var hp=3200;var pl=0,dp=1,Mi="",Ft="srgb",eo="srgb-linear",to="linear",mt="srgb";var xs=7680;var Yu=519,fp=512,pp=513,mp=514,ml=515,gp=516,xp=517,gl=518,vp=519,$u=35044;var Mh="300 es",Wn=2e3,rr=2001;function kx(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function zx(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function no(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function _p(){let n=no("canvas");return n.style.display="block",n}var df={},or=null;function Sh(...n){let e="THREE."+n.shift();or?or("log",e,...n):console.log(e,...n)}function yp(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ve(...n){n=yp(n);let e="THREE."+n.shift();if(or)or("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ge(...n){n=yp(n);let e="THREE."+n.shift();if(or)or("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function vs(...n){let e=n.join(" ");e in df||(df[e]=!0,Ve(...n))}function bp(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Mp={[$a]:ja,[Za]:Qa,[Ka]:ec,[ys]:Ja,[ja]:$a,[Qa]:Za,[ec]:Ka,[Ja]:ys},Xn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ff=1234567,jr=Math.PI/180,Ms=180/Math.PI;function Ps(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]).toLowerCase()}function et(n,e,t){return Math.max(e,Math.min(t,n))}function Eh(n,e){return(n%e+e)%e}function Hx(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Vx(n,e,t){return n!==e?(t-n)/(e-n):0}function Zr(n,e,t){return(1-t)*n+t*e}function Gx(n,e,t,i){return Zr(n,e,1-Math.exp(-t*i))}function Wx(n,e=1){return e-Math.abs(Eh(n,e*2)-e)}function Xx(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function qx(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Yx(n,e){return n+Math.floor(Math.random()*(e-n+1))}function $x(n,e){return n+Math.random()*(e-n)}function jx(n){return n*(.5-Math.random())}function Zx(n){n!==void 0&&(ff=n);let e=ff+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Kx(n){return n*jr}function Jx(n){return n*Ms}function Qx(n){return(n&n-1)===0&&n!==0}function ev(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function tv(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function nv(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+i)/2),u=o((e+i)/2),h=r((e-i)/2),d=o((e-i)/2),f=r((i-e)/2),p=o((i-e)/2);switch(s){case"XYX":n.set(a*u,c*h,c*d,a*l);break;case"YZY":n.set(c*d,a*u,c*h,a*l);break;case"ZXZ":n.set(c*h,c*d,a*u,a*l);break;case"XZX":n.set(a*u,c*p,c*f,a*l);break;case"YXY":n.set(c*f,a*u,c*p,a*l);break;case"ZYZ":n.set(c*p,c*f,a*u,a*l);break;default:Ve("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ir(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function hn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var nt={DEG2RAD:jr,RAD2DEG:Ms,generateUUID:Ps,clamp:et,euclideanModulo:Eh,mapLinear:Hx,inverseLerp:Vx,lerp:Zr,damp:Gx,pingpong:Wx,smoothstep:Xx,smootherstep:qx,randInt:Yx,randFloat:$x,randFloatSpread:jx,seededRandom:Zx,degToRad:Kx,radToDeg:Jx,isPowerOfTwo:Qx,ceilPowerOfTwo:ev,floorPowerOfTwo:tv,setQuaternionFromProperEuler:nv,normalize:hn,denormalize:ir},de=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Sn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let c=i[s+0],l=i[s+1],u=i[s+2],h=i[s+3],d=r[o+0],f=r[o+1],p=r[o+2],x=r[o+3];if(h!==x||c!==d||l!==f||u!==p){let m=c*d+l*f+u*p+h*x;m<0&&(d=-d,f=-f,p=-p,x=-x,m=-m);let g=1-a;if(m<.9995){let S=Math.acos(m),E=Math.sin(S);g=Math.sin(g*S)/E,a=Math.sin(a*S)/E,c=c*g+d*a,l=l*g+f*a,u=u*g+p*a,h=h*g+x*a}else{c=c*g+d*a,l=l*g+f*a,u=u*g+p*a,h=h*g+x*a;let S=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=S,l*=S,u*=S,h*=S}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],c=i[s+1],l=i[s+2],u=i[s+3],h=r[o],d=r[o+1],f=r[o+2],p=r[o+3];return e[t]=a*p+u*h+c*f-l*d,e[t+1]=c*p+u*d+l*h-a*f,e[t+2]=l*p+u*f+a*d-c*h,e[t+3]=u*p-a*h-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(s/2),h=a(r/2),d=c(i/2),f=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"YXZ":this._x=d*u*h+l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"ZXY":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h-d*f*p;break;case"ZYX":this._x=d*u*h-l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h+d*f*p;break;case"YZX":this._x=d*u*h+l*f*p,this._y=l*f*h+d*u*p,this._z=l*u*p-d*f*h,this._w=l*u*h-d*f*p;break;case"XZY":this._x=d*u*h-l*f*p,this._y=l*f*h-d*u*p,this._z=l*u*p+d*f*h,this._w=l*u*h+d*f*p;break;default:Ve("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-i*l,this._z=r*u+o*l+i*c-s*a,this._w=o*u-i*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){let l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},O=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(pf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(pf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*i),u=2*(a*t-r*s),h=2*(r*i-o*t);return this.x=t+c*l+o*h-a*u,this.y=i+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-i*c,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return vu.copy(this).projectOnVector(e),this.sub(vu)}reflect(e){return this.sub(vu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(et(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},vu=new O,pf=new Sn,Ze=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l)}set(e,t,i,s,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],h=i[7],d=i[2],f=i[5],p=i[8],x=s[0],m=s[3],g=s[6],S=s[1],E=s[4],v=s[7],w=s[2],b=s[5],A=s[8];return r[0]=o*x+a*S+c*w,r[3]=o*m+a*E+c*b,r[6]=o*g+a*v+c*A,r[1]=l*x+u*S+h*w,r[4]=l*m+u*E+h*b,r[7]=l*g+u*v+h*A,r[2]=d*x+f*S+p*w,r[5]=d*m+f*E+p*b,r[8]=d*g+f*v+p*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*r*u+i*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,d=a*c-u*r,f=l*r-o*c,p=t*h+i*d+s*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=h*x,e[1]=(s*l-u*i)*x,e[2]=(a*i-s*o)*x,e[3]=d*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-a*t)*x,e[6]=f*x,e[7]=(i*c-l*t)*x,e[8]=(o*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return vs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(_u.makeScale(e,t)),this}rotate(e){return vs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(_u.makeRotation(-e)),this}translate(e,t){return vs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(_u.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_u=new Ze,mf=new Ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gf=new Ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function iv(){let n={enabled:!0,workingColorSpace:eo,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===mt&&(s.r=gi(s.r),s.g=gi(s.g),s.b=gi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===mt&&(s.r=sr(s.r),s.g=sr(s.g),s.b=sr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Mi?to:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return vs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return vs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[eo]:{primaries:e,whitePoint:i,transfer:to,toXYZ:mf,fromXYZ:gf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ft},outputColorSpaceConfig:{drawingBufferColorSpace:Ft}},[Ft]:{primaries:e,whitePoint:i,transfer:mt,toXYZ:mf,fromXYZ:gf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ft}}}),n}var at=iv();function gi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function sr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Xs,ic=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Xs===void 0&&(Xs=no("canvas")),Xs.width=e.width,Xs.height=e.height;let s=Xs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Xs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=no("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=gi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(gi(t[i]/255)*255):t[i]=gi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ve("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},sv=0,ar=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:sv++}),this.uuid=Ps(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(yu(s[o].image)):r.push(yu(s[o]))}else r=yu(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function yu(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?ic.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ve("Texture: Unable to serialize Texture."),{})}var rv=0,bu=new O,mn=class n extends Xn{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Qn,s=Qn,r=Pt,o=si,a=gn,c=on,l=n.DEFAULT_ANISOTROPY,u=Mi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rv++}),this.uuid=Ps(),this.name="",this.source=new ar(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new de(0,0),this.repeat=new de(1,1),this.center=new de(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(bu).x}get height(){return this.source.getSize(bu).y}get depth(){return this.source.getSize(bu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Ve(\`Texture.setValues(): parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){Ve(\`Texture.setValues(): property '\${t}' does not exist.\`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ph)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case bs:e.x=e.x-Math.floor(e.x);break;case Qn:e.x=e.x<0?0:1;break;case tc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case bs:e.y=e.y-Math.floor(e.y);break;case Qn:e.y=e.y<0?0:1;break;case tc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};mn.DEFAULT_IMAGE=null;mn.DEFAULT_MAPPING=ph;mn.DEFAULT_ANISOTROPY=1;var Rt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],d=c[1],f=c[5],p=c[9],x=c[2],m=c[6],g=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(p+m)<.1&&Math.abs(l+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,v=(f+1)/2,w=(g+1)/2,b=(u+d)/4,A=(h+x)/4,_=(p+m)/4;return E>v&&E>w?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=b/i,r=A/i):v>w?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=b/s,r=_/s):w<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),i=A/r,s=_/r),this.set(i,s,r,t),this}let S=Math.sqrt((m-p)*(m-p)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(S)<.001&&(S=1),this.x=(m-p)/S,this.y=(h-x)/S,this.z=(d-u)/S,this.w=Math.acos((l+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(et(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},sc=class extends Xn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Rt(0,0,e,t),this.scissorTest=!1,this.viewport=new Rt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new mn(s),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ar(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},En=class extends sc{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},io=class extends mn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var rc=class extends mn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var wt=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m)}set(e,t,i,s,r,o,a,c,l,u,h,d,f,p,x,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/qs.setFromMatrixColumn(e,0).length(),r=1/qs.setFromMatrixColumn(e,1).length(),o=1/qs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,p=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=f+p*l,t[5]=d-x*l,t[9]=-a*c,t[2]=x-d*l,t[6]=p+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*u,f=c*h,p=l*u,x=l*h;t[0]=d+x*a,t[4]=p*a-f,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-p,t[6]=x+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*u,f=c*h,p=l*u,x=l*h;t[0]=d-x*a,t[4]=-o*h,t[8]=p+f*a,t[1]=f+p*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*u,f=o*h,p=a*u,x=a*h;t[0]=c*u,t[4]=p*l-f,t[8]=d*l+x,t[1]=c*h,t[5]=x*l+d,t[9]=f*l-p,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,p=a*c,x=a*l;t[0]=c*u,t[4]=x-d*h,t[8]=p*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=f*h+p,t[10]=d-x*h}else if(e.order==="XZY"){let d=o*c,f=o*l,p=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=d*h+x,t[5]=o*u,t[9]=f*h-p,t[2]=p*h-f,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ov,e,av)}lookAt(e,t,i){let s=this.elements;return bn.subVectors(e,t),bn.lengthSq()===0&&(bn.z=1),bn.normalize(),Fi.crossVectors(i,bn),Fi.lengthSq()===0&&(Math.abs(i.z)===1?bn.x+=1e-4:bn.z+=1e-4,bn.normalize(),Fi.crossVectors(i,bn)),Fi.normalize(),Sa.crossVectors(bn,Fi),s[0]=Fi.x,s[4]=Sa.x,s[8]=bn.x,s[1]=Fi.y,s[5]=Sa.y,s[9]=bn.y,s[2]=Fi.z,s[6]=Sa.z,s[10]=bn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],h=i[5],d=i[9],f=i[13],p=i[2],x=i[6],m=i[10],g=i[14],S=i[3],E=i[7],v=i[11],w=i[15],b=s[0],A=s[4],_=s[8],T=s[12],I=s[1],P=s[5],D=s[9],H=s[13],F=s[2],L=s[6],$=s[10],q=s[14],z=s[3],K=s[7],ce=s[11],V=s[15];return r[0]=o*b+a*I+c*F+l*z,r[4]=o*A+a*P+c*L+l*K,r[8]=o*_+a*D+c*$+l*ce,r[12]=o*T+a*H+c*q+l*V,r[1]=u*b+h*I+d*F+f*z,r[5]=u*A+h*P+d*L+f*K,r[9]=u*_+h*D+d*$+f*ce,r[13]=u*T+h*H+d*q+f*V,r[2]=p*b+x*I+m*F+g*z,r[6]=p*A+x*P+m*L+g*K,r[10]=p*_+x*D+m*$+g*ce,r[14]=p*T+x*H+m*q+g*V,r[3]=S*b+E*I+v*F+w*z,r[7]=S*A+E*P+v*L+w*K,r[11]=S*_+E*D+v*$+w*ce,r[15]=S*T+E*H+v*q+w*V,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],d=e[10],f=e[14],p=e[3],x=e[7],m=e[11],g=e[15],S=c*f-l*d,E=a*f-l*h,v=a*d-c*h,w=o*f-l*u,b=o*d-c*u,A=o*h-a*u;return t*(x*S-m*E+g*v)-i*(p*S-m*w+g*b)+s*(p*E-x*w+g*A)-r*(p*v-x*b+m*A)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],o=e[5],a=e[9],c=e[2],l=e[6],u=e[10];return t*(o*u-a*l)-i*(r*u-a*c)+s*(r*l-o*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],d=e[10],f=e[11],p=e[12],x=e[13],m=e[14],g=e[15],S=t*a-i*o,E=t*c-s*o,v=t*l-r*o,w=i*c-s*a,b=i*l-r*a,A=s*l-r*c,_=u*x-h*p,T=u*m-d*p,I=u*g-f*p,P=h*m-d*x,D=h*g-f*x,H=d*g-f*m,F=S*H-E*D+v*P+w*I-b*T+A*_;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/F;return e[0]=(a*H-c*D+l*P)*L,e[1]=(s*D-i*H-r*P)*L,e[2]=(x*A-m*b+g*w)*L,e[3]=(d*b-h*A-f*w)*L,e[4]=(c*I-o*H-l*T)*L,e[5]=(t*H-s*I+r*T)*L,e[6]=(m*v-p*A-g*E)*L,e[7]=(u*A-d*v+f*E)*L,e[8]=(o*D-a*I+l*_)*L,e[9]=(i*I-t*D-r*_)*L,e[10]=(p*b-x*v+g*S)*L,e[11]=(h*v-u*b-f*S)*L,e[12]=(a*T-o*P-c*_)*L,e[13]=(t*P-i*T+s*_)*L,e[14]=(x*E-p*w-m*S)*L,e[15]=(u*w-h*E+d*S)*L,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+i,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+i,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,d=r*l,f=r*u,p=r*h,x=o*u,m=o*h,g=a*h,S=c*l,E=c*u,v=c*h,w=i.x,b=i.y,A=i.z;return s[0]=(1-(x+g))*w,s[1]=(f+v)*w,s[2]=(p-E)*w,s[3]=0,s[4]=(f-v)*b,s[5]=(1-(d+g))*b,s[6]=(m+S)*b,s[7]=0,s[8]=(p+E)*A,s[9]=(m-S)*A,s[10]=(1-(d+x))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let o=qs.set(s[0],s[1],s[2]).length(),a=qs.set(s[4],s[5],s[6]).length(),c=qs.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Hn.copy(this);let l=1/o,u=1/a,h=1/c;return Hn.elements[0]*=l,Hn.elements[1]*=l,Hn.elements[2]*=l,Hn.elements[4]*=u,Hn.elements[5]*=u,Hn.elements[6]*=u,Hn.elements[8]*=h,Hn.elements[9]*=h,Hn.elements[10]*=h,t.setFromRotationMatrix(Hn),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,s,r,o,a=Wn,c=!1){let l=this.elements,u=2*r/(t-e),h=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),p,x;if(c)p=r/(o-r),x=o*r/(o-r);else if(a===Wn)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===rr)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Wn,c=!1){let l=this.elements,u=2/(t-e),h=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),p,x;if(c)p=1/(o-r),x=o/(o-r);else if(a===Wn)p=-2/(o-r),x=-(o+r)/(o-r);else if(a===rr)p=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},qs=new O,Hn=new wt,ov=new O(0,0,0),av=new O(1,1,1),Fi=new O,Sa=new O,bn=new O,xf=new wt,vf=new Sn,xi=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-et(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(et(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(et(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Ve("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return xf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(xf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vf.setFromEuler(this),this.setFromQuaternion(vf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};xi.DEFAULT_ORDER="XYZ";var cr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},cv=0,_f=new O,Ys=new Sn,hi=new wt,Ea=new O,Wr=new O,lv=new O,uv=new Sn,yf=new O(1,0,0),bf=new O(0,1,0),Mf=new O(0,0,1),Sf={type:"added"},hv={type:"removed"},$s={type:"childadded",child:null},Mu={type:"childremoved",child:null},Bt=class n extends Xn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cv++}),this.uuid=Ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new O,t=new xi,i=new Sn,s=new O(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new wt},normalMatrix:{value:new Ze}}),this.matrix=new wt,this.matrixWorld=new wt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ys.setFromAxisAngle(e,t),this.quaternion.multiply(Ys),this}rotateOnWorldAxis(e,t){return Ys.setFromAxisAngle(e,t),this.quaternion.premultiply(Ys),this}rotateX(e){return this.rotateOnAxis(yf,e)}rotateY(e){return this.rotateOnAxis(bf,e)}rotateZ(e){return this.rotateOnAxis(Mf,e)}translateOnAxis(e,t){return _f.copy(e).applyQuaternion(this.quaternion),this.position.add(_f.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(yf,e)}translateY(e){return this.translateOnAxis(bf,e)}translateZ(e){return this.translateOnAxis(Mf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(hi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ea.copy(e):Ea.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Wr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?hi.lookAt(Wr,Ea,this.up):hi.lookAt(Ea,Wr,this.up),this.quaternion.setFromRotationMatrix(hi),s&&(hi.extractRotation(s.matrixWorld),Ys.setFromRotationMatrix(hi),this.quaternion.premultiply(Ys.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ge("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Sf),$s.child=e,this.dispatchEvent($s),$s.child=null):Ge("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(hv),Mu.child=e,this.dispatchEvent(Mu),Mu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),hi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),hi.multiply(e.parent.matrixWorld)),e.applyMatrix4(hi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Sf),$s.child=e,this.dispatchEvent($s),$s.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wr,e,lv),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wr,uv,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),p=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=s,i;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};Bt.DEFAULT_UP=new O(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var st=class extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},dv={type:"move"},lr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new st,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new st,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new st,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),g=this._getHandJoint(l,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,p=.005;l.inputState.pinching&&d>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(dv)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new st;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Sp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ui={h:0,s:0,l:0},wa={h:0,s:0,l:0};function Su(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var We=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,at.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=at.workingColorSpace){return this.r=e,this.g=t,this.b=i,at.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=at.workingColorSpace){if(e=Eh(e,1),t=et(t,0,1),i=et(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Su(o,r,e+1/3),this.g=Su(o,r,e),this.b=Su(o,r,e-1/3)}return at.colorSpaceToWorking(this,s),this}setStyle(e,t=Ft){function i(r){r!==void 0&&parseFloat(r)<1&&Ve("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\\w+)\\(([^\\)]*)\\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*,\\s*(\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\\s*(\\d*\\.?\\d+)\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*,\\s*(\\d*\\.?\\d+)\\%\\s*(?:,\\s*(\\d*\\.?\\d+)\\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ve("Color: Unknown color model "+e)}}else if(s=/^\\#([A-Fa-f\\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Ve("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ft){let i=Sp[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ve("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=gi(e.r),this.g=gi(e.g),this.b=gi(e.b),this}copyLinearToSRGB(e){return this.r=sr(e.r),this.g=sr(e.g),this.b=sr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ft){return at.workingToColorSpace(rn.copy(this),e),Math.round(et(rn.r*255,0,255))*65536+Math.round(et(rn.g*255,0,255))*256+Math.round(et(rn.b*255,0,255))}getHexString(e=Ft){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=at.workingColorSpace){at.workingToColorSpace(rn.copy(this),t);let i=rn.r,s=rn.g,r=rn.b,o=Math.max(i,s,r),a=Math.min(i,s,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case i:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-i)/h+2;break;case r:c=(i-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=at.workingColorSpace){return at.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Ft){at.workingToColorSpace(rn.copy(this),e);let t=rn.r,i=rn.g,s=rn.b;return e!==Ft?\`color(\${e} \${t.toFixed(3)} \${i.toFixed(3)} \${s.toFixed(3)})\`:\`rgb(\${Math.round(t*255)},\${Math.round(i*255)},\${Math.round(s*255)})\`}offsetHSL(e,t,i){return this.getHSL(Ui),this.setHSL(Ui.h+e,Ui.s+t,Ui.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ui),e.getHSL(wa);let i=Zr(Ui.h,wa.h,t),s=Zr(Ui.s,wa.s,t),r=Zr(Ui.l,wa.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new We;We.NAMES=Sp;var so=class extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xi,this.environmentIntensity=1,this.environmentRotation=new xi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Vn=new O,di=new O,Eu=new O,fi=new O,js=new O,Zs=new O,Ef=new O,wu=new O,Tu=new O,Au=new O,Cu=new Rt,Ru=new Rt,Iu=new Rt,Vi=class n{constructor(e=new O,t=new O,i=new O){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Vn.subVectors(e,t),s.cross(Vn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Vn.subVectors(s,t),di.subVectors(i,t),Eu.subVectors(e,t);let o=Vn.dot(Vn),a=Vn.dot(di),c=Vn.dot(Eu),l=di.dot(di),u=di.dot(Eu),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(l*c-a*u)*d,p=(o*u-a*c)*d;return r.set(1-f-p,p,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,fi)===null?!1:fi.x>=0&&fi.y>=0&&fi.x+fi.y<=1}static getInterpolation(e,t,i,s,r,o,a,c){return this.getBarycoord(e,t,i,s,fi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,fi.x),c.addScaledVector(o,fi.y),c.addScaledVector(a,fi.z),c)}static getInterpolatedAttribute(e,t,i,s,r,o){return Cu.setScalar(0),Ru.setScalar(0),Iu.setScalar(0),Cu.fromBufferAttribute(e,t),Ru.fromBufferAttribute(e,i),Iu.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Cu,r.x),o.addScaledVector(Ru,r.y),o.addScaledVector(Iu,r.z),o}static isFrontFacing(e,t,i,s){return Vn.subVectors(i,t),di.subVectors(e,t),Vn.cross(di).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Vn.subVectors(this.c,this.b),di.subVectors(this.a,this.b),Vn.cross(di).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;js.subVectors(s,i),Zs.subVectors(r,i),wu.subVectors(e,i);let c=js.dot(wu),l=Zs.dot(wu);if(c<=0&&l<=0)return t.copy(i);Tu.subVectors(e,s);let u=js.dot(Tu),h=Zs.dot(Tu);if(u>=0&&h<=u)return t.copy(s);let d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector(js,o);Au.subVectors(e,r);let f=js.dot(Au),p=Zs.dot(Au);if(p>=0&&f<=p)return t.copy(r);let x=f*l-c*p;if(x<=0&&l>=0&&p<=0)return a=l/(l-p),t.copy(i).addScaledVector(Zs,a);let m=u*p-f*h;if(m<=0&&h-u>=0&&f-p>=0)return Ef.subVectors(r,s),a=(h-u)/(h-u+(f-p)),t.copy(s).addScaledVector(Ef,a);let g=1/(m+x+d);return o=x*g,a=d*g,t.copy(i).addScaledVector(js,o).addScaledVector(Zs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ht=class{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Gn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Gn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Gn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Gn):Gn.fromBufferAttribute(r,o),Gn.applyMatrix4(e.matrixWorld),this.expandByPoint(Gn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ta.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Ta.copy(i.boundingBox)),Ta.applyMatrix4(e.matrixWorld),this.union(Ta)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Gn),Gn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xr),Aa.subVectors(this.max,Xr),Ks.subVectors(e.a,Xr),Js.subVectors(e.b,Xr),Qs.subVectors(e.c,Xr),Bi.subVectors(Js,Ks),ki.subVectors(Qs,Js),fs.subVectors(Ks,Qs);let t=[0,-Bi.z,Bi.y,0,-ki.z,ki.y,0,-fs.z,fs.y,Bi.z,0,-Bi.x,ki.z,0,-ki.x,fs.z,0,-fs.x,-Bi.y,Bi.x,0,-ki.y,ki.x,0,-fs.y,fs.x,0];return!Pu(t,Ks,Js,Qs,Aa)||(t=[1,0,0,0,1,0,0,0,1],!Pu(t,Ks,Js,Qs,Aa))?!1:(Ca.crossVectors(Bi,ki),t=[Ca.x,Ca.y,Ca.z],Pu(t,Ks,Js,Qs,Aa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(pi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},pi=[new O,new O,new O,new O,new O,new O,new O,new O],Gn=new O,Ta=new Ht,Ks=new O,Js=new O,Qs=new O,Bi=new O,ki=new O,fs=new O,Xr=new O,Aa=new O,Ca=new O,ps=new O;function Pu(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){ps.fromArray(n,r);let a=s.x*Math.abs(ps.x)+s.y*Math.abs(ps.y)+s.z*Math.abs(ps.z),c=e.dot(ps),l=t.dot(ps),u=i.dot(ps);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Ut=new O,Ra=new de,fv=0,en=class extends Xn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fv++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=$u,this.updateRanges=[],this.gpuType=Yn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ra.fromBufferAttribute(this,t),Ra.applyMatrix3(e),this.setXY(t,Ra.x,Ra.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix3(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ir(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=hn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ir(t,this.array)),t}setX(e,t){return this.normalized&&(t=hn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ir(t,this.array)),t}setY(e,t){return this.normalized&&(t=hn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ir(t,this.array)),t}setZ(e,t){return this.normalized&&(t=hn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ir(t,this.array)),t}setW(e,t){return this.normalized&&(t=hn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=hn(t,this.array),i=hn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=hn(t,this.array),i=hn(i,this.array),s=hn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=hn(t,this.array),i=hn(i,this.array),s=hn(s,this.array),r=hn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==$u&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var ro=class extends en{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var oo=class extends en{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var ft=class extends en{constructor(e,t,i){super(new Float32Array(e),t,i)}},pv=new Ht,qr=new O,Du=new O,ur=class{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):pv.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;qr.subVectors(e,this.center);let t=qr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(qr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Du.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(qr.copy(e.center).add(Du)),this.expandByPoint(qr.copy(e.center).sub(Du))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},mv=0,Fn=new wt,Lu=new Bt,er=new O,Mn=new Ht,Yr=new Ht,Zt=new O,Vt=class n extends Xn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mv++}),this.uuid=Ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(kx(e)?oo:ro)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ze().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Fn.makeRotationFromQuaternion(e),this.applyMatrix4(Fn),this}rotateX(e){return Fn.makeRotationX(e),this.applyMatrix4(Fn),this}rotateY(e){return Fn.makeRotationY(e),this.applyMatrix4(Fn),this}rotateZ(e){return Fn.makeRotationZ(e),this.applyMatrix4(Fn),this}translate(e,t,i){return Fn.makeTranslation(e,t,i),this.applyMatrix4(Fn),this}scale(e,t,i){return Fn.makeScale(e,t,i),this.applyMatrix4(Fn),this}lookAt(e){return Lu.lookAt(e),Lu.updateMatrix(),this.applyMatrix4(Lu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(er).negate(),this.translate(er.x,er.y,er.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ft(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ve("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ht);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];Mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Zt.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(Zt),Zt.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(Zt)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ge('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ur);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){let i=this.boundingSphere.center;if(Mn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Yr.setFromBufferAttribute(a),this.morphTargetsRelative?(Zt.addVectors(Mn.min,Yr.min),Mn.expandByPoint(Zt),Zt.addVectors(Mn.max,Yr.max),Mn.expandByPoint(Zt)):(Mn.expandByPoint(Yr.min),Mn.expandByPoint(Yr.max))}Mn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Zt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Zt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)Zt.fromBufferAttribute(a,l),c&&(er.fromBufferAttribute(e,l),Zt.add(er)),s=Math.max(s,i.distanceToSquared(Zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ge('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ge("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new en(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let _=0;_<i.count;_++)a[_]=new O,c[_]=new O;let l=new O,u=new O,h=new O,d=new de,f=new de,p=new de,x=new O,m=new O;function g(_,T,I){l.fromBufferAttribute(i,_),u.fromBufferAttribute(i,T),h.fromBufferAttribute(i,I),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,T),p.fromBufferAttribute(r,I),u.sub(l),h.sub(l),f.sub(d),p.sub(d);let P=1/(f.x*p.y-p.x*f.y);isFinite(P)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(h,-f.y).multiplyScalar(P),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-p.x).multiplyScalar(P),a[_].add(x),a[T].add(x),a[I].add(x),c[_].add(m),c[T].add(m),c[I].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,T=S.length;_<T;++_){let I=S[_],P=I.start,D=I.count;for(let H=P,F=P+D;H<F;H+=3)g(e.getX(H+0),e.getX(H+1),e.getX(H+2))}let E=new O,v=new O,w=new O,b=new O;function A(_){w.fromBufferAttribute(s,_),b.copy(w);let T=a[_];E.copy(T),E.sub(w.multiplyScalar(w.dot(T))).normalize(),v.crossVectors(b,T);let P=v.dot(c[_])<0?-1:1;o.setXYZW(_,E.x,E.y,E.z,P)}for(let _=0,T=S.length;_<T;++_){let I=S[_],P=I.start,D=I.count;for(let H=P,F=P+D;H<F;H+=3)A(e.getX(H+0)),A(e.getX(H+1)),A(e.getX(H+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new en(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new O,r=new O,o=new O,a=new O,c=new O,l=new O,u=new O,h=new O;if(e)for(let d=0,f=e.count;d<f;d+=3){let p=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(i,p),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),a.add(u),c.add(u),l.add(u),i.setXYZ(p,a.x,a.y,a.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Zt.fromBufferAttribute(e,t),Zt.normalize(),e.setXYZ(t,Zt.x,Zt.y,Zt.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u),f=0,p=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*u;for(let g=0;g<u;g++)d[p++]=l[f++]}return new en(d,u,h)}if(this.index===null)return Ve("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,i);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let d=l[u],f=e(d,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){let f=l[h];u.push(f.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var gv=0,Wi=class extends Xn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gv++}),this.uuid=Ps(),this.name="",this.type="Material",this.blending=_s,this.side=pn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=qa,this.blendDst=Ya,this.blendEquation=Gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new We(0,0,0),this.blendAlpha=0,this.depthFunc=ys,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xs,this.stencilZFail=xs,this.stencilZPass=xs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Ve(\`Material: parameter '\${t}' has value of undefined.\`);continue}let s=this[t];if(s===void 0){Ve(\`Material: '\${t}' is not a property of THREE.\${this.type}.\`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==_s&&(i.blending=this.blending),this.side!==pn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==qa&&(i.blendSrc=this.blendSrc),this.blendDst!==Ya&&(i.blendDst=this.blendDst),this.blendEquation!==Gi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ys&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Yu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==xs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==xs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new We().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new de().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new de().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var mi=new O,Ou=new O,Ia=new O,zi=new O,Nu=new O,Pa=new O,Fu=new O,Ss=class{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,mi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=mi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(mi.copy(this.origin).addScaledVector(this.direction,t),mi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ou.copy(e).add(t).multiplyScalar(.5),Ia.copy(t).sub(e).normalize(),zi.copy(this.origin).sub(Ou);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Ia),a=zi.dot(this.direction),c=-zi.dot(Ia),l=zi.lengthSq(),u=Math.abs(1-o*o),h,d,f,p;if(u>0)if(h=o*c-a,d=o*a-c,p=r*u,h>=0)if(d>=-p)if(d<=p){let x=1/u;h*=x,d*=x,f=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;else d<=-p?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l):d<=p?(h=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-c),r),f=-h*h+d*(d+2*c)+l);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Ou).addScaledVector(Ia,d),f}intersectSphere(e,t){mi.subVectors(e.center,this.origin);let i=mi.dot(this.direction),s=mi.dot(mi)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,c=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,c=(e.min.z-d.z)*h),i>c||a>s)||((a>i||i!==i)&&(i=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,mi)!==null}intersectTriangle(e,t,i,s,r){Nu.subVectors(t,e),Pa.subVectors(i,e),Fu.crossVectors(Nu,Pa);let o=this.direction.dot(Fu),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zi.subVectors(this.origin,e);let c=a*this.direction.dot(Pa.crossVectors(zi,Pa));if(c<0)return null;let l=a*this.direction.dot(Nu.cross(zi));if(l<0||c+l>o)return null;let u=-a*zi.dot(Fu);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Gt=class extends Wi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new We(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.combine=ah,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},wf=new wt,ms=new Ss,Da=new ur,Tf=new O,La=new O,Oa=new O,Na=new O,Uu=new O,Fa=new O,Af=new O,Ua=new O,Je=class extends Bt{constructor(e=new Vt,t=new Gt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Fa.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(Uu.fromBufferAttribute(h,e),o?Fa.addScaledVector(Uu,u):Fa.addScaledVector(Uu.sub(t),u))}t.add(Fa)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Da.copy(i.boundingSphere),Da.applyMatrix4(r),ms.copy(e.ray).recast(e.near),!(Da.containsPoint(ms.origin)===!1&&(ms.intersectSphere(Da,Tf)===null||ms.origin.distanceToSquared(Tf)>(e.far-e.near)**2))&&(wf.copy(r).invert(),ms.copy(e.ray).applyMatrix4(wf),!(i.boundingBox!==null&&ms.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ms)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=o[m.materialIndex],S=Math.max(m.start,f.start),E=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=S,w=E;v<w;v+=3){let b=a.getX(v),A=a.getX(v+1),_=a.getX(v+2);s=Ba(this,g,e,i,l,u,h,b,A,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let S=a.getX(m),E=a.getX(m+1),v=a.getX(m+2);s=Ba(this,o,e,i,l,u,h,S,E,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let m=d[p],g=o[m.materialIndex],S=Math.max(m.start,f.start),E=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let v=S,w=E;v<w;v+=3){let b=v,A=v+1,_=v+2;s=Ba(this,g,e,i,l,u,h,b,A,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let m=p,g=x;m<g;m+=3){let S=m,E=m+1,v=m+2;s=Ba(this,o,e,i,l,u,h,S,E,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function xv(n,e,t,i,s,r,o,a){let c;if(e.side===dn?c=i.intersectTriangle(o,r,s,!0,a):c=i.intersectTriangle(s,r,o,e.side===pn,a),c===null)return null;Ua.copy(a),Ua.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Ua);return l<t.near||l>t.far?null:{distance:l,point:Ua.clone(),object:n}}function Ba(n,e,t,i,s,r,o,a,c,l){n.getVertexPosition(a,La),n.getVertexPosition(c,Oa),n.getVertexPosition(l,Na);let u=xv(n,e,t,i,La,Oa,Na,Af);if(u){let h=new O;Vi.getBarycoord(Af,La,Oa,Na,h),s&&(u.uv=Vi.getInterpolatedAttribute(s,a,c,l,h,new de)),r&&(u.uv1=Vi.getInterpolatedAttribute(r,a,c,l,h,new de)),o&&(u.normal=Vi.getInterpolatedAttribute(o,a,c,l,h,new O),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new O,materialIndex:0};Vi.getNormal(La,Oa,Na,d.normal),u.face=d,u.barycoord=h}return u}var ti=class extends mn{constructor(e=null,t=1,i=1,s,r,o,a,c,l=Kt,u=Kt,h,d){super(null,o,a,c,l,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Bu=new O,vv=new O,_v=new Ze,Un=class{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Bu.subVectors(i,t).cross(vv.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(Bu),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||_v.getNormalMatrix(e),s=this.coplanarPoint(Bu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},gs=new ur,yv=new de(.5,.5),ka=new O,hr=class{constructor(e=new Un,t=new Un,i=new Un,s=new Un,r=new Un,o=new Un){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Wn,i=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],h=r[5],d=r[6],f=r[7],p=r[8],x=r[9],m=r[10],g=r[11],S=r[12],E=r[13],v=r[14],w=r[15];if(s[0].setComponents(l-o,f-u,g-p,w-S).normalize(),s[1].setComponents(l+o,f+u,g+p,w+S).normalize(),s[2].setComponents(l+a,f+h,g+x,w+E).normalize(),s[3].setComponents(l-a,f-h,g-x,w-E).normalize(),i)s[4].setComponents(c,d,m,v).normalize(),s[5].setComponents(l-c,f-d,g-m,w-v).normalize();else if(s[4].setComponents(l-c,f-d,g-m,w-v).normalize(),t===Wn)s[5].setComponents(l+c,f+d,g+m,w+v).normalize();else if(t===rr)s[5].setComponents(c,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gs)}intersectsSprite(e){gs.center.set(0,0,0);let t=yv.distanceTo(e.center);return gs.radius=.7071067811865476+t,gs.applyMatrix4(e.matrixWorld),this.intersectsSphere(gs)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(ka.x=s.normal.x>0?e.max.x:e.min.x,ka.y=s.normal.y>0?e.max.y:e.min.y,ka.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ka)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ao=class extends mn{constructor(e=[],t=Ki,i,s,r,o,a,c,l,u){super(e,t,i,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var vi=class extends mn{constructor(e,t,i=qn,s,r,o,a=Kt,c=Kt,l,u=ei,h=1){if(u!==ei&&u!==Ji)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,s,r,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ar(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},oc=class extends vi{constructor(e,t=qn,i=Ki,s,r,o=Kt,a=Kt,c,l=ei){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,c,l),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},co=class extends mn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Wt=class n extends Vt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],d=0,f=0;p("z","y","x",-1,-1,i,t,e,o,r,0),p("z","y","x",1,-1,i,t,-e,o,r,1),p("x","z","y",1,1,e,i,t,s,o,2),p("x","z","y",1,-1,e,i,-t,s,o,3),p("x","y","z",1,-1,e,t,i,s,r,4),p("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new ft(l,3)),this.setAttribute("normal",new ft(u,3)),this.setAttribute("uv",new ft(h,2));function p(x,m,g,S,E,v,w,b,A,_,T){let I=v/A,P=w/_,D=v/2,H=w/2,F=b/2,L=A+1,$=_+1,q=0,z=0,K=new O;for(let ce=0;ce<$;ce++){let V=ce*P-H;for(let te=0;te<L;te++){let Me=te*I-D;K[x]=Me*S,K[m]=V*E,K[g]=F,l.push(K.x,K.y,K.z),K[x]=0,K[m]=0,K[g]=b>0?1:-1,u.push(K.x,K.y,K.z),h.push(te/A),h.push(1-ce/_),q+=1}}for(let ce=0;ce<_;ce++)for(let V=0;V<A;V++){let te=d+V+L*ce,Me=d+V+L*(ce+1),Ye=d+(V+1)+L*(ce+1),$e=d+(V+1)+L*ce;c.push(te,Me,$e),c.push(Me,Ye,$e),z+=6}a.addGroup(f,z,T),f+=z,d+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var _i=class n extends Vt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],p=0,x=[],m=i/2,g=0;S(),o===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(u),this.setAttribute("position",new ft(h,3)),this.setAttribute("normal",new ft(d,3)),this.setAttribute("uv",new ft(f,2));function S(){let v=new O,w=new O,b=0,A=(t-e)/i;for(let _=0;_<=r;_++){let T=[],I=_/r,P=I*(t-e)+e;for(let D=0;D<=s;D++){let H=D/s,F=H*c+a,L=Math.sin(F),$=Math.cos(F);w.x=P*L,w.y=-I*i+m,w.z=P*$,h.push(w.x,w.y,w.z),v.set(L,A,$).normalize(),d.push(v.x,v.y,v.z),f.push(H,1-I),T.push(p++)}x.push(T)}for(let _=0;_<s;_++)for(let T=0;T<r;T++){let I=x[T][_],P=x[T+1][_],D=x[T+1][_+1],H=x[T][_+1];(e>0||T!==0)&&(u.push(I,P,H),b+=3),(t>0||T!==r-1)&&(u.push(P,D,H),b+=3)}l.addGroup(g,b,0),g+=b}function E(v){let w=p,b=new de,A=new O,_=0,T=v===!0?e:t,I=v===!0?1:-1;for(let D=1;D<=s;D++)h.push(0,m*I,0),d.push(0,I,0),f.push(.5,.5),p++;let P=p;for(let D=0;D<=s;D++){let F=D/s*c+a,L=Math.cos(F),$=Math.sin(F);A.x=T*$,A.y=m*I,A.z=T*L,h.push(A.x,A.y,A.z),d.push(0,I,0),b.x=L*.5+.5,b.y=$*.5*I+.5,f.push(b.x,b.y),p++}for(let D=0;D<s;D++){let H=w+D,F=P+D;v===!0?u.push(F,F+1,H):u.push(F+1,F,H),_+=3}l.addGroup(g,_,v===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var wn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ve("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=i[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,i[s]===o)return s/(r-1);let u=i[s],d=i[s+1]-u,f=(o-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=t||(o.isVector2?new de:new O);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new O,s=[],r=[],o=[],a=new O,c=new wt;for(let f=0;f<=e;f++){let p=f/e;s[f]=this.getTangentAt(p,new O)}r[0]=new O,o[0]=new O;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=l&&(l=u,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),d<=l&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(et(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,p))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(et(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],f*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},dr=class extends wn{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new de){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*u-f*h+this.aX,l=d*h+f*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ac=class extends dr{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function wh(){let n=0,e=0,t=0,i=0;function s(r,o,a,c){n=r,e=a,t=-3*r+3*o-2*a-c,i=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,u,h){let d=(o-r)/l-(a-r)/(l+u)+(a-o)/u,f=(a-o)/u-(c-o)/(u+h)+(c-a)/h;d*=u,f*=u,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var Cf=new O,Rf=new O,ku=new wh,zu=new wh,Hu=new wh,cc=class extends wn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new O){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,u;this.closed||a>0?l=s[(a-1)%r]:(Rf.subVectors(s[0],s[1]).add(s[0]),l=Rf);let h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(Cf.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Cf),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(l.distanceToSquared(h),f),x=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),ku.initNonuniformCatmullRom(l.x,h.x,d.x,u.x,p,x,m),zu.initNonuniformCatmullRom(l.y,h.y,d.y,u.y,p,x,m),Hu.initNonuniformCatmullRom(l.z,h.z,d.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(ku.initCatmullRom(l.x,h.x,d.x,u.x,this.tension),zu.initCatmullRom(l.y,h.y,d.y,u.y,this.tension),Hu.initCatmullRom(l.z,h.z,d.z,u.z,this.tension));return i.set(ku.calc(c),zu.calc(c),Hu.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new O().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function If(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,c=n*a;return(2*t-2*i+r+o)*c+(-3*t+3*i-2*r-o)*a+r*n+t}function bv(n,e){let t=1-n;return t*t*e}function Mv(n,e){return 2*(1-n)*n*e}function Sv(n,e){return n*n*e}function Kr(n,e,t,i){return bv(n,e)+Mv(n,t)+Sv(n,i)}function Ev(n,e){let t=1-n;return t*t*t*e}function wv(n,e){let t=1-n;return 3*t*t*n*e}function Tv(n,e){return 3*(1-n)*n*n*e}function Av(n,e){return n*n*n*e}function Jr(n,e,t,i,s){return Ev(n,e)+wv(n,t)+Tv(n,i)+Av(n,s)}var lo=class extends wn{constructor(e=new de,t=new de,i=new de,s=new de){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new de){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Jr(e,s.x,r.x,o.x,a.x),Jr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},lc=class extends wn{constructor(e=new O,t=new O,i=new O,s=new O){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new O){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Jr(e,s.x,r.x,o.x,a.x),Jr(e,s.y,r.y,o.y,a.y),Jr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},uo=class extends wn{constructor(e=new de,t=new de){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new de){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new de){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},uc=class extends wn{constructor(e=new O,t=new O){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new O){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new O){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ho=class extends wn{constructor(e=new de,t=new de,i=new de){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new de){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Kr(e,s.x,r.x,o.x),Kr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},hc=class extends wn{constructor(e=new O,t=new O,i=new O){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new O){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Kr(e,s.x,r.x,o.x),Kr(e,s.y,r.y,o.y),Kr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},fo=class extends wn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new de){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return i.set(If(a,c.x,l.x,u.x,h.x),If(a,c.y,l.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new de().fromArray(s))}return this}},ju=Object.freeze({__proto__:null,ArcCurve:ac,CatmullRomCurve3:cc,CubicBezierCurve:lo,CubicBezierCurve3:lc,EllipseCurve:dr,LineCurve:uo,LineCurve3:uc,QuadraticBezierCurve:ho,QuadraticBezierCurve3:hc,SplineCurve:fo}),dc=class extends wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ju[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new ju[s.type]().fromJSON(s))}return this}},po=class extends dc{constructor(e){super(),this.type="Path",this.currentPoint=new de,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new uo(this.currentPoint.clone(),new de(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new ho(this.currentPoint.clone(),new de(e,t),new de(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new lo(this.currentPoint.clone(),new de(e,t),new de(i,s),new de(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new fo(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,s,r,o,a,c),this}absellipse(e,t,i,s,r,o,a,c){let l=new dr(e,t,i,s,r,o,a,c);if(this.curves.length>0){let h=l.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Tn=class extends po{constructor(e){super(e),this.uuid=Ps(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new po().fromJSON(s))}return this}};function Cv(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=Ep(n,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(i&&(r=Lv(n,e,r,t)),n.length>80*t){a=n[0],c=n[1];let u=a,h=c;for(let d=t;d<s;d+=t){let f=n[d],p=n[d+1];f<a&&(a=f),p<c&&(c=p),f>u&&(u=f),p>h&&(h=p)}l=Math.max(u-a,h-c),l=l!==0?32767/l:0}return mo(r,o,t,a,c,l,0),o}function Ep(n,e,t,i,s){let r;if(s===Wv(n,e,t,i)>0)for(let o=e;o<t;o+=i)r=Pf(o/i|0,n[o],n[o+1],r);else for(let o=t-i;o>=e;o-=i)r=Pf(o/i|0,n[o],n[o+1],r);return r&&fr(r,r.next)&&(xo(r),r=r.next),r}function Es(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(fr(t,t.next)||It(t.prev,t,t.next)===0)){if(xo(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function mo(n,e,t,i,s,r,o){if(!n)return;!o&&r&&Bv(n,i,s,r);let a=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(r?Iv(n,i,s,r):Rv(n)){e.push(c.i,n.i,l.i),xo(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=Pv(Es(n),e),mo(n,e,t,i,s,r,2)):o===2&&Dv(n,e,t,i,s,r):mo(Es(n),e,t,i,s,r,1);break}}}function Rv(n){let e=n.prev,t=n,i=n.next;if(It(e,t,i)>=0)return!1;let s=e.x,r=t.x,o=i.x,a=e.y,c=t.y,l=i.y,u=Math.min(s,r,o),h=Math.min(a,c,l),d=Math.max(s,r,o),f=Math.max(a,c,l),p=i.next;for(;p!==e;){if(p.x>=u&&p.x<=d&&p.y>=h&&p.y<=f&&$r(s,a,r,c,o,l,p.x,p.y)&&It(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Iv(n,e,t,i){let s=n.prev,r=n,o=n.next;if(It(s,r,o)>=0)return!1;let a=s.x,c=r.x,l=o.x,u=s.y,h=r.y,d=o.y,f=Math.min(a,c,l),p=Math.min(u,h,d),x=Math.max(a,c,l),m=Math.max(u,h,d),g=Zu(f,p,e,t,i),S=Zu(x,m,e,t,i),E=n.prevZ,v=n.nextZ;for(;E&&E.z>=g&&v&&v.z<=S;){if(E.x>=f&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==o&&$r(a,u,c,h,l,d,E.x,E.y)&&It(E.prev,E,E.next)>=0||(E=E.prevZ,v.x>=f&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&$r(a,u,c,h,l,d,v.x,v.y)&&It(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;E&&E.z>=g;){if(E.x>=f&&E.x<=x&&E.y>=p&&E.y<=m&&E!==s&&E!==o&&$r(a,u,c,h,l,d,E.x,E.y)&&It(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;v&&v.z<=S;){if(v.x>=f&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&$r(a,u,c,h,l,d,v.x,v.y)&&It(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Pv(n,e){let t=n;do{let i=t.prev,s=t.next.next;!fr(i,s)&&Tp(i,t,t.next,s)&&go(i,s)&&go(s,i)&&(e.push(i.i,t.i,s.i),xo(t),xo(t.next),t=n=s),t=t.next}while(t!==n);return Es(t)}function Dv(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Hv(o,a)){let c=Ap(o,a);o=Es(o,o.next),c=Es(c,c.next),mo(o,e,t,i,s,r,0),mo(c,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function Lv(n,e,t,i){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*i,c=r<o-1?e[r+1]*i:n.length,l=Ep(n,a,c,i,!1);l===l.next&&(l.steiner=!0),s.push(zv(l))}s.sort(Ov);for(let r=0;r<s.length;r++)t=Nv(s[r],t);return t}function Ov(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function Nv(n,e){let t=Fv(n,e);if(!t)return e;let i=Ap(t,n);return Es(i,i.next),Es(t,t.next)}function Fv(n,e){let t=e,i=n.x,s=n.y,r=-1/0,o;if(fr(n,t))return t;do{if(fr(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=i&&h>r&&(r=h,o=t.x<t.next.x?t:t.next,h===i))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,c=o.x,l=o.y,u=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&wp(s<l?i:r,s,c,l,s<l?r:i,s,t.x,t.y)){let h=Math.abs(s-t.y)/(i-t.x);go(t,n)&&(h<u||h===u&&(t.x>o.x||t.x===o.x&&Uv(o,t)))&&(o=t,u=h)}t=t.next}while(t!==a);return o}function Uv(n,e){return It(n.prev,n,e.prev)<0&&It(e.next,n,n.next)<0}function Bv(n,e,t,i){let s=n;do s.z===0&&(s.z=Zu(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,kv(s)}function kv(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(s=i,i=i.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=o}r.nextZ=null,t*=2}while(e>1);return n}function Zu(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function zv(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function wp(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function $r(n,e,t,i,s,r,o,a){return!(n===o&&e===a)&&wp(n,e,t,i,s,r,o,a)}function Hv(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Vv(n,e)&&(go(n,e)&&go(e,n)&&Gv(n,e)&&(It(n.prev,n,e.prev)||It(n,e.prev,e))||fr(n,e)&&It(n.prev,n,n.next)>0&&It(e.prev,e,e.next)>0)}function It(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function fr(n,e){return n.x===e.x&&n.y===e.y}function Tp(n,e,t,i){let s=Ha(It(n,e,t)),r=Ha(It(n,e,i)),o=Ha(It(t,i,n)),a=Ha(It(t,i,e));return!!(s!==r&&o!==a||s===0&&za(n,t,e)||r===0&&za(n,i,e)||o===0&&za(t,n,i)||a===0&&za(t,e,i))}function za(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Ha(n){return n>0?1:n<0?-1:0}function Vv(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Tp(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function go(n,e){return It(n.prev,n,n.next)<0?It(n,e,n.next)>=0&&It(n,n.prev,e)>=0:It(n,e,n.prev)<0||It(n,n.next,e)<0}function Gv(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Ap(n,e){let t=Ku(n.i,n.x,n.y),i=Ku(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Pf(n,e,t,i){let s=Ku(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function xo(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Ku(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Wv(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}var Ju=class{static triangulate(e,t,i=2){return Cv(e,t,i)}},Bn=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];Df(e),Lf(i,e);let o=e.length;t.forEach(Df);for(let c=0;c<t.length;c++)s.push(o),o+=t[c].length,Lf(i,t[c]);let a=Ju.triangulate(i,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function Df(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Lf(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var yi=class n extends Vt{constructor(e=new Tn([new de(.5,.5),new de(-.5,.5),new de(-.5,-.5),new de(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let a=0,c=e.length;a<c;a++){let l=e[a];o(l)}this.setAttribute("position",new ft(s,3)),this.setAttribute("uv",new ft(r,2)),this.computeVertexNormals();function o(a){let c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:f-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,S=t.UVGenerator!==void 0?t.UVGenerator:Xv,E,v=!1,w,b,A,_;if(g){E=g.getSpacedPoints(u),v=!0,d=!1;let se=g.isCatmullRomCurve3?g.closed:!1;w=g.computeFrenetFrames(u,se),b=new O,A=new O,_=new O}d||(m=0,f=0,p=0,x=0);let T=a.extractPoints(l),I=T.shape,P=T.holes;if(!Bn.isClockWise(I)){I=I.reverse();for(let se=0,ue=P.length;se<ue;se++){let he=P[se];Bn.isClockWise(he)&&(P[se]=he.reverse())}}function H(se){let he=10000000000000001e-36,Ee=se[0];for(let fe=1;fe<=se.length;fe++){let Oe=fe%se.length,Pe=se[Oe],Xe=Pe.x-Ee.x,je=Pe.y-Ee.y,N=Xe*Xe+je*je,dt=Math.max(Math.abs(Pe.x),Math.abs(Pe.y),Math.abs(Ee.x),Math.abs(Ee.y)),tt=he*dt*dt;if(N<=tt){se.splice(Oe,1),fe--;continue}Ee=Pe}}H(I),P.forEach(H);let F=P.length,L=I;for(let se=0;se<F;se++){let ue=P[se];I=I.concat(ue)}function $(se,ue,he){return ue||Ge("ExtrudeGeometry: vec does not exist"),se.clone().addScaledVector(ue,he)}let q=I.length;function z(se,ue,he){let Ee,fe,Oe,Pe=se.x-ue.x,Xe=se.y-ue.y,je=he.x-se.x,N=he.y-se.y,dt=Pe*Pe+Xe*Xe,tt=Pe*N-Xe*je;if(Math.abs(tt)>Number.EPSILON){let C=Math.sqrt(dt),y=Math.sqrt(je*je+N*N),k=ue.x-Xe/C,X=ue.y+Pe/C,Q=he.x-N/y,me=he.y+je/y,xe=((Q-k)*N-(me-X)*je)/(Pe*N-Xe*je);Ee=k+Pe*xe-se.x,fe=X+Xe*xe-se.y;let j=Ee*Ee+fe*fe;if(j<=2)return new de(Ee,fe);Oe=Math.sqrt(j/2)}else{let C=!1;Pe>Number.EPSILON?je>Number.EPSILON&&(C=!0):Pe<-Number.EPSILON?je<-Number.EPSILON&&(C=!0):Math.sign(Xe)===Math.sign(N)&&(C=!0),C?(Ee=-Xe,fe=Pe,Oe=Math.sqrt(dt)):(Ee=Pe,fe=Xe,Oe=Math.sqrt(dt/2))}return new de(Ee/Oe,fe/Oe)}let K=[];for(let se=0,ue=L.length,he=ue-1,Ee=se+1;se<ue;se++,he++,Ee++)he===ue&&(he=0),Ee===ue&&(Ee=0),K[se]=z(L[se],L[he],L[Ee]);let ce=[],V,te=K.concat();for(let se=0,ue=F;se<ue;se++){let he=P[se];V=[];for(let Ee=0,fe=he.length,Oe=fe-1,Pe=Ee+1;Ee<fe;Ee++,Oe++,Pe++)Oe===fe&&(Oe=0),Pe===fe&&(Pe=0),V[Ee]=z(he[Ee],he[Oe],he[Pe]);ce.push(V),te=te.concat(V)}let Me;if(m===0)Me=Bn.triangulateShape(L,P);else{let se=[],ue=[];for(let he=0;he<m;he++){let Ee=he/m,fe=f*Math.cos(Ee*Math.PI/2),Oe=p*Math.sin(Ee*Math.PI/2)+x;for(let Pe=0,Xe=L.length;Pe<Xe;Pe++){let je=$(L[Pe],K[Pe],Oe);Ie(je.x,je.y,-fe),Ee===0&&se.push(je)}for(let Pe=0,Xe=F;Pe<Xe;Pe++){let je=P[Pe];V=ce[Pe];let N=[];for(let dt=0,tt=je.length;dt<tt;dt++){let C=$(je[dt],V[dt],Oe);Ie(C.x,C.y,-fe),Ee===0&&N.push(C)}Ee===0&&ue.push(N)}}Me=Bn.triangulateShape(se,ue)}let Ye=Me.length,$e=p+x;for(let se=0;se<q;se++){let ue=d?$(I[se],te[se],$e):I[se];v?(A.copy(w.normals[0]).multiplyScalar(ue.x),b.copy(w.binormals[0]).multiplyScalar(ue.y),_.copy(E[0]).add(A).add(b),Ie(_.x,_.y,_.z)):Ie(ue.x,ue.y,0)}for(let se=1;se<=u;se++)for(let ue=0;ue<q;ue++){let he=d?$(I[ue],te[ue],$e):I[ue];v?(A.copy(w.normals[se]).multiplyScalar(he.x),b.copy(w.binormals[se]).multiplyScalar(he.y),_.copy(E[se]).add(A).add(b),Ie(_.x,_.y,_.z)):Ie(he.x,he.y,h/u*se)}for(let se=m-1;se>=0;se--){let ue=se/m,he=f*Math.cos(ue*Math.PI/2),Ee=p*Math.sin(ue*Math.PI/2)+x;for(let fe=0,Oe=L.length;fe<Oe;fe++){let Pe=$(L[fe],K[fe],Ee);Ie(Pe.x,Pe.y,h+he)}for(let fe=0,Oe=P.length;fe<Oe;fe++){let Pe=P[fe];V=ce[fe];for(let Xe=0,je=Pe.length;Xe<je;Xe++){let N=$(Pe[Xe],V[Xe],Ee);v?Ie(N.x,N.y+E[u-1].y,E[u-1].x+he):Ie(N.x,N.y,h+he)}}}ee(),pe();function ee(){let se=s.length/3;if(d){let ue=0,he=q*ue;for(let Ee=0;Ee<Ye;Ee++){let fe=Me[Ee];ke(fe[2]+he,fe[1]+he,fe[0]+he)}ue=u+m*2,he=q*ue;for(let Ee=0;Ee<Ye;Ee++){let fe=Me[Ee];ke(fe[0]+he,fe[1]+he,fe[2]+he)}}else{for(let ue=0;ue<Ye;ue++){let he=Me[ue];ke(he[2],he[1],he[0])}for(let ue=0;ue<Ye;ue++){let he=Me[ue];ke(he[0]+q*u,he[1]+q*u,he[2]+q*u)}}i.addGroup(se,s.length/3-se,0)}function pe(){let se=s.length/3,ue=0;le(L,ue),ue+=L.length;for(let he=0,Ee=P.length;he<Ee;he++){let fe=P[he];le(fe,ue),ue+=fe.length}i.addGroup(se,s.length/3-se,1)}function le(se,ue){let he=se.length;for(;--he>=0;){let Ee=he,fe=he-1;fe<0&&(fe=se.length-1);for(let Oe=0,Pe=u+m*2;Oe<Pe;Oe++){let Xe=q*Oe,je=q*(Oe+1),N=ue+Ee+Xe,dt=ue+fe+Xe,tt=ue+fe+je,C=ue+Ee+je;Ue(N,dt,tt,C)}}}function Ie(se,ue,he){c.push(se),c.push(ue),c.push(he)}function ke(se,ue,he){ct(se),ct(ue),ct(he);let Ee=s.length/3,fe=S.generateTopUV(i,s,Ee-3,Ee-2,Ee-1);ze(fe[0]),ze(fe[1]),ze(fe[2])}function Ue(se,ue,he,Ee){ct(se),ct(ue),ct(Ee),ct(ue),ct(he),ct(Ee);let fe=s.length/3,Oe=S.generateSideWallUV(i,s,fe-6,fe-3,fe-2,fe-1);ze(Oe[0]),ze(Oe[1]),ze(Oe[3]),ze(Oe[1]),ze(Oe[2]),ze(Oe[3])}function ct(se){s.push(c[se*3+0]),s.push(c[se*3+1]),s.push(c[se*3+2])}function ze(se){r.push(se.x),r.push(se.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return qv(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];i.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new ju[s.type]().fromJSON(s)),new n(i,e.options)}},Xv={generateTopUV:function(n,e,t,i,s){let r=e[t*3],o=e[t*3+1],a=e[i*3],c=e[i*3+1],l=e[s*3],u=e[s*3+1];return[new de(r,o),new de(a,c),new de(l,u)]},generateSideWallUV:function(n,e,t,i,s,r){let o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[i*3],u=e[i*3+1],h=e[i*3+2],d=e[s*3],f=e[s*3+1],p=e[s*3+2],x=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(a-u)<Math.abs(o-l)?[new de(o,1-c),new de(l,1-h),new de(d,1-p),new de(x,1-g)]:[new de(a,1-c),new de(u,1-h),new de(f,1-p),new de(m,1-g)]}};function qv(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var vo=class n extends Vt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),c=Math.floor(s),l=a+1,u=c+1,h=e/a,d=t/c,f=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let S=g*d-o;for(let E=0;E<l;E++){let v=E*h-r;p.push(v,-S,0),x.push(0,0,1),m.push(E/a),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let S=0;S<a;S++){let E=S+l*g,v=S+l*(g+1),w=S+1+l*(g+1),b=S+1+l*g;f.push(E,v,b),f.push(v,w,b)}this.setIndex(f),this.setAttribute("position",new ft(p,3)),this.setAttribute("normal",new ft(x,3)),this.setAttribute("uv",new ft(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},_o=class n extends Vt{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);let a=[],c=[],l=[],u=[],h=e,d=(t-e)/s,f=new O,p=new de;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let g=r+m/i*o;f.x=h*Math.cos(g),f.y=h*Math.sin(g),c.push(f.x,f.y,f.z),l.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,u.push(p.x,p.y)}h+=d}for(let x=0;x<s;x++){let m=x*(i+1);for(let g=0;g<i;g++){let S=g+m,E=S,v=S+i+1,w=S+i+2,b=S+1;a.push(E,v,b),a.push(v,w,b)}}this.setIndex(a),this.setAttribute("position",new ft(c,3)),this.setAttribute("normal",new ft(l,3)),this.setAttribute("uv",new ft(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},ws=class n extends Vt{constructor(e=new Tn([new de(0,.5),new de(-.5,-.5),new de(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],s=[],r=[],o=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(i),this.setAttribute("position",new ft(s,3)),this.setAttribute("normal",new ft(r,3)),this.setAttribute("uv",new ft(o,2));function l(u){let h=s.length/3,d=u.extractPoints(t),f=d.shape,p=d.holes;Bn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,g=p.length;m<g;m++){let S=p[m];Bn.isClockWise(S)===!0&&(p[m]=S.reverse())}let x=Bn.triangulateShape(f,p);for(let m=0,g=p.length;m<g;m++){let S=p[m];f=f.concat(S)}for(let m=0,g=f.length;m<g;m++){let S=f[m];s.push(S.x,S.y,0),r.push(0,0,1),o.push(S.x,S.y)}for(let m=0,g=x.length;m<g;m++){let S=x[m],E=S[0]+h,v=S[1]+h,w=S[2]+h;i.push(E,v,w),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Yv(t,e)}static fromJSON(e,t){let i=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];i.push(o)}return new n(i,e.curveSegments)}};function Yv(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}var bi=class n extends Vt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new O,d=new O,f=[],p=[],x=[],m=[];for(let g=0;g<=i;g++){let S=[],E=g/i,v=o+E*a,w=e*Math.cos(v),b=Math.sqrt(e*e-w*w),A=0;g===0&&o===0?A=.5/t:g===i&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){let T=_/t,I=s+T*r;h.x=-b*Math.cos(I),h.y=w,h.z=b*Math.sin(I),p.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(T+A,1-E),S.push(l++)}u.push(S)}for(let g=0;g<i;g++)for(let S=0;S<t;S++){let E=u[g][S+1],v=u[g][S],w=u[g+1][S],b=u[g+1][S+1];(g!==0||o>0)&&f.push(E,v,b),(g!==i-1||c<Math.PI)&&f.push(v,w,b)}this.setIndex(f),this.setAttribute("position",new ft(p,3)),this.setAttribute("normal",new ft(x,3)),this.setAttribute("uv",new ft(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ds(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(Of(s))s.isRenderTargetTexture?(Ve("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(Of(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function an(n){let e={};for(let t=0;t<n.length;t++){let i=Ds(n[t]);for(let s in i)e[s]=i[s]}return e}function Of(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function $v(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Th(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:at.workingColorSpace}var Cp={clone:Ds,merge:an},jv=\`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}\`,Zv=\`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}\`,tn=class extends Wi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jv,this.fragmentShader=Zv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ds(e.uniforms),this.uniformsGroups=$v(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new We().setHex(s.value);break;case"v2":this.uniforms[i].value=new de().fromArray(s.value);break;case"v3":this.uniforms[i].value=new O().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Rt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Ze().fromArray(s.value);break;case"m4":this.uniforms[i].value=new wt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},fc=class extends tn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},An=class extends Wi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new We(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new We(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=pl,this.normalScale=new de(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},yo=class extends An{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new de(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return et(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new We(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new We(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new We(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var pc=class extends Wi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=hp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},mc=class extends Wi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Va(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}var Xi=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},gc=class extends Xi{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wu,endingEnd:Wu}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xu:r=e,a=2*t-i;break;case qu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Xu:o=e,c=2*i-t;break;case qu:o=1,c=i+s[1]-s[0];break;default:o=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(i-t)/(s-t),x=p*p,m=x*p,g=-d*m+2*d*x-d*p,S=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*p+1,E=(-1-f)*m+(1.5+f)*x+.5*p,v=f*m-f*x;for(let w=0;w!==a;++w)r[w]=g*o[u+w]+S*o[l+w]+E*o[c+w]+v*o[h+w];return r}},xc=class extends Xi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[l+d]*h+o[c+d]*u;return r}},vc=class extends Xi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},_c=class extends Xi{interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(i-t)/(s-t),x=1-p;for(let m=0;m!==a;++m)r[m]=o[l+m]*x+o[c+m]*p;return r}let d=a*2,f=e-1;for(let p=0;p!==a;++p){let x=o[l+p],m=o[c+p],g=f*d+p*2,S=h[g],E=h[g+1],v=e*d+p*2,w=u[v],b=u[v+1],A=(i-t)/(s-t),_,T,I,P,D;for(let H=0;H<8;H++){_=A*A,T=_*A,I=1-A,P=I*I,D=P*I;let L=D*t+3*P*A*S+3*I*_*w+T*s-i;if(Math.abs(L)<1e-10)break;let $=3*P*(S-t)+6*I*A*(w-S)+3*_*(s-w);if(Math.abs($)<1e-10)break;A=A-L/$,A=Math.max(0,Math.min(1,A))}r[p]=D*x+3*P*A*E+3*I*_*b+T*m}return r}},Cn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Va(t,this.TimeBufferType),this.values=Va(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Va(e.times,Array),values:Va(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new vc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new xc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new gc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new _c(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Qr:t=this.InterpolantFactoryMethodDiscrete;break;case nc:t=this.InterpolantFactoryMethodLinear;break;case Xa:t=this.InterpolantFactoryMethodSmooth;break;case Gu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ve("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Qr;case this.InterpolantFactoryMethodLinear:return nc;case this.InterpolantFactoryMethodSmooth:return Xa;case this.InterpolantFactoryMethodBezier:return Gu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ge("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Ge("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){Ge("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){Ge("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&zx(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){Ge("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Xa,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{let h=a*i,d=h-i,f=h+i;for(let p=0;p!==i;++p){let x=t[h+p];if(x!==t[d+p]||x!==t[f+p]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Cn.prototype.ValueTypeName="";Cn.prototype.TimeBufferType=Float32Array;Cn.prototype.ValueBufferType=Float32Array;Cn.prototype.DefaultInterpolation=nc;var qi=class extends Cn{constructor(e,t,i){super(e,t,i)}};qi.prototype.ValueTypeName="bool";qi.prototype.ValueBufferType=Array;qi.prototype.DefaultInterpolation=Qr;qi.prototype.InterpolantFactoryMethodLinear=void 0;qi.prototype.InterpolantFactoryMethodSmooth=void 0;var yc=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};yc.prototype.ValueTypeName="color";var bc=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};bc.prototype.ValueTypeName="number";var Mc=class extends Xi{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(s-t),l=e*a;for(let u=l+a;l!==u;l+=4)Sn.slerpFlat(r,0,o,l-a,o,l,c);return r}},bo=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Mc(this.times,this.values,this.getValueSize(),e)}};bo.prototype.ValueTypeName="quaternion";bo.prototype.InterpolantFactoryMethodSmooth=void 0;var Yi=class extends Cn{constructor(e,t,i){super(e,t,i)}};Yi.prototype.ValueTypeName="string";Yi.prototype.ValueBufferType=Array;Yi.prototype.DefaultInterpolation=Qr;Yi.prototype.InterpolantFactoryMethodLinear=void 0;Yi.prototype.InterpolantFactoryMethodSmooth=void 0;var Sc=class extends Cn{constructor(e,t,i,s){super(e,t,i,s)}};Sc.prototype.ValueTypeName="vector";var Ec=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){let f=l[h],p=l[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Rp=new Ec,wc=class{constructor(e){this.manager=e!==void 0?e:Rp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};wc.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ts=class extends Bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new We(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Mo=class extends Ts{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new We(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Vu=new wt,Nf=new O,Ff=new O,Tc=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new de(512,512),this.mapType=on,this.map=null,this.mapPass=null,this.matrix=new wt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hr,this._frameExtents=new de(1,1),this._viewportCount=1,this._viewports=[new Rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Nf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Nf),Ff.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ff),t.updateMatrixWorld(),Vu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vu,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===rr||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Vu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ga=new O,Wa=new Sn,Jn=new O,As=class extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new wt,this.projectionMatrix=new wt,this.projectionMatrixInverse=new wt,this.coordinateSystem=Wn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ga,Wa,Jn),Jn.x===1&&Jn.y===1&&Jn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ga,Wa,Jn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Ga,Wa,Jn),Jn.x===1&&Jn.y===1&&Jn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ga,Wa,Jn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Hi=new O,Uf=new de,Bf=new de,Qt=class extends As{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ms*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(jr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ms*2*Math.atan(Math.tan(jr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Hi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Hi.x,Hi.y).multiplyScalar(-e/Hi.z),Hi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Hi.x,Hi.y).multiplyScalar(-e/Hi.z)}getViewSize(e,t){return this.getViewBounds(e,Uf,Bf),t.subVectors(Bf,Uf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(jr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*i/l,s*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Qu=class extends Tc{constructor(){super(new Qt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=Ms*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},So=class extends Ts{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Qu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}};var $i=class extends As{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},eh=class extends Tc{constructor(){super(new $i(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},pr=class extends Ts{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new eh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Eo=class extends Ts{constructor(e,t,i=10,s=10){super(e,t),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=i,this.height=s}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}};var tr=-90,nr=1,Ac=class extends Bt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Qt(tr,nr,e,t);s.layers=this.layers,this.add(s);let r=new Qt(tr,nr,e,t);r.layers=this.layers,this.add(r);let o=new Qt(tr,nr,e,t);o.layers=this.layers,this.add(o);let a=new Qt(tr,nr,e,t);a.layers=this.layers,this.add(a);let c=new Qt(tr,nr,e,t);c.layers=this.layers,this.add(c);let l=new Qt(tr,nr,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===Wn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===rr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},Cc=class extends Qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ah="\\\\[\\\\]\\\\.:\\\\/",Kv=new RegExp("["+Ah+"]","g"),Ch="[^"+Ah+"]",Jv="[^"+Ah.replace("\\\\.","")+"]",Qv=/((?:WC+[\\/:])*)/.source.replace("WC",Ch),e_=/(WCOD+)?/.source.replace("WCOD",Jv),t_=/(?:\\.(WC+)(?:\\[(.+)\\])?)?/.source.replace("WC",Ch),n_=/\\.(WC+)(?:\\[(.+)\\])?/.source.replace("WC",Ch),i_=new RegExp("^"+Qv+e_+t_+n_+"$"),s_=["material","materials","bones","map"],th=class{constructor(e,t,i){let s=i||Et.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Et=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\\s/g,"_").replace(Kv,"")}static parseTrackName(e){let t=i_.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);s_.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=i(a.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ve("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ge("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ge("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ge("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){Ge("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){Ge("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;Ge("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Et.Composite=th;Et.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Et.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Et.prototype.GetterByBindingType=[Et.prototype._getValue_direct,Et.prototype._getValue_array,Et.prototype._getValue_arrayElement,Et.prototype._getValue_toArray];Et.prototype.SetterByBindingTypeAndVersioning=[[Et.prototype._setValue_direct,Et.prototype._setValue_direct_setNeedsUpdate,Et.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Et.prototype._setValue_array,Et.prototype._setValue_array_setNeedsUpdate,Et.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Et.prototype._setValue_arrayElement,Et.prototype._setValue_arrayElement_setNeedsUpdate,Et.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Et.prototype._setValue_fromArray,Et.prototype._setValue_fromArray_setNeedsUpdate,Et.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var F1=new Float32Array(1);var kf=new wt,Cs=class{constructor(e,t,i=0,s=1/0){this.ray=new Ss(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new cr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ge("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return kf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(kf),this}intersectObject(e,t=!0,i=[]){return nh(e,this,i,t),i.sort(zf),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)nh(e[s],this,i,t);return i.sort(zf),i}};function zf(n,e){return n.distance-e.distance}function nh(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)nh(r[o],e,t,!0)}}var mr=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=et(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(et(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ih=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};var wo=class extends Xn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Ve("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Rh(n,e,t,i){let s=r_(i);switch(t){case _h:return n*e;case bh:return n*e/s.components*s.byteLength;case Nc:return n*e/s.components*s.byteLength;case Qi:return n*e*2/s.components*s.byteLength;case Fc:return n*e*2/s.components*s.byteLength;case yh:return n*e*3/s.components*s.byteLength;case gn:return n*e*4/s.components*s.byteLength;case Uc:return n*e*4/s.components*s.byteLength;case Co:case Ro:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Io:case Po:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case kc:case Hc:return Math.max(n,16)*Math.max(e,8)/4;case Bc:case zc:return Math.max(n,8)*Math.max(e,8)/2;case Vc:case Gc:case Xc:case qc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Wc:case Do:case Yc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $c:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case jc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Zc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Kc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Jc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Qc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case el:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case tl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case nl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case il:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case sl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case rl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case ol:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case al:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case cl:case ll:case ul:return Math.ceil(n/4)*Math.ceil(e/4)*16;case hl:case dl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Lo:case fl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(\`Unable to determine texture byte length for \${t} format.\`)}function r_(n){switch(n){case on:case mh:return{byteLength:1,components:1};case vr:case gh:case ri:return{byteLength:2,components:1};case Lc:case Oc:return{byteLength:2,components:4};case qn:case Dc:case Yn:return{byteLength:4,components:1};case xh:case vh:return{byteLength:4,components:3}}throw new Error(\`THREE.TextureUtils: Unknown texture type \${n}.\`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Ve("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function Jp(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function a_(n){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,d=n.createBuffer();n.bindBuffer(c,d),n.bufferData(c,l,u),a.onUploadCallback();let f;if(l instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=n.SHORT;else if(l instanceof Uint32Array)f=n.UNSIGNED_INT;else if(l instanceof Int32Array)f=n.INT;else if(l instanceof Int8Array)f=n.BYTE;else if(l instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,c,l){let u=c.array,h=c.updateRanges;if(n.bindBuffer(l,a),h.length===0)n.bufferSubData(l,0,u);else{h.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<h.length;f++){let p=h[d],x=h[f];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++d,h[d]=x)}h.length=d+1;for(let f=0,p=h.length;f<p;f++){let x=h[f];n.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var c_=\`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif\`,l_=\`#ifdef USE_ALPHAHASH
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
#endif\`,u_=\`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif\`,h_=\`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif\`,d_=\`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif\`,f_=\`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif\`,p_=\`#ifdef USE_AOMAP
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
#endif\`,m_=\`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif\`,g_=\`#ifdef USE_BATCHING
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
#endif\`,x_=\`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif\`,v_=\`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif\`,__=\`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif\`,y_=\`float G_BlinnPhong_Implicit( ) {
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
} // validated\`,b_=\`#ifdef USE_IRIDESCENCE
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
#endif\`,M_=\`#ifdef USE_BUMPMAP
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
#endif\`,S_=\`#if NUM_CLIPPING_PLANES > 0
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
#endif\`,E_=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif\`,w_=\`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif\`,T_=\`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif\`,A_=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif\`,C_=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif\`,R_=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif\`,I_=\`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif\`,P_=\`#define PI 3.141592653589793
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
} // validated\`,D_=\`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif\`,L_=\`vec3 transformedNormal = objectNormal;
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
#endif\`,O_=\`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif\`,N_=\`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif\`,F_=\`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif\`,U_=\`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif\`,B_="gl_FragColor = linearToOutputTexel( gl_FragColor );",k_=\`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}\`,z_=\`#ifdef USE_ENVMAP
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
#endif\`,H_=\`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif\`,V_=\`#ifdef USE_ENVMAP
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
#endif\`,G_=\`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif\`,W_=\`#ifdef USE_ENVMAP
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
#endif\`,X_=\`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif\`,q_=\`#ifdef USE_FOG
	varying float vFogDepth;
#endif\`,Y_=\`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif\`,$_=\`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif\`,j_=\`#ifdef USE_GRADIENTMAP
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
}\`,Z_=\`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif\`,K_=\`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;\`,J_=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert\`,Q_=\`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>\`,ey=\`#ifdef USE_ENVMAP
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
#endif\`,ty=\`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;\`,ny=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon\`,iy=\`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;\`,sy=\`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong\`,ry=\`PhysicalMaterial material;
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
#endif\`,oy=\`uniform sampler2D dfgLUT;
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
}\`,ay=\`
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
#endif\`,cy=\`#if defined( RE_IndirectDiffuse )
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
#endif\`,ly=\`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif\`,uy=\`#ifdef USE_LIGHT_PROBES_GRID
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
#endif\`,hy=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif\`,dy=\`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,fy=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif\`,py=\`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif\`,my=\`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif\`,gy=\`#ifdef USE_MAP
	uniform sampler2D map;
#endif\`,xy=\`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif\`,vy=\`#if defined( USE_POINTS_UV )
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
#endif\`,_y=\`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif\`,yy=\`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif\`,by=\`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif\`,My=\`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif\`,Sy=\`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,Ey=\`#ifdef USE_MORPHTARGETS
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
#endif\`,wy=\`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif\`,Ty=\`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;\`,Ay=\`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif\`,Cy=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,Ry=\`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif\`,Iy=\`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif\`,Py=\`#ifdef USE_NORMALMAP
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
#endif\`,Dy=\`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif\`,Ly=\`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif\`,Oy=\`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif\`,Ny=\`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif\`,Fy=\`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );\`,Uy=\`vec3 packNormalToRGB( const in vec3 normal ) {
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
}\`,By=\`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif\`,ky=\`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;\`,zy=\`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif\`,Hy=\`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif\`,Vy=\`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif\`,Gy=\`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif\`,Wy=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,Xy=\`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif\`,qy=\`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif\`,Yy=\`float getShadowMask() {
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
}\`,$y=\`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif\`,jy=\`#ifdef USE_SKINNING
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
#endif\`,Zy=\`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif\`,Ky=\`#ifdef USE_SKINNING
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
#endif\`,Jy=\`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif\`,Qy=\`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif\`,eb=\`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif\`,tb=\`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }\`,nb=\`#ifdef USE_TRANSMISSION
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
#endif\`,ib=\`#ifdef USE_TRANSMISSION
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
#endif\`,sb=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,rb=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,ob=\`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif\`,ab=\`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif\`,cb=\`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}\`,lb=\`uniform sampler2D t2D;
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
}\`,ub=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,hb=\`#ifdef ENVMAP_TYPE_CUBE
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
}\`,db=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}\`,fb=\`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,pb=\`#include <common>
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
}\`,mb=\`#if DEPTH_PACKING == 3200
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
}\`,gb=\`#define DISTANCE
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
}\`,xb=\`#define DISTANCE
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
}\`,vb=\`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}\`,_b=\`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}\`,yb=\`uniform float scale;
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
}\`,bb=\`uniform vec3 diffuse;
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
}\`,Mb=\`#include <common>
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
}\`,Sb=\`uniform vec3 diffuse;
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
}\`,Eb=\`#define LAMBERT
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
}\`,wb=\`#define LAMBERT
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
}\`,Tb=\`#define MATCAP
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
}\`,Ab=\`#define MATCAP
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
}\`,Cb=\`#define NORMAL
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
}\`,Rb=\`#define NORMAL
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
}\`,Ib=\`#define PHONG
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
}\`,Pb=\`#define PHONG
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
}\`,Db=\`#define STANDARD
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
}\`,Lb=\`#define STANDARD
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
}\`,Ob=\`#define TOON
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
}\`,Nb=\`#define TOON
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
}\`,Fb=\`uniform float size;
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
}\`,Ub=\`uniform vec3 diffuse;
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
}\`,Bb=\`#include <common>
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
}\`,kb=\`uniform vec3 color;
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
}\`,zb=\`uniform float rotation;
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
}\`,Hb=\`uniform vec3 diffuse;
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
}\`,Qe={alphahash_fragment:c_,alphahash_pars_fragment:l_,alphamap_fragment:u_,alphamap_pars_fragment:h_,alphatest_fragment:d_,alphatest_pars_fragment:f_,aomap_fragment:p_,aomap_pars_fragment:m_,batching_pars_vertex:g_,batching_vertex:x_,begin_vertex:v_,beginnormal_vertex:__,bsdfs:y_,iridescence_fragment:b_,bumpmap_pars_fragment:M_,clipping_planes_fragment:S_,clipping_planes_pars_fragment:E_,clipping_planes_pars_vertex:w_,clipping_planes_vertex:T_,color_fragment:A_,color_pars_fragment:C_,color_pars_vertex:R_,color_vertex:I_,common:P_,cube_uv_reflection_fragment:D_,defaultnormal_vertex:L_,displacementmap_pars_vertex:O_,displacementmap_vertex:N_,emissivemap_fragment:F_,emissivemap_pars_fragment:U_,colorspace_fragment:B_,colorspace_pars_fragment:k_,envmap_fragment:z_,envmap_common_pars_fragment:H_,envmap_pars_fragment:V_,envmap_pars_vertex:G_,envmap_physical_pars_fragment:ey,envmap_vertex:W_,fog_vertex:X_,fog_pars_vertex:q_,fog_fragment:Y_,fog_pars_fragment:$_,gradientmap_pars_fragment:j_,lightmap_pars_fragment:Z_,lights_lambert_fragment:K_,lights_lambert_pars_fragment:J_,lights_pars_begin:Q_,lights_toon_fragment:ty,lights_toon_pars_fragment:ny,lights_phong_fragment:iy,lights_phong_pars_fragment:sy,lights_physical_fragment:ry,lights_physical_pars_fragment:oy,lights_fragment_begin:ay,lights_fragment_maps:cy,lights_fragment_end:ly,lightprobes_pars_fragment:uy,logdepthbuf_fragment:hy,logdepthbuf_pars_fragment:dy,logdepthbuf_pars_vertex:fy,logdepthbuf_vertex:py,map_fragment:my,map_pars_fragment:gy,map_particle_fragment:xy,map_particle_pars_fragment:vy,metalnessmap_fragment:_y,metalnessmap_pars_fragment:yy,morphinstance_vertex:by,morphcolor_vertex:My,morphnormal_vertex:Sy,morphtarget_pars_vertex:Ey,morphtarget_vertex:wy,normal_fragment_begin:Ty,normal_fragment_maps:Ay,normal_pars_fragment:Cy,normal_pars_vertex:Ry,normal_vertex:Iy,normalmap_pars_fragment:Py,clearcoat_normal_fragment_begin:Dy,clearcoat_normal_fragment_maps:Ly,clearcoat_pars_fragment:Oy,iridescence_pars_fragment:Ny,opaque_fragment:Fy,packing:Uy,premultiplied_alpha_fragment:By,project_vertex:ky,dithering_fragment:zy,dithering_pars_fragment:Hy,roughnessmap_fragment:Vy,roughnessmap_pars_fragment:Gy,shadowmap_pars_fragment:Wy,shadowmap_pars_vertex:Xy,shadowmap_vertex:qy,shadowmask_pars_fragment:Yy,skinbase_vertex:$y,skinning_pars_vertex:jy,skinning_vertex:Zy,skinnormal_vertex:Ky,specularmap_fragment:Jy,specularmap_pars_fragment:Qy,tonemapping_fragment:eb,tonemapping_pars_fragment:tb,transmission_fragment:nb,transmission_pars_fragment:ib,uv_pars_fragment:sb,uv_pars_vertex:rb,uv_vertex:ob,worldpos_vertex:ab,background_vert:cb,background_frag:lb,backgroundCube_vert:ub,backgroundCube_frag:hb,cube_vert:db,cube_frag:fb,depth_vert:pb,depth_frag:mb,distance_vert:gb,distance_frag:xb,equirect_vert:vb,equirect_frag:_b,linedashed_vert:yb,linedashed_frag:bb,meshbasic_vert:Mb,meshbasic_frag:Sb,meshlambert_vert:Eb,meshlambert_frag:wb,meshmatcap_vert:Tb,meshmatcap_frag:Ab,meshnormal_vert:Cb,meshnormal_frag:Rb,meshphong_vert:Ib,meshphong_frag:Pb,meshphysical_vert:Db,meshphysical_frag:Lb,meshtoon_vert:Ob,meshtoon_frag:Nb,points_vert:Fb,points_frag:Ub,shadow_vert:Bb,shadow_frag:kb,sprite_vert:zb,sprite_frag:Hb},we={common:{diffuse:{value:new We(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ze}},envmap:{envMap:{value:null},envMapRotation:{value:new Ze},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ze},normalScale:{value:new de(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new We(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new We(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0},uvTransform:{value:new Ze}},sprite:{diffuse:{value:new We(16777215)},opacity:{value:1},center:{value:new de(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}}},ai={basic:{uniforms:an([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:an([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new We(0)},envMapIntensity:{value:1}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:an([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new We(0)},specular:{value:new We(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:an([we.common,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.roughnessmap,we.metalnessmap,we.fog,we.lights,{emissive:{value:new We(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:an([we.common,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.gradientmap,we.fog,we.lights,{emissive:{value:new We(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:an([we.common,we.bumpmap,we.normalmap,we.displacementmap,we.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:an([we.points,we.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:an([we.common,we.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:an([we.common,we.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:an([we.common,we.bumpmap,we.normalmap,we.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:an([we.sprite,we.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distance:{uniforms:an([we.common,we.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distance_vert,fragmentShader:Qe.distance_frag},shadow:{uniforms:an([we.lights,we.fog,{color:{value:new We(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};ai.physical={uniforms:an([ai.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ze},clearcoatNormalScale:{value:new de(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ze},sheen:{value:0},sheenColor:{value:new We(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ze},transmissionSamplerSize:{value:new de},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ze},attenuationDistance:{value:0},attenuationColor:{value:new We(0)},specularColor:{value:new We(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ze},anisotropyVector:{value:new de},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ze}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var xl={r:0,b:0,g:0},Vb=new wt,Qp=new Ze;Qp.set(-1,0,0,0,1,0,0,0,1);function Gb(n,e,t,i,s,r){let o=new We(0),a=s===!0?0:1,c,l,u=null,h=0,d=null;function f(S){let E=S.isScene===!0?S.background:null;if(E&&E.isTexture){let v=S.backgroundBlurriness>0;E=e.get(E,v)}return E}function p(S){let E=!1,v=f(S);v===null?m(o,a):v&&v.isColor&&(m(v,1),E=!0);let w=n.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(S,E){let v=f(E);v&&(v.isCubeTexture||v.mapping===To)?(l===void 0&&(l=new Je(new Wt(1,1,1),new tn({name:"BackgroundCubeMaterial",uniforms:Ds(ai.backgroundCube.uniforms),vertexShader:ai.backgroundCube.vertexShader,fragmentShader:ai.backgroundCube.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(w,b,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Vb.makeRotationFromEuler(E.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Qp),l.material.toneMapped=at.getTransfer(v.colorSpace)!==mt,(u!==v||h!==v.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,u=v,h=v.version,d=n.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Je(new vo(2,2),new tn({name:"BackgroundMaterial",uniforms:Ds(ai.background.uniforms),vertexShader:ai.background.vertexShader,fragmentShader:ai.background.fragmentShader,side:pn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=at.getTransfer(v.colorSpace)!==mt,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||h!==v.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,u=v,h=v.version,d=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function m(S,E){S.getRGB(xl,Th(n)),t.buffers.color.setClear(xl.r,xl.g,xl.b,E,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(S,E=1){o.set(S),a=E,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(S){a=S,m(o,a)},render:p,addToRenderList:x,dispose:g}}function Wb(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,o=!1;function a(P,D,H,F,L){let $=!1,q=h(P,F,H,D);r!==q&&(r=q,l(r.object)),$=f(P,F,H,L),$&&p(P,F,H,L),L!==null&&e.update(L,n.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,v(P,D,H,F),L!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(L).buffer))}function c(){return n.createVertexArray()}function l(P){return n.bindVertexArray(P)}function u(P){return n.deleteVertexArray(P)}function h(P,D,H,F){let L=F.wireframe===!0,$=i[D.id];$===void 0&&($={},i[D.id]=$);let q=P.isInstancedMesh===!0?P.id:0,z=$[q];z===void 0&&(z={},$[q]=z);let K=z[H.id];K===void 0&&(K={},z[H.id]=K);let ce=K[L];return ce===void 0&&(ce=d(c()),K[L]=ce),ce}function d(P){let D=[],H=[],F=[];for(let L=0;L<t;L++)D[L]=0,H[L]=0,F[L]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:H,attributeDivisors:F,object:P,attributes:{},index:null}}function f(P,D,H,F){let L=r.attributes,$=D.attributes,q=0,z=H.getAttributes();for(let K in z)if(z[K].location>=0){let V=L[K],te=$[K];if(te===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(te=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(te=P.instanceColor)),V===void 0||V.attribute!==te||te&&V.data!==te.data)return!0;q++}return r.attributesNum!==q||r.index!==F}function p(P,D,H,F){let L={},$=D.attributes,q=0,z=H.getAttributes();for(let K in z)if(z[K].location>=0){let V=$[K];V===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(V=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(V=P.instanceColor));let te={};te.attribute=V,V&&V.data&&(te.data=V.data),L[K]=te,q++}r.attributes=L,r.attributesNum=q,r.index=F}function x(){let P=r.newAttributes;for(let D=0,H=P.length;D<H;D++)P[D]=0}function m(P){g(P,0)}function g(P,D){let H=r.newAttributes,F=r.enabledAttributes,L=r.attributeDivisors;H[P]=1,F[P]===0&&(n.enableVertexAttribArray(P),F[P]=1),L[P]!==D&&(n.vertexAttribDivisor(P,D),L[P]=D)}function S(){let P=r.newAttributes,D=r.enabledAttributes;for(let H=0,F=D.length;H<F;H++)D[H]!==P[H]&&(n.disableVertexAttribArray(H),D[H]=0)}function E(P,D,H,F,L,$,q){q===!0?n.vertexAttribIPointer(P,D,H,L,$):n.vertexAttribPointer(P,D,H,F,L,$)}function v(P,D,H,F){x();let L=F.attributes,$=H.getAttributes(),q=D.defaultAttributeValues;for(let z in $){let K=$[z];if(K.location>=0){let ce=L[z];if(ce===void 0&&(z==="instanceMatrix"&&P.instanceMatrix&&(ce=P.instanceMatrix),z==="instanceColor"&&P.instanceColor&&(ce=P.instanceColor)),ce!==void 0){let V=ce.normalized,te=ce.itemSize,Me=e.get(ce);if(Me===void 0)continue;let Ye=Me.buffer,$e=Me.type,ee=Me.bytesPerElement,pe=$e===n.INT||$e===n.UNSIGNED_INT||ce.gpuType===Dc;if(ce.isInterleavedBufferAttribute){let le=ce.data,Ie=le.stride,ke=ce.offset;if(le.isInstancedInterleavedBuffer){for(let Ue=0;Ue<K.locationSize;Ue++)g(K.location+Ue,le.meshPerAttribute);P.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Ue=0;Ue<K.locationSize;Ue++)m(K.location+Ue);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let Ue=0;Ue<K.locationSize;Ue++)E(K.location+Ue,te/K.locationSize,$e,V,Ie*ee,(ke+te/K.locationSize*Ue)*ee,pe)}else{if(ce.isInstancedBufferAttribute){for(let le=0;le<K.locationSize;le++)g(K.location+le,ce.meshPerAttribute);P.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let le=0;le<K.locationSize;le++)m(K.location+le);n.bindBuffer(n.ARRAY_BUFFER,Ye);for(let le=0;le<K.locationSize;le++)E(K.location+le,te/K.locationSize,$e,V,te*ee,te/K.locationSize*le*ee,pe)}}else if(q!==void 0){let V=q[z];if(V!==void 0)switch(V.length){case 2:n.vertexAttrib2fv(K.location,V);break;case 3:n.vertexAttrib3fv(K.location,V);break;case 4:n.vertexAttrib4fv(K.location,V);break;default:n.vertexAttrib1fv(K.location,V)}}}}S()}function w(){T();for(let P in i){let D=i[P];for(let H in D){let F=D[H];for(let L in F){let $=F[L];for(let q in $)u($[q].object),delete $[q];delete F[L]}}delete i[P]}}function b(P){if(i[P.id]===void 0)return;let D=i[P.id];for(let H in D){let F=D[H];for(let L in F){let $=F[L];for(let q in $)u($[q].object),delete $[q];delete F[L]}}delete i[P.id]}function A(P){for(let D in i){let H=i[D];for(let F in H){let L=H[F];if(L[P.id]===void 0)continue;let $=L[P.id];for(let q in $)u($[q].object),delete $[q];delete L[P.id]}}}function _(P){for(let D in i){let H=i[D],F=P.isInstancedMesh===!0?P.id:0,L=H[F];if(L!==void 0){for(let $ in L){let q=L[$];for(let z in q)u(q[z].object),delete q[z];delete L[$]}delete H[F],Object.keys(H).length===0&&delete i[D]}}}function T(){I(),o=!0,r!==s&&(r=s,l(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:T,resetDefaultState:I,dispose:w,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:x,enableAttribute:m,disableUnusedAttributes:S}}function Xb(n,e,t){let i;function s(c){i=c}function r(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function o(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function a(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let d=0;for(let f=0;f<u;f++)d+=l[f];t.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function qb(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==gn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let _=A===ri&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==on&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Yn&&!_)}function c(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(Ve("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Ve("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:S,maxVaryings:E,maxFragmentUniforms:v,maxSamples:w,samples:b}}function Yb(n){let e=this,t=null,i=0,s=!1,r=!1,o=new Un,a=new Ze,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||s;return s=d,i=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let p=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,g=n.get(h);if(!s||p===null||p.length===0||r&&!m)r?u(null):l();else{let S=r?0:i,E=S*4,v=g.clippingState||null;c.value=v,v=u(p,d,E,f);for(let w=0;w!==E;++w)v[w]=t[w];g.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=S}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,p){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,p!==!0||m===null){let g=f+x*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<g)&&(m=new Float32Array(g));for(let E=0,v=f;E!==x;++E,v+=4)o.copy(h[E]).applyMatrix4(S,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var es=4,Ip=[.125,.215,.35,.446,.526,.582],Ls=20,$b=256,Oo=new $i,Pp=new We,Ih=null,Ph=0,Dh=0,Lh=!1,jb=new O,_l=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:o=256,position:a=jb}=r;Ih=this._renderer.getRenderTarget(),Ph=this._renderer.getActiveCubeFace(),Dh=this._renderer.getActiveMipmapLevel(),Lh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Op(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Lp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ih,Ph,Dh),this._renderer.xr.enabled=Lh,e.scissorTest=!1,yr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ki||e.mapping===Is?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ih=this._renderer.getRenderTarget(),Ph=this._renderer.getActiveCubeFace(),Dh=this._renderer.getActiveMipmapLevel(),Lh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:ri,format:gn,colorSpace:eo,depthBuffer:!1},s=Dp(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dp(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Zb(r)),this._blurMaterial=Jb(r,e,t),this._ggxMaterial=Kb(r,e,t)}return s}_compileMaterial(e){let t=new Je(new Vt,e);this._renderer.compile(t,Oo)}_sceneToCubeUV(e,t,i,s,r){let c=new Qt(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Pp),h.toneMapping=Rn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Je(new Wt,new Gt({name:"PMREM.Background",side:dn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,g=!1,S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,g=!0):(m.color.copy(Pp),g=!0);for(let E=0;E<6;E++){let v=E%3;v===0?(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[E],r.y,r.z)):v===1?(c.up.set(0,0,l[E]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[E],r.z)):(c.up.set(0,l[E],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[E]));let w=this._cubeSize;yr(s,v*w,E>2?w:0,w,w),h.setRenderTarget(s),g&&h.render(x,c),h.render(e,c)}h.toneMapping=f,h.autoClear=d,e.background=S}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Ki||e.mapping===Is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Op()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Lp());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;yr(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,Oo)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let c=o.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-u*u),d=0+l*1.25,f=h*d,{_lodMax:p}=this,x=this._sizeLods[i],m=3*x*(i>p-es?i-p+es:0),g=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=p-t,yr(r,m,g,3*x,2*x),s.setRenderTarget(r),s.render(a,Oo),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=p-i,yr(e,m,g,3*x,2*x),s.setRenderTarget(e),s.render(a,Oo)}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Ge("blur direction must be either latitudinal or longitudinal!");let u=3,h=this._lodMeshes[s];h.material=l;let d=l.uniforms,f=this._sizeLods[i]-1,p=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Ls-1),x=r/p,m=isFinite(r)?1+Math.floor(u*x):Ls;m>Ls&&Ve(\`sigmaRadians, \${r}, is too large and will clip, as it requested \${m} samples when the maximum is set to \${Ls}\`);let g=[],S=0;for(let A=0;A<Ls;++A){let _=A/x,T=Math.exp(-_*_/2);g.push(T),A===0?S+=T:A<m&&(S+=2*T)}for(let A=0;A<g.length;A++)g[A]=g[A]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=g,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:E}=this;d.dTheta.value=p,d.mipInt.value=E-i;let v=this._sizeLods[s],w=3*v*(s>E-es?s-E+es:0),b=4*(this._cubeSize-v);yr(t,w,b,3*v,2*v),c.setRenderTarget(t),c.render(h,Oo)}};function Zb(n){let e=[],t=[],i=[],s=n,r=n-es+1+Ip.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let c=1/a;o>n-es?c=Ip[o-n+es-1]:o===0&&(c=0),t.push(c);let l=1/(a-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,p=6,x=3,m=2,g=1,S=new Float32Array(x*p*f),E=new Float32Array(m*p*f),v=new Float32Array(g*p*f);for(let b=0;b<f;b++){let A=b%3*2/3-1,_=b>2?0:-1,T=[A,_,0,A+2/3,_,0,A+2/3,_+1,0,A,_,0,A+2/3,_+1,0,A,_+1,0];S.set(T,x*p*b),E.set(d,m*p*b);let I=[b,b,b,b,b,b];v.set(I,g*p*b)}let w=new Vt;w.setAttribute("position",new en(S,x)),w.setAttribute("uv",new en(E,m)),w.setAttribute("faceIndex",new en(v,g)),i.push(new Je(w,null)),s>es&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Dp(n,e,t){let i=new En(n,e,t);return i.texture.mapping=To,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function yr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Kb(n,e,t){return new tn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:$b,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ml(),fragmentShader:\`

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
		\`,blending:ni,depthTest:!1,depthWrite:!1})}function Jb(n,e,t){let i=new Float32Array(Ls),s=new O(0,1,0);return new tn({name:"SphericalGaussianBlur",defines:{n:Ls,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:\`\${n}.0\`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Ml(),fragmentShader:\`

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
		\`,blending:ni,depthTest:!1,depthWrite:!1})}function Lp(){return new tn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ml(),fragmentShader:\`

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
		\`,blending:ni,depthTest:!1,depthWrite:!1})}function Op(){return new tn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ml(),fragmentShader:\`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		\`,blending:ni,depthTest:!1,depthWrite:!1})}function Ml(){return\`

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
	\`}var yl=class extends En{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new ao(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:\`

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
			\`},s=new Wt(5,5,5),r=new tn({name:"CubemapFromEquirect",uniforms:Ds(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:dn,blending:ni});r.uniforms.tEquirect.value=t;let o=new Je(s,r),a=t.minFilter;return t.minFilter===si&&(t.minFilter=Pt),new Ac(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}};function Qb(n){let e=new WeakMap,t=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Rc||f===Ic)if(e.has(d)){let p=e.get(d).texture;return a(p,d.mapping)}else{let p=d.image;if(p&&p.height>0){let x=new yl(p.height);return x.fromEquirectangularTexture(n,d),e.set(d,x),d.addEventListener("dispose",l),a(x.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,p=f===Rc||f===Ic,x=f===Ki||f===Is;if(p||x){let m=t.get(d),g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return i===null&&(i=new _l(n)),m=p?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let S=d.image;return p&&S&&S.height>0||x&&S&&c(S)?(i===null&&(i=new _l(n)),m=p?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function a(d,f){return f===Rc?d.mapping=Ki:f===Ic&&(d.mapping=Is),d}function c(d){let f=0,p=6;for(let x=0;x<p;x++)d[x]!==void 0&&f++;return f===p}function l(d){let f=d.target;f.removeEventListener("dispose",l);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function u(d){let f=d.target;f.removeEventListener("dispose",u);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:h}}function eM(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&vs("WebGLRenderer: "+i+" extension not supported."),s}}}function tM(n,e,t,i){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let p in d.attributes)e.remove(d.attributes[p]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function c(h){let d=h.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function l(h){let d=[],f=h.index,p=h.attributes.position,x=0;if(p===void 0)return;if(f!==null){let S=f.array;x=f.version;for(let E=0,v=S.length;E<v;E+=3){let w=S[E+0],b=S[E+1],A=S[E+2];d.push(w,b,b,A,A,w)}}else{let S=p.array;x=p.version;for(let E=0,v=S.length/3-1;E<v;E+=3){let w=E+0,b=E+1,A=E+2;d.push(w,b,b,A,A,w)}}let m=new(p.count>=65535?oo:ro)(d,1);m.version=x;let g=r.get(h);g&&e.remove(g),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function nM(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function c(h,d){n.drawElements(i,d,r,h*o),t.update(d,i,1)}function l(h,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,h*o,f),t.update(d,i,f))}function u(h,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,h,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];t.update(x,i,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function iM(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:Ge("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function sM(n,e,t){let i=new WeakMap,s=new Rt;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let T=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",T)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],E=0;f===!0&&(E=1),p===!0&&(E=2),x===!0&&(E=3);let v=a.attributes.position.count*E,w=1;v>e.maxTextureSize&&(w=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let b=new Float32Array(v*w*4*h),A=new io(b,v,w,h);A.type=Yn,A.needsUpdate=!0;let _=E*4;for(let I=0;I<h;I++){let P=m[I],D=g[I],H=S[I],F=v*w*4*I;for(let L=0;L<P.count;L++){let $=L*_;f===!0&&(s.fromBufferAttribute(P,L),b[F+$+0]=s.x,b[F+$+1]=s.y,b[F+$+2]=s.z,b[F+$+3]=0),p===!0&&(s.fromBufferAttribute(D,L),b[F+$+4]=s.x,b[F+$+5]=s.y,b[F+$+6]=s.z,b[F+$+7]=0),x===!0&&(s.fromBufferAttribute(H,L),b[F+$+8]=s.x,b[F+$+9]=s.y,b[F+$+10]=s.z,b[F+$+11]=H.itemSize===4?s.w:1)}}d={count:h,texture:A,size:new de(v,w)},i.set(a,d),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let p=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(n,"morphTargetBaseInfluence",p),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function rM(n,e,t,i,s){let r=new WeakMap;function o(l){let u=s.render.frame,h=l.geometry,d=e.get(l,h);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return d}function a(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var oM={[ch]:"LINEAR_TONE_MAPPING",[lh]:"REINHARD_TONE_MAPPING",[uh]:"CINEON_TONE_MAPPING",[xr]:"ACES_FILMIC_TONE_MAPPING",[dh]:"AGX_TONE_MAPPING",[fh]:"NEUTRAL_TONE_MAPPING",[hh]:"CUSTOM_TONE_MAPPING"};function aM(n,e,t,i,s,r){let o=new En(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new vi(e,t):void 0}),a=new En(e,t,{type:ri,depthBuffer:!1,stencilBuffer:!1}),c=new Vt;c.setAttribute("position",new ft([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new ft([0,2,0,0,2,0],2));let l=new fc({uniforms:{tDiffuse:{value:null}},vertexShader:\`
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
			}\`,depthTest:!1,depthWrite:!1}),u=new Je(c,l),h=new $i(-1,1,1,-1,0,1),d=null,f=null,p=!1,x,m=null,g=[],S=!1;this.setSize=function(E,v){o.setSize(E,v),a.setSize(E,v);for(let w=0;w<g.length;w++){let b=g[w];b.setSize&&b.setSize(E,v)}},this.setEffects=function(E){g=E,S=g.length>0&&g[0].isRenderPass===!0;let v=o.width,w=o.height;for(let b=0;b<g.length;b++){let A=g[b];A.setSize&&A.setSize(v,w)}},this.begin=function(E,v){if(p||E.toneMapping===Rn&&g.length===0)return!1;if(m=v,v!==null){let w=v.width,b=v.height;(o.width!==w||o.height!==b)&&this.setSize(w,b)}return S===!1&&E.setRenderTarget(o),x=E.toneMapping,E.toneMapping=Rn,!0},this.hasRenderPass=function(){return S},this.end=function(E,v){E.toneMapping=x,p=!0;let w=o,b=a;for(let A=0;A<g.length;A++){let _=g[A];if(_.enabled!==!1&&(_.render(E,b,w,v),_.needsSwap!==!1)){let T=w;w=b,b=T}}if(d!==E.outputColorSpace||f!==E.toneMapping){d=E.outputColorSpace,f=E.toneMapping,l.defines={},at.getTransfer(d)===mt&&(l.defines.SRGB_TRANSFER="");let A=oM[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=w.texture,E.setRenderTarget(m),E.render(u,h),m=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}var em=new mn,Fh=new vi(1,1),tm=new io,nm=new rc,im=new ao,Np=[],Fp=[],Up=new Float32Array(16),Bp=new Float32Array(9),kp=new Float32Array(4);function Mr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Np[s];if(r===void 0&&(r=new Float32Array(s),Np[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Sl(n,e){let t=Fp[e];t===void 0&&(t=new Int32Array(e),Fp[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function cM(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function lM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function uM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function hM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function dM(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;kp.set(i),n.uniformMatrix2fv(this.addr,!1,kp),qt(t,i)}}function fM(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Bp.set(i),n.uniformMatrix3fv(this.addr,!1,Bp),qt(t,i)}}function pM(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;Up.set(i),n.uniformMatrix4fv(this.addr,!1,Up),qt(t,i)}}function mM(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function gM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function xM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function vM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function _M(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function yM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function bM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function MM(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function SM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Fh.compareFunction=t.isReversedDepthBuffer()?gl:ml,r=Fh):r=em,t.setTexture2D(e||r,s)}function EM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||nm,s)}function wM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||im,s)}function TM(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||tm,s)}function AM(n){switch(n){case 5126:return cM;case 35664:return lM;case 35665:return uM;case 35666:return hM;case 35674:return dM;case 35675:return fM;case 35676:return pM;case 5124:case 35670:return mM;case 35667:case 35671:return gM;case 35668:case 35672:return xM;case 35669:case 35673:return vM;case 5125:return _M;case 36294:return yM;case 36295:return bM;case 36296:return MM;case 35678:case 36198:case 36298:case 36306:case 35682:return SM;case 35679:case 36299:case 36307:return EM;case 35680:case 36300:case 36308:case 36293:return wM;case 36289:case 36303:case 36311:case 36292:return TM}}function CM(n,e){n.uniform1fv(this.addr,e)}function RM(n,e){let t=Mr(e,this.size,2);n.uniform2fv(this.addr,t)}function IM(n,e){let t=Mr(e,this.size,3);n.uniform3fv(this.addr,t)}function PM(n,e){let t=Mr(e,this.size,4);n.uniform4fv(this.addr,t)}function DM(n,e){let t=Mr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function LM(n,e){let t=Mr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function OM(n,e){let t=Mr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function NM(n,e){n.uniform1iv(this.addr,e)}function FM(n,e){n.uniform2iv(this.addr,e)}function UM(n,e){n.uniform3iv(this.addr,e)}function BM(n,e){n.uniform4iv(this.addr,e)}function kM(n,e){n.uniform1uiv(this.addr,e)}function zM(n,e){n.uniform2uiv(this.addr,e)}function HM(n,e){n.uniform3uiv(this.addr,e)}function VM(n,e){n.uniform4uiv(this.addr,e)}function GM(n,e,t){let i=this.cache,s=e.length,r=Sl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=Fh:o=em;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function WM(n,e,t){let i=this.cache,s=e.length,r=Sl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||nm,r[o])}function XM(n,e,t){let i=this.cache,s=e.length,r=Sl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||im,r[o])}function qM(n,e,t){let i=this.cache,s=e.length,r=Sl(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||tm,r[o])}function YM(n){switch(n){case 5126:return CM;case 35664:return RM;case 35665:return IM;case 35666:return PM;case 35674:return DM;case 35675:return LM;case 35676:return OM;case 5124:case 35670:return NM;case 35667:case 35671:return FM;case 35668:case 35672:return UM;case 35669:case 35673:return BM;case 5125:return kM;case 36294:return zM;case 36295:return HM;case 36296:return VM;case 35678:case 36198:case 36298:case 36306:case 35682:return GM;case 35679:case 36299:case 36307:return WM;case 35680:case 36300:case 36308:case 36293:return XM;case 36289:case 36303:case 36311:case 36292:return qM}}var Uh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=AM(t.type)}},Bh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=YM(t.type)}},kh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},Oh=/(\\w+)(\\])?(\\[|\\.)?/g;function zp(n,e){n.seq.push(e),n.map[e.id]=e}function $M(n,e,t){let i=n.name,s=i.length;for(Oh.lastIndex=0;;){let r=Oh.exec(i),o=Oh.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){zp(t,l===void 0?new Uh(a,n,e):new Bh(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new kh(a),zp(t,h)),t=h}}}var br=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);$M(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function Hp(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var jM=37297,ZM=0;function KM(n,e){let t=n.split(\`
\`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(\`\${a===e?">":" "} \${a}: \${t[o]}\`)}return i.join(\`
\`)}var Vp=new Ze;function JM(n){at._getMatrix(Vp,at.workingColorSpace,n);let e=\`mat3( \${Vp.elements.map(t=>t.toFixed(4))} )\`;switch(at.getTransfer(n)){case to:return[e,"LinearTransferOETF"];case mt:return[e,"sRGBTransferOETF"];default:return Ve("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Gp(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+\`

\`+r+\`

\`+KM(n.getShaderSource(e),a)}else return r}function QM(n,e){let t=JM(e);return[\`vec4 \${n}( vec4 value ) {\`,\`	return \${t[1]}( vec4( value.rgb * \${t[0]}, value.a ) );\`,"}"].join(\`
\`)}var eS={[ch]:"Linear",[lh]:"Reinhard",[uh]:"Cineon",[xr]:"ACESFilmic",[dh]:"AgX",[fh]:"Neutral",[hh]:"Custom"};function tS(n,e){let t=eS[e];return t===void 0?(Ve("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var vl=new O;function nS(){at.getLuminanceCoefficients(vl);let n=vl.x.toFixed(4),e=vl.y.toFixed(4),t=vl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",\`	const vec3 weights = vec3( \${n}, \${e}, \${t} );\`,"	return dot( weights, rgb );","}"].join(\`
\`)}function iS(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Fo).join(\`
\`)}function sS(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(\`
\`)}function rS(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Fo(n){return n!==""}function Wp(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Xp(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var oS=/^[ \\t]*#include +<([\\w\\d./]+)>/gm;function zh(n){return n.replace(oS,cS)}var aS=new Map;function cS(n,e){let t=Qe[e];if(t===void 0){let i=aS.get(e);if(i!==void 0)t=Qe[i],Ve('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return zh(t)}var lS=/#pragma unroll_loop_start\\s+for\\s*\\(\\s*int\\s+i\\s*=\\s*(\\d+)\\s*;\\s*i\\s*<\\s*(\\d+)\\s*;\\s*i\\s*\\+\\+\\s*\\)\\s*{([\\s\\S]+?)}\\s+#pragma unroll_loop_end/g;function qp(n){return n.replace(lS,uS)}function uS(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\\[\\s*i\\s*\\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Yp(n){let e=\`precision \${n.precision} float;
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
#define LOW_PRECISION\`),e}var hS={[Rs]:"SHADOWMAP_TYPE_PCF",[gr]:"SHADOWMAP_TYPE_VSM"};function dS(n){return hS[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var fS={[Ki]:"ENVMAP_TYPE_CUBE",[Is]:"ENVMAP_TYPE_CUBE",[To]:"ENVMAP_TYPE_CUBE_UV"};function pS(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":fS[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var mS={[Is]:"ENVMAP_MODE_REFRACTION"};function gS(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":mS[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var xS={[ah]:"ENVMAP_BLENDING_MULTIPLY",[cp]:"ENVMAP_BLENDING_MIX",[lp]:"ENVMAP_BLENDING_ADD"};function vS(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":xS[n.combine]||"ENVMAP_BLENDING_NONE"}function _S(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function yS(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=dS(t),l=pS(t),u=gS(t),h=vS(t),d=_S(t),f=iS(t),p=sS(r),x=s.createProgram(),m,g,S=t.glslVersion?"#version "+t.glslVersion+\`
\`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Fo).join(\`
\`),m.length>0&&(m+=\`
\`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Fo).join(\`
\`),g.length>0&&(g+=\`
\`)):(m=[Yp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",\`
\`].filter(Fo).join(\`
\`),g=[Yp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Rn?"#define TONE_MAPPING":"",t.toneMapping!==Rn?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Rn?tS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,QM("linearToOutputTexel",t.outputColorSpace),nS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",\`
\`].filter(Fo).join(\`
\`)),o=zh(o),o=Wp(o,t),o=Xp(o,t),a=zh(a),a=Wp(a,t),a=Xp(a,t),o=qp(o),a=qp(a),t.isRawShaderMaterial!==!0&&(S=\`#version 300 es
\`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(\`
\`)+\`
\`+m,g=["#define varying in",t.glslVersion===Mh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Mh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(\`
\`)+\`
\`+g);let E=S+m+o,v=S+g+a,w=Hp(s,s.VERTEX_SHADER,E),b=Hp(s,s.FRAGMENT_SHADER,v);s.attachShader(x,w),s.attachShader(x,b),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function A(P){if(n.debug.checkShaderErrors){let D=s.getProgramInfoLog(x)||"",H=s.getShaderInfoLog(w)||"",F=s.getShaderInfoLog(b)||"",L=D.trim(),$=H.trim(),q=F.trim(),z=!0,K=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(z=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,w,b);else{let ce=Gp(s,w,"vertex"),V=Gp(s,b,"fragment");Ge("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+\`

Material Name: \`+P.name+\`
Material Type: \`+P.type+\`

Program Info Log: \`+L+\`
\`+ce+\`
\`+V)}else L!==""?Ve("WebGLProgram: Program Info Log:",L):($===""||q==="")&&(K=!1);K&&(P.diagnostics={runnable:z,programLog:L,vertexShader:{log:$,prefix:m},fragmentShader:{log:q,prefix:g}})}s.deleteShader(w),s.deleteShader(b),_=new br(s,x),T=rS(s,x)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let T;this.getAttributes=function(){return T===void 0&&A(this),T};let I=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=s.getProgramParameter(x,jM)),I},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ZM++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=w,this.fragmentShader=b,this}var bS=0,Hh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Vh(e),t.set(e,i)),i}},Vh=class{constructor(e){this.id=bS++,this.code=e,this.usedTimes=0}};function MS(n){return n===Qi||n===Do||n===Lo}function SS(n,e,t,i,s,r){let o=new cr,a=new Hh,c=new Set,l=[],u=new Map,h=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return c.add(_),_===0?"uv":\`uv\${_}\`}function x(_,T,I,P,D,H){let F=P.fog,L=D.geometry,$=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,z=e.get(_.envMap||$,q),K=z&&z.mapping===To?z.image.height:null,ce=f[_.type];_.precision!==null&&(d=i.getMaxPrecision(_.precision),d!==_.precision&&Ve("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let V=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,te=V!==void 0?V.length:0,Me=0;L.morphAttributes.position!==void 0&&(Me=1),L.morphAttributes.normal!==void 0&&(Me=2),L.morphAttributes.color!==void 0&&(Me=3);let Ye,$e,ee,pe;if(ce){let Re=ai[ce];Ye=Re.vertexShader,$e=Re.fragmentShader}else{Ye=_.vertexShader,$e=_.fragmentShader;let Re=a.getVertexShaderStage(_),At=a.getFragmentShaderStage(_);a.update(_,Re,At),ee=Re.id,pe=At.id}let le=n.getRenderTarget(),Ie=n.state.buffers.depth.getReversed(),ke=D.isInstancedMesh===!0,Ue=D.isBatchedMesh===!0,ct=!!_.map,ze=!!_.matcap,se=!!z,ue=!!_.aoMap,he=!!_.lightMap,Ee=!!_.bumpMap&&_.wireframe===!1,fe=!!_.normalMap,Oe=!!_.displacementMap,Pe=!!_.emissiveMap,Xe=!!_.metalnessMap,je=!!_.roughnessMap,N=_.anisotropy>0,dt=_.clearcoat>0,tt=_.dispersion>0,C=_.iridescence>0,y=_.sheen>0,k=_.transmission>0,X=N&&!!_.anisotropyMap,Q=dt&&!!_.clearcoatMap,me=dt&&!!_.clearcoatNormalMap,xe=dt&&!!_.clearcoatRoughnessMap,j=C&&!!_.iridescenceMap,ie=C&&!!_.iridescenceThicknessMap,_e=y&&!!_.sheenColorMap,Ne=y&&!!_.sheenRoughnessMap,Se=!!_.specularMap,ye=!!_.specularColorMap,Be=!!_.specularIntensityMap,He=k&&!!_.transmissionMap,Ke=k&&!!_.thicknessMap,U=!!_.gradientMap,ge=!!_.alphaMap,ne=_.alphaTest>0,ve=!!_.alphaHash,be=!!_.extensions,oe=Rn;_.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(oe=n.toneMapping);let De={shaderID:ce,shaderType:_.type,shaderName:_.name,vertexShader:Ye,fragmentShader:$e,defines:_.defines,customVertexShaderID:ee,customFragmentShaderID:pe,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Ue,batchingColor:Ue&&D._colorsTexture!==null,instancing:ke,instancingColor:ke&&D.instanceColor!==null,instancingMorph:ke&&D.morphTexture!==null,outputColorSpace:le===null?n.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:at.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:ct,matcap:ze,envMap:se,envMapMode:se&&z.mapping,envMapCubeUVHeight:K,aoMap:ue,lightMap:he,bumpMap:Ee,normalMap:fe,displacementMap:Oe,emissiveMap:Pe,normalMapObjectSpace:fe&&_.normalMapType===dp,normalMapTangentSpace:fe&&_.normalMapType===pl,packedNormalMap:fe&&_.normalMapType===pl&&MS(_.normalMap.format),metalnessMap:Xe,roughnessMap:je,anisotropy:N,anisotropyMap:X,clearcoat:dt,clearcoatMap:Q,clearcoatNormalMap:me,clearcoatRoughnessMap:xe,dispersion:tt,iridescence:C,iridescenceMap:j,iridescenceThicknessMap:ie,sheen:y,sheenColorMap:_e,sheenRoughnessMap:Ne,specularMap:Se,specularColorMap:ye,specularIntensityMap:Be,transmission:k,transmissionMap:He,thicknessMap:Ke,gradientMap:U,opaque:_.transparent===!1&&_.blending===_s&&_.alphaToCoverage===!1,alphaMap:ge,alphaTest:ne,alphaHash:ve,combine:_.combine,mapUv:ct&&p(_.map.channel),aoMapUv:ue&&p(_.aoMap.channel),lightMapUv:he&&p(_.lightMap.channel),bumpMapUv:Ee&&p(_.bumpMap.channel),normalMapUv:fe&&p(_.normalMap.channel),displacementMapUv:Oe&&p(_.displacementMap.channel),emissiveMapUv:Pe&&p(_.emissiveMap.channel),metalnessMapUv:Xe&&p(_.metalnessMap.channel),roughnessMapUv:je&&p(_.roughnessMap.channel),anisotropyMapUv:X&&p(_.anisotropyMap.channel),clearcoatMapUv:Q&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:me&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:ie&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:Ne&&p(_.sheenRoughnessMap.channel),specularMapUv:Se&&p(_.specularMap.channel),specularColorMapUv:ye&&p(_.specularColorMap.channel),specularIntensityMapUv:Be&&p(_.specularIntensityMap.channel),transmissionMapUv:He&&p(_.transmissionMap.channel),thicknessMapUv:Ke&&p(_.thicknessMap.channel),alphaMapUv:ge&&p(_.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(fe||N),vertexNormals:!!L.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!L.attributes.uv&&(ct||ge),fog:!!F,useFog:_.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||L.attributes.normal===void 0&&fe===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ie,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:te,morphTextureStride:Me,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&I.length>0,shadowMapType:n.shadowMap.type,toneMapping:oe,decodeVideoTexture:ct&&_.map.isVideoTexture===!0&&at.getTransfer(_.map.colorSpace)===mt,decodeVideoTextureEmissive:Pe&&_.emissiveMap.isVideoTexture===!0&&at.getTransfer(_.emissiveMap.colorSpace)===mt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Tt,flipSided:_.side===dn,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:be&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&_.extensions.multiDraw===!0||Ue)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return De.vertexUv1s=c.has(1),De.vertexUv2s=c.has(2),De.vertexUv3s=c.has(3),c.clear(),De}function m(_){let T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(let I in _.defines)T.push(I),T.push(_.defines[I]);return _.isRawShaderMaterial===!1&&(g(T,_),S(T,_),T.push(n.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}function g(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}function S(_,T){o.disableAll(),T.instancing&&o.enable(0),T.instancingColor&&o.enable(1),T.instancingMorph&&o.enable(2),T.matcap&&o.enable(3),T.envMap&&o.enable(4),T.normalMapObjectSpace&&o.enable(5),T.normalMapTangentSpace&&o.enable(6),T.clearcoat&&o.enable(7),T.iridescence&&o.enable(8),T.alphaTest&&o.enable(9),T.vertexColors&&o.enable(10),T.vertexAlphas&&o.enable(11),T.vertexUv1s&&o.enable(12),T.vertexUv2s&&o.enable(13),T.vertexUv3s&&o.enable(14),T.vertexTangents&&o.enable(15),T.anisotropy&&o.enable(16),T.alphaHash&&o.enable(17),T.batching&&o.enable(18),T.dispersion&&o.enable(19),T.batchingColor&&o.enable(20),T.gradientMap&&o.enable(21),T.packedNormalMap&&o.enable(22),T.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.reversedDepthBuffer&&o.enable(4),T.skinning&&o.enable(5),T.morphTargets&&o.enable(6),T.morphNormals&&o.enable(7),T.morphColors&&o.enable(8),T.premultipliedAlpha&&o.enable(9),T.shadowMapEnabled&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.decodeVideoTextureEmissive&&o.enable(20),T.alphaToCoverage&&o.enable(21),T.numLightProbeGrids>0&&o.enable(22),T.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function E(_){let T=f[_.type],I;if(T){let P=ai[T];I=Cp.clone(P.uniforms)}else I=_.uniforms;return I}function v(_,T){let I=u.get(T);return I!==void 0?++I.usedTimes:(I=new yS(n,T,_,s),l.push(I),u.set(T,I)),I}function w(_){if(--_.usedTimes===0){let T=l.indexOf(_);l[T]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function b(_){a.remove(_)}function A(){a.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:E,acquireProgram:v,releaseProgram:w,releaseShaderCache:b,programs:l,dispose:A}}function ES(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,c){n.get(o)[a]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function wS(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function $p(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function jp(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,p,x,m,g){let S=n[e];return S===void 0?(S={id:d.id,object:d,geometry:f,material:p,materialVariant:o(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:g},n[e]=S):(S.id=d.id,S.object=d,S.geometry=f,S.material=p,S.materialVariant=o(d),S.groupOrder=x,S.renderOrder=d.renderOrder,S.z=m,S.group=g),e++,S}function c(d,f,p,x,m,g){let S=a(d,f,p,x,m,g);p.transmission>0?i.push(S):p.transparent===!0?s.push(S):t.push(S)}function l(d,f,p,x,m,g){let S=a(d,f,p,x,m,g);p.transmission>0?i.unshift(S):p.transparent===!0?s.unshift(S):t.unshift(S)}function u(d,f,p){t.length>1&&t.sort(d||wS),i.length>1&&i.sort(f||$p),s.length>1&&s.sort(f||$p),p&&(t.reverse(),i.reverse(),s.reverse())}function h(){for(let d=e,f=n.length;d<f;d++){let p=n[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:c,unshift:l,finish:h,sort:u}}function TS(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new jp,n.set(i,[o])):s>=r.length?(o=new jp,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function AS(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new O,color:new We};break;case"SpotLight":t={position:new O,direction:new O,color:new We,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new We,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new We,groundColor:new We};break;case"RectAreaLight":t={color:new We,position:new O,halfWidth:new O,halfHeight:new O};break}return n[e.id]=t,t}}}function CS(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new de};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new de};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new de,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var RS=0;function IS(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function PS(n){let e=new AS,t=CS(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new O);let s=new O,r=new wt,o=new wt;function a(l){let u=0,h=0,d=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let f=0,p=0,x=0,m=0,g=0,S=0,E=0,v=0,w=0,b=0,A=0;l.sort(IS);for(let T=0,I=l.length;T<I;T++){let P=l[T],D=P.color,H=P.intensity,F=P.distance,L=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Qi?L=P.shadow.map.texture:L=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=D.r*H,h+=D.g*H,d+=D.b*H;else if(P.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(P.sh.coefficients[$],H);A++}else if(P.isDirectionalLight){let $=e.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let q=P.shadow,z=t.get(P);z.shadowIntensity=q.intensity,z.shadowBias=q.bias,z.shadowNormalBias=q.normalBias,z.shadowRadius=q.radius,z.shadowMapSize=q.mapSize,i.directionalShadow[f]=z,i.directionalShadowMap[f]=L,i.directionalShadowMatrix[f]=P.shadow.matrix,S++}i.directional[f]=$,f++}else if(P.isSpotLight){let $=e.get(P);$.position.setFromMatrixPosition(P.matrixWorld),$.color.copy(D).multiplyScalar(H),$.distance=F,$.coneCos=Math.cos(P.angle),$.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),$.decay=P.decay,i.spot[x]=$;let q=P.shadow;if(P.map&&(i.spotLightMap[w]=P.map,w++,q.updateMatrices(P),P.castShadow&&b++),i.spotLightMatrix[x]=q.matrix,P.castShadow){let z=t.get(P);z.shadowIntensity=q.intensity,z.shadowBias=q.bias,z.shadowNormalBias=q.normalBias,z.shadowRadius=q.radius,z.shadowMapSize=q.mapSize,i.spotShadow[x]=z,i.spotShadowMap[x]=L,v++}x++}else if(P.isRectAreaLight){let $=e.get(P);$.color.copy(D).multiplyScalar(H),$.halfWidth.set(P.width*.5,0,0),$.halfHeight.set(0,P.height*.5,0),i.rectArea[m]=$,m++}else if(P.isPointLight){let $=e.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),$.distance=P.distance,$.decay=P.decay,P.castShadow){let q=P.shadow,z=t.get(P);z.shadowIntensity=q.intensity,z.shadowBias=q.bias,z.shadowNormalBias=q.normalBias,z.shadowRadius=q.radius,z.shadowMapSize=q.mapSize,z.shadowCameraNear=q.camera.near,z.shadowCameraFar=q.camera.far,i.pointShadow[p]=z,i.pointShadowMap[p]=L,i.pointShadowMatrix[p]=P.shadow.matrix,E++}i.point[p]=$,p++}else if(P.isHemisphereLight){let $=e.get(P);$.skyColor.copy(P.color).multiplyScalar(H),$.groundColor.copy(P.groundColor).multiplyScalar(H),i.hemi[g]=$,g++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=we.LTC_FLOAT_1,i.rectAreaLTC2=we.LTC_FLOAT_2):(i.rectAreaLTC1=we.LTC_HALF_1,i.rectAreaLTC2=we.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let _=i.hash;(_.directionalLength!==f||_.pointLength!==p||_.spotLength!==x||_.rectAreaLength!==m||_.hemiLength!==g||_.numDirectionalShadows!==S||_.numPointShadows!==E||_.numSpotShadows!==v||_.numSpotMaps!==w||_.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=x,i.rectArea.length=m,i.point.length=p,i.hemi.length=g,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=v+w-b,i.spotLightMap.length=w,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=A,_.directionalLength=f,_.pointLength=p,_.spotLength=x,_.rectAreaLength=m,_.hemiLength=g,_.numDirectionalShadows=S,_.numPointShadows=E,_.numSpotShadows=v,_.numSpotMaps=w,_.numLightProbes=A,i.version=RS++)}function c(l,u){let h=0,d=0,f=0,p=0,x=0,m=u.matrixWorldInverse;for(let g=0,S=l.length;g<S;g++){let E=l[g];if(E.isDirectionalLight){let v=i.directional[h];v.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),h++}else if(E.isSpotLight){let v=i.spot[f];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),f++}else if(E.isRectAreaLight){let v=i.rectArea[p];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(E.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(E.width*.5,0,0),v.halfHeight.set(0,E.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),p++}else if(E.isPointLight){let v=i.point[d];v.position.setFromMatrixPosition(E.matrixWorld),v.position.applyMatrix4(m),d++}else if(E.isHemisphereLight){let v=i.hemi[x];v.direction.setFromMatrixPosition(E.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:i}}function Zp(n){let e=new PS(n),t=[],i=[],s=[];function r(d){h.camera=d,t.length=0,i.length=0,s.length=0}function o(d){t.push(d)}function a(d){i.push(d)}function c(d){s.push(d)}function l(){e.setup(t)}function u(d){e.setupView(t,d)}let h={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function DS(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Zp(n),e.set(s,[a])):r>=o.length?(a=new Zp(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var LS=\`void main() {
	gl_Position = vec4( position, 1.0 );
}\`,OS=\`uniform sampler2D shadow_pass;
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
}\`,NS=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],FS=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Kp=new wt,No=new O,Nh=new O;function US(n,e,t){let i=new hr,s=new de,r=new de,o=new Rt,a=new pc,c=new mc,l={},u=t.maxTextureSize,h={[pn]:dn,[dn]:pn,[Tt]:Tt},d=new tn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new de},radius:{value:4}},vertexShader:LS,fragmentShader:OS}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new Vt;p.setAttribute("position",new en(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Je(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Rs;let g=this.type;this.render=function(b,A,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===Gf&&(Ve("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Rs);let T=n.getRenderTarget(),I=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),D=n.state;D.setBlending(ni),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let H=g!==this.type;H&&A.traverse(function(F){F.material&&(Array.isArray(F.material)?F.material.forEach(L=>L.needsUpdate=!0):F.material.needsUpdate=!0)});for(let F=0,L=b.length;F<L;F++){let $=b[F],q=$.shadow;if(q===void 0){Ve("WebGLShadowMap:",$,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;s.copy(q.mapSize);let z=q.getFrameExtents();s.multiply(z),r.copy(q.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/z.x),s.x=r.x*z.x,q.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/z.y),s.y=r.y*z.y,q.mapSize.y=r.y));let K=n.state.buffers.depth.getReversed();if(q.camera._reversedDepth=K,q.map===null||H===!0){if(q.map!==null&&(q.map.depthTexture!==null&&(q.map.depthTexture.dispose(),q.map.depthTexture=null),q.map.dispose()),this.type===gr){if($.isPointLight){Ve("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}q.map=new En(s.x,s.y,{format:Qi,type:ri,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),q.map.texture.name=$.name+".shadowMap",q.map.depthTexture=new vi(s.x,s.y,Yn),q.map.depthTexture.name=$.name+".shadowMapDepth",q.map.depthTexture.format=ei,q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=Kt,q.map.depthTexture.magFilter=Kt}else $.isPointLight?(q.map=new yl(s.x),q.map.depthTexture=new oc(s.x,qn)):(q.map=new En(s.x,s.y),q.map.depthTexture=new vi(s.x,s.y,qn)),q.map.depthTexture.name=$.name+".shadowMap",q.map.depthTexture.format=ei,this.type===Rs?(q.map.depthTexture.compareFunction=K?gl:ml,q.map.depthTexture.minFilter=Pt,q.map.depthTexture.magFilter=Pt):(q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=Kt,q.map.depthTexture.magFilter=Kt);q.camera.updateProjectionMatrix()}let ce=q.map.isWebGLCubeRenderTarget?6:1;for(let V=0;V<ce;V++){if(q.map.isWebGLCubeRenderTarget)n.setRenderTarget(q.map,V),n.clear();else{V===0&&(n.setRenderTarget(q.map),n.clear());let te=q.getViewport(V);o.set(r.x*te.x,r.y*te.y,r.x*te.z,r.y*te.w),D.viewport(o)}if($.isPointLight){let te=q.camera,Me=q.matrix,Ye=$.distance||te.far;Ye!==te.far&&(te.far=Ye,te.updateProjectionMatrix()),No.setFromMatrixPosition($.matrixWorld),te.position.copy(No),Nh.copy(te.position),Nh.add(NS[V]),te.up.copy(FS[V]),te.lookAt(Nh),te.updateMatrixWorld(),Me.makeTranslation(-No.x,-No.y,-No.z),Kp.multiplyMatrices(te.projectionMatrix,te.matrixWorldInverse),q._frustum.setFromProjectionMatrix(Kp,te.coordinateSystem,te.reversedDepth)}else q.updateMatrices($);i=q.getFrustum(),v(A,_,q.camera,$,this.type)}q.isPointLightShadow!==!0&&this.type===gr&&S(q,_),q.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(T,I,P)};function S(b,A){let _=e.update(x);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new En(s.x,s.y,{format:Qi,type:ri})),d.uniforms.shadow_pass.value=b.map.depthTexture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(A,null,_,d,x,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(A,null,_,f,x,null)}function E(b,A,_,T){let I=null,P=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(P!==void 0)I=P;else if(I=_.isPointLight===!0?c:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let D=I.uuid,H=A.uuid,F=l[D];F===void 0&&(F={},l[D]=F);let L=F[H];L===void 0&&(L=I.clone(),F[H]=L,A.addEventListener("dispose",w)),I=L}if(I.visible=A.visible,I.wireframe=A.wireframe,T===gr?I.side=A.shadowSide!==null?A.shadowSide:A.side:I.side=A.shadowSide!==null?A.shadowSide:h[A.side],I.alphaMap=A.alphaMap,I.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,I.map=A.map,I.clipShadows=A.clipShadows,I.clippingPlanes=A.clippingPlanes,I.clipIntersection=A.clipIntersection,I.displacementMap=A.displacementMap,I.displacementScale=A.displacementScale,I.displacementBias=A.displacementBias,I.wireframeLinewidth=A.wireframeLinewidth,I.linewidth=A.linewidth,_.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let D=n.properties.get(I);D.light=_}return I}function v(b,A,_,T,I){if(b.visible===!1)return;if(b.layers.test(A.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&I===gr)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);let H=e.update(b),F=b.material;if(Array.isArray(F)){let L=H.groups;for(let $=0,q=L.length;$<q;$++){let z=L[$],K=F[z.materialIndex];if(K&&K.visible){let ce=E(b,K,T,I);b.onBeforeShadow(n,b,A,_,H,ce,z),n.renderBufferDirect(_,null,H,ce,b,z),b.onAfterShadow(n,b,A,_,H,ce,z)}}}else if(F.visible){let L=E(b,F,T,I);b.onBeforeShadow(n,b,A,_,H,L,null),n.renderBufferDirect(_,null,H,L,b,null),b.onAfterShadow(n,b,A,_,H,L,null)}}let D=b.children;for(let H=0,F=D.length;H<F;H++)v(D[H],A,_,T,I)}function w(b){b.target.removeEventListener("dispose",w);for(let _ in l){let T=l[_],I=b.target.uuid;I in T&&(T[I].dispose(),delete T[I])}}}function BS(n,e){function t(){let U=!1,ge=new Rt,ne=null,ve=new Rt(0,0,0,0);return{setMask:function(be){ne!==be&&!U&&(n.colorMask(be,be,be,be),ne=be)},setLocked:function(be){U=be},setClear:function(be,oe,De,Re,At){At===!0&&(be*=Re,oe*=Re,De*=Re),ge.set(be,oe,De,Re),ve.equals(ge)===!1&&(n.clearColor(be,oe,De,Re),ve.copy(ge))},reset:function(){U=!1,ne=null,ve.set(-1,0,0,0)}}}function i(){let U=!1,ge=!1,ne=null,ve=null,be=null;return{setReversed:function(oe){if(ge!==oe){let De=e.get("EXT_clip_control");oe?De.clipControlEXT(De.LOWER_LEFT_EXT,De.ZERO_TO_ONE_EXT):De.clipControlEXT(De.LOWER_LEFT_EXT,De.NEGATIVE_ONE_TO_ONE_EXT),ge=oe;let Re=be;be=null,this.setClear(Re)}},getReversed:function(){return ge},setTest:function(oe){oe?le(n.DEPTH_TEST):Ie(n.DEPTH_TEST)},setMask:function(oe){ne!==oe&&!U&&(n.depthMask(oe),ne=oe)},setFunc:function(oe){if(ge&&(oe=Mp[oe]),ve!==oe){switch(oe){case $a:n.depthFunc(n.NEVER);break;case ja:n.depthFunc(n.ALWAYS);break;case Za:n.depthFunc(n.LESS);break;case ys:n.depthFunc(n.LEQUAL);break;case Ka:n.depthFunc(n.EQUAL);break;case Ja:n.depthFunc(n.GEQUAL);break;case Qa:n.depthFunc(n.GREATER);break;case ec:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ve=oe}},setLocked:function(oe){U=oe},setClear:function(oe){be!==oe&&(be=oe,ge&&(oe=1-oe),n.clearDepth(oe))},reset:function(){U=!1,ne=null,ve=null,be=null,ge=!1}}}function s(){let U=!1,ge=null,ne=null,ve=null,be=null,oe=null,De=null,Re=null,At=null;return{setTest:function(pt){U||(pt?le(n.STENCIL_TEST):Ie(n.STENCIL_TEST))},setMask:function(pt){ge!==pt&&!U&&(n.stencilMask(pt),ge=pt)},setFunc:function(pt,On,un){(ne!==pt||ve!==On||be!==un)&&(n.stencilFunc(pt,On,un),ne=pt,ve=On,be=un)},setOp:function(pt,On,un){(oe!==pt||De!==On||Re!==un)&&(n.stencilOp(pt,On,un),oe=pt,De=On,Re=un)},setLocked:function(pt){U=pt},setClear:function(pt){At!==pt&&(n.clearStencil(pt),At=pt)},reset:function(){U=!1,ge=null,ne=null,ve=null,be=null,oe=null,De=null,Re=null,At=null}}}let r=new t,o=new i,a=new s,c=new WeakMap,l=new WeakMap,u={},h={},d={},f=new WeakMap,p=[],x=null,m=!1,g=null,S=null,E=null,v=null,w=null,b=null,A=null,_=new We(0,0,0),T=0,I=!1,P=null,D=null,H=null,F=null,L=null,$=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,z=0,K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\\d)/.exec(K)[1]),q=z>=1):K.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\\d)/.exec(K)[1]),q=z>=2);let ce=null,V={},te=n.getParameter(n.SCISSOR_BOX),Me=n.getParameter(n.VIEWPORT),Ye=new Rt().fromArray(te),$e=new Rt().fromArray(Me);function ee(U,ge,ne,ve){let be=new Uint8Array(4),oe=n.createTexture();n.bindTexture(U,oe),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let De=0;De<ne;De++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(ge,0,n.RGBA,1,1,ve,0,n.RGBA,n.UNSIGNED_BYTE,be):n.texImage2D(ge+De,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,be);return oe}let pe={};pe[n.TEXTURE_2D]=ee(n.TEXTURE_2D,n.TEXTURE_2D,1),pe[n.TEXTURE_CUBE_MAP]=ee(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),pe[n.TEXTURE_2D_ARRAY]=ee(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),pe[n.TEXTURE_3D]=ee(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),le(n.DEPTH_TEST),o.setFunc(ys),Ee(!1),fe(sh),le(n.CULL_FACE),ue(ni);function le(U){u[U]!==!0&&(n.enable(U),u[U]=!0)}function Ie(U){u[U]!==!1&&(n.disable(U),u[U]=!1)}function ke(U,ge){return d[U]!==ge?(n.bindFramebuffer(U,ge),d[U]=ge,U===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ge),U===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ge),!0):!1}function Ue(U,ge){let ne=p,ve=!1;if(U){ne=f.get(ge),ne===void 0&&(ne=[],f.set(ge,ne));let be=U.textures;if(ne.length!==be.length||ne[0]!==n.COLOR_ATTACHMENT0){for(let oe=0,De=be.length;oe<De;oe++)ne[oe]=n.COLOR_ATTACHMENT0+oe;ne.length=be.length,ve=!0}}else ne[0]!==n.BACK&&(ne[0]=n.BACK,ve=!0);ve&&n.drawBuffers(ne)}function ct(U){return x!==U?(n.useProgram(U),x=U,!0):!1}let ze={[Gi]:n.FUNC_ADD,[Xf]:n.FUNC_SUBTRACT,[qf]:n.FUNC_REVERSE_SUBTRACT};ze[Yf]=n.MIN,ze[$f]=n.MAX;let se={[jf]:n.ZERO,[Zf]:n.ONE,[Kf]:n.SRC_COLOR,[qa]:n.SRC_ALPHA,[ip]:n.SRC_ALPHA_SATURATE,[tp]:n.DST_COLOR,[Qf]:n.DST_ALPHA,[Jf]:n.ONE_MINUS_SRC_COLOR,[Ya]:n.ONE_MINUS_SRC_ALPHA,[np]:n.ONE_MINUS_DST_COLOR,[ep]:n.ONE_MINUS_DST_ALPHA,[sp]:n.CONSTANT_COLOR,[rp]:n.ONE_MINUS_CONSTANT_COLOR,[op]:n.CONSTANT_ALPHA,[ap]:n.ONE_MINUS_CONSTANT_ALPHA};function ue(U,ge,ne,ve,be,oe,De,Re,At,pt){if(U===ni){m===!0&&(Ie(n.BLEND),m=!1);return}if(m===!1&&(le(n.BLEND),m=!0),U!==Wf){if(U!==g||pt!==I){if((S!==Gi||w!==Gi)&&(n.blendEquation(n.FUNC_ADD),S=Gi,w=Gi),pt)switch(U){case _s:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ii:n.blendFunc(n.ONE,n.ONE);break;case rh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case oh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ge("WebGLState: Invalid blending: ",U);break}else switch(U){case _s:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case ii:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case rh:Ge("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case oh:Ge("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ge("WebGLState: Invalid blending: ",U);break}E=null,v=null,b=null,A=null,_.set(0,0,0),T=0,g=U,I=pt}return}be=be||ge,oe=oe||ne,De=De||ve,(ge!==S||be!==w)&&(n.blendEquationSeparate(ze[ge],ze[be]),S=ge,w=be),(ne!==E||ve!==v||oe!==b||De!==A)&&(n.blendFuncSeparate(se[ne],se[ve],se[oe],se[De]),E=ne,v=ve,b=oe,A=De),(Re.equals(_)===!1||At!==T)&&(n.blendColor(Re.r,Re.g,Re.b,At),_.copy(Re),T=At),g=U,I=!1}function he(U,ge){U.side===Tt?Ie(n.CULL_FACE):le(n.CULL_FACE);let ne=U.side===dn;ge&&(ne=!ne),Ee(ne),U.blending===_s&&U.transparent===!1?ue(ni):ue(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);let ve=U.stencilWrite;a.setTest(ve),ve&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Pe(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?le(n.SAMPLE_ALPHA_TO_COVERAGE):Ie(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ee(U){P!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),P=U)}function fe(U){U!==Hf?(le(n.CULL_FACE),U!==D&&(U===sh?n.cullFace(n.BACK):U===Vf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ie(n.CULL_FACE),D=U}function Oe(U){U!==H&&(q&&n.lineWidth(U),H=U)}function Pe(U,ge,ne){U?(le(n.POLYGON_OFFSET_FILL),(F!==ge||L!==ne)&&(F=ge,L=ne,o.getReversed()&&(ge=-ge),n.polygonOffset(ge,ne))):Ie(n.POLYGON_OFFSET_FILL)}function Xe(U){U?le(n.SCISSOR_TEST):Ie(n.SCISSOR_TEST)}function je(U){U===void 0&&(U=n.TEXTURE0+$-1),ce!==U&&(n.activeTexture(U),ce=U)}function N(U,ge,ne){ne===void 0&&(ce===null?ne=n.TEXTURE0+$-1:ne=ce);let ve=V[ne];ve===void 0&&(ve={type:void 0,texture:void 0},V[ne]=ve),(ve.type!==U||ve.texture!==ge)&&(ce!==ne&&(n.activeTexture(ne),ce=ne),n.bindTexture(U,ge||pe[U]),ve.type=U,ve.texture=ge)}function dt(){let U=V[ce];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function tt(){try{n.compressedTexImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function C(){try{n.compressedTexImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function y(){try{n.texSubImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function k(){try{n.texSubImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function X(){try{n.compressedTexSubImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function Q(){try{n.compressedTexSubImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function me(){try{n.texStorage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function xe(){try{n.texStorage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function j(){try{n.texImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function ie(){try{n.texImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function _e(U){return h[U]!==void 0?h[U]:n.getParameter(U)}function Ne(U,ge){h[U]!==ge&&(n.pixelStorei(U,ge),h[U]=ge)}function Se(U){Ye.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Ye.copy(U))}function ye(U){$e.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),$e.copy(U))}function Be(U,ge){let ne=l.get(ge);ne===void 0&&(ne=new WeakMap,l.set(ge,ne));let ve=ne.get(U);ve===void 0&&(ve=n.getUniformBlockIndex(ge,U.name),ne.set(U,ve))}function He(U,ge){let ve=l.get(ge).get(U);c.get(ge)!==ve&&(n.uniformBlockBinding(ge,ve,U.__bindingPointIndex),c.set(ge,ve))}function Ke(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},h={},ce=null,V={},d={},f=new WeakMap,p=[],x=null,m=!1,g=null,S=null,E=null,v=null,w=null,b=null,A=null,_=new We(0,0,0),T=0,I=!1,P=null,D=null,H=null,F=null,L=null,Ye.set(0,0,n.canvas.width,n.canvas.height),$e.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:le,disable:Ie,bindFramebuffer:ke,drawBuffers:Ue,useProgram:ct,setBlending:ue,setMaterial:he,setFlipSided:Ee,setCullFace:fe,setLineWidth:Oe,setPolygonOffset:Pe,setScissorTest:Xe,activeTexture:je,bindTexture:N,unbindTexture:dt,compressedTexImage2D:tt,compressedTexImage3D:C,texImage2D:j,texImage3D:ie,pixelStorei:Ne,getParameter:_e,updateUBOMapping:Be,uniformBlockBinding:He,texStorage2D:me,texStorage3D:xe,texSubImage2D:y,texSubImage3D:k,compressedTexSubImage2D:X,compressedTexSubImage3D:Q,scissor:Se,viewport:ye,reset:Ke}}function kS(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new de,u=new WeakMap,h=new Set,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(C,y){return p?new OffscreenCanvas(C,y):no("canvas")}function m(C,y,k){let X=1,Q=tt(C);if((Q.width>k||Q.height>k)&&(X=k/Math.max(Q.width,Q.height)),X<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let me=Math.floor(X*Q.width),xe=Math.floor(X*Q.height);d===void 0&&(d=x(me,xe));let j=y?x(me,xe):d;return j.width=me,j.height=xe,j.getContext("2d").drawImage(C,0,0,me,xe),Ve("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+me+"x"+xe+")."),j}else return"data"in C&&Ve("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),C;return C}function g(C){return C.generateMipmaps}function S(C){n.generateMipmap(C)}function E(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(C,y,k,X,Q,me=!1){if(C!==null){if(n[C]!==void 0)return n[C];Ve("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let xe;X&&(xe=e.get("EXT_texture_norm16"),xe||Ve("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=y;if(y===n.RED&&(k===n.FLOAT&&(j=n.R32F),k===n.HALF_FLOAT&&(j=n.R16F),k===n.UNSIGNED_BYTE&&(j=n.R8),k===n.UNSIGNED_SHORT&&xe&&(j=xe.R16_EXT),k===n.SHORT&&xe&&(j=xe.R16_SNORM_EXT)),y===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(j=n.R8UI),k===n.UNSIGNED_SHORT&&(j=n.R16UI),k===n.UNSIGNED_INT&&(j=n.R32UI),k===n.BYTE&&(j=n.R8I),k===n.SHORT&&(j=n.R16I),k===n.INT&&(j=n.R32I)),y===n.RG&&(k===n.FLOAT&&(j=n.RG32F),k===n.HALF_FLOAT&&(j=n.RG16F),k===n.UNSIGNED_BYTE&&(j=n.RG8),k===n.UNSIGNED_SHORT&&xe&&(j=xe.RG16_EXT),k===n.SHORT&&xe&&(j=xe.RG16_SNORM_EXT)),y===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(j=n.RG8UI),k===n.UNSIGNED_SHORT&&(j=n.RG16UI),k===n.UNSIGNED_INT&&(j=n.RG32UI),k===n.BYTE&&(j=n.RG8I),k===n.SHORT&&(j=n.RG16I),k===n.INT&&(j=n.RG32I)),y===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(j=n.RGB8UI),k===n.UNSIGNED_SHORT&&(j=n.RGB16UI),k===n.UNSIGNED_INT&&(j=n.RGB32UI),k===n.BYTE&&(j=n.RGB8I),k===n.SHORT&&(j=n.RGB16I),k===n.INT&&(j=n.RGB32I)),y===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(j=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(j=n.RGBA16UI),k===n.UNSIGNED_INT&&(j=n.RGBA32UI),k===n.BYTE&&(j=n.RGBA8I),k===n.SHORT&&(j=n.RGBA16I),k===n.INT&&(j=n.RGBA32I)),y===n.RGB&&(k===n.UNSIGNED_SHORT&&xe&&(j=xe.RGB16_EXT),k===n.SHORT&&xe&&(j=xe.RGB16_SNORM_EXT),k===n.UNSIGNED_INT_5_9_9_9_REV&&(j=n.RGB9_E5),k===n.UNSIGNED_INT_10F_11F_11F_REV&&(j=n.R11F_G11F_B10F)),y===n.RGBA){let ie=me?to:at.getTransfer(Q);k===n.FLOAT&&(j=n.RGBA32F),k===n.HALF_FLOAT&&(j=n.RGBA16F),k===n.UNSIGNED_BYTE&&(j=ie===mt?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT&&xe&&(j=xe.RGBA16_EXT),k===n.SHORT&&xe&&(j=xe.RGBA16_SNORM_EXT),k===n.UNSIGNED_SHORT_4_4_4_4&&(j=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(j=n.RGB5_A1)}return(j===n.R16F||j===n.R32F||j===n.RG16F||j===n.RG32F||j===n.RGBA16F||j===n.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function w(C,y){let k;return C?y===null||y===qn||y===_r?k=n.DEPTH24_STENCIL8:y===Yn?k=n.DEPTH32F_STENCIL8:y===vr&&(k=n.DEPTH24_STENCIL8,Ve("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===qn||y===_r?k=n.DEPTH_COMPONENT24:y===Yn?k=n.DEPTH_COMPONENT32F:y===vr&&(k=n.DEPTH_COMPONENT16),k}function b(C,y){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==Kt&&C.minFilter!==Pt?Math.log2(Math.max(y.width,y.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?y.mipmaps.length:1}function A(C){let y=C.target;y.removeEventListener("dispose",A),T(y),y.isVideoTexture&&u.delete(y),y.isHTMLTexture&&h.delete(y)}function _(C){let y=C.target;y.removeEventListener("dispose",_),P(y)}function T(C){let y=i.get(C);if(y.__webglInit===void 0)return;let k=C.source,X=f.get(k);if(X){let Q=X[y.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&I(C),Object.keys(X).length===0&&f.delete(k)}i.remove(C)}function I(C){let y=i.get(C);n.deleteTexture(y.__webglTexture);let k=C.source,X=f.get(k);delete X[y.__cacheKey],o.memory.textures--}function P(C){let y=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let Q=0;Q<y.__webglFramebuffer[X].length;Q++)n.deleteFramebuffer(y.__webglFramebuffer[X][Q]);else n.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)n.deleteFramebuffer(y.__webglFramebuffer[X]);else n.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&n.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&n.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&n.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let k=C.textures;for(let X=0,Q=k.length;X<Q;X++){let me=i.get(k[X]);me.__webglTexture&&(n.deleteTexture(me.__webglTexture),o.memory.textures--),i.remove(k[X])}i.remove(C)}let D=0;function H(){D=0}function F(){return D}function L(C){D=C}function $(){let C=D;return C>=s.maxTextures&&Ve("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),D+=1,C}function q(C){let y=[];return y.push(C.wrapS),y.push(C.wrapT),y.push(C.wrapR||0),y.push(C.magFilter),y.push(C.minFilter),y.push(C.anisotropy),y.push(C.internalFormat),y.push(C.format),y.push(C.type),y.push(C.generateMipmaps),y.push(C.premultiplyAlpha),y.push(C.flipY),y.push(C.unpackAlignment),y.push(C.colorSpace),y.join()}function z(C,y){let k=i.get(C);if(C.isVideoTexture&&N(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&k.__version!==C.version){let X=C.image;if(X===null)Ve("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Ve("WebGLRenderer: Texture marked for update but image is incomplete");else{Ie(k,C,y);return}}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+y)}function K(C,y){let k=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){Ie(k,C,y);return}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+y)}function ce(C,y){let k=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){Ie(k,C,y);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+y)}function V(C,y){let k=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&k.__version!==C.version){ke(k,C,y);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+y)}let te={[bs]:n.REPEAT,[Qn]:n.CLAMP_TO_EDGE,[tc]:n.MIRRORED_REPEAT},Me={[Kt]:n.NEAREST,[up]:n.NEAREST_MIPMAP_NEAREST,[Ao]:n.NEAREST_MIPMAP_LINEAR,[Pt]:n.LINEAR,[Pc]:n.LINEAR_MIPMAP_NEAREST,[si]:n.LINEAR_MIPMAP_LINEAR},Ye={[fp]:n.NEVER,[vp]:n.ALWAYS,[pp]:n.LESS,[ml]:n.LEQUAL,[mp]:n.EQUAL,[gl]:n.GEQUAL,[gp]:n.GREATER,[xp]:n.NOTEQUAL};function $e(C,y){if(y.type===Yn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Pt||y.magFilter===Pc||y.magFilter===Ao||y.magFilter===si||y.minFilter===Pt||y.minFilter===Pc||y.minFilter===Ao||y.minFilter===si)&&Ve("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,te[y.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,te[y.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,te[y.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,Me[y.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,Me[y.minFilter]),y.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,Ye[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Kt||y.minFilter!==Ao&&y.minFilter!==si||y.type===Yn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function ee(C,y){let k=!1;C.__webglInit===void 0&&(C.__webglInit=!0,y.addEventListener("dispose",A));let X=y.source,Q=f.get(X);Q===void 0&&(Q={},f.set(X,Q));let me=q(y);if(me!==C.__cacheKey){Q[me]===void 0&&(Q[me]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Q[me].usedTimes++;let xe=Q[C.__cacheKey];xe!==void 0&&(Q[C.__cacheKey].usedTimes--,xe.usedTimes===0&&I(y)),C.__cacheKey=me,C.__webglTexture=Q[me].texture}return k}function pe(C,y,k){return Math.floor(Math.floor(C/k)/y)}function le(C,y,k,X){let me=C.updateRanges;if(me.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,y.width,y.height,k,X,y.data);else{me.sort((Ne,Se)=>Ne.start-Se.start);let xe=0;for(let Ne=1;Ne<me.length;Ne++){let Se=me[xe],ye=me[Ne],Be=Se.start+Se.count,He=pe(ye.start,y.width,4),Ke=pe(Se.start,y.width,4);ye.start<=Be+1&&He===Ke&&pe(ye.start+ye.count-1,y.width,4)===He?Se.count=Math.max(Se.count,ye.start+ye.count-Se.start):(++xe,me[xe]=ye)}me.length=xe+1;let j=t.getParameter(n.UNPACK_ROW_LENGTH),ie=t.getParameter(n.UNPACK_SKIP_PIXELS),_e=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,y.width);for(let Ne=0,Se=me.length;Ne<Se;Ne++){let ye=me[Ne],Be=Math.floor(ye.start/4),He=Math.ceil(ye.count/4),Ke=Be%y.width,U=Math.floor(Be/y.width),ge=He,ne=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Ke),t.pixelStorei(n.UNPACK_SKIP_ROWS,U),t.texSubImage2D(n.TEXTURE_2D,0,Ke,U,ge,ne,k,X,y.data)}C.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,j),t.pixelStorei(n.UNPACK_SKIP_PIXELS,ie),t.pixelStorei(n.UNPACK_SKIP_ROWS,_e)}}function Ie(C,y,k){let X=n.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=n.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=n.TEXTURE_3D);let Q=ee(C,y),me=y.source;t.bindTexture(X,C.__webglTexture,n.TEXTURE0+k);let xe=i.get(me);if(me.version!==xe.__version||Q===!0){if(t.activeTexture(n.TEXTURE0+k),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let ne=at.getPrimaries(at.workingColorSpace),ve=y.colorSpace===Mi?null:at.getPrimaries(y.colorSpace),be=y.colorSpace===Mi||ne===ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,be)}t.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment);let ie=m(y.image,!1,s.maxTextureSize);ie=dt(y,ie);let _e=r.convert(y.format,y.colorSpace),Ne=r.convert(y.type),Se=v(y.internalFormat,_e,Ne,y.normalized,y.colorSpace,y.isVideoTexture);$e(X,y);let ye,Be=y.mipmaps,He=y.isVideoTexture!==!0,Ke=xe.__version===void 0||Q===!0,U=me.dataReady,ge=b(y,ie);if(y.isDepthTexture)Se=w(y.format===Ji,y.type),Ke&&(He?t.texStorage2D(n.TEXTURE_2D,1,Se,ie.width,ie.height):t.texImage2D(n.TEXTURE_2D,0,Se,ie.width,ie.height,0,_e,Ne,null));else if(y.isDataTexture)if(Be.length>0){He&&Ke&&t.texStorage2D(n.TEXTURE_2D,ge,Se,Be[0].width,Be[0].height);for(let ne=0,ve=Be.length;ne<ve;ne++)ye=Be[ne],He?U&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,ye.width,ye.height,_e,Ne,ye.data):t.texImage2D(n.TEXTURE_2D,ne,Se,ye.width,ye.height,0,_e,Ne,ye.data);y.generateMipmaps=!1}else He?(Ke&&t.texStorage2D(n.TEXTURE_2D,ge,Se,ie.width,ie.height),U&&le(y,ie,_e,Ne)):t.texImage2D(n.TEXTURE_2D,0,Se,ie.width,ie.height,0,_e,Ne,ie.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){He&&Ke&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Se,Be[0].width,Be[0].height,ie.depth);for(let ne=0,ve=Be.length;ne<ve;ne++)if(ye=Be[ne],y.format!==gn)if(_e!==null)if(He){if(U)if(y.layerUpdates.size>0){let be=Rh(ye.width,ye.height,y.format,y.type);for(let oe of y.layerUpdates){let De=ye.data.subarray(oe*be/ye.data.BYTES_PER_ELEMENT,(oe+1)*be/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,oe,ye.width,ye.height,1,_e,De)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,ye.width,ye.height,ie.depth,_e,ye.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ne,Se,ye.width,ye.height,ie.depth,0,ye.data,0,0);else Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else He?U&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ne,0,0,0,ye.width,ye.height,ie.depth,_e,Ne,ye.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ne,Se,ye.width,ye.height,ie.depth,0,_e,Ne,ye.data)}else{He&&Ke&&t.texStorage2D(n.TEXTURE_2D,ge,Se,Be[0].width,Be[0].height);for(let ne=0,ve=Be.length;ne<ve;ne++)ye=Be[ne],y.format!==gn?_e!==null?He?U&&t.compressedTexSubImage2D(n.TEXTURE_2D,ne,0,0,ye.width,ye.height,_e,ye.data):t.compressedTexImage2D(n.TEXTURE_2D,ne,Se,ye.width,ye.height,0,ye.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):He?U&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,ye.width,ye.height,_e,Ne,ye.data):t.texImage2D(n.TEXTURE_2D,ne,Se,ye.width,ye.height,0,_e,Ne,ye.data)}else if(y.isDataArrayTexture)if(He){if(Ke&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Se,ie.width,ie.height,ie.depth),U)if(y.layerUpdates.size>0){let ne=Rh(ie.width,ie.height,y.format,y.type);for(let ve of y.layerUpdates){let be=ie.data.subarray(ve*ne/ie.data.BYTES_PER_ELEMENT,(ve+1)*ne/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ve,ie.width,ie.height,1,_e,Ne,be)}y.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,_e,Ne,ie.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Se,ie.width,ie.height,ie.depth,0,_e,Ne,ie.data);else if(y.isData3DTexture)He?(Ke&&t.texStorage3D(n.TEXTURE_3D,ge,Se,ie.width,ie.height,ie.depth),U&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,_e,Ne,ie.data)):t.texImage3D(n.TEXTURE_3D,0,Se,ie.width,ie.height,ie.depth,0,_e,Ne,ie.data);else if(y.isFramebufferTexture){if(Ke)if(He)t.texStorage2D(n.TEXTURE_2D,ge,Se,ie.width,ie.height);else{let ne=ie.width,ve=ie.height;for(let be=0;be<ge;be++)t.texImage2D(n.TEXTURE_2D,be,Se,ne,ve,0,_e,Ne,null),ne>>=1,ve>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in n){let ne=n.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),ie.parentNode!==ne){ne.appendChild(ie),h.add(y),ne.onpaint=ve=>{let be=ve.changedElements;for(let oe of h)be.includes(oe.image)&&(oe.needsUpdate=!0)},ne.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,ie);else{let be=n.RGBA,oe=n.RGBA,De=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,be,oe,De,ie)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Be.length>0){if(He&&Ke){let ne=tt(Be[0]);t.texStorage2D(n.TEXTURE_2D,ge,Se,ne.width,ne.height)}for(let ne=0,ve=Be.length;ne<ve;ne++)ye=Be[ne],He?U&&t.texSubImage2D(n.TEXTURE_2D,ne,0,0,_e,Ne,ye):t.texImage2D(n.TEXTURE_2D,ne,Se,_e,Ne,ye);y.generateMipmaps=!1}else if(He){if(Ke){let ne=tt(ie);t.texStorage2D(n.TEXTURE_2D,ge,Se,ne.width,ne.height)}U&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,_e,Ne,ie)}else t.texImage2D(n.TEXTURE_2D,0,Se,_e,Ne,ie);g(y)&&S(X),xe.__version=me.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function ke(C,y,k){if(y.image.length!==6)return;let X=ee(C,y),Q=y.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+k);let me=i.get(Q);if(Q.version!==me.__version||X===!0){t.activeTexture(n.TEXTURE0+k);let xe=at.getPrimaries(at.workingColorSpace),j=y.colorSpace===Mi?null:at.getPrimaries(y.colorSpace),ie=y.colorSpace===Mi||xe===j?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);let _e=y.isCompressedTexture||y.image[0].isCompressedTexture,Ne=y.image[0]&&y.image[0].isDataTexture,Se=[];for(let oe=0;oe<6;oe++)!_e&&!Ne?Se[oe]=m(y.image[oe],!0,s.maxCubemapSize):Se[oe]=Ne?y.image[oe].image:y.image[oe],Se[oe]=dt(y,Se[oe]);let ye=Se[0],Be=r.convert(y.format,y.colorSpace),He=r.convert(y.type),Ke=v(y.internalFormat,Be,He,y.normalized,y.colorSpace),U=y.isVideoTexture!==!0,ge=me.__version===void 0||X===!0,ne=Q.dataReady,ve=b(y,ye);$e(n.TEXTURE_CUBE_MAP,y);let be;if(_e){U&&ge&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,Ke,ye.width,ye.height);for(let oe=0;oe<6;oe++){be=Se[oe].mipmaps;for(let De=0;De<be.length;De++){let Re=be[De];y.format!==gn?Be!==null?U?ne&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De,0,0,Re.width,Re.height,Be,Re.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De,Ke,Re.width,Re.height,0,Re.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De,0,0,Re.width,Re.height,Be,He,Re.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De,Ke,Re.width,Re.height,0,Be,He,Re.data)}}}else{if(be=y.mipmaps,U&&ge){be.length>0&&ve++;let oe=tt(Se[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ve,Ke,oe.width,oe.height)}for(let oe=0;oe<6;oe++)if(Ne){U?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,Se[oe].width,Se[oe].height,Be,He,Se[oe].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Ke,Se[oe].width,Se[oe].height,0,Be,He,Se[oe].data);for(let De=0;De<be.length;De++){let At=be[De].image[oe].image;U?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De+1,0,0,At.width,At.height,Be,He,At.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De+1,Ke,At.width,At.height,0,Be,He,At.data)}}else{U?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,0,0,Be,He,Se[oe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0,Ke,Be,He,Se[oe]);for(let De=0;De<be.length;De++){let Re=be[De];U?ne&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De+1,0,0,Be,He,Re.image[oe]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,De+1,Ke,Be,He,Re.image[oe])}}}g(y)&&S(n.TEXTURE_CUBE_MAP),me.__version=Q.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function Ue(C,y,k,X,Q,me){let xe=r.convert(k.format,k.colorSpace),j=r.convert(k.type),ie=v(k.internalFormat,xe,j,k.normalized,k.colorSpace),_e=i.get(y),Ne=i.get(k);if(Ne.__renderTarget=y,!_e.__hasExternalTextures){let Se=Math.max(1,y.width>>me),ye=Math.max(1,y.height>>me);Q===n.TEXTURE_3D||Q===n.TEXTURE_2D_ARRAY?t.texImage3D(Q,me,ie,Se,ye,y.depth,0,xe,j,null):t.texImage2D(Q,me,ie,Se,ye,0,xe,j,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),je(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,X,Q,Ne.__webglTexture,0,Xe(y)):(Q===n.TEXTURE_2D||Q>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,X,Q,Ne.__webglTexture,me),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ct(C,y,k){if(n.bindRenderbuffer(n.RENDERBUFFER,C),y.depthBuffer){let X=y.depthTexture,Q=X&&X.isDepthTexture?X.type:null,me=w(y.stencilBuffer,Q),xe=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;je(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Xe(y),me,y.width,y.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Xe(y),me,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,me,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,xe,n.RENDERBUFFER,C)}else{let X=y.textures;for(let Q=0;Q<X.length;Q++){let me=X[Q],xe=r.convert(me.format,me.colorSpace),j=r.convert(me.type),ie=v(me.internalFormat,xe,j,me.normalized,me.colorSpace);je(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Xe(y),ie,y.width,y.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Xe(y),ie,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,ie,y.width,y.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ze(C,y,k){let X=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Q=i.get(y.depthTexture);if(Q.__renderTarget=y,(!Q.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),X){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),Q.__webglTexture===void 0){Q.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Q.__webglTexture),$e(n.TEXTURE_CUBE_MAP,y.depthTexture);let _e=r.convert(y.depthTexture.format),Ne=r.convert(y.depthTexture.type),Se;y.depthTexture.format===ei?Se=n.DEPTH_COMPONENT24:y.depthTexture.format===Ji&&(Se=n.DEPTH24_STENCIL8);for(let ye=0;ye<6;ye++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,Se,y.width,y.height,0,_e,Ne,null)}}else z(y.depthTexture,0);let me=Q.__webglTexture,xe=Xe(y),j=X?n.TEXTURE_CUBE_MAP_POSITIVE_X+k:n.TEXTURE_2D,ie=y.depthTexture.format===Ji?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(y.depthTexture.format===ei)je(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ie,j,me,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,ie,j,me,0);else if(y.depthTexture.format===Ji)je(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ie,j,me,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,ie,j,me,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function se(C){let y=i.get(C),k=C.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==C.depthTexture){let X=C.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),X){let Q=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,X.removeEventListener("dispose",Q)};X.addEventListener("dispose",Q),y.__depthDisposeCallback=Q}y.__boundDepthTexture=X}if(C.depthTexture&&!y.__autoAllocateDepthBuffer)if(k)for(let X=0;X<6;X++)ze(y.__webglFramebuffer[X],C,X);else{let X=C.texture.mipmaps;X&&X.length>0?ze(y.__webglFramebuffer[0],C,0):ze(y.__webglFramebuffer,C,0)}else if(k){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]===void 0)y.__webglDepthbuffer[X]=n.createRenderbuffer(),ct(y.__webglDepthbuffer[X],C,!1);else{let Q=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,me=y.__webglDepthbuffer[X];n.bindRenderbuffer(n.RENDERBUFFER,me),n.framebufferRenderbuffer(n.FRAMEBUFFER,Q,n.RENDERBUFFER,me)}}else{let X=C.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=n.createRenderbuffer(),ct(y.__webglDepthbuffer,C,!1);else{let Q=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,me=y.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,me),n.framebufferRenderbuffer(n.FRAMEBUFFER,Q,n.RENDERBUFFER,me)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(C,y,k){let X=i.get(C);y!==void 0&&Ue(X.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&se(C)}function he(C){let y=C.texture,k=i.get(C),X=i.get(y);C.addEventListener("dispose",_);let Q=C.textures,me=C.isWebGLCubeRenderTarget===!0,xe=Q.length>1;if(xe||(X.__webglTexture===void 0&&(X.__webglTexture=n.createTexture()),X.__version=y.version,o.memory.textures++),me){k.__webglFramebuffer=[];for(let j=0;j<6;j++)if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer[j]=[];for(let ie=0;ie<y.mipmaps.length;ie++)k.__webglFramebuffer[j][ie]=n.createFramebuffer()}else k.__webglFramebuffer[j]=n.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer=[];for(let j=0;j<y.mipmaps.length;j++)k.__webglFramebuffer[j]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(xe)for(let j=0,ie=Q.length;j<ie;j++){let _e=i.get(Q[j]);_e.__webglTexture===void 0&&(_e.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&je(C)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let j=0;j<Q.length;j++){let ie=Q[j];k.__webglColorRenderbuffer[j]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[j]);let _e=r.convert(ie.format,ie.colorSpace),Ne=r.convert(ie.type),Se=v(ie.internalFormat,_e,Ne,ie.normalized,ie.colorSpace,C.isXRRenderTarget===!0),ye=Xe(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,ye,Se,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+j,n.RENDERBUFFER,k.__webglColorRenderbuffer[j])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),ct(k.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(me){t.bindTexture(n.TEXTURE_CUBE_MAP,X.__webglTexture),$e(n.TEXTURE_CUBE_MAP,y);for(let j=0;j<6;j++)if(y.mipmaps&&y.mipmaps.length>0)for(let ie=0;ie<y.mipmaps.length;ie++)Ue(k.__webglFramebuffer[j][ie],C,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+j,ie);else Ue(k.__webglFramebuffer[j],C,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);g(y)&&S(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let j=0,ie=Q.length;j<ie;j++){let _e=Q[j],Ne=i.get(_e),Se=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Se=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Se,Ne.__webglTexture),$e(Se,_e),Ue(k.__webglFramebuffer,C,_e,n.COLOR_ATTACHMENT0+j,Se,0),g(_e)&&S(Se)}t.unbindTexture()}else{let j=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(j=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(j,X.__webglTexture),$e(j,y),y.mipmaps&&y.mipmaps.length>0)for(let ie=0;ie<y.mipmaps.length;ie++)Ue(k.__webglFramebuffer[ie],C,y,n.COLOR_ATTACHMENT0,j,ie);else Ue(k.__webglFramebuffer,C,y,n.COLOR_ATTACHMENT0,j,0);g(y)&&S(j),t.unbindTexture()}C.depthBuffer&&se(C)}function Ee(C){let y=C.textures;for(let k=0,X=y.length;k<X;k++){let Q=y[k];if(g(Q)){let me=E(C),xe=i.get(Q).__webglTexture;t.bindTexture(me,xe),S(me),t.unbindTexture()}}}let fe=[],Oe=[];function Pe(C){if(C.samples>0){if(je(C)===!1){let y=C.textures,k=C.width,X=C.height,Q=n.COLOR_BUFFER_BIT,me=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=i.get(C),j=y.length>1;if(j)for(let _e=0;_e<y.length;_e++)t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_e,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_e,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);let ie=C.texture.mipmaps;ie&&ie.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let _e=0;_e<y.length;_e++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Q|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Q|=n.STENCIL_BUFFER_BIT)),j){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,xe.__webglColorRenderbuffer[_e]);let Ne=i.get(y[_e]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ne,0)}n.blitFramebuffer(0,0,k,X,0,0,k,X,Q,n.NEAREST),c===!0&&(fe.length=0,Oe.length=0,fe.push(n.COLOR_ATTACHMENT0+_e),C.depthBuffer&&C.resolveDepthBuffer===!1&&(fe.push(me),Oe.push(me),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Oe)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,fe))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),j)for(let _e=0;_e<y.length;_e++){t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_e,n.RENDERBUFFER,xe.__webglColorRenderbuffer[_e]);let Ne=i.get(y[_e]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,xe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_e,n.TEXTURE_2D,Ne,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){let y=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[y])}}}function Xe(C){return Math.min(s.maxSamples,C.samples)}function je(C){let y=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function N(C){let y=o.render.frame;u.get(C)!==y&&(u.set(C,y),C.update())}function dt(C,y){let k=C.colorSpace,X=C.format,Q=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||k!==eo&&k!==Mi&&(at.getTransfer(k)===mt?(X!==gn||Q!==on)&&Ve("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ge("WebGLTextures: Unsupported texture color space:",k)),y}function tt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=$,this.resetTextureUnits=H,this.getTextureUnits=F,this.setTextureUnits=L,this.setTexture2D=z,this.setTexture2DArray=K,this.setTexture3D=ce,this.setTextureCube=V,this.rebindTextures=ue,this.setupRenderTarget=he,this.updateRenderTargetMipmap=Ee,this.updateMultisampleRenderTarget=Pe,this.setupDepthRenderbuffer=se,this.setupFrameBufferTexture=Ue,this.useMultisampledRTT=je,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function zS(n,e){function t(i,s=Mi){let r,o=at.getTransfer(s);if(i===on)return n.UNSIGNED_BYTE;if(i===Lc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Oc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===xh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===vh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===mh)return n.BYTE;if(i===gh)return n.SHORT;if(i===vr)return n.UNSIGNED_SHORT;if(i===Dc)return n.INT;if(i===qn)return n.UNSIGNED_INT;if(i===Yn)return n.FLOAT;if(i===ri)return n.HALF_FLOAT;if(i===_h)return n.ALPHA;if(i===yh)return n.RGB;if(i===gn)return n.RGBA;if(i===ei)return n.DEPTH_COMPONENT;if(i===Ji)return n.DEPTH_STENCIL;if(i===bh)return n.RED;if(i===Nc)return n.RED_INTEGER;if(i===Qi)return n.RG;if(i===Fc)return n.RG_INTEGER;if(i===Uc)return n.RGBA_INTEGER;if(i===Co||i===Ro||i===Io||i===Po)if(o===mt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Co)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Co)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Io)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Bc||i===kc||i===zc||i===Hc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Bc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===kc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===zc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Hc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Vc||i===Gc||i===Wc||i===Xc||i===qc||i===Do||i===Yc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Vc||i===Gc)return o===mt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Wc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Xc)return r.COMPRESSED_R11_EAC;if(i===qc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Do)return r.COMPRESSED_RG11_EAC;if(i===Yc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===$c||i===jc||i===Zc||i===Kc||i===Jc||i===Qc||i===el||i===tl||i===nl||i===il||i===sl||i===rl||i===ol||i===al)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===$c)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===jc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Zc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Kc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Jc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Qc)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===el)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===tl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===nl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===il)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===sl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===rl)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ol)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===al)return o===mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===cl||i===ll||i===ul)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===cl)return o===mt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ll)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ul)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===hl||i===dl||i===Lo||i===fl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===hl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===dl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Lo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===fl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===_r?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var HS=\`
void main() {

	gl_Position = vec4( position, 1.0 );

}\`,VS=\`
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

}\`,Gh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new co(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new tn({vertexShader:HS,fragmentShader:VS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Je(new vo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Wh=class extends Xn{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,d=null,f=null,p=null,x=typeof XRWebGLBinding<"u",m=new Gh,g={},S=t.getContextAttributes(),E=null,v=null,w=[],b=[],A=new de,_=null,T=new Qt;T.viewport=new Rt;let I=new Qt;I.viewport=new Rt;let P=[T,I],D=new Cc,H=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let pe=w[ee];return pe===void 0&&(pe=new lr,w[ee]=pe),pe.getTargetRaySpace()},this.getControllerGrip=function(ee){let pe=w[ee];return pe===void 0&&(pe=new lr,w[ee]=pe),pe.getGripSpace()},this.getHand=function(ee){let pe=w[ee];return pe===void 0&&(pe=new lr,w[ee]=pe),pe.getHandSpace()};function L(ee){let pe=b.indexOf(ee.inputSource);if(pe===-1)return;let le=w[pe];le!==void 0&&(le.update(ee.inputSource,ee.frame,l||o),le.dispatchEvent({type:ee.type,data:ee.inputSource}))}function $(){s.removeEventListener("select",L),s.removeEventListener("selectstart",L),s.removeEventListener("selectend",L),s.removeEventListener("squeeze",L),s.removeEventListener("squeezestart",L),s.removeEventListener("squeezeend",L),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",q);for(let ee=0;ee<w.length;ee++){let pe=b[ee];pe!==null&&(b[ee]=null,w[ee].disconnect(pe))}H=null,F=null,m.reset();for(let ee in g)delete g[ee];e.setRenderTarget(E),f=null,d=null,h=null,s=null,v=null,$e.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&Ve("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){a=ee,i.isPresenting===!0&&Ve("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(ee){l=ee},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",L),s.addEventListener("selectstart",L),s.addEventListener("selectend",L),s.addEventListener("squeeze",L),s.addEventListener("squeezestart",L),s.addEventListener("squeezeend",L),s.addEventListener("end",$),s.addEventListener("inputsourceschange",q),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Ie=null,ke=null;S.depth&&(ke=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=S.stencil?Ji:ei,Ie=S.stencil?_r:qn);let Ue={colorFormat:t.RGBA8,depthFormat:ke,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Ue),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new En(d.textureWidth,d.textureHeight,{format:gn,type:on,depthTexture:new vi(d.textureWidth,d.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let le={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new En(f.framebufferWidth,f.framebufferHeight,{format:gn,type:on,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),$e.setContext(s),$e.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q(ee){for(let pe=0;pe<ee.removed.length;pe++){let le=ee.removed[pe],Ie=b.indexOf(le);Ie>=0&&(b[Ie]=null,w[Ie].disconnect(le))}for(let pe=0;pe<ee.added.length;pe++){let le=ee.added[pe],Ie=b.indexOf(le);if(Ie===-1){for(let Ue=0;Ue<w.length;Ue++)if(Ue>=b.length){b.push(le),Ie=Ue;break}else if(b[Ue]===null){b[Ue]=le,Ie=Ue;break}if(Ie===-1)break}let ke=w[Ie];ke&&ke.connect(le)}}let z=new O,K=new O;function ce(ee,pe,le){z.setFromMatrixPosition(pe.matrixWorld),K.setFromMatrixPosition(le.matrixWorld);let Ie=z.distanceTo(K),ke=pe.projectionMatrix.elements,Ue=le.projectionMatrix.elements,ct=ke[14]/(ke[10]-1),ze=ke[14]/(ke[10]+1),se=(ke[9]+1)/ke[5],ue=(ke[9]-1)/ke[5],he=(ke[8]-1)/ke[0],Ee=(Ue[8]+1)/Ue[0],fe=ct*he,Oe=ct*Ee,Pe=Ie/(-he+Ee),Xe=Pe*-he;if(pe.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(Xe),ee.translateZ(Pe),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),ke[10]===-1)ee.projectionMatrix.copy(pe.projectionMatrix),ee.projectionMatrixInverse.copy(pe.projectionMatrixInverse);else{let je=ct+Pe,N=ze+Pe,dt=fe-Xe,tt=Oe+(Ie-Xe),C=se*ze/N*je,y=ue*ze/N*je;ee.projectionMatrix.makePerspective(dt,tt,C,y,je,N),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function V(ee,pe){pe===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(pe.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let pe=ee.near,le=ee.far;m.texture!==null&&(m.depthNear>0&&(pe=m.depthNear),m.depthFar>0&&(le=m.depthFar)),D.near=I.near=T.near=pe,D.far=I.far=T.far=le,(H!==D.near||F!==D.far)&&(s.updateRenderState({depthNear:D.near,depthFar:D.far}),H=D.near,F=D.far),D.layers.mask=ee.layers.mask|6,T.layers.mask=D.layers.mask&-5,I.layers.mask=D.layers.mask&-3;let Ie=ee.parent,ke=D.cameras;V(D,Ie);for(let Ue=0;Ue<ke.length;Ue++)V(ke[Ue],Ie);ke.length===2?ce(D,T,I):D.projectionMatrix.copy(T.projectionMatrix),te(ee,D,Ie)};function te(ee,pe,le){le===null?ee.matrix.copy(pe.matrixWorld):(ee.matrix.copy(le.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(pe.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(pe.projectionMatrix),ee.projectionMatrixInverse.copy(pe.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=Ms*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(ee){c=ee,d!==null&&(d.fixedFoveation=ee),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ee)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(D)},this.getCameraTexture=function(ee){return g[ee]};let Me=null;function Ye(ee,pe){if(u=pe.getViewerPose(l||o),p=pe,u!==null){let le=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Ie=!1;le.length!==D.cameras.length&&(D.cameras.length=0,Ie=!0);for(let ze=0;ze<le.length;ze++){let se=le[ze],ue=null;if(f!==null)ue=f.getViewport(se);else{let Ee=h.getViewSubImage(d,se);ue=Ee.viewport,ze===0&&(e.setRenderTargetTextures(v,Ee.colorTexture,Ee.depthStencilTexture),e.setRenderTarget(v))}let he=P[ze];he===void 0&&(he=new Qt,he.layers.enable(ze),he.viewport=new Rt,P[ze]=he),he.matrix.fromArray(se.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(se.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(ue.x,ue.y,ue.width,ue.height),ze===0&&(D.matrix.copy(he.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),Ie===!0&&D.cameras.push(he)}let ke=s.enabledFeatures;if(ke&&ke.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=i.getBinding();let ze=h.getDepthInformation(le[0]);ze&&ze.isValid&&ze.texture&&m.init(ze,s.renderState)}if(ke&&ke.includes("camera-access")&&x){e.state.unbindTexture(),h=i.getBinding();for(let ze=0;ze<le.length;ze++){let se=le[ze].camera;if(se){let ue=g[se];ue||(ue=new co,g[se]=ue);let he=h.getCameraImage(se);ue.sourceTexture=he}}}}for(let le=0;le<w.length;le++){let Ie=b[le],ke=w[le];Ie!==null&&ke!==void 0&&ke.update(Ie,pe,l||o)}Me&&Me(ee,pe),pe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:pe}),p=null}let $e=new Jp;$e.setAnimationLoop(Ye),this.setAnimationLoop=function(ee){Me=ee},this.dispose=function(){}}},GS=new wt,sm=new Ze;sm.set(-1,0,0,0,1,0,0,0,1);function WS(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,Th(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,S,E,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),h(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?c(m,g,S,E):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===dn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===dn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let S=e.get(g),E=S.envMap,v=S.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(GS.makeRotationFromEuler(v)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(sm),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,S,E){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*S,m.scale.value=E*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,S){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===dn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let S=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function XS(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(v,w){let b=w.program;i.uniformBlockBinding(v,b)}function l(v,w){let b=s[v.id];b===void 0&&(m(v),b=u(v),s[v.id]=b,v.addEventListener("dispose",S));let A=w.program;i.updateUBOMapping(v,A);let _=e.render.frame;r[v.id]!==_&&(d(v),r[v.id]=_)}function u(v){let w=h();v.__bindingPointIndex=w;let b=n.createBuffer(),A=v.__size,_=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,A,_),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,b),b}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return Ge("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let w=s[v.id],b=v.uniforms,A=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let _=0,T=b.length;_<T;_++){let I=b[_];if(Array.isArray(I))for(let P=0,D=I.length;P<D;P++)f(I[P],_,P,A);else f(I,_,0,A)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(v,w,b,A){if(x(v,w,b,A)===!0){let _=v.__offset,T=v.value;if(Array.isArray(T)){let I=0;for(let P=0;P<T.length;P++){let D=T[P],H=g(D);p(D,v.__data,I),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(I+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(T,v.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,_,v.__data)}}function p(v,w,b){typeof v=="number"||typeof v=="boolean"?w[0]=v:v.isMatrix3?(w[0]=v.elements[0],w[1]=v.elements[1],w[2]=v.elements[2],w[3]=0,w[4]=v.elements[3],w[5]=v.elements[4],w[6]=v.elements[5],w[7]=0,w[8]=v.elements[6],w[9]=v.elements[7],w[10]=v.elements[8],w[11]=0):ArrayBuffer.isView(v)?w.set(new v.constructor(v.buffer,v.byteOffset,w.length)):v.toArray(w,b)}function x(v,w,b,A){let _=v.value,T=w+"_"+b;if(A[T]===void 0)return typeof _=="number"||typeof _=="boolean"?A[T]=_:ArrayBuffer.isView(_)?A[T]=_.slice():A[T]=_.clone(),!0;{let I=A[T];if(typeof _=="number"||typeof _=="boolean"){if(I!==_)return A[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(I.equals(_)===!1)return I.copy(_),!0}}return!1}function m(v){let w=v.uniforms,b=0,A=16;for(let T=0,I=w.length;T<I;T++){let P=Array.isArray(w[T])?w[T]:[w[T]];for(let D=0,H=P.length;D<H;D++){let F=P[D],L=Array.isArray(F.value)?F.value:[F.value];for(let $=0,q=L.length;$<q;$++){let z=L[$],K=g(z),ce=b%A,V=ce%K.boundary,te=ce+V;b+=V,te!==0&&A-te<K.storage&&(b+=A-te),F.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=b,b+=K.storage}}}let _=b%A;return _>0&&(b+=A-_),v.__size=b,v.__cache={},this}function g(v){let w={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(w.boundary=4,w.storage=4):v.isVector2?(w.boundary=8,w.storage=8):v.isVector3||v.isColor?(w.boundary=16,w.storage=12):v.isVector4?(w.boundary=16,w.storage=16):v.isMatrix3?(w.boundary=48,w.storage=48):v.isMatrix4?(w.boundary=64,w.storage=64):v.isTexture?Ve("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(w.boundary=16,w.storage=v.byteLength):Ve("WebGLRenderer: Unsupported uniform value type.",v),w}function S(v){let w=v.target;w.removeEventListener("dispose",S);let b=o.indexOf(w.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function E(){for(let v in s)n.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:c,update:l,dispose:E}}var qS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),oi=null;function YS(){return oi===null&&(oi=new ti(qS,16,16,Qi,ri),oi.name="DFG_LUT",oi.minFilter=Pt,oi.magFilter=Pt,oi.wrapS=Qn,oi.wrapT=Qn,oi.generateMipmaps=!1,oi.needsUpdate=!0),oi}var bl=class{constructor(e={}){let{canvas:t=_p(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=on}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;let x=f,m=new Set([Uc,Fc,Nc]),g=new Set([on,qn,vr,_r,Lc,Oc]),S=new Uint32Array(4),E=new Int32Array(4),v=new O,w=null,b=null,A=[],_=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Rn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,P=!1,D=null,H=null,F=null,L=null;this._outputColorSpace=Ft;let $=0,q=0,z=null,K=-1,ce=null,V=new Rt,te=new Rt,Me=null,Ye=new We(0),$e=0,ee=t.width,pe=t.height,le=1,Ie=null,ke=null,Ue=new Rt(0,0,ee,pe),ct=new Rt(0,0,ee,pe),ze=!1,se=new hr,ue=!1,he=!1,Ee=new wt,fe=new O,Oe=new Rt,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Xe=!1;function je(){return z===null?le:1}let N=i;function dt(M,B){return t.getContext(M,B)}try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",\`three.js r\${"185"}\`),t.addEventListener("webglcontextlost",At,!1),t.addEventListener("webglcontextrestored",pt,!1),t.addEventListener("webglcontextcreationerror",On,!1),N===null){let B="webgl2";if(N=dt(B,M),N===null)throw dt(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw Ge("WebGLRenderer: "+M.message),M}let tt,C,y,k,X,Q,me,xe,j,ie,_e,Ne,Se,ye,Be,He,Ke,U,ge,ne,ve,be,oe;function De(){tt=new eM(N),tt.init(),ve=new zS(N,tt),C=new qb(N,tt,e,ve),y=new BS(N,tt),C.reversedDepthBuffer&&d&&y.buffers.depth.setReversed(!0),H=N.createFramebuffer(),F=N.createFramebuffer(),L=N.createFramebuffer(),k=new iM(N),X=new ES,Q=new kS(N,tt,y,X,C,ve,k),me=new Qb(I),xe=new a_(N),be=new Wb(N,xe),j=new tM(N,xe,k,be),ie=new rM(N,j,xe,be,k),U=new sM(N,C,Q),Be=new Yb(X),_e=new SS(I,me,tt,C,be,Be),Ne=new WS(I,X),Se=new TS,ye=new DS(tt),Ke=new Gb(I,me,y,ie,p,c),He=new US(I,ie,C),oe=new XS(N,k,C,y),ge=new Xb(N,tt,k),ne=new nM(N,tt,k),k.programs=_e.programs,I.capabilities=C,I.extensions=tt,I.properties=X,I.renderLists=Se,I.shadowMap=He,I.state=y,I.info=k}De(),x!==on&&(T=new aM(x,t.width,t.height,a,s,r));let Re=new Wh(I,N);this.xr=Re,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let M=tt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=tt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(M){M!==void 0&&(le=M,this.setSize(ee,pe,!1))},this.getSize=function(M){return M.set(ee,pe)},this.setSize=function(M,B,Z=!0){if(Re.isPresenting){Ve("WebGLRenderer: Can't change size while VR device is presenting.");return}ee=M,pe=B,t.width=Math.floor(M*le),t.height=Math.floor(B*le),Z===!0&&(t.style.width=M+"px",t.style.height=B+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,M,B)},this.getDrawingBufferSize=function(M){return M.set(ee*le,pe*le).floor()},this.setDrawingBufferSize=function(M,B,Z){ee=M,pe=B,le=Z,t.width=Math.floor(M*Z),t.height=Math.floor(B*Z),this.setViewport(0,0,M,B)},this.setEffects=function(M){if(x===on){Ge("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let B=0;B<M.length;B++)if(M[B].isOutputPass===!0){Ve("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(V)},this.getViewport=function(M){return M.copy(Ue)},this.setViewport=function(M,B,Z,G){M.isVector4?Ue.set(M.x,M.y,M.z,M.w):Ue.set(M,B,Z,G),y.viewport(V.copy(Ue).multiplyScalar(le).round())},this.getScissor=function(M){return M.copy(ct)},this.setScissor=function(M,B,Z,G){M.isVector4?ct.set(M.x,M.y,M.z,M.w):ct.set(M,B,Z,G),y.scissor(te.copy(ct).multiplyScalar(le).round())},this.getScissorTest=function(){return ze},this.setScissorTest=function(M){y.setScissorTest(ze=M)},this.setOpaqueSort=function(M){Ie=M},this.setTransparentSort=function(M){ke=M},this.getClearColor=function(M){return M.copy(Ke.getClearColor())},this.setClearColor=function(){Ke.setClearColor(...arguments)},this.getClearAlpha=function(){return Ke.getClearAlpha()},this.setClearAlpha=function(){Ke.setClearAlpha(...arguments)},this.clear=function(M=!0,B=!0,Z=!0){let G=0;if(M){let W=!1;if(z!==null){let R=z.texture.format;W=m.has(R)}if(W){let R=z.texture.type,Y=g.has(R),J=Ke.getClearColor(),re=Ke.getClearAlpha(),ae=J.r,Ae=J.g,qe=J.b;Y?(S[0]=ae,S[1]=Ae,S[2]=qe,S[3]=re,N.clearBufferuiv(N.COLOR,0,S)):(E[0]=ae,E[1]=Ae,E[2]=qe,E[3]=re,N.clearBufferiv(N.COLOR,0,E))}else G|=N.COLOR_BUFFER_BIT}B&&(G|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Z&&(G|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&N.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),D=M},this.dispose=function(){t.removeEventListener("webglcontextlost",At,!1),t.removeEventListener("webglcontextrestored",pt,!1),t.removeEventListener("webglcontextcreationerror",On,!1),Ke.dispose(),Se.dispose(),ye.dispose(),X.dispose(),me.dispose(),ie.dispose(),be.dispose(),oe.dispose(),_e.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",ua),Re.removeEventListener("sessionend",ha),ui.stop()};function At(M){M.preventDefault(),Sh("WebGLRenderer: Context Lost."),P=!0}function pt(){Sh("WebGLRenderer: Context Restored."),P=!1;let M=k.autoReset,B=He.enabled,Z=He.autoUpdate,G=He.needsUpdate,W=He.type;De(),k.autoReset=M,He.enabled=B,He.autoUpdate=Z,He.needsUpdate=G,He.type=W}function On(M){Ge("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function un(M){let B=M.target;B.removeEventListener("dispose",un),su(B)}function su(M){ru(M),X.remove(M)}function ru(M){let B=X.get(M).programs;B!==void 0&&(B.forEach(function(Z){_e.releaseProgram(Z)}),M.isShaderMaterial&&_e.releaseShaderCache(M))}this.renderBufferDirect=function(M,B,Z,G,W,R){B===null&&(B=Pe);let Y=W.isMesh&&W.matrixWorld.determinantAffine()<0,J=pa(M,B,Z,G,W);y.setMaterial(G,Y);let re=Z.index,ae=1;if(G.wireframe===!0){if(re=j.getWireframeAttribute(Z),re===void 0)return;ae=2}let Ae=Z.drawRange,qe=Z.attributes.position,Te=Ae.start*ae,lt=(Ae.start+Ae.count)*ae;R!==null&&(Te=Math.max(Te,R.start*ae),lt=Math.min(lt,(R.start+R.count)*ae)),re!==null?(Te=Math.max(Te,0),lt=Math.min(lt,re.count)):qe!=null&&(Te=Math.max(Te,0),lt=Math.min(lt,qe.count));let bt=lt-Te;if(bt<0||bt===1/0)return;be.setup(W,G,J,Z,re);let vt,xt=ge;if(re!==null&&(vt=xe.get(re),xt=ne,xt.setIndex(vt)),W.isMesh)G.wireframe===!0?(y.setLineWidth(G.wireframeLinewidth*je()),xt.setMode(N.LINES)):xt.setMode(N.TRIANGLES);else if(W.isLine){let Ct=G.linewidth;Ct===void 0&&(Ct=1),y.setLineWidth(Ct*je()),W.isLineSegments?xt.setMode(N.LINES):W.isLineLoop?xt.setMode(N.LINE_LOOP):xt.setMode(N.LINE_STRIP)}else W.isPoints?xt.setMode(N.POINTS):W.isSprite&&xt.setMode(N.TRIANGLES);if(W.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))xt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let Ct=W._multiDrawStarts,Ce=W._multiDrawCounts,yn=W._multiDrawCount,ht=re?xe.get(re).bytesPerElement:1,Nn=X.get(G).currentProgram.getUniforms();for(let Kn=0;Kn<yn;Kn++)Nn.setValue(N,"_gl_DrawID",Kn),xt.render(Ct[Kn]/ht,Ce[Kn])}else if(W.isInstancedMesh)xt.renderInstances(Te,bt,W.count);else if(Z.isInstancedBufferGeometry){let Ct=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Ce=Math.min(Z.instanceCount,Ct);xt.renderInstances(Te,bt,Ce)}else xt.render(Te,bt)};function la(M,B,Z){M.transparent===!0&&M.side===Tt&&M.forceSinglePass===!1?(M.side=dn,M.needsUpdate=!0,Ii(M,B,Z),M.side=pn,M.needsUpdate=!0,Ii(M,B,Z),M.side=Tt):Ii(M,B,Z)}this.compile=function(M,B,Z=null){Z===null&&(Z=M),b=ye.get(Z),b.init(B),_.push(b),Z.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(b.pushLight(W),W.castShadow&&b.pushShadow(W))}),M!==Z&&M.traverseVisible(function(W){W.isLight&&W.layers.test(B.layers)&&(b.pushLight(W),W.castShadow&&b.pushShadow(W))}),b.setupLights();let G=new Set;return M.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let R=W.material;if(R)if(Array.isArray(R))for(let Y=0;Y<R.length;Y++){let J=R[Y];la(J,Z,W),G.add(J)}else la(R,Z,W),G.add(R)}),b=_.pop(),G},this.compileAsync=function(M,B,Z=null){let G=this.compile(M,B,Z);return new Promise(W=>{function R(){if(G.forEach(function(Y){X.get(Y).currentProgram.isReady()&&G.delete(Y)}),G.size===0){W(M);return}setTimeout(R,10)}tt.get("KHR_parallel_shader_compile")!==null?R():setTimeout(R,10)})};let zs=null;function ou(M){zs&&zs(M)}function ua(){ui.stop()}function ha(){ui.start()}let ui=new Jp;ui.setAnimationLoop(ou),typeof self<"u"&&ui.setContext(self),this.setAnimationLoop=function(M){zs=M,Re.setAnimationLoop(M),M===null?ui.stop():ui.start()},Re.addEventListener("sessionstart",ua),Re.addEventListener("sessionend",ha),this.render=function(M,B){if(B!==void 0&&B.isCamera!==!0){Ge("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;D!==null&&D.renderStart(M,B);let Z=Re.enabled===!0&&Re.isPresenting===!0,G=T!==null&&(z===null||Z)&&T.begin(I,z);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(B),B=Re.getCamera()),M.isScene===!0&&M.onBeforeRender(I,M,B,z),b=ye.get(M,_.length),b.init(B),b.state.textureUnits=Q.getTextureUnits(),_.push(b),Ee.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),se.setFromProjectionMatrix(Ee,Wn,B.reversedDepth),he=this.localClippingEnabled,ue=Be.init(this.clippingPlanes,he),w=Se.get(M,A.length),w.init(),A.push(w),Re.enabled===!0&&Re.isPresenting===!0){let Y=I.xr.getDepthSensingMesh();Y!==null&&fn(Y,B,-1/0,I.sortObjects)}fn(M,B,0,I.sortObjects),w.finish(),I.sortObjects===!0&&w.sort(Ie,ke,B.reversedDepth),Xe=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,Xe&&Ke.addToRenderList(w,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ue===!0&&Be.beginShadows();let W=b.state.shadowsArray;if(He.render(W,M,B),ue===!0&&Be.endShadows(),(G&&T.hasRenderPass())===!1){let Y=w.opaque,J=w.transmissive;if(b.setupLights(),B.isArrayCamera){let re=B.cameras;if(J.length>0)for(let ae=0,Ae=re.length;ae<Ae;ae++){let qe=re[ae];da(Y,J,M,qe)}Xe&&Ke.render(M);for(let ae=0,Ae=re.length;ae<Ae;ae++){let qe=re[ae];Zn(w,M,qe,qe.viewport)}}else J.length>0&&da(Y,J,M,B),Xe&&Ke.render(M),Zn(w,M,B)}z!==null&&q===0&&(Q.updateMultisampleRenderTarget(z),Q.updateRenderTargetMipmap(z)),G&&T.end(I),M.isScene===!0&&M.onAfterRender(I,M,B),be.resetDefaultState(),K=-1,ce=null,_.pop(),_.length>0?(b=_[_.length-1],Q.setTextureUnits(b.state.textureUnits),ue===!0&&Be.setGlobalState(I.clippingPlanes,b.state.camera)):b=null,A.pop(),A.length>0?w=A[A.length-1]:w=null,D!==null&&D.renderEnd()};function fn(M,B,Z,G){if(M.visible===!1)return;if(M.layers.test(B.layers)){if(M.isGroup)Z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(B);else if(M.isLightProbeGrid)b.pushLightProbeGrid(M);else if(M.isLight)b.pushLight(M),M.castShadow&&b.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||se.intersectsSprite(M)){G&&Oe.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ee);let Y=ie.update(M),J=M.material;J.visible&&w.push(M,Y,J,Z,Oe.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||se.intersectsObject(M))){let Y=ie.update(M),J=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Oe.copy(M.boundingSphere.center)):(Y.boundingSphere===null&&Y.computeBoundingSphere(),Oe.copy(Y.boundingSphere.center)),Oe.applyMatrix4(M.matrixWorld).applyMatrix4(Ee)),Array.isArray(J)){let re=Y.groups;for(let ae=0,Ae=re.length;ae<Ae;ae++){let qe=re[ae],Te=J[qe.materialIndex];Te&&Te.visible&&w.push(M,Y,Te,Z,Oe.z,qe)}}else J.visible&&w.push(M,Y,J,Z,Oe.z,null)}}let R=M.children;for(let Y=0,J=R.length;Y<J;Y++)fn(R[Y],B,Z,G)}function Zn(M,B,Z,G){let{opaque:W,transmissive:R,transparent:Y}=M;b.setupLightsView(Z),ue===!0&&Be.setGlobalState(I.clippingPlanes,Z),G&&y.viewport(V.copy(G)),W.length>0&&Ri(W,B,Z),R.length>0&&Ri(R,B,Z),Y.length>0&&Ri(Y,B,Z),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function da(M,B,Z,G){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[G.id]===void 0){let Te=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[G.id]=new En(1,1,{generateMipmaps:!0,type:Te?ri:on,minFilter:si,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:at.workingColorSpace})}let R=b.state.transmissionRenderTarget[G.id],Y=G.viewport||V;R.setSize(Y.z*I.transmissionResolutionScale,Y.w*I.transmissionResolutionScale);let J=I.getRenderTarget(),re=I.getActiveCubeFace(),ae=I.getActiveMipmapLevel();I.setRenderTarget(R),I.getClearColor(Ye),$e=I.getClearAlpha(),$e<1&&I.setClearColor(16777215,.5),I.clear(),Xe&&Ke.render(Z);let Ae=I.toneMapping;I.toneMapping=Rn;let qe=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),b.setupLightsView(G),ue===!0&&Be.setGlobalState(I.clippingPlanes,G),Ri(M,Z,G),Q.updateMultisampleRenderTarget(R),Q.updateRenderTargetMipmap(R),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Te=!1;for(let lt=0,bt=B.length;lt<bt;lt++){let vt=B[lt],{object:xt,geometry:Ct,material:Ce,group:yn}=vt;if(Ce.side===Tt&&xt.layers.test(G.layers)){let ht=Ce.side;Ce.side=dn,Ce.needsUpdate=!0,Br(xt,Z,G,Ct,Ce,yn),Ce.side=ht,Ce.needsUpdate=!0,Te=!0}}Te===!0&&(Q.updateMultisampleRenderTarget(R),Q.updateRenderTargetMipmap(R))}I.setRenderTarget(J,re,ae),I.setClearColor(Ye,$e),qe!==void 0&&(G.viewport=qe),I.toneMapping=Ae}function Ri(M,B,Z){let G=B.isScene===!0?B.overrideMaterial:null;for(let W=0,R=M.length;W<R;W++){let Y=M[W],{object:J,geometry:re,group:ae}=Y,Ae=Y.material;Ae.allowOverride===!0&&G!==null&&(Ae=G),J.layers.test(Z.layers)&&Br(J,B,Z,re,Ae,ae)}}function Br(M,B,Z,G,W,R){M.onBeforeRender(I,B,Z,G,W,R),M.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),W.onBeforeRender(I,B,Z,G,M,R),W.transparent===!0&&W.side===Tt&&W.forceSinglePass===!1?(W.side=dn,W.needsUpdate=!0,I.renderBufferDirect(Z,B,G,W,M,R),W.side=pn,W.needsUpdate=!0,I.renderBufferDirect(Z,B,G,W,M,R),W.side=Tt):I.renderBufferDirect(Z,B,G,W,M,R),M.onAfterRender(I,B,Z,G,W,R)}function Ii(M,B,Z){B.isScene!==!0&&(B=Pe);let G=X.get(M),W=b.state.lights,R=b.state.shadowsArray,Y=W.state.version,J=_e.getParameters(M,W.state,R,B,Z,b.state.lightProbeGridArray),re=_e.getProgramCacheKey(J),ae=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?B.environment:null,G.fog=B.fog;let Ae=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=me.get(M.envMap||G.environment,Ae),G.envMapRotation=G.environment!==null&&M.envMap===null?B.environmentRotation:M.envMapRotation,ae===void 0&&(M.addEventListener("dispose",un),ae=new Map,G.programs=ae);let qe=ae.get(re);if(qe!==void 0){if(G.currentProgram===qe&&G.lightsStateVersion===Y)return kr(M,J),qe}else J.uniforms=_e.getUniforms(M),D!==null&&M.isNodeMaterial&&D.build(M,Z,J),M.onBeforeCompile(J,I),qe=_e.acquireProgram(J,re),ae.set(re,qe),G.uniforms=J.uniforms;let Te=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Te.clippingPlanes=Be.uniform),kr(M,J),G.needsLights=ga(M),G.lightsStateVersion=Y,G.needsLights&&(Te.ambientLightColor.value=W.state.ambient,Te.lightProbe.value=W.state.probe,Te.directionalLights.value=W.state.directional,Te.directionalLightShadows.value=W.state.directionalShadow,Te.spotLights.value=W.state.spot,Te.spotLightShadows.value=W.state.spotShadow,Te.rectAreaLights.value=W.state.rectArea,Te.ltc_1.value=W.state.rectAreaLTC1,Te.ltc_2.value=W.state.rectAreaLTC2,Te.pointLights.value=W.state.point,Te.pointLightShadows.value=W.state.pointShadow,Te.hemisphereLights.value=W.state.hemi,Te.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Te.spotLightMatrix.value=W.state.spotLightMatrix,Te.spotLightMap.value=W.state.spotLightMap,Te.pointShadowMatrix.value=W.state.pointShadowMatrix),G.lightProbeGrid=b.state.lightProbeGridArray.length>0,G.currentProgram=qe,G.uniformsList=null,qe}function fa(M){if(M.uniformsList===null){let B=M.currentProgram.getUniforms();M.uniformsList=br.seqWithValue(B.seq,M.uniforms)}return M.uniformsList}function kr(M,B){let Z=X.get(M);Z.outputColorSpace=B.outputColorSpace,Z.batching=B.batching,Z.batchingColor=B.batchingColor,Z.instancing=B.instancing,Z.instancingColor=B.instancingColor,Z.instancingMorph=B.instancingMorph,Z.skinning=B.skinning,Z.morphTargets=B.morphTargets,Z.morphNormals=B.morphNormals,Z.morphColors=B.morphColors,Z.morphTargetsCount=B.morphTargetsCount,Z.numClippingPlanes=B.numClippingPlanes,Z.numIntersection=B.numClipIntersection,Z.vertexAlphas=B.vertexAlphas,Z.vertexTangents=B.vertexTangents,Z.toneMapping=B.toneMapping}function zr(M,B){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;v.setFromMatrixPosition(B.matrixWorld);for(let Z=0,G=M.length;Z<G;Z++){let W=M[Z];if(W.texture!==null&&W.boundingBox.containsPoint(v))return W}return null}function pa(M,B,Z,G,W){B.isScene!==!0&&(B=Pe),Q.resetTextureUnits();let R=B.fog,Y=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?B.environment:null,J=z===null?I.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:at.workingColorSpace,re=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,ae=me.get(G.envMap||Y,re),Ae=G.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,qe=!!Z.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Te=!!Z.morphAttributes.position,lt=!!Z.morphAttributes.normal,bt=!!Z.morphAttributes.color,vt=Rn;G.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(vt=I.toneMapping);let xt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Ct=xt!==void 0?xt.length:0,Ce=X.get(G),yn=b.state.lights;if(ue===!0&&(he===!0||M!==ce)){let Mt=M===ce&&G.id===K;Be.setState(G,M,Mt)}let ht=!1;G.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==yn.state.version||Ce.outputColorSpace!==J||W.isBatchedMesh&&Ce.batching===!1||!W.isBatchedMesh&&Ce.batching===!0||W.isBatchedMesh&&Ce.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Ce.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Ce.instancing===!1||!W.isInstancedMesh&&Ce.instancing===!0||W.isSkinnedMesh&&Ce.skinning===!1||!W.isSkinnedMesh&&Ce.skinning===!0||W.isInstancedMesh&&Ce.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Ce.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Ce.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Ce.instancingMorph===!1&&W.morphTexture!==null||Ce.envMap!==ae||G.fog===!0&&Ce.fog!==R||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==Be.numPlanes||Ce.numIntersection!==Be.numIntersection)||Ce.vertexAlphas!==Ae||Ce.vertexTangents!==qe||Ce.morphTargets!==Te||Ce.morphNormals!==lt||Ce.morphColors!==bt||Ce.toneMapping!==vt||Ce.morphTargetsCount!==Ct||!!Ce.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(ht=!0):(ht=!0,Ce.__version=G.version);let Nn=Ce.currentProgram;ht===!0&&(Nn=Ii(G,B,W),D&&G.isNodeMaterial&&D.onUpdateProgram(G,Nn,Ce));let Kn=!1,Pi=!1,Hs=!1,yt=Nn.getUniforms(),Ot=Ce.uniforms;if(y.useProgram(Nn.program)&&(Kn=!0,Pi=!0,Hs=!0),G.id!==K&&(K=G.id,Pi=!0),Ce.needsLights){let Mt=zr(b.state.lightProbeGridArray,W);Ce.lightProbeGrid!==Mt&&(Ce.lightProbeGrid=Mt,Pi=!0)}if(Kn||ce!==M){y.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),yt.setValue(N,"projectionMatrix",M.projectionMatrix),yt.setValue(N,"viewMatrix",M.matrixWorldInverse);let Li=yt.map.cameraPosition;Li!==void 0&&Li.setValue(N,fe.setFromMatrixPosition(M.matrixWorld)),C.logarithmicDepthBuffer&&yt.setValue(N,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&yt.setValue(N,"isOrthographic",M.isOrthographicCamera===!0),ce!==M&&(ce=M,Pi=!0,Hs=!0)}if(Ce.needsLights&&(yn.state.directionalShadowMap.length>0&&yt.setValue(N,"directionalShadowMap",yn.state.directionalShadowMap,Q),yn.state.spotShadowMap.length>0&&yt.setValue(N,"spotShadowMap",yn.state.spotShadowMap,Q),yn.state.pointShadowMap.length>0&&yt.setValue(N,"pointShadowMap",yn.state.pointShadowMap,Q)),W.isSkinnedMesh){yt.setOptional(N,W,"bindMatrix"),yt.setOptional(N,W,"bindMatrixInverse");let Mt=W.skeleton;Mt&&(Mt.boneTexture===null&&Mt.computeBoneTexture(),yt.setValue(N,"boneTexture",Mt.boneTexture,Q))}W.isBatchedMesh&&(yt.setOptional(N,W,"batchingTexture"),yt.setValue(N,"batchingTexture",W._matricesTexture,Q),yt.setOptional(N,W,"batchingIdTexture"),yt.setValue(N,"batchingIdTexture",W._indirectTexture,Q),yt.setOptional(N,W,"batchingColorTexture"),W._colorsTexture!==null&&yt.setValue(N,"batchingColorTexture",W._colorsTexture,Q));let Di=Z.morphAttributes;if((Di.position!==void 0||Di.normal!==void 0||Di.color!==void 0)&&U.update(W,Z,Nn),(Pi||Ce.receiveShadow!==W.receiveShadow)&&(Ce.receiveShadow=W.receiveShadow,yt.setValue(N,"receiveShadow",W.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&B.environment!==null&&(Ot.envMapIntensity.value=B.environmentIntensity),Ot.dfgLUT!==void 0&&(Ot.dfgLUT.value=YS()),Pi){if(yt.setValue(N,"toneMappingExposure",I.toneMappingExposure),Ce.needsLights&&ma(Ot,Hs),R&&G.fog===!0&&Ne.refreshFogUniforms(Ot,R),Ne.refreshMaterialUniforms(Ot,G,le,pe,b.state.transmissionRenderTarget[M.id]),Ce.needsLights&&Ce.lightProbeGrid){let Mt=Ce.lightProbeGrid;Ot.probesSH.value=Mt.texture,Ot.probesMin.value.copy(Mt.boundingBox.min),Ot.probesMax.value.copy(Mt.boundingBox.max),Ot.probesResolution.value.copy(Mt.resolution)}br.upload(N,fa(Ce),Ot,Q)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(br.upload(N,fa(Ce),Ot,Q),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&yt.setValue(N,"center",W.center),yt.setValue(N,"modelViewMatrix",W.modelViewMatrix),yt.setValue(N,"normalMatrix",W.normalMatrix),yt.setValue(N,"modelMatrix",W.matrixWorld),G.uniformsGroups!==void 0){let Mt=G.uniformsGroups;for(let Li=0,Vs=Mt.length;Li<Vs;Li++){let Xd=Mt[Li];oe.update(Xd,Nn),oe.bind(Xd,Nn)}}return Nn}function ma(M,B){M.ambientLightColor.needsUpdate=B,M.lightProbe.needsUpdate=B,M.directionalLights.needsUpdate=B,M.directionalLightShadows.needsUpdate=B,M.pointLights.needsUpdate=B,M.pointLightShadows.needsUpdate=B,M.spotLights.needsUpdate=B,M.spotLightShadows.needsUpdate=B,M.rectAreaLights.needsUpdate=B,M.hemisphereLights.needsUpdate=B}function ga(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(M,B,Z){let G=X.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),X.get(M.texture).__webglTexture=B,X.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Z,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,B){let Z=X.get(M);Z.__webglFramebuffer=B,Z.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(M,B=0,Z=0){z=M,$=B,q=Z;let G=null,W=!1,R=!1;if(M){let J=X.get(M);if(J.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(N.FRAMEBUFFER,J.__webglFramebuffer),V.copy(M.viewport),te.copy(M.scissor),Me=M.scissorTest,y.viewport(V),y.scissor(te),y.setScissorTest(Me),K=-1;return}else if(J.__webglFramebuffer===void 0)Q.setupRenderTarget(M);else if(J.__hasExternalTextures)Q.rebindTextures(M,X.get(M.texture).__webglTexture,X.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Ae=M.depthTexture;if(J.__boundDepthTexture!==Ae){if(Ae!==null&&X.has(Ae)&&(M.width!==Ae.image.width||M.height!==Ae.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Q.setupDepthRenderbuffer(M)}}let re=M.texture;(re.isData3DTexture||re.isDataArrayTexture||re.isCompressedArrayTexture)&&(R=!0);let ae=X.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(ae[B])?G=ae[B][Z]:G=ae[B],W=!0):M.samples>0&&Q.useMultisampledRTT(M)===!1?G=X.get(M).__webglMultisampledFramebuffer:Array.isArray(ae)?G=ae[Z]:G=ae,V.copy(M.viewport),te.copy(M.scissor),Me=M.scissorTest}else V.copy(Ue).multiplyScalar(le).floor(),te.copy(ct).multiplyScalar(le).floor(),Me=ze;if(Z!==0&&(G=H),y.bindFramebuffer(N.FRAMEBUFFER,G)&&y.drawBuffers(M,G),y.viewport(V),y.scissor(te),y.setScissorTest(Me),W){let J=X.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+B,J.__webglTexture,Z)}else if(R){let J=B;for(let re=0;re<M.textures.length;re++){let ae=X.get(M.textures[re]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+re,ae.__webglTexture,Z,J)}}else if(M!==null&&Z!==0){let J=X.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,J.__webglTexture,Z)}K=-1},this.readRenderTargetPixels=function(M,B,Z,G,W,R,Y,J=0){if(!(M&&M.isWebGLRenderTarget)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let re=X.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Y!==void 0&&(re=re[Y]),re){y.bindFramebuffer(N.FRAMEBUFFER,re);try{let ae=M.textures[J],Ae=ae.format,qe=ae.type;if(M.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+J),!C.textureFormatReadable(Ae)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(qe)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=M.width-G&&Z>=0&&Z<=M.height-W&&N.readPixels(B,Z,G,W,ve.convert(Ae),ve.convert(qe),R)}finally{let ae=z!==null?X.get(z).__webglFramebuffer:null;y.bindFramebuffer(N.FRAMEBUFFER,ae)}}},this.readRenderTargetPixelsAsync=async function(M,B,Z,G,W,R,Y,J=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let re=X.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Y!==void 0&&(re=re[Y]),re)if(B>=0&&B<=M.width-G&&Z>=0&&Z<=M.height-W){y.bindFramebuffer(N.FRAMEBUFFER,re);let ae=M.textures[J],Ae=ae.format,qe=ae.type;if(M.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+J),!C.textureFormatReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Te=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Te),N.bufferData(N.PIXEL_PACK_BUFFER,R.byteLength,N.STREAM_READ),N.readPixels(B,Z,G,W,ve.convert(Ae),ve.convert(qe),0);let lt=z!==null?X.get(z).__webglFramebuffer:null;y.bindFramebuffer(N.FRAMEBUFFER,lt);let bt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await bp(N,bt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Te),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,R),N.deleteBuffer(Te),N.deleteSync(bt),R}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,B=null,Z=0){let G=Math.pow(2,-Z),W=Math.floor(M.image.width*G),R=Math.floor(M.image.height*G),Y=B!==null?B.x:0,J=B!==null?B.y:0;Q.setTexture2D(M,0),N.copyTexSubImage2D(N.TEXTURE_2D,Z,0,0,Y,J,W,R),y.unbindTexture()},this.copyTextureToTexture=function(M,B,Z=null,G=null,W=0,R=0){let Y,J,re,ae,Ae,qe,Te,lt,bt,vt=M.isCompressedTexture?M.mipmaps[R]:M.image;if(Z!==null)Y=Z.max.x-Z.min.x,J=Z.max.y-Z.min.y,re=Z.isBox3?Z.max.z-Z.min.z:1,ae=Z.min.x,Ae=Z.min.y,qe=Z.isBox3?Z.min.z:0;else{let Ot=Math.pow(2,-W);Y=Math.floor(vt.width*Ot),J=Math.floor(vt.height*Ot),M.isDataArrayTexture?re=vt.depth:M.isData3DTexture?re=Math.floor(vt.depth*Ot):re=1,ae=0,Ae=0,qe=0}G!==null?(Te=G.x,lt=G.y,bt=G.z):(Te=0,lt=0,bt=0);let xt=ve.convert(B.format),Ct=ve.convert(B.type),Ce;B.isData3DTexture?(Q.setTexture3D(B,0),Ce=N.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(Q.setTexture2DArray(B,0),Ce=N.TEXTURE_2D_ARRAY):(Q.setTexture2D(B,0),Ce=N.TEXTURE_2D),y.activeTexture(N.TEXTURE0),y.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,B.flipY),y.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),y.pixelStorei(N.UNPACK_ALIGNMENT,B.unpackAlignment);let yn=y.getParameter(N.UNPACK_ROW_LENGTH),ht=y.getParameter(N.UNPACK_IMAGE_HEIGHT),Nn=y.getParameter(N.UNPACK_SKIP_PIXELS),Kn=y.getParameter(N.UNPACK_SKIP_ROWS),Pi=y.getParameter(N.UNPACK_SKIP_IMAGES);y.pixelStorei(N.UNPACK_ROW_LENGTH,vt.width),y.pixelStorei(N.UNPACK_IMAGE_HEIGHT,vt.height),y.pixelStorei(N.UNPACK_SKIP_PIXELS,ae),y.pixelStorei(N.UNPACK_SKIP_ROWS,Ae),y.pixelStorei(N.UNPACK_SKIP_IMAGES,qe);let Hs=M.isDataArrayTexture||M.isData3DTexture,yt=B.isDataArrayTexture||B.isData3DTexture;if(M.isDepthTexture){let Ot=X.get(M),Di=X.get(B),Mt=X.get(Ot.__renderTarget),Li=X.get(Di.__renderTarget);y.bindFramebuffer(N.READ_FRAMEBUFFER,Mt.__webglFramebuffer),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,Li.__webglFramebuffer);for(let Vs=0;Vs<re;Vs++)Hs&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(M).__webglTexture,W,qe+Vs),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,X.get(B).__webglTexture,R,bt+Vs)),N.blitFramebuffer(ae,Ae,Y,J,Te,lt,Y,J,N.DEPTH_BUFFER_BIT,N.NEAREST);y.bindFramebuffer(N.READ_FRAMEBUFFER,null),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(W!==0||M.isRenderTargetTexture||X.has(M)){let Ot=X.get(M),Di=X.get(B);y.bindFramebuffer(N.READ_FRAMEBUFFER,F),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,L);for(let Mt=0;Mt<re;Mt++)Hs?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ot.__webglTexture,W,qe+Mt):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ot.__webglTexture,W),yt?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Di.__webglTexture,R,bt+Mt):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Di.__webglTexture,R),W!==0?N.blitFramebuffer(ae,Ae,Y,J,Te,lt,Y,J,N.COLOR_BUFFER_BIT,N.NEAREST):yt?N.copyTexSubImage3D(Ce,R,Te,lt,bt+Mt,ae,Ae,Y,J):N.copyTexSubImage2D(Ce,R,Te,lt,ae,Ae,Y,J);y.bindFramebuffer(N.READ_FRAMEBUFFER,null),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else yt?M.isDataTexture||M.isData3DTexture?N.texSubImage3D(Ce,R,Te,lt,bt,Y,J,re,xt,Ct,vt.data):B.isCompressedArrayTexture?N.compressedTexSubImage3D(Ce,R,Te,lt,bt,Y,J,re,xt,vt.data):N.texSubImage3D(Ce,R,Te,lt,bt,Y,J,re,xt,Ct,vt):M.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,R,Te,lt,Y,J,xt,Ct,vt.data):M.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,R,Te,lt,vt.width,vt.height,xt,vt.data):N.texSubImage2D(N.TEXTURE_2D,R,Te,lt,Y,J,xt,Ct,vt);y.pixelStorei(N.UNPACK_ROW_LENGTH,yn),y.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ht),y.pixelStorei(N.UNPACK_SKIP_PIXELS,Nn),y.pixelStorei(N.UNPACK_SKIP_ROWS,Kn),y.pixelStorei(N.UNPACK_SKIP_IMAGES,Pi),R===0&&B.generateMipmaps&&N.generateMipmap(Ce),y.unbindTexture()},this.initRenderTarget=function(M){X.get(M).__webglFramebuffer===void 0&&Q.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Q.setTextureCube(M,0):M.isData3DTexture?Q.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Q.setTexture2DArray(M,0):Q.setTexture2D(M,0),y.unbindTexture()},this.resetState=function(){$=0,q=0,z=null,y.reset(),be.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=at._getDrawingBufferColorSpace(e),t.unpackColorSpace=at._getUnpackColorSpace()}};var rm={type:"change"},qh={type:"start"},am={type:"end"},El=new Ss,om=new Un,$S=Math.cos(70*nt.DEG2RAD),Yt=new O,xn=2*Math.PI,_t={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Xh=1e-6,wl=class extends wo{constructor(e,t=null){super(e,t),this.state=_t.NONE,this.target=new O,this.cursor=new O,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ji.ROTATE,MIDDLE:ji.DOLLY,RIGHT:ji.PAN},this.touches={ONE:Zi.ROTATE,TWO:Zi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new O,this._lastQuaternion=new Sn,this._lastTargetPosition=new O,this._quat=new Sn().setFromUnitVectors(e.up,new O(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new mr,this._sphericalDelta=new mr,this._scale=1,this._panOffset=new O,this._rotateStart=new de,this._rotateEnd=new de,this._rotateDelta=new de,this._panStart=new de,this._panEnd=new de,this._panDelta=new de,this._dollyStart=new de,this._dollyEnd=new de,this._dollyDelta=new de,this._dollyDirection=new O,this._mouse=new de,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ZS.bind(this),this._onPointerDown=jS.bind(this),this._onPointerUp=KS.bind(this),this._onContextMenu=sE.bind(this),this._onMouseWheel=eE.bind(this),this._onKeyDown=tE.bind(this),this._onTouchStart=nE.bind(this),this._onTouchMove=iE.bind(this),this._onMouseDown=JS.bind(this),this._onMouseMove=QS.bind(this),this._interceptControlDown=rE.bind(this),this._interceptControlUp=oE.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(rm),this.update(),this.state=_t.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Yt.copy(t).sub(this.target),Yt.applyQuaternion(this._quat),this._spherical.setFromVector3(Yt),this.autoRotate&&this.state===_t.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=xn:i>Math.PI&&(i-=xn),s<-Math.PI?s+=xn:s>Math.PI&&(s-=xn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Yt.setFromSpherical(this._spherical),Yt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Yt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Yt.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let a=new O(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new O(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Yt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(El.origin.copy(this.object.position),El.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(El.direction))<$S?this.object.lookAt(this.target):(om.setFromNormalAndCoplanarPoint(this.object.up,this.target),El.intersectPlane(om,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Xh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Xh||this._lastTargetPosition.distanceToSquared(this.target)>Xh?(this.dispatchEvent(rm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?xn/60*this.autoRotateSpeed*e:xn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Yt.setFromMatrixColumn(t,0),Yt.multiplyScalar(-e),this._panOffset.add(Yt)}_panUp(e,t){this.screenSpacePanning===!0?Yt.setFromMatrixColumn(t,1):(Yt.setFromMatrixColumn(t,0),Yt.crossVectors(this.object.up,Yt)),Yt.multiplyScalar(e),this._panOffset.add(Yt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Yt.copy(s).sub(this.target);let r=Yt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(xn*this._rotateDelta.x/t.clientHeight),this._rotateUp(xn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-xn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(xn*this._rotateDelta.x/t.clientHeight),this._rotateUp(xn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new de,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function jS(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function ZS(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function KS(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(am),this.state=_t.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function JS(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case ji.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=_t.DOLLY;break;case ji.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=_t.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=_t.ROTATE}break;case ji.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=_t.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=_t.PAN}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(qh)}function QS(n){switch(this.state){case _t.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case _t.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case _t.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function eE(n){this.enabled===!1||this.enableZoom===!1||this.state!==_t.NONE||(n.preventDefault(),this.dispatchEvent(qh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(am))}function tE(n){this.enabled!==!1&&this._handleKeyDown(n)}function nE(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Zi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=_t.TOUCH_ROTATE;break;case Zi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=_t.TOUCH_PAN;break;default:this.state=_t.NONE}break;case 2:switch(this.touches.TWO){case Zi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=_t.TOUCH_DOLLY_PAN;break;case Zi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=_t.TOUCH_DOLLY_ROTATE;break;default:this.state=_t.NONE}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(qh)}function iE(n){switch(this._trackPointer(n),this.state){case _t.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case _t.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case _t.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case _t.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=_t.NONE}}function sE(n){this.enabled!==!1&&n.preventDefault()}function rE(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function oE(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var f0=zn(cu());var Dt=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),mattress:Object.freeze({materialKey:"fabric",baseColor:"#E4E0D8",roughness:.94,metallic:0,opacity:1}),countertop:Object.freeze({materialKey:"custom",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1})});function gt(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function cm({width:n,height:e,depth:t}){let i=e*.38,s=t*.2,r=n*.1,o=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),a=Math.max(e*.16,.035),c=Math.max(Math.min(n*.012,.018),.006),l=[gt("seat","cushions",[n,i,t],[0,-e/2+i/2,0]),gt("back","body",[n,e*.62,s],[0,e*.19,-t/2+s/2]),gt("left-arm","body",[r,e*.46,t],[-n/2+r/2,-e*.08,0]),gt("right-arm","body",[r,e*.46,t],[n/2-r/2,-e*.08,0])];for(let u of[-n*.4,n*.4])for(let h of[-t*.32,t*.32])l.push(gt("leg","legs",[o,a,o],[u,-e/2+a/2,h]));return l.push(gt("cushion-seam","cushions",[c,Math.max(i*.035,.006),t*.78],[0,-e/2+i+.003,t*.02])),{parts:l,materialDefaults:{body:Dt.fabric,cushions:Dt.fabric,legs:Dt.metal}}}function lm({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.08,.024),r=[gt("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),gt("back","back",[n*.9,e*.46,Math.max(t*.14,.035)],[0,e*.26,-t*.36],"seat")];for(let o of[-n*.36,n*.36])for(let a of[-t*.3,t*.3])r.push(gt("leg","frame",[s,e*.44,s],[o,-e*.28,a]));return{parts:r,yawOffsetDegrees:180,materialDefaults:{seat:Dt.fabric,back:Dt.fabric,frame:Dt.wood}}}function Yh({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.max(Math.min(Math.min(n,t)*.09,.075),.025),r=Math.max(e-i,.02),o=[gt("top","top",[n,i,t],[0,e/2-i/2,0]),gt("top-surface","top",[n*.965,.012,t*.965],[0,e/2-.006,0])];for(let a of[-n*.4,n*.4])for(let c of[-t*.4,t*.4])o.push(gt("leg","legs",[s,r,s],[a,-i/2,c]));return{parts:o,materialDefaults:{top:Dt.wood,legs:Dt.metal}}}function $h({width:n,height:e,depth:t}){let i=e*.4,s=e*.38,r=Math.max(e*.1,.045);return{parts:[gt("frame","frame",[n,i,t],[0,-e/2+i/2,0]),gt("mattress","mattress",[n*.93,s,t*.9],[0,-e/2+i+s/2,t*.025]),gt("headboard","headboard",[n*.98,e*.72,Math.max(t*.065,.055)],[0,-e/2+e*.64,-t/2+Math.max(t*.0325,.0275)],"frame"),gt("left-pillow","mattress",[n*.38,r,t*.2],[-n*.23,e*.27,-t*.29]),gt("right-pillow","mattress",[n*.38,r,t*.2],[n*.23,e*.27,-t*.29])],yawOffsetDegrees:180,materialDefaults:{frame:Dt.wood,mattress:Dt.mattress,headboard:Dt.wood}}}function um({width:n,height:e,depth:t}){let i=Math.max(e*.06,.025),s=Math.max(t*.05,.016),r=Math.max(e-i,.02),o=r*.92,a=n*.94/3,c=Math.max(s*.7,.012),l=[gt("body","body",[n,r,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let u=0;u<3;u+=1){let h=-n*.47+a*(u+.5);l.push(gt("front","front",[a*.96,o,s],[h,-i/2,t/2-s/2]));let d=h+a*(u<1?.3:-.3);l.push(gt("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),c],[d,0,t/2-c/2]))}return l.push(gt("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:l,materialDefaults:{body:Dt.cabinet,front:Dt.cabinetFront,top:Dt.wood,handles:Dt.metal}}}function hm({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.045,.016),r=Math.max(s*.7,.012),o=[gt("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let a of[-n*.245,n*.245])o.push(gt("front","front",[n*.47,Math.max(e-i,.02)*.94,s],[a,-i/2,t/2-s/2])),o.push(gt("handle","handles",[n*.25,Math.max(e*.016,.01),r],[a,e*.3,t/2-r/2]));return o.push(gt("worktop","top",[n,i,t],[0,e*.46,0])),{parts:o,materialDefaults:{body:Dt.cabinet,front:Dt.cabinetFront,top:Dt.countertop,handles:Dt.metal}}}function dm({width:n,height:e,depth:t}){let i=Math.max(e*.08,.025),s=Math.max(t*.05,.016),r=n*.305,o=Math.max(s*.7,.012),a=Math.max(e*.12,.018),c=[gt("body","body",[n,e*.76-i,Math.max(t-s,.02)],[0,e*.08-i/2,-s/2])];for(let l of[-1,0,1]){let u=l*n*.323;c.push(gt("front","front",[r,e*.58,s],[u,e*.04,t/2-s/2])),c.push(gt("handle","handles",[r*.28,Math.max(e*.018,.009),o],[u,e*.25,t/2-o/2]))}return c.push(gt("top","top",[n,i,t],[0,e*.46-i/2,0])),c.push(gt("foot","body",[n*.82,a,t*.72],[0,-e*.44,0])),{parts:c,materialDefaults:{body:Dt.cabinet,front:Dt.cabinetFront,top:Dt.wood,handles:Dt.metal}}}var ot=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),wood:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"paint",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),counter:Object.freeze({materialKey:"stone",baseColor:"#6C7072",roughness:.56,metallic:.04,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1})});function Fe(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function Uo(n,e,t,i,s,r=void 0,o=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:o,radius:t,height:i,position:s,rotation:r}}var jh=Object.freeze({seat:ot.fabric,back:ot.fabric,frame:ot.wood,arms:ot.fabric});function fm({width:n,height:e,depth:t}){let i=e*.4,s=t*.84,r=t*.24,o=n*.17,a=Math.max(Math.min(n,t)*.07,.018),c=Math.max(e*.16,.035),l=[Fe("seat","seat",[n,i,s],[0,-e/2+i/2,t*.08]),Fe("back","back",[n,e*.64,r],[0,e*.18,-t/2+r/2]),Fe("left-arm","arms",[o,e*.5,t*.88],[-n/2+o/2,-e*.06,t*.06],"seat"),Fe("right-arm","arms",[o,e*.5,t*.88],[n/2-o/2,-e*.06,t*.06],"seat")];for(let u of[-n*.33,n*.33])for(let h of[-t*.3,t*.3])l.push(Fe("leg","frame",[a,c,a],[u,-e/2+c/2,h]));return{parts:l,yawOffsetDegrees:180,materialDefaults:jh}}function pm({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.075,.026),r=e*.45,o=[Fe("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02])];for(let a of[-n*.36,n*.36]){for(let c of[-t*.3,t*.3])o.push(Fe("leg","frame",[s,r,s],[a,-e/2+r/2,c]));o.push(Fe("back-post","frame",[s,e*.51,s],[a,e*.23,-t*.34]))}for(let a of[e*.18,e*.34])o.push(Fe("back-slat","back",[n*.76,e*.085,Math.max(t*.07,.028)],[0,a,-t*.34],"frame"));return{parts:o,yawOffsetDegrees:180,materialDefaults:jh}}function mm({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.07),.03),s=Math.max(Math.min(n,t)*.045,.02),r=[Fe("seat","seat",[n*.92,i,t*.82],[0,-e*.05,t*.02]),Fe("back","back",[n*.88,e*.42,Math.max(t*.13,.035)],[0,e*.27,-t*.31],"seat")];for(let o of[-n*.37,n*.37])r.push(Fe("base-rail","frame",[s,s,t*.84],[o,-e/2+s/2,0])),r.push(Fe("front-post","frame",[s,e*.48,s],[o,-e*.26,t*.34])),r.push(Fe("back-post","frame",[s,e*.58,s],[o,e*.14,-t*.31]));return{parts:r,yawOffsetDegrees:180,materialDefaults:jh}}function gm({width:n,height:e,depth:t}){let i=Math.max(Math.min(e*.12,.1),.035),s=Math.min(n,t)/2;return{parts:[Uo("top","top",s,i,[0,e/2-i/2,0]),Uo("top-surface","top",s*.965,.012,[0,e/2-.006,0]),Uo("pedestal","legs",s*.13,Math.max(e-i-.055,.02),[0,-i/2+.028,0]),Uo("foot","legs",s*.34,.055,[0,-e/2+.0275,0])],materialDefaults:{top:ot.wood,legs:ot.metal}}}function xm({width:n,height:e,depth:t}){let i=Math.max(Math.min(n*.055,.055),.028),s=Math.max(Math.min(e*.025,.04),.025),r=[Fe("left-side","body",[i,e,t],[-n/2+i/2,0,0]),Fe("right-side","body",[i,e,t],[n/2-i/2,0,0]),Fe("bottom","body",[n,s,t],[0,-e/2+s/2,0])];for(let o=1;o<=5;o+=1){let a=-e/2+e*o/5;r.push(Fe(o===5?"top":"shelf",o===5?"top":"body",[n,s,t],[0,Math.min(a,e/2-s/2),0]))}return r.push(Fe("back","body",[n-i*2,e*.96,Math.max(t*.045,.016)],[0,0,-t/2+Math.max(t*.0225,.008)])),{parts:r,materialDefaults:{body:ot.cabinet,top:ot.wood}}}function Tl({width:n,height:e,depth:t},i="cabinet"){let s=Math.max(e*.06,.025),r=Math.max(t*.05,.016),o=Math.max(e-s,.02),a=o*.92,c=-s/2,l=[Fe("body","body",[n,o,Math.max(t-r,.02)],[0,-s/2,-r/2])];if(i==="nightstand")for(let u=0;u<2;u+=1){let h=c+(u===0?a*.25:-a*.25),d=Math.max(r*.7,.012);l.push(Fe("front","front",[n*.94,a*.46,r],[0,h,t/2-r/2])),l.push(Fe("handle","handles",[n*.22,Math.max(e*.018,.008),d],[0,h+a*.12,t/2-d/2]))}else{let u=i==="wardrobe"?3:2,h=n*.94/u;for(let d=0;d<u;d+=1){let f=-n*.47+h*(d+.5),p=f+h*(d<u/2?.3:-.3),x=Math.max(r*.7,.012);l.push(Fe("front","front",[h*.96,a,r],[f,c,t/2-r/2])),l.push(Fe("handle","handles",[Math.max(n*.012,.01),Math.min(e*.22,.32),x],[p,0,t/2-x/2]))}}return l.push(Fe("top","top",[n,s,t],[0,e/2-s/2,0])),{parts:l,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.wood,handles:ot.metal}}}function vm({width:n,height:e,depth:t}){let i=Math.max(e*.025,.03),s=Math.max(t*.045,.016),r=[Fe("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2])];for(let[o,a]of[[e*.25,e*.45],[-e*.25,e*.45]]){let c=Math.max(s*.7,.012);r.push(Fe("front","front",[n*.95,a,s],[0,o,t/2-s/2])),r.push(Fe("handle","handles",[Math.max(n*.025,.012),a*.44,c],[n*.38,o,t/2-c/2]))}return r.push(Fe("top","top",[n,i,t],[0,e/2-i/2,0])),{parts:r,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal}}}function _m({width:n,height:e,depth:t}){let i=Math.max(t*.055,.018),s=Math.max(e*.025,.028),r=e*.34,o=Math.max(e*.007,.008),a=Math.max(t*.06,.016);return{parts:[Fe("body","body",[n,e-s,Math.max(t-i,.02)],[0,-s/2,-i/2]),Fe("door","front",[n*.97,e-r-o*1.5,i],[0,r/2+o*.25,t/2-i/2]),Fe("freezer-door","front",[n*.97,r-o*1.5,i],[0,-e/2+r/2,t/2-i/2]),Fe("handle","handles",[Math.max(n*.018,.009),e*.3,a],[n*.38,e*.25,t/2-a/2]),Fe("freezer-handle","handles",[Math.max(n*.018,.009),e*.19,a],[n*.38,-e*.25,t/2-a/2]),Fe("top","top",[n,s,t],[0,e/2-s/2,0])],materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.metal,handles:ot.metal}}}function ym({width:n,height:e,depth:t}){let i=Math.max(e*.075,.03),s=t*.13,r=t-s,o=Math.max(t*.035,.016),a=[Fe("body","body",[n*.94,e-i,r],[0,-i/2,-s/2])];for(let c=-1;c<=1;c+=1){let l=c*n*.31;a.push(Fe("front","front",[n*.29,e*.8,o],[l,-i/2,t/2-s-o/2])),a.push(Fe("handle","handles",[n*.16,Math.max(e*.014,.009),Math.max(o*.75,.012)],[l,e*.31,t/2-s+.003]))}return a.push(Fe("worktop","top",[n,i,t],[0,e/2-i/2,0])),{parts:a,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal}}}function bm({width:n,height:e,depth:t}){let i=Math.min(e*.22,.24),s=e-i,r=Math.max(s*.075,.03),o=Math.max(t*.045,.016),a=-e/2+s/2,c=-e/2+s-r/2,l=n*.48,u=t*.52,h=Math.max(Math.min(l,u)*.075,.025),d=c+r/2-Math.max(r*.08,.005),f=[Fe("body","body",[n,s-r,Math.max(t-o,.02)],[0,a-r/2,-o/2])];for(let m of[-n*.245,n*.245]){let g=Math.max(o*.75,.012);f.push(Fe("front","front",[n*.47,s*.78,o],[m,a-r*.3,t/2-o/2])),f.push(Fe("handle","handles",[n*.22,Math.max(s*.014,.009),g],[m,c-s*.12,t/2-g/2]))}f.push(Fe("worktop","top",[n,r,t],[0,c,0])),f.push(Fe("basin-back","basin",[l,Math.max(r*.16,.01),h],[-n*.12,d,-u/2])),f.push(Fe("basin-front","basin",[l,Math.max(r*.16,.01),h],[-n*.12,d,u/2])),f.push(Fe("basin-left","basin",[h,Math.max(r*.16,.01),u],[-n*.12-l/2+h/2,d,0])),f.push(Fe("basin-right","basin",[h,Math.max(r*.16,.01),u],[-n*.12+l/2-h/2,d,0]));let p=i*.72,x=c+r/2;return f.push(Uo("faucet","fittings",Math.max(n*.018,.012),p,[n*.28,x+p/2,t*.12])),f.push(Fe("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.2,Math.min(x+p,e/2-.01),t*.05])),{parts:f,materialDefaults:{body:ot.cabinet,front:ot.front,top:ot.counter,handles:ot.metal,basin:ot.metal,fittings:ot.metal}}}function Mm({width:n,height:e,depth:t}){let i=Math.max(Math.min(t*.34,.055),.018);return{parts:[Fe("frame","frame",[n,e*.88,i],[0,e*.06,0]),Fe("display","display",[n*.92,e*.76,Math.max(i*.12,.008)],[0,e*.06,i*.52]),Fe("stand","stand",[n*.34,Math.max(e*.045,.018),t],[0,-e*.46,0])],materialDefaults:{frame:ot.metal,display:ot.screen,stand:ot.metal}}}function Sm({width:n,height:e,depth:t}){let i=Math.min(Math.max(Math.min(n,t)*.045,.025),.09),s=Math.max(e*.72,.018),r=Math.max(e*.55,.014),o=-e/2+r/2;return{parts:[Fe("pile","pile",[Math.max(n-i*2,.08),s,Math.max(t-i*2,.08)],[0,e/2-s/2+.002,0]),Fe("border-back","border",[n,r,i],[0,o,-t/2+i/2]),Fe("border-front","border",[n,r,i],[0,o,t/2-i/2]),Fe("border-left","border",[i,r,Math.max(t-i*2,.08)],[-n/2+i/2,o,0]),Fe("border-right","border",[i,r,Math.max(t-i*2,.08)],[n/2-i/2,o,0])],materialDefaults:{pile:ot.fabric,border:ot.fabric}}}function Em({width:n,height:e,depth:t}){return{parts:[Fe("body","body",[n*.96,e*.96,t*.96],[0,0,0]),Fe("top","top",[n*.72,Math.max(e*.025,.018),t*.72],[0,e*.44,0])],materialDefaults:{body:ot.cabinet,top:ot.wood}}}var it=Object.freeze({paint:Object.freeze({materialKey:"paint",baseColor:"#D8D5CE",roughness:.7,metallic:0,opacity:1}),front:Object.freeze({materialKey:"paint",baseColor:"#E7E4DE",roughness:.64,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),darkMetal:Object.freeze({materialKey:"metal",baseColor:"#34393C",roughness:.48,metallic:.62,opacity:1}),screen:Object.freeze({materialKey:"glass",baseColor:"#171A1C",roughness:.18,metallic:.08,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#22282C",roughness:.16,metallic:.08,opacity:.86}),counter:Object.freeze({materialKey:"stone",baseColor:"#5F6467",roughness:.52,metallic:.04,opacity:1}),blue:Object.freeze({materialKey:"custom",baseColor:"#4E82A6",roughness:.64,metallic:0,opacity:1})});function rt(n,e,t,i,s){return{type:"box",name:n,slot:e,fallbackSlot:s,size:t,position:i}}function ts(n,e,t,i,s,r=void 0,o=void 0){return{type:"cylinder",name:n,slot:e,fallbackSlot:o,radius:t,height:i,position:s,rotation:r}}function wm({width:n,height:e,depth:t}){let i=Math.max(e*.075,.032),s=Math.max(t*.05,.018),r=Math.max(s*.82,.014),o=s*1.05,a=[rt("body","body",[n,e-i,Math.max(t-s,.02)],[0,-i/2,-s/2]),rt("oven-front","front",[n*.94,e*.6,s],[0,-e*.12,t/2-s/2]),rt("controls","controls",[n*.94,e*.17,o],[0,e*.28,t/2-o/2]),rt("handle","handles",[n*.62,Math.max(e*.022,.012),r],[0,e*.12,t/2-r/2]),rt("worktop","top",[n,i,t],[0,e/2-i/2,0])];for(let c of[-n*.23,n*.23])for(let l of[-t*.22,t*.22])a.push(ts("burner","cooktop",Math.min(n,t)*.105,Math.max(i*.15,.008),[c,e/2-.004,l]));return{parts:a,materialDefaults:{body:it.paint,front:it.front,controls:it.screen,handles:it.metal,top:it.counter,cooktop:it.darkMetal}}}function Tm({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(i.bodyHeight??.28,e*.12),e*.62),r=Math.min(Math.max(i.chimneyHeight??.52,e-s),e-s/2),o=Math.min(Math.max(i.chimneyWidth??.3,n*.18),n*.72),a=Math.max(t*.025,.012);return{parts:[rt("hood","body",[n,s,t],[0,-e/2+s/2,0]),rt("rim","frame",[n*.82,Math.max(s*.1,.018),t],[0,-e/2+s*.08,0]),rt("chimney","body",[o,r,t*.42],[0,e/2-r/2,-t*.15]),rt("controls","controls",[n*.3,Math.max(s*.075,.014),a],[n*.25,-e/2+s*.72,t/2-a/2])],materialDefaults:{body:it.metal,frame:it.darkMetal,controls:it.screen}}}function Al({width:n,height:e,depth:t},i="washingMachine"){let s=Math.max(e*.045,.028),r=Math.max(t*.055,.02),o=Math.max(r*.7,.018),a=i==="tumbleDryer"?n*.34:n*.25,c=Math.max(r*.78,.016),l=Math.max(r*.8,.018),u=[rt("body","body",[n,e-s,Math.max(t-r,.02)],[0,-s/2,-r/2]),rt("front","front",[n*.96,e*.92,r],[0,-s/2,t/2-r/2]),rt("top","top",[n,s,t],[0,e/2-s/2,0]),ts("door","door",Math.min(n,e)*.31,o,[0,-e*.08,t/2-o/2],[Math.PI/2,0,0]),rt("display","display",[a,e*.1,c],[n*.22,e*.33,t/2-c/2]),ts("control","handles",Math.max(n*.055,.022),l,[-n*.26,e*.33,t/2-l/2],[Math.PI/2,0,0])];if(i==="washerDryer"){let h=Math.max(r*.84,.018);u.push(rt("mode","display",[n*.18,Math.max(e*.018,.01),h],[n*.2,e*.24,t/2-h/2]))}else if(i==="tumbleDryer")for(let h=0;h<3;h+=1){let d=h*Math.PI*2/3,f=Math.max(r*.86,.018);u.push(rt("drum-vane","door",[n*.055,n*.018,f],[Math.cos(d)*n*.13,-e*.08+Math.sin(d)*n*.13,t/2-f/2]))}return{yawOffsetDegrees:180,parts:u,materialDefaults:{body:it.paint,front:it.front,top:it.paint,door:it.glass,display:it.screen,handles:it.metal}}}function Am({width:n,height:e,depth:t}){let i=Math.min(n,t)*.47,s=Math.max(e*.62,.045),r=Math.max(t*.1,.025),o=Math.max(i*.19,.035),a=[Math.max(n*.1,.028),Math.max(e*.28,.022),Math.max(t*.3,.07)];return{parts:[ts("body","body",i,s,[0,-e/2+s/2,0]),rt("bumper","bumper",[n*.78,s*.68,r],[0,-e*.15,t*.43]),ts("sensor","sensor",o,Math.max(e*.25,.02),[0,e*.3,-t*.1]),rt("left-wheel","wheels",a,[-n*.34,-e*.34,0]),rt("right-wheel","wheels",a,[n*.34,-e*.34,0])],materialDefaults:{body:it.darkMetal,bumper:it.darkMetal,sensor:it.screen,wheels:it.darkMetal}}}function Cm({width:n,height:e,depth:t}){let i=Math.max(t*.12,.018),s=Math.max(t*.1,.018),r=-e*.31,o=Math.max(n*.014,.01),a=[rt("body","body",[n*.96,e*.86,t*.82],[0,e*.04,-t*.05]),rt("front","front",[n*.9,e*.58,i],[0,e*.09,t/2-i/2]),rt("outlet","outlet",[n*.82,e*.18,s],[0,r,t/2-s/2])];for(let c=-3;c<=3;c+=1)a.push(rt("louver","louvers",[o,e*.13,Math.max(t*.035,.01)],[c*n*.105,r,t*.475]));return a.push(rt("controls","controls",[n*.12,e*.075,Math.max(t*.035,.01)],[n*.34,e*.17,t*.465])),a.push(rt("rear-frame","frame",[n*.58,e*.42,Math.max(t*.055,.012)],[0,e*.04,-t*.46])),{parts:a,materialDefaults:{body:it.paint,front:it.front,outlet:it.screen,louvers:it.darkMetal,controls:it.screen,frame:it.metal}}}function Rm({width:n,height:e,depth:t}){let i=e*.92,s=Math.max(t*.045,.018),r=Math.max(e*.045,.03),o=e*.08,a=Math.max(s*1.1,.02),c=[rt("body","body",[n*.94,i,t*.88],[0,-e/2+i/2,-t*.03]),rt("upper-front","front",[n*.88,e*.42,s],[0,e*.2,t/2-s/2]),rt("lower-front","front",[n*.88,e*.39,s],[0,-e*.255,t/2-s/2]),rt("controls","controls",[n*.24,e*.075,a],[n*.22,e*.3,t/2-a/2]),rt("foot","foot",[n*.82,r,t*.72],[0,-e/2+r/2,0])];for(let l of[-n*.22,0,n*.22])c.push(ts("connection","connections",Math.max(n*.035,.018),o,[l,e/2-o/2,-t*.13]));return{parts:c,materialDefaults:{body:it.paint,front:it.front,controls:it.screen,foot:it.metal,connections:it.metal}}}function Im({width:n,height:e,depth:t}){let i=e*.74,s=-e/2+i/2,r=Math.max(t*.045,.022),o=Math.max(e*.035,.025),a=-e/2+i,c=e-i;return{yawOffsetDegrees:180,parts:[rt("body","body",[n*.92,i,t*.88],[0,s,0]),rt("window","glass",[n*.62,i*.55,r],[0,s+i*.04,t/2-r/2]),rt("handle","handles",[n*.035,i*.38,r],[n*.29,s+i*.03,t/2-r/2]),rt("top","top",[n,o,t*.94],[0,a-o/2,0]),ts("flue","flue",Math.min(n,t)*.13,c,[0,a+c/2,-t*.18])],materialDefaults:{body:it.darkMetal,glass:it.glass,handles:it.metal,top:it.darkMetal,flue:it.darkMetal}}}function Pm({width:n,height:e,depth:t}){let i=Math.min(n,t),s=i*.52,r=i*.114,o=[ts("motor","body",i*.156,e*.3,[0,e*.14,0])];for(let a=0;a<4;a+=1){let c=a*Math.PI/2,l=rt("blade","frame",[s,e*.072,r],[Math.cos(c)*i*.235,-e*.016,-Math.sin(c)*i*.235]);l.rotation=[0,-c,0],o.push(l)}return{parts:o,materialDefaults:{body:it.metal,frame:it.darkMetal}}}function Dm({width:n,height:e,depth:t}){let i=e*.29,s=n*.55,r=(n-s)/2,o=[rt("base","body",[n*.92,e*.087,t*.92],[0,-e/2+e*.0435,0]),rt("stand","frame",[n*.104,e*.64,t*.104],[0,-e*.15,0]),rt("housing","body",[n,e*.36,t*.23],[0,i,0])];for(let a=0;a<3;a+=1){let c=a*Math.PI*2/3,l=rt("blade","frame",[s,e*.062,t*.19],[Math.cos(c)*r,i+Math.sin(c)*e*.12,t*.14]);l.rotation=[0,0,c],o.push(l)}return{parts:o,materialDefaults:{body:it.metal,frame:it.blue}}}var vn=Object.freeze({ceramic:Object.freeze({materialKey:"custom",baseColor:"#F0F0E8",roughness:.68,metallic:0,opacity:1}),seat:Object.freeze({materialKey:"custom",baseColor:"#E5E4DC",roughness:.62,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#B8BDBD",roughness:.24,metallic:.82,opacity:1}),glass:Object.freeze({materialKey:"glass",baseColor:"#B8DBE3",roughness:.08,metallic:0,opacity:.24})});function $t(n,e,t,i){return{type:"box",name:n,slot:e,size:t,position:i}}function ns(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function Lm({width:n,height:e,depth:t}){let i=t*.3,s=e*.5,r=e*.42,o=Math.min(n*.46,t*.25);return{yawOffsetDegrees:180,parts:[$t("tank","ceramic",[n*.88,s,i],[0,e/2-s/2,-t/2+i/2]),$t("pedestal","ceramic",[n*.56,r,t*.38],[0,-e/2+r/2,t*.08]),ns("bowl","ceramic",o,e*.24,[0,-e*.08,t*.15]),ns("seat","seat",o*.92,Math.max(e*.035,.018),[0,e*.07,t*.15]),ns("flush","handles",Math.max(n*.055,.02),Math.max(e*.018,.01),[0,e/2-.006,-t*.35])],materialDefaults:{ceramic:vn.ceramic,seat:vn.seat,handles:vn.metal}}}function Om({width:n,height:e,depth:t}){let i=e*.58,s=e*.18,r=e*.2,o=-e/2+i+s;return{yawOffsetDegrees:180,parts:[ns("pedestal","ceramic",Math.min(n,t)*.22,i,[0,-e/2+i/2,-t*.08]),$t("basin","ceramic",[n,s,t*.84],[0,-e/2+i+s/2,0]),$t("basin-inset","basin",[n*.66,Math.max(s*.22,.018),t*.5],[0,-e/2+i+s*.74,t*.04]),ns("faucet","fittings",Math.max(n*.018,.012),r,[n*.24,o+r/2,-t*.24]),$t("spout","fittings",[n*.18,Math.max(e*.022,.014),Math.max(t*.025,.014)],[n*.16,Math.min(o+r,e/2-.01),-t*.16])],materialDefaults:{ceramic:vn.ceramic,basin:vn.seat,fittings:vn.metal}}}function Nm({width:n,height:e,depth:t}){let i=Math.max(e*.14,.055),s=Math.max(Math.min(n,t)*.075,.045),r=Math.max(t*.025,.014);return{parts:[$t("rear-side","ceramic",[n,e*.72,s],[0,-e*.14,-t/2+s/2]),$t("front-side","ceramic",[n,e*.72,s],[0,-e*.14,t/2-s/2]),$t("left-side","ceramic",[s,e*.72,t-s*2],[-n/2+s/2,-e*.14,0]),$t("right-side","ceramic",[s,e*.72,t-s*2],[n/2-s/2,-e*.14,0]),$t("tub","tub",[n-s*2,i,t-s*2],[0,-e/2+i/2,0]),$t("rear-rim","ceramic",[n,i,s],[0,e/2-i/2,-t/2+s/2]),ns("faucet","fittings",r,e*.28,[n*.34,e*.34,-t*.33]),$t("spout","fittings",[n*.16,r*1.5,r*1.5],[n*.27,e*.41,-t*.28])],materialDefaults:{ceramic:vn.ceramic,tub:vn.seat,fittings:vn.metal}}}function Fm({width:n,height:e,depth:t}){let i=Math.min(n,t),s=Math.min(Math.max(e*.035,.045),e*.12),r=Math.min(Math.max(i*.014,.01),.018),o=Math.min(Math.max(i*.02,.014),.026),a=Math.max(e-s,.08),c=-e/2+s+a/2,l=n*.43,u=[$t("tray","tub",[n,s,t],[0,-e/2+s/2,0]),$t("rear-glass","glass",[n*.96,a,r],[0,c,-t/2+r/2]),$t("side-glass","glass",[r,a,t*.96],[-n/2+r/2,c,0]),$t("front-glass","glass",[l,a,r],[n/2-l/2,c,t/2-r/2])];for(let d of[[-n/2+o/2,c,-t/2+o/2],[n/2-o/2,c,-t/2+o/2],[n/2-o/2,c,t/2-o/2]])u.push($t("post","frame",[o,a,o],d));u.push(ns("drain","fittings",Math.min(Math.max(i*.055,.026),.05),Math.max(s*.16,.008),[n*.2,-e/2+s+Math.max(s*.08,.004),t*.18])),u.push(ns("rail","fittings",Math.max(o*.44,.008),a*.58,[n*.27,-e/2+s+a*.48,-t/2+r*2.2])),u.push($t("shower-head","fittings",[n*.2,Math.max(o*.78,.012),t*.085],[n*.2,-e/2+s+a*.82,-t*.4]));let h=Math.max(r*1.35,.014);return u.push($t("handle","handles",[o,a*.18,h],[n*.22,c,t/2-h/2])),{parts:u,materialDefaults:{tub:vn.ceramic,glass:vn.glass,frame:vn.metal,fittings:vn.metal,handles:vn.metal}}}var Cl=Object.freeze({pot:Object.freeze({materialKey:"custom",baseColor:"#9D7256",roughness:.82,metallic:0,opacity:1}),soil:Object.freeze({materialKey:"custom",baseColor:"#51402F",roughness:.96,metallic:0,opacity:1}),leaves:Object.freeze({materialKey:"custom",baseColor:"#64805E",roughness:.88,metallic:0,opacity:1}),ceramic:Object.freeze({materialKey:"custom",baseColor:"#B98568",roughness:.7,metallic:0,opacity:1})});function Bo(n,e,t,i,s){return{type:"cylinder",name:n,slot:e,radius:t,height:i,position:s}}function aE(n,e,t,i,s,r){return{type:"sphere",name:n,slot:e,radius:t,scale:i,position:s,rotation:r}}function Zh({width:n,height:e,depth:t},i=!1){let s=e*(i?.24:.36),r=Math.min(n,t)*(i?.32:.38),o=i?11:7,a=-e/2+s*.78,c=e-s*.72,l=[Bo("pot","pot",r,s,[0,-e/2+s/2,0]),Bo("soil","soil",r*.86,Math.max(s*.08,.018),[0,-e/2+s*.92,0])];for(let u=0;u<o;u+=1){let h=u/o*Math.PI*2,d=u%3/2,f=Math.min(n,t)*(.16+d*.13),p=a+c*(.28+d*.24);l.push(aE("leaf","leaves",Math.min(n,t)*.18,[.55,i?1.35:1.05,.34],[Math.cos(h)*f,Math.min(p,e*.4),Math.sin(h)*f],[0,h,Math.cos(h)*.42]))}return{parts:l,materialDefaults:{pot:Cl.pot,soil:Cl.soil,leaves:Cl.leaves}}}function Um({width:n,height:e,depth:t}){let i=e*.7,s=e*.25;return{parts:[Bo("body","ceramic",Math.min(n,t)*.46,i,[0,-e/2+i/2,0]),Bo("neck","ceramic",Math.min(n,t)*.2,s,[0,e/2-s/2,0]),Bo("lip","ceramic",Math.min(n,t)*.27,Math.max(e*.05,.018),[0,e/2-Math.max(e*.025,.009),0])],materialDefaults:{ceramic:Cl.ceramic}}}var ci=Object.freeze({fabric:Object.freeze({materialKey:"fabric",baseColor:"#737373",roughness:.9,metallic:0,opacity:1}),metal:Object.freeze({materialKey:"metal",baseColor:"#747A7D",roughness:.42,metallic:.72,opacity:1}),cabinet:Object.freeze({materialKey:"custom",baseColor:"#C8C5BF",roughness:.72,metallic:0,opacity:1}),cabinetFront:Object.freeze({materialKey:"custom",baseColor:"#E2DFD8",roughness:.66,metallic:0,opacity:1}),cabinetTop:Object.freeze({materialKey:"wood",baseColor:"#9B7653",roughness:.68,metallic:0,opacity:1}),stair:Object.freeze({materialKey:"wood",baseColor:"#A8835F",roughness:.7,metallic:0,opacity:1})});function In(n,e,t,i,s){return{type:"box",name:n,slot:e,size:t,position:i,rotation:s}}function Os({width:n,height:e,depth:t},i={},s="3_seater"){if(s==="ottoman"){let b=e*.72,A=e-b;return{parts:[In("cushion","cushions",[n,b,t],[0,e/2-b/2,0]),In("base","body",[n*.94,A,t*.92],[0,-e/2+A/2,0])],materialDefaults:{cushions:ci.fabric,body:ci.fabric}}}let r=Math.min(Math.max(Number(i.leftExtensionLength)||0,0),3.5),o=Math.min(Math.max(Number(i.rightExtensionLength)||0,0),3.5),a=r>.05||o>.05,c=a?Math.min(t,.9):t,l=-t/2,u=l+c,h=(l+u)/2,d=Math.min(Math.max(n*.34,.62),1.05),f=e*.38,p=c*.2,x=n*.1,m=Math.max(Math.min(Math.min(n,t)*.055,.055),.018),g=Math.max(e*.16,.035),S=Math.max(Math.min(n*.012,.018),.006),E=[In("seat","cushions",[n,f,c],[0,-e/2+f/2,h]),In("back","body",[n,e*.62,p],[0,e*.19,l+p/2]),In("left-arm","body",[x,e*.46,c],[-n/2+x/2,-e*.08,h]),In("right-arm","body",[x,e*.46,c],[n/2-x/2,-e*.08,h])];for(let b of[-n*.4,n*.4])for(let A of[h-c*.32,h+c*.32])E.push(In("leg","legs",[m,g,m],[b,-e/2+g/2,A]));let v=a?3:2;for(let b=1;b<v;b+=1){let A=-n/2+n*b/v;E.push(In("cushion-seam","cushions",[S,Math.max(f*.035,.006),c*.78],[A,-e/2+f+.003,h+c*.02]))}let w=(b,A)=>{if(A<=.05)return;let _=Math.min(Math.max(A,c),3.5),T=b==="left"?-n/2+d/2:n/2-d/2,I=l+_/2;E.push(In(\`\${b}-return\`,"cushions",[d,f,_],[T,-e/2+f/2,I])),E.push(In(\`\${b}-return-seam\`,"cushions",[d*.82,Math.max(f*.055,.012),_*.72],[T,-e/2+f+.004,I+_*.03]))};return w("left",r),w("right",o),{parts:E,materialDefaults:{body:ci.fabric,cushions:ci.fabric,legs:ci.metal}}}function Bm({width:n,height:e,depth:t},i={}){let r=(D,H)=>Math.min(Math.max(Number(D)||H*.42,Math.min(.05,H/2)),Math.max(H-Math.min(.05,H/2),H/2)),o=r(i.leftLegLength,n),a=r(i.rightLegLength,t),c=[[-n/2,-t/2],[n/2,-t/2],[n/2,-t/2+a],[-n/2+o,t/2],[-n/2,t/2]],l=c[2],u=c[3],h=u[0]-l[0],d=u[1]-l[1],f=Math.hypot(h,d),p=[h/f,d/f],x=[p[1],-p[0]],m=[(l[0]+u[0])/2,(l[1]+u[1])/2],g=Math.min(Math.max(e*.06,.025),.08),S=Math.max(e-g,.02),E=Math.min(Math.max(Math.min(n,t)*.025,.014),.026),v=S*.9,w=-g/2,b=-Math.atan2(p[1],p[0]),A=[{type:"extrude",name:"body",slot:"body",outline:c,height:S,position:[0,-g/2,0]},{type:"extrude",name:"top",slot:"top",outline:c,height:g,position:[0,e/2-g/2,0]}],_=f*.44;for(let D of[-f*.225,f*.225]){let H=[m[0]+p[0]*D+x[0]*E/2,m[1]+p[1]*D+x[1]*E/2];A.push(In("front","front",[_,v,E],[H[0],w,H[1]],[0,b,0]))}let T=Math.min(Math.max(e*.18,.12),.3),I=Math.min(Math.max(f*.018,.01),.018),P=Math.min(Math.max(E*.55,.009),.014);for(let D of[-f*.055,f*.055]){let H=[m[0]+p[0]*D+x[0]*(E+P/2),m[1]+p[1]*D+x[1]*(E+P/2)];A.push(In("handle","handles",[I,T,P],[H[0],w,H[1]],[0,b,0]))}return{parts:A,materialDefaults:{body:ci.cabinet,front:ci.cabinetFront,top:ci.cabinetTop,handles:ci.metal}}}function km({width:n,height:e,depth:t},i={}){let s=Math.min(Math.max(Math.round(Number(i.stepCount)||e/.18),2),30),r=i.direction==="down"?"down":"up",o=t/s,a=e/s,c=Math.min(Math.max(a*.22,.025),.055),l=[];for(let u=0;u<s;u+=1){let h=-t/2+o*(u+.5),d=r==="up"?h:-h,f=-e/2+a*(u+1)-c/2;l.push(In("tread","body",[n,c,o],[0,f,d]))}return{parts:l,materialDefaults:{body:ci.stair}}}var cE=Object.freeze({sofa_basic:Object.freeze({variants:Object.freeze({default:(n,e)=>Os(n,e,"default"),"2_seater":(n,e)=>Os(n,e,"2_seater"),"3_seater":cm,corner_left:(n,e)=>Os(n,e,"corner_left"),corner_right:(n,e)=>Os(n,e,"corner_right"),u_shaped:(n,e)=>Os(n,e,"u_shaped"),ottoman:(n,e)=>Os(n,e,"ottoman")})}),chair_basic:Object.freeze({variants:Object.freeze({dining:lm,lounge:fm,wooden:pm,cantilever:mm})}),table_basic:Object.freeze({variants:Object.freeze({coffee:Yh,round:gm,rectangular:Yh})}),bed_basic:Object.freeze({variants:Object.freeze({single:$h,queen:$h})}),wardrobe:Object.freeze({variants:Object.freeze({default:um})}),nightstand:Object.freeze({variants:Object.freeze({default:n=>Tl(n,"nightstand")})}),shelf:Object.freeze({variants:Object.freeze({default:xm})}),cabinet:Object.freeze({variants:Object.freeze({default:Tl})}),cornerCabinet:Object.freeze({variants:Object.freeze({default:Bm})}),genericStorage:Object.freeze({variants:Object.freeze({default:Tl})}),kitchenBase:Object.freeze({variants:Object.freeze({default:hm})}),kitchenTallUnit:Object.freeze({variants:Object.freeze({default:vm})}),refrigerator:Object.freeze({variants:Object.freeze({default:_m})}),stove:Object.freeze({variants:Object.freeze({default:wm})}),rangeHood:Object.freeze({variants:Object.freeze({default:Tm})}),kitchenSink:Object.freeze({variants:Object.freeze({default:bm})}),kitchenIsland:Object.freeze({variants:Object.freeze({default:ym})}),tvLowboard:Object.freeze({variants:Object.freeze({default:dm})}),television:Object.freeze({variants:Object.freeze({default:Mm})}),robotVacuum:Object.freeze({variants:Object.freeze({default:Am})}),ceilingFan:Object.freeze({variants:Object.freeze({default:Pm})}),standingFan:Object.freeze({variants:Object.freeze({default:Dm})}),airConditioner:Object.freeze({variants:Object.freeze({default:Cm})}),heatPumpIndoorUnit:Object.freeze({variants:Object.freeze({default:Rm})}),fireplaceStove:Object.freeze({variants:Object.freeze({default:Im})}),washerDryer:Object.freeze({variants:Object.freeze({default:n=>Al(n,"washerDryer")})}),washingMachine:Object.freeze({variants:Object.freeze({default:n=>Al(n,"washingMachine")})}),tumbleDryer:Object.freeze({variants:Object.freeze({default:n=>Al(n,"tumbleDryer")})}),toilet:Object.freeze({variants:Object.freeze({default:Lm})}),bathroomSink:Object.freeze({variants:Object.freeze({default:Om})}),bathtub:Object.freeze({variants:Object.freeze({default:Nm})}),shower:Object.freeze({variants:Object.freeze({default:Fm})}),straightStair:Object.freeze({variants:Object.freeze({default:km})}),smallPlant:Object.freeze({variants:Object.freeze({default:n=>Zh(n,!1)})}),floorPlant:Object.freeze({variants:Object.freeze({default:n=>Zh(n,!0)})}),decorativeVase:Object.freeze({variants:Object.freeze({default:Um})}),rug:Object.freeze({variants:Object.freeze({default:Sm})}),genericObject:Object.freeze({variants:Object.freeze({default:Em})})});function zm(n,e){return cE[n]?.variants?.[e]??null}var Wm=Object.freeze({fabric:Object.freeze({roughness:.9,metallic:0}),wood:Object.freeze({roughness:.68,metallic:0}),metal:Object.freeze({roughness:.42,metallic:.72}),glass:Object.freeze({roughness:.18,metallic:0}),paint:Object.freeze({roughness:.84,metallic:0}),tile:Object.freeze({roughness:.62,metallic:0}),concrete:Object.freeze({roughness:.9,metallic:0}),stone:Object.freeze({roughness:.58,metallic:.02}),custom:Object.freeze({roughness:.7,metallic:0})}),Pn=256,Hm=Object.freeze({automatic:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"longestBoundary"}),tile:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),laminate:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),carpet:Object.freeze({elementSize:.3,lineWidth:.003,orientation:"local"}),wood:Object.freeze({elementSize:.18,lineWidth:.002,orientation:"local"}),fabric:Object.freeze({elementSize:.06,lineWidth:.001,orientation:"local"}),concrete:Object.freeze({elementSize:.45,lineWidth:.003,orientation:"local"}),stone:Object.freeze({elementSize:.6,lineWidth:.003,orientation:"local"})});function Sr(n){return Number(n).toFixed(6)}function lE(n){return n==="wallPaint"?"paint":Object.hasOwn(Wm,n)?n:"custom"}function uE(n,e,t){let i=n?.pattern??e?.pattern,s=["wood","fabric","tile","concrete","stone"].includes(t)?t:null,r=i?.kind??s;if(!r||!Object.hasOwn(Hm,r))return null;let o=Hm[r];return{kind:r,elementSize:i?.elementSize??o.elementSize,lineWidth:i?.lineWidth??o.lineWidth,orientation:i?.orientation??o.orientation}}function Vm(n={},e={}){let t=n?.materialKey??e?.materialKey??"custom",i=lE(t),s=Wm[i],r={materialKey:i,baseColor:n?.baseColor??e?.baseColor??"#B8B3AA",roughness:n?.roughness??e?.roughness??s.roughness,metallic:n?.metallic??e?.metallic??s.metallic,opacity:n?.opacity??e?.opacity??1},o=uE(n,e,i);return o?{...r,pattern:o}:r}function Xm(n){return n?[n.kind,Sr(n.elementSize),Sr(n.lineWidth),n.orientation].join(":"):"no-pattern"}function hE(n){return[n.materialKey,new We(n.baseColor).getHexString().toUpperCase(),Xm(n.pattern)].join(":")}function dE(n,e){return[e.physical?"physical":"standard",n.materialKey,new We(n.baseColor).getHexString().toUpperCase(),Sr(n.roughness),Sr(n.metallic),Sr(n.opacity),Xm(n.pattern),Sr(e.transmission??0),e.depthWrite===!1?"no-depth-write":"depth-write",e.side??pn].join(":")}function Kh(n,e,t){let i=Math.imul(n+1,521288629)^Math.imul(e+1,1597334677)^t;return i=Math.imul(i^i>>>15,73244475),((i^i>>>16)>>>0)/4294967295}function fE(n){return Math.min(Math.max(n,0),1)}function Jh(n){let e=Math.max(n.elementSize,.001);switch(n.kind){case"laminate":return{x:Math.max(e*5.2,.72),z:e*2};case"wood":return{x:Math.max(e*5.2,.72),z:e};case"fabric":case"carpet":return{x:Math.min(e,.12),z:Math.min(e,.12)};case"automatic":return{x:1,z:e};default:return{x:e,z:e}}}function pE(n){let e=Jh(n);return{resolution:Pn,lineWidthMeters:n.lineWidth,lineWidthPixels:{x:n.lineWidth/e.x*Pn,z:n.lineWidth/e.z*Pn},antialiased:!0}}function Ns(n,e,t){let i=1/Pn,s=Math.max(t,0)/2,r=0;for(let o of e){let a=Math.abs(n-o),c=Math.min(a,1-a);r=Math.max(r,fE((s+i/2-c)/i))}return r}function mE(n,e,t){let i=Jh(n),s=n.lineWidth/i.x,r=n.lineWidth/i.z;switch(n.kind){case"automatic":return Ns(t,[0],r);case"tile":return Math.max(Ns(e,[0],s),Ns(t,[0],r));case"laminate":{let o=t<.5?0:1;return Math.max(Ns(t,[0,.5],r),Ns(e,[o===0?0:.5],s))}case"wood":return Math.max(Ns(e,[0],s),Ns(t,[0],r));default:return 0}}function Rl(n,e,t){return Math.round(n+(e-n)*t)}function gE(n,e,t){let i=(e+.5)/Pn,s=(t+.5)/Pn,r=mE(n,i,s);switch(n.kind){case"automatic":return Rl(255,226,r);case"tile":return Rl(255,208,r);case"laminate":{let o=Math.sin((i*7.5+s*.7)*Math.PI*2)*.7,a=Math.sin((i*25+s*1.2)*Math.PI*2)*.35;return Rl(Math.min(Math.round(254+o+a),255),228,r)}case"wood":{let o=Math.sin((i*8.5+s*.55)*Math.PI*2)*.65,a=Math.sin((i*29+s*1.1)*Math.PI*2)*.3,c=(Kh(Math.floor(e/4),t,194075)-.5)*.6;return Rl(Math.min(Math.round(254+o+a+c),255),230,r)}case"fabric":case"carpet":{let o=e%6===2||t%6===2?-24:0,a=e%6===5||t%6===5?8:0;return 247+o+a}case"concrete":return Math.round(246-Kh(e,t,277015)*18);case"stone":{let o=Kh(Math.floor(e/3),Math.floor(t/3),597045),a=Math.abs(Math.sin((i*2.1+s*1.35)*Math.PI*2));return Math.round(246-o*12-(a<.055?20:0))}default:return 255}}function xE(n){let e=new Uint8Array(Pn*Pn*4);for(let i=0;i<Pn;i+=1)for(let s=0;s<Pn;s+=1){let r=Math.min(Math.max(gE(n,s,i),0),255),o=(i*Pn+s)*4;e[o]=r,e[o+1]=r,e[o+2]=r,e[o+3]=255}let t=new ti(e,Pn,Pn,gn,on);return t.wrapS=bs,t.wrapT=bs,t.magFilter=Pt,t.minFilter=si,t.generateMipmaps=!0,t.anisotropy=4,t.colorSpace=Ft,t.userData.portablePattern={...n},t.userData.meterPeriod=Jh(n),t.userData.portablePatternRaster=pE(n),t.needsUpdate=!0,t}function Gm(n,e={},t=null){let i={color:n.baseColor,roughness:n.roughness,metalness:n.metallic,transparent:n.opacity<1,opacity:n.opacity,depthWrite:e.depthWrite??!0,side:e.side??pn,map:t},s=e.physical?new yo({...i,transmission:e.transmission??0}):new An(i);return s.userData.materialKey=n.materialKey,s.userData.portableAppearance={...n},s}function Si(){let n=new Map,e=new Map;function t(i){if(!i.pattern)return null;let s=hE(i);return e.has(s)||e.set(s,xE(i.pattern)),e.get(s)}return{material(i,s,r={}){let o=Vm(i,s),a={...r,physical:r.physical??o.materialKey==="glass"},c=dE(o,a);return n.has(c)||n.set(c,Gm(o,a,t(o))),n.get(c)},instance(i,s,r={}){let o=Vm(i,s);return Gm(o,{...r,physical:r.physical??o.materialKey==="glass"},t(o))}}}function qm(n){return Number(n).toFixed(6)}function Qh(){let n=new Map,e=Si();return{boxGeometry(t){let i=\`box:\${t.map(qm).join(":")}\`;return n.has(i)||n.set(i,new Wt(...t)),n.get(i)},geometry(t){let i,s;switch(t.type){case"extrude":i=[t.height,...t.outline.flat()],s=()=>{let o=new Tn;t.outline.forEach(([c,l],u)=>{u===0?o.moveTo(c,-l):o.lineTo(c,-l)}),o.closePath();let a=new yi(o,{depth:t.height,bevelEnabled:!1,steps:1});return a.translate(0,0,-t.height/2),a.rotateX(-Math.PI/2),a};break;case"cylinder":i=[t.radius,t.height,t.radialSegments??24],s=()=>new _i(t.radius,t.radius,t.height,t.radialSegments??24);break;case"sphere":i=[t.radius,t.widthSegments??20,t.heightSegments??14],s=()=>new bi(t.radius,t.widthSegments??20,t.heightSegments??14);break;default:return this.boxGeometry(t.size)}let r=\`\${t.type}:\${i.map(qm).join(":")}\`;return n.has(r)||n.set(r,s()),n.get(r)},material(t){return e.material(t)}}}function vE(n,e,t){let i=t.appearance?.materialSlots??{},s=e.materialDefaults[n.slot]??e.materialDefaults[n.fallbackSlot]??{materialKey:"custom",baseColor:"#B8B3AA",roughness:.7,metallic:0,opacity:1},r=i[n.slot]??(n.fallbackSlot?i[n.fallbackSlot]:void 0);return{...s,...r}}function Ym(n,e){n.userData.sceneObjectId=e.id,n.userData.sceneElementType="object",n.userData.kind=e.kind,n.userData.binding=e.binding??null,n.userData.assetKey=e.assetKey,n.userData.variantKey=e.variantKey}function $m(n,e,t=Qh()){let i=zm(e.assetKey,e.variantKey);if(!i)return console.warn(\`Mikonus interior asset \${e.assetKey}/\${e.variantKey} is not supported; skipping \${e.id}.\`),null;let s=e.dimensions,r=i(s,e.parameters??{}),o=new st;o.position.set(e.position.x,e.position.y,e.position.z),o.rotation.y=nt.degToRad(e.rotation.y),Ym(o,e),o.userData.anchor="groundCenter",o.userData.forwardAxis="+Z",o.userData.dimensions={...s},o.userData.recipeYawOffsetDegrees=r.yawOffsetDegrees??0;let a=new st;a.rotation.y=nt.degToRad(r.yawOffsetDegrees??0),o.add(a);for(let c of r.parts){let l=new Je(t.geometry(c),t.material(vE(c,r,e)));l.name=\`\${e.assetKey}:\${c.name}\`,l.position.set(c.position[0],c.position[1]+s.height/2,c.position[2]),c.rotation&&l.rotation.set(...c.rotation),c.scale&&l.scale.set(...c.scale),Ym(l,e),l.userData.materialSlot=c.slot,l.userData.recipePart=c.name,a.add(l)}return n.add(o),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:o,pickables:[],visual:{type:"furniture",assetKey:e.assetKey,variantKey:e.variantKey,pathMotionRoot:a}}}function Er(n,e,t,i){return{type:"box",name:n,role:e,size:t,position:i}}function Jt(n,e,t,i,s,r=void 0){return{type:"cylinder",name:n,role:e,radius:t,height:i,position:s,rotation:r}}function _E(n,e,t,i){return{type:"sphere",name:n,role:e,radius:t,position:i}}function yE(n,e,t,i,s,r){return{type:"frustum",name:n,role:e,topRadius:t,bottomRadius:i,height:s,position:r}}function bE(n){let e=Math.min(n.width,n.depth),t=Math.max(n.height*.2,.018),i=Math.max(n.height*.42,.035),s=Math.max(n.height*.22,.018);return[Jt("mount","body",e*.3,t,[0,n.height/2-t/2,0]),Jt("shade","body",e*.48,i,[0,n.height*.05,0]),Jt("diffuser","diffuser",e*.41,s,[0,-n.height/2+s/2,0])]}function ko(n,e,t=1){let i=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),s=Math.max(n.height*.045,.025),r=t===1?Math.min(n.width*.42,n.depth):n.width*.88,o=n.height*.43-i,a=Math.max(n.height*.14,.08),c=Math.min(n.depth*.44,n.width/(t*2.35)),l=(e.shadeDiameter??.35)/2,u=Math.min(c,Math.max(l,c*.72)),h=Math.max(n.width-u*2.25,0),d=[Er("mount","body",[r,s,n.depth*.58],[0,n.height/2-s/2,0])];for(let f=0;f<t;f+=1){let p=t===1?.5:f/(t-1),x=-h/2+h*p,m=Math.max(a*.16,.012);d.push(Jt(\`cable-\${f}\`,"body",Math.max(n.width*.007,.006),i,[x,n.height/2-s-i/2,0])),d.push(Jt(\`shade-\${f}\`,"body",u,a,[x,o,0])),d.push(Jt(\`diffuser-\${f}\`,"diffuser",u*.82,m,[x,o-a/2+m/2,0]))}return d}function ME(n,e){let t=Math.max(Math.min(e.cableLength??.8,n.height*.82),.05),i=Math.max(n.height*.045,.025),s=n.height*.43-t,r=Math.max(n.height*.075,.045),o=Math.max(r*.22,.012);return[Er("mount","body",[n.width*.42,i,n.depth*.62],[0,n.height/2-i/2,0]),Jt("cable-left","body",.006,t,[-n.width*.34,n.height/2-i-t/2,0]),Jt("cable-right","body",.006,t,[n.width*.34,n.height/2-i-t/2,0]),Er("bar","body",[n.width,r,n.depth*.72],[0,s,0]),Er("diffuser","diffuser",[n.width*.94,o,n.depth*.56],[0,s-r/2+o/2,0])]}function SE(n,e){let t=Math.max(Math.min(n.width,n.depth),.12),i=Math.max(n.height,.3),s=Number.isFinite(e.shadeDiameter)?e.shadeDiameter:t*.9,o=Math.min(Math.max(s,t*.82),t)/2,a=o*.64,c=Math.min(Math.max(i*.3,.24),i*.38),l=i/2-c/2-i*.025,u=Math.max(n.height*.035,.025),h=l+c*.16,d=-n.height/2+u;return[Jt("base","body",n.width*.38,u,[0,-n.height/2+u/2,0]),Jt("stem","body",Math.max(n.width*.025,.009),Math.max(h-d,.12),[0,(h+d)/2,0]),yE("shade","shade",a,o,c,[0,l,0]),_E("diffuser","diffuser",Math.max(a*.5,.045),[0,l-c*.08,0])]}function EE(n,e){let t=Math.max(n.height*.035,.025),i=n.height*.28,s=n.height/2-i/2,r=Math.min(e.shadeDiameter??.35,Math.min(n.width,n.depth))/2;return[Jt("base","body",n.width*.38,t,[0,-n.height/2+t/2,0]),Jt("stem","body",Math.max(n.width*.025,.009),n.height*.62,[0,-n.height*.13,0]),Jt("shade","shade",r,i,[0,s,0]),Jt("diffuser","diffuser",Math.max(r*.45,.035),Math.max(i*.28,.02),[0,s-i*.14,0])]}function wE(n){let e=Math.max(n.depth*.18,.018),t=n.depth*.62,i=Math.max(n.depth*.16,.016);return[Er("mount","body",[n.width*.58,n.height*.58,e],[0,0,-n.depth/2+e/2]),Jt("shade","body",Math.min(n.width,n.height)*.44,t,[0,0,-n.depth/2+e+t/2],[Math.PI/2,0,0]),Jt("diffuser","diffuser",Math.min(n.width,n.height)*.34,i,[0,0,n.depth/2-i/2],[Math.PI/2,0,0])]}function TE(n){let e=n.height*.32;return[Jt("shade","body",Math.min(n.width,n.depth)*.48,n.height,[0,0,0]),Jt("diffuser","diffuser",Math.min(n.width,n.depth)*.32,e,[0,-n.height/2+e/2,0])]}function AE(n,e){let t=Math.max(e.stripThickness??.025,.008);return[Er("strip","diffuser",[Math.max(n.width-Math.min(n.width*.2,.008),.008),t,t],[0,0,0])]}var CE=Object.freeze({ceilingLight:(n,e)=>bE(n,e),pendantLight:(n,e)=>ko(n,e,1),pendantSpot1:(n,e)=>ko(n,e,1),pendantSpot2:(n,e)=>ko(n,e,2),pendantSpot3:(n,e)=>ko(n,e,3),pendantSpot4:(n,e)=>ko(n,e,4),pendantLED:ME,floorLamp:SE,tableLamp:EE,wallLight:(n,e)=>wE(n,e),recessedSpot:(n,e)=>TE(n,e),ledStrip:AE});function jm(n,e,t={}){let i=CE[n];return i?i(e,t):null}var ed=.24,RE=.25;function IE(){let e=new Uint8Array(16384);for(let i=0;i<64;i++)for(let s=0;s<64;s++){let r=Math.abs((s+.5)/64*2-1),o=Math.abs((i+.5)/64*2-1),a=Math.pow(r**4+o**4,.25),c=nt.clamp((1-a)/.38,0,1),l=c*c*(3-2*c),u=(i*64+s)*4;e[u]=e[u+1]=e[u+2]=255,e[u+3]=Math.round(l*255)}let t=new ti(e,64,64);return t.minFilter=t.magFilter=Pt,t.needsUpdate=!0,t}function PE(n,e,t,i){let s=[];for(let r=0;r<n.length;r++){let o=n[r],a=n[(r+1)%n.length],c=i*(o[e]-t)<=0,l=i*(a[e]-t)<=0;if(c&&s.push(o),c!==l){let u=(t-o[e])/(a[e]-o[e]);s.push({x:o.x+(a.x-o.x)*u,z:o.z+(a.z-o.z)*u})}}return s}function Zm(n,e,t){let i=new st;i.name="DashboardFurnitureContactShadows";let s=e.rooms.map(o=>{let a=o.polygon.map(c=>new de(c.x,c.z));return{...o,triangles:Bn.triangulateShape(a,[]).map(c=>c.map(l=>o.polygon[l]))}}),r;for(let o of e.objects){if(o.kind!=="furniture"||!t.has(o.id)||["rug","robotVacuum"].includes(o.assetKey)||(o.dimensions??o.size).height<.08)continue;let{width:a,depth:c}=o.dimensions??o.size,l=nt.degToRad(o.rotation.y),u=Math.cos(l),h=Math.sin(l),{x:d,y:f,z:p}=o.position,x=a/2+.08,m=c/2+.08,g=[],S=[];for(let w of s){let b=f-w.elevation;if(!(b<-.02||b>RE))for(let A of w.triangles){let _=A.map(T=>({x:u*(T.x-d)-h*(T.z-p),z:h*(T.x-d)+u*(T.z-p)}));for(let[T,I,P]of[["x",x,1],["x",-x,-1],["z",m,1],["z",-m,-1]])if(_=PE(_,T,I,P),!_.length)break;for(let T=1;T+1<_.length;T++)for(let I of[_[0],_[T],_[T+1]])g.push(d+u*I.x+h*I.z,w.elevation+.004,p-h*I.x+u*I.z),S.push(I.x/(x*2)+.5,I.z/(m*2)+.5)}}if(!g.length)continue;r??=new Gt({color:0,map:IE(),transparent:!0,opacity:ed,depthWrite:!1,toneMapped:!1,side:Tt,forceSinglePass:!0});let E=new Vt;E.setAttribute("position",new ft(g,3)),E.setAttribute("uv",new ft(S,2));let v=new Je(E,r);v.name=\`FurnitureContactShadow:\${o.id}\`,v.userData.isContactShadow=!0,v.userData.excludeFromDevicePicking=!0,v.userData.excludeFromCameraFit=!0,v.renderOrder=1,i.add(v)}return i.children.length&&n.add(i),{group:i,material:r}}var wr=2,is=Object.freeze({hemisphere:Object.freeze({skyColor:16776179,groundColor:8358552,intensity:.82}),key:Object.freeze({color:16773852,intensity:2.15,direction:Object.freeze({x:-.48,y:1,z:.62})}),fill:Object.freeze({color:12177646,intensity:.24,direction:Object.freeze({x:.72,y:.62,z:-.58})}),globalShadow:Object.freeze({mapSize:2048,bias:-35e-5,normalBias:.025,radius:3})});function Jm(n){n.shadowMap.enabled=!0,n.shadowMap.type=Rs,n.shadowMap.autoUpdate=!1,n.shadowMap.needsUpdate=!0}function nd(n,e){n.shadowMap.enabled=!0,n.shadowMap.needsUpdate=!0}function td(n){return n?(n.userData.dashboardBaseIntensity??=n.intensity,n.userData.dashboardBaseIntensity):0}function Qm(n){let e=n.userData.dashboardAmbientBrightnessFactor??1,t=n.userData.dashboardEnvironmentIntensityFactor??1;n.intensity=td(n)*e*t}function id(n,e){let t=n?.hemisphere;t&&(t.userData.dashboardAmbientBrightnessFactor=Number.isFinite(e)?Math.max(e,0):1,Qm(t))}function e0(n,e){if(!n||!e)return;let t=e.ambientIntensityFactor??1,i=e.keyIntensityFactor??1,s=e.fillIntensityFactor??1;if(n.hemisphere&&(n.hemisphere.userData.dashboardEnvironmentIntensityFactor=t,Qm(n.hemisphere)),n.keyLight){n.keyLight.intensity=td(n.keyLight)*i,Array.isArray(e.keyRGB)&&n.keyLight.color.setRGB(...e.keyRGB,Ft);let r=e.sunPositionDirection,o=n.shadowFit;r&&o&&n.keyLight.position.set(o.center.x+r.x*o.horizontalRadius,o.center.y+Math.max(r.y,.08)*o.horizontalRadius,o.center.z+r.z*o.horizontalRadius)}n.fillLight&&(n.fillLight.intensity=td(n.fillLight)*s,Array.isArray(e.fillRGB)&&n.fillLight.color.setRGB(...e.fillRGB,Ft))}function sd(n,e,t){let i=Number.isFinite(t)?Math.min(Math.max(t,0),1):1;n?.keyLight?.shadow&&(n.keyLight.shadow.intensity=i),n?.contactShadows?.material&&(n.contactShadows.material.opacity=ed*i)}function Il(n,e,t){n?.keyLight&&(n.keyLight.castShadow=t),n?.contactShadows&&(n.contactShadows.group.visible=t)}function DE(n){return(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean)}function Km(n){return DE(n).some(e=>e.transparent===!0&&e.opacity<.98||e.transmission>0)}function LE(n){n.traverse(e=>{if(!e.isMesh)return;if(e.userData.isPhysicalLightOccluder){e.castShadow=!0,e.receiveShadow=!1;return}if(e.userData.isPickProxy||e.userData.isContactShadow||e.userData.isLinearLightProjection||e.userData.isLinearLightReceiver||e.userData.isRoomSpotProjection){e.castShadow=!1,e.receiveShadow=!1;return}let t=e.userData.sceneElementType==="room",i=e.userData.lightRole==="diffuser";e.castShadow=!t&&!i&&!Km(e),e.receiveShadow=!Km(e)})}function OE(n){n.updateWorldMatrix(!0,!0);let e=new Ht,t=new Ht;return n.traverse(i=>{!i.isMesh||i.userData.isPhysicalLightOccluder||i.userData.isContactShadow||i.userData.isLinearLightProjection||i.userData.isLinearLightReceiver||i.userData.isRoomSpotProjection||e.union(t.setFromObject(i))}),e.isEmpty()&&(e.min.set(-1,0,-1),e.max.set(1,2,1)),e}function NE(n,e){let t=e.getCenter(new O),i=e.getSize(new O),s=Math.max(Math.hypot(i.x,i.z)/2+.65,1.5),r=is.key.direction;n.position.set(t.x+r.x*s,e.max.y+r.y*s,t.z+r.z*s),n.target.position.set(t.x,e.min.y+Math.min(i.y*.28,.75),t.z);let o=n.shadow.camera;return o.left=-s,o.right=s,o.top=s,o.bottom=-s,o.near=.1,o.far=s*3.4+i.y,o.updateProjectionMatrix(),{bounds:e,center:t,horizontalRadius:s}}function t0(n,e){LE(e);let t=OE(e),i=is.hemisphere,s=new Mo(i.skyColor,i.groundColor,i.intensity);s.name="DashboardAmbientHemisphere",n.add(s);let r=is.key,o=new pr(r.color,r.intensity);o.name="DashboardShadowKey",o.castShadow=!0,o.shadow.mapSize.setScalar(is.globalShadow.mapSize),o.shadow.bias=is.globalShadow.bias,o.shadow.normalBias=is.globalShadow.normalBias,o.shadow.radius=is.globalShadow.radius,n.add(o,o.target);let a=NE(o,t),c=is.fill,l=new pr(c.color,c.intensity);return l.name="DashboardSkyFill",l.castShadow=!1,l.position.set(a.center.x+c.direction.x*a.horizontalRadius,t.max.y+c.direction.y*a.horizontalRadius,a.center.z+c.direction.z*a.horizontalRadius),l.target.position.copy(a.center),n.add(l,l.target),{hemisphere:s,keyLight:o,fillLight:l,shadowFit:a}}var n0=.72,i0=.64,FE=new Set(["robotVacuum","rug"]);function UE(n,e){let t=!1;for(let i=0,s=e.length-1;i<e.length;s=i++){let r=e[i],o=e[s];r.z>n.z!=o.z>n.z&&n.x<(o.x-r.x)*(n.z-r.z)/(o.z-r.z)+r.x&&(t=!t)}return t}function BE(){let e=new Uint8Array(65536);for(let i=0;i<128;i+=1)for(let s=0;s<128;s+=1){let r=Math.abs((s+.5)/128*2-1),o=Math.abs((i+.5)/128*2-1),a=Math.max(r-.55,0)/.45,c=Math.hypot(a,o),l=Math.max(1-c**2,0)**2,u=(i*128+s)*4;e[u]=e[u+1]=e[u+2]=255,e[u+3]=Math.round(l*255)}let t=new ti(e,128,128);return t.minFilter=t.magFilter=Pt,t.needsUpdate=!0,t}function Ei(n,e){return n.rooms.filter(i=>UE(e,i.polygon)).sort((i,s)=>{let r=i.elevation<=e.y+.05,o=s.elevation<=e.y+.05;return r!==o?r?-1:1:Math.abs(e.y-i.elevation)-Math.abs(e.y-s.elevation)})[0]??null}function zo(n,e,t,i,s){let r=new Tn;n.polygon.forEach((h,d)=>{d===0?r.moveTo(h.x,-h.z):r.lineTo(h.x,-h.z)}),r.closePath();let o=new ws(r);o.rotateX(-Math.PI/2);let a=o.getAttribute("position"),c=new Float32Array(a.count*2),l=Math.cos(t),u=Math.sin(t);for(let h=0;h<a.count;h+=1){let d=a.getX(h)-e.x,f=a.getZ(h)-e.z,p=l*d-u*f,x=u*d+l*f;c[h*2]=p/i+.5,c[h*2+1]=x/s+.5}return o.setAttribute("uv",new en(c,2)),o}function kE(n,e,t,i,s){let r=new O(Math.cos(e),0,-Math.sin(e)),o=new O(Math.sin(e),0,Math.cos(e));return new tn({uniforms:{lightColor:{value:new We(16777215)},lightPosition:{value:n.clone()},alongAxis:{value:r},acrossAxis:{value:o},halfWidth:{value:t/2},halfDepth:{value:i/2},distance:{value:s},intensity:{value:0}},vertexShader:\`
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
    \`,transparent:!0,blending:ii,depthTest:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:!1,side:pn})}function zE(n,e,t){return!["furniture","decor"].includes(n.kind)||FE.has(n.visual?.assetKey)?!1:Ei(e,n.root.position)?.id===t.id}function HE(n){return!n.isMesh||n.isSkinnedMesh||!n.visible||n.userData.isPickProxy||n.userData.excludeFromCameraFit||n.userData.isPhysicalLightOccluder?!1:(Array.isArray(n.material)?n.material:[n.material]).filter(Boolean).some(t=>t.visible!==!1&&t.opacity>.05&&!(t.transparent===!0&&t.opacity<.98)&&!(t.transmission>0))}function VE(n,e){let t=new Ht().setFromObject(n.root);if(t.isEmpty())return!1;let i=t.getCenter(new O),s=t.getSize(new O),r=Math.hypot(s.x,s.z)/2,o=i.sub(e.uniforms.lightPosition.value);return Math.abs(o.dot(e.uniforms.alongAxis.value))<=e.uniforms.halfWidth.value+r&&Math.abs(o.dot(e.uniforms.acrossAxis.value))<=e.uniforms.halfDepth.value+r&&t.min.y<e.uniforms.lightPosition.value.y+.02&&e.uniforms.lightPosition.value.y-t.max.y<=e.uniforms.distance.value}function GE(n,e,t,i,s,r,o){n.updateWorldMatrix(!0,!0),i.root.updateWorldMatrix(!0,!0);let a=i.visual.light.getWorldPosition(new O),c=kE(a,i.root.rotation.y,s,r,i.visual.lightProfile.distance),l=new st;l.name=\`LinearLightFurnitureReceivers:\${i.id}\`,l.visible=!1,l.userData.excludeFromCameraFit=!0;let u=n.matrixWorld.clone().invert();for(let h of o)zE(h,e,t)&&(h.root.updateWorldMatrix(!0,!0),VE(h,c)&&h.root.traverse(d=>{if(!HE(d))return;let f=new Je(d.geometry,c);f.name=\`LinearLightFurnitureReceiver:\${i.id}:\${h.id}\`,f.matrixAutoUpdate=!1,f.matrix.multiplyMatrices(u,d.matrixWorld),f.renderOrder=3,f.frustumCulled=d.frustumCulled,f.userData.isLinearLightReceiver=!0,f.userData.sourceEntityId=h.id,f.userData.roomId=t.id,f.userData.excludeFromDevicePicking=!0,f.userData.excludeFromCameraFit=!0,l.add(f)}));return l.children.length?{group:l,material:c,count:l.children.length}:(c.dispose(),{group:null,material:null,count:0})}function s0(n,e,t){let i=new st;i.name="DashboardLinearLightProjections";let s=null;for(let r of t.values()){let{visual:o}=r;if(r.kind!=="light"||!o?.light?.isRectAreaLight)continue;let a=Ei(e,r.root.position);if(!a)continue;s??=BE();let c=Math.min(o.lightProfile.distance*.38,1.15),l=o.light.width+c,u=Math.min(o.lightProfile.distance*(o.lightProfile.projectionDepthScale??.92),o.lightProfile.projectionMaxDepth??3.2),h=new Gt({color:16777215,map:s,transparent:!0,opacity:0,blending:ii,depthWrite:!1,toneMapped:!1,side:Tt,forceSinglePass:!0}),d=new Je(zo(a,r.root.position,r.root.rotation.y,l,u),h);d.name=\`LinearLightProjection:\${r.id}\`,d.position.y=a.elevation+.006,d.visible=!1,d.renderOrder=2,d.userData.isLinearLightProjection=!0,d.userData.roomId=a.id,d.userData.excludeFromDevicePicking=!0,d.userData.excludeFromCameraFit=!0,i.add(d);let f=GE(n,e,a,r,l,u,t.values());f.group&&i.add(f.group),o.linearProjection={mesh:d,material:h,roomId:a.id,width:l,depth:u,receiverGroup:f.group,receiverMaterial:f.material,receiverCount:f.count}}return i.children.length&&n.add(i),{group:i,texture:s}}var r0=.1,o0=.18;function a0(n,e,t){let i=new st;i.name="DashboardRoomLightFills";let s=new Map;for(let r of t.values()){if(r.kind!=="light"||r.visual?.type!=="light")continue;let o=Ei(e,r.root.position);if(!o)continue;let a=s.get(o.id);if(!a){let c=new Gt({color:16777215,transparent:!0,opacity:0,blending:ii,depthTest:!0,depthWrite:!1,toneMapped:!1,side:Tt,forceSinglePass:!0}),l=new Je(zo(o,r.root.position,0,1,1),c);l.name=\`RoomLightFill:\${o.id}\`,l.position.y=o.elevation+.003,l.visible=!1,l.renderOrder=0,l.userData.isRoomLightFill=!0,l.userData.roomId=o.id,l.userData.excludeFromDevicePicking=!0,l.userData.excludeFromCameraFit=!0,i.add(l),a={mesh:l,material:c,roomId:o.id},s.set(o.id,a)}r.visual.roomLightFill=a}return i.children.length&&n.add(i),{group:i,fills:s}}var c0=.06;function WE(n){let e="#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )",t="#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",i=n.indexOf(e),s=n.indexOf(t,i);if(i<0||s<0)throw new Error("The Three.js lighting shader no longer exposes the expected spotlight block.");return\`\${n.slice(0,i)}\${n.slice(s)}\`}var XE=WE(Qe.lights_fragment_begin);function l0(n){let e=n.onBeforeCompile;return n.onBeforeCompile=(t,i)=>{if(e.call(n,t,i),!t.fragmentShader.includes("#include <lights_fragment_begin>"))throw new Error("The room floor material cannot isolate local spotlights.");t.fragmentShader=t.fragmentShader.replace("#include <lights_fragment_begin>",XE)},n.customProgramCacheKey=()=>"mikonus-room-floor-without-spotlights-v1",n.userData.excludesLocalSpotLights=!0,n}function qE(n,e,t){let i=n.getWorldPosition(new O),s=e.getWorldPosition(new O).sub(i).normalize();return new tn({uniforms:{lightColor:{value:new We(16777215)},lightPosition:{value:i},lightDirection:{value:s},distance:{value:t.distance},coneCos:{value:Math.cos(n.angle)},penumbraCos:{value:Math.cos(n.angle*(1-n.penumbra))},intensity:{value:0}},vertexShader:\`
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
    \`,transparent:!0,blending:ii,depthTest:!0,depthWrite:!1,toneMapped:!1,side:Tt,forceSinglePass:!0})}function u0(n,e,t){let i=new st;i.name="DashboardRoomSpotProjections",n.updateWorldMatrix(!0,!0);for(let s of t.values()){let{visual:r}=s;if(s.kind!=="light"||!r?.light?.isSpotLight||!r.lightTarget)continue;let o=Ei(e,s.root.position);if(!o)continue;s.root.updateWorldMatrix(!0,!0);let a=qE(r.light,r.lightTarget,r.lightProfile),c=new Je(zo(o,s.root.position,s.root.rotation.y,1,1),a);c.name=\`RoomSpotProjection:\${s.id}\`,c.position.y=o.elevation+.007,c.visible=!1,c.renderOrder=2,c.userData.isRoomSpotProjection=!0,c.userData.roomId=o.id,c.userData.excludeFromDevicePicking=!0,c.userData.excludeFromCameraFit=!0,i.add(c),r.roomSpotProjection={mesh:c,material:a,roomId:o.id}}return i.children.length&&n.add(i),{group:i}}var YE=4,$E=512,h0=Object.freeze({ceilingLight:Object.freeze({intensity:54,distance:5,inner:26,outer:76,priority:9}),pendantLight:Object.freeze({intensity:44,distance:4.8,inner:30,outer:78,priority:8}),pendantSpot1:Object.freeze({intensity:56,distance:4.2,inner:14,outer:44,priority:10}),pendantSpot2:Object.freeze({intensity:58,distance:4.8,inner:24,outer:70,priority:10}),pendantSpot3:Object.freeze({intensity:62,distance:5,inner:26,outer:78,priority:10}),pendantSpot4:Object.freeze({intensity:66,distance:5.2,inner:28,outer:84,priority:10}),pendantLED:Object.freeze({intensity:48,distance:4.6,inner:34,outer:82,priority:8,projectionOpacity:.44,receiverIntensity:.48,projectionDepthScale:.62,projectionMaxDepth:2.6}),floorLamp:Object.freeze({intensity:30,distance:4,inner:72,outer:124,priority:6}),tableLamp:Object.freeze({intensity:22,distance:2.8,inner:34,outer:82,priority:5}),wallLight:Object.freeze({intensity:38,distance:3.6,inner:26,outer:74,priority:7,direction:"forward"}),recessedSpot:Object.freeze({intensity:52,distance:4,inner:14,outer:42,priority:10}),ledStrip:Object.freeze({intensity:26,distance:2.8,inner:46,outer:104,priority:5})}),jE=h0.ceilingLight;function rd(n){return n.reduce((e,t)=>e+t,0)/Math.max(n.length,1)}function d0(n,e,t,i){let s=h0[e]??jE,r=i.filter(h=>h.role==="diffuser"),o=r.length>0?r:i,a=new O(rd(o.map(h=>h.position[0])),rd(o.map(h=>h.position[1]+t/2)),rd(o.map(h=>h.position[2]))),c=s.direction==="forward"?new O(0,0,1):new O(0,-1,0);if(a.addScaledVector(c,.035),e==="ledStrip"||e==="pendantLED"){let h=r[0],d=Math.max(h?.size?.[0]??.1,.008),f=Math.max(h?.size?.[2]??.025,.008),p=new Eo(16777215,0,d,f);p.name=\`DashboardSmartLight:\${e}\`,p.position.copy(a),p.rotation.x=-Math.PI/2,p.castShadow=!1,p.visible=!1;let x={...s,intensity:s.intensity/f};return p.userData.smartLightProfile=x,p.userData.selectedForIllumination=!1,n.add(p),{light:p,target:null,profile:x}}let l=new So(16777215,0,s.distance,nt.degToRad(s.outer/2),.68,2);l.name=\`DashboardSmartLight:\${e}\`,l.position.copy(a),l.castShadow=!1,l.shadow.mapSize.setScalar($E),l.shadow.bias=-45e-5,l.shadow.normalBias=.025,l.shadow.camera.near=.03,l.shadow.camera.far=s.distance,l.shadow.camera.layers.set(wr),l.userData.smartLightProfile=s,l.userData.selectedForIllumination=!1;let u=new Bt;return u.name=\`DashboardSmartLightTarget:\${e}\`,u.position.copy(a).add(c),l.target=u,n.add(l,u),{light:l,target:u,profile:s}}function od(n,e=YE){let t=[...n.values()].filter(o=>o.kind==="light"&&o.visual?.type==="light"&&o.visual.lightState?.known&&o.visual.lightState.on&&o.visual.lightState.brightness>.001).sort((o,a)=>{let c=o.visual.lightProfile.priority+o.visual.lightState.brightness;return a.visual.lightProfile.priority+a.visual.lightState.brightness-c||o.id.localeCompare(a.id)}),i=new Set(t.slice(0,e).map(o=>o.id)),s=new Set(t.map(o=>o.id)),r=new Map;for(let o of n.values()){let a=o.visual?.roomLightFill;!a||r.has(a.roomId)||(a.mesh.visible=!1,a.material.opacity=0,r.set(a.roomId,{fill:a,opacity:0,red:0,green:0,blue:0}))}for(let o of n.values()){if(o.kind!=="light"||o.visual?.type!=="light")continue;let{light:a,lightProfile:c,lightState:l}=o.visual,u=i.has(o.id);a.userData.selectedForIllumination=u,a.castShadow=u&&a.isSpotLight,a.intensity=u&&!a.isRectAreaLight?c.intensity*l.brightness**2:0;let h=o.visual.linearProjection;h&&(h.material.color.copy(a.color),h.material.opacity=u?(c.projectionOpacity??n0)*l.brightness**1.25:0,h.mesh.visible=u,h.receiverMaterial&&(h.receiverMaterial.uniforms.lightColor.value.copy(a.color),h.receiverMaterial.uniforms.intensity.value=u?(c.receiverIntensity??i0)*l.brightness**1.25:0,h.receiverGroup.visible=u));let d=o.visual.roomSpotProjection;d&&(d.material.uniforms.lightColor.value.copy(a.color),d.material.uniforms.intensity.value=u?c.intensity*c0*l.brightness**2:0,d.mesh.visible=u);let f=o.visual.roomLightFill;if(s.has(o.id)&&f){let p=r0*l.brightness**1.5,x=r.get(f.roomId);x.opacity+=p,x.red+=a.color.r*p,x.green+=a.color.g*p,x.blue+=a.color.b*p}}for(let{fill:o,opacity:a,red:c,green:l,blue:u}of r.values())a<=0||(o.material.color.setRGB(c/a,l/a,u/a),o.material.opacity=Math.min(a,o0),o.mesh.visible=!0);return i}var{DOLLHOUSE_WALL_HEIGHT:ld,buildWallPanels:ZE,collectWallOpenings:KE,joinedWallPanel:JE,resolveWallPresentation:QE,resolveWallJoinTopology:p0,roundedCornerFootprint:ad,wallFrame:ew}=f0.default,kn=Object.freeze({height:.055,overhang:.018,color:2434081}),tw=.075,wi={floor:15262682,wall:16250352,sofa:8559003,wood:11041109,darkWood:5588026,kitchen:14209736,counter:5988967,metal:9147029,rug:12101775,green:7901816,pot:10318422,hob:1975079,fridge:11449783,door:12094306,window:10405330,lampOff:14209724,lampOn:16766044,unavailable:9410201};function ss(n){return n.layers.enable(wr),n.castShadow=!0,n.userData.blocksLocalLight=!0,n}var nw={hob:{roughness:.35,metalness:.2},metal:{roughness:.6,metalness:.15},window:{roughness:.25,metalness:.08,transparent:!0,opacity:.62}};function iw(n,e={}){let t=nw[n]??{};return new An({color:wi[n]??wi.wall,roughness:e.roughness??t.roughness??.82,metalness:e.metalness??t.metalness??0,transparent:e.transparent??t.transparent??!1,opacity:e.opacity??t.opacity??1})}function Ar(n){return nt.degToRad(n)}function Lt(n,e,t){n.userData.sceneObjectId=e.id,n.userData.sceneElementType=t,n.userData.kind=e.kind??t,n.userData.binding=e.binding??null}function sw(n,e="local"){if(e!=="longestBoundary"||n.length<2)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let t={x:1,z:0},i=0;if(n.forEach((o,a)=>{let c=n[(a+1)%n.length],l={x:c.x-o.x,z:c.z-o.z},u=l.x*l.x+l.z*l.z;u>i&&(t=l,i=u)}),i<=1e-6)return{xAxis:{x:1,z:0},zAxis:{x:0,z:1}};let s=Math.sqrt(i),r={x:t.x/s,z:t.z/s};return(r.x<-1e-4||Math.abs(r.x)<=1e-4&&r.z<0)&&(r={x:-r.x,z:-r.z}),{xAxis:r,zAxis:{x:-r.z,z:r.x}}}function rw(n,e,t){let i=t.map?.userData?.portablePattern,s=t.map?.userData?.meterPeriod;if(!i||!s)return null;let r=sw(e,i.orientation),o=n.getAttribute("position"),a=new Float32Array(o.count*2);for(let c=0;c<o.count;c+=1){let l=o.getX(c),u=o.getZ(c);a[c*2]=(l*r.xAxis.x+u*r.xAxis.z)/s.x,a[c*2+1]=(l*r.zAxis.x+u*r.zAxis.z)/s.z}return n.setAttribute("uv",new en(a,2)),r}function ow(n,e,t=Si()){let i=new Tn;e.polygon.forEach((c,l)=>{l===0?i.moveTo(c.x,-c.z):i.lineTo(c.x,-c.z)}),i.closePath();let s=new ws(i);s.rotateX(-Math.PI/2);let r=l0(t.instance(e.material,{materialKey:"custom",baseColor:"#E8E3DA",roughness:.88,metallic:0,opacity:1})),o=rw(s,e.polygon,r),a=new Je(s,r);return a.position.y=e.elevation,a.userData.floorThickness=e.floorThickness,o&&(a.userData.floorPatternAlignment=o),Lt(a,e,"room"),n.add(a),a}function aw(n){let e=[...n.rooms.map(i=>i.elevation-tw/2),...n.walls.map(i=>i.baseY)].filter(Number.isFinite),t=e.length>0?Math.min(...e):0;return{...n,foundationBaseY:t,walls:n.walls.map(i=>({...i,authoredBaseY:i.baseY,baseY:t}))}}function m0(n,e,t){let i=n/2,s=e/2,r=Math.min(Math.max(t,.001),i,s),o=new Tn;return o.moveTo(-i+r,-s),o.lineTo(i-r,-s),o.quadraticCurveTo(i,-s,i,-s+r),o.lineTo(i,s-r),o.quadraticCurveTo(i,s,i-r,s),o.lineTo(-i+r,s),o.quadraticCurveTo(-i,s,-i,s-r),o.lineTo(-i,-s+r),o.quadraticCurveTo(-i,-s,-i+r,-s),o.closePath(),o}function cw(n,e){let t=Math.min(kn.height*.45,e*.22),i=new yi(m0(e,kn.height,t),{depth:n,bevelEnabled:!1,steps:1,curveSegments:5});return i.translate(0,0,-n/2),i.rotateY(Math.PI/2),i}function lw(n,e){let t={materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1},i=e.material(n.materials?.body,t),s=e.material(n.materials?.positiveSide,t),r=e.material(n.materials?.negativeSide,t);return{body:i,positive:s,negative:r,box:[i,i,i,i,s,r]}}function uw(n,e,t={doors:[],windows:[]},i,s=Si()){let r=ew(e),o=KE(t,e),a=ZE(e,o),c=i??p0(t.walls??[e]),l=new st;Lt(l,e,"wall"),l.userData.authoredBaseY=e.authoredBaseY??e.baseY,l.userData.foundationBaseY=e.baseY,l.userData.physicalHeight=e.height,l.userData.presentationHeight=Math.min(e.height,ld),l.userData.lightOccluderPanels=[];let u=lw(e,s),h=new Gt({color:kn.color}),d=new Gt({color:0,colorWrite:!1,depthWrite:!1});for(let f of a){let p=JE(f,e,c),x=QE(p,e.height);l.userData.lightOccluderPanels.push(...x.lightOccluderPanels.map(b=>({...b})));let m=Math.abs(f.minimumOffset)<=.003,g=Math.abs(f.maximumOffset-r.length)<=.003,S=m&&c.joinedEndpoints.has(\`\${e.id}:start\`),E=g&&c.joinedEndpoints.has(\`\${e.id}:end\`),v=S?0:kn.overhang,w=E?0:kn.overhang;for(let b of x.visiblePanels){let A=new Je(new Wt(b.width,b.height,e.thickness),u.box);A.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),A.rotation.y=-Math.atan2(r.direction.z,r.direction.x),A.userData.wallPart="body",A.userData.physicalWallHeight=e.height,ss(A),Lt(A,e,"wall");let _=b.width+v+w,T=new Je(cw(_,e.thickness+kn.overhang*2),h);T.position.set((w-v)/2,b.height/2+kn.height/2-Math.min(kn.height*.22,.012),0),T.userData.wallPart="cap",Lt(T,e,"wall"),A.add(T),l.add(A)}for(let b of x.lightOccluderPanels){let A=new Je(new Wt(b.width,b.height,e.thickness),d);A.name=\`PhysicalWallOccluder:\${e.id}\`,A.position.set(e.start.x+r.direction.x*b.centerOffset,e.baseY+b.centerY,e.start.z+r.direction.z*b.centerOffset),A.rotation.y=-Math.atan2(r.direction.z,r.direction.x),A.layers.set(wr),A.castShadow=!0,A.receiveShadow=!1,A.userData.wallPart="physical-light-occluder",A.userData.isPhysicalLightOccluder=!0,A.userData.excludeFromCameraFit=!0,Lt(A,e,"wall"),l.add(A)}}return n.add(l),l}function cd(n,e){let t=new Tn;n.forEach((s,r)=>{r===0?t.moveTo(s.x,-s.z):t.lineTo(s.x,-s.z)}),t.closePath();let i=new yi(t,{depth:e,bevelEnabled:!1,steps:1});return i.rotateX(-Math.PI/2),i}function hw(n,e,t=Si()){let i=[];for(let[s,r]of e.roundedCorners.entries()){let o=[r.first.wall,r.second.wall].sort((d,f)=>d.id.localeCompare(f.id))[0],a=new st;a.name=\`rounded-wall-corner-\${s}\`,a.userData.roundedWallIds=[r.first.wall.id,r.second.wall.id],a.userData.physicalHeight=r.height,a.userData.presentationHeight=Math.min(r.height,ld),Lt(a,o,"wall");let c=Math.min(r.height,ld),l=new Je(cd(ad(r),c),t.material(o.materials?.body,{materialKey:"paint",baseColor:"#F7F5F0",roughness:.94,metallic:0,opacity:1}));l.position.y=r.elevation,l.userData.wallPart="rounded-corner-body",ss(l),Lt(l,o,"wall");let u=new Je(cd(ad(r,kn.overhang),kn.height),new Gt({color:kn.color}));u.position.y=r.elevation+c-Math.min(kn.height*.22,.012),u.userData.wallPart="rounded-corner-cap",Lt(u,o,"wall"),a.add(l,u);let h=r.height-c;if(h>=.04){let d=new Je(cd(ad(r),h),new Gt({color:0,colorWrite:!1,depthWrite:!1}));d.name=\`PhysicalRoundedWallOccluder:\${s}\`,d.position.y=r.elevation+c,d.layers.set(wr),d.castShadow=!0,d.receiveShadow=!1,d.userData.wallPart="physical-rounded-light-occluder",d.userData.isPhysicalLightOccluder=!0,d.userData.excludeFromCameraFit=!0,Lt(d,o,"wall"),a.add(d)}n.add(a),i.push(a)}return i}function dw(n,e){let{width:t,depth:i,height:s}=e.size,r;e.shape==="cylinder"?(r=new _i(.5,.5,s,18),r.scale(t,1,i)):e.shape==="ellipsoid"?(r=new bi(.5,18,12),r.scale(t,s,i)):r=new Wt(t,s,i);let o=new Je(r,iw(e.appearance));return o.position.set(e.position.x,e.position.y+s/2,e.position.z),o.rotation.y=Ar(e.rotation.y),Lt(o,e,"object"),n.add(o),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:o,pickables:e.kind==="light"?[o]:[]}}function fw(n,e){let t=n.type==="box"?n.size:n.type==="sphere"?[n.radius]:n.type==="frustum"?[n.topRadius,n.bottomRadius,n.height]:[n.radius,n.height],i=\`\${n.type}:\${t.map(r=>Number(r).toFixed(6)).join(":")}\`;if(e.has(i))return e.get(i);let s;switch(n.type){case"box":s=new Wt(...n.size);break;case"sphere":s=new bi(n.radius,24,16);break;case"frustum":s=new _i(n.topRadius,n.bottomRadius,n.height,32,1,!0);break;default:s=new _i(n.radius,n.radius,n.height,24);break}return e.set(i,s),s}function pw(n,e,t=new Map){let i=e.visualType??(e.appearance==="table-lamp"?"tableLamp":"floorLamp"),s=jm(i,e.size,e.parameters);if(!s)return console.warn(\`Mikonus light visual type \${i} is not supported; skipping \${e.id}.\`),null;let r=new st;r.position.set(e.position.x,e.position.y,e.position.z),r.rotation.y=Ar(e.rotation.y),Lt(r,e,"object");let{width:o,height:a,depth:c}=e.size,l=new An({color:5984585,roughness:.62,metalness:.18}),u=new An({color:wi.lampOff,emissive:0,emissiveIntensity:0,roughness:.45}),h=new An({color:12819559,emissive:0,emissiveIntensity:0,roughness:.75,side:Tt}),d=[];for(let x of s){let m=x.role==="diffuser"?u:x.role==="shade"?h:l,g=new Je(fw(x,t),m);g.name=\`\${i}:\${x.name}\`,g.position.set(x.position[0],x.position[1]+a/2,x.position[2]),x.rotation&&g.rotation.set(...x.rotation),g.userData.recipePart=x.name,g.userData.lightRole=x.role,Lt(g,e,"object"),r.add(g),d.push(g)}let f=d0(r,i,a,s),p=[];if(e.binding){let x=new Gt({side:Tt});x.visible=!1;let m=new Je(new bi(1,12,8),x);m.position.y=a/2,m.scale.set(Math.max(o*.65,.24),Math.max(a*.5,.24),Math.max(c*.65,o*.65,.24)),m.userData.isPickProxy=!0,Lt(m,e,"object"),r.add(m),p.push(m,...d)}return n.add(r),{id:e.id,elementType:"object",kind:e.kind,binding:e.binding??null,root:r,pickables:p,visual:{type:"light",visualType:i,bulbMaterial:u,shadeMaterial:h,emissiveMaterials:[u],bodyMaterials:[l,h],light:f.light,lightTarget:f.target,lightProfile:f.profile,lightState:null}}}function mw(n,e,t,i){return e.kind==="light"?pw(n,e,i):e.assetKey?$m(n,e,t):dw(n,e)}function gw(n){let e=[],t=new Set;for(let i of n)if(i.binding){for(let s of i.pickables??[])t.has(s)||(t.add(s),e.push(s));i.root.traverse(s=>{!s.isMesh||t.has(s)||s.userData.excludeFromDevicePicking||(t.add(s),e.push(s))})}return e}function Tr(n,e,t,i,s,r,o){let a=new Je(e,t);return a.position.set(...i),a.userData.architectureRole=o,Lt(a,s,r),n.add(a),a}function Ho({parent:n,width:e,height:t,depth:i,thickness:s,material:r,description:o,elementType:a,role:c,offsetX:l=0,offsetY:u=0}){let h=new Wt(s,t,i),d=new Wt(e,s,i);return[Tr(n,h,r,[l+s/2,u+t/2,0],o,a,c),Tr(n,h,r,[l+e-s/2,u+t/2,0],o,a,c),Tr(n,d,r,[l+e/2,u+s/2,0],o,a,c),Tr(n,d,r,[l+e/2,u+t-s/2,0],o,a,c)]}function xw(n,e,t,i){let s=new yi(m0(n,e,i),{depth:t,bevelEnabled:!1,steps:1,curveSegments:5});return s.translate(0,0,-t/2),s.userData.cornerRadius=i,s}function vw(n,e,t,i=Si()){let s=new st;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=Ar(e.rotation.y),Lt(s,e,"door");let{width:r,depth:o,height:a}=e.size,c=Math.min(Math.max(Math.min(r,a)*.075,.025),.055),l=Math.max(o,.018)+.012,u=Math.max(t?.thickness??0,o,l),h=Math.min(c,.025),d=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),f={materialKey:"wood",baseColor:"#BBAA88",roughness:.86,metallic:0,opacity:1},p=i.material(e.materials?.frame,f),x=i.instance(e.materials?.panel,f),m=x.color.getHex(),g=new st;g.name="DoorReveal",g.userData.architectureRole="door-reveal",Lt(g,e,"door"),Ho({parent:g,width:r,height:a,depth:u,thickness:h,material:d,description:e,elementType:"door",role:"door-reveal"}).forEach(ss),s.add(g);let E=new st;E.name="DoorFrame",E.userData.architectureRole="door-frame",Lt(E,e,"door"),Ho({parent:E,width:r,height:a,depth:l,thickness:c,material:p,description:e,elementType:"door",role:"door-frame"}).forEach(ss),s.add(E);let w=new st;w.name="DoorLeaf",w.userData.architectureRole="door-leaf-hinge",Lt(w,e,"door");let b=Tr(w,xw(r,a,Math.max(o,.018),.008),x,[r/2,a/2,0],e,"door","door-leaf");return ss(b),s.add(w),n.add(s),{id:e.id,elementType:"door",kind:"door",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:w,panelMaterial:x,frameMaterial:p,baseColor:m,stateMaterials:[{material:b.material,baseColor:m}],closedAngle:0,openAngle:Ar(e.openAngle)}}}function _w(n,e,t,i=Si()){let s=new st;s.position.set(e.position.x,e.position.y,e.position.z),s.rotation.y=Ar(e.rotation.y),Lt(s,e,"window");let{width:r,depth:o,height:a}=e.size,c=Math.min(Math.max(Math.min(r,a)*.075,.025),.055),l=Math.max(o,.014)+.012,u=Math.max(t?.thickness??0,o,l),h=Math.min(c,.025),d=i.material(e.materials?.reveal,{materialKey:"paint",baseColor:"#F4F2ED",roughness:.94,metallic:0,opacity:1}),f=i.material(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),p=i.instance(e.materials?.frame,{materialKey:"metal",baseColor:"#8B8F8F",roughness:.74,metallic:0,opacity:1}),x=i.instance(e.materials?.panel,{materialKey:"glass",baseColor:"#B8CCD1",roughness:.36,metallic:0,opacity:.3},{physical:!0,transmission:.22,depthWrite:!1,side:Tt});Object.assign(x,{depthWrite:!1,side:Tt});let m=x.color.getHex(),g=p.color.getHex(),S=new st;S.name="WindowReveal",S.userData.architectureRole="window-reveal",Lt(S,e,"window"),Ho({parent:S,width:r,height:a,depth:u,thickness:h,material:d,description:e,elementType:"window",role:"window-reveal"}).forEach(ss),s.add(S);let v=new st;v.name="WindowFrame",v.userData.architectureRole="window-frame",Lt(v,e,"window"),Ho({parent:v,width:r,height:a,depth:l,thickness:c,material:f,description:e,elementType:"window",role:"window-frame"}).forEach(ss),s.add(v);let b=new st;b.name="WindowSash",b.userData.architectureRole="window-sash",Lt(b,e,"window");let A=c,_=Math.max(r-A*2,c),T=Math.max(a-A*2,c),I=Math.min(Math.max(c*.58,.014),.028),P=Math.max(o,.014)+.006,D=Ho({parent:b,width:_,height:T,depth:P,thickness:I,material:p,description:e,elementType:"window",role:"window-sash-frame",offsetX:A,offsetY:A});D.forEach(ss);let H=Math.max(_-I*2,.01),F=Math.max(T-I*2,.01),L=Tr(b,new Wt(H,F,Math.min(Math.max(o,.008),.022)),x,[r/2,a/2,0],e,"window","window-glass");return L.renderOrder=1,s.add(b),n.add(s),{id:e.id,elementType:"window",kind:"window",binding:e.binding??null,root:s,pickables:[],visual:{type:"contact",motionRoot:b,panelMaterial:x,frameMaterial:f,baseColor:m,stateMaterials:[{material:x,baseColor:m},...D.map($=>({material:$.material,baseColor:g}))],closedAngle:0,openAngle:Ar(e.openAngle),size:{width:r,height:a,depth:o},glass:L}}}function g0(n){let e=n.floors.find(i=>i.id===n.activeFloorId);if(!e)throw new Error(\`Active floor \${n.activeFloorId} does not exist.\`);let t=new so;try{let i=new st;i.userData.sceneId=n.sceneId,i.userData.activeFloorId=e.id,t.add(i);let s=Si();e.rooms.forEach(S=>ow(i,S,s));let r=aw(e);i.userData.foundationBaseY=r.foundationBaseY;let o=p0(r.walls);r.walls.forEach(S=>uw(i,S,r,o,s)),hw(i,o,s);let a=Qh(),c=new Map,l=[...e.objects.map(S=>mw(i,S,a,c)),...e.doors.map(S=>vw(i,S,r.walls.find(E=>E.id===S.wallId),s)),...e.windows.map(S=>_w(i,S,r.walls.find(E=>E.id===S.wallId),s))].filter(Boolean),u=new Map(l.map(S=>[S.id,S])),h=l.flatMap(S=>S.pickables),d=gw(l),f=Zm(i,e,u),p=a0(i,e,u),x=s0(i,e,u),m=u0(i,e,u),g=t0(t,i);return g.contactShadows=f,g.roomLightFills=p,g.linearLightProjections=x,g.roomSpotProjections=m,{scene:t,sceneRoot:i,activeFloor:e,entities:u,lighting:g,pickables:h,devicePickables:d}}catch(i){throw Pl(t),i}}function Pl(n){if(!n)return;let e=new Set,t=new Set,i=new Set,s=new Set;n.traverse(r=>{r.shadow?.map&&s.add(r.shadow.map),r.shadow?.mapPass&&s.add(r.shadow.mapPass),r.geometry&&e.add(r.geometry),(Array.isArray(r.material)?r.material:[r.material]).filter(Boolean).forEach(a=>{t.add(a),Object.values(a).forEach(c=>{c?.isTexture&&i.add(c)})})}),i.forEach(r=>r.dispose()),s.forEach(r=>r.dispose()),e.forEach(r=>r.dispose()),t.forEach(r=>r.dispose()),n.clear()}var yw=new Set(["room","wall","door","window"]),Fs=1.1,x0=.02,Us=34,bw=.55,Mw=2.5,Go=new O(0,1,0);function v0(n,e){let t=n.geometry?.getAttribute("position");if(!t)return;let i=new O;for(let s=0;s<t.count;s+=1)i.fromBufferAttribute(t,s).applyMatrix4(n.matrixWorld),e.push(i.clone())}function Sw(n,e){n.updateWorldMatrix(!0,!0),n.traverse(t=>{t.isMesh&&v0(t,e)})}function Wo(n,e=new Map){let t=[];n.updateWorldMatrix(!0,!0),n.traverse(i=>{i.isMesh&&!i.userData.excludeFromCameraFit&&yw.has(i.userData.sceneElementType)&&v0(i,t)});for(let i of e.values()){if(i.visual?.type!=="contact")continue;let s=i.visual.motionRoot??i.root,r=s.rotation.y;for(let o of[i.visual.closedAngle,i.visual.closedAngle+i.visual.openAngle])s.rotation.y=o,Sw(i.root,t);s.rotation.y=r,i.root.updateWorldMatrix(!0,!0)}return n.updateWorldMatrix(!0,!0),t}function ud(n){if(!n.length)return null;let e=new Ht().setFromPoints(n);if(e.isEmpty())return null;let t=e.getSize(new O);return new O((e.min.x+e.max.x)/2,e.min.y+t.y*.25,(e.min.z+e.max.z)/2)}function hd(n){let e=n.clone().normalize(),t=new As;return t.position.copy(e),t.up.copy(Go),t.lookAt(0,0,0),t.quaternion.clone()}function dd(n,e,t){if(!n.length)return null;let i=t.clone().invert(),s=new O,r={minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0,minZ:1/0,maxZ:-1/0};for(let o of n)s.copy(o).sub(e).applyQuaternion(i),r.minX=Math.min(r.minX,s.x),r.maxX=Math.max(r.maxX,s.x),r.minY=Math.min(r.minY,s.y),r.maxY=Math.max(r.maxY,s.y),r.minZ=Math.min(r.minZ,s.z),r.maxZ=Math.max(r.maxZ,s.z);return{...r,width:Math.max(r.maxX-r.minX,.001),height:Math.max(r.maxY-r.minY,.001),centerX:(r.minX+r.maxX)/2,centerY:(r.minY+r.maxY)/2}}function Vo(n,e){if(!e.length)return null;n.updateMatrixWorld(!0),n.updateProjectionMatrix();let t=new O,i={minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0};for(let s of e)t.copy(s).project(n),i.minX=Math.min(i.minX,t.x),i.maxX=Math.max(i.maxX,t.x),i.minY=Math.min(i.minY,t.y),i.maxY=Math.max(i.maxY,t.y);return{...i,width:i.maxX-i.minX,height:i.maxY-i.minY,centerX:(i.minX+i.maxX)/2,centerY:(i.minY+i.maxY)/2,maximumAbsolute:Math.max(Math.abs(i.minX),Math.abs(i.maxX),Math.abs(i.minY),Math.abs(i.maxY))}}function fd(n,e,t,i,s=Us,r=Fs,o=n){let a=Math.max(i,.05),c=nt.clamp(s,1,120),l=Math.tan(nt.degToRad(c)/2),u=l*a,h=t.clone().invert(),d=n.map(v=>v.clone().sub(e).applyQuaternion(h)),f=o.map(v=>v.clone().sub(e).applyQuaternion(h)),p=Ew(n,e,t,a,c,r),x=Math.max(...d.map(v=>v.z+.1),.1),m=p.distance,g=1/r,S=(v,w)=>{let b=1/0,A=-1/0,_=1/0,T=-1/0;for(let I of v){let P=w-I.z,D=I.x/(P*u),H=I.y/(P*l);b=Math.min(b,D),A=Math.max(A,D),_=Math.min(_,H),T=Math.max(T,H)}return{minX:b,maxX:A,minY:_,maxY:T}},E=v=>{let w=S(f,v),b=(w.minX+w.maxX)/2,A=(w.minY+w.maxY)/2,_=S(d,v);return Math.max(Math.abs(_.minX-b),Math.abs(_.maxX-b),Math.abs(_.minY-A),Math.abs(_.maxY-A))};for(;E(m)>g;)m*=1.5;for(let v=0;v<48;v+=1){let w=(x+m)/2;E(w)>g?x=w:m=w}return{distance:m,fovDegrees:c}}function rs(n,e){if(!n?.isPerspectiveCamera||!e.length)return null;n.view?.enabled?n.clearViewOffset():n.updateProjectionMatrix();let t=Vo(n,e),i=2,s=i*n.aspect;return n.setViewOffset(s,i,t.centerX*n.aspect,-t.centerY,s,i),n.updateProjectionMatrix(),{ndcBounds:Vo(n,e),rawBounds:t}}function Ew(n,e,t,i,s=Us,r=Fs){let o=Math.max(i,.05),a=nt.clamp(s,1,120),c=Math.tan(nt.degToRad(a)/2),l=c*o,u=t.clone().invert(),h=new O,d=0,f=-1/0;for(let p of n)h.copy(p).sub(e).applyQuaternion(u),f=Math.max(f,h.z),d=Math.max(d,h.z+Math.abs(h.x)*r/l,h.z+Math.abs(h.y)*r/c);return{distance:Math.max(d,f+.1,.1),fovDegrees:a}}function _0(n,e,t=Fs){let i=Math.max(e,.05);return Math.max(n.height,n.width/i,.1)*t}function ww(n,e,t,i,{padding:s=Fs,minimumImprovement:r=x0}={}){let a=[t.clone().normalize(),t.clone().applyAxisAngle(Go,Math.PI/2).normalize()].map((c,l)=>{let u=hd(c),h=dd(n,e,u);return{bounds:h,direction:c,orientationDegrees:l*90,quaternion:u,viewHeight:_0(h,i,s)}});return a[1].viewHeight<a[0].viewHeight*(1-r)?a[1]:a[0]}function Tw(n,e,t,i,{allowQuarterTurn:s=!0,centeringPoints:r=n,fovDegrees:o=Us,padding:a=Fs,minimumImprovement:c=x0}={}){let l=[t.clone().normalize()];s&&l.push(t.clone().applyAxisAngle(Go,Math.PI/2).normalize());let u=l.map((h,d)=>{let f=hd(h);return{...fd(n,e,f,i,o,a,r),direction:h,orientationDegrees:d*90,quaternion:f}});return u[1]?.distance<u[0].distance*(1-c)?u[1]:u[0]}function pd(n,e,t,i=Fs,s=ud(e)){if(!s||!e.length)return null;if(n.isPerspectiveCamera){let l=n.position.clone().sub(s).normalize(),u=hd(l),h=fd(e,s,u,t,n.fov,i);n.aspect=Math.max(t,.05),n.position.copy(s).addScaledVector(l,h.distance),n.lookAt(s),n.updateMatrixWorld(!0),n.updateProjectionMatrix();let d=rs(n,e);return{...h,ndcBounds:d.ndcBounds,target:s}}n.updateMatrixWorld(!0);let r=dd(e,s,n.quaternion),o=Math.max(t,.05),a=_0(r,o,i),c=a*o;return n.left=r.centerX-c/2,n.right=r.centerX+c/2,n.top=r.centerY+a/2,n.bottom=r.centerY-a/2,n.zoom=1,n.updateProjectionMatrix(),{bounds:r,target:s,viewHeight:a,viewWidth:c}}function Aw(n,e,t,i){let s=0;for(let o of i)s=Math.max(s,o.distanceTo(e));s=Math.max(s,1);let r=Math.max(6,s*2.4+1);return n.position.copy(e).addScaledVector(t.clone().normalize(),r),n.up.copy(Go),n.lookAt(e),n.near=Math.max(.05,r-s-.75),n.far=r+s+.75,n.updateMatrixWorld(!0),n.updateProjectionMatrix(),{distance:r,radius:s}}function y0(n,e,t,i,s,r={}){let o=ud(e);if(!o)return null;let a=ww(e,o,s,i,r),c=Aw(n,o,a.direction,[...t,...e]);return{...pd(n,e,i,r.padding??Fs,o),...a,...c,target:o}}function Cw(n,e){let t=0;for(let i of n)t=Math.max(t,i.distanceTo(e));return Math.max(t,1)}function md(n,e,t){let i=n.position.distanceTo(e),s=Math.max(.25,t*.08);return n.near=Math.max(.03,i-t-s),n.far=Math.max(n.near+1,i+t+s),n.updateProjectionMatrix(),{distance:i,far:n.far,near:n.near,radius:t}}function b0(n,e,t,i,s,r={}){let o=r.centeringPoints?.length?r.centeringPoints:e,a=r.targetPoints?.length?r.targetPoints:o,c=ud(a);if(!c)return null;let l=r.fovDegrees??Us,u=Tw(e,c,s,i,{...r,centeringPoints:o,fovDegrees:l});n.aspect=Math.max(i,.05),n.fov=l,n.zoom=1,n.position.copy(c).addScaledVector(u.direction,u.distance),n.up.copy(Go),n.lookAt(c),n.updateMatrixWorld(!0);let h=Cw([...t,...e],c),d=Math.max(u.distance*bw,h*1.05),f=Math.max(u.distance*Mw,d*1.1),p=md(n,c,h),x=rs(n,o);return{...u,...p,maxDistance:f,minDistance:d,centeringBounds:x.ndcBounds,ndcBounds:Vo(n,e),target:c}}function Rw(n,e=1,t=.001){return n.minX>=-e-t&&n.maxX<=e+t&&n.minY>=-e-t&&n.maxY<=e+t}function M0(n,e,{worldPoints:t=[],centeringPoints:i=t,target:s=null,clippingPadding:r=1.02}={}){let o=i.length?rs(n,i):null,a=t.length?Vo(n,t):null,c=a?Rw(a):!1,l=s?n.position.distanceTo(s):0,u=Math.max(e,.05),h=l,d=!1;if(n.aspect=u,c&&s){let p=fd(t,s,n.quaternion,u,n.fov,r,i);if(p.distance>l){let x=n.position.clone().sub(s).normalize();n.position.copy(s).addScaledVector(x,p.distance),n.lookAt(s),n.updateMatrixWorld(!0),h=p.distance,d=!0}}n.updateProjectionMatrix();let f=i.length?rs(n,i):null;return{distance:h,expandedForClipping:d,centeringBounds:f?.ndcBounds??null,ndcBounds:t.length?Vo(n,t):null,previousBounds:a}}function Iw(n){let e=(n.left+n.right)/2,t=(n.top+n.bottom)/2,i=(n.right-n.left)/(2*n.zoom),s=(n.top-n.bottom)/(2*n.zoom);return{left:e-i,right:e+i,top:t+s,bottom:t-s,centerX:e,centerY:t}}function Pw(n,e,t=.001){return e.minX>=n.left-t&&e.maxX<=n.right+t&&e.minY>=n.bottom-t&&e.maxY<=n.top+t}function S0(n,e,{worldPoints:t=[],target:i=null,clippingPadding:s=1.02}={}){let r=(n.left+n.right)/2,o=(n.top+n.bottom)/2,a=Math.max(e,.05),c=Math.max(n.top-n.bottom,.1),l=null,u=!1;if(t.length&&i&&(l=dd(t,i,n.quaternion),Pw(Iw(n),l))){let f=Math.max(Math.abs(l.minY-o)*2,Math.abs(l.maxY-o)*2,Math.abs(l.minX-r)*2/a,Math.abs(l.maxX-r)*2/a)*s,p=c/n.zoom;f>p&&(c=f*n.zoom,u=!0)}let h=c*a;return n.left=r-h/2,n.right=r+h/2,n.top=o+c/2,n.bottom=o-c/2,n.updateProjectionMatrix(),{expandedForClipping:u,projected:l,viewHeight:c,viewWidth:h}}function Dw(n){return 1-(1-n)**3}var Dl=class{constructor({camera:e,controls:t,requestRender:i,updateClipping:s=()=>{},onComplete:r=()=>{},isBlocked:o=()=>!1,delayMs:a=0,durationMs:c=700,setTimeoutFn:l=(f,p)=>window.setTimeout(f,p),clearTimeoutFn:u=f=>window.clearTimeout(f),requestAnimationFrameFn:h=f=>window.requestAnimationFrame(f),cancelAnimationFrameFn:d=f=>window.cancelAnimationFrame(f)}){this.camera=e,this.controls=t,this.requestRender=i,this.updateClipping=s,this.onComplete=r,this.isBlocked=o,this.delayMs=a,this.durationMs=c,this.setTimeoutFn=l,this.clearTimeoutFn=u,this.requestAnimationFrameFn=h,this.cancelAnimationFrameFn=d,this.homeView=null,this.timeoutId=null,this.animationFrameId=null}setHomeView({position:e,target:t}){this.homeView={position:e.clone(),target:t.clone()}}cancelTimer(){this.timeoutId!==null&&(this.clearTimeoutFn(this.timeoutId),this.timeoutId=null)}cancelAnimation(){this.animationFrameId!==null&&(this.cancelAnimationFrameFn(this.animationFrameId),this.animationFrameId=null)}cancel(){this.cancelTimer(),this.cancelAnimation()}schedule(){return this.cancelTimer(),this.delayMs<=0||!this.homeView||this.isBlocked()?!1:(this.timeoutId=this.setTimeoutFn(()=>{this.timeoutId=null,this.start()},this.delayMs),!0)}start(){if(this.cancelAnimation(),!this.homeView||this.isBlocked())return!1;let e=this.camera.position.clone(),t=this.controls.target.clone(),i=this.homeView.position,s=this.homeView.target;if(e.distanceToSquared(i)<1e-12&&t.distanceToSquared(s)<1e-12)return this.onComplete(),!1;let r=null,o=a=>{if(this.isBlocked()){this.animationFrameId=null;return}r??=a;let c=Math.min(Math.max((a-r)/this.durationMs,0),1),l=Dw(c);if(this.camera.position.lerpVectors(e,i,l),this.controls.target.lerpVectors(t,s,l),this.camera.lookAt(this.controls.target),this.updateClipping(),this.requestRender(),c<1){this.animationFrameId=this.requestAnimationFrameFn(o);return}this.animationFrameId=null,this.controls.update(),this.onComplete()};return this.animationFrameId=this.requestAnimationFrameFn(o),!0}dispose(){this.cancel(),this.homeView=null}};function E0(n){return Array.isArray(n?.floors)?n.floors.map(e=>e.id):[]}function w0(n,e){let t=new Set(E0(n));return typeof e=="string"&&t.has(e)?e:typeof n?.defaultFloorId=="string"&&t.has(n.defaultFloorId)?n.defaultFloorId:E0(n)[0]??null}function T0(n,e,t){let i=n?.sceneId===e?t:null;return w0(n,i)}function Ol(n,e){return\`mikonus.active-floor:\${typeof e=="string"&&e?e:"default"}:\${n}\`}var Ll=class{constructor({description:e,initialFloorId:t,createRuntime:i,disposeRuntime:s,maxCachedRuntimes:r=3}){if(!e||!Array.isArray(e.floors)||e.floors.length===0)throw new TypeError("DashboardFloorController requires at least one floor.");if(typeof i!="function"||typeof s!="function")throw new TypeError("DashboardFloorController requires runtime lifecycle callbacks.");if(!Number.isInteger(r)||r<1)throw new TypeError("maxCachedRuntimes must be a positive integer.");this.description=e,this.floorsById=new Map(e.floors.map(o=>[o.id,o])),this.createRuntime=i,this.disposeRuntime=s,this.maxCachedRuntimes=r,this.runtimes=new Map,this.activeFloorId=w0(e,t),this.activeRuntime=null}activate(e=this.activeFloorId){if(!this.floorsById.has(e))throw new RangeError(\`Floor \${String(e)} does not exist in the dashboard scene.\`);let t=this.runtimes.get(e),i=!t;if(t?this.runtimes.delete(e):t=this.createRuntime(e),!t)throw new Error(\`Floor runtime \${e} could not be created.\`);this.runtimes.set(e,t),this.activeFloorId=e,this.activeRuntime=t;let s=[];for(;this.runtimes.size>this.maxCachedRuntimes;){let r=this.runtimes.keys().next().value;if(r===this.activeFloorId)break;let o=this.runtimes.get(r);this.runtimes.delete(r),this.disposeRuntime(o),s.push(r)}return{created:i,evictedFloorIds:s,floorId:e,runtime:t}}get cachedFloorIds(){return[...this.runtimes.keys()]}get cachedRuntimes(){return[...this.runtimes.values()]}dispose(){for(let e of this.runtimes.values())this.disposeRuntime(e);this.runtimes.clear(),this.activeRuntime=null}};function Lw(n,e,t){if(!Array.isArray(n)||n.length<=1)return"hidden";if(n.length>4)return"compact";let i=n.map(r=>Math.ceil(t(String(r.name??""))));return i.some(r=>r>112)?"compact":i.reduce((r,o)=>r+o+28,Math.max(n.length-1,0)*3)<=Math.max(Number(e)||0,0)?"segmented":"compact"}function Ow(n){let t=n.ownerDocument.createElement("canvas").getContext("2d");return i=>{if(!t)return String(i).length*8;let s=getComputedStyle(n);return t.font=s.font||\`\${s.fontWeight} \${s.fontSize} \${s.fontFamily}\`,t.measureText(String(i)).width}}var Nl=class{constructor({host:e,onSelect:t,translate:i=(s,r)=>r}){if(!e||typeof t!="function")throw new TypeError("DashboardFloorSelector requires a host and selection callback.");this.host=e,this.hadHostClass=e.classList.contains("floor-selector"),e.classList.add("floor-selector"),this.onSelect=t,this.floors=[],this.activeFloorId=null,this.availableWidth=0,this.measureText=Ow(e),this.translate=i,this.segments=e.ownerDocument.createElement("div"),this.segments.className="floor-selector-segments",this.segments.setAttribute("role","tablist"),this.segments.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.compact=e.ownerDocument.createElement("span"),this.compact.className="floor-selector-compact",this.select=e.ownerDocument.createElement("select"),this.select.className="floor-selector-select",this.select.setAttribute("aria-label",this.translate("floorSelector.label","Select floor")),this.chevron=e.ownerDocument.createElement("span"),this.chevron.className="floor-selector-chevron",this.chevron.setAttribute("aria-hidden","true"),this.chevron.textContent="\\u2304",this.compact.append(this.select,this.chevron),e.append(this.segments,this.compact),this.onCompactChange=()=>this.requestSelection(this.select.value),this.select.addEventListener("change",this.onCompactChange)}update({floors:e,activeFloorId:t,availableWidth:i}){this.floors=Array.isArray(e)?e:[],this.activeFloorId=t,this.availableWidth=Math.max(Number(i)||0,0),this.render()}layout(e){let t=Math.max(Number(e)||0,0);Math.abs(t-this.availableWidth)<1||(this.availableWidth=t,this.render())}requestSelection(e){!e||e===this.activeFloorId||this.onSelect(e)}render(){let e=Lw(this.floors,this.availableWidth,this.measureText);if(this.host.hidden=e==="hidden",this.segments.hidden=e!=="segmented",this.compact.hidden=e!=="compact",this.host.dataset.mode=e,e==="hidden"){this.segments.replaceChildren(),this.select.replaceChildren();return}this.select.replaceChildren(...this.floors.map(i=>{let s=this.host.ownerDocument.createElement("option");return s.value=i.id,s.textContent=i.name,s})),this.select.value=this.activeFloorId;let t=this.floors.find(i=>i.id===this.activeFloorId);if(this.select.title=t?.name??"",e==="compact"){this.segments.replaceChildren();let i=this.measureText(t?.name??"")+56;this.compact.style.width=\`\${Math.min(this.availableWidth,Math.max(116,i))}px\`;return}this.segments.replaceChildren(...this.floors.map((i,s)=>{let r=this.host.ownerDocument.createElement("button"),o=i.id===this.activeFloorId;return r.type="button",r.className="floor-selector-segment",r.textContent=i.name,r.title=i.name,r.dataset.floorId=i.id,r.setAttribute("role","tab"),r.setAttribute("aria-selected",String(o)),r.tabIndex=o?0:-1,r.addEventListener("click",()=>this.requestSelection(i.id)),r.addEventListener("keydown",a=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(a.key))return;a.preventDefault();let l=s;a.key==="Home"?l=0:a.key==="End"?l=this.floors.length-1:a.key==="ArrowLeft"||a.key==="ArrowUp"?l=(s-1+this.floors.length)%this.floors.length:l=(s+1)%this.floors.length,[...this.segments.children].find(h=>h.dataset.floorId===this.floors[l].id)?.focus(),this.requestSelection(this.floors[l].id)}),r}))}dispose(){this.hadHostClass||this.host.classList.remove("floor-selector"),this.select.removeEventListener("change",this.onCompactChange),this.host.replaceChildren()}};var O0=zn(os()),{DEVICE_COMMAND:Ti,hasCleaningState:Vw,hasClimateState:Gw,hasCoverState:Ww,hasPowerState:Xw,isUsableCleaningState:qw,isUsableClimateState:Yw,isUsableCoverState:$w,isUsablePowerState:D0}=O0.default;function L0(n,e,t){return e<=t*2?e/2:Math.min(Math.max(n,t),e-t)}function jw({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:o=4}){let a=Math.max(s/2+o,0),c=Math.max(r/2+o,0);return{left:L0(n,Math.max(t,0),a),top:L0(e,Math.max(i,0),c)}}function N0(n,e,t){return{left:n.left-e/2,right:n.left+e/2,top:n.top-t/2,bottom:n.top+t/2}}function Zw(n,e,t){return e.reduce((i,s)=>{let r=Math.max(0,Math.min(n.right,s.right+t)-Math.max(n.left,s.left-t)),o=Math.max(0,Math.min(n.bottom,s.bottom+t)-Math.max(n.top,s.top-t));return i+r*o},0)}function Kw(n,e,t){let i=Math.max(52,n*.58+t),s=Math.max(52,e+t),r=[{x:0,y:0}];for(let o=1;o<=3;o+=1){let a=i*o,c=s*o;r.push({x:0,y:-c},{x:0,y:c},{x:-a,y:0},{x:a,y:0},{x:-a,y:-c},{x:a,y:-c},{x:-a,y:c},{x:a,y:c})}return r}function gd({left:n,top:e,width:t,height:i,controlWidth:s=44,controlHeight:r=44,edgePadding:o=4,collisionGap:a=8,obstacles:c=[]}){let l=null,u=new Set;for(let h of Kw(s,r,a)){let d=jw({left:n+h.x,top:e+h.y,width:t,height:i,controlWidth:s,controlHeight:r,edgePadding:o}),f=\`\${d.left.toFixed(3)}:\${d.top.toFixed(3)}\`;if(u.has(f))continue;u.add(f);let p=N0(d,s,r),x=Zw(p,c,a),m=Math.hypot(d.left-n,d.top-e),g={position:d,rectangle:p,score:x,displacement:m};if(x===0)return g;(!l||x<l.score||x===l.score&&m<l.displacement)&&(l=g)}return l}function Jw(n){return!!(n?.controls?.openCover||n?.controls?.closeCover||n?.controls?.stopCover||n?.controls?.setCoverPosition)}function Qw(n){return Ww(n)&&Jw(n)?"cover":Gw(n)&&n?.controls?.setTargetTemperature?"climate":Vw(n)&&[n?.controls?.startCleaning,n?.controls?.pauseCleaning,n?.controls?.stopCleaning,n?.controls?.returnToBase].some(Boolean)?"vacuum":Xw(n)&&n?.controls?.setPower!==!1?"power":null}function F0(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function eT(n,e){let t=n?.controls?.setTargetTemperature,i=n?.climate?.targetTemperature;if(!t||!Number.isFinite(i)||![-1,1].includes(e))return null;let s=Number.isFinite(t.min)?t.min:4,r=Number.isFinite(t.max)?t.max:35,o=Number.isFinite(t.step)&&t.step>0?t.step:.5,a=Math.min(Math.max(i+e*o,s),r);return Number(a.toFixed(F0(o)))}function Fl(n){n.preventDefault(),n.stopPropagation()}var Xo=class{constructor({host:e,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.records=new Map,this.busyDeviceIds=new Set,this.bounds=new Ht,this.anchor=new O,this.projected=new O,this.objectCenter=new O,this.objectProjected=new O,this.size=new O,this.layer=document.createElement("div"),this.layer.className="quick-controls-layer",this.layer.setAttribute("aria-label",this.translate("quickControls.label","Quick controls")),this.layer.hidden=!0,e.appendChild(this.layer)}prepareElement(e){for(let t of["pointerdown","pointerup","pointercancel"])e.addEventListener(t,Fl);return e}createPowerRecord(e,t){let i=this.prepareElement(document.createElement("button"));return i.type="button",i.className="quick-control-chip",i.dataset.sceneObjectId=e,i.innerHTML='<span aria-hidden="true">&#x23FB;</span>',i.addEventListener("click",s=>{Fl(s);let r=this.records.get(e)?.state;D0(r)&&this.onCommand(e,{type:Ti.SET_POWER,value:!r.power.isOn})}),{type:"power",element:i,entity:t,deviceId:null,state:null}}createCoverButton(e,t,i,s,r){let o=this.prepareElement(document.createElement("button"));o.type="button",o.className="quick-control-action",o.innerHTML=\`<span aria-hidden="true">\${s}</span>\`;let a=this.translate(t,i);return o.setAttribute("aria-label",a),o.title=a,o.addEventListener("click",c=>{Fl(c),this.onCommand(e,{type:r})}),o}createCoverRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-cover",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.cover.open","Open cover","&#x2191;",Ti.OPEN_COVER),r=this.createCoverButton(e,"quickControls.cover.stop","Stop cover","&#x25A0;",Ti.STOP_COVER),o=this.createCoverButton(e,"quickControls.cover.close","Close cover","&#x2193;",Ti.CLOSE_COVER),a=document.createElement("span");return a.className="quick-control-value",a.setAttribute("aria-hidden","true"),i.append(s,r,o,a),{type:"cover",element:i,openButton:s,stopButton:r,closeButton:o,value:a,entity:t,deviceId:null,state:null}}createClimateButton(e,t,i,s,r){let o=this.prepareElement(document.createElement("button"));return o.type="button",o.className="quick-control-action",o.innerHTML=\`<span aria-hidden="true">\${r}</span>\`,o.dataset.labelKey=i,o.dataset.labelFallback=s,o.addEventListener("click",a=>{Fl(a);let c=this.records.get(e)?.state,l=eT(c,t);l!==null&&this.onCommand(e,{type:Ti.SET_TARGET_TEMPERATURE,value:l})}),o}createClimateRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-climate",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createClimateButton(e,-1,"quickControls.climate.decrease","Decrease target temperature","&#x2212;"),r=document.createElement("span");r.className="quick-control-temperature",r.setAttribute("aria-hidden","true");let o=this.createClimateButton(e,1,"quickControls.climate.increase","Increase target temperature","&#x2B;");return i.append(s,r,o),{type:"climate",element:i,decreaseButton:s,increaseButton:o,value:r,entity:t,deviceId:null,state:null}}createVacuumRecord(e,t){let i=this.prepareElement(document.createElement("div"));i.className="quick-control-chip quick-control-vacuum",i.dataset.sceneObjectId=e,i.setAttribute("role","group");let s=this.createCoverButton(e,"quickControls.vacuum.start","Start cleaning","&#x25B6;",Ti.START_CLEANING),r=this.createCoverButton(e,"quickControls.vacuum.pause","Pause cleaning","&#x2016;",Ti.PAUSE_CLEANING),o=this.createCoverButton(e,"quickControls.vacuum.stop","Stop cleaning","&#x25A0;",Ti.STOP_CLEANING),a=this.createCoverButton(e,"quickControls.vacuum.return","Return to base","&#x2302;",Ti.RETURN_TO_BASE);return i.append(s,r,o,a),{type:"vacuum",element:i,startButton:s,pauseButton:r,stopButton:o,returnButton:a,entity:t,deviceId:null,state:null}}createRecord(e,t,i){let s=i==="cover"?this.createCoverRecord(e,t):i==="climate"?this.createClimateRecord(e,t):i==="vacuum"?this.createVacuumRecord(e,t):this.createPowerRecord(e,t);return this.layer.appendChild(s.element),this.records.set(e,s),s}updatePowerRecord(e,t,i){let s=t.power?.isOn===!0,r=D0(t);e.element.classList.toggle("is-on",s),e.element.classList.toggle("is-unavailable",!r),e.element.classList.toggle("is-busy",i),e.element.disabled=!r||i,e.element.setAttribute("aria-pressed",String(s));let o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),a=s?this.translate("quickControls.power.turnOff","Turn off"):this.translate("quickControls.power.turnOn","Turn on");e.element.setAttribute("aria-label",\`\${o}: \${a}\`),e.element.title=a}updateCoverRecord(e,t,i){let s=$w(t),r=t.controls??{},o=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),a=typeof t.cover?.position=="number"?Math.round(t.cover.position*100):null;e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${o}: \${this.translate("quickControls.cover.label","Cover")}\`),e.value.textContent=a===null?"\\u2013":\`\${a}%\`,e.openButton.disabled=!s||i||!r.openCover,e.stopButton.disabled=!s||i||!r.stopCover,e.closeButton.disabled=!s||i||!r.closeCover}updateClimateRecord(e,t,i){let s=t.controls?.setTargetTemperature,r=t.climate?.targetTemperature,o=Yw(t)&&s&&Number.isFinite(r),a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device"),c=t.climate?.unit??s?.unit??"\\xB0C",l=F0(s?.step??.5);e.element.classList.toggle("is-unavailable",!o),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${a}: \${this.translate("quickControls.climate.label","Climate")}\`),e.value.textContent=Number.isFinite(r)?\`\${r.toFixed(l)} \${c}\`:"\\u2013";let u=this.translate(e.decreaseButton.dataset.labelKey,e.decreaseButton.dataset.labelFallback),h=this.translate(e.increaseButton.dataset.labelKey,e.increaseButton.dataset.labelFallback);e.decreaseButton.setAttribute("aria-label",\`\${a}: \${u}\`),e.increaseButton.setAttribute("aria-label",\`\${a}: \${h}\`),e.decreaseButton.title=u,e.increaseButton.title=h,e.decreaseButton.disabled=!o||i||r<=s.min,e.increaseButton.disabled=!o||i||r>=s.max}updateVacuumRecord(e,t,i){let s=qw(t),r=t.controls??{},o=t.cleaning?.state??"unknown",a=typeof t.name=="string"&&t.name.trim()?t.name.trim():this.translate("quickControls.device","Device");e.element.classList.toggle("is-unavailable",!s),e.element.classList.toggle("is-busy",i),e.element.setAttribute("aria-label",\`\${a}: \${this.translate("quickControls.vacuum.label","Robot vacuum")}\`),e.startButton.disabled=!s||i||!r.startCleaning||o==="cleaning",e.pauseButton.disabled=!s||i||!r.pauseCleaning||o!=="cleaning",e.stopButton.disabled=!s||i||!r.stopCleaning||["idle","docked"].includes(o),e.returnButton.disabled=!s||i||!r.returnToBase||["docked","returning"].includes(o)}updateRecord(e,t){e.state=t;let i=this.busyDeviceIds.has(e.deviceId);e.type==="cover"?this.updateCoverRecord(e,t,i):e.type==="climate"?this.updateClimateRecord(e,t,i):e.type==="vacuum"?this.updateVacuumRecord(e,t,i):this.updatePowerRecord(e,t,i)}sync({enabled:e,entities:t,bindings:i,statesByDeviceId:s}){if(this.layer.hidden=!e,!e){this.clear();return}let r=new Set;for(let o of t.values()){let a=i.get(o.id),c=s.get(a?.deviceId),l=Qw(c);if(!a?.deviceId||!l)continue;r.add(o.id);let u=this.records.get(o.id);u&&u.type!==l&&(u.element.remove(),this.records.delete(o.id),u=null),u??=this.createRecord(o.id,o,l),u.entity=o,u.deviceId=a.deviceId,this.updateRecord(u,c)}for(let[o,a]of this.records)r.has(o)||(a.element.remove(),this.records.delete(o))}setDeviceBusy(e,t){t?this.busyDeviceIds.add(e):this.busyDeviceIds.delete(e);for(let i of this.records.values())i.deviceId!==e||!i.state||this.updateRecord(i,i.state)}layout(e,t){if(this.layer.hidden)return[];let i=Math.max(t.clientWidth,1),s=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let r=[];for(let[l,u]of this.records){let h=u.entity.controlAnchor;h?(h.updateWorldMatrix(!0,!1),h.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):(u.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(u.entity.root)),!h&&this.bounds.isEmpty()?(u.entity.root.getWorldPosition(this.anchor),this.objectCenter.copy(this.anchor),this.anchor.y+=.45):h||(this.bounds.getCenter(this.anchor),this.objectCenter.copy(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.28,this.size.y*.08)),this.projected.copy(this.anchor).project(e),this.objectProjected.copy(this.objectCenter).project(e);let d=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;if(u.element.hidden=!d,!d)continue;let f=u.element.offsetWidth||(u.type==="power"?44:146),p=u.element.offsetHeight||44;r.push({sceneObjectId:l,record:u,left:(this.projected.x*.5+.5)*i,top:(-this.projected.y*.5+.5)*s,controlWidth:f,controlHeight:p,objectRectangle:N0({left:(this.objectProjected.x*.5+.5)*i,top:(-this.objectProjected.y*.5+.5)*s},36,36)})}let o={power:0,climate:1,vacuum:1,cover:2};r.sort((l,u)=>(o[l.record.type]??3)-(o[u.record.type]??3)||l.top-u.top||l.left-u.left||l.sceneObjectId.localeCompare(u.sceneObjectId));let a=r.filter(({record:l})=>l.type==="power").map(({sceneObjectId:l,objectRectangle:u})=>({sceneObjectId:l,rectangle:u})),c=[];for(let l of r){let u=l.record.type==="power"?[]:a.filter(({sceneObjectId:d})=>d!==l.sceneObjectId).map(({rectangle:d})=>d),h=gd({left:l.left,top:l.top,width:i,height:s,controlWidth:l.controlWidth,controlHeight:l.controlHeight,obstacles:[...c,...u]});h&&(l.record.element.style.left=\`\${h.position.left}px\`,l.record.element.style.top=\`\${h.position.top}px\`,c.push(h.rectangle))}return c}clear(){for(let e of this.records.values())e.element.remove();this.records.clear(),this.busyDeviceIds.clear()}dispose(){this.clear(),this.layer.remove()}};var tT=7,nT=520;var Rr=class{constructor({movementThreshold:e=tT,longPressDelayMs:t=nT,onLongPress:i=()=>!1,schedule:s=(o,a)=>setTimeout(o,a),cancelSchedule:r=o=>clearTimeout(o)}={}){this.activePointers=new Map,this.candidate=null,this.movementThreshold=e,this.longPressDelayMs=t,this.onLongPress=i,this.schedule=s,this.cancelSchedule=r}cancelTimer(e=this.candidate){e?.timer!=null&&(this.cancelSchedule(e.timer),e.timer=null)}pointerDown({pointerId:e,clientX:t,clientY:i}){if(this.activePointers.set(e,{x:t,y:i}),this.activePointers.size!==1){this.candidate&&(this.candidate.moved=!0),this.cancelTimer();return}let s={pointerId:e,x:t,y:i,moved:!1,longPressFired:!1,timer:null};s.timer=this.schedule(()=>{s.timer=null,!(this.candidate!==s||s.moved||this.activePointers.size!==1)&&(s.longPressFired=this.onLongPress({clientX:s.x,clientY:s.y,pointerId:s.pointerId})===!0)},this.longPressDelayMs),this.candidate=s}pointerMove({pointerId:e,clientX:t,clientY:i}){!this.candidate||this.candidate.pointerId!==e||Math.hypot(t-this.candidate.x,i-this.candidate.y)<=this.movementThreshold||(this.candidate.moved=!0,this.cancelTimer())}pointerUp({pointerId:e,clientX:t,clientY:i}){let s=this.candidate;return this.activePointers.delete(e),!s||s.pointerId!==e||(this.cancelTimer(s),this.candidate=null,s.moved||s.longPressFired||this.activePointers.size>0)?null:{type:"tap",clientX:t,clientY:i,pointerId:e}}pointerCancel({pointerId:e}){this.activePointers.delete(e),this.candidate?.pointerId===e&&(this.cancelTimer(),this.candidate=null)}reset(){this.cancelTimer(),this.activePointers.clear(),this.candidate=null}dispose(){this.reset()}};function iT(n,e,t,i=new de){let s=t.getBoundingClientRect();return!(s.width>0)||!(s.height>0)?null:(i.x=(n-s.left)/s.width*2-1,i.y=-((e-s.top)/s.height)*2+1,i)}function U0({camera:n,canvas:e,clientX:t,clientY:i,pickables:s,pointer:r=new de,raycaster:o=new Cs,scene:a=null}){let c=iT(t,i,e,r);if(!c)return null;n.updateProjectionMatrix(),n.updateMatrixWorld(!0),a?.updateMatrixWorld(!0),o.setFromCamera(c,n);let l=o.intersectObjects(s??[],!1).find(u=>u.object.userData.sceneObjectId);return l?{intersection:l,sceneObjectId:l.object.userData.sceneObjectId}:null}function B0(n){if(!n||typeof n!="object")return[];let e=[];n.power&&!n.cleaning&&e.push("power"),n.light&&n.controls?.setBrightness&&e.push("brightness"),n.light&&n.controls?.setColorTemperature&&e.push("colorTemperature"),n.light&&n.controls?.setColor===!0&&e.push("color"),n.contact&&e.push("contact"),n.cover&&e.push("cover"),n.climate&&e.push("climate"),n.activity&&e.push("activity"),n.safety&&e.push("safety"),n.fan&&e.push("fan"),Array.isArray(n.environment)&&n.environment.length>0&&e.push("environment"),Array.isArray(n.energy)&&n.energy.length>0&&e.push("energy"),Array.isArray(n.entities)&&n.entities.length>0&&e.push("entities");let t=n.health?.alerts?.some(i=>i.active===!0)===!0;return n.health&&(!n.cleaning||t)&&e.push("health"),n.cleaning&&e.push("cleaning"),n.lock&&e.push("lock"),e}function k0({entityId:n,binding:e,state:t}){return typeof n!="string"||!n||typeof e?.provider!="string"||!e.provider||typeof e?.deviceId!="string"||!e.deviceId?null:{entityId:n,provider:e.provider,targetId:e.deviceId,bindingCapability:e.capability??null,capabilities:B0(t),state:t??null}}var Ul=class{constructor({adapters:e={},onOpenChange:t=()=>{}}={}){this.adapters=new Map(Object.entries(e)),this.onOpenChange=t,this.active=null}open(e){if(!e||typeof e.provider!="string")return!1;let t=this.adapters.get(e.provider);return!t||typeof t.open!="function"||(this.close(),t.open(e,{onClose:()=>this.handleAdapterClose(t)})===!1)?!1:(this.active={adapter:t,context:e},this.onOpenChange(!0,e),!0)}handleAdapterClose(e){this.active?.adapter===e&&(this.active=null,this.onOpenChange(!1,null))}updateState(e,t){if(!this.active||this.active.context.targetId!==e)return!1;let i={...this.active.context,capabilities:B0(t),state:t};return this.active.context=i,this.active.adapter.update?.(i),!0}setBusy(e,t){return!this.active||this.active.context.targetId!==e?!1:(this.active.adapter.setBusy?.(!!t),!0)}close(){if(!this.active)return;let{adapter:e}=this.active;this.active=null,e.close?.(),this.onOpenChange(!1,null)}dispose(){let e=!!this.active;this.active=null;for(let t of new Set(this.adapters.values()))t.dispose?.();this.adapters.clear(),e&&this.onOpenChange(!1,null)}};var H0=zn(os()),{DEVICE_COMMAND:jt}=H0.default;function z0(n,e){return n?.values?.some(t=>t.id===e)===!0}function Ai(n,e){if(n?.availability!=="available"||!e)return!1;switch(e.type){case jt.SET_POWER:return n.controls?.setPower===!0&&typeof e.value=="boolean";case jt.SET_BRIGHTNESS:return!!n.controls?.setBrightness&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_COLOR:return n.controls?.setColor===!0&&Number.isFinite(e.value?.hue)&&e.value.hue>=0&&e.value.hue<=1&&Number.isFinite(e.value?.saturation)&&e.value.saturation>=0&&e.value.saturation<=1;case jt.SET_COLOR_TEMPERATURE:return!!n.controls?.setColorTemperature&&Number.isFinite(e.value)&&e.value>=n.controls.setColorTemperature.min&&e.value<=n.controls.setColorTemperature.max;case jt.OPEN_COVER:return n.controls?.openCover===!0;case jt.CLOSE_COVER:return n.controls?.closeCover===!0;case jt.STOP_COVER:return n.controls?.stopCover===!0;case jt.SET_COVER_POSITION:return!!n.controls?.setCoverPosition&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_TARGET_TEMPERATURE:{let t=n.controls?.setTargetTemperature;return!!t&&Number.isFinite(e.value)&&e.value>=t.min&&e.value<=t.max}case jt.SET_THERMOSTAT_MODE:return z0(n.controls?.setThermostatMode,e.value);case jt.SET_FAN_SPEED:return!!n.controls?.setFanSpeed&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.SET_FAN_MODE:return z0(n.controls?.setFanMode,e.value);case jt.SET_TARGET_HUMIDITY:return!!n.controls?.setTargetHumidity&&Number.isFinite(e.value)&&e.value>=0&&e.value<=1;case jt.START_CLEANING:return n.controls?.startCleaning===!0;case jt.PAUSE_CLEANING:return n.controls?.pauseCleaning===!0;case jt.STOP_CLEANING:return n.controls?.stopCleaning===!0;case jt.RETURN_TO_BASE:return n.controls?.returnToBase===!0;case jt.LOCK:return n.controls?.lock===!0;case jt.UNLOCK:return n.controls?.unlock===!0;default:return!1}}var G0=zn(os()),{DEVICE_COMMAND:V0}=G0.default,qo=class{constructor({document:e=globalThis.document,onCommand:t,translate:i=(s,r)=>r}){this.onCommand=t,this.translate=i,this.interacting=!1,this.disposed=!1,this.element=e.createElement("div"),this.element.className="device-details-cover-position";let s=o=>{let a=e.createElement("div");a.className="device-details-range-label";let c=e.createElement("span");c.textContent=o;let l=e.createElement("span");return l.className="device-details-range-value",a.append(c,l),this.element.append(a),l};this.current=s(i("deviceDetails.position","Position"));let r=i("deviceDetails.targetPosition","Target position");this.target=s(r),this.slider=e.createElement("input"),this.slider.className="device-details-range device-details-cover-range",this.slider.type="range",this.slider.min="0",this.slider.max="100",this.slider.setAttribute("aria-label",r),this.element.append(this.slider),this.slider.addEventListener("pointerdown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("keydown",()=>{this.slider.disabled||(this.interacting=!0)}),this.slider.addEventListener("input",()=>this.showTarget()),this.slider.addEventListener("change",()=>{this.interacting=!1;let o={type:V0.SET_COVER_POSITION,value:Number(this.slider.value)/100};!this.disposed&&!this.slider.disabled&&Ai(this.state,o)&&this.onCommand(o)}),this.slider.addEventListener("pointerup",()=>{this.interacting=!1}),this.slider.addEventListener("keyup",()=>{this.interacting=!1}),this.slider.addEventListener("blur",()=>{this.interacting=!1}),this.slider.addEventListener("pointercancel",()=>{this.interacting=!1,this.update(this.state,this.busy)})}showTarget(){let e=Number(this.slider.value);this.target.textContent=\`\${e}%\`,this.slider.style.setProperty("--range-progress",\`\${e}%\`),this.slider.setAttribute("aria-valuetext",\`\${e}%\`)}update(e,t=!1,i=null){this.state=e,this.busy=t;let s=e?.cover?.position,r=Number.isFinite(s)&&s>=0&&s<=1;if(this.current.textContent=r?\`\${Math.round(s*100)}%\`:"\\u2013",this.slider.disabled=t||!r||!Ai(e,{type:V0.SET_COVER_POSITION,value:s}),this.slider.step=String(Math.max(1,Math.round((e?.controls?.setCoverPosition?.step??.01)*100))),this.slider.disabled&&(this.interacting=!1),!this.interacting){let o=Number.isFinite(i)?i:s;this.slider.value=String(r?Math.round(o*100):0),this.showTarget(),r||(this.target.textContent="\\u2013")}}dispose(){this.disposed=!0,this.interacting=!1,this.slider.disabled=!0,this.element.remove()}};var Y0=zn(os());var W0=Object.freeze({capture:!0,passive:!1});function Bl(n){let e=n.style.touchAction,t=i=>{i.cancelable&&i.preventDefault()};return n.style.touchAction="none",n.addEventListener("touchmove",t,W0),()=>{n.removeEventListener("touchmove",t,W0),n.style.touchAction=e}}var{DEVICE_COMMAND:kt}=Y0.default,sT=Object.freeze(["#ffffff","#ff9138","#ffd400","#0bc9bd","#49c7ef","#1594e8","#d735e5","#ff3d63"]),rT=700,Pr=Object.freeze({width:300,height:210,centerX:150,centerY:133,startDegrees:155,sweepDegrees:230});function oT(n){return Number.isFinite(n)?Math.round(Math.min(Math.max(n,0),1)*100):null}function $n(n,e,t){return Math.min(Math.max(n,e),t)}function X0(n){if(!Number.isFinite(n?.hue)||!Number.isFinite(n?.saturation))return"#ffffff";let e=(n.hue%1+1)%1,t=$n(n.saturation,0,1),i=e*6,s=Math.floor(i),r=i-s,o=1-t,a=1-r*t,c=1-(1-r)*t,[l,u,h]=[[1,c,o],[a,1,o],[o,1,c],[o,a,1],[c,o,1],[1,o,a]][s%6];return\`#\${[l,u,h].map(d=>Math.round(d*255).toString(16).padStart(2,"0")).join("")}\`}function aT(n){if(typeof n!="string"||!/^#[0-9a-f]{6}$/i.test(n))return null;let e=Number.parseInt(n.slice(1,3),16)/255,t=Number.parseInt(n.slice(3,5),16)/255,i=Number.parseInt(n.slice(5,7),16)/255,s=Math.max(e,t,i),r=Math.min(e,t,i),o=s-r,a=0;return o>0&&(s===e?a=(t-i)/o%6:s===t?a=(i-e)/o+2:a=(e-t)/o+4,a=(a/6+1)%1),{hue:a,saturation:s===0?0:o/s}}function $0(n){let e=Number.isFinite(n?.hue)?(n.hue%1+1)%1:0,t=Number.isFinite(n?.saturation)?$n(n.saturation,0,1):0;return{hue:e,saturation:t}}function cT(n){let e=$0(n),t=e.hue*Math.PI*2,i=e.saturation*45;return{left:50+Math.cos(t)*i,top:50+Math.sin(t)*i}}function lT(n,e,t,i){if(![n,e,t,i].every(Number.isFinite)||t<=0||i<=0)return null;let s=t/2,r=i/2,o=n-s,a=e-r,c=Math.min(t,i)/2;return{hue:(Math.atan2(a,o)/(Math.PI*2)+1)%1,saturation:$n(Math.hypot(o,a)/c,0,1)}}function uT(n,e,t){return![n,e,t].every(Number.isFinite)||t<=e?0:$n((n-e)/(t-e)*100,0,100)}function Ir(n,e,t,i){n.style.setProperty("--range-progress",\`\${uT(e,t,i)}%\`)}function kl(n){return Math.min(6,Math.max(0,(String(n).split(".")[1]??"").length))}function zl(n){let e=Number.isFinite(n?.min)?n.min:4,t=Number.isFinite(n?.max)&&n.max>e?n.max:35,i=Number.isFinite(n?.step)&&n.step>0?n.step:.5;return{minimum:e,maximum:t,step:i}}function _d(n,e){if(!Number.isFinite(n))return null;let{minimum:t,maximum:i,step:s}=zl(e),r=t+Math.round((n-t)/s)*s,o=Math.max(kl(t),kl(i),kl(s));return Number($n(r,t,i).toFixed(o))}function hT(n,e){if(!Number.isFinite(n))return 0;let{minimum:t,maximum:i}=zl(e);return $n((n-t)/(i-t),0,1)}function xd(n,e=100){let t=Pr,i=(t.startDegrees+$n(n,0,1)*t.sweepDegrees)*Math.PI/180;return{x:t.centerX+Math.cos(i)*e,y:t.centerY+Math.sin(i)*e}}function dT(n,e,t){if(![n,e].every(Number.isFinite))return null;let i=Pr,s=Math.atan2(e-i.centerY,n-i.centerX)*180/Math.PI;s<0&&(s+=360),s<i.startDegrees&&(s+=360);let r=s-i.startDegrees;r>i.sweepDegrees&&(r=n<i.centerX?0:i.sweepDegrees);let{minimum:o,maximum:a}=zl(t);return _d(o+r/i.sweepDegrees*(a-o),t)}function q0(n,e){if(!Number.isFinite(n))return"\\u2013";let t=Math.max(0,kl(e));return n.toFixed(t)}var yd=class{constructor({delay:e=rT,onCommit:t,setTimer:i=(r,o)=>globalThis.setTimeout(r,o),clearTimer:s=r=>globalThis.clearTimeout(r)}){this.delay=e,this.onCommit=t,this.setTimer=i,this.clearTimer=s,this.timer=null,this.value=null}get pending(){return this.timer!==null}cancel(){return this.timer===null?!1:(this.clearTimer(this.timer),this.timer=null,this.value=null,!0)}schedule(e){this.cancel(),this.value=e;let t=null;t=this.setTimer(()=>{if(this.timer!==t)return;let i=this.value;this.timer=null,this.value=null,this.onCommit?.(i)},this.delay),this.timer=t}dispose(){this.cancel()}};function Le(n,e,t=null){let i=document.createElement(n);return e&&(i.className=e),t!==null&&(i.textContent=t),i}function vd(n,e={}){let t=document.createElementNS("http://www.w3.org/2000/svg",n);for(let[i,s]of Object.entries(e))t.setAttribute(i,String(s));return t}function fT(n){n.stopPropagation()}var Yo=class{constructor({host:e,onCommand:t,translate:i=(r,o)=>o,createIcon:s=null}){this.onCommand=t,this.translate=i,this.createIcon=typeof s=="function"?s:null,this.context=null,this.busy=!1,this.onClose=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureCommit=new yd({onCommit:o=>{!o||this.layer.hidden||this.context?.entityId!==o.entityId||(this.setTargetTemperaturePendingVisual(!1),this.send({type:kt.SET_TARGET_TEMPERATURE,value:o.value}))}}),this.layer=Le("div","device-details-layer"),this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.panel=Le("section","device-details-panel"),this.panel.setAttribute("role","dialog"),this.panel.setAttribute("aria-modal","true"),this.panel.setAttribute("aria-labelledby","device-details-title"),this.panel.setAttribute("tabindex","-1");let r=Le("header","device-details-header");this.titleIcon=Le("span","device-details-title-icon"),this.titleIcon.hidden=!0,this.title=Le("h2","device-details-title"),this.title.id="device-details-title",this.closeButton=Le("button","device-details-close","\\xD7"),this.closeButton.type="button",this.closeButton.addEventListener("click",()=>this.close()),r.append(this.titleIcon,this.title,this.closeButton),this.body=Le("div","device-details-body"),this.panel.append(r,this.body),this.layer.appendChild(this.panel),e.appendChild(this.layer),this.onLayerClick=o=>{o.target===this.layer&&this.close()},this.onKeyDown=o=>{o.key==="Escape"&&!this.layer.hidden&&this.close()},this.layer.addEventListener("click",this.onLayerClick);for(let o of["pointerdown","pointermove","pointerup","pointercancel"])this.layer.addEventListener(o,fT);document.addEventListener("keydown",this.onKeyDown)}text(e,t){return this.translate(\`deviceDetails.\${e}\`,t)}open(e,{onClose:t=null}={}){globalThis.getSelection?.()?.removeAllRanges(),this.resetTargetTemperatureInteraction(),this.coverPositionDraft=null,this.context=e,this.busy=!1,this.onClose=t,this.render(),this.layer.hidden=!1,this.layer.setAttribute("aria-hidden","false"),this.panel.focus({preventScroll:!0})}update(e){if(this.layer.hidden||e.targetId!==this.context?.targetId)return;let t=this.targetTemperatureDraft,i=e.state?.climate?.targetTemperature;t?.entityId===e.entityId&&Number.isFinite(i)&&Math.abs(i-t.value)<1e-6&&(this.targetTemperatureCommit.cancel(),this.targetTemperatureDraft=null),this.coverPositionDraft?.entityId===e.entityId&&e.state?.cover?.position===this.coverPositionDraft.value&&(this.coverPositionDraft=null),this.context=e,!(this.coverPositionControl?.interacting&&(this.coverPositionControl.update(e.state,this.busy),this.coverPositionControl.interacting))&&this.render()}setBusy(e){this.layer.hidden||this.busy===e||(this.busy=e,this.render())}close({notify:e=!0}={}){if(this.layer.hidden)return;let t=this.onClose;this.resetTargetTemperatureInteraction(),this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.coverPositionDraft=null,this.coverPositionHadFocus=!1,this.layer.hidden=!0,this.layer.setAttribute("aria-hidden","true"),this.context=null,this.busy=!1,this.onClose=null,e&&t?.()}resetTargetTemperatureInteraction(){this.targetTemperatureCommit.cancel(),this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.targetTemperatureDraft=null,this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null}setTargetTemperaturePendingVisual(e){this.targetTemperaturePendingIndicator&&(this.targetTemperaturePendingIndicator.hidden=!e),this.targetTemperatureDial?.classList.toggle("is-pending",e)}cancelTargetTemperatureCommit(){this.targetTemperatureCommit.cancel(),this.setTargetTemperaturePendingVisual(!1)}scheduleTargetTemperatureCommit(e){if(!this.context||!Number.isFinite(e))return;let t=this.context.state?.climate?.targetTemperature;if(Number.isFinite(t)&&Math.abs(t-e)<1e-6){this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null;return}let i={entityId:this.context.entityId,value:e};this.targetTemperatureDraft=i,this.targetTemperatureCommit.schedule(i),this.setTargetTemperaturePendingVisual(!0)}createSection(e,t=""){let i=Le("section",\`device-details-section\${t?\` \${t}\`:""}\`);return i.appendChild(Le("h3","device-details-section-title",e)),this.body.appendChild(i),i}appendValue(e,t,i,s=null){let r=Le("div","device-details-value-row"),o=Le("span","device-details-value-label",t),a=this.createIcon?.(s);a?.nodeType===1&&(a.classList?.add("device-details-value-icon"),a.setAttribute?.("aria-hidden","true"),o.prepend(a)),r.append(o,Le("span","device-details-value",i)),e.appendChild(r)}renderEntities(e){let t=(e.entities??[]).filter(s=>s&&typeof s.id=="string"&&s.id);if(t.length===0)return;let i=this.createSection(this.text("entities","Entities"));for(let s of t){let r=typeof s.name=="string"&&s.name.trim()?s.name.trim():s.id,o=s.available===!1?this.text("unavailable","Unavailable"):\`\${s.value??"\\u2013"}\${s.unit?\` \${s.unit}\`:""}\`;this.appendValue(i,r,o,s.icon)}}capabilityLabel(e,t=null){if(typeof t=="string"&&t.trim())return t.trim();let s={alarm_motion:"Motion",alarm_presence:"Presence",alarm_occupancy:"Occupancy",alarm_smoke:"Smoke",alarm_fire:"Fire",alarm_co:"Carbon monoxide",alarm_gas:"Gas",alarm_water:"Water",alarm_moisture:"Moisture",alarm_heat:"Heat",measure_temperature:"Temperature",measure_humidity:"Humidity",measure_luminance:"Illuminance",measure_aqi:"Air quality index",measure_co2:"CO\\u2082",measure_pm25:"PM2.5",measure_tvoc:"TVOC",measure_pressure:"Pressure",measure_noise:"Noise",measure_power:"Power",meter_power:"Energy",measure_current:"Current",measure_voltage:"Voltage",meter_gas:"Gas meter",meter_water:"Water meter",alarm_battery:"Battery warning",alarm_connectivity:"Connectivity warning"}[e]??e;return this.text(\`capability.\${e}\`,s)}appendEnumControl(e,t,i,s,r){if(!s||!Array.isArray(s.values)||s.values.length===0){typeof i=="string"&&i&&this.appendValue(e,t,i);return}let o=Le("div","device-details-choice-row");o.appendChild(Le("span","device-details-value-label",t));let a=Le("div","device-details-choices");for(let c of s.values){let l=Le("button","device-details-choice",c.label??c.id);l.type="button",l.disabled=this.busy||this.context?.state?.availability!=="available",l.classList.toggle("is-selected",c.id===i),l.setAttribute("aria-pressed",String(c.id===i)),l.addEventListener("click",()=>this.send({type:r,value:c.id})),a.appendChild(l)}o.appendChild(a),e.appendChild(o)}appendNormalizedRange(e,{label:t,value:i,control:s,commandType:r}){let o=Number.isFinite(i)?Math.round($n(i,0,1)*100):null,a=Le("span","device-details-range-value",o===null?"\\u2013":\`\${o}%\`),c=Le("div","device-details-range-label");c.append(Le("span",null,t),a);let l=Le("input","device-details-range");l.type="range",l.min="0",l.max="100",l.step=String(Math.max(1,Math.round((s?.step??.01)*100))),l.value=String(o??0),l.disabled=this.busy||this.context?.state?.availability!=="available"||o===null||!s,l.setAttribute("aria-label",t),Ir(l,o??0,0,100),l.addEventListener("input",()=>{a.textContent=\`\${l.value}%\`,Ir(l,Number(l.value),0,100)}),l.addEventListener("change",()=>this.send({type:r,value:Number(l.value)/100})),e.append(c,l)}createAction(e,t,i,s=!0){let r=Le("button","device-details-action");return r.type="button",r.disabled=this.busy||!s||this.context?.state?.availability!=="available",r.setAttribute("aria-label",e),r.title=e,r.append(Le("span","device-details-action-symbol",t),Le("span","device-details-action-label",e)),r.addEventListener("click",()=>this.send(i)),r}send(e){!this.context||this.busy||this.onCommand(this.context.entityId,e)}renderPower(e){let t=e.power?.isOn===!0,i=e.availability==="available"&&typeof e.power?.isOn=="boolean",s=this.createSection(this.text("power","Power")),r=Le("button",\`device-details-toggle\${t?" is-on":""}\`);r.type="button",r.disabled=this.busy||!i||e.controls?.setPower!==!0,r.setAttribute("aria-pressed",String(t));let o=t?this.text("on","On"):this.text("off","Off");r.setAttribute("aria-label",\`\${this.text("power","Power")}: \${o}\`),r.append(Le("span","device-details-toggle-label",o),Le("span","device-details-toggle-indicator")),r.addEventListener("click",()=>this.send({type:kt.SET_POWER,value:!t})),s.appendChild(r)}renderBrightness(e){let t=this.createSection(this.text("brightness","Brightness")),i=oT(e.light?.brightness),s=Le("span","device-details-range-value",i===null?"\\u2013":\`\${i}%\`),r=Le("div","device-details-range-label");r.append(Le("span",null,this.text("brightness","Brightness")),s);let o=Le("input","device-details-range device-details-brightness-range");o.type="range",o.min="0",o.max="100",o.step=String(Math.max(1,Math.round((e.controls.setBrightness.step??.01)*100))),o.value=String(i??0),o.disabled=this.busy||e.availability!=="available"||i===null,o.setAttribute("aria-label",this.text("brightness","Brightness")),Ir(o,i??0,0,100),o.addEventListener("input",()=>{s.textContent=\`\${o.value}%\`,Ir(o,Number(o.value),0,100)}),o.addEventListener("change",()=>this.send({type:kt.SET_BRIGHTNESS,value:Number(o.value)/100})),t.append(r,o)}renderColorTemperature(e){let t=e.controls?.setColorTemperature,i=Number.isFinite(t?.min)?t.min:2e3,s=Number.isFinite(t?.max)?t.max:6500,r=Number.isFinite(t?.step)&&t.step>0?t.step:50,o=Number.isFinite(e.light?.colorTemperatureKelvin)?$n(e.light.colorTemperatureKelvin,i,s):null,a=this.createSection(this.text("colorTemperature","Color temperature")),c=Le("span","device-details-range-value",o===null?"\\u2013":\`\${Math.round(o)} K\`),l=Le("div","device-details-range-label");l.append(Le("span",null,this.text("colorTemperature","Color temperature")),c);let u=Le("input","device-details-range device-details-temperature-range");u.type="range",u.min=String(i),u.max=String(s),u.step=String(r),u.value=String(o??(i+s)/2),u.disabled=this.busy||e.availability!=="available"||!t,u.setAttribute("aria-label",this.text("colorTemperature","Color temperature")),Ir(u,o??(i+s)/2,i,s),u.addEventListener("input",()=>{c.textContent=\`\${Math.round(Number(u.value))} K\`,Ir(u,Number(u.value),i,s)}),u.addEventListener("change",()=>this.send({type:kt.SET_COLOR_TEMPERATURE,value:Number(u.value)})),a.append(l,u)}renderColor(e){let t=this.createSection(this.text("color","Color")),i=!this.busy&&e.availability==="available",s=$0(e.light?.color),r=Le("button","device-details-color-wheel");r.type="button",r.disabled=!i,r.setAttribute("aria-label",this.text("selectColor","Select color"));let o=Le("span","device-details-color-wheel-marker");o.setAttribute("aria-hidden","true"),r.appendChild(o);let a=Le("div","device-details-color-presets-label",this.text("presets","Presets")),c=Le("div","device-details-color-presets"),l=sT.map(f=>{let p=aT(f),x=Le("button","device-details-color-preset");return x.type="button",x.disabled=!i,x.style.setProperty("--preset-color",f),x.setAttribute("aria-label",\`\${this.text("selectColor","Select color")}: \${f}\`),x.addEventListener("click",()=>{s=p,u(),this.send({type:kt.SET_COLOR,value:p})}),c.appendChild(x),{button:x,color:p}}),u=()=>{let f=cT(s);o.style.left=\`\${f.left}%\`,o.style.top=\`\${f.top}%\`,o.style.background=X0(s),r.setAttribute("aria-valuetext",X0(s));for(let p of l){let x=Math.abs(p.color.saturation-s.saturation),m=Math.min(Math.abs(p.color.hue-s.hue),1-Math.abs(p.color.hue-s.hue)),g=x<.025&&(s.saturation<.025||m<.0125);p.button.classList.toggle("is-selected",g),p.button.setAttribute("aria-pressed",String(g))}},h=f=>{let p=r.getBoundingClientRect(),x=lT(f.clientX-p.left,f.clientY-p.top,p.width,p.height);return x?(s=x,u(),!0):!1},d=null;r.addEventListener("pointerdown",f=>{i&&(d=f.pointerId,r.setPointerCapture?.(f.pointerId),h(f),f.preventDefault())}),r.addEventListener("pointermove",f=>{f.pointerId===d&&(h(f),f.preventDefault())}),r.addEventListener("pointerup",f=>{if(f.pointerId!==d)return;let p=h(f);d=null,r.releasePointerCapture?.(f.pointerId),p&&this.send({type:kt.SET_COLOR,value:s}),f.preventDefault()}),r.addEventListener("pointercancel",f=>{f.pointerId===d&&(d=null)}),r.addEventListener("keydown",f=>{let p=.013888888888888888,x=.05;if(f.key==="ArrowLeft")s.hue=(s.hue-p+1)%1;else if(f.key==="ArrowRight")s.hue=(s.hue+p)%1;else if(f.key==="ArrowUp")s.saturation=$n(s.saturation+x,0,1);else if(f.key==="ArrowDown")s.saturation=$n(s.saturation-x,0,1);else return;u(),this.send({type:kt.SET_COLOR,value:s}),f.preventDefault()}),u(),t.append(r,a,c)}renderContact(e){let t=this.createSection(this.text("contact","Contact")),i=e.contact?.state??"unknown",s={open:this.text("open","Open"),closed:this.text("closed","Closed"),unknown:this.text("unknown","Unknown")};this.appendValue(t,this.text("status","Status"),s[i]??s.unknown)}renderCover(e){let t=this.createSection(this.text("cover","Cover"));this.coverPositionControl=new qo({onCommand:a=>{this.coverPositionDraft={entityId:this.context.entityId,value:a.value},this.send(a)},translate:this.translate});let i=this.coverPositionDraft?.entityId===this.context.entityId?this.coverPositionDraft.value:null;this.coverPositionControl.update(e,this.busy,i),t.appendChild(this.coverPositionControl.element);let s=e.cover?.movement??"unknown",r=this.text(\`coverState.\${s}\`,s);s!=="unknown"&&this.appendValue(t,this.text("status","Status"),r);let o=Le("div","device-details-actions");o.append(this.createAction(this.text("openCover","Open"),"\\u2191",{type:kt.OPEN_COVER},e.controls?.openCover===!0),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:kt.STOP_COVER},e.controls?.stopCover===!0),this.createAction(this.text("closeCover","Close"),"\\u2193",{type:kt.CLOSE_COVER},e.controls?.closeCover===!0)),t.appendChild(o)}renderThermostatDial(e,t,i,s,r){let{minimum:o,maximum:a,step:c}=zl(s),l=!!s&&!this.busy&&t.availability==="available",u=this.context?.entityId,h=this.targetTemperatureDraft?.entityId===u?this.targetTemperatureDraft.value:null,d=_d(Number.isFinite(h)?h:i,s),f=Le("div","device-details-thermostat-dial");f.setAttribute("role","slider"),f.setAttribute("aria-label",this.text("targetTemperature","Target temperature")),f.setAttribute("aria-valuemin",String(o)),f.setAttribute("aria-valuemax",String(a)),f.setAttribute("aria-disabled",String(!l)),f.tabIndex=l?0:-1,this.targetTemperatureDial=f,this.disposeTargetTemperatureTouchGuard=Bl(f);let p=vd("svg",{viewBox:\`0 0 \${Pr.width} \${Pr.height}\`,"aria-hidden":"true"});p.classList.add("device-details-thermostat-scale");let x=[],m=41;for(let te=0;te<m;te+=1){let Me=te/(m-1),Ye=te%5===0,$e=xd(Me,119),ee=xd(Me,Ye?101:108),pe=vd("line",{x1:ee.x,y1:ee.y,x2:$e.x,y2:$e.y});pe.classList.add("device-details-thermostat-tick"),Ye&&pe.classList.add("is-major"),p.appendChild(pe),x.push({element:pe,fraction:Me})}let g=vd("circle",{r:8});g.classList.add("device-details-thermostat-thumb"),p.appendChild(g);let S=Le("div","device-details-thermostat-readout"),E=Le("span","device-details-thermostat-target-label",this.text("targetTemperature","Target temperature")),v=Le("span","device-details-thermostat-target-value"),w=Le("span","device-details-thermostat-target-number"),b=Le("span","device-details-thermostat-target-unit",r);v.append(w,b);let A=Number.isFinite(t.climate?.currentTemperature)?\`\${t.climate.currentTemperature.toFixed(1)} \${r}\`:this.text("unknown","Unknown"),_=Le("span","device-details-thermostat-current",\`\${this.text("currentTemperature","Current temperature")}: \${A}\`);S.append(E,v,_),f.append(p,S);let T=Le("div","device-details-thermostat-feedback"),I=Le("span","device-details-thermostat-hint",l?this.text("temperatureDialHint","Drag along the arc to adjust"):""),P=Le("span","device-details-thermostat-pending",this.text("temperaturePending","Will be sent shortly\\u2026"));P.setAttribute("role","status"),P.setAttribute("aria-live","polite");let D=this.targetTemperatureCommit.pending&&this.targetTemperatureDraft?.entityId===u;P.hidden=!D,T.append(I,P),this.targetTemperaturePendingIndicator=P,f.classList.toggle("is-pending",D);let H=Le("div","device-details-thermostat-controls"),F=Le("button","device-details-thermostat-step");F.type="button",F.setAttribute("aria-label",this.text("decreaseTemperature","Decrease target temperature")),F.append(Le("span","device-details-thermostat-step-symbol","\\u2212"),Le("span","device-details-thermostat-step-label",this.text("decreaseTemperature","Decrease target temperature")));let L=Le("button","device-details-thermostat-step");L.type="button",L.setAttribute("aria-label",this.text("increaseTemperature","Increase target temperature")),L.append(Le("span","device-details-thermostat-step-symbol","+"),Le("span","device-details-thermostat-step-label",this.text("increaseTemperature","Increase target temperature"))),H.append(F,L);let $=(te,Me=!0)=>{let Ye=_d(te,s);if(!Number.isFinite(Ye))return!1;d=Ye,Me&&(this.targetTemperatureDraft={entityId:u,value:d});let $e=hT(d,s);for(let le of x)le.element.classList.toggle("is-active",le.fraction<=$e+1e-6);let ee=xd($e,103);g.setAttribute("cx",String(ee.x)),g.setAttribute("cy",String(ee.y)),w.textContent=q0(d,c);let pe=\`\${q0(d,c)} \${r}\`;return f.setAttribute("aria-valuenow",String(d)),f.setAttribute("aria-valuetext",pe),F.disabled=!l||d<=o,L.disabled=!l||d>=a,!0},q=te=>{let Me=f.getBoundingClientRect();return!(Me.width>0)||!(Me.height>0)?!1:$(dT((te.clientX-Me.left)*Pr.width/Me.width,(te.clientY-Me.top)*Pr.height/Me.height,s))},z=null;f.addEventListener("pointerdown",te=>{l&&(this.cancelTargetTemperatureCommit(),z=te.pointerId,f.classList.add("is-adjusting"),f.setPointerCapture?.(te.pointerId),q(te),te.preventDefault())}),f.addEventListener("pointermove",te=>{te.pointerId===z&&(q(te),te.preventDefault())}),f.addEventListener("pointerup",te=>{te.pointerId===z&&(q(te),z=null,f.classList.remove("is-adjusting"),f.releasePointerCapture?.(te.pointerId),this.scheduleTargetTemperatureCommit(d),te.preventDefault())}),f.addEventListener("pointercancel",te=>{te.pointerId===z&&(z=null,f.classList.remove("is-adjusting"),this.cancelTargetTemperatureCommit(),this.targetTemperatureDraft=null,$(i,!1))});let K=new Set(["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","Home","End"]),ce=!1;f.addEventListener("keydown",te=>{if(!l||!K.has(te.key))return;this.cancelTargetTemperatureCommit();let Me=d;(te.key==="ArrowLeft"||te.key==="ArrowDown")&&(Me-=c),(te.key==="ArrowRight"||te.key==="ArrowUp")&&(Me+=c),te.key==="Home"&&(Me=o),te.key==="End"&&(Me=a),ce=$(Me)||ce,te.preventDefault()}),f.addEventListener("keyup",te=>{!K.has(te.key)||!ce||(ce=!1,this.scheduleTargetTemperatureCommit(d),te.preventDefault())});let V=te=>{this.cancelTargetTemperatureCommit(),$(d+te*c)&&this.scheduleTargetTemperatureCommit(d)};F.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),L.addEventListener("pointerdown",()=>this.cancelTargetTemperatureCommit()),F.addEventListener("click",()=>V(-1)),L.addEventListener("click",()=>V(1)),$(d,!1),e.append(f,H,T)}renderClimate(e){let t=this.createSection(this.text("climate","Climate"),"device-details-climate-section"),i=e.climate?.unit??"\\xB0C",s=e.climate?.targetTemperature,r=e.controls?.setTargetTemperature;Number.isFinite(s)?this.renderThermostatDial(t,e,s,r,i):Number.isFinite(e.climate?.currentTemperature)&&this.appendValue(t,this.text("currentTemperature","Current temperature"),\`\${e.climate.currentTemperature.toFixed(1)} \${i}\`),Number.isFinite(e.climate?.humidity)&&this.appendValue(t,this.text("humidity","Humidity"),\`\${Math.round(e.climate.humidity)}%\`),(typeof e.climate?.mode=="string"||e.controls?.setThermostatMode)&&this.appendEnumControl(t,this.text("mode","Mode"),e.climate.mode,e.controls?.setThermostatMode,kt.SET_THERMOSTAT_MODE)}renderActivity(e){let t=this.createSection(this.text("activity","Activity")),i={alarm_motion:[this.text("detected","Detected"),this.text("clear","Clear")],alarm_presence:[this.text("present","Present"),this.text("away","Away")],alarm_occupancy:[this.text("occupied","Occupied"),this.text("unoccupied","Unoccupied")]};for(let s of e.activity??[]){let r=s.baseId??s.id,[o,a]=i[r]??[this.text("active","Active"),this.text("normal","Normal")];this.appendValue(t,this.capabilityLabel(r,s.label),s.active===null?this.text("unknown","Unknown"):s.active?o:a)}}renderSafety(e){let t=(e.safety??[]).some(s=>s.active===!0),i=this.createSection(this.text("safety","Safety"),t?"is-alert":"");for(let s of e.safety??[])this.appendValue(i,this.capabilityLabel(s.baseId??s.id,s.label),s.active===null?this.text("unknown","Unknown"):s.active?this.text("alarm","Alarm"):this.text("normal","Normal"))}renderFan(e){let t=this.createSection(this.text("fan","Fan"));e.fan&&(Number.isFinite(e.fan.speed)||e.controls?.setFanSpeed)&&this.appendNormalizedRange(t,{label:this.text("fanSpeed","Fan speed"),value:e.fan.speed,control:e.controls?.setFanSpeed,commandType:kt.SET_FAN_SPEED}),(typeof e.fan?.mode=="string"||e.controls?.setFanMode)&&this.appendEnumControl(t,this.text("fanMode","Fan mode"),e.fan.mode,e.controls?.setFanMode,kt.SET_FAN_MODE),e.fan&&(Number.isFinite(e.fan.targetHumidity)||e.controls?.setTargetHumidity)&&this.appendNormalizedRange(t,{label:this.text("targetHumidity","Target humidity"),value:e.fan.targetHumidity,control:e.controls?.setTargetHumidity,commandType:kt.SET_TARGET_HUMIDITY})}renderMeasurements(e,t){let i=t==="environment",s=(e[t]??[]).filter(o=>!i||!e.climate||!["measure_temperature","measure_humidity"].includes(o.baseId??o.id));if(s.length===0)return;let r=this.createSection(this.text(i?"environment":"energy",i?"Environment":"Energy"));for(let o of s){let a=Number.isFinite(o.value)?\`\${Number(o.value.toFixed(2))}\${o.unit?\` \${o.unit}\`:""}\`:"\\u2013";this.appendValue(r,this.capabilityLabel(o.baseId??o.id,o.label),a)}}renderHealth(e){let t=(e.health?.alerts??[]).filter(r=>r.active===!0),i=Number.isFinite(e.health?.batteryPercent);if(!i&&t.length===0)return;let s=this.createSection(this.text("deviceHealth","Device health"),t.length>0?"is-warning":"");i&&this.appendValue(s,this.text("battery","Battery"),\`\${Math.round(e.health.batteryPercent)}%\`);for(let r of t)this.appendValue(s,this.capabilityLabel(r.id,r.label),this.text("attentionRequired","Attention required"))}renderCleaning(e){let t=this.createSection(this.text("cleaning","Cleaning")),i=e.cleaning?.state??"unknown";this.appendValue(t,this.text("status","Status"),this.text(\`cleaningState.\${i}\`,i)),Number.isFinite(e.cleaning?.batteryPercent)&&this.appendValue(t,this.text("battery","Battery"),\`\${Math.round(e.cleaning.batteryPercent)}%\`);let s=Le("div","device-details-actions");s.append(this.createAction(this.text("start","Start"),"\\u25B6",{type:kt.START_CLEANING},e.controls?.startCleaning===!0&&i!=="cleaning"),this.createAction(this.text("pause","Pause"),"\\u2016",{type:kt.PAUSE_CLEANING},e.controls?.pauseCleaning===!0&&i==="cleaning"),this.createAction(this.text("stop","Stop"),"\\u25A0",{type:kt.STOP_CLEANING},e.controls?.stopCleaning===!0&&!["idle","docked"].includes(i)),this.createAction(this.text("returnToBase","Return to base"),"\\u2302",{type:kt.RETURN_TO_BASE},e.controls?.returnToBase===!0&&!["docked","returning"].includes(i))),t.appendChild(s)}renderLock(e){let t=this.createSection(this.text("lock","Lock")),i=typeof e.lock?.isLocked=="boolean"?e.lock.isLocked:null,s=i===null?this.text("unknown","Unknown"):i?this.text("locked","Locked"):this.text("unlocked","Unlocked");this.appendValue(t,this.text("status","Status"),s);let r=Le("div","device-details-actions");r.append(this.createAction(this.text("unlock","Unlock"),"\\u{1F513}",{type:kt.UNLOCK},e.controls?.unlock===!0&&i!==!1),this.createAction(this.text("lockAction","Lock"),"\\u{1F512}",{type:kt.LOCK},e.controls?.lock===!0&&i!==!0)),t.appendChild(r)}render(){let e=this.context?.state??{},t=typeof e.name=="string"&&e.name.trim()?e.name.trim():this.text("device","Device");this.title.textContent=t,this.titleIcon.replaceChildren();let i=this.createIcon?.(e.icon);i?.nodeType===1?(i.setAttribute?.("aria-hidden","true"),this.titleIcon.appendChild(i),this.titleIcon.hidden=!1):this.titleIcon.hidden=!0;let s=this.text("close","Close");this.closeButton.setAttribute("aria-label",s),this.closeButton.title=s,this.disposeTargetTemperatureTouchGuard?.(),this.disposeTargetTemperatureTouchGuard=null,this.coverPositionHadFocus||=this.coverPositionControl?.slider===document.activeElement,this.coverPositionControl?.dispose(),this.coverPositionControl=null,this.body.replaceChildren(),this.targetTemperaturePendingIndicator=null,this.targetTemperatureDial=null,e.availability!=="available"&&this.body.appendChild(Le("div","device-details-unavailable",this.text("unavailable","Unavailable")));let r=new Set(this.context?.capabilities??[]);r.has("safety")&&this.renderSafety(e),r.has("activity")&&this.renderActivity(e),r.has("power")&&this.renderPower(e),r.has("brightness")&&this.renderBrightness(e),r.has("colorTemperature")&&this.renderColorTemperature(e),r.has("color")&&this.renderColor(e),r.has("contact")&&this.renderContact(e),r.has("cover")&&this.renderCover(e),r.has("climate")&&this.renderClimate(e),r.has("fan")&&this.renderFan(e),r.has("environment")&&this.renderMeasurements(e,"environment"),r.has("energy")&&this.renderMeasurements(e,"energy"),r.has("health")&&this.renderHealth(e),r.has("cleaning")&&this.renderCleaning(e),r.has("lock")&&this.renderLock(e),r.has("entities")&&this.renderEntities(e),this.coverPositionHadFocus&&!this.busy&&(this.coverPositionControl?.slider.disabled||this.coverPositionControl?.slider.focus({preventScroll:!0}),this.coverPositionHadFocus=!1),r.size===0&&this.body.appendChild(Le("p","device-details-empty",this.text("noInformation","No supported device information")))}dispose(){this.disposed||(this.disposed=!0,this.close({notify:!1}),this.targetTemperatureCommit.dispose(),document.removeEventListener("keydown",this.onKeyDown),this.layer.remove())}};var $o=class{constructor({overlay:e}){this.overlay=e}open(e,t){return this.overlay.open(e,t),!0}update(e){this.overlay.update(e)}setBusy(e){this.overlay.setBusy(e)}close(){this.overlay.close({notify:!1})}dispose(){this.overlay.dispose()}};var pT=Object.freeze({power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v9"/><path d="M6.6 5.4a8 8 0 1 0 10.8 0"/></svg>',cover:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h10M9 19l3-2 3 2"/></svg>',climate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M13 7v9"/></svg>',cleaning:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M6 17.5h12"/></svg>',contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="13" height="18" rx="1"/><circle cx="14.5" cy="12" r=".8"/></svg>',lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/></svg>',activity:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4"/></svg>',safety:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 19h17L12 3Z"/><path d="M12 9v4.5M12 17h.01"/></svg>',fan:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 10c-1.5-4.8 1-7 3.5-6 2.2.9 1.6 4.8-1.9 7M13.8 13c4.9 1.1 5.6 4.4 3.5 6-1.9 1.5-5-1-5.2-5M10.3 13c-3.4 3.7-6.5 2.6-6.8 0-.3-2.4 3.4-3.8 6.6-1.3"/></svg>',environment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5C5 11 9 6.5 18.5 5c.5 8.5-3.6 14-9 14A4.5 4.5 0 0 1 5 15.5Z"/><path d="M7 18c2-4 5-6 9-9"/></svg>',energy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/></svg>',health:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l2-5 4 10 2-5h4"/><path d="M5 5h14v14H5z"/></svg>',details:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>'}),jo=Object.freeze({minimumVisible:6,maximumVisible:20,horizontalPitch:48});function mT(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();if(!e)return null;let t=e.split(".")[0];return e.startsWith("windowcoverings_")||t==="garagedoor_closed"?"cover":["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(t)?"safety":["alarm_motion","alarm_presence","alarm_occupancy"].includes(t)?"activity":e.startsWith("vacuum_")||e.startsWith("vacuumcleaner_")?"cleaning":e==="target_temperature"||e.startsWith("thermostat_")?"climate":["fan_speed","fan_mode","target_humidity"].includes(t)?"fan":t==="onoff"?"power":["locked","locked_status","lock","unlock","deadbolt"].includes(t)?"lock":t==="alarm_contact"?"contact":t==="measure_temperature"?"climate":["measure_humidity","measure_luminance","measure_aqi","measure_co2","measure_pm25","measure_tvoc","measure_pressure","measure_noise"].includes(t)?"environment":["measure_power","meter_power","measure_current","measure_voltage","meter_gas","meter_water"].includes(t)?"energy":t==="measure_battery"||t.startsWith("alarm_")?"health":null}function gT(n){if(typeof n!="string")return null;let e=n.trim().toLowerCase();return["windowcoverings","blinds","curtain","shutter"].includes(e)?"cover":["vacuumcleaner","vacuum"].includes(e)?"cleaning":["thermostat","heater"].includes(e)?"climate":["fan","airconditioning","airpurifier","humidifier","dehumidifier"].includes(e)?"fan":e==="lock"?"lock":["garagedoor","gate"].includes(e)?"cover":["meter","smartmeter"].includes(e)?"energy":["light","socket"].includes(e)?"power":null}function xT(n,e=null,t=null){if(n?.safety)return"safety";let i=gT(n?.deviceClass);if(i==="lock")return"lock";let s=mT(t);return s||i||(n?.cleaning?"cleaning":n?.cover?"cover":n?.lock?"lock":n?.activity?"activity":n?.fan?"fan":e==="light"&&n?.power?"power":n?.climate?"climate":n?.power?"power":n?.energy?"energy":n?.environment?"environment":n?.health?"health":n?.contact?"contact":"details")}function vT(n,e){let t=typeof n=="string"?n.trim().toLowerCase():"",i=t.split(".")[0];return["alarm_smoke","alarm_fire","alarm_co","alarm_gas","alarm_water","alarm_moisture","alarm_heat"].includes(i)?900:["alarm_motion","alarm_presence","alarm_occupancy"].includes(i)?800:t.startsWith("vacuum_")||t.startsWith("vacuumcleaner_")?600:t.startsWith("windowcoverings_")?500:t==="target_temperature"||t.startsWith("thermostat_")?400:["locked","locked_status","lock","unlock","deadbolt"].includes(t)?375:t==="onoff"?350:t==="alarm_contact"?300:t==="measure_temperature"?100:{safety:90,activity:80,cleaning:60,cover:50,climate:40,lock:38,power:35,contact:30,fan:28,energy:20,environment:18,health:16,details:0}[e]??0}function _T(n){let e=Number.isFinite(n)&&n>0?n:jo.minimumVisible*jo.horizontalPitch;return Math.min(jo.maximumVisible,Math.max(jo.minimumVisible,Math.floor(e/jo.horizontalPitch)))}function yT(n){let e=n?.state,t=Number.isFinite(n?.priority)?n.priority:0;return(e?.safety??[]).some(s=>s.active===!0)||e?.health?.alerts?.some(s=>s.active===!0)===!0?t+3e3:n?.type==="power"&&e?.power?.isOn===!0?t+1400:(e?.activity??[]).some(s=>s.active===!0)?t+1200:e?.cleaning&&!["docked","idle"].includes(e.cleaning.state)?t+1e3:e?.cover?.movement&&e.cover.movement!=="stopped"?t+800:e?.climate?.heatingActive===!0?t+700:n?.type==="fan"&&(e?.power?.isOn===!0||Number.isFinite(e?.fan?.speed)&&e.fan.speed>0)?t+600:e?.availability==="unavailable"?t-100:t}function j0(n,e){return(n.left-e.left)**2+(n.top-e.top)**2}function bT(n,e,t,i,s){let r=[...n],o=[];for(;o.length<e&&r.length>0;){let a=0,c=-1/0;for(let l=0;l<r.length;l+=1){let u=r[l],h=[...t,...o],d=h.length>0?Math.min(...h.map(p=>j0(u,p))):-j0(u,{left:i/2,top:s/2}),f=r[a];(d>c||d===c&&u.sceneObjectId.localeCompare(f.sceneObjectId)<0)&&(a=l,c=d)}o.push(r.splice(a,1)[0])}return o}function MT(n,e,t){let i=_T(e);if(n.length<=i)return n;let s=new Map;for(let o of n){let a=yT(o.record);s.has(a)||s.set(a,[]),s.get(a).push(o)}let r=[];for(let o of[...s.keys()].sort((a,c)=>c-a)){let a=s.get(o),c=i-r.length;if(c<=0)break;a.length<=c?r.push(...a):r.push(...bT(a,c,r,e,t))}return r}function ST({entities:n,bindings:e,statesByDeviceId:t}){let i=new Map;for(let s of n.values()){let r=e.get(s.id);if(!r?.deviceId)continue;let o=t.get(r.deviceId),a=xT(o,s.kind,r.capability),c={binding:r,entity:s,priority:vT(r.capability,a),state:o,type:a},l=i.get(r.deviceId);(!l||c.priority>l.priority)&&i.set(r.deviceId,c)}return[...i.values()]}function Dr(n){n.preventDefault(),n.stopPropagation()}var Zo=class{constructor({host:e,onOpenDetails:t,onTogglePower:i,translate:s=(o,a)=>a,createIcon:r=null}){this.onOpenDetails=t,this.onTogglePower=i,this.translate=s,this.createIcon=typeof r=="function"?r:null,this.records=new Map,this.enabled=!0,this.suppressed=!1,this.bounds=new Ht,this.anchor=new O,this.projected=new O,this.size=new O,this.layer=document.createElement("div"),this.layer.className="device-affordance-layer",this.layer.hidden=!0,this.layer.setAttribute("aria-label",this.translate("deviceDetails.label","Device details")),e.appendChild(this.layer)}createRecord(e,t,i){let s=document.createElement("button");s.type="button",s.className="device-affordance-button",s.dataset.markerType=i,s.dataset.sceneObjectId=e,s.innerHTML=\`\${pT[i]}<span class="device-affordance-device-icon" aria-hidden="true"></span>\`;let r={deviceId:null,element:s,entity:t,pressGesture:null,priority:0,state:null,suppressClickUntil:0,type:i,providerIcon:null};r.pressGesture=new Rr({onLongPress:()=>{if(this.records.get(e)!==r)return!1;let a=this.onOpenDetails(e)===!0;return a&&(r.suppressClickUntil=Date.now()+1e3,globalThis.getSelection?.()?.removeAllRanges()),a}});let o=()=>{this.records.get(e)===r&&(r.type==="power"&&r.state?.availability==="available"&&typeof r.state.power?.isOn=="boolean"&&r.state.controls?.setPower===!0?this.onTogglePower(e):this.onOpenDetails(e))};return s.addEventListener("pointerdown",a=>{Dr(a);try{s.setPointerCapture?.(a.pointerId)}catch{}r.pressGesture.pointerDown(a)}),s.addEventListener("pointermove",a=>{Dr(a),r.pressGesture.pointerMove(a)}),s.addEventListener("pointerup",a=>{Dr(a);let c=r.pressGesture.pointerUp(a);r.suppressClickUntil=Math.max(r.suppressClickUntil,Date.now()+500),c&&o()}),s.addEventListener("pointercancel",a=>{Dr(a),r.pressGesture.pointerCancel(a)}),s.addEventListener("lostpointercapture",a=>{r.pressGesture.pointerCancel(a)}),s.addEventListener("contextmenu",Dr),s.addEventListener("click",a=>{Dr(a),!(Date.now()<r.suppressClickUntil)&&o()}),this.layer.appendChild(s),this.records.set(e,r),r}removeRecord(e,t){t.pressGesture.dispose(),t.element.remove(),this.records.delete(e)}updateRecord(e,t){e.state=t;let i=typeof t?.icon?.dataUrl=="string"&&t.icon.dataUrl.startsWith("data:image/svg+xml;base64,")?t.icon.dataUrl:null;e.providerIcon?.remove(),e.providerIcon=null;let s=i?null:this.createIcon?.(t?.icon);s?.nodeType===1&&(s.classList?.add("device-affordance-provider-icon"),s.setAttribute?.("aria-hidden","true"),e.element.appendChild(s),e.providerIcon=s),e.element.classList.toggle("has-device-icon",!!i),e.element.classList.toggle("has-provider-icon",!!e.providerIcon),i?e.element.style.setProperty("--device-affordance-icon",\`url("\${i}")\`):e.element.style.removeProperty("--device-affordance-icon");let r=e.type==="power",o=r&&t?.power?.isOn===!0,a=t?.availability!=="available",c=(t?.safety??[]).some(f=>f.active===!0)||t?.health?.alerts?.some(f=>f.active===!0)===!0,l=String(t?.cleaning?.state??"").toLowerCase(),u=(t?.activity??[]).some(f=>f.active===!0)||e.type==="cleaning"&&t?.availability==="available"&&l.length>0&&!["docked","idle","paused"].includes(l)||e.type==="fan"&&(t?.power?.isOn===!0||Number.isFinite(t?.fan?.speed)&&t.fan.speed>0||t?.fan?.mode==="on");e.element.classList.toggle("is-on",o),e.element.classList.toggle("is-alert",c),e.element.classList.toggle("is-active",u),e.element.classList.toggle("is-unavailable",a),r?e.element.setAttribute("aria-pressed",String(o)):e.element.removeAttribute("aria-pressed");let h=typeof t?.name=="string"&&t.name.trim()?t.name.trim():this.translate("deviceDetails.device","Device"),d=r&&!a?this.translate(o?"quickControls.power.turnOff":"quickControls.power.turnOn",o?"Turn off":"Turn on"):this.translate("deviceDetails.label","Device details");e.element.setAttribute("aria-label",\`\${h}: \${d}\`),e.element.title=d}sync({entities:e,bindings:t,statesByDeviceId:i}){let s=new Set,r=ST({entities:e,bindings:t,statesByDeviceId:i});for(let{binding:o,entity:a,priority:c,state:l,type:u}of r){s.add(a.id);let h=this.records.get(a.id);h&&h.type!==u&&(this.removeRecord(a.id,h),h=null),h??=this.createRecord(a.id,a,u),h.entity=a,h.deviceId=o.deviceId,h.priority=c,this.updateRecord(h,l)}for(let[o,a]of this.records)s.has(o)||this.removeRecord(o,a);this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setEnabled(e){this.enabled=!!e,this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}setSuppressed(e){if(this.suppressed=!!e,this.suppressed)for(let t of this.records.values()){let i=[...t.pressGesture.activePointers.keys()];t.pressGesture.reset();for(let s of i)try{t.element.hasPointerCapture?.(s)&&t.element.releasePointerCapture(s)}catch{}}this.layer.hidden=!this.enabled||this.suppressed||this.records.size===0}layout(e,t,i=[]){if(this.layer.hidden)return[];let s=Math.max(t.clientWidth,1),r=Math.max(t.clientHeight,1);e.updateMatrixWorld(!0);let o=[];for(let[u,h]of this.records){let d=h.entity.controlAnchor;d?(d.updateWorldMatrix(!0,!1),d.getWorldPosition(this.anchor),this.anchor.y+=.35):(h.entity.root.updateWorldMatrix(!0,!0),this.bounds.setFromObject(h.entity.root)),!d&&this.bounds.isEmpty()?(h.entity.root.getWorldPosition(this.anchor),this.anchor.y+=.35):d||(this.bounds.getCenter(this.anchor),this.bounds.getSize(this.size),this.anchor.y=this.bounds.max.y+Math.max(.16,this.size.y*.05)),this.projected.copy(this.anchor).project(e);let f=this.projected.z>=-1&&this.projected.z<=1&&Math.abs(this.projected.x)<=1.08&&Math.abs(this.projected.y)<=1.08;h.element.hidden=!f,f&&o.push({left:(this.projected.x*.5+.5)*s,record:h,sceneObjectId:u,top:(-this.projected.y*.5+.5)*r})}let a=MT(o,s,r),c=new Set(a.map(({sceneObjectId:u})=>u));for(let u of o)u.record.element.hidden=!c.has(u.sceneObjectId);a.sort((u,h)=>u.top-h.top||u.left-h.left||u.sceneObjectId.localeCompare(h.sceneObjectId));let l=[...i];for(let u of a){let h=gd({left:u.left,top:u.top,width:s,height:r,controlWidth:u.record.element.offsetWidth||38,controlHeight:u.record.element.offsetHeight||38,collisionGap:5,obstacles:l});h&&(u.record.element.style.left=\`\${h.position.left}px\`,u.record.element.style.top=\`\${h.position.top}px\`,l.push(h.rectangle))}return l}clear(){for(let[e,t]of this.records)this.removeRecord(e,t);this.layer.hidden=!0}dispose(){this.clear(),this.layer.remove()}};var Vg=zn(os());var tg=zn(eg()),{FALLBACK_SUNRISE_HOUR:tI,FALLBACK_SUNSET_HOUR:nI,calculateDashboardSolarPosition:RT,fallbackDashboardSolarPosition:IT,normalizeDashboardSolarPosition:PT,resolveDashboardSolarState:Md}=tg.default;var DT=Object.freeze(["auto","light","dark"]),rg=Object.freeze(["auto","day","evening","night"]),LT=.52,OT=.36,Sd=Object.freeze({resolvedTheme:"light",backgroundStyle:"neutral-light",uiContrast:"dark",ambientIntensityFactor:1,keyIntensityFactor:1,fillIntensityFactor:1,toneMappingExposure:1.05}),NT=Object.freeze({resolvedTheme:"dark",backgroundStyle:"warm-evening",uiContrast:"light",ambientIntensityFactor:.62,keyIntensityFactor:.58,fillIntensityFactor:.55,toneMappingExposure:1.025}),ng=Object.freeze({resolvedTheme:"dark",backgroundStyle:"neutral-dark",uiContrast:"light",ambientIntensityFactor:.28,keyIntensityFactor:.24,fillIntensityFactor:.22,toneMappingExposure:1}),FT=Object.freeze({day:Sd,evening:NT,night:ng,light:Sd,dark:ng});function UT(n){return DT.includes(n)?n:"auto"}function Ko(n){return rg.includes(n)?n:"auto"}function ig(n){return n==="dark"||n==="light"?n:null}function sg(n){return\`rgb(\${n.map(e=>Math.round(Math.min(Math.max(e,0),1)*255)).join(", ")})\`}function Vl(n,e,t){typeof n?.setProperty=="function"?n.setProperty(e,t):n&&(n[e]=t)}function BT(n,e){let t=i=>i[0]*.2126+i[1]*.7152+i[2]*.0722;return(t(n)+t(e))/2}function Gl({mode:n="auto",timeOfDay:e="auto",autoBrightness:t=!0,indoorBrightnessInDarkness:i=!0,hostTheme:s=null,systemTheme:r="light",at:o=new Date,solarPosition:a=null,modelNorthDegrees:c=0}={}){let l=UT(n),u=l==="auto"?ig(s)??ig(r)??"light":l,h=Ko(e),d=Md({at:o,solarPosition:a,modelNorthDegrees:c,timeOfDay:h}),f=d.resolvedTimeOfDay,p=FT[f],x=t?h==="auto"?d:p:Sd,m=t!==!1&&i!==!1;return Object.freeze({themeMode:l,timeOfDayMode:h,resolvedTimeOfDay:f,...p,resolvedTheme:u,uiContrast:u==="dark"?"light":"dark",solar:d,solarSignature:d.signature,sunPositionDirection:d.sunPositionDirection,keyRGB:d.keyRGB,fillRGB:d.fillRGB,backdropTopRGB:d.backdropTopRGB,backdropBottomRGB:d.backdropBottomRGB,sceneContrast:BT(d.backdropTopRGB,d.backdropBottomRGB)<.55?"light":"dark",autoBrightness:t!==!1,indoorBrightnessInDarkness:i!==!1,ambientIntensityFactor:m?Math.max(x.ambientIntensityFactor,LT):x.ambientIntensityFactor,keyIntensityFactor:x.keyIntensityFactor,fillIntensityFactor:m?Math.max(x.fillIntensityFactor,OT):x.fillIntensityFactor,toneMappingExposure:x.toneMappingExposure})}function kT(n,e){return!!(n&&e&&n.themeMode===e.themeMode&&n.timeOfDayMode===e.timeOfDayMode&&n.resolvedTimeOfDay===e.resolvedTimeOfDay&&n.autoBrightness===e.autoBrightness&&n.indoorBrightnessInDarkness===e.indoorBrightnessInDarkness&&n.resolvedTheme===e.resolvedTheme&&n.solarSignature===e.solarSignature)}function Wl(n,{renderer:e=null,rootElement:t=null,runtimes:i=[]}={}){if(n){t&&(t.dataset.dashboardThemeMode=n.themeMode,t.dataset.dashboardTheme=n.resolvedTheme,t.dataset.dashboardTimeOfDayMode=n.timeOfDayMode,t.dataset.dashboardTimeOfDay=n.resolvedTimeOfDay,t.dataset.dashboardBackground=n.backgroundStyle,t.dataset.dashboardContrast=n.uiContrast,t.dataset.dashboardSceneContrast=n.sceneContrast,t.style.colorScheme=n.resolvedTheme,Vl(t.style,"--dashboard-scene-backdrop-top",sg(n.backdropTopRGB)),Vl(t.style,"--dashboard-scene-backdrop-bottom",sg(n.backdropBottomRGB)),Vl(t.style,"--dashboard-scene-text-primary",n.sceneContrast==="light"?"rgb(242, 244, 245)":"rgb(38, 49, 60)"),Vl(t.style,"--dashboard-scene-text-secondary",n.sceneContrast==="light"?"rgba(236, 239, 241, 0.76)":"rgba(38, 49, 60, 0.7)")),e&&(e.toneMappingExposure=n.toneMappingExposure);for(let s of i)e0(s?.lighting,n)}}function Jo(n,e,{mode:t="auto",timeOfDay:i="auto",autoBrightness:s=!0,indoorBrightnessInDarkness:r=!0,at:o=new Date,solarPosition:a=null,modelNorthDegrees:c=0,renderer:l=null,rootElement:u=null,runtimes:h=[],afterApply:d=null,requestRender:f=null}={}){let p=Gl({mode:t,timeOfDay:i,autoBrightness:s,indoorBrightnessInDarkness:r,at:o,solarPosition:a,modelNorthDegrees:c,...e});return kT(n,p)?n:(Wl(p,{renderer:l,rootElement:u,runtimes:h}),d?.(p),f?.(),p)}var cs=Object.freeze({compactWidth:320,spaciousWidth:640,shortHeight:320,tallHeight:720,portraitAspect:.8,landscapeAspect:1.2,maxDevicePixelRatio:2,maxRenderPixels:21e5});function Ed(n,e=1){return Number.isFinite(n)&&n>0?n:e}function wd({width:n,height:e,devicePixelRatio:t=1}={}){let i=Ed(n),s=Ed(e),r=i/s,o=i<cs.compactWidth?"compact":i>=cs.spaciousWidth?"spacious":"standard",a=s<cs.shortHeight?"short":s>=cs.tallHeight?"tall":"standard",c=r<=cs.portraitAspect?"portrait":r>=cs.landscapeAspect?"landscape":"balanced",l=Math.min(Math.max(Ed(t),1),cs.maxDevicePixelRatio),u=Math.sqrt(cs.maxRenderPixels/(i*s)),h=Math.round(Math.max(1,Math.min(l,u))*1e3)/1e3;return Object.freeze({width:i,height:s,aspect:r,size:o,heightClass:a,orientation:c,renderPixelRatio:h})}function og(n,e){return!!(n&&e&&n.size===e.size&&n.heightClass===e.heightClass&&n.orientation===e.orientation&&n.renderPixelRatio===e.renderPixelRatio)}function Td(n,{rootElement:e=null,shellElement:t=null}={}){if(n)for(let i of[e,t])i&&(i.dataset.dashboardLayoutSize=n.size,i.dataset.dashboardLayoutHeight=n.heightClass,i.dataset.dashboardLayoutOrientation=n.orientation)}function Xl(n,e){let t=Math.max(Number(e)||0,0);return n?.orientation!=="landscape"?t:Math.min(t,Math.max(116,Math.floor(t*.58)))}var cI=Object.freeze({minimumKelvin:2e3,maximumKelvin:6500}),zT=2850;function Qo(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function ql(n){return typeof n=="number"&&Number.isFinite(n)?n:null}function ag(n){let e=Qo(n,2e3,6500)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,i=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,s=e>=66?255:e<=19?0:138.5177312231*Math.log(e-10)-305.0447927307,r=o=>Qo(o/255*.88+.12);return{r:r(t),g:r(i),b:r(s)}}function HT(n,e){let t=(n%1+1)%1,i=Qo(e),s=t*6,r=i,o=r*(1-Math.abs(s%2-1)),a;s<1?a=[r,o,0]:s<2?a=[o,r,0]:s<3?a=[0,r,o]:s<4?a=[0,o,r]:s<5?a=[o,0,r]:a=[r,0,o];let c=1-r,l=u=>{let h=Qo(u+c);return Math.abs(h)<1e-12?0:Math.abs(1-h)<1e-12?1:h};return{r:l(a[0]),g:l(a[1]),b:l(a[2])}}function cg(n){let e=n?.availability==="available"&&typeof n?.power?.isOn=="boolean",t=e&&n.power.isOn,i=ql(n?.light?.brightness),s=i===null?1:Qo(i),r=ql(n?.light?.color?.hue),o=ql(n?.light?.color?.saturation),a=ql(n?.light?.colorTemperatureKelvin),c=r!==null&&o!==null,l=a!==null,u=["color","temperature","white"].includes(n?.light?.mode)?n.light.mode:c?"color":l?"temperature":"white",h=u==="color"&&!c?l?"temperature":"white":u==="temperature"&&!l?c?"color":"white":u,d,f=null;return h==="color"&&c?d=HT(r,o):h==="temperature"&&l?(f=a,d=ag(a)):d=ag(zT),{known:e,on:t,brightness:s,hasDim:i!==null,colorMode:h,rgb:d,...f===null?{}:{colorTemperature:f}}}var lg=14,VT=280,ug=1776928,GT=5593180;function Ad(n,e=0,t=1){return Math.min(Math.max(n,e),t)}function WT(n){return n<.5?4*n*n*n:1-(-2*n+2)**3/2}function Yl(n,e){let t=Ad(e);n.slats.forEach((i,s)=>{let r=n.topY-n.headrailHeight-(s+.5)*n.fullSpacing,o=n.topY-n.headrailHeight-(s+.5)*n.stackSpacing;i.position.y=nt.lerp(r,o,t),i.rotation.x=-.05*(1-t)}),n.fraction=t}function XT(n){let e=n.visual?.coverVisual;if(e)return e;if(n.elementType!=="window"||!n.visual?.size)return null;let{width:t,height:i,depth:s}=n.visual.size,r=Math.max(t-.1,.18),o=Math.max(i-.1,.32),a=Math.min(Math.max(o*.04,.035),.055),c=Math.max((o-a)/lg,.018),l=Math.min(Math.max(o*.004,.0035),.006),u=Math.max(c+.006,.024),h=new An({color:ug,roughness:.58,metalness:.08}),d=new st;d.name="DashboardWindowCover",d.position.set(t/2,.05,Math.max(s,.02)*.1),d.userData.deviceVisual="cover",n.root.add(d);let f=new Wt(r,a,.06),p=new Je(f,h);p.name="DashboardWindowCoverRail",p.position.y=o-a/2,p.castShadow=!0,p.receiveShadow=!0,d.add(p);let x=new Wt(r*.98,u,.052),m=Array.from({length:lg},(S,E)=>{let v=new Je(x,h);return v.name=\`DashboardWindowCoverSlat:\${E}\`,v.castShadow=!0,v.receiveShadow=!0,d.add(v),v}),g={root:d,rail:p,slats:m,material:h,topY:o,headrailHeight:a,fullSpacing:c,stackSpacing:l,fraction:1,transition:null,initialized:!1};return Yl(g,1),n.visual.coverVisual=g,g}function hg(n,e,t=0){if(n.elementType!=="window")return!1;if(!e?.cover)return n.visual?.coverVisual&&(n.visual.coverVisual.root.visible=!1),!1;let i=XT(n);if(!i)return!1;i.root.visible=!0;let s=e.availability==="available";i.material.color.setHex(s?ug:GT),i.root.userData.coverAvailability=e.availability,i.root.userData.coverMovement=e.cover.movement;let r=typeof e.cover.position=="number"&&Number.isFinite(e.cover.position)?Ad(e.cover.position):null;return r===null?(i.initialized||Yl(i,1),i.initialized=!0,i.transition=null,!1):i.initialized?Math.abs(r-i.fraction)<=1e-6?(i.transition=null,!1):(i.transition={from:i.fraction,to:r,startedAt:t,duration:VT},!0):(Yl(i,r),i.initialized=!0,!0)}function qT(n,e){let t=n.visual?.coverVisual,i=t?.transition;if(!i)return!1;let s=Ad((e-i.startedAt)/i.duration);return Yl(t,nt.lerp(i.from,i.to,WT(s))),s>=1&&(t.transition=null),s<1}function dg(n,e){let t=!1;for(let i of n.values())t=qT(i,e)||t;return t}var _g=new Set(["alarm_occupancy","alarm_presence","occupancy","presence"]),fg=5680504,yg=5680504,YT=6662616,$T=14179671,ln=Object.freeze({fadeInMs:600,fadeOutMs:1500,floorOffset:.006,wallGap:.02,innerWidth:.035,outerWidth:.11,innerVerticalOffset:8e-4,innerOpacity:.42,outerOpacity:.14,pulseDurationMs:3600,minimumPulseOpacity:.72}),bg=Object.freeze({coreOpacity:.34}),li=Object.freeze({maximumFrameDeltaMs:100,maximumPathPoints:128,maximumSpeedMetersPerSecond:2,minimumSegmentLength:.01,minimumSpeedMetersPerSecond:.02}),Ci=Object.freeze({gridSpacing:.25,maximumGridPoints:2400,maximumLandmarks:5,maximumRobotClearance:.34,minimumLandmarkDistance:.8,minimumRobotClearance:.18,robotClearancePadding:.04,speedMetersPerSecond:.22}),jT=new Set(["chair_basic","climate","device","rug","table_basic"]),Cd=.002,ZT=4;function Id(n){return typeof n=="string"?n.trim().toLowerCase().split(".")[0]:""}function KT(n){return _g.has(Id(n?.capability))}function JT(n){return _g.has(Id(n?.baseId??n?.id))}function QT(n){return n?.availability==="available"&&(n.activity??[]).some(e=>JT(e)&&e.active===!0)}function e1(n){if(n?.availability!=="available")return"inactive";let e=String(n?.cleaning?.state??"").trim().toLowerCase(),t=String(n?.cleaning?.error??"").trim().toLowerCase();return["error","fault","blocked"].includes(e)||t&&!["no error","none","ok"].includes(t)?"error":["returning","returning_to_base","return-to-base","docking"].includes(e)?"returning":["active","cleaning","mowing","on","running"].includes(e)?"working":"inactive"}function Pd(n){if(!n||(n.coordinateSpace??"floor")!=="floor")return null;let e=[];for(let s of n.path??[]){if(e.length>=li.maximumPathPoints)break;if(!Number.isFinite(s?.x)||!Number.isFinite(s?.z))continue;let r={x:s.x,z:s.z};(e.length===0||Math.sqrt(jn(e[e.length-1],r))>=li.minimumSegmentLength)&&e.push(r)}if(e.length<2)return null;let t=nt.clamp(Number(n.speedMetersPerSecond)||.25,li.minimumSpeedMetersPerSecond,li.maximumSpeedMetersPerSecond);return{coordinateSpace:"floor",loop:n.loop===!0,path:e,speedMetersPerSecond:t}}function Mg(n){let e=Pd(n);if(!e)return null;let{loop:t,path:i,speedMetersPerSecond:s}=e,r=[],o=t?i.length:i.length-1,a=0;for(let c=0;c<o;c+=1){let l=i[c],u=i[(c+1)%i.length],h=Math.sqrt(jn(l,u));h<li.minimumSegmentLength||(r.push({end:u,length:h,start:l,startDistance:a}),a+=h)}return r.length===0||a<=0?null:{...e,segments:r,signature:JSON.stringify(e),totalDistance:a}}function jn(n,e){return(n.x-e.x)**2+(n.z-e.z)**2}function ls(n){return n.length<3?0:n.reduce((e,t,i)=>{let s=n[(i+1)%n.length];return e+t.x*s.z-s.x*t.z},0)/2}function Or(n,e){return n.x*e.z-n.z*e.x}function Dn(n,e){return{x:n.x-e.x,z:n.z-e.z}}function jl(n,e,t){return{x:n.x+e.x*t,z:n.z+e.z*t}}function pg(n){let e=Math.hypot(n.x,n.z);return e<=Cd?null:{x:n.x/e,z:n.z/e}}function Dd(n){let e=[];for(let t of n??[])!Number.isFinite(t?.x)||!Number.isFinite(t?.z)||(e.length===0||jn(e[e.length-1],t)>Cd**2)&&e.push({x:t.x,z:t.z});return e.length>1&&jn(e[0],e[e.length-1])<=Cd**2&&e.pop(),ls(e)<0&&e.reverse(),e}function Fr(n,e){if(!n||e.length<3)return!1;let t=!1,i=e[e.length-1];for(let s of e){if(s.z>n.z!=i.z>n.z){let o=(i.x-s.x)*(n.z-s.z)/(i.z-s.z)+s.x;n.x<o&&(t=!t)}i=s}return t}function t1(n,e,t,i){let s=Or(Dn(e,n),Dn(t,n)),r=Or(Dn(e,n),Dn(i,n)),o=Or(Dn(i,t),Dn(n,t)),a=Or(Dn(i,t),Dn(e,t));return s*r<-1e-6&&o*a<-1e-6}function Sg(n){if(n.length<4)return!1;for(let e=0;e<n.length;e+=1){let t=(e+1)%n.length;for(let i=e+1;i<n.length;i+=1){let s=(i+1)%n.length;if(!(t===i||s===e||e===i)&&t1(n[e],n[t],n[i],n[s]))return!0}}return!1}function n1(n,e,t){let i=Dn(t,e),s=i.x**2+i.z**2;if(s<=1e-6)return Math.sqrt(jn(n,e));let r=Dn(n,e),o=nt.clamp((r.x*i.x+r.z*i.z)/s,0,1);return Math.sqrt(jn(n,jl(e,i,o)))}function Eg(n,e){return e.reduce((t,i,s)=>Math.min(t,n1(n,i,e[(s+1)%e.length])),1/0)}function i1(n){let e=String(n?.assetKey??n?.visualType??"").trim();if(n?.kind==="light"||e==="robotVacuum"||jT.has(e))return null;let t=n?.dimensions??n?.size,i=Number(t?.width),s=Number(t?.depth),r=Number(n?.position?.x),o=Number(n?.position?.z);return![i,s,r,o].every(Number.isFinite)||i<=.04||s<=.04?null:{depth:s,rotation:nt.degToRad(Number(n?.rotation?.y)||0),width:i,x:r,z:o}}function wg(n,e,t){let i=n.x-e.x,s=n.z-e.z,r=Math.cos(e.rotation),o=Math.sin(e.rotation),a=r*i+o*s,c=-o*i+r*s;return Math.abs(a)<=e.width/2+t&&Math.abs(c)<=e.depth/2+t}function s1(n,e,t,i){return Fr(n,e)&&Eg(n,e)>=i&&!t.some(s=>wg(n,s,i))}function Tg(n,e,t,i){let s=Math.sqrt(jn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let o=0;o<=r;o+=1){let a=o/r;if(!t({x:nt.lerp(n.x,e.x,a),z:nt.lerp(n.z,e.z,a)}))return!1}return!0}function r1(n,e,t,i){let s=Math.sqrt(jn(n,e)),r=Math.max(1,Math.ceil(s/Math.max(i/3,.05)));for(let o=1;o<=r;o+=1){let a=o/r;if(!t({x:nt.lerp(n.x,e.x,a),z:nt.lerp(n.z,e.z,a)}))return!1}return!0}function o1(n,e,t){n[e].push(t),n[t].push(e)}function Ag(n,e){let t=[],i=[e],s=new Set(i);for(let r=0;r<i.length;r+=1){let o=i[r];t.push(o);for(let a of n[o])s.has(a)||(s.add(a),i.push(a))}return t}function a1(n){let e=[],t=new Map;for(let i=0;i<n.length;i+=1){if(t.has(i))continue;let s=Ag(n,i),r=e.length;e.push(s);for(let o of s)t.set(o,r)}return{componentByPoint:t,components:e}}function mg(n,e,t){if(e===t)return[e];let i=[e],s=new Map([[e,null]]);for(let r=0;r<i.length;r+=1){let o=i[r];for(let a of n[o])if(!s.has(a)){if(s.set(a,o),a===t){let c=[t],l=o;for(;l!==null;)c.push(l),l=s.get(l);return c.reverse()}i.push(a)}}return null}function gg(n,e,t){if(n.length<=2)return n;let i=[n[0]],s=0;for(;s<n.length-1;){let r=s+1;for(let o=n.length-1;o>s+1;o-=1)if(Tg(n[s],n[o],e,t)){r=o;break}i.push(n[r]),s=r}return i}function c1(n,e){return(n?.rooms??[]).map(t=>({room:t,boundary:Dd(t?.polygon)})).filter(({boundary:t})=>Fr(e,t)).sort((t,i)=>Math.abs(ls(t.boundary))-Math.abs(ls(i.boundary)))[0]??null}function Cg({activeFloor:n,excludedObjectId:e=null,origin:t,robotSize:i=null}={}){if(!Number.isFinite(t?.x)||!Number.isFinite(t?.z))return null;let s=c1(n,t);if(!s||s.boundary.length<3)return null;let r=Math.max(Number(i?.width)||.42,.18),o=Math.max(Number(i?.depth)||.42,.18),a=nt.clamp(Math.max(r,o)/2+Ci.robotClearancePadding,Ci.minimumRobotClearance,Ci.maximumRobotClearance),c=(n?.objects??[]).filter(z=>z?.id!==e&&Fr(z?.position,s.boundary)).map(i1).filter(Boolean),l=z=>s1(z,s.boundary,c,a),u=z=>Fr(z,s.boundary)&&!c.some(K=>wg(z,K,.02)),h=s.boundary.reduce((z,K)=>({maximumX:Math.max(z.maximumX,K.x),maximumZ:Math.max(z.maximumZ,K.z),minimumX:Math.min(z.minimumX,K.x),minimumZ:Math.min(z.minimumZ,K.z)}),{maximumX:-1/0,maximumZ:-1/0,minimumX:1/0,minimumZ:1/0}),d=Math.max(0,h.maximumX-h.minimumX-a*2),f=Math.max(0,h.maximumZ-h.minimumZ-a*2),p=Ci.gridSpacing;d*f/p**2>Ci.maximumGridPoints&&(p=Math.sqrt(d*f/Ci.maximumGridPoints));let m=[],g=new Map,S=Math.floor(d/p)+1,E=Math.floor(f/p)+1;for(let z=0;z<E;z+=1)for(let K=0;K<S;K+=1){let ce={x:h.minimumX+a+K*p,z:h.minimumZ+a+z*p};l(ce)&&(g.set(\`\${K}:\${z}\`,m.length),m.push(ce))}if(m.length<2)return null;let v=m.map(()=>[]),w=[[1,0],[0,1],[1,1],[-1,1]];for(let[z,K]of g){let[ce,V]=z.split(":").map(Number);for(let[te,Me]of w){let Ye=g.get(\`\${ce+te}:\${V+Me}\`);Ye!==void 0&&(te!==0&&Me!==0&&(!g.has(\`\${ce+te}:\${V}\`)||!g.has(\`\${ce}:\${V+Me}\`))||Tg(m[K],m[Ye],l,p)&&o1(v,K,Ye))}}let b=m.map((z,K)=>({index:K,distance:jn(t,z)})).sort((z,K)=>z.distance-K.distance),{componentByPoint:A,components:_}=a1(v),T=b.filter(({index:z})=>_[A.get(z)].length>=2),I=T.filter(({index:z})=>r1(t,m[z],u,p)),P=(I.length>0?I:T).sort((z,K)=>_[A.get(K.index)].length-_[A.get(z.index)].length||z.distance-K.distance)[0]?.index;if(P===void 0)return null;let D=Ag(v,P);if(D.length<2)return null;let H=[P];for(;H.length<=Ci.maximumLandmarks;){let z=null;for(let K of D){if(H.includes(K))continue;let ce=Math.min(...H.map(V=>jn(m[K],m[V])));(!z||ce>z.separation)&&(z={index:K,separation:ce})}if(!z||Math.sqrt(z.separation)<Ci.minimumLandmarkDistance)break;H.push(z.index)}if(H.length<2)return null;let F=[{x:t.x,z:t.z},m[P]],L=new Set(H.slice(1)),$=P;for(;L.size>0;){let z=null;for(let ce of L){let V=mg(v,$,ce);!V||z&&V.length>=z.graphPath.length||(z={graphPath:V,target:ce})}if(!z)break;let K=gg(z.graphPath.map(ce=>m[ce]),l,p);F.push(...K.slice(1)),$=z.target,L.delete($)}let q=mg(v,$,P);if(q){let z=gg(q.map(K=>m[K]),l,p);F.push(...z.slice(1))}return Pd({coordinateSpace:"floor",loop:!0,path:F,speedMetersPerSecond:Ci.speedMetersPerSecond})}function $l(n,e){if(e<=0)return n.map(s=>({...s}));let t=[];for(let s=0;s<n.length;s+=1){let r=n[(s-1+n.length)%n.length],o=n[s],a=n[(s+1)%n.length],c=pg(Dn(o,r)),l=pg(Dn(a,o));if(!c||!l)return null;let u={x:-c.z,z:c.x},h={x:-l.z,z:l.x},d=jl(o,u,e),f=jl(o,h,e),p=Or(c,l),x;if(Math.abs(p)<=1e-5){if(!(c.x*l.x+c.z*l.z>0))return null;x=d}else{let g=Or(Dn(f,d),l)/p;x=jl(d,c,g)}let m=Math.sqrt(jn(o,x));if(!Number.isFinite(x.x)||!Number.isFinite(x.z)||m>e*ZT)return null;t.push(x)}let i=ls(t);return t.length!==n.length||i<=0||i>=ls(n)||Sg(t)||t.some(s=>!Fr(s,n))||t.some(s=>Eg(s,n)<e-.001)?null:t}function l1(n,e){let t=Dd(n?.polygon);if(t.length<3||ls(t)<=0||Sg(t))return null;let i=Math.max(e,0)+ln.wallGap,s=i+ln.outerWidth,r=i+(ln.outerWidth-ln.innerWidth)/2,o=r+ln.innerWidth,a=$l(t,i),c=$l(t,s),l=$l(t,r),u=$l(t,o);return!a||!c||!l||!u?null:{boundary:t,softOuter:a,softInner:c,coreOuter:l,coreInner:u}}function xg(n,e,t){let i=[],s=[];for(let o=0;o<n.length;o+=1){let a=(o+1)%n.length,c=i.length/3;i.push(n[o].x,t,n[o].z,n[a].x,t,n[a].z,e[a].x,t,e[a].z,e[o].x,t,e[o].z),s.push(c,c+2,c+1,c,c+3,c+2)}let r=new Vt;return r.setAttribute("position",new ft(i,3)),r.setIndex(s),r.computeVertexNormals(),r}function Rd(n,e){let t=new Gt({color:n,depthTest:!0,depthWrite:!1,opacity:0,side:Tt,toneMapped:!1,transparent:!0});return t.userData.baseOpacity=e,t}function Nr(n){n.userData.excludeFromCameraFit=!0,n.userData.excludeFromDevicePicking=!0}function u1(n,e,t){let i=l1(n,e);if(!i)return null;let s=n.elevation+ln.floorOffset,r=Rd(fg,ln.outerOpacity),o=Rd(fg,ln.innerOpacity),a=new st;a.name=\`OccupancyRoomGlow:\${n.id}\`,a.visible=!1,Nr(a);let c=new Je(xg(i.softOuter,i.softInner,s),r),l=new Je(xg(i.coreOuter,i.coreInner,s+ln.innerVerticalOffset),o);return c.renderOrder=2,l.renderOrder=3,Nr(c),Nr(l),a.add(c,l),t.add(a),{currentOpacity:0,duration:0,group:a,innerMaterial:o,outerMaterial:r,roomId:n.id,startOpacity:0,transitionStartedAt:0,targetOccupied:!1}}function h1(n,e=null){let t=n.root.userData.dimensions??{width:.42,depth:.42},i=Math.max(Number(t.width)||.42,.18),s=Math.max(Number(t.depth)||.42,.18),r=n.visual?.pathMotionRoot??n.root,o=new st;o.name=\`RobotWorkGlow:\${n.id}\`,o.position.y=.008,o.visible=!1,Nr(o);let a=Rd(yg,bg.coreOpacity),c=new Je(new _o(.54,.76,64),a);return c.rotation.x=-Math.PI/2,c.scale.set(i,s,1),c.renderOrder=4,Nr(c),o.add(c),r.add(o),n.controlAnchor=n.root,{baseEntityPosition:n.root.position.clone(),baseEntityRotationY:n.root.rotation.y,baseMotionPosition:r.position.clone(),baseMotionRotationY:r.rotation.y,core:c,coreMaterial:a,distance:0,entityRoot:n.root,errorTravelRemaining:0,group:o,illustrativeMotion:Mg(e),lastMotionAt:null,mode:"inactive",motion:null,motionRoot:r,motionSignature:null}}function d1(n,e){let t={x:e.root.position.x,z:e.root.position.z};return(n.rooms??[]).map(s=>({room:s,polygon:Dd(s.polygon)})).filter(({polygon:s})=>Fr(t,s)).sort((s,r)=>Math.abs(ls(s.polygon))-Math.abs(ls(r.polygon)))[0]?.room??null}function f1(n){let e=nt.clamp(n,0,1);return e**3*(e*(e*6-15)+10)}function vg(n,e,t){if(n.duration>0){let a=(e-n.transitionStartedAt)/n.duration;n.currentOpacity=n.startOpacity+((n.targetOccupied?1:0)-n.startOpacity)*f1(a),(a>=1||t)&&(n.currentOpacity=n.targetOccupied?1:0,n.duration=0)}let i=e%ln.pulseDurationMs/ln.pulseDurationMs,s=(1-Math.cos(i*2*Math.PI))/2,r=n.targetOccupied&&!t&&n.duration===0?1-s*(1-ln.minimumPulseOpacity):1,o=n.currentOpacity*r;return n.outerMaterial.opacity=ln.outerOpacity*o,n.innerMaterial.opacity=ln.innerOpacity*o,n.group.visible=o>1e-4||n.duration>0,n.duration>0||n.targetOccupied&&!t}function Ld(n){if(!n.motion)return!1;let e=n.motion.loop?n.distance%n.motion.totalDistance:nt.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.find(h=>e<=h.startDistance+h.length)??n.motion.segments[n.motion.segments.length-1],i=nt.clamp((e-t.startDistance)/t.length,0,1),s=nt.lerp(t.start.x,t.end.x,i),r=nt.lerp(t.start.z,t.end.z,i),o=Math.atan2(t.end.x-t.start.x,t.end.z-t.start.z),a=s,c=r,l=o;if(n.motionRoot!==n.entityRoot){let h=s-n.baseEntityPosition.x,d=r-n.baseEntityPosition.z,f=Math.cos(n.baseEntityRotationY),p=Math.sin(n.baseEntityRotationY);a=n.baseMotionPosition.x+f*h-p*d,c=n.baseMotionPosition.z+p*h+f*d,l=n.baseMotionRotationY+o-n.baseEntityRotationY}let u=Math.abs(n.motionRoot.position.x-a)>1e-5||Math.abs(n.motionRoot.position.z-c)>1e-5;return n.motionRoot.position.x=a,n.motionRoot.position.z=c,n.motionRoot.rotation.y=l,u}function p1(n,e,t){let i=Mg(e?.motion)??n.illustrativeMotion;return i?.signature===n.motionSignature?!1:(n.motion=i,n.motionSignature=i?.signature??null,n.distance=0,n.lastMotionAt=t,i?Ld(n):(n.motionRoot.position.copy(n.baseMotionPosition),n.motionRoot.rotation.y=n.baseMotionRotationY),!0)}function m1(n){if(n?.availability!=="available")return!1;let e=String(n?.cleaning?.state??"").trim().toLowerCase();return["docked","charging","charged"].includes(e)}function g1(n){if(!n.motion){n.errorTravelRemaining=0;return}let e=n.motion.loop?n.distance%n.motion.totalDistance:nt.clamp(n.distance,0,n.motion.totalDistance),t=n.motion.segments.findIndex(o=>e<=o.startDistance+o.length),i=t<0?n.motion.segments.length-1:t,s=n.motion.segments[i],r=Math.max(0,s.startDistance+s.length-e);if(r<Math.max(li.minimumSegmentLength*4,.12)&&(n.motion.loop||i<n.motion.segments.length-1)){let o=n.motion.segments[(i+1)%n.motion.segments.length];r+=o.length}n.errorTravelRemaining=r}function x1(n,e,t){let i=n.mode!=="inactive",s=!1;if(n.motion){let l=n.lastMotionAt===null?0:nt.clamp(e-n.lastMotionAt,0,li.maximumFrameDeltaMs);n.lastMotionAt=e;let u=t?n.errorTravelRemaining:l/1e3*n.motion.speedMetersPerSecond;if(i&&l>0&&u>0){let h=u;n.mode==="error"&&(h=Math.min(h,n.errorTravelRemaining),n.errorTravelRemaining=Math.max(0,n.errorTravelRemaining-h)),(!t||n.mode==="error")&&(n.distance=n.mode==="returning"?Math.max(0,n.distance-h):n.motion.loop?(n.distance+h)%n.motion.totalDistance:Math.min(n.motion.totalDistance,n.distance+h)),s=Ld(n)}}else n.lastMotionAt=e;let r=n.mode==="returning"&&n.motion&&n.distance<=li.minimumSegmentLength,o=i&&!r;if(n.group.visible=o,!o)return{active:!1,moved:s};let a=n.mode==="error"?$T:n.mode==="returning"?YT:yg;return n.coreMaterial.color.setHex(a),n.coreMaterial.opacity=bg.coreOpacity,{active:!t&&!!n.motion&&(n.mode==="working"&&(n.motion.loop||n.distance<n.motion.totalDistance-li.minimumSegmentLength)||n.mode==="returning"&&!r||n.mode==="error"&&n.errorTravelRemaining>li.minimumSegmentLength),moved:s}}function Rg({activeFloor:n,bindings:e,entities:t,sceneRoot:i,reduceMotion:s=globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches===!0}){let r=new st;r.name="DashboardStateVisuals",Nr(r),i.add(r);let o=new Map,a=new Map,c=new Map,l=!1,u=Math.max(.15,...(n.walls??[]).map(f=>Number(f.thickness)||0));for(let f of t.values()){let p=e.get(f.id);if(!p?.deviceId||((f.visual?.assetKey==="robotVacuum"||Id(p.capability).startsWith("vacuum"))&&c.set(f.id,h1(f,f.visual?.pathMotionRoot?Cg({activeFloor:n,excludedObjectId:f.id,origin:{x:f.root.position.x,z:f.root.position.z},robotSize:f.root.userData.dimensions}):null)),!KT(p)))continue;let m=d1(n,f);if(!m)continue;if(!o.has(m.id)){let S=u1(m,u/2,r);S&&o.set(m.id,S)}let g=a.get(m.id)??new Set;g.add(p.deviceId),a.set(m.id,g)}return Object.freeze({layer:r,occupancyByRoomId:o,robotByEntityId:c,didMoveRobot:()=>l,step:(f=globalThis.performance?.now()??Date.now())=>{let p=!1;l=!1;for(let x of o.values())p=vg(x,f,s)||p;for(let x of c.values()){let m=x1(x,f,s);p=m.active||p,l=m.moved||l}return p},sync:(f,p=globalThis.performance?.now()??Date.now())=>{for(let[x,m]of c){let g=e.get(x),S=f.get(g?.deviceId),E=m.mode;m.mode=e1(S);let v=p1(m,S,p);m.mode==="error"&&(E!=="error"||v)?g1(m):m.mode!=="error"&&(m.errorTravelRemaining=0),m1(S)&&m.motion&&m.distance!==0&&(m.distance=0,Ld(m))}for(let[x,m]of o){let g=[...a.get(x)??[]].some(S=>QT(f.get(S)));m.targetOccupied!==g&&(vg(m,p,s),m.targetOccupied=g,m.startOpacity=m.currentOpacity,m.transitionStartedAt=p,m.duration=s?0:g?ln.fadeInMs:ln.fadeOutMs,s&&(m.currentOpacity=g?1:0))}}})}var Ig=Object.freeze({off:0,"30s":3e4,"60s":6e4,"120s":12e4}),nn=Object.freeze({themeMode:"auto",ambientBrightnessPercent:100,shadowsEnabled:!0,shadowIntensityPercent:100,autoBrightness:!0,indoorBrightnessInDarkness:!0,cameraLocked:!1,cameraRotationEnabled:!0,cameraZoomEnabled:!0,cameraPanEnabled:!1,showFloorSelector:!0,showQuickControls:!1,showDeviceMarkers:!0,autoReturn:"off"});function Ur(n={}){(!n||typeof n!="object")&&(n={});let e=["auto","light","dark"].includes(n.themeMode)?n.themeMode:nn.themeMode,t=typeof n.ambientBrightnessPercent=="number"?n.ambientBrightnessPercent:nn.ambientBrightnessPercent,i=Number.isFinite(t)?Math.min(Math.max(t,0),150):nn.ambientBrightnessPercent,s=typeof n.shadowIntensityPercent=="number"?n.shadowIntensityPercent:nn.shadowIntensityPercent,r=Number.isFinite(s)?Math.min(Math.max(s,0),100):nn.shadowIntensityPercent,o=typeof n.shadowsEnabled=="boolean"?n.shadowsEnabled:nn.shadowsEnabled,a=Object.prototype.hasOwnProperty.call(Ig,n.autoReturn)?n.autoReturn:nn.autoReturn;return{themeMode:e,ambientBrightnessPercent:i,ambientBrightnessFactor:i/100,shadowsEnabled:o,shadowIntensityPercent:r,shadowIntensityFactor:r/100,shadowsActive:o&&r>0,autoBrightness:typeof n.autoBrightness=="boolean"?n.autoBrightness:nn.autoBrightness,indoorBrightnessInDarkness:typeof n.indoorBrightnessInDarkness=="boolean"?n.indoorBrightnessInDarkness:nn.indoorBrightnessInDarkness,cameraLocked:typeof n.cameraLocked=="boolean"?n.cameraLocked:nn.cameraLocked,cameraRotationEnabled:typeof n.cameraRotationEnabled=="boolean"?n.cameraRotationEnabled:nn.cameraRotationEnabled,cameraZoomEnabled:typeof n.cameraZoomEnabled=="boolean"?n.cameraZoomEnabled:nn.cameraZoomEnabled,cameraPanEnabled:typeof n.cameraPanEnabled=="boolean"?n.cameraPanEnabled:nn.cameraPanEnabled,showFloorSelector:typeof n.showFloorSelector=="boolean"?n.showFloorSelector:nn.showFloorSelector,showQuickControls:typeof n.showQuickControls=="boolean"?n.showQuickControls:nn.showQuickControls,showDeviceMarkers:typeof n.showDeviceMarkers=="boolean"?n.showDeviceMarkers:nn.showDeviceMarkers,autoReturn:a,autoReturnDelayMs:Ig[a]}}var Od=Object.freeze(["scene","floor","room"]),Ln=1e-6,na=.025,_n=class extends Error{constructor(e,t){super(t),this.name="DashboardViewError",this.code=e}};function Pg(n,e){if(n==null||n==="")return null;if(typeof n!="string"||n.trim().length===0)throw new _n("invalid_view",\`\${e} must be a non-empty string.\`);return n.trim()}function ia(n={}){if(n==null&&(n={}),typeof n!="object"||Array.isArray(n))throw new _n("invalid_view","Dashboard view must be an object.");let e=n.mode??n.viewMode??"scene";if(!Od.includes(e))throw new _n("invalid_view",\`Dashboard view mode must be one of \${Od.join(", ")}.\`);let t=Pg(n.floorId,"floorId"),i=Pg(n.roomId,"roomId");if(e==="floor"&&!t)throw new _n("floor_not_selected","Floor view requires a floorId.");if(e==="room"&&!i)throw new _n("room_not_selected","Room view requires a roomId.");return Object.freeze({mode:e,...e!=="scene"&&t?{floorId:t}:{},...e==="room"?{roomId:i}:{}})}function Dg(n,e){let t=n.x-e.x,i=n.z-e.z;return t*t+i*i}function ea(n,e,t){let i=t.x-e.x,s=t.z-e.z,r=i*i+s*s;if(r<=Ln**2)return Dg(n,e);let o=Math.max(0,Math.min(1,((n.x-e.x)*i+(n.z-e.z)*s)/r));return Dg(n,{x:e.x+o*i,z:e.z+o*s})}function Zl(n,e,t){return(e.x-n.x)*(t.z-n.z)-(e.z-n.z)*(t.x-n.x)}function ta(n,e,t,i=Ln){return ea(n,e,t)<=i*i}function v1(n,e,t,i){let s=Zl(n,e,t),r=Zl(n,e,i),o=Zl(t,i,n),a=Zl(t,i,e);return(s>Ln&&r<-Ln||s<-Ln&&r>Ln)&&(o>Ln&&a<-Ln||o<-Ln&&a>Ln)?!0:ta(t,n,e)||ta(i,n,e)||ta(n,t,i)||ta(e,t,i)}function _1(n,e,t,i){return v1(n,e,t,i)?0:Math.min(ea(n,t,i),ea(e,t,i),ea(t,n,e),ea(i,n,e))}function y1(n,e,t,i){let s=i.x-t.x,r=i.z-t.z,o=Math.hypot(s,r);if(o<=Ln)return 0;let a=u=>((u.x-t.x)*s+(u.z-t.z)*r)/o,c=Math.min(a(n),a(e)),l=Math.max(a(n),a(e));return Math.max(0,Math.min(l,o)-Math.max(c,0))}function Lg(n){return n.map((e,t)=>[e,n[(t+1)%n.length]])}function Jl(n,e,t=Ln){return Lg(e).some(([i,s])=>ta(n,i,s,t))}function Kl(n,e){let t=!1;for(let i=0,s=e.length-1;i<e.length;s=i,i+=1){let r=e[i],o=e[s];r.z>n.z!=o.z>n.z&&n.x<(o.x-r.x)*(n.z-r.z)/(o.z-r.z)+r.x&&(t=!t)}return t}function Og(n,e,t=Ln){let i=n?.polygon;return!e||!Array.isArray(i)||i.length<3?!1:Jl(e,i,t)||Kl(e,i)}function Ng(n,e){if(!n?.start||!n?.end||!Array.isArray(e?.polygon))return!1;let t={x:(n.start.x+n.end.x)/2,z:(n.start.z+n.end.z)/2};if(Kl(n.start,e.polygon)&&!Jl(n.start,e.polygon)||Kl(n.end,e.polygon)&&!Jl(n.end,e.polygon)||Kl(t,e.polygon))return!0;let i=Math.max((n.thickness??0)/2+na,na),s=i*i;return Lg(e.polygon).some(([r,o])=>_1(n.start,n.end,r,o)<=s&&y1(n.start,n.end,r,o)>na)}function b1(n,e,t){let i=n.wallId?t.get(n.wallId):null,s=Math.max((i?.thickness??n.size?.depth??0)/2+na,na);return Og(e,n.position)||Jl(n.position,e.polygon,s)}function Fg(n,e){let t=n?.rooms?.find(a=>a.id===e);if(!t)throw new _n("room_not_found",\`Room \${String(e)} does not exist on floor \${String(n?.id)}.\`);let i=new Map((n.walls??[]).map(a=>[a.id,a])),s=(n.walls??[]).filter(a=>Ng(a,t)),r=new Set(s.map(a=>a.id)),o=a=>(!a.wallId||r.has(a.wallId))&&b1(a,t,i);return{...n,rooms:[t],walls:s,doors:(n.doors??[]).filter(o),windows:(n.windows??[]).filter(o),objects:(n.objects??[]).filter(a=>Ei(n,a.position)?.id===t.id)}}function M1(n,e){if(e.floorId){let i=n.floors.find(s=>s.id===e.floorId);if(!i)throw new _n("floor_not_found",\`Floor \${e.floorId} does not exist in dashboard scene \${n.sceneId}.\`);if(!i.rooms.some(s=>s.id===e.roomId))throw new _n("room_not_found",\`Room \${e.roomId} does not exist on floor \${e.floorId}.\`);return i}let t=n.floors.find(i=>i.rooms.some(s=>s.id===e.roomId));if(!t)throw new _n("room_not_found",\`Room \${e.roomId} does not exist in dashboard scene \${n.sceneId}.\`);return t}function Nd(n,e={}){if(!n||!Array.isArray(n.floors)||n.floors.length===0)throw new _n("invalid_scene","Dashboard view requires a scene with floors.");let t=ia(e);if(t.mode==="scene")return{scene:n,view:t};let i=t.mode==="room"?M1(n,t):n.floors.find(o=>o.id===t.floorId);if(!i)throw new _n("floor_not_found",\`Floor \${t.floorId} does not exist in dashboard scene \${n.sceneId}.\`);let s=Object.freeze({...t,floorId:i.id}),r=t.mode==="room"?Fg(i,t.roomId):i;return{scene:{...n,defaultFloorId:i.id,activeFloorId:i.id,floors:[r]},view:s}}function Fd(n,e){let t=ia(n);return t.mode==="scene"?e:t.mode==="floor"?\`\${e}:view:floor\`:\`\${e}:view:room:\${t.roomId}\`}var{DEVICE_COMMAND:Ug,contactState:tu,hasPowerState:S1}=Vg.default,Bg=new O(8.5,12.5,10.5).normalize(),eu=Object.freeze({outputColorSpace:Ft,toneMapping:xr,toneMappingExposure:1.05}),ra=["livingLight","patioDoor","window"];function E1(n){let e=Array.isArray(n?.providers)?n.providers:[n?.provider];return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function Bd(n,{provider:e=null,providers:t=null}={}){return n?e?n.provider===e:t?t.has(n.provider):!0:!1}function Gg(n){n.outputColorSpace=eu.outputColorSpace,n.toneMapping=eu.toneMapping,n.toneMappingExposure=eu.toneMappingExposure}function Wg(n=window.location){return["localhost","127.0.0.1"].includes(n.hostname)}function Ud(n,e=window.location){if(!Wg(e))return!1;let t=new URLSearchParams(e.search),i=t.get("toneMapping");if(i==="none")n.toneMapping=Rn;else if(i==="aces")n.toneMapping=xr;else return!1;let s=Number(t.get("exposure"));return Number.isFinite(s)&&s>0&&(n.toneMappingExposure=s),!0}function sa(n){return n?.availability==="available"&&typeof n?.power?.isOn=="boolean"}function Xg(n,e,t){let i=sa(t),s=cg(t);s.known=i,s.on=i&&t.power.isOn;let r=s.on,{bulbMaterial:o,shadeMaterial:a,emissiveMaterials:c=[o].filter(Boolean)}=n.visual,l=new We().setRGB(s.rgb.r,s.rgb.g,s.rgb.b,Ft);return c.forEach(u=>{u.color.setHex(i?wi.lampOff:wi.unavailable),u.emissive.copy(r?l:new We(0)),u.emissiveIntensity=r&&s.brightness>.001?.2+s.brightness**.72*3.25:0}),a&&(a.color.setHex(i?12819559:9145999),a.emissive.copy(r?l:new We(0)),a.emissiveIntensity=r&&s.brightness>.001?.06+s.brightness**.72*.48:0),n.visual.light.color.copy(l),n.visual.lightState=s,s}function qg(n,e,t){let i=tu(t),s=i!=="unknown",r=i==="open",{panelMaterial:o,frameMaterial:a,baseColor:c,closedAngle:l,openAngle:u,motionRoot:h=n.root,stateMaterials:d}=n.visual,f=h.rotation.y;return h.rotation.y=l+(r?u:0),Array.isArray(d)?d.forEach(({material:p,baseColor:x})=>{p.color.setHex(s?x:wi.unavailable)}):(o.color.setHex(s?c:wi.unavailable),a.color.setHex(s?wi.metal:7633276)),Math.abs(f-h.rotation.y)>1e-8}function kg(n,e,t){let i=!1;return n.kind==="light"&&n.visual?.type==="light"&&Xg(n,e,t),n.visual?.type==="contact"&&t?.contact&&(i=qg(n,e,t)),hg(n,t,globalThis.performance?.now()??Date.now()),i}function zg(n,e){return n.size===e.size&&[...n].every(t=>e.has(t))}function kd(n,e=ra){return new Map(e.map((t,i)=>[t,n[i]??null]))}function zd(n,e,t=null){return!n||t&&n.provider!==t?null:n.deviceId??e.get(n.slot)??null}function Yg(n,e,{bindingSlots:t=ra,provider:i=null,providers:s=null}={}){let r=kd(e,t),o=new Map;for(let a of n.values()){if(!a.binding)continue;let c=Bd(a.binding,{provider:i,providers:s}),l=c?zd(a.binding,r):null;if(o.set(a.id,{...a.binding,deviceId:l}),c)a.binding.slot&&!r.has(a.binding.slot)&&console.warn(\`Mikonus scene binding \${a.id} uses unknown selector slot \${a.binding.slot}.\`);else{let u=i??[...s??[]].join(", ");console.warn(\`Mikonus scene binding \${a.id} uses unsupported provider \${a.binding.provider}; the active runtime handles \${u}.\`)}}return o}function $g(n,e,{bindingSlots:t=ra,provider:i=null,providers:s=null}={}){let r=kd(e,t),o=new Set;for(let a of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of a[c]??[]){if(!Bd(l.binding,{provider:i,providers:s}))continue;let u=zd(l.binding,r);u&&o.add(u)}return o}function jg(n,e,{bindingSlots:t=ra,provider:i=null,providers:s=null}={}){let r=kd(e,t),o=[];for(let a of n?.floors??[])for(let c of["objects","doors","windows"])for(let l of a[c]??[]){if(!Bd(l.binding,{provider:i,providers:s}))continue;let u=zd(l.binding,r);u&&o.push({...l.binding,deviceId:u})}return o}function Zg(n,e,t,i){return!n||typeof n.id!="string"||!e.has(n.id)?!1:(i.set(n.id,n),t.has(n.id))}function Hg(n,e,t,i){if(!e?.deviceId||!t)return;let s=null;t.missing?s="device is missing":t.availability!=="available"?s="device is unavailable":n.kind==="light"&&!S1(t)?s="power state is missing":n.visual?.type==="contact"&&e.capability==="alarm_contact"&&!t.contact?s="contact state is missing":n.kind==="light"&&!sa(t)?s="power state is unknown":n.visual?.type==="contact"&&(t.contact||e.capability==="alarm_contact")&&tu(t)==="unknown"&&(s="contact state is unknown");let r=\`\${n.id}:\${e.deviceId}:\${s}\`;!s||i.has(r)||(i.add(r),console.warn(\`Mikonus binding \${n.id} is neutral because \${s}.\`,t))}function Ql(n,e,t,i){let s=[...e.values()].filter(h=>h.elementType==="door"||h.elementType==="window").map(h=>t.get(h.id)).filter(h=>h&&(h.capability==="alarm_contact"||i.get(h.deviceId)?.contact)),r=s.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>tu(h)!=="unknown"),o=r.filter(({state:h})=>tu(h)==="open").length,a;if(r.length===s.length&&s.length>0&&o===0)a="Alles geschlossen";else if(o>0){let h=r.length<s.length?" \\xB7 Status unvollst\\xE4ndig":"";a=\`\${o} offen\${h}\`}else s.length===0||s.every(h=>!h.deviceId)?a="Kontakte nicht zugeordnet":a="Kontaktstatus unvollst\\xE4ndig";let c=[...e.values()].filter(h=>h.kind==="light").map(h=>t.get(h.id)).filter(Boolean),l=c.map(h=>({binding:h,state:i.get(h.deviceId)})).filter(({state:h})=>sa(h)),u="Licht nicht zugeordnet";if(l.length>0){let h=l.filter(({state:d})=>d.power.isOn).length;u=\`\${h} \${h===1?"Licht":"Lichter"} an\`,l.length<c.length&&(u+=" \\xB7 Status unvollst\\xE4ndig")}else c.some(h=>h.deviceId)&&(u="Lichtstatus unbekannt");n.textContent=\`\${a} \\xB7 \${u}\`}function w1(n,{sceneLoad:e=!1}={}){console.error(e?"Mikonus dashboard scene could not be loaded":"Mikonus 3D initialization failed",n);let t=document.getElementById("error");if(!t)return;let i=t.querySelector("strong"),s=t.querySelector("span");e&&(i&&(i.textContent="Mikonus 3D"),s&&(s.textContent="Scene could not be loaded.")),t.hidden=!1}async function Hd({container:n,sceneSource:e,deviceRuntime:t,host:i,options:s={},signal:r=s.signal}){let o=new xa(r),a=()=>o.dispose();o.defer(()=>t?.dispose?.());try{if(o.check(),window.addEventListener("pagehide",a,{once:!0}),o.defer(()=>window.removeEventListener("pagehide",a)),typeof e?.loadScene!="function")throw new TypeError("Dashboard viewer requires a SceneSource with loadScene().");if(typeof t?.loadStates!="function"||typeof t?.subscribe!="function"||typeof t?.execute!="function")throw new TypeError("Dashboard viewer requires a DeviceRuntime.");if(!i||typeof i.getSettings!="function"||typeof i.readTheme!="function")throw new TypeError("Dashboard viewer requires a HostAdapter.");let c=E1(t);if(c.length===0)throw new TypeError("Dashboard DeviceRuntime requires at least one provider id.");let l=s.summaryElement??document.getElementById("floor-summary"),u=s.floorLabel??document.getElementById("floor-label"),h=s.floorSelectorElement??document.getElementById("floor-selector"),d=s.statusHeader??document.querySelector(".status-header"),f=s.sceneShell??n?.closest(".scene-shell");if(!n||!l||!u||!h||!d||!f)throw new Error("Widget container is missing.");let p=(R,Y)=>i.translate?.(R,Y)??Y,x=typeof s.now=="function"?s.now:()=>new Date,m=ia(s.view),g=Number(s.modelNorthDegrees),S=Number.isFinite(g)?g:0,E=i.readSolar?.()??null,v=Ur(i.getSettings()),w=Ko(s.timeOfDay),b=Gl({mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,...i.readTheme()}),A=wd({width:f.clientWidth,height:f.clientHeight,devicePixelRatio:window.devicePixelRatio});Td(A,{rootElement:document.documentElement,shellElement:f}),f.classList.toggle("camera-locked",v.cameraLocked);let _=xu({container:n,sceneShell:f,statusHeader:d,summaryElement:l});o.defer(()=>_.dispose()),_.setEnvironment(b);let T=async(R={})=>{let Y=await o.wait(e.loadScene({...R,signal:o.signal}));o.check();let J=uf(Y),re=Nd(J.scene,m);return{...J,scene:re.scene,view:re.view}},I;try{I=await T(),o.check()}catch(R){throw R.dashboardSceneLoad=!0,R}let P=Number(I.scene?.metadata?.modelNorthDegrees);Number.isFinite(P)&&(S=P),b=Gl({mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,...i.readTheme()}),_.setEnvironment(b);let D=new bl({alpha:!0,antialias:!0,powerPreference:"high-performance"});o.defer(()=>D.forceContextLoss()),o.defer(()=>D.dispose()),o.defer(()=>D.domElement.remove()),D.domElement.classList.add("mikonus-renderer-canvas"),D.setClearColor(0,0),Gg(D),Wl(b,{renderer:D,rootElement:document.documentElement});let H=Ud(D,i.location??window.location);s.onEnvironmentChange?.(b),o.check(),Jm(D),nd(D,v.shadowsActive),D.setPixelRatio(A.renderPixelRatio),D.domElement.setAttribute("aria-label",p("deviceDetails.sceneLabel","Rotate and zoom the Mikonus floor; tap a light or hold a device for details")),D.domElement.setAttribute("tabindex","0"),n.appendChild(D.domElement);let F=I.view.mode==="room"?new $i(-1,1,1,-1,.1,100):new Qt(Us,1,.1,100);F.position.set(8.5,12.5,10.5),document.documentElement.dataset.dashboardViewMode=I.view.mode,document.documentElement.dataset.dashboardCameraProjection=F.isOrthographicCamera?"orthographic":"perspective";let L=new wl(F,D.domElement);o.defer(()=>L.dispose());let $=Bl(D.domElement);o.defer($),L.target.set(0,.55,0),L.enableDamping=!1,L.enablePan=v.cameraPanEnabled,L.enableRotate=v.cameraRotationEnabled,L.enableZoom=v.cameraZoomEnabled,L.rotateSpeed=.65,L.zoomSpeed=.8,L.minDistance=5,L.maxDistance=100,L.minZoom=.55,L.maxZoom=4,L.minPolarAngle=nt.degToRad(18),L.maxPolarAngle=1.28,L.zoomToCursor=!0,L.enabled=!v.cameraLocked,L.update();let q=i.getSelectedDeviceIds?.()??[],z={bindingSlots:i.bindingSlots??ra,providers:new Set(c)},K=new Map,ce=new Set,V=null,te=null,Me=null,Ye=I.view,$e=new Set,ee=null,pe=null,le=null,Ie=null,ke=0,Ue=!1,ct=!1,ze=!1,se=!1,ue=!0,he=()=>{},Ee=()=>{f.classList.toggle("camera-locked",v.cameraLocked),L.enabled=!ct&&!v.cameraLocked,L.enableRotate=!v.cameraLocked&&v.cameraRotationEnabled,L.enableZoom=!v.cameraLocked&&v.cameraZoomEnabled,L.enablePan=!v.cameraLocked&&v.cameraPanEnabled};o.defer(()=>{ke&&window.cancelAnimationFrame(ke),te?.dispose(),te=null,V=null,Me=null,$e.clear(),K.clear()});let fe=()=>{o.disposed||ke||!V||(ke=window.requestAnimationFrame(R=>{if(ke=0,V){let Y=dg(V.entities,R),J=V.stateVisuals?.step(R)===!0;Y&&(ue=!0),V.stateVisuals?.didMoveRobot()===!0&&v.shadowsActive&&(ue=!0),ue&&(D.shadowMap.needsUpdate=!0),D.render(V.scene,F);let re=le?.layout(F,D.domElement)??[];pe?.layout(F,D.domElement,re),ue=!1,(Y||J)&&fe()}}))},Oe=R=>{ue=!0,V&&(V.shadowInvalidationReasons??=new Set,V.shadowInvalidationReasons.add(R)),fe()},Pe=R=>{H&&Ud(D),_.setEnvironment(R),s.onEnvironmentChange?.(R),Oe("environmentChanged")},Xe=R=>(o.disposed||(w=Ko(R),b=Jo(b,i.readTheme(),{mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,renderer:D,rootElement:document.documentElement,runtimes:te?.cachedRuntimes??[],afterApply:Pe,requestRender:fe})),b),je=()=>{if(o.disposed)return!1;let R=wd({width:f.clientWidth,height:f.clientHeight,devicePixelRatio:window.devicePixelRatio}),Y=!og(A,R);return A=R,Y&&Td(A,{rootElement:document.documentElement,shellElement:f}),Ie?.layout(Xl(A,d.clientWidth)),Y},N=R=>{o.disposed||(b=Jo(b,R,{mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,renderer:D,rootElement:document.documentElement,runtimes:te?.cachedRuntimes??[],afterApply:Pe,requestRender:fe}))};he=i.subscribeTheme?.(N)??(()=>{}),o.defer(he);let dt=(R=i.readSolar?.()??null)=>{o.disposed||(E=R,b=Jo(b,i.readTheme(),{mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,renderer:D,rootElement:document.documentElement,runtimes:te?.cachedRuntimes??[],afterApply:Pe,requestRender:fe}))},tt=i.subscribeSolar?.(dt)??(()=>{});o.defer(tt);let C=window.setInterval(()=>dt(),6e4);o.defer(()=>window.clearInterval(C)),o.check();let y=()=>{if(!V?.cameraFit)return;let R=L.target.distanceTo(V.cameraFit.target);md(F,L.target,V.cameraFit.radius+R),rs(F,V.architectureCenterPoints)},k=(R,Y=Ye)=>Y?.mode!=="scene"?Y?.floorId??null:R.schemaVersion!==2?null:i.readFloor?.(R.sceneId)??null,X=(R,Y,J=Ye)=>{J?.mode==="scene"&&R.schemaVersion===2&&i.writeFloor?.(R.sceneId,Y)},Q=(R=V?.floorId,Y=Ye)=>R?Fd(Y,R):null,me=()=>{!Me?.sceneId||!V?.floorId||i.writeCamera?.(Me.sceneId,Q(),{position:F.position.toArray(),target:L.target.toArray(),fov:F.isPerspectiveCamera?F.fov:Us,zoom:F.zoom,minDistance:L.minDistance,maxDistance:L.maxDistance,userAdjustedView:se})},xe=()=>{!Me?.sceneId||!V?.floorId||i.removeCamera?.(Me.sceneId,Q())},j=new Dl({camera:F,controls:L,delayMs:v.autoReturnDelayMs,isBlocked:()=>v.cameraLocked,requestRender:fe,updateClipping:y,onComplete:()=>{se=!1,xe(),fe()}});o.defer(()=>j.dispose());let ie=()=>{if(!V)return;let R=Math.max(n.clientWidth,1),Y=Math.max(n.clientHeight,1),J=R/Y,re=F.isOrthographicCamera?y0(F,V.architectureFitPoints,V.sceneBoundsPoints,J,Bg,{padding:1.16}):b0(F,V.architectureFitPoints,V.sceneBoundsPoints,J,Bg,{centeringPoints:V.architectureCenterPoints,targetPoints:V.architectureCenterPoints,allowQuarterTurn:!1});re&&(V.cameraFit={distance:re.distance,radius:re.radius,target:re.target.clone()},L.target.copy(re.target),L.minDistance=re.minDistance??Math.max(2,re.radius*1.05),L.maxDistance=re.maxDistance??Math.max(re.distance*2.5,8),L.update(),j.setHomeView({position:F.position,target:L.target})),fe()},_e=(R,Y)=>{se=!1,ie();let J=i.readCamera?.(R?.sceneId,Q(Y));return J?(F.position.fromArray(J.position),F.isPerspectiveCamera&&(F.fov=J.fov),F.zoom=J.zoom,L.target.fromArray(J.target),L.minDistance=J.minDistance,L.maxDistance=J.maxDistance,F.lookAt(L.target),L.update(),se=J.userAdjustedView,y(),se&&j.schedule(),fe(),!0):!1},Ne=()=>{if(o.disposed)return;je();let R=Math.max(n.clientWidth,1),Y=Math.max(n.clientHeight,1);if(D.setPixelRatio(A.renderPixelRatio),D.setSize(R,Y,!1),V&&!se)ie();else if(V){let J=F.isOrthographicCamera?S0(F,R/Y,{worldPoints:V.architectureFitPoints,target:L.target}):M0(F,R/Y,{worldPoints:V.architectureFitPoints,centeringPoints:V.architectureCenterPoints,target:L.target});J.expandedForClipping&&Number.isFinite(J.distance)&&(L.maxDistance=Math.max(L.maxDistance,J.distance*1.05),L.update()),fe()}},Se=()=>{Ue=!0,ze=!1},ye=()=>{Ue&&(ze||j.cancel(),ze=!0,se=!0),y(),fe()},Be=()=>{Ue=!1,ze&&(me(),j.schedule()),ze=!1};o.defer(()=>{L.removeEventListener("start",Se),L.removeEventListener("change",ye),L.removeEventListener("end",Be)}),L.addEventListener("start",Se),L.addEventListener("change",ye),L.addEventListener("end",Be);let He=new ResizeObserver(Ne);o.defer(()=>He.disconnect()),He.observe(n);let Ke=({scene:R,metadata:Y},J)=>{let re=g0({...R,activeFloorId:J});try{id(re.lighting,v.ambientBrightnessFactor),Wl(b,{runtimes:[re]}),sd(re.lighting,re.entities,v.shadowIntensityFactor);let ae=Wo(re.sceneRoot),Ae=Wo(re.sceneRoot,re.entities),qe=Ae.map(vt=>vt.clone()),Te=Yg(re.entities,q,z),lt=new Set([...Te.values()].map(vt=>vt.deviceId).filter(Boolean)),bt=Rg({activeFloor:re.activeFloor,bindings:Te,entities:re.entities,sceneRoot:re.sceneRoot});return{...re,description:R,floorId:J,bindings:Te,metadata:Y,architectureCenterPoints:ae,architectureFitPoints:Ae,sceneBoundsPoints:qe,stateVisuals:bt,runtimeDeviceIds:lt,warnedBindings:new Set}}catch(ae){throw Pl(re.scene),ae}},U=R=>{let Y=R.activeSmartLights??new Set,J=!1;for(let re of R.entities.values()){let ae=R.bindings.get(re.id),Ae=K.get(ae?.deviceId);ae&&Hg(re,ae,Ae,R.warnedBindings),J=kg(re,ae,Ae)||J}return J&&(R.architectureCenterPoints=Wo(R.sceneRoot)),R.activeSmartLights=od(R.entities),R.stateVisuals.sync(K),Il(R.lighting,R.entities,v.shadowsActive),Ql(l,R.entities,R.bindings,K),{contactGeometryChanged:J,lightShadowSelectionChanged:!zg(Y,R.activeSmartLights)}},ge=(R=V)=>{R&&(pe?.sync({entities:R.entities,bindings:R.bindings,statesByDeviceId:K}),pe?.setEnabled(v.showDeviceMarkers),le?.sync({enabled:v.showQuickControls&&!ct,entities:R.entities,bindings:R.bindings,statesByDeviceId:K}))},ne=()=>{let R=f.getBoundingClientRect(),Y=d.getBoundingClientRect(),J=Math.max(0,Math.ceil(Y.bottom-R.top+4));f.style.setProperty("--scene-header-height",\`\${J}px\`)},ve=(R,Y=Ye)=>(Y?.mode==="room"?R?.activeFloor?.rooms?.[0]?.name??R?.activeFloor?.name:R?.activeFloor?.name)??"\\u2013",be=(R=Me,Y=V?.floorId)=>{let J=v.showFloorSelector&&Ye?.mode==="scene"&&R?.schemaVersion===2&&R.floors.length>1;u.hidden=J,Ie?.update({floors:J?R.floors:[],activeFloorId:Y,availableWidth:Xl(A,d.clientWidth)}),ne()},oe=()=>({position:F.position.clone(),quaternion:F.quaternion.clone(),aspect:F.aspect,fov:F.fov,zoom:F.zoom,near:F.near,far:F.far,orthographic:F.isOrthographicCamera?{left:F.left,right:F.right,top:F.top,bottom:F.bottom}:null,target:L.target.clone(),minDistance:L.minDistance,maxDistance:L.maxDistance,cameraFit:V?.cameraFit,homeView:j.homeView&&{position:j.homeView.position.clone(),target:j.homeView.target.clone()},userAdjustedView:se}),De=(R,Y)=>{F.position.copy(R.position),F.quaternion.copy(R.quaternion),F.isPerspectiveCamera&&(F.aspect=R.aspect,F.fov=R.fov),F.zoom=R.zoom,F.near=R.near,F.far=R.far,F.isOrthographicCamera&&R.orthographic&&(F.left=R.orthographic.left,F.right=R.orthographic.right,F.top=R.orthographic.top,F.bottom=R.orthographic.bottom),F.updateProjectionMatrix(),L.target.copy(R.target),L.minDistance=R.minDistance,L.maxDistance=R.maxDistance,Y&&(Y.cameraFit=R.cameraFit),R.homeView?j.setHomeView(R.homeView):j.homeView=null,se=R.userAdjustedView},Re=(R,{sceneUpdate:Y=!1}={})=>{o.check(),ee?.close(),j.cancel(),me(),o.check();let J=Number(R.scene?.metadata?.modelNorthDegrees),re=Number.isFinite(J)?J:Number.isFinite(g)?g:0;re!==S&&(S=re,dt(E));let ae,Ae;try{ae=new Ll({description:R.scene,initialFloorId:Y?T0(R.scene,Me?.sceneId,V?.floorId):k(R.scene,R.view),createRuntime:Ct=>Ke(R,Ct),disposeRuntime:Ct=>Pl(Ct.scene)}),Ae=ae.activate().runtime,U(Ae)}catch(Ct){throw ae?.dispose(),Ct}let qe=te,Te=V,lt=Me,bt=Ye,vt=$e,xt=oe();te=ae,V=Ae,Me=R.scene,Ye=R.view,$e=$g(R.scene,q,z);try{t.configureBindings?.(jg(R.scene,q,z)),o.check(),Oe("sceneChanged"),u.textContent=ve(Ae,R.view),be(R.scene,Ae.floorId),_e(R.scene,Ae.floorId),ge(Ae),X(R.scene,Ae.floorId),o.check()}catch(Ct){throw o.disposed?(qe?.dispose(),ae.dispose(),te=null,V=null,o.signal.reason):(te=qe,V=Te,Me=lt,Ye=bt,$e=vt,De(xt,Te),u.textContent=ve(Te,bt),Te&&Ql(l,Te.entities,Te.bindings,K),ge(Te),be(lt,Te?.floorId),ae.dispose(),fe(),Ct)}return qe?.dispose(),Ae},At=R=>{if(o.disposed||!V||!Zg(R,$e,V.runtimeDeviceIds,K))return;let J=V.activeSmartLights??new Set,re=!1;for(let ae of V.entities.values()){let Ae=V.bindings.get(ae.id);Ae?.deviceId===R.id&&(Hg(ae,Ae,R,V.warnedBindings),re=kg(ae,Ae,R)||re)}re&&(V.architectureCenterPoints=Wo(V.sceneRoot),rs(F,V.architectureCenterPoints)),V.activeSmartLights=od(V.entities),V.stateVisuals.sync(K),Il(V.lighting,V.entities,v.shadowsActive),Ql(l,V.entities,V.bindings,K),ee?.updateState(R.id,R),ge(),re?Oe("contactGeometryChanged"):zg(J,V.activeSmartLights)||Oe("lightStateChanged"),fe()},pt=async R=>{o.check();let Y=[...R.runtimeDeviceIds];if(Y.length!==0)try{let J=await o.wait(t.loadStates(Y,{signal:o.signal}));if(o.check(),V!==R||!Array.isArray(J))return;J.forEach(ae=>{ae&&typeof ae.id=="string"&&K.set(ae.id,ae)});let re=U(R);ge(R),re.contactGeometryChanged?(rs(F,R.architectureCenterPoints),Oe("contactGeometryChanged")):re.lightShadowSelectionChanged&&Oe("lightStateChanged"),fe()}catch(J){if(o.disposed)throw o.signal.reason;console.warn("Could not load the configured dashboard device states.",J)}},On=async R=>{if(o.disposed||!te||!Me)return null;if(R===te.activeFloorId)return be(Me,R),V;ee?.close(),j.cancel(),me(),o.check();let Y=V,J=te.activeFloorId,re=oe(),ae;try{ae=te.activate(R).runtime,U(ae),V=ae,Oe("floorChanged"),u.textContent=ve(ae),be(Me,R),_e(Me,R),ge(ae),X(Me,R),o.check()}catch(Ae){throw o.disposed?o.signal.reason:(J&&te.activate(J),V=Y,De(re,Y),u.textContent=ve(Y),Y&&Ql(l,Y.entities,Y.bindings,K),ge(Y),be(Me,J),fe(),Ae)}return await pt(ae),ae},un=Promise.resolve(),su=async R=>{if(o.disposed||typeof R?.revision=="string"&&R.revision===V?.metadata?.revision)return;let Y=await T({allowFallback:!1});if(o.check(),Y.metadata.revision===V?.metadata?.revision)return;let J=Re(Y,{sceneUpdate:!0});await pt(J)},ru=R=>{un=un.then(()=>su(R)).catch(Y=>{o.disposed||console.error("Runtime dashboard scene reload failed; keeping the current scene.",Y)})},la=R=>{un=un.then(()=>On(R)).catch(Y=>{o.disposed||(console.error("Floor switch failed; keeping the current floor.",Y),be())})};Ie=new Nl({host:h,translate:p,onSelect:la}),o.defer(()=>Ie.dispose());let zs=new ResizeObserver(()=>{o.disposed||(Ie?.layout(Xl(A,d.clientWidth)),ne())});o.defer(()=>zs.disconnect()),zs.observe(d),ne();let ou=t.subscribe(At);o.defer(ou),o.check();let ua=e.subscribe?.(ru)??(()=>{});o.defer(ua),o.check();let ha=new Cs,ui=new de,fn=null,Zn=null,da=()=>{let R=fn?[...fn.activePointers.keys()]:[];fn?.reset(),Zn=null;for(let Y of R)try{D.domElement.hasPointerCapture?.(Y)&&D.domElement.releasePointerCapture(Y)}catch{}},Ri=async(R,Y,{directLightTap:J=!1}={})=>{if(o.disposed)return;let re=V?.entities.get(R),ae=V?.bindings.get(R),Ae=K.get(ae?.deviceId),qe=!!(re&&ae?.deviceId);if(!(J?qe&&re.kind==="light"&&sa(Ae)&&Y.type===Ug.SET_POWER:qe&&Ai(Ae,Y))){console.warn(\`The 3D object \${R} cannot execute \${Y.type} because its state or control is unavailable.\`);return}if(!ce.has(ae.deviceId)){ce.add(ae.deviceId),ee?.setBusy(ae.deviceId,!0),le?.setDeviceBusy(ae.deviceId,!0),i.feedback?.();try{await t.execute(ae.deviceId,Y,ae)}catch(lt){console.warn(\`Could not execute \${Y.type} for \${R}.\`,lt)}finally{if(o.disposed)return;ce.delete(ae.deviceId),ee?.setBusy(ae.deviceId,!1),le?.setDeviceBusy(ae.deviceId,!1)}}},Br=R=>{let Y=V?.bindings.get(R),J=K.get(Y?.deviceId);sa(J)&&Ri(R,{type:Ug.SET_POWER,value:!J.power.isOn},{directLightTap:!0})},Ii=new Yo({host:_.popupHost,onCommand:Ri,translate:p,createIcon:i.createDeviceIcon?.bind(i)});o.defer(()=>Ii.dispose());let fa=s.createDeviceDetailsAdapter?.({overlay:Ii})??new $o({overlay:Ii});ee=new Ul({adapters:Object.fromEntries(c.map(R=>[R,fa])),onOpenChange:R=>{ct=R,R&&da(),f.classList.toggle("device-details-open",R),pe?.setSuppressed(R),Ee(),ge(),R?j.cancel():fe()}}),o.defer(()=>ee.dispose()),o.check();let kr=(R,Y,J)=>U0({camera:F,canvas:D.domElement,clientX:R,clientY:Y,pickables:J,pointer:ui,raycaster:ha,scene:V?.scene}),zr=R=>{if(o.disposed)return!1;let Y=V?.bindings.get(R),J=k0({entityId:R,binding:Y,state:K.get(Y?.deviceId)});return!J||!ee?.open(J)?!1:(i.feedback?.(),!0)};le=new Xo({host:_.markerHost,onCommand:Ri,translate:p}),o.defer(()=>le.dispose()),pe=new Zo({host:_.markerHost,onOpenDetails:zr,onTogglePower:Br,translate:p,createIcon:i.createDeviceIcon?.bind(i)}),o.defer(()=>pe.dispose()),fn=new Rr({onLongPress:({clientX:R,clientY:Y})=>{let J=kr(R,Y,V?.devicePickables??[]);return!J||(Zn&&(De(Zn,V),Zn=null,ze=!1,Ue=!1,y(),fe()),!zr(J.sceneObjectId))?!1:(window.getSelection?.()?.removeAllRanges(),!0)}}),o.defer(()=>fn.dispose());let pa=R=>{R.cancelable&&R.preventDefault(),fn.activePointers.size===0&&(Zn=oe()),fn.pointerDown(R)},ma=R=>{fn.pointerMove(R)},ga=R=>{let Y=fn.pointerUp(R);if(Zn=null,!Y)return;let J=kr(Y.clientX,Y.clientY,V?.pickables??[]);J&&Br(J.sceneObjectId)},M=R=>{fn.pointerCancel(R),Zn=null},B=R=>R.preventDefault();o.defer(()=>{D.domElement.removeEventListener("pointerdown",pa,!0),D.domElement.removeEventListener("pointermove",ma,!0),D.domElement.removeEventListener("pointerup",ga,!0),D.domElement.removeEventListener("pointercancel",M,!0),D.domElement.removeEventListener("lostpointercapture",M,!0),D.domElement.removeEventListener("contextmenu",B)}),D.domElement.addEventListener("pointerdown",pa,!0),D.domElement.addEventListener("pointermove",ma,!0),D.domElement.addEventListener("pointerup",ga,!0),D.domElement.addEventListener("pointercancel",M,!0),D.domElement.addEventListener("lostpointercapture",M,!0),D.domElement.addEventListener("contextmenu",B);let Z=R=>{if(o.disposed)return v;let Y=v,J=Ur(R);if(JSON.stringify(Y)===JSON.stringify(J))return v;v=J,Ee(),j.delayMs=v.autoReturnDelayMs,v.cameraLocked||v.autoReturnDelayMs<=0?j.cancel():se&&j.schedule();let re=te?.cachedRuntimes??[];b=Jo(b,i.readTheme(),{mode:v.themeMode,timeOfDay:w,autoBrightness:v.autoBrightness,indoorBrightnessInDarkness:v.indoorBrightnessInDarkness,at:x(),solarPosition:E,modelNorthDegrees:S,renderer:D,rootElement:document.documentElement,runtimes:re,afterApply:Pe,requestRender:fe});for(let ae of re)id(ae.lighting,v.ambientBrightnessFactor),sd(ae.lighting,ae.entities,v.shadowIntensityFactor),Il(ae.lighting,ae.entities,v.shadowsActive);return nd(D,v.shadowsActive),be(),ge(),v.shadowsActive&&(!Y.shadowsActive||Y.shadowIntensityPercent!==v.shadowIntensityPercent)?Oe("settingsChanged"):fe(),v},G=Re(I);Ne(),await pt(G),o.check();let W=i.getInitialDetailsDeviceId?.();if(W){let R=[...G.bindings].find(([,Y])=>Y.deviceId===W);R&&zr(R[0])}return Object.freeze({dispose:a,destroy:a,getEnvironment:()=>b,getSettings:()=>v,getView:()=>Ye,getCameraProjection:()=>F.isOrthographicCamera?"orthographic":"perspective",requestRender:fe,updateSettings:Z,setTimeOfDay:Xe})}catch(c){throw a(),c.name!=="AbortError"&&w1(c,{sceneLoad:c.dashboardSceneLoad===!0}),c}}var T1="mikonus.camera-view-v2";function Vd(n,e,t){return[T1,typeof t=="string"&&t?t:"default",n,e].map(s=>encodeURIComponent(String(s))).join(":")}function Kg(n){return Array.isArray(n)&&n.length===3&&n.every(Number.isFinite)}function Jg(n){return!n||typeof n!="object"||!Kg(n.position)||!Kg(n.target)||!Number.isFinite(n.fov)||n.fov<=0||n.fov>=180||!Number.isFinite(n.zoom)||n.zoom<=0||!Number.isFinite(n.minDistance)||n.minDistance<=0||!Number.isFinite(n.maxDistance)||n.maxDistance<n.minDistance?null:{position:[...n.position],target:[...n.target],fov:n.fov,zoom:n.zoom,minDistance:n.minDistance,maxDistance:n.maxDistance,userAdjustedView:n.userAdjustedView===!0}}var oa=class{constructor({storage:e,widgetInstanceId:t}){this.storage=e,this.widgetInstanceId=t}read(e,t){try{let i=this.storage?.getItem(Vd(e,t,this.widgetInstanceId));return i?Jg(JSON.parse(i)):null}catch(i){return console.debug("Could not read the preserved floor camera view.",i),null}}write(e,t,i){let s=Jg(i);if(!s)return!1;try{return this.storage?.setItem(Vd(e,t,this.widgetInstanceId),JSON.stringify(s)),!0}catch(r){return console.debug("Could not preserve the floor camera view.",r),!1}}remove(e,t){try{this.storage?.removeItem(Vd(e,t,this.widgetInstanceId))}catch(i){console.debug("Could not clear the preserved floor camera view.",i)}}};function Gd(n){if(typeof n!="function")return"light";try{return n("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"light"}}var nu=class{constructor(){this.values=new Map}getItem(e){return this.values.get(e)??null}setItem(e,t){this.values.set(e,String(t))}removeItem(e){this.values.delete(e)}},aa=class{constructor({settings:e={},translations:t={},initialDetailsDeviceId:i=null,instanceId:s="browser-host",createDeviceIcon:r=null,windowObject:o=window,storage:a=new nu}={}){this.window=o,this.location=o.location,this.settings=Ur(e),this.translations=t,this.initialDetailsDeviceId=i,this.deviceIconFactory=typeof r=="function"?r:null,this.storage=a,this.cameraViewStore=new oa({storage:a,widgetInstanceId:s}),this.instanceId=s}translate(e,t){return this.translations[e]??t}getSettings(){return this.settings}getSelectedDeviceIds(){return[]}getInitialDetailsDeviceId(){return this.initialDetailsDeviceId}createDeviceIcon(e){return this.deviceIconFactory?.(e)??null}readTheme(){return{hostTheme:null,systemTheme:Gd(this.window.matchMedia?.bind(this.window))}}subscribeTheme(e){let t=this.window.matchMedia?.("(prefers-color-scheme: dark)"),i=()=>e(this.readTheme());return typeof t?.addEventListener=="function"?t.addEventListener("change",i):t?.addListener?.(i),i(),()=>{typeof t?.removeEventListener=="function"?t.removeEventListener("change",i):t?.removeListener?.(i)}}readSolar(){return null}subscribeSolar(){return()=>{}}feedback(){}readFloor(e){return this.storage.getItem(Ol(e,this.instanceId))}writeFloor(e,t){this.storage.setItem(Ol(e,this.instanceId),t)}readCamera(e,t){return this.cameraViewStore.read(e,t)}writeCamera(e,t,i){return this.cameraViewStore.write(e,t,i)}removeCamera(e,t){this.cameraViewStore.remove(e,t)}};var Qg=zn(os()),{DEVICE_COMMAND:ZI}=Qg.default;var Wd=zn(fu()),ca=class{constructor({url:e,transformScene:t=s=>s,load:i=Wd.default.loadDashboardScene}){this.url=e,this.transformScene=t,this.load=i}async loadScene({signal:e}={}){e?.throwIfAborted();let t=await this.load(this.url,{signal:e});e?.throwIfAborted();let i=this.transformScene(t),{activeFloorId:s,...r}=i,o=Wd.default.validateDashboardScene(r);return{scene:o,metadata:{schemaVersion:o.schemaVersion,sceneId:o.sceneId,revision:\`\${o.sceneId}:static\`,source:"static"}}}subscribe(){return()=>{}}};var ex=zn(os()),sP=ex.default.DEVICE_COMMAND;var iu=class extends aa{constructor({themeSource:e,solarSource:t,iconSource:i,...s}){super(s),this.themeSource=e,this.solarSource=t,this.iconSource=i}readTheme(){return{...super.readTheme(),hostTheme:this.themeSource?.read()??null}}subscribeTheme(e){let t=()=>e(this.readTheme()),i=this.themeSource?.subscribe(t)??(()=>{}),s=super.subscribeTheme(t);return()=>{i(),s()}}readSolar(){return this.solarSource?.read()??null}subscribeSolar(e){return this.solarSource?.subscribe(e)??(()=>{})}createDeviceIcon(e){return this.iconSource?.create(e)??null}};document.addEventListener("mikonus-connect",async n=>{let{runtime:e,scene:t,sceneSource:i,themeSource:s,solarSource:r,iconSource:o,storage:a,presentationSettings:c,view:l,signal:u,initializeRuntime:h,onReady:d,onError:f}=n.detail;try{h(Ai);let p=!0,x=i?{async loadScene(g){let S=await(p?i.waitUntilReady(g):i.loadScene(g));return p=!1,S},subscribe:g=>i.subscribe(g)}:new ca({url:"reference",load:async()=>t}),m=await Hd({container:document.getElementById("viewport"),sceneSource:x,deviceRuntime:e,host:new iu({instanceId:"ha-card",storage:a,themeSource:s,solarSource:r,iconSource:o,settings:c}),signal:u,options:{timeOfDay:"auto",sceneShell:document.getElementById("shell"),statusHeader:document.getElementById("header"),summaryElement:document.getElementById("summary"),floorLabel:document.getElementById("floor-label"),floorSelectorElement:document.getElementById("floor-selector"),view:l}});d(m)}catch(p){f(p)}},{once:!0});window.frameElement.dispatchEvent(new CustomEvent("mikonus-frame-ready"));})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
`;var tt=`<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;font:14px system-ui,sans-serif;color:#222;background:transparent}
#shell{position:relative;display:flex;flex-direction:column;width:100%;height:100%}
#header{position:absolute;inset:0 0 auto;z-index:4;background:transparent;pointer-events:none;box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:12px;min-height:56px}
#header>*{pointer-events:auto}
#viewport{position:relative;flex:1;width:100%;min-height:180px;overflow:hidden}
#viewport canvas{display:block;width:100%;height:100%}
#summary{color:var(--dashboard-scene-text-secondary,var(--dashboard-ui-text-primary));flex:0 0 auto;margin:0;padding:4px 12px}button,select,input{font:inherit}button,select{min-height:44px}
[hidden]{display:none!important}#error{padding:12px}
</style></head><body><main id="shell"><header id="header"><span id="floor-label"></span><div id="floor-selector"></div></header><div id="viewport"></div><p id="summary"></p></main><p id="error" hidden></p></body></html>`;function Re({container:t,runtime:e,scene:i,sceneSource:n,themeSource:r,solarSource:a,iconSource:o,storage:s,presentationSettings:l,view:c,onReady:p,onError:d}){let u=document.createElement("iframe");u.title="Mikonus 3D Dashboard",u.style.cssText="display:block;width:100%;height:100%;border:0";let h=null,m=!1,b=l,_=new AbortController,y=URL.createObjectURL(new Blob([Ce],{type:"text/javascript"})),E=()=>{if(!m){m=!0,_.abort(),u.removeEventListener("mikonus-frame-ready",te),u.removeEventListener("load",ie);try{h?.dispose()}finally{h=null,e.dispose(),u.remove(),URL.revokeObjectURL(y)}}},R=g=>{m||(E(),d(g))},te=()=>{if(!m)try{u.contentDocument.dispatchEvent(new u.contentWindow.CustomEvent("mikonus-connect",{detail:{runtime:e,scene:i,sceneSource:n,themeSource:r,solarSource:a,iconSource:o,storage:s,presentationSettings:b,view:c,signal:_.signal,initializeRuntime:g=>e.configureCommandSupport(g),onReady:g=>{if(URL.revokeObjectURL(y),m){g.dispose();return}h=g,h.updateSettings?.(b),p()},onError:R}}))}catch(g){R(g)}},ie=()=>{if(!m)try{let g=u.contentDocument.createElement("script");g.src=y,g.onerror=()=>R(new Error("Renderer script could not be loaded. Check the browser content policy.")),u.contentDocument.body.append(g)}catch(g){R(g)}};return u.addEventListener("load",ie,{once:!0}),u.addEventListener("mikonus-frame-ready",te,{once:!0}),u.srcdoc=tt,t.append(u),{dispose:E,updateSettings(g){b=g,h?.updateSettings?.(g)}}}document.querySelector("home-assistant")&&await customElements.whenDefined("home-assistant");var G="mikonus-3d-card",Pe="mikonus-3d-card-editor";customElements.get(Pe)||customElements.define(Pe,Ae());customElements.get(G)||customElements.define(G,Me(Re));window.customCards??=[];window.customCards.some(t=>t.type===G)||window.customCards.push({type:G,name:"Mikonus 3D",preview:!1,description:"Mikonus Dashboard Scene v2 mit Home Assistant Ger\xE4ten."});
