"""Rebuild the offline edition from its pinned upstream bundle and editable assets."""

import argparse
from pathlib import Path
import subprocess

from gameplay_fixes import update_gameplay


HERE = Path(__file__).resolve().parent
BASE_COMMIT = '820c8b8b61ec93e50618dcc59e3b9072956670c4'


def replace(text, old, new, count=1):
    if text.count(old) != count:
        raise ValueError(f'Expected {count} occurrences of {old[:100]!r}')
    return text.replace(old, new)


def source(name):
    return (HERE / name).read_text(encoding='utf-8').strip()


def update_models(text):
    text = replace(text, 'var Uo=[', source('foundry.js') + '\nvar Uo=[punchDriveSaltworks.descriptor,')
    text = replace(text, 'm=Rt({neon:2176330', 'm=Rt({saltworks:0x314e56,neon:2176330')
    text = replace(text, 'new Re(new Ft(48,48),HE(n.id))',
                   'new Re(new Ft(48,48),n.id==="saltworks"?punchDriveSaltworks.floorMaterial(Rt,Ug):HE(n.id))')
    arena_builder = '({neon:GE,mesa:VE,glacier:WE,sakura:qE,orbital:XE})[n.id](z)'
    text = replace(text, arena_builder,
                   '(n.id==="saltworks"?punchDriveSaltworks.build(z,{material:Rt,emissive:Fr,CylinderGeometry:it}):' + arena_builder + ')')
    text = replace(text, 'return h("meadow"),d', 'return h("saltworks"),d')
    text = replace(text, 'r={type:"arena",id:"meadow"}', 'r={type:"arena",id:"saltworks"}')
    text = replace(text, 'Uo.some(d=>d.id===u)?u:"meadow"', 'Uo.some(d=>d.id===u)?u:"saltworks"')
    text = replace(text, 'id:e.venue||"meadow"', 'id:e.venue||"saltworks"')
    text = replace(text, 'venueType:"arena",defaultVenue:"neon"', 'venueType:"arena",defaultVenue:"saltworks"')
    text = replace(text, 'function OT(){let i=["neon"', 'function OT(){let i=["saltworks","neon"')
    vehicles = source('saltworks-vehicles.js') + '''
const saltworksVehicles = createSaltworksVehicleModels({
  BufferGeometry:at,Float32BufferAttribute:We,BoxGeometry:Mt,
  CylinderGeometry:it,LatheGeometry:Fa,Vector2:Pe
}, fl);
'''
    text = replace(text, 'function jf(', vehicles + 'function jf(')
    text = replace(text, 'of _E(s.kits)', 'of saltworksVehicles.body(s.kits)')
    return replace(text, 'of ME(j)', 'of saltworksVehicles.wheel(j,s.kits)')


def update_controls(text):
    text = replace(text, 'function Sp(){jn.clear()',
                   'var cancelMatchPointer;function Sp(){cancelMatchPointer?.();jn.clear()')
    old_start = 'window.addEventListener("keydown",i=>{if(Ye==="playing"&&i.target.tagName==="BUTTON"&&(i.target.blur(),(i.code==="Space"||i.code==="Enter")&&i.preventDefault()),!(Ye!=="playing"&&["SELECT","INPUT","BUTTON"].includes(i.target.tagName)&&i.code!=="Escape")&&(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(i.code)&&i.preventDefault(),!i.repeat)){'
    new_start = '''window.addEventListener("keydown",i=>{
  const focusedControl = i.target.closest?.("button,input,select,textarea,summary,[contenteditable=true]");
  if (i.ctrlKey || i.altKey || i.metaKey) return;
  if (i.code !== "Escape" && focusedControl && (Ye !== "playing" || (i.code === "Enter" && !ri()))) return;
  if (Ye === "playing" && ["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(i.code)) i.preventDefault();
  if (!i.repeat){'''
    text = replace(text, old_start, new_start)
    text = replace(text, '["menu","setup"].includes(Ye)){nn.confirm', '["menu","setup","garage"].includes(Ye)){nn.confirm')
    old_mouse = 'window.addEventListener("contextmenu",i=>i.preventDefault());rn.domElement.addEventListener("pointerdown",i=>{i.button===2&&Ye==="playing"&&(i.preventDefault(),$t.init(),Xr(et[0])),(Ye==="garage"||Ye==="results")&&ai.pointerDown(i,rn.domElement)});'
    new_mouse = source('match-mouse.js') + '''
cancelMatchPointer = installMatchMouseControls(rn.domElement, {
  isPlaying: () => Ye === "playing" && !pt,
  punchStart: () => { $t.init(); rs(0,"mouse",true); },
  punchEnd: cancel => rs(0,"mouse",false,cancel),
  item: () => { $t.init(); vp(0); }
});
rn.domElement.addEventListener("pointerdown",i=>{(Ye==="garage"||Ye==="results")&&ai.pointerDown(i,rn.domElement)});'''
    return replace(text, old_mouse, new_mouse)


def update_sumo_items(text):
    start = text.index('function dy(i,e)')
    end = text.index('return w}', start) + len('return w}')
    sumo = text[start:end]
    sumo_item = '''
const items = {
  boost: {name:"涡轮加速", hint:"使用后加速 7 秒", color:"#65effa"},
  power: {name:"强化拳", hint:"使用后强化拳力 7 秒", color:"#ffbf52"}
};
function activateItem(car, kind) {
  car.effect = kind;
  car.effectEnd = i.simTime + 7;
  if (i.isHuman(car)) i.announce(items[kind].name,"持续 7 秒",1.8);
}
'''
    sumo = replace(sumo, 'function g(){', sumo_item + 'function g(){')
    sumo = replace(sumo, 'R.effectEnd=0,R.respawnAt', 'R.effectEnd=0,R.mode.sumoItem=null,R.respawnAt')
    pickup = 'if(M.active&&Math.hypot(M.body.position.x-f.x,M.body.position.z-f.z)<2&&Math.abs(M.body.position.y-f.baseY)<2)'
    pos = sumo.index(pickup)
    pickup_end = sumo.index('y(),d=13;break', pos)
    sumo = sumo[:pos] + '''if (M.active && !M.mode.sumoItem &&
        Math.hypot(M.body.position.x-f.x,M.body.position.z-f.z)<2 &&
        Math.abs(M.body.position.y-f.baseY)<2) {
      if (i.isHuman(M)) {
        M.mode.sumoItem=f.kind;
        i.sound.pickup();
      } else activateItem(M,f.kind);
      ''' + sumo[pickup_end:]
    sumo = replace(sumo, 'render(v){', '''
useItem(car) {
  const kind = car.mode.sumoItem;
  if (l !== "play" || !car.active || !kind) return false;
  car.mode.sumoItem = null;
  activateItem(car,kind);
  return true;
},
itemName(car) { return items[car.mode.sumoItem]?.name || ""; },
render(v){''')
    sumo = replace(sumo, 'v.lastAttacker=null,v.effect=null', 'v.lastAttacker=null,v.effect=null,v.mode.sumoItem=null')
    sumo = replace(sumo, 'return{board:{title:', 'return{item:items[v.mode.sumoItem]??null,board:{title:')
    return text[:start] + sumo + text[end:]


def update_ui(text):
    text = replace(text, '</style></head>', '\n' + source('saltworks-ui.css') + '\n</style></head>')
    menu_start = text.index('  <main class="screen menu-screen">')
    menu_end = text.index('  </main>', menu_start) + len('  </main>')
    controls = '<kbd>WASD</kbd> 驾驶 <kbd>Shift</kbd> 漂移 <kbd>空格</kbd> 氮气 <kbd>左键</kbd> 出拳 <kbd>右键</kbd> 道具'
    menu = '''  <main class="screen menu-screen">
    <header class="brand">
      <p class="eyebrow-cn">PUNCH DRIVE</p>
      <h1 class="logo">重拳飞车</h1>
    </header>
    <button class="primary quick-start" type="button">
      <strong>快速开赛</strong><small>相扑擂台 · 盐炉高台 · 3 回合</small>
      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </button>
    <section class="mode-grid" aria-label="自定义比赛">${c.map(L=>`<button class="mode-card" type="button" data-mode="${L}" style="--accent:${e[L].accent}">
      <span class="icon" aria-hidden="true">${mT[L]}</span><strong>${L==='sumo'?'自定义相扑':It(e[L].name)}</strong><span class="mode-arrow" aria-hidden="true">›</span>
    </button>`).join("")}</section>
    <footer class="menu-foot">
      <div class="hint solo-help">''' + controls + '''</div>
      <details class="menu-settings"><summary>设置</summary>
        <div class="quick-settings">
          <span class="seg" data-setting="players"><button type="button" data-value="1">单人</button><button type="button" data-value="2">本地双人</button></span>
          <span class="seg" data-setting="quality"><b>画质</b><button type="button" data-value="low">低</button><button type="button" data-value="medium">中</button><button type="button" data-value="high">高</button></span>
          ${h}
          <label class="toggle"><input type="checkbox" id="music-toggle" checked><i></i><b>音乐</b></label>
        </div>
      </details>
    </footer>
    <p class="menu-preview-label">场地预览</p>
  </main>'''
    text = text[:menu_start] + menu + text[menu_end:]
    text = replace(text, 'let c=["tour","race","sumo","crown","meltdown"]', 'let c=["sumo","race","crown","meltdown","tour"]')
    text = replace(text, 'Ap({mode:"race",venue:"neon"})', 'Ap({mode:"sumo",venue:"saltworks"})')
    text = replace(text, 'i.preview?.({mode:"race",venue:"neon"})', 'i.preview?.({mode:"sumo",venue:"saltworks"})', count=2)
    text = replace(text, 'function U(L){m.mode=L,',
                   'function U(L){if (e[L].venueType !== e[m.mode].venueType) m.venue=e[L].defaultVenue; m.mode=L,')
    text = replace(text, 'if(l.dataset.screen==="menu"){U("race");return}',
                   'if(l.dataset.screen==="menu"){startQuickSumo();return}')
    text = replace(text, 'function F(){let L=u("#wipe")', '''function startQuickSumo(){
  F();
  i.start?.({...g,mode:"sumo",venue:"saltworks",classId:m.classId,paint:m.paint,glove:m.glove,difficulty:m.difficulty,format:"quick"});
}
u(".quick-start").addEventListener("click",startQuickSumo);
function F(){let L=u("#wipe")''')
    text = replace(text, r'<span class="solo-help"><kbd>WASD / \u2191\u2193\u2190\u2192</kbd> \u9A7E\u9A76\u3000<kbd>Shift / Z</kbd> \u6F02\u79FB\u3000<kbd>J / X</kbd> \u70B9\u6309\u51FA\u62F3\uFF0C\u6309\u4F4F\u84C4\u529B</span>',
                   '<span class="solo-help">' + controls + '</span>')
    text = replace(text, '<span class="item-key">Q</span>', '<span class="item-key">右键</span>')
    text = replace(text, '<kbd>J</kbd><em>', '<kbd>左键</kbd><em>')
    text = replace(text, '<details class="pause-guide" open>', '<details class="pause-guide">')
    guide_start = text.index('        <p class="solo-help">WASD ')
    guide_end = text.index('</p>', guide_start) + len('</p>')
    text = text[:guide_start] + '''        <p class="solo-help">W/S 加速与倒车，A/D 转向，Shift 漂移，空格释放氮气。左键点按出拳或按住蓄力，右键使用道具。J / Q 为键盘备用，R 复位。</p>''' + text[guide_end:]
    text = replace(text, 'L.minimap&&w&&ue(L.minimap.cars),L.mode==="meltdown"', '''L.minimap&&w&&ue(L.minimap.cars),L.mode==="sumo"&&(
  f.item.querySelector("b").textContent=L.item?.name||"无道具",
  f.item.querySelector("small").textContent=L.item?.hint||"驶过道具拾取",
  f.item.classList.toggle("has",!!L.item),
  f.item.style.setProperty("--item",L.item?.color||"#637180")
),L.mode==="meltdown"''')
    return replace(text, r'L.race?.item?.name||"\u9053\u5177"', r'L.race?.item?.name||L.item?.name||"\u9053\u5177"')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', type=Path, help='Path to the original upstream index.html')
    parser.add_argument('--output', type=Path, default=HERE / 'index.html')
    args = parser.parse_args()
    if args.baseline:
        text = args.baseline.read_text(encoding='utf-8')
    else:
        text = subprocess.check_output(['git', 'show', f'{BASE_COMMIT}:sumo-cars/index.html'], cwd=HERE).decode('utf-8')
    for transform in (update_models, update_controls, update_sumo_items, update_ui):
        text = transform(text)
    text = update_gameplay(text, replace)
    args.output.write_text(text, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    main()
