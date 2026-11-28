'use strict';

const roles = [
  { label: '공격', names: ['화염귀', '핏빛 사냥꾼', '심연 집행자', '재앙군주', '화염의 집행장'], color: '#ff7855', glyph: '▲', range: 2.5 },
  { label: '이동속도 감소', names: ['서리귀', '빙결 마녀', '혹한의 파수꾼', '백야의 마왕', '서리의 지배자'], color: '#76ddff', glyph: '✦', range: 2.7 },
  { label: '스턴', names: ['폭뢰귀', '쇄도의 악령', '뇌옥의 집행관', '천둥군주', '뇌옥의 우두머리'], color: '#efd471', glyph: 'ϟ', range: 2.35 },
  { label: '재화 수급', names: ['탐욕귀', '황금 악령', '금고의 지배자', '부의 대공', '황금의 총독'], color: '#a8e78a', glyph: '◆', range: 2.6 },
  { label: '버프·디버프', names: ['저주귀', '밤의 사제', '심연의 예언자', '검은 교황', '황혼의 대사제'], color: '#d49cff', glyph: '✧', range: 2.8 }
];
const sins = [
  {name:'분노의 아스란',role:0},
  {name:'나태의 니브',role:1},
  {name:'교만의 바알',role:2},
  {name:'탐욕의 마몬',role:3},
  {name:'색욕의 리리스',role:4},
  {name:'폭식의 벨제부브',role:3,materials:[[4,3],[3,0],[3,2],[2,4]],
    elite:{name:'끝없는 포식',power:[0,12]}},
  {name:'질투의 레비아탄',role:5}
];
const roleData=[...roles,{label:'올라운더',color:'#66e2c5',range:2.65}];
const families=[
  ...roles.map((role,index)=>({role:index,names:role.names})),
  {role:0,names:['불씨 임프','용암 발톱','용광로 사냥꾼','적철 기사','홍련 집행관']},
  {role:1,names:['안개귀','안개의 추적자','백무 수호자','결빙 기사','빙하의 사령관']},
  {role:2,names:['전류귀','번개의 망령','감전 사냥꾼','뇌광 기사','검은 뇌광']},
  {role:3,names:['주화 임프','황금 감시자','보물 약탈자','금고 관리인','황금 계약자']},
  {role:4,names:['주술 임프','혼령 사제','몽환의 무녀','심연의 주술사','꿈의 계약자']},
  {role:5,names:['균열귀','균열술사','공명 파수꾼','균열의 대행자','균열 지휘관']}
];
const forgedFives=['지옥 불꽃의 검','서리 심장의 기사','폭풍의 단죄자','황금 성역의 수호자','황혼의 예언자','균형의 심판자'];
const sixNames=['분노의 집행관','나태의 수호자','교만의 전령','탐욕의 집사','색욕의 사제','폭식의 포식자','질투의 망령'];
const sinFamilies=[0,1,2,3,4,8,10];
const specialLineages=[
  {base:'공허의 파편',result:'공허 군주 녹스',materials:[[3,0],[2,1],[1,3]],palette:['#c285fe','#483685','#e0ffe9','#96bfb3']},
  {base:'심연 추적자',result:'공허의 왕 오블리비온',materials:[[4,0],[3,2],[2,3]],palette:['#e78cd5','#5f306f','#ffe1fa','#b592b5']},
  {base:'망각의 사도',result:'망각의 여왕 모르가',materials:[[4,4],[3,1],[2,2]],palette:['#8de3ca','#335979','#effff1','#80a4c3']}
];
const specialIdentity=star=>star<=4?families.length:star===5?families.length+forgedFives.length:sins.length;
const identityCount=star=>specialIdentity(star)+(star<=3?3:star===6?1:star===7?2:0);
const isSpecial=(star,identity)=>identity>=specialIdentity(star) && identity<identityCount(star);
const lineageIndex=(star,identity)=>identity-specialIdentity(star)+(star===7?1:0);
const lineageFor=(star,identity)=>specialLineages[lineageIndex(star,identity)];
const maxStar=7;
const roleFor=(star,identity)=>isSpecial(star,identity)?0:star>=6?sins[identity].role:
  identity<families.length?families[identity].role:identity-families.length;
function canPair(unit) {
  return Boolean(unit && (isSpecial(unit.star,unit.identity)?unit.star<3:unit.star<5 && unit.identity<families.length));
}
const points = [[.3,0],[.3,4],[11.7,4],[11.7,.3],[7.85,.3],[7.85,11.7],[11.65,11.7],[11.65,7.85],[.35,7.85],[.35,11.65],[4,11.65],[4,0]];
const segments = points.slice(1).map(([x,y], i) => {
  const [a,b] = points[i];
  return { a,b,x,y,length: Math.hypot(x-a,y-b) };
});
const pathLength = segments.reduce((sum, segment) => sum + segment.length, 0);
const maxRound=150;
const bossLimit=28;
const difficultyNames=['이지','노말','하드'];
const difficultyIndex=round=>Math.floor((round-1)/50);
const enemyTypes={
  normal:{label:'일반',hp:1,speed:1},
  swift:{label:'질주',hp:.63,speed:1.42},
  tank:{label:'중갑',hp:2.35,speed:.76},
  swarm:{label:'밀집',hp:.57,speed:1.03},
  mission:{label:'미션',hp:2.4,speed:1},
  boss:{label:'보스',hp:12,speed:.72}
};
const bossPatterns=[
  {label:'호위대',description:'중갑과 질주 적이 보스와 함께 등장'},
  {label:'광폭화',description:'체력이 절반 이하가 되면 보스 이동속도 +30%'},
  {label:'방벽',description:'체력이 절반 이하가 되면 최대 체력의 18%에 해당하는 보호막 생성'}
];
const stageRound=round=>(round-1)%50+1;
const marchSpeed=round=>2.30+(round-1)*.015;
const maxEnemySpeed=6.15;
function wavePlan(round) {
  const local=stageRound(round);
  const tier=difficultyIndex(round);
  const count=12+Math.floor(local/4)+tier*3;
  const boss=local%10===0;
  const entries=[];
  const add=(type,gap=.63)=>entries.push({type,gap});
  if(boss) {
    const pattern=(Math.floor(round/10)-1)%bossPatterns.length;
    const n=12+Math.floor(local/10)+tier*2;
    for(let i=0;i<n;i++) {
      if(i===Math.floor(n*.66)) add('boss',.88);
      const type=local===10&&tier===0?(i===0?'tank':i===4?'swift':'normal'):
        pattern===0?(i%2?'swift':'tank'):i%4===0?'tank':i%3===0?'swift':'normal';
      add(type,type==='swift'?.41:.63);
    }
    return {entries,pattern};
  }
  for(let i=0;i<count;i++) {
    let type='normal', gap=.63;
    if(local>=3 && (local===3 || local%5===1)) {type=i%3?'swift':'normal';gap=.53;}
    if(local>=6 && (local===6 || local%5===2)) {type=i%3===0?'tank':'normal';gap=.72;}
    if(local>=11 && local%5===3) {type='swarm';gap=i%5===4?1.05:.23;}
    if((local>=21 && local%5===4) || (local>=41 && local%5===0) || (tier>0 && local%5===4)) {
      type=i%5===0?'tank':i%3===0?'swift':'swarm';
      gap=type==='tank'?.70:.35;
    }
    add(type,gap);
  }
  if(round%7===0) entries[entries.length-1].type='mission';
  return {entries,pattern:null};
}
const skills = {
  slow: { factor:.70, duration:1.2 },
  stun: { base:.20, perStar:.04, legacy:.03, duration:.46, bossDuration:.22 },
  income: { ticksPerSoul:8, ticksPerKill:4 },
  curse: { radius:2, allyMultiplier:1.14, enemyMultiplier:1.16, duration:1.6 }
};
const eliteSkills = [
  { name:'화염 폭발', radius:[.8,1.05], power:[.35,.50] },
  { name:'서리 전이', radius:[.85,1.2], power:[.75,1.2] },
  { name:'연쇄 번개', radius:[.85,1.25], power:[.50,.75] },
  { name:'현상금 징수', power:[4,8] },
  { name:'낙인 폭발', radius:[.8,1.15], power:[.22,.36] }
];
const allRounder={radius:.75,coefficient:.24,slow:.65,auraRadius:1.7,allyMultiplier:1.08};
const seventhSkill={threshold:.25,multiplier:1.30};
const allRounderRadius=unit=>allRounder.radius+.08*(unit.star-1);
const allRounderAura=unit=>allRounder.auraRadius+.10*Math.max(0,unit.star-4);
const allRounderDamage=unit=>allRounder.coefficient+.06*Math.max(0,unit.star-5);
const allRounderSlow=unit=>allRounder.slow+.12*Math.max(0,unit.star-5);
const allRounderBuff=unit=>allRounder.allyMultiplier+.02*Math.max(0,unit.star-5);
const voidElite={name:'공허 붕괴',radius:[.95,1.3],power:[.45,.65]};
const eliteSpec = unit => isSpecial(unit.star,unit.identity)?voidElite:
  (unit.star===7 && sins[unit.identity]?.elite) || eliteSkills[unit.role];
const elitePower = unit => eliteSpec(unit).power[Math.min(unit.star-4,1)]*
  (unit.star<=5?1:unit.role===1||unit.role===2?1+(unit.star-5)*.10:1+(unit.star-5)*.25);
const eliteRadius = unit => {
  const base=eliteSpec(unit).radius?.[Math.min(unit.star-4,1)];
  return base===undefined?undefined:base+Math.max(0,unit.star-5)*.15;
};
const eliteBonus = unit => unit.star>3 ? elitePower(unit) : 0;
const fireBossBonus = [.05,.05,.05,.08,.12,.17,.24];
const blockLayout = [
  [3,3], [2,3], [3,2],
  [3,2], [3,3], [2,3],
  [2,2], [3,2], [3,3]
];
const cellPitch=.93;
// Lane centerlines define each plot's bounds, including the open outer edges.
const plotColumns=[
  [.30,4,7.85,11.70],
  [.325,4,7.85,11.675],
  [.35,4,7.85,11.65]
];
const plotRows=[
  [.30,4,7.85,11.65],
  [.30,4,7.85,11.675],
  [.30,4,7.85,11.70]
];
const blocks=blockLayout.map(([columns,rows],index)=>{
  const row=Math.floor(index/3), column=index%3;
  const horizontal=plotColumns[row], vertical=plotRows[column];
  const centerX=(horizontal[column]+horizontal[column+1])/2;
  const centerY=(vertical[row]+vertical[row+1])/2;
  return {columns,rows,x:centerX-(columns-1)*cellPitch/2,y:centerY-(rows-1)*cellPitch/2};
});
const cells = [];
for (const [index,block] of blocks.entries()) {
  for (let row=0; row<block.rows; row++) for (let column=0; column<block.columns; column++) {
    cells.push({x:block.x+column*cellPitch,y:block.y+row*cellPitch,block:index+1});
  }
}
const $ = id => document.getElementById(id);
const ctx = $('board').getContext('2d');
const drawPrice = 20;
const gamblePrice=30;
const gambleTable=[
  {weight:450,label:'영혼 5',gold:5},
  {weight:280,label:'영혼 18',gold:18},
  {weight:160,label:'영혼 30',gold:30},
  {weight:75,label:'1성 선택권',ticket:1},
  {weight:20,label:'2성 선택권',ticket:2},
  {weight:10,label:'3성 선택권',ticket:3},
  {weight:5,label:'특수 악마 1~3성',special:true}
];
const sellPercent = 65;
const roll = n => Math.floor(Math.random()*n);
const title = (identity,star) => {
  if(isSpecial(star,identity)) {
    const lineage=lineageFor(star,identity);
    return star<=3?lineage.base:lineage.result;
  }
  if(star===7) return sins[identity].name;
  if(star===6) return sixNames[identity];
  if(identity>=families.length) return forgedFives[identity-families.length];
  return families[identity].names[star-1];
};
const unitName = unit => title(unit.identity ?? unit.role,unit.star) + ' ' + unit.star + '성';
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const tower = (star,role=roll(5),identity=role) => ({star,role,identity,moved:false,cooldown:0,spent:0});
const recipeTower = (star,identity) => tower(star,roleFor(star,identity),identity);
const relicCatalog=[
  {name:'핏빛 인장',tier:'일반',effect:'공격 피해 +6%',color:'#e47b78',sprite:['..aaa..','.abba.','abbcba','abccba','abbba.','.aaa..']},
  {name:'탐욕의 주화',tier:'일반',effect:'처치 시 영혼 +⅛',color:'#ffcc64',sprite:['..aaa..','.abbba.','abacaba','abcacba','.abbba.','..aaa..']},
  {name:'서리 사슬',tier:'희귀',effect:'적 이동속도 −3.5%',color:'#8ddaff',sprite:['...aaa.','..ab.a.','..aa.a.','.ab.aa.','.a.ba..','.aaa...']},
  {name:'왕의 심장',tier:'전설',effect:'공격 피해 +18% · 처치 영혼 +⅛ · 적 이동속도 −7%',color:'#ffb962',sprite:['aa...aa','aba.aba','abbabba','.abcba.','..aba..','...a...']},
  {name:'파수꾼의 방패',tier:'일반',effect:'현재·최대 내구도 +2',color:'#b6c98b',sprite:['aaaaaaa','abbbbba','abbcbba','.abcba.','..aba..','...a...']},
  {name:'보스 사냥꾼의 송곳니',tier:'희귀',effect:'보스에게 주는 피해 +8%',color:'#f4dfc3',sprite:['...aaaa','..abbba','.abbca.','abbca..','abca...','aa.....']},
  {name:'잿빛 모래시계',tier:'희귀',effect:'공격 주기 −2.5%',color:'#c7a8ff',sprite:['aaaaaaa','.abbba.','..aca..','..aca..','.accba.','aaaaaaa']}
];
const relicLimit=4;
const relicRank=id=>game.relics[id];
const maxLife=()=>30+relicRank(4)*2;
let profile;
try { profile = JSON.parse(localStorage.getItem('ashen-citadel-profile')) || {}; } catch { profile = {}; }
profile = { essence:0, best:0, bestScore:0, wealth:0, frost:0, spark:0, choice:0, pulse:0, auto:false, sound:true,
  crafted:[], discovered:[], encounters:[], runs:[], ...profile };
function currentRosterKey(key) {
  const [star,identity]=key.split(':').map(Number);
  if(star===5 && identity>=0 && identity<9) return '7:'+identity;
  if(star===4 && identity===5) return '6:'+specialIdentity(6);
  if(star<=3 && identity>=5 && identity<8) return star+':'+(specialIdentity(star)+identity-5);
  return key;
}
if(profile.rosterVersion!==2) {
  profile.crafted=profile.crafted.map(currentRosterKey);
  profile.discovered=profile.discovered.map(currentRosterKey);
  profile.rosterVersion=2;
  save();
}
const crafted = new Set(profile.crafted);
const discovered=new Set(profile.discovered);
const encounters=new Set(profile.encounters);
const recipeKey = (star,role) => star+':'+role;
function save() { try { localStorage.setItem('ashen-citadel-profile',JSON.stringify(profile)); } catch {} }
let game;
let dirty = true;

function reset() {
  game = {
    round:1, phase:'ready', life:30, gold:100+profile.wealth*20, kills:0, missionKills:0,
    board:Array(cells.length).fill(null), reserve:[], seen:[null,new Set(),new Set(),new Set()], passiveDone:new Set(),
    enemies:[], shots:[], relics:relicCatalog.map(()=>0), incomeTicks:0,
    selected:null, pick:null, moving:false, travel:0, nextSpawn:0, spawned:0, count:0,
    mergeSource:null, skillPreview:null,
    autoTime:7, speed:1, paused:false, bossDefeated:false, bossRewarded:false,bossTime:null,bossKills:0,cleared:0,
    researchEarned:0, played:0, pulseUsed:false, runStarted:false,
    active:activeMissions.map(()=>({auto:false,armed:false,queued:false,alive:false,clears:0,wait:0})),
    expedition:{index:0,hp:eventChallenges[0].hp,unit:null,slot:null,wait:0,attack:null},
    tickets:[0,0,0,0], gambleResult:'',
    plan:wavePlan(1), text:'전장의 빈 발판을 선택한 뒤 랜덤 소환을 누르세요.'
  };
  $('speed').value = '1';
  mark();
}
function mark(text) { if (text) game.text=text; dirty=true; }
function odds() {
  const round=game.round;
  if (round<6) return [100,0,0,0,0];
  if (round<12) return [85,15,0,0,0];
  if (round<23) return [67,26,7,0,0];
  if (round<40) return [50,30,16,4,0];
  if (round<65) return [35,30,22,11,2];
  if (round<100) return [27,28,25,15,5];
  return [23,25,25,18,9];
}
function recordAcquisition(unit) {
  const key=recipeKey(unit.star,unit.identity);
  if(!discovered.has(key)) {discovered.add(key);profile.discovered=[...discovered];save();}
  const seen=game.seen[unit.star];
  if(!seen || isSpecial(unit.star,unit.identity) || seen.has(unit.identity)) return;
  seen.add(unit.identity);
  if(unit.star===1 && seen.size===1) {game.gold+=20;awardTicket(1);}
  if(unit.star===1 && seen.size===5) game.gold+=40;
  if(seen.size===families.length) {
    if(unit.star===1) game.gold+=80;
    awardTicket(unit.star);
    mark(unit.star+'성 정규 악마 전종 수집 · '+unit.star+'성 선택권 획득');
  }
}
const formationMissions=[
  {name:'화염과 서리',units:[[4,0],[3,1]],gold:55},
  {name:'황금 낙뢰',units:[[4,3],[3,2]],gold:55},
  {name:'균열과 예언',units:[[4,10],[3,4]],gold:65}
];
function checkFormations() {
  formationMissions.forEach(({name,units,gold},index)=>{
    if(game.passiveDone.has(index) || !units.every(([star,id])=>game.board.some(unit=>unit?.star===star&&unit.identity===id))) return;
    game.passiveDone.add(index);
    game.gold+=gold;
    mark(name+' 편성 완료 · 영혼 '+gold+' 획득');
  });
}
function addUnit(unit) {
  game.reserve.push(unit);
  recordAcquisition(unit);
}
function awardTicket(star) {
  game.tickets[star]++;
  mark();
}
function recordEncounter(key) {
  if(encounters.has(key)) return;
  encounters.add(key);profile.encounters=[...encounters];save();mark();
}
function openTicket(star) {
  if(!canCombine() || !game.tickets[star]) return;
  showDialog(star+'성 선택권','받을 정규 악마 한 기를 선택하세요.',[
    ...families.map((_,identity)=>[title(identity,star),()=>{
      if(!game.tickets[star]) return;
      game.tickets[star]--;
      game.runStarted=true;
      addUnit(recipeTower(star,identity));closeDialog();mark(star+'성 선택권으로 악마를 받았습니다.');
    }]),
    ['취소',closeDialog]
  ]);
}
function canGamble() {
  return canCombine() && game.phase==='ready' && game.gold>=gamblePrice;
}
function gamble() {
  if(!canGamble()) return;
  game.runStarted=true;
  game.gold-=gamblePrice;
  let number=roll(1000);
  const prize=gambleTable.find(item=>(number-=item.weight)<0);
  let label=prize.label;
  if(prize.special) {
    const tierRoll=roll(100);
    const tier=tierRoll<15?1:tierRoll<45?2:3;
    const unit=recipeTower(tier,specialIdentity(tier)+roll(specialLineages.length));
    addUnit(unit);
    label='특수 악마 · '+unitName(unit);
  } else if(prize.ticket) awardTicket(prize.ticket);
  else game.gold+=prize.gold;
  game.gambleResult=label;
  mark('도박 결과 · '+label);
}
function canDraw() {
  return canCombine() && !game.moving && game.mergeSource===null &&
    game.selected!==game.expedition.slot && game.board[game.selected]===null && (game.reserve.length>0 || game.gold>=drawPrice);
}
function draw() {
  if (!canDraw()) return;
  if (game.reserve.length) {
    placeReward(game.selected,rewardForPlacement());
    return;
  }
  let value=roll(100);
  const star=odds().findIndex(probability=>(value-=probability)<0)+1;
  const unit=recipeTower(star,roll(families.length));
  unit.spent=drawPrice;
  game.gold-=drawPrice;
  game.runStarted=true;
  game.board[game.selected]=unit;
  game.pick=null;
  recordAcquisition(unit);
  mark(unitName(unit)+' 소환 완료');
  checkFormations();
}
function refund(unit) {
  return Math.floor(unit.spent*sellPercent/100);
}
function canSell(unit) {
  return Boolean(unit && unit.star<=5);
}
function sellTower(index) {
  const unit=game.board[index];
  if (game.phase!=='ready' || game.paused || !canSell(unit)) return;
  const amount=refund(unit);
  game.board[index]=null;
  game.mergeSource=null;
  game.gold+=amount;
  mark(unitName(unit)+' 판매 · 영혼 '+amount+' 회수');
}
function placeReward(index,unit) {
  const reserveIndex=game.reserve.indexOf(unit);
  if (!canCombine() || game.moving || game.mergeSource!==null ||
      index===game.expedition.slot || game.board[index]!==null || reserveIndex<0) return;
  game.board[index]=unit;
  game.runStarted=true;
  game.reserve.splice(reserveIndex,1);
  game.selected=index;
  game.pick=null;
  game.mergeSource=null;
  mark(unitName(unit)+' 배치 완료');
  checkFormations();
}
function chooseCell(index) {
  if (!['ready','wave'].includes(game.phase) || game.paused) return;
  if(index===game.expedition.slot) {mark('파견한 악마가 돌아올 자리입니다. G로 복귀시킬 수 있습니다.');return;}
  const target=game.board[index];
  if (game.mergeSource!==null) {
    const source=game.board[game.mergeSource];
    if (index===game.mergeSource) { game.mergeSource=null; mark('합성 선택을 취소했습니다.'); return; }
    if (!isPairMatch(source,target)) {
      mark(unitName(source)+'와 같은 악마를 선택하세요.');
      return;
    }
    combine([game.mergeSource,index],recipeTower(source.star+1,source.identity));
    return;
  }
  if (game.moving) {
    const source=game.selected, unit=game.board[source];
    if (index===source) { game.moving=false; mark(); return; }
    if (game.phase!=='ready' || !unit || unit.star<4 || unit.moved || (target?.star>=4 && target.moved)) {
      mark('이동 기회가 남은 타워를 선택하세요.');
      return;
    }
    game.board[index]=unit;
    game.board[source]=target;
    unit.moved=true;
    if (target?.star>=4) target.moved=true;
    game.selected=index;
    game.moving=false;
    mark(target?'두 타워의 자리를 바꿨습니다.':'타워를 이동했습니다.');
    return;
  }
  if (!target && game.pick) {
    placeReward(index,game.pick);
    return;
  }
  game.selected=index;
  mark();
}
function requirements(star,identity) {
  if(isSpecial(star,identity)) {
    const lineage=lineageIndex(star,identity);
    return [[0,specialIdentity(1)+lineage],...(star===6?[[5,0],[4,5],[3,0]]:lineage===1?[[6,0],[5,5]]:[[6,6],[5,9]])];
  }
  if(star===5) {
    const role=identity-families.length;
    if(role===5) return [[4,10],[4,9],[3,10]];
    return [[4,role],[4,role+roles.length],[3,role]];
  }
  const family=sinFamilies[identity], role=sins[identity].role;
  if(star===6) return [[5,family],[4,role===5?9:role===family?role+roles.length:role],[3,family]];
  return [[6,identity],[5,families.length+role],[4,family]];
}
function recipeSlots(star,role,inventory=game.board) {
  const used=new Set();
  return requirements(star,role).map(([tier,type])=>{
    const find=rank=>inventory.findIndex((unit,i)=>unit?.star===rank && unit.identity===type && !used.has(i));
    const index=tier===0?([1,2,3].map(find).find(index=>index>=0) ?? -1):find(tier);
    if (index>=0) used.add(index);
    return index;
  });
}
function recipeMatch(star,role) {
  const slots=recipeSlots(star,role);
  return slots.includes(-1)?null:slots;
}
function canCombine() {
  return $('home').hidden && ['ready','wave'].includes(game.phase) && !game.paused && !$('dialog').open;
}
function isPairMatch(source,target) {
  return Boolean(source && target && source.star===target.star && source.identity===target.identity);
}
function selectMerge() {
  const selected=game.board[game.selected];
  if (!canCombine() || !canPair(selected)) return;
  if (game.mergeSource!==null) {
    game.mergeSource=null;
    mark('합성 선택을 취소했습니다.');
    return;
  }
  if (!game.board.some((unit,index)=>index!==game.selected && isPairMatch(selected,unit))) {
    mark(unitName(selected)+'가 한 기 더 필요합니다.');
    return;
  }
  game.mergeSource=game.selected;
  game.pick=null;
  mark(unitName(selected)+'와 같은 두 번째 악마를 클릭하세요.');
}
function combine(indices, unit) {
  if (!canCombine() || !indices) return;
  const slot=indices.includes(game.selected)?game.selected:indices[0];
  unit.spent=indices.reduce((sum,index)=>sum+game.board[index].spent,0);
  for (const index of indices) game.board[index]=null;
  game.board[slot]=unit;
  recordAcquisition(unit);
  const key=recipeKey(unit.star,unit.identity);
  if (!crafted.has(key)) {
    crafted.add(key);
    profile.crafted=[...crafted];
    save();
  }
  if (unit.star>=4) {
    const duration=unit.star>=5?1.05:.78;
    game.shots.push({to:cells[slot],effect:'craft',star:unit.star,time:duration,duration});
  }
  game.selected=slot;
  game.pick=null;
  game.moving=false;
  game.mergeSource=null;
  mark(unitName(unit)+' 합성 완료');
  checkFormations();
}
function dps(unit) {
  const attack=[7,20,43,98,185,340,590];
  const support=[4.4,10.5,19,47,94,175,300];
  const balanced=[5.5,14,28,65,130,230,390];
  const base=(unit.role===0?attack:unit.role===5?balanced:support)[unit.star-1];
  return unit.star===5 && unit.identity>=families.length?Math.round(base*1.16):base;
}
const attackRange = unit => roleData[unit.role].range+.18*(unit.star-1);
const attackInterval = unit => unit.role===2?1.15:.8;
const stunChance = unit => skills.stun.base+unit.star*skills.stun.perStar+profile.spark*skills.stun.legacy;
const incomeBonus = unit => Math.ceil(unit.star/2);

let audio;
let nextSound = 0;
const tones = [
  ['triangle',220,85], ['sine',720,420], ['square',335,125],
  ['triangle',660,920], ['sine',390,175], ['triangle',480,300]
];
function activateAudio() {
  if (!profile.sound || !window.AudioContext) return;
  audio ??= new AudioContext();
  if (audio.state==='suspended') audio.resume().catch(()=>{});
}
function playAttack(role) {
  if (!profile.sound || audio?.state!=='running') return;
  const time=audio.currentTime;
  if (time<nextSound) return;
  nextSound=time+.055;
  const [shape,start,end]=tones[role];
  const oscillator=audio.createOscillator();
  const volume=audio.createGain();
  oscillator.type=shape;
  oscillator.frequency.setValueAtTime(start,time);
  oscillator.frequency.exponentialRampToValueAtTime(end,time+.07);
  volume.gain.setValueAtTime(.0001,time);
  volume.gain.exponentialRampToValueAtTime(shape==='square'?.022:.045,time+.008);
  volume.gain.exponentialRampToValueAtTime(.0001,time+.09);
  oscillator.connect(volume).connect(audio.destination);
  oscillator.start(time);
  oscillator.stop(time+.095);
}
function position(progress) {
  for (const segment of segments) {
    if (progress<=segment.length) {
      const fraction=progress/segment.length;
      return {x:segment.a+(segment.x-segment.a)*fraction,y:segment.b+(segment.y-segment.b)*fraction};
    }
    progress-=segment.length;
  }
  return {x:4,y:0};
}
function showDialog(titleText, description, choices, locked=false) {
  $('dialogTitle').textContent=titleText;
  const body=$('dialogBody');
  body.replaceChildren();
  const p=document.createElement('p');
  p.textContent=description;
  body.append(p);
  for (const [label,action,disabled] of choices) {
    const button=document.createElement('button');
    button.textContent=label;
    button.disabled=Boolean(disabled);
    button.onclick=action;
    body.append(button);
  }
  $('dialog').oncancel=event => { if (locked) event.preventDefault(); };
  if (!$('dialog').open) $('dialog').showModal();
}
function restoreCodex() {
  const anchor=$('codexAnchor'), content=$('codexContent');
  if(content && content.parentElement!==anchor) anchor.append(content);
}
function closeDialog() { restoreCodex(); $('dialog').close(); mark(); }
function scoreRun() {
  return game.cleared*100+game.kills*5+game.bossKills*250+game.life*10;
}
function recordScore() {
  const score=scoreRun();
  profile.bestScore=Math.max(profile.bestScore,score);
  save();
  return score.toLocaleString('ko-KR');
}
function formatPlayTime(seconds) {
  const time=Math.floor(seconds);
  const units=[Math.floor(time/3600),Math.floor(time/60)%60,time%60];
  return units.map(unit=>String(unit).padStart(2,'0')).join(':');
}
function showRecords() {
  showDialog('플레이 기록','최근 20판 · 정지와 보상 선택 시간을 제외한 실제 플레이 시간입니다.',[['닫기',closeDialog]]);
  const body=$('dialogBody'), list=document.createElement('ol');
  for(const entry of profile.runs) {
    const item=document.createElement('li');
    item.textContent=(entry.result==='clear'?'승리':'패배')+' · '+entry.round+'라운드 · '+entry.score.toLocaleString('ko-KR')+
      '점 · '+formatPlayTime(entry.seconds);
    list.append(item);
  }
  if(!list.children.length) list.textContent='저장된 완료 기록이 없습니다.';
  body.insertBefore(list,body.lastElementChild);
}
function endRun(result) {
  if(game.phase==='over') return;
  game.phase='over';
  profile.runs.unshift({result,round:game.round,score:scoreRun(),seconds:Math.floor(game.played)});
  profile.runs=profile.runs.slice(0,20);
  const score=recordScore();
  mark(result==='clear'?'하드 150라운드까지 클리어했습니다.':result==='timeout'?'최종 보스 제한시간을 넘겼습니다.':'성채 내구도가 소진되었습니다.');
  const counts=[5,6,7].map(star=>star+'성 '+game.board.filter(unit=>unit?.star===star).length+'기').join(' · ');
  showDialog(result==='clear'?'성채 방어 성공':'도전 종료',
    '플레이 시간 '+formatPlayTime(game.played)+' · 점수 '+score+'점 · 완료 '+game.cleared+'라운드 · '+counts+
      ' · 이번 판 계승 포인트 +'+game.researchEarned,
    [['새 게임',beginGame],['계승',legacy],['타이틀',()=>{closeDialog();showHome(true);reset();}]],true);
}
const researchLimit=6;
const researchBranches=[
  {key:'wealth',name:'영혼',levels:['시작 영혼 +20','시작 영혼 +40','시작 영혼 +60']},
  {key:'frost',name:'서리',levels:['적 이동속도 −3%','적 이동속도 −6%','적 이동속도 −9%']},
  {key:'spark',name:'벼락',levels:['기절 확률 +3%p','기절 확률 +6%p','기절 확률 +9%p']},
  {key:'choice',name:'소환',levels:['보스 선택권을 3성으로 강화']},
  {key:'pulse',name:'전투 스킬',levels:['공허 파동 · 웨이브당 1회, 적 전체 2.5초 둔화']}
];
const researchCost=level=>level*2;
function researchedCount() {
  return researchBranches.reduce((sum,{key})=>sum+profile[key],0);
}
function canResearch() {
  return game.phase==='over' || !game.runStarted;
}
function legacy() {
  const count=researchedCount();
  showDialog('계승 연구','계승 포인트 '+profile.essence+' · 연구 '+count+'/'+researchLimit+
    ' · 최고 '+profile.best+'라운드 / '+profile.bestScore.toLocaleString('ko-KR')+'점'+
    (count>researchLimit?' · 기존 연구가 새 한도를 초과했습니다. 초기화 후 재분배하세요.':
      canResearch()?'':' · 새 게임 시작 전이나 종료 후에 변경할 수 있습니다.'),[],true);
  const body=$('dialogBody'), tree=document.createElement('div');
  tree.className='research-tree';
  const root=document.createElement('strong');
  root.className='research-root';
  root.textContent='잿빛성체';
  tree.append(root);
  const branches=document.createElement('div');
  branches.className='research-branches';
  for(const {key,name,levels} of researchBranches) {
    const branch=document.createElement('section');
    branch.className='research-branch';
    const heading=document.createElement('h3');
    heading.textContent=name;
    branch.append(heading);
    levels.forEach((label,i)=>{
      const level=i+1, cost=researchCost(level), learned=profile[key]>=level;
      const node=button(label+' · '+(learned?'완료':cost+' 포인트'),()=>{
        if(!canResearch() || profile[key]!==i || researchedCount()>=researchLimit || profile.essence<cost) return;
        profile.essence-=cost;profile[key]++;
        if (key==='wealth' && game.phase!=='over') game.gold+=20;
        save();mark();legacy();
      },!canResearch() || profile[key]!==i || count>=researchLimit || profile.essence<cost,learned);
      node.className='research-node'+(learned?' learned':'');
      branch.append(node);
    });
    branches.append(branch);
  }
  tree.append(branches);
  body.append(tree);
  body.append(button('연구 초기화',()=>{
    showDialog('연구 초기화','배운 연구를 모두 해제하고 사용한 포인트를 전액 돌려받습니다.',[
      ['초기화 후 재분배',()=>{
        if(!canResearch()) return;
        if(game.phase!=='over') game.gold-=profile.wealth*20;
        for(const {key} of researchBranches) {
          for(let level=1;level<=profile[key];level++) profile.essence+=researchCost(level);
          profile[key]=0;
        }
        save();mark();legacy();
      }],['취소',legacy]
    ],true);
  },!canResearch() || count===0));
  body.append(button(game.phase==='over'?'새 게임':'닫기',game.phase==='over'?beginGame:closeDialog));
}
function startWave() {
  if (game.phase!=='ready' || game.paused || $('dialog').open) return;
  game.plan=wavePlan(game.round);
  game.phase='wave';
  game.runStarted=true;
  game.spawned=0;
  game.bossDefeated=false;
  game.bossRewarded=false;
  game.bossTime=null;
  game.pulseUsed=false;
  game.count=game.plan.entries.length;
  game.nextSpawn=0;
  game.moving=false;
  mark(game.plan.pattern!==null?'보스 웨이브 시작':'웨이브 시작');
}
function useResearchSkill() {
  if(!canCombine() || game.phase!=='wave' || !profile.pulse || game.pulseUsed || !game.enemies.length) return;
  game.pulseUsed=true;
  for(const enemy of game.enemies) enemy.slow=Math.max(enemy.slow,2.5);
  mark('공허 파동 · 전장의 적을 2.5초간 둔화');
}
function toggleWave() {
  if (game.phase==='wave') {
    game.paused=!game.paused;
    mark(game.paused?'웨이브를 정지했습니다.':'웨이브를 이어서 진행합니다.');
  } else startWave();
}
function advanceRound(round) {
  game.round++;
  game.phase='ready';
  game.plan=wavePlan(game.round);
  game.autoTime=7;
  game.gold+=11+Math.floor(round*.15);
  mark(round+'라운드 종료 · 완료 보상을 받았습니다.');
  if (round%10===0 && game.bossDefeated) {
    mark(round+'라운드 종료 · '+bossTicketTier(round)+'성 선택권을 받았습니다.');
  }
}
const bossTicketTier=round=>profile.choice || round>=50?3:round>=20?2:1;
const missionTicketTier=round=>round>=75?3:round>=25?2:1;
const activeMissions=[
  {name:'잿더미의 추적자',unlock:1,cooldown:28,gold:14,type:'swift',hp:65},
  {name:'철벽의 징수관',unlock:10,cooldown:34,gold:20,type:'tank',hp:155},
  {name:'도망친 악령',unlock:20,cooldown:38,gold:25,type:'swift',hp:250},
  {name:'피의 파수꾼',unlock:35,cooldown:42,gold:32,type:'tank',hp:390},
  {name:'노말의 사형수',unlock:50,cooldown:46,gold:39,type:'tank',hp:540},
  {name:'허공의 추격자',unlock:70,cooldown:50,gold:47,type:'swift',hp:690},
  {name:'하드의 감시자',unlock:100,cooldown:55,gold:60,type:'tank',hp:940}
];
function queueMission(index) {
  if(!canCombine() || game.round<activeMissions[index].unlock) return;
  const state=game.active[index];
  if(state.auto) {
    state.auto=false;state.armed=false;state.queued=false;
  } else if(state.clears>0 && state.armed) {
    state.auto=true;
    if(!state.alive && state.wait<=0) {
      if(game.phase==='wave') spawnMission(index);
      else state.queued=true;
    }
  } else if(!state.alive && !state.queued && state.wait<=0) {
    state.armed=true;
    if(game.phase==='wave') spawnMission(index);
    else state.queued=true;
  }
  mark();
}
const eventChallenges=[
  {name:'봉인의 감시자',round:1,hp:1040,gold:38},
  {name:'절벽의 사형수',round:20,hp:5200,gold:65},
  {name:'망자의 수문장',round:40,hp:14000,gold:90},
  {name:'붉은 감옥의 주인',round:65,hp:33000,gold:120},
  {name:'망각의 거인',round:95,hp:64000,gold:150},
  {name:'심연의 옥좌',round:125,hp:110000,gold:185}
];
function sendExpedition() {
  const zone=game.expedition, boss=eventChallenges[zone.index];
  const unit=game.board[game.selected];
  if(!canCombine() || zone.unit || !boss || game.round<boss.round || !unit) return;
  zone.slot=game.selected;zone.unit=unit;zone.wait=0;zone.attack=null;
  game.board[zone.slot]=null;
  game.mergeSource=null;game.moving=false;
  mark(unitName(unit)+' · 특수 보스 구역으로 파견');
}
function recallExpedition() {
  const zone=game.expedition;
  if(!canCombine() || !zone.unit) return;
  game.board[zone.slot]=zone.unit;
  game.selected=zone.slot;
  zone.slot=null;zone.unit=null;zone.attack=null;
  checkFormations();mark('파견 악마가 원래 발판으로 돌아왔습니다.');
}
function stepExpedition(dt) {
  const zone=game.expedition, boss=eventChallenges[zone.index], unit=zone.unit;
  if(game.phase!=='wave' || !unit || !boss || game.round<boss.round) return;
  recordEncounter('event:'+zone.index);
  zone.wait-=dt;
  if(zone.wait>0) return;
  const interval=attackInterval(unit);
  zone.wait+=interval*(1-relicRank(6)*.025);
  const damage=dps(unit)*interval*(1+relicRank(0)*.06+relicRank(3)*.18)*(1+relicRank(5)*.08)*
    (unit.role===0?1+fireBossBonus[unit.star-1]:1);
  const duration=.28+unit.star*.035;
  zone.attack={role:unit.role,star:unit.star,effect:unit.role===1?'frost':unit.role===4?'curse':'hit',
    time:duration,duration};
  zone.hp=Math.max(0,zone.hp-damage);
  if(zone.hp===0) {
    game.gold+=boss.gold;
    grantLegacyPoint();
    zone.index++;
    zone.hp=eventChallenges[zone.index]?.hp ?? 0;
    mark(boss.name+' 격파 · 영혼 '+boss.gold+' 및 계승 포인트 1 획득');
  } else mark();
}
function spawnMission(index) {
  const mission=activeMissions[index], state=game.active[index];
  const hp=mission.hp+Math.max(0,game.round-mission.unlock)*3;
  game.enemies.push({...position(0),progress:0,hp,max:hp,type:mission.type,challenge:index,slow:0,stun:0,curse:0,shield:0});
  state.alive=true;state.queued=false;state.wait=mission.cooldown;
  recordEncounter('quest:'+index);
  mark(mission.name+' 소환');
}
function updateMissions(dt) {
  const waveActive=game.phase==='wave' && (game.spawned<game.count || game.enemies.some(enemy=>enemy.challenge===undefined));
  game.active.forEach((state,index)=>{
    if(state.wait>0) {
      const previous=Math.ceil(state.wait);
      state.wait=Math.max(0,state.wait-dt);
      if(previous!==Math.ceil(state.wait)) mark();
    }
    if(waveActive && !state.alive && state.wait<=0 && (state.queued||state.auto)) spawnMission(index);
  });
}
function completeWave() {
  const round=game.round;
  if(game.cleared>=round) return;
  game.cleared=round;
  if(game.bossDefeated && round%10===0) grantBossRewards();
  profile.best=Math.max(profile.best,round);
  save();
  if(game.bossDefeated && round%10===0) {
    offerRelics(round,()=>finishWave(round));
    return;
  }
  finishWave(round);
}
function grantBossRewards() {
  if(game.bossRewarded) return;
  game.bossRewarded=true;
  awardTicket(bossTicketTier(game.round));
  grantLegacyPoint();
}
function grantLegacyPoint() {
  profile.essence++;
  game.researchEarned++;
  save();
}
function finishWave(round) {
  if (round%50===0 && game.bossDefeated) {
    if(round===maxRound) {endRun('clear');return;}
    recordScore();
    advanceRound(round);
    mark(difficultyNames[difficultyIndex(round)]+' 구간 클리어 · 다음 라운드 준비');
  } else {
    advanceRound(round);
  }
}
function bossTimedOut() {
  const round=game.round;
  game.bossTime=null;
  for(const enemy of game.enemies) if(enemy.challenge!==undefined) game.active[enemy.challenge].alive=false;
  game.enemies=[];
  if(round===maxRound) {endRun('timeout');return;}
  game.round++;
  game.phase='ready';
  startWave();
  mark(round+'라운드 보스 제한시간 초과 · 보상 없이 다음 웨이브 시작');
}
function relicCard(id) {
  const relic=relicCatalog[id];
  const card=document.createElement('span');
  card.className='relic-card';
  const icon=document.createElement('canvas');
  icon.width=36;icon.height=36;icon.setAttribute('aria-hidden','true');
  drawPixels(icon.getContext('2d'),relic.sprite,{a:relic.color,b:'#443956',c:'#fff4df'},5,6,4);
  const description=document.createElement('span');
  const title=document.createElement('strong');
  title.textContent=relic.name+' · '+relic.tier;
  const effect=document.createElement('small');
  effect.textContent=relic.effect;
  description.append(title,effect);
  card.append(icon,description);
  return card;
}
function offerRelics(round,finish) {
  game.phase='relic';
  const candidates=relicCatalog.flatMap((relic,id)=>id===3 || relicRank(id)>=relicLimit?[]:[{
    id,weight:relic.tier==='희귀'?6:10,value:relic.tier==='희귀'?'gold':'silver'
  }]);
  const tier=difficultyIndex(round);
  for(const [base,weight,value] of [[20,14,'bronze'],[40,9,'silver'],[65,5,'gold']]) {
    candidates.push({gold:base+tier*10,weight,value,label:'영혼 '+(base+tier*10),effect:'즉시 지급'});
  }
  for(const [star,weight,value] of [[1,10,'bronze'],[2,7,'silver'],[3,4,'gold']]) {
    candidates.push({star,weight,value,label:star+'성 선택권',effect:'원하는 정규 악마 한 기 선택'});
  }
  const offered=Array.from({length:3},()=>{
    let pick=roll(candidates.reduce((sum,reward)=>sum+reward.weight,0));
    const index=candidates.findIndex(reward=>(pick-=reward.weight)<0);
    return candidates.splice(index,1)[0];
  });
  showDialog(round+'라운드 보스 보상','세 가지 중 하나를 선택하세요. 유물 효과는 최대 '+relicLimit+'단계까지 누적됩니다.',[],true);
  const cards=document.createElement('div');
  cards.className='relic-choices';
  for(const reward of offered) {
    const choice=button('',()=>{
      if(game.phase!=='relic') return;
      if(reward.id!==undefined) {
        game.relics[reward.id]++;
        if(reward.id===4) game.life+=2;
      } else if(reward.star) awardTicket(reward.star);
      else game.gold+=reward.gold;
      closeDialog();
      finish();
    });
    choice.className='reward-choice '+reward.value;
    choice.dataset.reward=reward.id!==undefined?'relic':reward.star?'ticket':'gold';
    const grade=document.createElement('small');
    grade.className='reward-grade';
    grade.textContent={gold:'금',silver:'은',bronze:'동'}[reward.value]+' 등급';
    choice.append(grade);
    if(reward.id!==undefined) choice.append(relicCard(reward.id));
    else {
      const card=document.createElement('span');
      card.className='relic-card';
      const icon=document.createElement('span');
      icon.className='reward-symbol';icon.textContent=reward.star?'▤':'◆';
      const detail=document.createElement('span');
      const label=document.createElement('strong'), effect=document.createElement('small');
      label.textContent=reward.label;effect.textContent=reward.effect;
      detail.append(label,effect);card.append(icon,detail);choice.append(card);
    }
    cards.append(choice);
  }
  $('dialogBody').append(cards);
  mark('보스 격파 · 보상 하나를 선택하세요.');
}
function spawn() {
  const round=game.round;
  const entry=game.plan.entries[game.spawned];
  const threat=Math.min(round,50)+Math.max(0,round-50)*.38;
  const boss=entry.type==='boss', mission=entry.type==='mission';
  if(boss) {game.bossTime=bossLimit;mark();}
  const tier=difficultyIndex(round);
  const durability=[.85,1.12,1.36][tier];
  const bossAdjustment=boss?(round===maxRound?.82:[.78,1.10,1.06][tier]):1;
  const hp=(12+threat*1.7+threat*threat*.19)*enemyTypes[entry.type].hp*durability*bossAdjustment;
  game.enemies.push({...position(0),hp,max:hp,boss,mission,type:entry.type,pattern:boss?game.plan.pattern:null,
    progress:0,stun:0,slow:0,curse:0,shield:0,patternTriggered:false});
  recordEncounter(boss?'boss:'+game.plan.pattern:entry.type);
  game.nextSpawn+=entry.gap;
  game.spawned++;
}
function enemySpeed(enemy,round) {
  const speed=marchSpeed(round)*enemyTypes[enemy.type].speed*(enemy.pattern===1&&enemy.patternTriggered?1.30:1);
  return Math.min(maxEnemySpeed,speed)*(enemy.slow>0?skills.slow.factor:1)*(1-profile.frost*.03)*
    (1-relicRank(2)*.035-relicRank(3)*.07);
}
function hitEnemy(enemy,damage) {
  const absorbed=Math.min(enemy.shield,damage);
  enemy.shield-=absorbed;
  enemy.hp-=damage-absorbed;
}
function step(dt) {
  if (!$('home').hidden || game.paused || $('dialog').open) return;
  if(['ready','wave'].includes(game.phase)) {updateMissions(dt);stepExpedition(dt);}
  if (game.phase==='ready') {
    if (profile.auto) {
      game.autoTime-=dt;
      if (game.autoTime<=0) startWave();
    }
    return;
  }
  if (game.phase!=='wave') return;
  if(game.bossTime!==null) {
    const previous=Math.ceil(game.bossTime);
    game.bossTime=Math.max(0,game.bossTime-dt);
    if(previous!==Math.ceil(game.bossTime)) mark();
    if(game.bossTime===0) {bossTimedOut();return;}
  }
  game.nextSpawn-=dt;
  if (game.spawned<game.count && game.nextSpawn<=0) spawn();
  const live=game.board.flatMap((unit,i)=>unit?[{unit,cell:cells[i]}]:[]);
  const damageBoost=1+relicRank(0)*.06+relicRank(3)*.18;
  const attackPace=1-relicRank(6)*.025;
  for (const {unit,cell} of live) {
    unit.cooldown=Math.max(0,unit.cooldown-dt);
    if (unit.cooldown>0) continue;
    const range=attackRange(unit);
    let target;
    for(const enemy of game.enemies) {
      if(enemy.hp>0 && distance(enemy,cell)<=range && (!target || enemy.progress>target.progress)) target=enemy;
    }
    if (!target) continue;
    const interval=attackInterval(unit);
    unit.cooldown=interval*attackPace;
    const support=live.reduce((multiplier,other)=>{
      if(other.unit===unit) return multiplier;
      if(other.unit.role===4 && distance(cell,other.cell)<skills.curse.radius) return Math.max(multiplier,skills.curse.allyMultiplier);
      if(other.unit.role===5 && other.unit.star>=4 && distance(cell,other.cell)<allRounderAura(other.unit)) return Math.max(multiplier,allRounderBuff(other.unit));
      return multiplier;
    },1);
    const curseActive=target.curse>0;
    const bossBonus=target.boss?(1+relicRank(5)*.08)*(unit.role===0?1+fireBossBonus[unit.star-1]:1):1;
    const executed=unit.star===7 && target.hp<=target.max*seventhSkill.threshold;
    const execute=executed?seventhSkill.multiplier:1;
    const damage=dps(unit)*interval*damageBoost*support*(curseActive?skills.curse.enemyMultiplier:1)*bossBonus*execute;
    hitEnemy(target,damage);
    let effect='hit';
    let burstRadius;
    if (unit.role===1) { target.slow=Math.max(target.slow,skills.slow.duration); effect='frost'; }
    if (unit.role===2 && Math.random()<stunChance(unit)) {
      target.stun=Math.max(target.stun,target.boss?skills.stun.bossDuration:skills.stun.duration);
      effect='stun';
    }
    if (unit.role===4) { target.curse=skills.curse.duration; effect='curse'; }
    if(unit.role===5) {
      burstRadius=allRounderRadius(unit);
      target.slow=Math.max(target.slow,allRounderSlow(unit));
      for(const enemy of game.enemies) if(enemy!==target && enemy.hp>0 && distance(enemy,target)<burstRadius) {
        hitEnemy(enemy,damage*allRounderDamage(unit));
        enemy.slow=Math.max(enemy.slow,allRounderSlow(unit));
      }
      effect='splash';
    }
    if (unit.star>=4 && (unit.role===0 || unit.role===1 || effect==='stun' || (unit.role===4 && curseActive))) {
      burstRadius=eliteRadius(unit);
      const power=elitePower(unit);
      for(const enemy of game.enemies) {
        if(enemy===target || enemy.hp<=0 || distance(enemy,target)>=burstRadius) continue;
        if(unit.role===1) enemy.slow=Math.max(enemy.slow,power);
        else if(unit.role===2) enemy.stun=Math.max(enemy.stun,power*(enemy.boss?skills.stun.bossDuration:skills.stun.duration));
        else hitEnemy(enemy,damage*power);
      }
      if(unit.role===0) effect='splash';
    }
    playAttack(unit.role);
    const duration=.28+unit.star*.035;
    game.shots.push({from:cell,to:{x:target.x,y:target.y},role:unit.role,star:unit.star,effect,
      support:support>1,burstRadius,executed,time:duration,duration});
  }
  for (const enemy of game.enemies) {
    if (enemy.hp<=0) {
      game.kills++;
      if (enemy.boss) {game.bossDefeated=true;game.bossTime=null;game.bossKills++;grantBossRewards();}
      const earners=live.filter(({unit,cell})=>unit.role===3 && distance(cell,enemy)<=attackRange(unit));
      const bonus=Math.max(0,...earners.map(({unit})=>incomeBonus(unit)));
      const bounty=enemy.boss || enemy.mission?Math.max(0,...earners.map(({unit})=>eliteBonus(unit))):0;
      if (bonus) game.shots.push({to:{x:enemy.x,y:enemy.y},role:3,effect:'income',
        star:Math.max(...earners.map(({unit})=>unit.star)),time:.32});
      game.incomeTicks+=skills.income.ticksPerKill+bonus+bounty+relicRank(1)+relicRank(3);
      game.gold+=Math.floor(game.incomeTicks/skills.income.ticksPerSoul)+(enemy.boss?20:0);
      game.incomeTicks%=skills.income.ticksPerSoul;
      if (enemy.mission) {
        const tier=missionTicketTier(game.round);
        game.missionKills++;game.gold+=12;awardTicket(tier);
        mark('미션 몬스터 처치 · 영혼 12 및 '+tier+'성 선택권 획득');
      }
      if(enemy.challenge!==undefined) {
        const mission=activeMissions[enemy.challenge], state=game.active[enemy.challenge];
        state.alive=false;state.clears++;
        game.gold+=mission.gold;
        mark(mission.name+' 처치 · 영혼 '+mission.gold+' 획득');
      }
      mark();
      continue;
    }
    if(enemy.boss && !enemy.patternTriggered && enemy.hp<=enemy.max/2 && enemy.pattern>0) {
      enemy.patternTriggered=true;
      if(enemy.pattern===2) enemy.shield=enemy.max*.18;
      mark('보스 '+bossPatterns[enemy.pattern].label+' 발동');
    }
    if (enemy.stun<=0) enemy.progress+=dt*enemySpeed(enemy,game.round);
    enemy.stun-=dt;
    enemy.slow-=dt;
    enemy.curse-=dt;
    if(enemy.boss) enemy.progress=Math.min(enemy.progress,pathLength-.01);
    Object.assign(enemy,position(enemy.progress));
    if (enemy.progress>=pathLength) {
      if(enemy.challenge!==undefined) {
        game.active[enemy.challenge].alive=false;
        mark(activeMissions[enemy.challenge].name+'이 도주했습니다.');
      } else {
        game.life=Math.max(0,game.life-1);mark('적이 성채에 도달했습니다.');
      }
    }
  }
  game.enemies=game.enemies.filter(enemy=>enemy.hp>0 && enemy.progress<pathLength);
  if (!game.life) endRun('loss');
  else if(game.spawned===game.count && !game.enemies.length) {
    completeWave();
  }
}

function button(label,action,disabled=false,active=false) {
  const element=document.createElement('button');
  element.textContent=label;
  element.onclick=action;
  element.disabled=disabled;
  element.classList.toggle('active',active);
  return element;
}
function renderRecipes() {
  const container=$('recipes');
  for (const star of [5,6,7]) {
    const details=document.createElement('details');
    const summary=document.createElement('summary');
    summary.textContent=star+'성 조합';
    details.append(summary);
    const entries=[];
    const count=identityCount(star);
    for(let identity=star===5?families.length:0;identity<count;identity++) {
      const row=document.createElement('div');
      row.className='recipe-row';
      const portrait=document.createElement('canvas');
      portrait.className='recipe-portrait';
      portrait.width=48; portrait.height=48;
      portrait.setAttribute('aria-hidden','true');
      const paintPortrait=()=>{
        const context=portrait.getContext('2d');
        context.clearRect(0,0,48,48);
        drawDemon(context,recipeTower(star,identity),24,40,2,true);
      };
      paintPortrait();
      const materials=requirements(star,identity).map(([tier,type])=>{
        const material=document.createElement('li');
        material.className='recipe-material';
        material.textContent=tier===0?title(type,1)+' (1~3성 중 한 기)':title(type,tier)+' '+tier+'성';
        return material;
      });
      const list=document.createElement('ul');
      list.className='recipe-materials';
      list.append(...materials);
      const action=button(title(identity,star),()=>combine(recipeMatch(star,identity),recipeTower(star,identity)));
      const description=document.createElement('div');
      const status=document.createElement('span');
      status.className='recipe-status';
      const progress=document.createElement('span');
      progress.className='recipe-progress';
      description.append(action,progress,status,list);
      row.append(portrait,description);
      if(isSpecial(star,identity)) row.classList.add('special-recipe');
      details.append(row);
      entries[identity]={action,row,status,materials,progress,paintPortrait};
    }
    container.append(details);
    recipeButtons.set(star,entries);
  }
}
let lastInspected;
function rewardForPlacement() {
  return game.pick || game.reserve[0];
}
function renderActiveMissions() {
  const host=$('activeMissions');
  const state=game.active.map(x=>[x.auto,x.armed,x.alive,x.queued,x.clears,Math.ceil(x.wait)].join(':')).join('|')+
    ':'+game.round+':'+canCombine();
  if(host.dataset.state===state) return;
  host.dataset.state=state;
  host.replaceChildren(...activeMissions.map((mission,i)=>{
    const status=game.active[i], wait=Math.ceil(status.wait);
    const mode=game.round<mission.unlock?mission.unlock+'라운드 해금':
      [status.auto?'자동 켜짐':status.clears>0&&status.armed?'자동 켜기':'수동 시작',
        status.alive?'전투 중':status.queued?'다음 웨이브 예약':wait?'쿨타임 '+wait+'초':'준비',
        '보상 영혼 '+mission.gold].join(' · ');
    const disabled=!canCombine() || game.round<mission.unlock ||
      (!status.auto && !(status.clears>0&&status.armed) && (status.alive||status.queued||wait>0));
    const control=button(mission.name+' · '+mode,()=>queueMission(i),disabled);
    control.className='active-mission';
    control.setAttribute('aria-pressed',String(status.auto));
    return control;
  }));
}
function renderUI() {
  const ready=game.phase==='ready' && !game.paused;
  $('round').textContent=game.round+' / '+maxRound+' · '+difficultyNames[difficultyIndex(game.round)];
  $('life').textContent=game.life+' / '+maxLife();
  $('gold').textContent=game.gold;
  $('kills').textContent=game.kills;
  $('phase').textContent=game.phase==='over'?'게임 종료':game.phase==='relic'?'보스 보상 선택':game.paused?'일시정지':game.phase==='wave'?
    (game.round%10===0?'보스전':'전투 중')+' · '+(game.count-game.spawned+game.enemies.length)+'마리'+
      (game.bossTime===null?'':' · 보스 '+Math.ceil(game.bossTime)+'초'):
    '준비 시간'+(profile.auto?' · '+Math.max(0,Math.ceil(game.autoTime))+'초':'');
  $('notice').textContent=game.text;
  $('wave').disabled=!['ready','wave'].includes(game.phase);
  const preview=$('wavePreview');
  if (preview.dataset.round!==String(game.round)) {
    preview.dataset.round=String(game.round);
    const plan=game.plan;
    const counts=Object.entries(enemyTypes).flatMap(([type,{label}])=>{
      const number=plan.entries.filter(entry=>entry.type===type).length;
      return number?[label+' '+number]:[];
    });
    preview.textContent=game.round+'라운드 편성 · '+counts.join(' / ')+' · 일반 적 기본 이동속도 '+marchSpeed(game.round).toFixed(2)+
      (plan.pattern===null?'':' · '+bossPatterns[plan.pattern].label+' · '+bossPatterns[plan.pattern].description);
  }
  $('wave').textContent=game.phase==='wave'&&!game.paused?'정지':'웨이브 시작';
  $('researchSkill').hidden=!profile.pulse;
  $('researchSkill').disabled=game.phase!=='wave'||game.paused||game.pulseUsed||!game.enemies.length;
  $('draw').textContent=game.reserve.length?'보상 악마 우선 배치 · Q':'랜덤 소환 · 영혼 '+drawPrice+' · Q';
  $('draw').disabled=!canDraw();
  const emptySelected=game.selected!==game.expedition.slot && game.board[game.selected]===null;
  $('drawHint').textContent=emptySelected?'선택한 발판에 즉시 소환합니다.':'빈 발판을 먼저 선택하세요.';
  $('odds').textContent=odds().map((rate,i)=>i+1+'성 '+rate+'%').join(' / ');
  const reserve=$('reserve');
  reserve.className='chips';
  reserve.replaceChildren(...game.reserve.map(unit=>button(unitName(unit),()=>{
    game.pick=game.pick===unit?null:unit;
    game.moving=false;
    game.mergeSource=null;
    if (game.board[game.selected]) game.selected=null;
    mark();
  },game.paused || game.phase==='over',game.pick===unit)));
  if (!game.reserve.length) reserve.textContent='배치 대기 중인 보상 악마 없음';
  $('place').disabled=!canCombine() || !emptySelected || !rewardForPlacement();
  const selected=game.board[game.selected];
  const inspected=selected || game.pick;
  if (inspected!==lastInspected) {
    game.skillPreview=null;
    delete $('unitStats').dataset.unit;
    lastInspected=inspected;
  }
  $('towerSummary').textContent=inspected?unitName(inspected):'선택한 타워';
  $('selected').textContent=selected?'':game.pick?(emptySelected?'보상 악마 배치 대기 · W':'배치할 빈 발판을 선택하세요.'):emptySelected?'빈 발판 선택됨':'발판을 선택하세요.';
  renderUnitStats($('unitStats'),inspected);
  const [codexIdentity,codexStar]=$('codexUnit').value.split(':').map(Number);
  renderUnitStats($('codexStats'),recipeTower(codexStar,codexIdentity));
  const codexKey=recipeKey(codexStar,codexIdentity);
  $('codexDiscovery').textContent=crafted.has(codexKey)?'합성 완료 기록 있음':discovered.has(codexKey)?'획득 기록 있음':'미획득';
  const enemyList=$('enemyCodex');
  if(enemyList.dataset.count!==String(encounters.size)) {
    enemyList.dataset.count=String(encounters.size);
    $('enemyCount').textContent='만난 적 '+encounters.size+'종';
    enemyList.replaceChildren(...[...encounters].map(key=>{
      const entry=document.createElement('li');
      const [kind,id]=key.split(':');
      const icon=document.createElement('canvas');
      icon.width=96; icon.height=96;
      icon.setAttribute('aria-hidden','true');
      drawAngel(icon.getContext('2d'),key,48,92,88);
      entry.append(icon,document.createTextNode(kind==='boss'?'보스 · '+bossPatterns[id].label:kind==='event'?'특수 보스 · '+eventChallenges[id].name:
        kind==='quest'?'엘리트 · '+activeMissions[id].name:enemyTypes[kind].label));
      return entry;
    }));
  }
  const actions=$('actions');
  actions.replaceChildren();
  if (canPair(selected)) {
    const merge=button(game.mergeSource!==null?'합성 선택 취소 · R':'같은 악마 합성 · R',selectMerge,!canCombine(),game.mergeSource!==null);
    merge.setAttribute('aria-keyshortcuts','R');
    actions.append(merge);
  }
  if (canSell(selected)) {
    const slot=game.selected;
    const sale=button('판매 · 영혼 '+refund(selected),()=>sellTower(slot),!ready);
    sale.className='sell';
    sale.setAttribute('aria-keyshortcuts','E');
    sale.title=ready?'실제 소환 비용의 '+sellPercent+'%를 회수합니다. 소수점은 버립니다.':'준비 시간에만 판매할 수 있습니다.';
    actions.append(sale);
  }
  if(selected?.star>=4) actions.append(button(selected.moved?'이동 기회 사용 완료':game.moving?'이동 취소':'이동 · 자리 교환',()=>{
    game.moving=!game.moving; game.pick=null; mark(game.moving?'목적지 또는 교환할 타워를 선택하세요.':'이동 취소');
  },!ready || selected.moved,game.moving));
  for(const [star,entries] of recipeButtons) entries.forEach(({action,row,status,materials,progress},identity)=>{
    const previouslyCrafted=crafted.has(recipeKey(star,identity));
    const slots=recipeSlots(star,identity);
    const count=slots.filter(index=>index>=0).length;
    action.disabled=!canCombine() || count<slots.length;
    progress.textContent='재료 준비 '+Math.round(count/slots.length*100)+'%';
    materials.forEach((material,i)=>material.classList.toggle('available',slots[i]>=0));
    row.classList.toggle('crafted',previouslyCrafted);
    status.textContent=previouslyCrafted?'제작 기록 있음':'미제작';
  });
  const passive=$('missions');
  const passiveState=game.seen.slice(1).map(seen=>seen.size).join(':')+':'+[...game.passiveDone]+':'+game.missionKills;
  if(passive.dataset.state!==passiveState) {
    passive.dataset.state=passiveState;
    const documents=['첫 정규 1성 소환 '+(game.seen[1].size?'완료':'0/1')+' · 1성 선택권',
      ...[1,2,3].map(star=>star+'성 정규 악마 수집 '+game.seen[star].size+'/'+families.length+' · '+star+'성 선택권'),
      ...formationMissions.map(({name,units,gold},i)=>name+' · '+units.map(([star,id])=>title(id,star)+' '+star+'성').join(' + ')+
        ' 동시 배치 · 영혼 '+gold+(game.passiveDone.has(i)?' · 완료':'')),
      '정기 미션 몬스터 '+game.missionKills+'회 처치'];
    passive.replaceChildren(...documents.map(text=>{
      const line=document.createElement('p');line.textContent=text;return line;
    }));
  }
  renderActiveMissions();
  const zone=game.expedition, eventBoss=eventChallenges[zone.index];
  $('eventInfo').textContent=!eventBoss?'특수 보스 전원 격파':game.round<eventBoss.round?
    eventBoss.name+' · '+eventBoss.round+'라운드 해금':
    eventBoss.name+' · 체력 '+Math.ceil(zone.hp).toLocaleString('ko-KR')+'/'+eventBoss.hp.toLocaleString('ko-KR')+' · 보상 영혼 '+eventBoss.gold+
    (game.phase!=='wave'?' · 웨이브 중 전투':'');
  $('sendEvent').disabled=!canCombine() || !!zone.unit || !selected || !eventBoss || game.round<eventBoss.round;
  $('recallEvent').disabled=!canCombine() || !zone.unit;
  const ticketUI=$('tickets');
  if(ticketUI.dataset.state!==game.tickets.join(',')+':'+canCombine()) {
    ticketUI.dataset.state=game.tickets.join(',')+':'+canCombine();
    ticketUI.replaceChildren(...[1,2,3].map(star=>button(star+'성 선택권 '+game.tickets[star]+'장',()=>openTicket(star),
      !canCombine() || game.tickets[star]===0)));
  }
  $('gamble').disabled=!canGamble();
  $('gambleResult').textContent=game.gambleResult?'최근 결과 · '+game.gambleResult:'준비 시간에 이용할 수 있습니다.';
  const relicBox=$('relics');
  const relicState=game.relics.join(',')+':'+ready;
  if(relicBox.dataset.state!==relicState) {
    relicBox.dataset.state=relicState;
    relicBox.replaceChildren();
    for(const [id,rank] of game.relics.entries()) if(rank) {
      const card=relicCard(id);
      card.append(' ×'+rank);relicBox.append(card);
    }
    if(!relicBox.children.length) relicBox.textContent='획득한 유물 없음';
    if(!relicRank(3) && [0,1,2].every(id=>relicRank(id)>0)) relicBox.append(button('세 유물 합성',()=>{
      if(game.phase!=='ready' || game.paused) return;
      for(const id of [0,1,2]) game.relics[id]--;
      game.relics[3]=1;mark('전설 유물 왕의 심장을 획득했습니다.');
    },!ready));
  }
}
const rankColors=['#abb0ba','#fff9ee','#76d99b','#67b5ff','#b684f6','#ffd160','#ff5e61'];
function drawPixels(context, matrix, palette, x, y, scale) {
  const detail=scale/3;
  const fine=scale/9;
  const shaded=new Set(Object.values(palette)).size>1;
  matrix.forEach((row,dy)=>Array.from(row).forEach((key,dx)=>{
    if (key==='.') return;
    const left=x+dx*scale, top=y+dy*scale;
    context.fillStyle=palette[key];
    context.fillRect(left,top,scale,scale);
    if(key==='o' || !shaded) return;
    if(matrix[dy-1]?.[dx]!==key || key==='c') {
      context.fillStyle=key==='c'?'#fff6dcaa':'#fff3cc43';
      context.fillRect(left+detail,top,detail*2,detail);
    }
    if(row[dx+1]!==key || key==='b') {
      context.fillStyle='#19172e73';
      context.fillRect(left+2*detail,top+detail,detail,detail*2);
    }
    if(key==='c' || (key==='a' && (dx+dy)%3===0)) {
      context.fillStyle=key==='c'?'#fff8d3':'#f4e6b15c';
      context.fillRect(left+fine*2,top+fine*2,fine*3,fine);
      context.fillRect(left+fine*2,top+fine*3,fine,fine*2);
    }
    if(key==='b' && (dx+2*dy)%4===0) {
      context.fillStyle='#17112791';
      context.fillRect(left+fine*2,top+fine*6,fine*4,fine);
    }
  }));
}
const demonImages=new Map();
const angelImages=new Map();
const outlinedDemonImages=new Map();

async function decodeSprites(bundle,images) {
  const decoded=await Promise.all(Object.entries(bundle).map(async ([key,encoded])=>{
    const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
    const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
    return [key,image];
  }));
  for(const [key,image] of decoded) images.set(key,image);
}
async function loadUnitSprites() {
  await Promise.all([decodeSprites(bundledDemonSprites,demonImages),decodeSprites(bundledAngelSprites,angelImages)]);
  const angelKeys=['normal','swift','tank','swarm','mission',
    ...bossPatterns.map((_,i)=>'boss:'+i),...activeMissions.map((_,i)=>'quest:'+i),...eventChallenges.map((_,i)=>'event:'+i)];
  if(demonImages.size!==Array.from({length:maxStar},(_,i)=>identityCount(i+1)).reduce((sum,n)=>sum+n,0) ||
      angelKeys.some(key=>!angelImages.has(key))) throw new Error('Incomplete unit sprite bundle');
  delete $('enemyCodex').dataset.count;
  for(const entries of recipeButtons.values()) entries.forEach(entry=>entry.paintPortrait());
  delete $('unitStats').dataset.unit;
  delete $('codexStats').dataset.unit;
  mark();
}

function outlinedDemonImage(key,image,star) {
  let outlined=outlinedDemonImages.get(key);
  if(outlined) return outlined;
  // Pad the source canvas so outlines around edge pixels remain visible.
  const padding=Math.round(image.width*1.25/44);
  const diagonal=Math.round(padding/Math.SQRT2);
  const canvas=document.createElement('canvas');
  canvas.width=image.width+padding*2;
  canvas.height=image.height+padding*2;
  const context=canvas.getContext('2d');
  for(const [dx,dy] of [
    [0,-padding],[-padding,0],[padding,0],[0,padding],
    [-diagonal,-diagonal],[diagonal,-diagonal],[-diagonal,diagonal],[diagonal,diagonal]
  ]) context.drawImage(image,padding+dx,padding+dy);
  context.globalCompositeOperation='source-in';
  context.fillStyle=rankColors[star-1];
  context.fillRect(0,0,canvas.width,canvas.height);
  context.globalCompositeOperation='source-over';
  context.drawImage(image,padding,padding);
  outlined={canvas,padding};
  outlinedDemonImages.set(key,outlined);
  return outlined;
}

function drawDemon(context,unit,x,y,scale,silhouette=false) {
  const key=recipeKey(unit.star,unit.identity);
  const image=demonImages.get(key);
  if(!image) return false;
  const size=44*scale/3;
  const foot=unit.star===7?size:size*122/128;
  const left=x-size/2, top=y-foot;
  context.save();
  context.imageSmoothingEnabled=false;
  if(silhouette) {
    context.filter='brightness(0) invert(24%) sepia(19%) saturate(800%)';
    context.drawImage(image,left,top,size,size);
  } else {
    const {canvas,padding}=outlinedDemonImage(key,image,unit.star);
    const gutter=padding*size/image.width;
    context.drawImage(canvas,left-gutter,top-gutter,size+gutter*2,size+gutter*2);
  }
  context.restore();
  return true;
}
function renderUnitStats(container,unit) {
  const key=unit?unit.identity+':'+unit.star+':'+profile.spark:'';
  if(container.dataset.unit===key) return;
  container.dataset.unit=key;
  container.dataset.sprite=unit?recipeKey(unit.star,unit.identity):'';
  container.replaceChildren();
  if(!unit) return;
  const card=document.createElement('div');
  card.className='profile-card';
  const portrait=document.createElement('canvas');
  portrait.width=48*sceneResolution; portrait.height=48*sceneResolution;
  portrait.setAttribute('aria-hidden','true');
  const portraitContext=portrait.getContext('2d');
  portraitContext.scale(sceneResolution,sceneResolution);
  drawDemon(portraitContext,unit,24,41,2);
  const heading=document.createElement('div');
  const name=document.createElement('strong');
  name.textContent=unitName(unit);
  const role=document.createElement('span');
  role.textContent=unit.star+'성 등급 · '+roleData[unit.role].label;
  heading.append(name,role);
  card.append(portrait,heading);
  const fmt=value=>String(Number(value.toFixed(2)));
  const pct=value=>fmt(value*100)+'%';
  const damage=dps(unit)*attackInterval(unit);
  const lines=[['기본 공격',fmt(damage)+' 피해 / '+fmt(attackInterval(unit))+'초 · 기본 DPS '+dps(unit)+' · 사거리 '+fmt(attackRange(unit))+
    '칸. 사거리 안에서 출구에 가장 가까운 적을 우선 공격합니다.']];
  const {slow,stun,income,curse}=skills;
  switch(unit.role) {
    case 0:
      lines.push([isSpecial(unit.star,unit.identity)?'공허격':'화염격','보스를 공격할 때 피해량 +'+pct(fireBossBonus[unit.star-1])+'.','attack']);
      break;
    case 1:
      lines.push(['혹한', '적중 시 100% 발동. '+slow.duration+'초 동안 이동속도 '+pct(1-slow.factor)+' 감소. 재적중하면 지속시간을 갱신합니다.','attack']);
      break;
    case 2:
      lines.push(['벼락 기절','적중 시 '+pct(stunChance(unit))+' 확률 (계승 전 '+pct(stun.base+unit.star*stun.perStar)+'). 일반 적 '+stun.duration+
        '초, 보스 '+stun.bossDuration+'초간 정지합니다.','attack']);
      break;
    case 3:
      lines.push(['탐욕의 징수','아군이 이 타워의 사거리 내 적을 처치하면 영혼 +'+incomeBonus(unit)+'/'+income.ticksPerSoul+
        '. 여러 징수 효과 중 최대치만 적용되며, 소수 보상은 누적됩니다.','attack']);
      break;
    case 4:
      lines.push(['심연의 가호와 낙인',curse.radius+'칸 안의 다른 아군의 피해량 ×'+curse.allyMultiplier+
        ' (중첩 없음). 적중한 적은 '+curse.duration+'초간 받는 피해 ×'+curse.enemyMultiplier+'.','aura']);
      break;
    case 5:
      lines.push(['균열 공명','적중한 대상과 주변 '+fmt(allRounderRadius(unit))+'칸의 적을 '+fmt(allRounderSlow(unit))+
        '초간 둔화합니다. 주변 적은 타격 피해의 '+pct(allRounderDamage(unit))+'를 받습니다.','hybrid']);
      if(unit.star>=4) lines.push(['결속','주변 '+fmt(allRounderAura(unit))+'칸 안의 다른 아군 피해량 ×'+
        fmt(allRounderBuff(unit))+'. 다른 피해 강화 오라와는 높은 효과만 적용됩니다.','hybridAura']);
      break;
  }
  if(unit.star>=4 && unit.role!==5) {
    const power=elitePower(unit), radius=eliteRadius(unit);
    const descriptions=[
      '적중 시 대상 주변 '+radius+'칸의 다른 적에게 타격 피해의 '+pct(power)+'를 줍니다.',
      '적중 시 대상 주변 '+radius+'칸의 다른 적을 '+power+'초간 '+pct(1-slow.factor)+' 둔화시킵니다.',
      '기절 발동 시 대상 주변 '+radius+'칸의 다른 적을 기본 기절 시간의 '+pct(power)+'만큼 정지시킵니다.',
      '사거리 내 미션 몬스터 또는 보스 처치 시 영혼 +'+power+'/'+income.ticksPerSoul+'. 여러 현상금 중 최대치만 적용됩니다.',
      '이미 낙인에 걸린 적을 적중시키면 대상 주변 '+radius+'칸의 다른 적에게 타격 피해의 '+pct(power)+'를 줍니다.'
    ];
    lines.push([eliteSpec(unit).name,descriptions[unit.role],unit.role===3?'attack':'burst']);
  }
  if(unit.star===7) lines.push(['종말의 군림','대상 체력이 '+pct(seventhSkill.threshold)+' 이하일 때 공격 피해 ×'+
    fmt(seventhSkill.multiplier)+'.','attack']);
  const dl=document.createElement('dl');
  dl.className='skill-text';
  for(const [label,description,range] of lines) {
    const dt=document.createElement('dt'), dd=document.createElement('dd');
    dt.textContent=label;
    dd.textContent=description;
    if (range && container===$('unitStats')) {
      const rangeButton=button('범위 보기',()=>{
        const current=game.board[game.selected];
        if (!current) return;
        game.skillPreview=game.skillPreview?.label===label?null:{label,range};
        for(const control of container.querySelectorAll('.range-button')) {
          const active=control===rangeButton && Boolean(game.skillPreview);
          control.classList.toggle('active',active);
          control.setAttribute('aria-pressed',String(active));
        }
      });
      rangeButton.className='range-button';
      rangeButton.setAttribute('aria-pressed','false');
      rangeButton.setAttribute('aria-label',label+' 범위 보기');
      dt.append(' ',rangeButton);
      dd.className='unit-skill';
    }
    dl.append(dt,dd);
  }
  container.append(card,dl);
}
const boardCanvas=$('board');
const groundCanvas=$('boardGround');
const sceneResolution=9;
const boardWidth=680,boardHeight=680,boardUnitScale=3;
const demonCache=new Map();
function prepareBoard() {
  if(boardCanvas.width===boardWidth*sceneResolution) return;
  for(const layer of [boardCanvas,groundCanvas]) {
    layer.width=boardWidth*sceneResolution;layer.height=boardHeight*sceneResolution;
  }
  ctx.scale(sceneResolution,sceneResolution);
  makeGround();
}
function paintBoardDemon(unit,x,y,attack) {
  const key=recipeKey(unit.star,unit.identity);
  let sprite=demonCache.get(key);
  if(!sprite) {
    sprite=document.createElement('canvas');
    sprite.width=64*sceneResolution;sprite.height=60*sceneResolution;
    const paint=sprite.getContext('2d');
    paint.scale(sceneResolution,sceneResolution);
    if(!drawDemon(paint,unit,32,52,boardUnitScale)) return;
    demonCache.set(key,sprite);
  }
  ctx.save();
  if(attack) transformAttack(ctx,x,y,attack,attack.to.x-attack.from.x,attack.to.y-attack.from.y);
  else ctx.translate(x,y);
  ctx.drawImage(sprite,-32,-52,64,60);
  ctx.restore();
}
const tileScale=48, boardLeft=52, boardTop=72;
const project=(x,y)=>({x:boardLeft+x*tileScale,y:boardTop+y*tileScale});
const portalSprite=['....oo....','..oaaaao..','.oaaccaao.','oacbbbcaoo','oacbhhcaoo','oacbhhcaoo','oacbbbcaao','.oacccaao.','..oooooo..'];
const castleSprite=['oo..oo..oo','oo..oo..oo','oaooaaooao','oahhaahhao','oaaaccaaao','oaacbbcaao','oaabbbaaao','oooooooooo'];
function angelKey(enemy) {
  if(enemy.boss) return 'boss:'+(enemy.pattern ?? 0);
  return enemy.challenge===undefined?enemy.type:'quest:'+enemy.challenge;
}
function drawAngel(context,key,x,y,size,filter='none',stride=null) {
  const image=angelImages.get(key);
  if(!image) return;
  context.save();
  context.imageSmoothingEnabled=false;
  if(filter!=='none') context.filter=filter;
  context.translate(x,y);
  if(stride===null) {
    context.drawImage(image,-size/2,-size*122/128,size,size);
  } else {
    const swing=Math.sin(stride);
    context.translate(0,-Math.abs(swing)*size*.042);
    context.rotate(swing*.065);
    const split=Math.round(image.height*.72);
    const torso=split*size/image.height;
    const legHeight=size-torso;
    const top=-size*122/128;
    context.drawImage(image,0,0,image.width,split,-size/2,top,size,torso);
    // Shear each lower half from the hip line so the two feet alternate.
    for(const side of [-1,1]) {
      const sourceLeft=side===-1?0:Math.floor(image.width/2);
      const sourceWidth=side===-1?Math.floor(image.width/2):image.width-sourceLeft;
      const step=swing*side;
      context.save();
      context.translate(side===-1?-size/2:0,top+torso);
      context.transform(1,0,step*.30,1-Math.max(0,step)*.17,0,0);
      context.drawImage(image,sourceLeft,split,sourceWidth,image.height-split,0,0,size/2,legHeight);
      context.restore();
    }
  }
  context.restore();
}
function paintEffect(shot) {
  const {to,from,effect,role,support,time,burstRadius}=shot;
  const p=project(to.x,to.y);
  const x=Math.round(p.x),y=Math.round(p.y);
  if (effect==='craft') {
    const age=1-time/shot.duration;
    const radius=Math.round(8+age*(shot.star===5?58:42));
    const color=rankColors[shot.star-1];
    ctx.save();
    ctx.globalAlpha=Math.min(1,time*2.1);
    ctx.strokeStyle=color;ctx.lineWidth=shot.star===5?3:2;
    ctx.strokeRect(x-radius/2,y-radius/2,radius,radius);
    ctx.beginPath();
    ctx.arc(x,y,radius*.58,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle=color;
    for(let i=0;i<12;i++) {
      const angle=i*Math.PI/6+age;
      const dx=Math.round(Math.cos(angle)*radius),dy=Math.round(Math.sin(angle)*radius);
      ctx.fillRect(x+dx-2,y+dy-2,shot.star===5?5:3,shot.star===5?5:3);
    }
    ctx.restore();
    return;
  }
  const age=effectAge(shot);
  const impact=Math.max(0,(age-.22)/.78);
  const color=roleData[role].color;
  ctx.save();
  if(from) {
    const a=project(from.x,from.y);
    const travel=Math.min(1,age/.30);
    const head={x:a.x+(x-a.x)*travel,y:a.y-10+(y-a.y+10)*travel};
    ctx.globalAlpha=Math.min(1,time*7);
    ctx.strokeStyle=color;
    ctx.lineWidth=shot.star>=5?3:2;
    ctx.beginPath();
    ctx.moveTo(a.x,a.y-10);
    if(effect==='stun') ctx.lineTo((a.x+head.x)/2-4,(a.y+head.y)/2+5);
    ctx.lineTo(head.x,head.y);
    ctx.stroke();
    if(support) {
      ctx.fillStyle='#e7c4ff';
      ctx.fillRect(a.x-10,a.y-12,4,4);
      ctx.fillRect(a.x+7,a.y-12,4,4);
    }
  }
  if(impact>0) paintSkillImpact(ctx,x,y,shot,impact,burstRadius?burstRadius*tileScale:undefined);
  ctx.restore();
}
function effectAge(shot) {
  return Math.max(0,Math.min(1,1-shot.time/(shot.duration ?? (shot.effect==='income'?.32:.25))));
}
function transformAttack(context,x,y,attack,dx,dy) {
  const age=effectAge(attack);
  const distance=Math.hypot(dx,dy)||1;
  const melee=attack.role===0 || attack.role===2;
  const anticipation=-3*Math.sin(Math.PI*Math.min(1,age/.2));
  const strike=Math.sin(Math.PI*Math.max(0,(age-.2)/.8));
  const travel=anticipation+strike*(melee?11:4);
  context.translate(x+dx/distance*travel,y+dy/distance*travel-strike*(melee?2:5));
  context.rotate(dx/distance*(melee?.17:-.1)*strike);
  context.scale(1+strike*.10,1+strike*(melee?-.09:.12));
}
function paintSkillImpact(context,x,y,shot,age,area) {
  const star=shot.star ?? 1;
  const {effect,role}=shot;
  const color=roleData[role].color;
  const radius=4+age*(area ?? (effect==='hit'?8+star:13+star*2));
  const fragments=(effect==='hit'?3:5)+star*(effect==='hit'?1:2);
  const accent=rankColors[star-1];
  context.save();
  context.globalAlpha=1-age;
  context.fillStyle=effect==='income'?'#ffd970':color;
  for(let i=0;i<fragments;i++) {
    const angle=i*Math.PI*2/fragments+age*(effect==='curse'?1.7:.35);
    const px=Math.round(x+Math.cos(angle)*radius);
    const py=Math.round(y+Math.sin(angle)*radius-(effect==='income'?age*12:0));
    const size=star>=5?4:2;
    context.fillRect(px,py,size,effect==='frost'?size+2:size);
  }
  if(star>=3) {
    context.strokeStyle=color;
    context.lineWidth=star>=5?2.5:1.5;
    context.beginPath();
    context.arc(x,y,radius,0,Math.PI*2);
    context.stroke();
  }
  if(star>=5) {
    context.strokeStyle=accent;
    context.beginPath();
    context.arc(x,y,radius*.57,age*Math.PI,(age+1.65)*Math.PI);
    context.stroke();
    context.fillStyle=accent;
    for(let i=0;i<star-2;i++) {
      const angle=i*Math.PI*2/(star-2)-age;
      const px=x+Math.cos(angle)*radius*.74,py=y+Math.sin(angle)*radius*.74;
      context.fillRect(px-3,py-1,7,2);
      context.fillRect(px,py-3,2,7);
    }
  }
  if(star===7) {
    context.lineWidth=shot.executed?3:1.5;
    context.strokeStyle=shot.executed?'#fff1da':accent;
    context.beginPath();
    for(let i=0;i<6;i++) {
      const angle=i*Math.PI/3-age;
      const px=x+Math.cos(angle)*radius*1.17,py=y+Math.sin(angle)*radius*1.17;
      if(i===0) context.moveTo(px,py);
      else context.lineTo(px,py);
    }
    context.closePath();
    context.stroke();
  }
  context.restore();
}
function paintAura(x,y,star) {
  const radius=18+(star-4)*5;
  ctx.strokeStyle=rankColors[star-1];ctx.lineWidth=2;
  ctx.globalAlpha=.72;
  ctx.beginPath();
  ctx.ellipse(x,y+6,radius,12,0,0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle=rankColors[star-1];
  ctx.globalAlpha=.18;
  ctx.fill();
  ctx.globalAlpha=1;
  if(star>=5) for(const dx of [-radius+3,-radius+9,radius-9,radius-3]) ctx.fillRect(x+dx,y-5-Math.abs(dx)%5,3,3);
}
function floor(x,y,w,h,fill,stroke,line,draw=ctx) {
  const p=project(x,y);
  const left=Math.round(p.x), top=Math.round(p.y), width=Math.round(w*tileScale), height=Math.round(h*tileScale);
  draw.fillStyle=fill;
  draw.fillRect(left,top,width,height);
  if(stroke){draw.strokeStyle=stroke;draw.lineWidth=line;draw.strokeRect(left,top,width,height);}
}
function rangeCircle(x,y,radius,color,dashed=false) {
  ctx.save();
  ctx.beginPath();ctx.arc(x,y,radius*tileScale,0,Math.PI*2);
  ctx.fillStyle=color;ctx.globalAlpha=.10;ctx.fill();
  ctx.globalAlpha=.82;ctx.strokeStyle=color;ctx.lineWidth=2;
  if(dashed) ctx.setLineDash([6,5]);
  ctx.stroke();ctx.restore();
}
function paintRange() {
  const unit=game.board[game.selected];
  if (!unit) return;
  const cell=cells[game.selected], p=project(cell.x,cell.y);
  const radius=attackRange(unit), preview=game.skillPreview?.range;
  if(preview!=='attack') rangeCircle(p.x,p.y,radius,'#eaa979');
  if(preview==='attack') rangeCircle(p.x,p.y,radius,roleData[unit.role].color);
  if(preview==='aura' || preview==='hybridAura') rangeCircle(p.x,p.y,preview==='aura'?skills.curse.radius:allRounderAura(unit),roleData[unit.role].color,true);
  if(preview==='burst' || preview==='hybrid') {
    const point=pointerWorld || {x:cell.x+radius/2,y:cell.y};
    const fraction=Math.min(1,radius/(distance(cell,point)||1));
    const center=project(cell.x+(point.x-cell.x)*fraction,cell.y+(point.y-cell.y)*fraction);
    rangeCircle(center.x,center.y,preview==='hybrid'?allRounderRadius(unit):eliteRadius(unit),roleData[unit.role].color,true);
  }
}
function makeGround() {
  const ctx=groundCanvas.getContext('2d');
  ctx.scale(sceneResolution,sceneResolution);
  const stone=ctx.createRadialGradient(340,345,170,340,345,414);
  stone.addColorStop(0,'#454631');stone.addColorStop(1,'#262b22');
  ctx.fillStyle=stone;
  ctx.fillRect(0,0,boardWidth,boardHeight);
  floor(-.27,-.26,12.44,12.45,'#50553a','#837358',2,ctx);
  function flecks(left,top,width,height,colors) {
    for(let y=0;y<height-4;y+=7) for(let x=0;x<width-4;x+=8) {
      const sample=(Math.imul(x+left,53)^Math.imul(y+top,197))>>>0;
      if (sample%7>3) continue;
      ctx.fillStyle=colors[sample%colors.length];
      ctx.fillRect(left+x+sample%4,top+y,sample%3+2,sample%2+1);
      if(sample%5<3) {
        ctx.fillStyle=sample%2?'#c3b48050':'#242b2466';
        ctx.fillRect(left+x+1/3,top+y+1,2/3,4/3);
        ctx.fillRect(left+x+3,top+y+3,4/3,2/3);
      }
    }
  }
  flecks(2,5,676,670,['#566044','#71664a','#444b36','#949069']);
  ctx.lineJoin='round';
  function road(color,width) {
    ctx.beginPath();
    points.forEach(([x,y],i)=>{const p=project(x,y); i?ctx.lineTo(Math.round(p.x),Math.round(p.y)):ctx.moveTo(Math.round(p.x),Math.round(p.y));});
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  road('#35372d',35);
  road('#827a69',30);
  road('#938b78',25);
  for(let i=.25;i<pathLength;i+=.27) {
    const at=position(i);
    const p=project(at.x,at.y);
    const next=position(i+.02);
    const horizontal=at.x!==next.x;
    const offset=(Math.round(i*31)%11)-5;
    ctx.fillStyle=Math.round(i*13)%2?'#837969':'#a59a82';
    ctx.fillRect(Math.round(p.x)+(horizontal?0:offset),Math.round(p.y)+(horizontal?offset:0),horizontal?4:2,horizontal?2:4);
    const x=Math.round(p.x),y=Math.round(p.y);
    ctx.fillStyle='#675c555e';
    ctx.fillRect(x+(horizontal?0:-11),y+(horizontal?-11:0),horizontal?1/3:7,horizontal?7:1/3);
    ctx.fillStyle='#c1b59b6c';
    ctx.fillRect(x+(horizontal?1:-11),y+(horizontal?-10:1),horizontal?1/3:6,horizontal?6:1/3);
  }
  for(let i=1;i<pathLength;i+=1.15) {
    const a=position(i), b=position(i+.1), p=project(a.x,a.y), q=project(b.x,b.y);
    const dx=Math.sign(q.x-p.x),dy=Math.sign(q.y-p.y);
    ctx.fillStyle='#d5bd92';
    for(let j=-2;j<=2;j++) {
      const offset=2-Math.abs(j);
      ctx.fillRect(Math.round(p.x+(dx*offset-dy*j)*3)-1,Math.round(p.y+(dy*offset+dx*j)*3)-1,3,3);
    }
  }
  for(const {x,y,columns,rows} of blocks) {
    const left=x-.49, top=y-.49, width=.98+cellPitch*(columns-1),height=.98+cellPitch*(rows-1);
    floor(left-.06,top-.05,width+.12,height+.13,'#333828','#4d4837',2,ctx);
    floor(left,top,width,height,'#65734a','#b4a173',1,ctx);
    const p=project(left,top);
    flecks(Math.round(p.x),Math.round(p.y),Math.round(width*tileScale),Math.round(height*tileScale),
      ['#566743','#7d8656','#959061','#6d7751','#747c52']);
  }
  const thicket=['.....aa.....','...aabbba...','..abccbbaa..','.abbcbbcba..','abccbcbbbaaa','abbcbccbccba','.abbbbbbbaa.','..aaaooaaa..','....ahoo....','....oooo....'];
  const rock=['.....aa...','...aabaa..','..abcccaa.','.abbcbbbao','oabbbbbboo','..oooooo..'];
  for(const [x,y,size] of [[5,81,3],[31,223,2],[7,374,3],[22,542,2],[641,82,3],[648,278,2],[640,421,3],[647,590,2]]) {
    const shade=y%3===0?'#757746':'#4a583a';
    drawPixels(ctx,thicket,{a:'#354130',b:shade,c:'#899362',h:'#88664b',o:'#44382b'},x,y,size);
  }
  for(const [x,y] of [[22,143],[10,304],[23,475],[645,157],[648,361],[648,541],[310,641]]) {
    drawPixels(ctx,rock,{a:'#736d5e',b:'#56544b',c:'#a29d87',o:'#3a3d33'},x,y,2);
  }
  for (const [x,text,color] of [[.3,'입구','#f9a47f'],[4,'출구','#a4bff9']]) {
    const p=project(x,0);
    const entry=x<1;
    const palette=entry?{o:'#130c1a',a:'#ac71fc',b:'#532fa7',c:'#ede2fe',h:'#8497ff'}:
      {o:'#141423',a:'#92a7c5',b:'#26253b',c:'#e2cdf9',h:'#56617e'};
    drawPixels(ctx,entry?portalSprite:castleSprite,palette,Math.round(p.x)-15,p.y-28,3);
    ctx.fillStyle=color;ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText(text,p.x,p.y-34);
  }
}
function paintRankStar(x,y,radius,color) {
  ctx.beginPath();
  for(let point=0;point<10;point++) {
    const angle=point*Math.PI/5-Math.PI/2;
    const length=point%2?radius*.46:radius;
    const px=x+Math.cos(angle)*length,py=y+Math.sin(angle)*length;
    if(point===0) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.lineWidth=1.3;ctx.strokeStyle='#211627';ctx.stroke();
  ctx.fillStyle=color;ctx.fill();
}
function paintRankBadge(x,y,star,now) {
  const color=rankColors[star-1];
  if(star<=5) {
    for(let i=0;i<star;i++) paintRankStar(x+(i-(star-1)/2)*6,y,3.2,color);
    return;
  }
  ctx.save();
  ctx.strokeStyle=color;
  ctx.lineWidth=1.25;
  if(star===6) {
    ctx.beginPath();
    ctx.ellipse(x,y,10,3.8,-.23,0,Math.PI*2);
    ctx.stroke();
  } else {
    ctx.globalAlpha=.68+.32*Math.sin(now/150)**2;
    ctx.beginPath();
    for(const side of [-1,1]) {
      ctx.moveTo(x+side*7,y+2);
      ctx.lineTo(x+side*12,y);
      ctx.lineTo(x+side*8,y-3);
      ctx.moveTo(x+side*9,y+4);
      ctx.lineTo(x+side*14,y+2);
    }
    ctx.stroke();
  }
  ctx.restore();
  paintRankStar(x,y,star===7?6.4:5.4,color);
}
function paintBoard(now) {
  ctx.clearRect(0,0,boardWidth,boardHeight);
  for(let i=0;i<cells.length;i++) {
    const {x,y}=cells[i], unit=game.board[i], selected=i===game.selected;
    if(selected || i===hoveredIndex) floor(x-.43,y-.43,.86,.86,'#c89f6359',selected?'#ffd598':'#e2cd9c88',selected?2:1);
    if (!unit) floor(x-.035,y-.035,.07,.07,'#e3d8aa65');
    if(i===game.expedition.slot) {
      const p=project(x,y);ctx.fillStyle='#e4bdff';ctx.textAlign='center';ctx.font='bold 12px system-ui';
      ctx.fillText('파견',p.x,p.y);
    }
  }
  const mergeUnit=game.board[game.mergeSource];
  if(!mergeUnit) paintRange();
  const motions=new Map();
  for(const shot of game.shots) if(shot.from) motions.set(shot.from,shot);
  const figures=game.enemies.map(enemy=>({p:project(enemy.x,enemy.y),enemy}));
  game.board.forEach((unit,i)=>{if(unit) figures.push({p:project(cells[i].x,cells[i].y),unit,cell:cells[i],i});});
  const drawLayer=figure=>isPairMatch(mergeUnit,figure.unit)?3:figure.enemy?2:figure.i===game.selected?1:0;
  figures.sort((a,b)=>drawLayer(a)-drawLayer(b) || a.p.y-b.p.y);
  let mergeShadePainted=false;
  for(const {p,unit,enemy,cell,i} of figures) {
    if(!mergeShadePainted && isPairMatch(mergeUnit,unit)) {
      for(const shot of game.shots) paintEffect(shot);
      ctx.fillStyle='#100c17bd';
      ctx.fillRect(0,0,boardWidth,boardHeight);
      mergeShadePainted=true;
    }
    const x=Math.round(p.x),y=Math.round(p.y);
    if(unit) {
      ctx.beginPath();ctx.ellipse(x,y+12,18,9,0,0,Math.PI*2);
      ctx.fillStyle='#201d28a8';ctx.fill();
      ctx.strokeStyle=rankColors[unit.star-1];ctx.lineWidth=1.5;ctx.stroke();
      if(unit.star>=6) paintAura(x,y,unit.star);
      const attack=motions.get(cell);
      const idle=Math.round(Math.sin(now/270+i*1.7)*(unit.star>=4?2:1.5));
      paintBoardDemon(unit,x,y+16+idle,attack);
      paintRankBadge(x,y+18,unit.star,now);
    } else {
      const size=enemy.boss?58:enemy.type==='tank'?37:enemy.type==='swarm'?26:32;
      const stride=enemy.stun>0?null:enemy.progress*(enemy.boss?11:17);
      const foot=y+10, top=foot-size, width=size*.72, left=x-width/2;
      const filter=enemy.stun>0?'brightness(1.55)':enemy.slow>0?'saturate(.55) brightness(1.14)':
        enemy.shield>0?'brightness(1.25)':'none';
      drawAngel(ctx,angelKey(enemy),x,foot,size,filter,stride);
      ctx.fillStyle='#231925';ctx.fillRect(left,top-5,width,3);
      ctx.fillStyle='#ff8e86';ctx.fillRect(left,top-5,Math.round(width*Math.max(0,enemy.hp/enemy.max)),3);
    }
  }
  if(!mergeShadePainted) for(const shot of game.shots) paintEffect(shot);
}
let pointerWorld=null;
function worldAtPointer(event) {
  const box=boardCanvas.getBoundingClientRect();
  return {x:((event.clientX-box.left)*boardWidth/box.width-boardLeft)/tileScale,
    y:((event.clientY-box.top)*boardHeight/box.height-boardTop)/tileScale};
}
function cellAtPointer(event) {
  const {x,y}=worldAtPointer(event);
  return cells.findIndex(cell=>Math.abs(cell.x-x)<=.46 && Math.abs(cell.y-y)<=.46);
}
const boardSurface=boardCanvas.parentElement;
const map=boardSurface.parentElement;
const camera={zoom:1,x:0,y:0,drag:null};
function updateCamera() {
  function clamped(offset,base,size,view) {
    if(camera.zoom===1) return 0;
    const scaled=size*camera.zoom;
    return scaled<=view?(view-scaled)/2-base:Math.max(view-base-scaled,Math.min(-base,offset));
  }
  camera.x=clamped(camera.x,boardSurface.offsetLeft,boardSurface.offsetWidth,map.clientWidth);
  camera.y=clamped(camera.y,boardSurface.offsetTop,boardSurface.offsetHeight,map.clientHeight);
  boardSurface.style.transform='translate('+camera.x+'px,'+camera.y+'px) scale('+camera.zoom+')';
  map.classList.toggle('zoomed',camera.zoom>1);
}
map.addEventListener('wheel',event=>{
  if (!event.ctrlKey || !event.deltaY) return;
  event.preventDefault();
  const bounds=boardCanvas.getBoundingClientRect();
  const next=Math.max(1,Math.min(3,camera.zoom*(event.deltaY<0?1.2:1/1.2)));
  const change=1-next/camera.zoom;
  camera.x+=(event.clientX-bounds.left)*change;
  camera.y+=(event.clientY-bounds.top)*change;
  camera.zoom=next;
  updateCamera();
  hoveredIndex=-1;pointerWorld=null;updateTowerTooltip();
},{passive:false});
window.addEventListener('resize',updateCamera);
boardCanvas.addEventListener('pointerdown',event=>{
  if(camera.zoom===1 || event.button!==0 || !event.isPrimary) return;
  camera.drag={id:event.pointerId,x:event.clientX,y:event.clientY,baseX:camera.x,baseY:camera.y,moved:false};
  boardCanvas.setPointerCapture(event.pointerId);
});
function stopPan() {
  const moved=camera.drag?.moved;
  camera.drag=null;
  map.classList.remove('dragging');
  return moved;
}
boardCanvas.addEventListener('pointerup',event=>{
  if (stopPan() || event.button!==0) return;
  const index=cellAtPointer(event);
  if(index>=0) chooseCell(index);
});
boardCanvas.addEventListener('pointercancel',stopPan);
window.addEventListener('pointerup',stopPan);
window.addEventListener('blur',stopPan);
boardCanvas.addEventListener('dragstart',event=>event.preventDefault());
let hoveredIndex=-1;
function updateTowerTooltip() {
  const tooltip=$('towerTooltip'), unit=game.board[hoveredIndex];
  tooltip.hidden=!unit;
  if (unit) tooltip.textContent=unitName(unit);
}
boardCanvas.addEventListener('pointermove',event=>{
  if (camera.drag?.id===event.pointerId) {
    const drag=camera.drag, dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(drag.moved || Math.hypot(dx,dy)>4) {
      drag.moved=true;
      camera.x=drag.baseX+dx;camera.y=drag.baseY+dy;
      map.classList.add('dragging');
      updateCamera();
      hoveredIndex=-1;pointerWorld=null;updateTowerTooltip();
      return;
    }
  }
  pointerWorld=worldAtPointer(event);
  hoveredIndex=event.pointerType==='touch'?-1:cellAtPointer(event);
  updateTowerTooltip();
  if (hoveredIndex<0 || !game.board[hoveredIndex]) return;
  const tooltip=$('towerTooltip'), bounds=map.getBoundingClientRect();
  tooltip.style.left=Math.max(4,Math.min(event.clientX-bounds.left+12,bounds.width-tooltip.offsetWidth-4))+'px';
  tooltip.style.top=Math.max(4,event.clientY-bounds.top-34)+'px';
});
boardCanvas.addEventListener('pointerleave',()=>{hoveredIndex=-1;pointerWorld=null;updateTowerTooltip();});
function showHome(visible) {
  $('home').hidden=!visible;
  $('gameHeader').hidden=visible;
  $('gameScreen').hidden=visible;
  if(visible) {
    for(const layer of [boardCanvas,groundCanvas]) {layer.width=1;layer.height=1;}
    demonCache.clear();
    paintTitle();
  } else {
    const titleCanvas=$('titleArt');
    titleCanvas.width=1;titleCanvas.height=1;
    prepareBoard();
  }
}
function beginGame() {
  if(researchedCount()>researchLimit) { legacy();return; }
  if($('dialog').open) closeDialog();
  showHome(false);
  camera.zoom=1;
  stopPan();
  updateCamera();
  reset();
}
function showOptions() {
  showDialog('옵션','전투 화면에서도 자동 시작과 공격 효과음을 바꿀 수 있습니다.',[
    ['자동 시작 '+(profile.auto?'켜짐':'꺼짐'),()=>{
      profile.auto=!profile.auto;$('auto').checked=profile.auto;save();showOptions();
    }],
    ['공격 효과음 '+(profile.sound?'켜짐':'꺼짐'),()=>{
      profile.sound=!profile.sound;$('sound').checked=profile.sound;save();showOptions();
    }],
    ['닫기',closeDialog]
  ]);
}
const arenaCanvas=$('eventArena');
arenaCanvas.width=168*sceneResolution;arenaCanvas.height=88*sceneResolution;
const arena=arenaCanvas.getContext('2d');
arena.scale(sceneResolution,sceneResolution);
function paintExpedition(now) {
  const zone=game.expedition, boss=eventChallenges[zone.index];
  arena.fillStyle='#21172b';arena.fillRect(0,0,168,88);
  arena.fillStyle='#50355e';arena.fillRect(9,70,150,3);
  if(boss) {
    drawAngel(arena,'event:'+zone.index,124,72,57);
    arena.fillStyle='#433341';arena.fillRect(99,13,51,4);
    arena.fillStyle='#ff859d';arena.fillRect(99,13,Math.round(zone.hp/boss.hp*51),4);
  }
  if(zone.unit) {
    arena.save();
    const y=72+Math.round(Math.sin(now/180));
    if(zone.attack) {
      transformAttack(arena,47,y,zone.attack,1,0);
      drawDemon(arena,zone.unit,0,0,3);
    } else drawDemon(arena,zone.unit,47,y,3);
    arena.restore();
  }
  if(zone.attack) {
    const age=effectAge(zone.attack);
    if(age>.22) paintSkillImpact(arena,123,42,zone.attack,(age-.22)/.78,22);
  }
}
function paintTitle() {
  const canvas=$('titleArt');
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(!width || !height) return;
  const ratio=Math.min(sceneResolution,8192/Math.max(width,height),Math.sqrt(26000000/(width*height)));
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  const art=canvas.getContext('2d');
  art.scale(ratio,ratio);
  function polygon(color,points) {
    art.fillStyle=color;art.beginPath();
    points.forEach(([x,y],i)=>i?art.lineTo(x,y):art.moveTo(x,y));
    art.closePath();art.fill();
  }
  const ridge=(color,points)=>polygon(color,points.map(([x,y])=>[x*width,y*height]));
  const summit=Math.max(height*.25,document.querySelector('.home-card').offsetTop+4);
  const summitRatio=summit/height;
  const foreground=(color,points)=>ridge(color,points.map(([x,y])=>[x,summitRatio+(y-.425)*(1-summitRatio)/.575]));
  let seed=9371;
  const noise=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(let i=0;i<150;i++) {
    const x=noise()*width,y=noise()*height*.71,r=noise()>.96?2:1;
    art.fillStyle=noise()>.75?'#ecc5b16f':'#cbc4ed35';
    art.fillRect(x,y,r,r);
  }
  const halo=art.createRadialGradient(width*.50,height*.3,0,width*.50,height*.3,Math.min(width,height)*.42);
  halo.addColorStop(0,'#c0748135');halo.addColorStop(.55,'#9f586213');halo.addColorStop(1,'#9f586200');
  art.fillStyle=halo;art.fillRect(0,0,width,height*.82);
  ridge('#463349',[[0,.59],[.075,.44],[.13,.53],[.21,.35],[.28,.46],[.35,.40],[.43,.56],[.52,.49],
    [.61,.56],[.68,.34],[.74,.44],[.81,.31],[.87,.43],[.93,.37],[1,.48],[1,1],[0,1]]);
  ridge('#352b42',[[0,.53],[.08,.38],[.15,.48],[.2,.46],[.26,.61],[.33,.50],[.38,.57],[.5,.64],
    [.61,.56],[.69,.50],[.75,.62],[.86,.48],[.92,.54],[.98,.42],[1,.44],[1,1],[0,1]]);
  ridge('#262639',[[0,.73],[.11,.58],[.165,.51],[.235,.62],[.29,.57],[.355,.69],[.50,.68],
    [.64,.66],[.72,.53],[.78,.59],[.84,.52],[.9,.65],[1,.55],[1,1],[0,1]]);
  ridge('#60506666',[[.08,.38],[.15,.48],[.124,.475],[.107,.452],[.09,.44],[.055,.44]]);
  ridge('#89617157',[[.21,.35],[.28,.46],[.249,.452],[.229,.435],[.197,.438],[.157,.45]]);
  ridge('#91647462',[[.81,.31],[.87,.43],[.845,.415],[.827,.387],[.81,.381],[.78,.392],[.75,.419]]);
  ridge('#65506a70',[[.68,.34],[.74,.44],[.712,.425],[.692,.398],[.66,.419],[.63,.434]]);
  const fog=art.createLinearGradient(0,height*.40,0,height*.76);
  fog.addColorStop(0,'#9b6b8200');fog.addColorStop(.57,'#9b6b8232');fog.addColorStop(1,'#9b6b8200');
  art.fillStyle=fog;art.fillRect(0,height*.40,width,height*.36);
  foreground('#1a1c2a',[[0,1],[.09,.94],[.185,.78],[.25,.75],[.34,.63],[.405,.52],[.475,.425],[.53,.425],
    [.57,.49],[.64,.56],[.71,.67],[.76,.74],[.86,.78],[.94,.925],[1,1]]);
  foreground('#352a3e',[[.045,1],[.192,.9],[.27,.78],[.353,.665],[.40,.55],[.475,.425],[.498,.425],
    [.464,.53],[.452,.61],[.382,.706],[.364,.78],[.25,.89],[.206,1]]);
  foreground('#2a2538',[[.514,.427],[.537,.437],[.596,.527],[.64,.57],[.735,.704],[.805,.774],
    [.758,.765],[.705,.725],[.65,.658],[.599,.621],[.562,.528]]);
  foreground('#4d354b',[[.33,.692],[.405,.552],[.468,.446],[.48,.44],[.456,.519],[.429,.594],[.398,.614]]);
  foreground('#a74754',[[.19,.935],[.26,.88],[.329,.845],[.36,.792],[.356,.83],[.31,.87],[.26,.895]]);
  foreground('#e17759',[[.229,.911],[.286,.877],[.35,.823],[.328,.851],[.278,.887]]);
  for(let i=0;i<95;i++) {
    const y=summit+noise()*(height-summit);
    const spread=(y-summit)/Math.max(1,height-summit);
    const x=width*(.5+(noise()-.5)*(.045+spread*.66));
    art.fillStyle=noise()>.83?'#a28b9b43':'#0b0b1747';
    art.fillRect(x,y,2+noise()*13,1+noise()*2);
  }
  ridge('#101421',[[0,.90],[.083,.844],[.132,.88],[.21,.886],[.275,.96],[.38,1],[0,1]]);
  ridge('#121522',[[1,.86],[.94,.81],[.85,.902],[.76,.93],[.71,1],[1,1]]);

  const scale=Math.min(width/650,height/550,summit/252);
  const scene=canvas.parentElement;
  scene.style.setProperty('--orbit-y',Math.round(summit-113*scale)+'px');
  scene.style.setProperty('--orbit-size',Math.round(310*scale)+'px');
  art.translate(width/2-365*scale,summit-270*scale);
  art.scale(scale,scale);
  const towers=[
    {x:256,y:177,w:42,h:96},{x:300,y:140,w:34,h:130},{x:338,y:111,w:54,h:159},
    {x:399,y:147,w:35,h:123},{x:437,y:183,w:37,h:92}
  ];
  art.fillStyle='#14121d';art.fillRect(267,202,195,71);
  for(const {x,y,w,h} of towers) {
    const face=art.createLinearGradient(x,y,x+w,y);
    face.addColorStop(0,'#3f2b42');face.addColorStop(.4,'#242034');face.addColorStop(1,'#100f1c');
    art.fillStyle=face;art.fillRect(x,y,w,h);
    art.fillStyle='#392738';art.fillRect(x+4,y+4,7,h-9);
    polygon('#17131e',[[x-6,y+1],[x+w/2,y-39],[x+w+6,y+1]]);
    polygon('#684154',[[x-6,y+1],[x+w/2,y-39],[x+w/2-6,y+1]]);
    art.fillStyle='#91596b';art.fillRect(x+w/2-1,y-39,2,13);
    art.fillStyle='#f49367';art.fillRect(x+w/2-2,y+21,4,11);
    art.fillStyle='#86465b';art.fillRect(x+w/2-2,y+47,4,9);
    art.fillStyle='#a2758950';
    for(let course=y+13;course<y+h-5;course+=9) {
      art.fillRect(x+2,course,w-4,1);
      art.fillRect(x+7+(course%5)*3,course-5,1,5);
    }
    art.fillStyle='#ffb179';
    art.fillRect(x+w/2-1,y+23,2,7);
  }
  polygon('#080b13',[[341,274],[341,238],[351,224],[369,218],[386,228],[391,240],[391,274]]);
  art.fillStyle='#b66a62';art.fillRect(358,236,4,34);art.fillRect(378,236,4,34);
  art.strokeStyle='#815364';art.lineWidth=2;
  art.beginPath();art.moveTo(336,270);art.lineTo(336,239);art.lineTo(350,222);art.lineTo(369,215);art.lineTo(388,226);art.lineTo(396,240);art.lineTo(396,270);art.stroke();
  art.fillStyle='#e98058';
  for(const [x,y] of [[128,256],[211,205],[488,190],[545,232],[587,292],[96,334],[194,286],[522,341]]) art.fillRect(x,y,3,3);
}
$('play').onclick=beginGame;
$('homeRecords').onclick=showRecords;
$('homeLegacy').onclick=legacy;
$('homeCodex').onclick=()=>{
  showDialog('악마 · 적 도감','획득·합성 기록과 전투에서 만난 적을 확인할 수 있습니다.',[['닫기',closeDialog]]);
  $('dialogBody').insertBefore($('codexContent'),$('dialogBody').lastElementChild);
  mark();
};
$('dialog').addEventListener('close',()=>{if(!$('dialog').open) restoreCodex();});
$('options').onclick=showOptions;
$('draw').onclick=draw;
$('place').onclick=()=>placeReward(game.selected,rewardForPlacement());
$('wave').onclick=toggleWave;
$('researchSkill').onclick=useResearchSkill;
$('sendEvent').onclick=sendExpedition;
$('recallEvent').onclick=recallExpedition;
$('legacy').onclick=legacy;
$('speed').onchange=event=>{game.speed=Number(event.target.value);mark();};
$('sound').checked=profile.sound;
$('sound').onchange=event=>{profile.sound=event.target.checked;save();if(profile.sound) activateAudio();};
document.addEventListener('pointerdown',activateAudio);
document.addEventListener('keydown',activateAudio);
document.addEventListener('keydown',event=>{
  if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey ||
      !$('home').hidden || $('dialog').open || event.target.closest?.('input,select,textarea,[contenteditable]')) return;
  switch(event.code) {
    case 'KeyQ': draw(); break;
    case 'KeyW': placeReward(game.selected,rewardForPlacement()); break;
    case 'KeyE': sellTower(game.selected); break;
    case 'KeyR': selectMerge(); break;
    case 'KeyF': sendExpedition(); break;
    case 'KeyG': recallExpedition(); break;
    case 'KeyH': useResearchSkill(); break;
    default: return;
  }
  event.preventDefault();
});
$('auto').checked=profile.auto;
$('auto').onchange=event=>{profile.auto=event.target.checked;game.autoTime=7;save();mark();};
const recipeButtons=new Map();
new ResizeObserver(paintTitle).observe($('titleArt').parentElement);
paintTitle();
renderRecipes();
$('gamble').onclick=gamble;
$('gamble').textContent='심연 도박 · 영혼 '+gamblePrice;
for(const {label,weight} of gambleTable) {
  const item=document.createElement('li');
  item.textContent=label+' · '+weight/10+'%';
  $('gambleOdds').append(item);
}
const specialOdds=document.createElement('li');
specialOdds.textContent='특수 악마 당첨 시 세 계열 동일 확률 · 1성 15% / 2성 30% / 3성 55%';
$('gambleOdds').append(specialOdds);
for(let star=1;star<=maxStar;star++) for(let identity=0;identity<identityCount(star);identity++) {
  const option=document.createElement('option');
  option.value=identity+':'+star;
  option.textContent=unitName(recipeTower(star,identity));
  $('codexUnit').append(option);
}
$('codexUnit').onchange=()=>mark();
reset();
loadUnitSprites().then(()=>{
  $('play').disabled=false;
}).catch(error=>{
  console.error('Failed to load unit sprites',error);
  $('spriteStatus').textContent='유닛 이미지를 불러오지 못했습니다. 최신 프로젝트 파일을 확인해 주세요.';
  $('spriteStatus').hidden=false;
});
let last=0, frameTime=0, lastCountdown=-1, lastPaint=-Infinity;
function frame(now) {
  const elapsed=(now-(last||now))/1000;
  const dt=Math.min(.09,elapsed);
  last=now;
  if($('home').hidden && !document.hidden && !game.paused && !$('dialog').open && ['ready','wave'].includes(game.phase))
    game.played+=Math.min(elapsed,.35);
  game.shots=game.shots.filter(shot=>(shot.time-=elapsed)>0);
  const expedition=game.expedition;
  if(expedition.attack && (expedition.attack.time-=elapsed)<=0) expedition.attack=null;
  frameTime+=dt*game.speed;
  while(frameTime>=1/30) {step(1/30);frameTime-=1/30;}
  const countdown=Math.ceil(game.autoTime);
  if(countdown!==lastCountdown) {dirty=true;lastCountdown=countdown;}
  if(dirty) {renderUI();updateTowerTooltip();dirty=false;}
  if ($('home').hidden && now-lastPaint>=31) {
    paintBoard(now);paintExpedition(now);lastPaint=now;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
