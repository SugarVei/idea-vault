/* PUNCH DRIVE: Saltworks vehicle meshes. Coordinates match the physics rig.
 * Forward is -Z, axle centers are y = -0.22 and z = +/-1.02.
 * Each material is batched into one geometry and shared across liveries.
 */
function createSaltworksVehicleModels(THREE, createBatch) {
  const {
    BoxGeometry, BufferGeometry, CylinderGeometry,
    Float32BufferAttribute, LatheGeometry, Vector2,
  } = THREE;
  const sides = [-1, 1];
  const axles = [-1.02, 1.02];
  const bodyCache = new Map();
  const wheelCache = new Map();
  const defaults = {
    dart: {
      // [z, deck half-width, deck height, shoulder width, shoulder height]
      stations: [
        [-1.68, .46, .11, .66, .018], [-1.39, .60, .25, .80, .10],
        [-.96, .65, .34, .87, .25], [-.40, .63, .39, .80, .21],
        [.46, .63, .39, .79, .21], [1.03, .69, .37, .87, .24],
        [1.42, .61, .31, .83, .19], [1.68, .54, .22, .71, .09],
      ],
      // z, y, width of the front and back edges at the cabin sill and roof
      cabin: [[-.76, .35, .59], [.96, .38, .62], [-.23, .83, .43], [.45, .81, .45]],
      vent: [-1.16, .318, 3],
      twoTone: 'offset',
    },
    rumbler: {
      stations: [
        [-1.68, .53, .19, .73, .10], [-1.40, .60, .34, .82, .20],
        [-.98, .66, .39, .86, .27], [-.44, .66, .44, .80, .23],
        [.45, .64, .44, .80, .23], [1.00, .68, .43, .87, .28],
        [1.42, .66, .38, .84, .23], [1.68, .56, .30, .75, .15],
      ],
      cabin: [[-.76, .40, .61], [1.45, .37, .63], [-.34, .96, .50], [1.11, .94, .52]],
      vent: [-1.11, .392, 4],
      twoTone: 'pair',
    },
    bruiser: {
      stations: [
        [-1.68, .64, .27, .83, .14], [-1.43, .67, .39, .87, .25],
        [-.97, .71, .47, .89, .30], [-.43, .70, .49, .85, .26],
        [.35, .70, .43, .83, .25], [1.02, .70, .42, .89, .28],
        [1.44, .67, .39, .87, .24], [1.68, .59, .29, .80, .15],
      ],
      cabin: [[-.72, .47, .65], [.49, .43, .64], [-.41, 1.06, .53], [.30, 1.06, .53]],
      vent: [-1.10, .464, 6],
      twoTone: 'block',
    },
  };

  function getClass(kits = []) {
    if (kits.includes('plow')) return 'bruiser';
    if (kits.includes('wing')) return 'dart';
    return 'rumbler';
  }

  function add(batch, material, geometry, position, rotation) {
    batch.add(material, geometry, position, rotation);
    geometry.dispose();
  }

  function box(batch, material, size, position, rotation) {
    add(batch, material, new BoxGeometry(...size), position, rotation);
  }

  function tube(batch, material, radius, from, to, segments = 8) {
    const delta = to.map((value, index) => value - from[index]);
    const length = Math.hypot(...delta);
    const center = to.map((value, index) => (value + from[index]) / 2);
    const pitch = Math.atan2(Math.hypot(delta[0], delta[2]), delta[1]);
    const yaw = Math.atan2(delta[0], delta[2]);
    const geometry = new CylinderGeometry(radius, radius, length, segments);
    geometry.rotateX(pitch).rotateY(yaw);
    add(batch, material, geometry, center);
  }

  function polygon(batch, material, points, texture = [[0, 0], [1, 0], [1, 1], [0, 1]]) {
    const positions = [];
    const uvs = [];
    for (let index = 1; index < points.length - 1; index++) {
      for (const corner of [0, index, index + 1]) {
        positions.push(...points[corner]);
        uvs.push(...(texture[corner] ?? [0, 0]));
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    add(batch, material, geometry);
  }

  function face(batch, material, points, outward, texture) {
    const [a, b, c] = points;
    const [x1, y1, z1] = b.map((value, index) => value - a[index]);
    const [x2, y2, z2] = c.map((value, index) => value - a[index]);
    const normal = [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
    const correct = normal.reduce((sum, value, index) => sum + value * outward[index], 0) >= 0;
    if (correct) polygon(batch, material, points, texture);
    else polygon(batch, material, [...points].reverse(), texture && [...texture].reverse());
  }

  function crossSection(spec, z) {
    const stations = spec.stations;
    const upper = Math.max(1, stations.findIndex(station => station[0] >= z));
    const a = stations[upper - 1];
    const b = stations[upper];
    const ratio = (z - a[0]) / (b[0] - a[0]);
    return a.map((value, index) => value + (b[index] - value) * ratio);
  }

  function makeShell(batch, spec) {
    const samples = new Set(spec.stations.map(station => station[0]));
    for (const axle of axles) {
      for (let step = 0; step <= 12; step++) {
        samples.add(axle + Math.cos(Math.PI * step / 12) * .435);
      }
    }
    const rings = [...samples].sort((a, b) => a - b).map(z => {
      const [, deckWidth, deck, shoulderWidth, shoulder] = crossSection(spec, z);
      const nearestAxle = Math.min(...axles.map(axle => Math.abs(z - axle)));
      const arch = Math.sqrt(Math.max(0, .435 ** 2 - nearestAxle ** 2));
      const curvedSkirt = Math.max(-.333, -.38 + 1.37 * arch);
      const skirtX = Math.max(.60, shoulderWidth - .085);
      return [
        [-deckWidth, deck, z], [-shoulderWidth, shoulder, z],
        [-skirtX, curvedSkirt, z], [-.54, -.405, z],
        [.54, -.405, z], [skirtX, curvedSkirt, z],
        [shoulderWidth, shoulder, z], [deckWidth, deck, z],
      ];
    });
    // Join the stations along each panel while keeping the crease at its edges.
    for (let column = 0; column < rings[0].length; column++) {
      const next = (column + 1) % rings[0].length;
      const positions = [];
      const uvs = [];
      const indices = [];
      for (let row = 0; row < rings.length; row++) {
        const ring = rings[row];
        positions.push(...ring[column], ...ring[next]);
        const v = (ring[column][2] + 1.68) / 3.36;
        uvs.push(0, v, 1, v);
        if (row === 0) continue;
        const current = row * 2;
        indices.push(current - 2, current - 1, current + 1, current - 2, current + 1, current);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      add(batch, column > 1 && column < 5 ? 'trim' : 'paint', geometry);
    }
    polygon(batch, 'paint', [...rings[0]].reverse());
    polygon(batch, 'paint', rings.at(-1));

    for (const side of sides) {
      for (const axle of axles) makeFender(batch, side, axle);
      box(batch, 'trim', [.15, .245, 1.06], [side * .718, -.221, .02]);
      box(batch, 'steel', [.095, .058, .86], [side * .811, -.265, .02]);
      box(batch, 'stripe', [.025, .035, .84], [side * .845, -.203, .02]);
      makeDoorNumber(batch, spec, side);
    }
  }

  function makeFender(batch, side, axle) {
    const across = side > 0 ? [1, 0, 0] : [-1, 0, 0];
    function position(step, radius, width) {
      const theta = step * Math.PI / 12;
      return [side * width, -.22 + Math.sin(theta) * radius, axle + Math.cos(theta) * radius];
    }
    for (let step = 0; step < 12; step++) {
      const a = step;
      const b = step + 1;
      const trim = [position(a, .42, .89), position(b, .42, .89),
        position(b, .459, .942), position(a, .459, .942)];
      const paint = [position(a, .459, .942), position(b, .459, .942),
        position(b, .512, .82), position(a, .512, .82)];
      face(batch, 'trim', trim, across);
      face(batch, 'paint', paint, [side, Math.sin((step + .5) * Math.PI / 12), 0]);
    }
  }

  function makeDoorNumber(batch, spec, side) {
    const [, , , shoulder, shoulderY] = crossSection(spec, 0);
    const x = side * (shoulder + .01);
    const y = shoulderY - .09;
    // The stock livery texture uses its lower half for door numbers.
    const from = side > 0 ? .36 : -.36;
    const to = -from;
    face(batch, 'decal', [[x, y - .12, from], [x, y - .12, to],
      [x, y + .10, to], [x, y + .10, from]], [side, 0, 0],
    [[0, .5], [1, .5], [1, 1], [0, 1]]);
  }

  function makeCabin(batch, info, isTruck) {
    const [sillFront, sillRear, roofFront, roofRear] = info;
    const corner = ([z, y, width], side) => [side * width, y, z];
    const patch = (vertices, normal, ranges) => {
      face(batch, 'paint', vertices, normal);
      const lens = ([x, y, z]) => [x + normal[0] * .006, y + normal[1] * .006, z + normal[2] * .006];
      const at = (u, v) => {
        const [a, b, c, d] = vertices;
        return lens(a.map((value, index) => (
          (value * (1 - u) + b[index] * u) * (1 - v) +
          (d[index] * (1 - u) + c[index] * u) * v
        )));
      };
      for (const [from, to] of ranges) {
        face(batch, 'glass', [at(from, .11), at(to, .11), at(to, .91), at(from, .91)], normal);
      }
    };
    patch([corner(sillFront, -1), corner(sillFront, 1),
      corner(roofFront, 1), corner(roofFront, -1)], [0, .18, -1],
    isTruck ? [[.07, .482], [.518, .93]] : [[.065, .935]]);
    patch([corner(sillRear, -1), corner(sillRear, 1),
      corner(roofRear, 1), corner(roofRear, -1)], [0, .20, 1], [[.075, .925]]);
    for (const side of sides) {
      patch([corner(sillFront, side), corner(sillRear, side),
        corner(roofRear, side), corner(roofFront, side)], [side, .2, 0],
      isTruck ? [[.075, .90]] : [[.055, .52], [.558, .932]]);
      const a = corner(roofFront, side);
      const b = corner(roofRear, side);
      tube(batch, 'trim', .026, a, b);
      tube(batch, 'trim', .022, corner(sillFront, side), a);
      tube(batch, 'trim', .023, corner(sillRear, side), b);
    }
    face(batch, 'paint', [corner(roofFront, -1), corner(roofFront, 1),
      corner(roofRear, 1), corner(roofRear, -1)], [0, 1, 0]);
  }

  function makeStripes(batch, spec) {
    const stripeRanges = {
      offset: [[-.33, -.115], [-.083, -.045]],
      pair: [[-.27, -.13], [.13, .27]],
      block: [[-.31, .31]],
    }[spec.twoTone];
    for (const [left, right] of stripeRanges) {
      for (const [start, end] of [[-1.50, spec.cabin[0][0] - .07], [spec.cabin[1][0] + .07, 1.56]]) {
        if (end <= start) continue;
        const breaks = [start, ...spec.stations.map(([z]) => z).filter(z => z > start && z < end), end];
        for (let index = 1; index < breaks.length; index++) {
          const a = breaks[index - 1];
          const b = breaks[index];
          const yA = crossSection(spec, a)[2] + .008;
          const yB = crossSection(spec, b)[2] + .008;
          face(batch, 'stripe', [[left, yA, a], [right, yA, a],
            [right, yB, b], [left, yB, b]], [0, 1, 0]);
        }
      }
      const [, , [frontZ, frontY], [rearZ, rearY]] = spec.cabin;
      face(batch, 'stripe', [[left, frontY + .006, frontZ + .06], [right, frontY + .006, frontZ + .06],
        [right, rearY + .006, rearZ - .06], [left, rearY + .006, rearZ - .06]], [0, 1, 0]);
    }
  }

  function makeFront(batch, kind, spec) {
    const [, , deck] = spec.stations[0];
    const z = -1.684;
    box(batch, 'trim', [.90, .225, .052], [0, -.072, z]);
    box(batch, 'brake', [.82, .10, .018], [0, -.095, z - .033]);
    for (let index = -5; index <= 5; index++) {
      box(batch, 'steel', [.014, .092, .013], [index * .073, -.096, z - .048], [0, 0, -.28]);
    }
    box(batch, 'trim', [1.42, .108, .123], [0, -.29, z + .032]);
    for (const side of sides) {
      const x = side * .565;
      box(batch, 'trim', [.274, .145, .09], [x, deck * .4 + .027, z + .015]);
      if (kind === 'rumbler') {
        tube(batch, 'steel', .069, [x - .061, .123, z + .01], [x - .061, .123, z - .047], 14);
        tube(batch, 'headlight', .051, [x - .061, .123, z - .042], [x - .061, .123, z - .053], 14);
        tube(batch, 'headlight', .043, [x + .075, .123, z - .032], [x + .075, .123, z - .051], 12);
      } else {
        const width = kind === 'dart' ? .228 : .205;
        box(batch, 'headlight', [width, .031, .024], [x, deck * .31 + .066, z - .041], [0, 0, side * .12]);
        box(batch, 'headlight', [width * .8, .024, .023],
          [x + side * .017, deck * .31 + .020, z - .04], [0, 0, side * .12]);
      }
      box(batch, 'amber', [.036, .031, .023], [side * .70, deck * .4 + .064, z - .016]);
    }
    const [ventZ, ventY, count] = spec.vent;
    box(batch, 'trim', [kind === 'bruiser' ? .57 : .46, .064, .29], [0, ventY, ventZ], [-.1, 0, 0]);
    for (let slot = 0; slot < count; slot++) {
      box(batch, 'brake', [.031, .028, .181], [(slot - (count - 1) / 2) * .066, ventY + .032, ventZ]);
    }
  }

  function makeRear(batch, kind) {
    box(batch, 'trim', [1.45, .145, .121], [0, -.235, 1.629]);
    box(batch, 'trim', [1.28, .121, .065], [0, .153, 1.672]);
    for (const side of sides) {
      const x = side * .58;
      const width = kind === 'dart' ? .34 : .225;
      box(batch, 'taillight', [width, .047, .023], [x, .201, 1.705]);
      if (kind !== 'dart') box(batch, 'taillight', [width, .034, .023], [x, .135, 1.706]);
      tube(batch, 'steel', .068, [side * .48, -.316, 1.53], [side * .48, -.316, 1.721], 12);
      tube(batch, 'trim', .049, [side * .48, -.316, 1.711], [side * .48, -.316, 1.724], 12);
    }
    face(batch, 'decal', [[-.27, -.146, 1.707], [.27, -.146, 1.707],
      [.27, -.038, 1.707], [-.27, -.038, 1.707]], [0, 0, 1], [[0, 0], [1, 0], [1, .5], [0, .5]]);
  }

  function makeKit(batch, kind) {
    if (kind === 'dart') {
      for (const side of sides) {
        const x = side * .54;
        tube(batch, 'steel', .028, [x, .36, 1.18], [x, .79, 1.28]);
        tube(batch, 'trim', .026, [x, .36, 1.46], [x, .79, 1.28]);
        box(batch, 'trim', [.068, .234, .469], [side * .861, .80, 1.27], [-.1, 0, 0]);
      }
      box(batch, 'stripe', [1.73, .058, .32], [0, .82, 1.27], [-.10, 0, 0]);
      box(batch, 'trim', [1.57, .045, .093], [0, .78, 1.425]);
      return;
    }

    if (kind === 'rumbler') {
      for (const side of sides) {
        const x = side * .66;
        tube(batch, 'steel', .034, [x, -.277, -1.71], [x, -.023, -1.716]);
        tube(batch, 'steel', .032, [x, -.023, -1.716], [side * .54, .059, -1.713]);
      }
      tube(batch, 'steel', .037, [-.54, .059, -1.713], [.54, .059, -1.713]);
      const base = [-.423, .92, .78];
      const end = [-.454, 1.23, .945];
      tube(batch, 'trim', .012, base, end, 6);
      tube(batch, 'amber', .025, end, [-.661, 1.24, .96], 7);
      box(batch, 'trim', [1.145, .059, .185], [0, .96, 1.013]);
      return;
    }

    box(batch, 'trim', [1.39, .12, .92], [0, .436, 1.04]);
    for (const side of sides) {
      const x = side * .64;
      tube(batch, 'steel', .038, [x, .46, 1.47], [side * .58, .89, .45]);
      tube(batch, 'steel', .055, [x, .435, .45], [x, .435, 1.49]);
      const inside = side * .52;
      face(batch, 'steel', [[inside, -.414, -1.74], [side * .94, -.373, -1.66],
        [side * .82, -.079, -1.61], [inside, -.034, -1.707]], [0, 0, -1]);
      face(batch, 'steel', [[side * .94, -.373, -1.66], [side * .90, -.40, -1.57],
        [side * .82, -.079, -1.61]], [side, 0, 0]);
      box(batch, 'amber', [.17, .073, .085], [side * .309, 1.115, -.352], [0, side * .18, 0]);
    }
    box(batch, 'steel', [1.04, .384, .075], [0, -.222, -1.70], [.1, 0, 0]);
    box(batch, 'trim', [1.07, .052, .082], [0, -.413, -1.703], [.1, 0, 0]);
    for (const x of [-.395, -.235, .235, .395]) {
      box(batch, 'stripe', [.065, .23, .008], [x, -.22, -1.745], [.1, 0, -.37]);
    }
    box(batch, 'trim', [.935, .071, .16], [0, 1.078, -.338]);
  }

  function body(kits) {
    const kind = getClass(kits);
    if (bodyCache.has(kind)) return bodyCache.get(kind);
    const spec = defaults[kind];
    const batch = createBatch();
    makeShell(batch, spec);
    makeCabin(batch, spec.cabin, kind === 'bruiser');
    makeStripes(batch, spec);
    makeFront(batch, kind, spec);
    makeRear(batch, kind);
    makeKit(batch, kind);
    const geometry = batch.finish();
    bodyCache.set(kind, geometry);
    return geometry;
  }

  function wheel(side, kits) {
    const kind = getClass(kits);
    const key = kind + side;
    if (wheelCache.has(key)) return wheelCache.get(key);
    const batch = createBatch();
    const points = [
      [.244, -.128], [.299, -.128], [.350, -.111], [.382, -.083],
      [.397, -.053], [.397, .053], [.382, .083], [.350, .111],
      [.299, .128], [.244, .128],
    ];
    const tread = new LatheGeometry(points.map(point => new Vector2(...point)), 24);
    tread.rotateZ(Math.PI / 2);
    add(batch, 'rubber', tread);
    for (let index = 0; index < 18; index++) {
      const angle = 2 * Math.PI * index / 18;
      for (const x of [-.048, .048]) {
        box(batch, 'rubber', [.087, .015, .038],
          [x, .394 * Math.cos(angle), .394 * Math.sin(angle)], [angle, Math.sign(x) * .29, 0]);
      }
    }
    const faceX = side * .132;
    const wheelAxis = [0, 0, -Math.PI / 2];
    add(batch, 'brake', new CylinderGeometry(.239, .239, .044, 24), [side * .102, 0, 0], wheelAxis);
    const rim = new LatheGeometry([[.218, -.01], [.247, -.01], [.247, .009], [.218, .009], [.218, -.01]]
      .map(pair => new Vector2(...pair)), 24);
    rim.rotateZ(Math.PI / 2);
    add(batch, 'steel', rim, [faceX, 0, 0]);
    const spokeCount = { dart: 5, rumbler: 6, bruiser: 8 }[kind];
    for (let index = 0; index < spokeCount; index++) {
      const angle = 2 * Math.PI * index / spokeCount;
      const broad = kind === 'bruiser';
      box(batch, 'steel', [.028, .155, broad ? .057 : .034],
        [faceX, .148 * Math.cos(angle), .148 * Math.sin(angle)], [angle + (broad ? 0 : .08), 0, 0]);
      if (broad) {
        add(batch, 'caliper', new CylinderGeometry(.014, .014, .012, 6),
          [faceX + side * .02, .223 * Math.cos(angle), .223 * Math.sin(angle)], wheelAxis);
      }
    }
    add(batch, 'steel', new CylinderGeometry(.076, .076, .038, 10), [side * .141, 0, 0], wheelAxis);
    add(batch, 'brake', new CylinderGeometry(.041, .041, .022, 10), [side * .163, 0, 0], wheelAxis);
    const geometry = batch.finish();
    wheelCache.set(key, geometry);
    return geometry;
  }

  return { body, wheel };
}
