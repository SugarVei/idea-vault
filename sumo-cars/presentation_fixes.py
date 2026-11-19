"""Keep the view stable during contact, falls, and match transitions."""


def update_transitions(text, replace):
    text = replace(text, '''/* ------------------------------------------------------------ 转场：短暂压暗 */
#wipe{position:absolute;inset:0;pointer-events:none;background:var(--bg);opacity:0;z-index:9}
#wipe.go{animation:wipe .8s ease}
@keyframes wipe{0%{opacity:0}30%{opacity:1}55%{opacity:1}100%{opacity:0}}

''', '')
    text = replace(text, '\n  <div id="wipe"></div>', '')
    text = replace(text, '  F();\n  i.start?.({...g,mode:"sumo"', '  i.start?.({...g,mode:"sumo"')
    text = replace(text, 'F(),i.start?.({...g,mode:m.mode', 'i.start?.({...g,mode:m.mode')
    text = replace(text, '()=>{F(),i.restart?.()}', '()=>i.restart?.()', count=2)
    text = replace(text, '()=>{F(),i.next?.()}', '()=>i.next?.()')
    return replace(text, 'function F(){let L=u("#wipe");L.classList.remove("go"),L.offsetWidth,L.classList.add("go")}', '')


def update_render_effects(text, replace):
    text = replace(text, ',flash:{value:0},flashColor:{value:new Te(1,.2,.25)}', '')
    text = replace(text, 'saturation,contrast,speed,flash;', 'saturation,contrast,speed;')
    text = replace(text, 'uniform vec3 lift,gain,flashColor;', 'uniform vec3 lift,gain;')
    # smoothstep requires ascending edges on every WebGL implementation.
    text = replace(text, '''      col*=mix(1.,smoothstep(1.05,.18,r),vignette);
      col=mix(col,flashColor,flash*smoothstep(.2,.85,r));''',
                   '      col*=1.-vignette*smoothstep(.18,1.05,r);')
    text = replace(text, 'p={speed:0,flash:0,flashColor:new Te(1,.2,.25)}', 'p={speed:0}')
    text = replace(text, ',v.flash.value=p.flash,v.flashColor.value.copy(p.flashColor)', '')
    return replace(text, ',Jt.fx.flash=0', '')


def update_camera(text, replace):
    text = replace(text, ',oi=0,zs=0', '', count=2)
    text = replace(text, ',Wu=new G(1,0,0)', '')
    text = replace(text, '($t.boost?.(),zs=Math.max(zs,7),oi=Math.max(oi,.12))', '$t.boost?.()')
    text = replace(text, 'shake:(i,e)=>{pt||(oi=Math.max(oi,i),e&&Wu.copy(e))},fovKick:i=>{pt||(zs=Math.max(zs,i))},', '')
    text = replace(text, '(i.fovKick(5),i.sound.boost?.())', 'i.sound.boost?.()')
    text = replace(text, '(i.hitStop(.08),i.shake(.4))', 'i.hitStop(.08)')
    text = replace(text, '(i.hitStop(.09),i.shake(.45),i.fovKick(5))', 'i.hitStop(.09)')
    text = replace(text, ',i.fovKick(4)', '')
    text = replace(text, '(i.fovKick(4),i.sound.boost?.())', 'i.sound.boost?.()')
    text = replace(text, '(i.sound.boost?.(),i.fovKick(3))', 'i.sound.boost?.()')
    text = replace(text, '(Hi=Math.max(.045,Hi),zs=t?6:3,oi=t?.48:.28,Wu.set(r/l,.15,a/l),as.isHuman(e)&&(Jt.fx.flash=.48,Jt.fx.flashColor.set(1,.18,.25)))',
                   '(Hi=Math.max(.045,Hi))')
    text = replace(text, 'oi=Math.max(oi,Oi(t/50,.08,.35)),Wu.set(n.x,.25,n.z),', '')
    text = replace(text, ',w.koFocus=v,w.koFocusLeft=.55', '')
    text = replace(text, 'cameraOverride(v,M,R){if(w.koFocus&&w.koFocusLeft>0){w.koFocusLeft-=R;let T=w.koFocus.body.position;return M.lerp({x:T.x,y:T.y,z:T.z},1-Math.exp(-R*5)),v.position.y+=R*1.5,!0}return w.koFocus=null,!1},', '')
    text = replace(text, ',bp=new G,Ui=', ',Ui=')
    text = replace(text, 'bp.set(i.up.x*.26,1,i.up.z*.26).normalize(),bt.up.lerp(bp,1-Math.exp(-e*3))', 'bt.up.set(0,1,0)')
    start = text.index('let t=et[0],n=Ve?.cameraFocus?.()||t;zs=')
    end = text.index('}var lo=new G,Ds=new G;', start)
    text = text[:start] + '''const player=et[0];
const focus=Ve?.cameraFocus?.()||player;
if (!focus.active) {
  // Keep the last track view during the respawn countdown.
  Jt.fx.speed=0;
  Kn=0;
  return;
}
const speed=Math.abs(focus.speed);
const boosting=focus.nitroOn||focus.effect==="boost"||focus.driftBoost||focus.padBoostEnd>kt;
const boostFov=focus.nitroOn?7:boosting?5:focus.drifting?1.2:0;
const targetFov=(e.fov??58)+Oi((speed-12)/20,0,1)*(e.speedFov??0)+boostFov;
bt.fov+=(targetFov-bt.fov)*(1-Math.exp(-i*4));
bt.updateProjectionMatrix();
Jt.fx.speed=boosting&&focus===player?.42:Oi((speed-26)/14,0,.22)*(e.speedFov?1:0);
$T(focus,i,e);
bt.lookAt(zi);
Kn=0;
''' + text[end:]
    text = replace(text, 'let x=u[0].active?u[0]:null,m=u[1].active?u[1]:null,g=x||m||p,',
                   'let x=u[0].active?u[0]:null,m=u[1].active?u[1]:null;if(!x&&!m&&!p.active)return;let g=x||m||p,')
    return replace(text, 'y=u.body.position;r.set(u.forward.x,0,u.forward.z).normalize(),o.set(y.x,Math.max(-18,y.y),y.z).addScaledVector(r,-(d.distance||8.5)),o.y+=d.height||5.2,s.set(y.x,Math.max(-22,y.y)+.9,y.z).addScaledVector(r,d.look||3);let b=l?1:1-Math.exp(-f*8);n.position.lerp(o,b),a.lerp(s,b),n.lookAt(a),n.fov=(d.fov||58)+(u.nitroOn?11:0),l=!1;let _=t.aspect;',
                   '''y=u.body.position;
if(u.active||l){
  r.set(u.forward.x,0,u.forward.z).normalize();
  o.set(y.x,y.y+(d.height||5.2),y.z).addScaledVector(r,-(d.distance||8.5));
  s.set(y.x,y.y+.9,y.z).addScaledVector(r,d.look||3);
  const follow=l?1:1-Math.exp(-f*8);
  n.position.lerp(o,follow);
  a.lerp(s,follow);
  n.lookAt(a);
  const fieldOfView=(d.fov||58)+(u.nitroOn?7:0);
  n.fov+=(fieldOfView-n.fov)*(l?1:1-Math.exp(-f*4));
  l=false;
}
let _=t.aspect;''')


def update_presentation(text, replace):
    text = update_transitions(text, replace)
    text = update_render_effects(text, replace)
    return update_camera(text, replace)
