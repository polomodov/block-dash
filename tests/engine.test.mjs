import assert from 'node:assert/strict';
import test from 'node:test';
import { createRun } from '../engine.js';
import { HEROES, WORLDS } from '../worlds.js';

function obstacle(run, kind, z, lane = 0, type = kind) {
  const item = { id: 900, kind, type, z, lane, hit: false, passed: false, dance: 0, stun: 0, flee: 0, active: true };
  run.state.objects.push(item);
  return item;
}

function practice(heroId) {
  const run = createRun({ heroId, seed: 123 });
  run.state.objects = [];
  return run;
}

test('same world and seed reproduce a course; other seeds vary the lanes and props', () => {
  const course = seed => createRun({ seed }).state.objects;
  assert.deepEqual(course(17), course(17));
  assert.notDeepEqual(course(17), course(18));
  assert.equal(WORLDS.length, 7);
  assert.equal(HEROES.length, 5);
  for (const world of WORLDS) {
    const run = createRun({ worldId: world.id, seed: 19 });
    assert.equal(run.state.worldId, world.id);
    assert.ok(run.state.objects.some(o => o.type === world.barrier));
    assert.ok(run.state.objects.every(o => o.kind !== 'monster' || world.monsters.includes(o.type)));
  }
});

test('lane changes interpolate, a jump clears low obstacles, sliding clears overhead arches', () => {
  for (const [kind, action] of [['barrier', 'jump'], ['arch', 'slide'], ['monster', 'jump']]) {
    const run = practice('kirill');
    obstacle(run, kind, 5);
    run.act(action);
    run.update(.45);
    assert.equal(run.state.lives, 3);
  }
  const run = practice('kirill');
  obstacle(run, 'block', 5);
  run.act('right');
  run.update(.06);
  assert.ok(run.state.player.x > 0 && run.state.player.x < 1);
  run.update(.39);
  assert.equal(run.state.lives, 3);
  assert.equal(run.state.player.x, 1);
  run.act('right');
  assert.equal(run.state.player.lane, 1);
});

test('jump poses track takeoff, apex, descent and the first running step for every hero', () => {
  for (const hero of HEROES) {
    const run = practice(hero.id), p = run.state.player;
    assert.equal(p.jumpProgress, null);
    assert.equal(p.landingProgress, null);
    assert.equal(run.act('jump'), true);
    assert.equal(p.jumpProgress, 0);
    for (const progress of [.25, .5, .75]) {
      run.update(.78 / 4);
      assert.ok(Math.abs(p.jumpProgress - progress) < 1e-8);
      assert.ok(Math.abs(p.jump - 4 * progress * (1 - progress)) < 1e-8);
      assert.equal(p.landingProgress, null);
    }
    run.update(.78 / 4 + .08);
    assert.equal(p.jumpProgress, null);
    assert.equal(p.jump, 0);
    assert.ok(Math.abs(p.landingProgress - .5) < 1e-8);
    run.act('pause');
    const paused = p.landingProgress;
    run.update(.4);
    assert.equal(p.landingProgress, paused);
    run.act('resume');
    assert.equal(run.act('jump'), true);
    assert.equal(p.jumpProgress, 0);
    assert.equal(p.landingProgress, null);
    run.update(1);
    assert.equal(p.jumpProgress, null);
    assert.equal(p.landingProgress, null);
  }
});

test('sliding mid-jump drops smoothly from the current height and pauses in midair', () => {
  for (const beforeSwipe of [.08, .39, .69]) {
    const run = practice('pasha'), p = run.state.player;
    run.act('jump');
    run.update(beforeSwipe);
    const startHeight = p.jump;
    assert.ok(startHeight > 0);
    assert.equal(run.act('slide'), true);
    assert.equal(p.jump, startHeight);
    assert.ok(p.slide > 0);
    assert.ok(p.jumpProgress >= .5);
    assert.equal(run.act('jump'), false);
    run.update(1 / 120);
    assert.ok(p.jump > 0 && p.jump < startHeight);
    run.act('pause');
    const pausedHeight = p.jump;
    run.update(2);
    assert.equal(p.jump, pausedHeight);
    run.act('resume');
    let frames = 1;
    while (p.jump > 0 && frames < 18) {
      const previousHeight = p.jump;
      run.update(1 / 120);
      assert.ok(p.jump < previousHeight);
      frames++;
    }
    assert.equal(p.jump, 0);
    assert.equal(p.jumpProgress, null);
    assert.equal(p.landingProgress, null);
    assert.ok(frames <= 15);
    if (beforeSwipe === .39) assert.ok(frames >= 12);
    assert.ok(p.slide > .68);
    assert.equal(run.act('jump'), true);
  }
});

test('gems only count once, invulnerability separates hits, zero hearts ends all movement', () => {
  const run = practice('maxim'), s = run.state;
  obstacle(run, 'gem', 1);
  obstacle(run, 'gem', 2, 1);
  for (const z of [3, 4, 32, 64]) obstacle(run, 'block', z);
  run.update(.6);
  assert.equal(s.lives, 2);
  assert.equal(s.gems, 1);
  run.update(6);
  assert.equal(s.status, 'over');
  assert.equal(s.lives, 0);
  const stopped = s.distance;
  run.update(20);
  assert.equal(stopped, s.distance);
  assert.equal(run.act('power'), false);
  assert.equal(run.act('resume'), false);
});

test('all powers renew after thirty active seconds; pause freezes every part of the run', () => {
  for (const hero of HEROES) {
    const run = createRun({ heroId: hero.id, seed: 15 }), s = run.state;
    run.act('power');
    assert.equal(s.cooldown, 30);
    assert.ok(s.powerTime > 0);
    assert.equal(run.act('power'), false);
    run.update(.25);
    run.act('pause');
    const frozen = structuredClone(s);
    run.update(100);
    assert.equal(run.act('left'), false);
    assert.deepEqual(s, frozen);
    run.act('resume');
    // Empty the approaching course to measure the cooldown independently of collisions.
    for (let i = 0; i < 60; i++) { s.objects = []; run.update(.5); }
    assert.equal(s.cooldown, 0);
    assert.equal(s.powerTime, 0);
    assert.equal(run.act('power'), true);
  }
});

test('each familiar hero can use their own power; solid scenery remains a hazard', () => {
  const fast = practice('kirill'), normal = practice('maxim');
  fast.act('power'); fast.update(1); normal.update(1);
  assert.ok(fast.state.distance > normal.state.distance * 1.3);
  for (const [hero, effect] of [['maxim', 'stun'], ['dad', 'flee'], ['pasha', 'dance'], ['mom', null]]) {
    const run = practice(hero);
    const monster = obstacle(run, 'monster', 5);
    const distant = obstacle(run, 'monster', 60, -1);
    run.act('power');
    if (effect) {
      assert.ok(monster[effect] > 0);
      assert.equal(distant[effect], 0);
    }
    run.update(.45);
    assert.ok(monster.passed);
    assert.equal(run.state.lives, 3);
    obstacle(run, 'block', 9);
    run.update(.45);
    assert.equal(run.state.lives, 2);
  }
});

test('normal inputs follow the emerald lane deep into all seven worlds without losing a heart', () => {
  for (const world of WORLDS) {
    for (const seed of [0, 137]) {
      const run = createRun({ worldId: world.id, heroId: 'kirill', seed }), s = run.state;
      while (s.distance < 2500 && s.status === 'playing') {
        if (s.cooldown === 0) run.act('power');
        const next = s.objects.find(o => o.kind === 'gem' && o.z > s.distance && o.z < s.distance + 15);
        if (next && next.lane !== s.player.lane) run.act(next.lane > s.player.lane ? 'right' : 'left');
        run.update(1 / 30);
      }
      assert.equal(s.lives, 3, world.id + ' seed ' + seed);
      assert.ok(s.gems > 100);
      assert.ok(s.objects.length < 60);
    }
  }
});

test('End dragon marks its lane, dives, and breath becomes hazardous only after its warning', () => {
  const run = createRun({ worldId: 'end', seed: 15 }), s = run.state;
  const cloud = s.objects.find(o => o.kind === 'breath'), phases = new Set();
  assert.ok(cloud && !cloud.active);
  s.objects = [cloud];
  assert.equal(cloud.type, 'dragon_breath');
  const dir = cloud.lane > 0 ? 'right' : 'left';
  if (cloud.lane !== 0) run.act(dir);
  while (s.distance < cloud.z + 9) {
    run.update(1 / 60);
    if (s.dragon) {
      phases.add(s.dragon.phase);
      assert.equal(s.dragon.lane, cloud.lane);
      assert.ok(s.dragon.progress >= 0 && s.dragon.progress <= 1);
      if (s.dragon.phase === 'warning') assert.equal(cloud.active, false);
    }
  }
  assert.deepEqual([...phases], ['warning', 'dive', 'recover']);
  assert.equal(s.lives, 2);
  assert.equal(s.dragon, null);
});

test('collision sampling and power durations agree across frame rates', () => {
  function simulate(rate) {
    const run = createRun({ worldId: 'nether', heroId: 'pasha', seed: 2 });
    run.act('power');
    for (let i = 0; i < rate * 5; i++) run.update(1 / rate);
    return run.state;
  }
  const a = simulate(120), b = simulate(20);
  assert.ok(Math.abs(a.distance - b.distance) < 1e-6);
  assert.equal(a.gems, b.gems);
  assert.equal(a.lives, b.lives);
  assert.equal(a.powerTime, 0);
  assert.equal(b.powerTime, 0);
  assert.ok(a.objects.some(o => o.type === 'magma_cube'));
  assert.ok(a.objects.some(o => o.type === 'fireball'));
});

test('the local pursuer falls back, closes after a stumble, and catches the runner on the last hit', () => {
  for (const world of WORLDS) {
    const run = createRun({ worldId: world.id, heroId: 'pasha', seed: 1 }), s = run.state;
    assert.ok(world.monsters.includes(s.pursuer.type));
    const before = s.pursuer.pressure;
    run.act('power');
    assert.equal(s.pursuer.dance, 5);
    s.objects = [];
    run.update(2);
    assert.ok(s.pursuer.pressure < before);
    for (let hit = 1; hit <= 3; hit++) {
      s.objects = [];
      obstacle(run, 'block', s.distance + .01);
      run.update(1 / 120);
      assert.equal(s.lives, 3 - hit);
      assert.equal(s.pursuer.pressure, 1);
      if (hit < 3) run.update(1.7);
    }
    assert.equal(s.status, 'over');
    assert.equal(s.pursuer.dance, 0);
    run.update(2);
    assert.equal(s.pursuer.pressure, 1);
  }
});

test('saved runner restores the same in-flight hero and future seeded course after a cold start', async () => {
  const {restoreRun} = await import('../engine.js');
  const original = createRun({worldId:'end',heroId:'pasha',seed:117});
  original.update(1); original.act('jump'); original.act('power'); original.update(.22);
  const saved = JSON.parse(JSON.stringify(original.snapshot()));
  const second = restoreRun(saved);
  assert.equal(second.state.status, 'paused');
  assert.equal(second.state.player.jump, original.state.player.jump);
  second.act('resume');
  for (let i=0; i<115; i++) { original.update(.08); second.update(.08); }
  assert.deepEqual(second.snapshot(), original.snapshot());
  assert.equal(restoreRun({...saved,nextZ:-1}), null);
});

test('damaged or tampered runner saves are rejected instead of restoring a broken run', async () => {
  const {restoreRun} = await import('../engine.js');
  const run = createRun({worldId:'nether',heroId:'mom',seed:42});
  run.update(1.5);
  const saved = JSON.parse(JSON.stringify(run.snapshot()));
  assert.ok(restoreRun(saved));
  const broken = [
    {...saved, level:'moon'}, {...saved, hero:'ghost'}, {...saved, version:2},
    {...saved, lives:0}, {...saved, lives:4}, {...saved, lane:2}, {...saved, speed:NaN},
    {...saved, seed:-1}, {...saved, pursuer:null}, {...saved, objects:'none'},
    {...saved, objects:[{...saved.objects[0], kind:'portal'}]},
    {...saved, objects:Array.from({length:121}, () => saved.objects[0])},
  ];
  for (const bad of broken) assert.equal(restoreRun(bad), null);
  assert.equal(restoreRun(null), null);
});

test('lane changes stop at the outer lanes and a paused run stands still', () => {
  const run = createRun({worldId:'temple',heroId:'kirill',seed:9});
  for (let i = 0; i < 4; i++) run.act('left');
  assert.equal(run.state.player.lane, -1);
  for (let i = 0; i < 4; i++) run.act('right');
  assert.equal(run.state.player.lane, 1);
  run.act('pause');
  const distance = run.state.distance;
  run.update(1);
  assert.equal(run.state.distance, distance);
});
