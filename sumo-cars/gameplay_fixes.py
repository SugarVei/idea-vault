"""Targeted fixes for the pinned upstream race and crown implementations."""


def update_gameplay(text, replace):
    original_reset = 'manualReset(C){if(!C.active||u!=="race")return!1;C.isPlayer&&b?.invalidate();let U=C.mode;return D(C,U.idx,bi(U.lateral,-c*.4,c*.4),4,1.5),U.s=r[U.idx].s,i.cut(),!0}'
    text = replace(text, original_reset, '''manualReset(car){
  if (!car.active || u!=="race") return false;
  const progress=car.mode;
  const gapNear=index=>r[index].gap || r[(index-1+a)%a].gap || r[(index+1)%a].gap;
  let index=progress.idx;
  let lateral=progress.lateral;
  let distance=progress.dist+M(r[index].s-progress.s);
  if (gapNear(index) || Math.abs(lateral)>c+1.3) {
    const safe=progress.safe;
    index=safe.idx;
    lateral=safe.lateral;
    for (let checked=0; checked<a && gapNear(index); checked++) index=(index-1+a)%a;
    if (gapNear(index)) return false;
    distance=safe.dist+M(r[index].s-r[safe.idx].s);
  }
  if (car.isPlayer) b?.invalidate();
  lateral=bi(lateral,-c*.4,c*.4);
  D(car,index,lateral,4,1.5);
  progress.idx=index;
  progress.s=r[index].s;
  progress.dist=Math.min(progress.dist,distance);
  progress.lateral=lateral;
  progress.safe={idx:index,lateral,dist:progress.dist};
  i.cut();
  return true;
}''')

    start = text.index('for(let ee of o.itemBoxes)ee.respawnAt>i.simTime||ee.position.distanceToSquared')
    end = text.index(';$.effect==="shield"', start)
    text = text[:start] + '''for (const box of o.itemBoxes) {
  if (F.item || box.respawnAt>i.simTime) continue;
  const position=$.body.position;
  if (box.position.distanceToSquared(_.set(position.x,position.y,position.z))>=6.2) continue;
  F.item=I($);
  F.itemHold=0;
  box.respawnAt=i.simTime+5;
  box.mesh.visible=false;
  i.effects.impact(box.position,.5);
  if (i.isHuman($) && !i.demo) {
    i.sound.pickup();
    i.announce(fp[F.item].name,$.id===0?"右键使用，或按 Q":"按 / 或小键盘 2 使用",1.6,"small");
  }
}''' + text[end:]
    text = replace(text, '$&&$.body.position.distanceTo(H.mesh.position)<2.4',
                   '$&&$.ghostUntil<=i.simTime&&$.invulnerable<=i.simTime&&$.body.position.distanceTo(H.mesh.position)<2.4')

    old_crown_spawn = 'function p(){h.holder&&(h.holder.speedMul=1),h.holder=null,h.flying=!1,h.pos.set(0,1.6,0),h.vel.set(0,0,0),h.cooldown=.4}'
    text = replace(text, old_crown_spawn, '''function crownSpawn(){
  const venue=i.venue;
  for (let radius=0; radius<=venue.halfSize*.75; radius+=2) {
    const samples=radius===0?1:16;
    for (let index=0; index<samples; index++) {
      const angle=index*Math.PI*2/samples;
      const x=Math.sin(angle)*radius, z=Math.cos(angle)*radius;
      if (venue.spawnSafe(x,z,1.5)) return [x,1.6,z];
    }
  }
  return [0,1.6,0];
}
function p(){
  if (h.holder) h.holder.speedMul=1;
  h.holder=null;
  h.flying=false;
  h.pos.set(...crownSpawn());
  h.vel.set(0,0,0);
  h.cooldown=.4;
}''')
    old_car_spawns = 'function x(){let g=i.venue;g.setRound(3,6);for(let y of t){let b=y.id*Math.PI/3+Math.PI/6,_=g.halfSize*.66;i.placeCar(y,Math.sin(b)*_,Math.cos(b)*_,Math.atan2(Math.sin(b),Math.cos(b))),y.cooldown=0,y.mode.crown=y.mode.crown||0}p()}'
    text = replace(text, old_car_spawns, '''function x(){
  const venue=i.venue;
  venue.setRound(3,6);
  const occupied=[];
  const candidateRadii=[.66,.56,.73,.44];
  for (const car of t) {
    const heading=car.id*Math.PI/3+Math.PI/6;
    const radius=venue.halfSize*candidateRadii[0];
    let x=Math.sin(heading)*radius;
    let z=Math.cos(heading)*radius;
    for (let attempt=0; attempt<64; attempt++) {
      const angle=heading+Math.ceil(attempt/2)*(attempt%2?1:-1)*.2;
      const distance=venue.halfSize*candidateRadii[Math.floor(attempt/16)];
      const candidateX=Math.sin(angle)*distance;
      const candidateZ=Math.cos(angle)*distance;
      if (!venue.spawnSafe(candidateX,candidateZ,2) || occupied.some(point=>Math.hypot(point.x-candidateX,point.z-candidateZ)<4)) continue;
      x=candidateX;
      z=candidateZ;
      break;
    }
    occupied.push({x,z});
    i.placeCar(car,x,z,Math.atan2(x,z));
    car.cooldown=0;
    car.mode.crown=car.mode.crown||0;
  }
  p();
}''')
    return replace(text, 'h.pos.y<1.6&&Math.max(Math.abs(h.pos.x),Math.abs(h.pos.z))<y.halfSize-1&&(h.pos.y=1.6,h.vel.set(0,0,0),h.flying=!1)',
                   'h.pos.y<1.6&&Math.max(Math.abs(h.pos.x),Math.abs(h.pos.z))<y.halfSize-1&&(y.spawnSafe(h.pos.x,h.pos.z,.9)?(h.pos.y=1.6,h.vel.set(0,0,0),h.flying=false):p())')
