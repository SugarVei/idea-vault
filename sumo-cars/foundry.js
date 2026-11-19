/* SALTWORKS · editable model for Punch Drive's arena builder. */
const punchDriveSaltworks = (() => {
  const descriptor = {
    id: "saltworks",
    title: "SALTWORKS",
    name: "盐炉高台",
    subtitle: "悬空盐场 · 双跳台 · 开放边缘",
    accent: "#ffac65",
    look: "day",
    night: 0.12,
    grip: 1.02,
    sky: {
      zenith: 0x416d86,
      horizon: 0xc9ddd2,
      ground: 0x40656d,
      fogColor: 0x9ab5b6,
      fogNear: 48,
      fogFar: 150,
      sunColor: 0xffdcab,
      sunIntensity: 2.5,
      ambientIntensity: 0.68,
      sunDirection: [-0.6, 0.82, -0.65],
      showSun: true
    }
  };

  const rampOffset = 7.6;

  const palette = {
    steel: 0x526977,
    darkSteel: 0x233744,
    lightSteel: 0x7f969c,
    salt: 0xd5dace,
    paint: 0xf2ac62,
    warmLight: 0xffa258,
    coolLight: 0xa8ede1,
    stone: 0x789a96,
    hull: 0x314e56
  };

  function floorMaterial(makeMaterial, makeTexture) {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Match the world coordinates used by the collision and deck-edge models.
    function pixel(world) {
      return (world / 48 + 0.5) * size;
    }

    function line(a, b, color, width) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(pixel(a[0]), pixel(a[1]));
      ctx.lineTo(pixel(b[0]), pixel(b[1]));
      ctx.stroke();
    }

    const texture = ctx.createImageData(size, size);
    const tones = [5, -1, 1, -4, 0, 2, -2, 3];
    let state = 273818;
    for (let y = 0; y < size; y++) {
      const row = y >> 7;
      const verticalDistanceSquared = (y - 512) ** 2;
      for (let x = 0; x < size; x++) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        const noise = (state >>> 28) - 7;
        const panel = tones[((x >> 7) * 3 + row * 5) % tones.length];
        const center = Math.max(0, 1 - Math.sqrt((x - 512) ** 2 + verticalDistanceSquared) / 730) * 8;
        const variation = noise * 0.55 + panel + center;
        const offset = (y * size + x) * 4;
        texture.data[offset] = 66 + variation;
        texture.data[offset + 1] = 81 + variation;
        texture.data[offset + 2] = 91 + variation;
        texture.data[offset + 3] = 255;
      }
    }
    ctx.putImageData(texture, 0, 0);

    for (let marker = -18; marker <= 18; marker += 6) {
      line([marker, -24], [marker, 24], "rgba(12,23,28,.42)", 1.3);
      line([-24, marker], [24, marker], "rgba(12,23,28,.42)", 1.3);
    }
    ctx.fillStyle = "rgba(179,204,199,.25)";
    for (let x = -21; x < 23; x += 6) {
      for (let z = -21; z < 23; z += 6) {
        ctx.fillRect(pixel(x - 2.72), pixel(z - 2.72), 2, 2);
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(229,238,219,.44)";
    ctx.lineWidth = 2.3;
    ctx.setLineDash([19, 10]);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 6.3 * size / 48, 0.18, Math.PI * 2 + 0.18);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 26px monospace";
    for (const sign of [-1, 1]) {
      line([sign * 19, -21], [sign * 19, 21], "rgba(174,211,199,.29)", 1.9);
      line([-21, sign * 19], [21, sign * 19], "rgba(174,211,199,.29)", 1.9);
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(pixel(side * 17.4), pixel(sign * 18.1));
        ctx.rotate(sign > 0 ? Math.PI : 0);
        ctx.fillStyle = "rgba(233,237,215,.42)";
        ctx.fillText(side === sign ? "01" : "02", 0, 0);
        ctx.restore();
      }
    }

    // Launch arrows are painted onto the deck on the approaches to both ramps.
    for (const direction of [-1, 1]) {
      const x = direction * rampOffset;
      for (let index = 0; index < 3; index++) {
        const z = direction * (7 + index * 0.68);
        line([x - 0.75, z], [x, z - direction * 0.42], "rgba(244,191,128,.8)", 4);
        line([x, z - direction * 0.42], [x + 0.75, z], "rgba(244,191,128,.8)", 4);
      }
    }

    return makeMaterial(0xffffff, {
      map: makeTexture(canvas),
      roughness: 0.82,
      metalness: 0.12
    });
  }

  function build(tools, { material, emissive, CylinderGeometry }) {
    const { solidBox, artBox, ramp, movableCrate, staticBatch, distantBatch } = tools;
    const steel = material(palette.steel, { metalness: 0.48, roughness: 0.53 });
    const dark = material(palette.darkSteel, { metalness: 0.28, roughness: 0.65 });
    const bright = material(palette.lightSteel, { metalness: 0.38, roughness: 0.56 });
    const salt = material(palette.salt, { roughness: 0.93, flatShading: true });
    const paint = material(palette.paint, { roughness: 0.66, metalness: 0.18 });
    const warmLight = emissive(palette.warmLight, 0.5);
    const coolLight = emissive(palette.coolLight, 0.35);
    const hull = material(palette.hull, { roughness: 0.8, metalness: 0.12 });
    const stone = material(palette.stone, { roughness: 0.96, flatShading: true });

    function distantBox(size, position, surface, rotation = [0, 0, 0]) {
      artBox(size, position, surface, rotation, true);
    }

    function cylinder(batch, top, bottom, height, sides, position, surface, rotation = [0, 0, 0]) {
      batch.add(new CylinderGeometry(top, bottom, height, sides), surface, position, rotation);
    }

    // The arena stays open at all four edges. Trusses and tie assemblies sit
    // under the 48-metre collision deck and cannot catch a falling vehicle.
    for (const edge of [-1, 1]) {
      for (const acrossX of [true, false]) {
        function position(along, height, offset) {
          return acrossX ? [along, height, edge * offset] : [edge * offset, height, along];
        }
        function dimensions(along, height, thickness) {
          return acrossX ? [along, height, thickness] : [thickness, height, along];
        }
        const length = acrossX ? 47.1 : 46.4;
        artBox(dimensions(length, 0.42, 0.51), position(0, -1.67, 23.4), steel);
        artBox(dimensions(length, 0.37, 0.59), position(0, -4.75, 21.8), dark);
        artBox(dimensions(length, 0.16, 0.03), position(0, -1.15, 24.02), bright);

        for (let bay = -20; bay <= 20; bay += 5) {
          const angle = bay % 10 === 0 ? 0.67 : -0.67;
          artBox(dimensions(4.74, 0.31, 0.42), position(bay, -3.2, 22.62), bright,
            acrossX ? [0, 0, angle] : [-angle, 0, 0]);
          artBox(dimensions(0.84, 0.59, 0.72), position(bay, -0.75, 23.79), dark);
          artBox(dimensions(0.42, 0.13, 0.05), position(bay, -0.65, 24.16),
            bay % 10 === 0 ? warmLight : coolLight);
        }
      }
    }

    for (const x of [-19.9, 19.9]) {
      for (const z of [-19.9, 19.9]) {
        cylinder(staticBatch, 1.72, 1.54, 1.2, 8, [x, -4.42, z], steel);
        cylinder(staticBatch, 1.24, 0.9, 3.5, 10, [x, -6.65, z], dark);
        cylinder(staticBatch, 1.07, 1.02, 0.22, 10, [x, -8.17, z], paint);
      }
    }

    // Two mirrored paths keep the center clear. Ramps and the large faces of
    // the press buffers are the only fixed obstacles reaching the drive plane.
    for (const direction of [-1, 1]) {
      const x = direction * rampOffset;
      const yaw = direction > 0 ? 0 : Math.PI;
      ramp(x, direction * 3.62, 4.4, 5.9, 1.14, yaw, steel);

      const bufferX = direction * 5.55;
      const bufferZ = direction * 11.4;
      const bufferAngle = -0.26;
      solidBox([4.6, 0.63, 0.96], [bufferX, 0.315, bufferZ], dark, [0, bufferAngle, 0]);
      artBox([4.57, 0.09, 0.91], [bufferX, 0.646, bufferZ], steel, [0, bufferAngle, 0]);
      for (let stripe = -1.8; stripe <= 2; stripe += 0.6) {
        artBox([0.25, 0.022, 0.72], [
          bufferX + Math.cos(bufferAngle) * stripe,
          0.697,
          bufferZ - Math.sin(bufferAngle) * stripe
        ], paint, [0, bufferAngle + 0.25, 0]);
      }

      movableCrate(direction * -8.45, direction * 12.4, 0x7b9f9a);
    }

    // Surround the suspended deck with modeled evaporation pans, sluices and
    // towers. This scenery lives below/outside the playable collision plane.
    distantBox([183, 2.2, 173], [0, -25.6, 0], hull);
    const brine = [0x416f77, 0x4e8586, 0x688d86, 0x7f9d8e].map(color =>
      material(color, { metalness: 0.14, roughness: 0.71 })
    );
    for (let col = -2; col <= 2; col++) {
      for (let row = -2; row <= 2; row++) {
        const x = col * 31.3;
        const z = row * 28.6;
        distantBox([30.6, 0.82, 27.88], [x, -24.12, z], salt);
        distantBox([29.05, 0.77, 26.3], [x, -24, z], brine[(col * 3 + row * 5 + 24) % 4]);
        distantBox([28.9, 0.12, 0.33], [x, -23.52, z - 7.46], stone);
        distantBox([0.35, 0.12, 25.8], [x + 4.4, -23.53, z], stone);
      }
    }

    for (const site of [
      { x: -29, z: -51, height: 32 },
      { x: 30, z: 53, height: 32 },
      { x: 40, z: -53, height: 27 },
      { x: -40, z: 52, height: 27 }
    ]) {
      const { x, z, height } = site;
      const base = -23.52;
      distantBox([12, 0.65, 10.9], [x, base + 0.25, z], dark);
      for (const offset of [-3.1, 3.1]) {
        cylinder(distantBatch, 1.78, 2.25, height, 10, [x + offset, base + height / 2, z], steel);
        cylinder(distantBatch, 0.91, 1.78, 1.7, 10, [x + offset, base + height + 0.76, z], bright);
        cylinder(distantBatch, 1.91, 1.93, 0.3, 10, [x + offset, base + height * 0.68, z], dark);
        cylinder(distantBatch, 1.01, 1.01, 0.23, 10, [x + offset, base + height + 1.65, z], paint);
        distantBox([0.72, height * 0.44, 0.5], [x + offset, base + height * 0.43, z + 1.95], bright);
      }
      distantBox([8.5, 1.1, 1.65], [x, base + height * 0.72, z + 1.36], dark);
      distantBox([7, 0.15, 0.12], [x, base + height * 0.74, z + 2.25], warmLight);
      distantBox([8.9, 2.2, 5.4], [x, base + 1.65, z + 4.65], stone);
      distantBox([8.8, 0.15, 5.6], [x, base + 2.83, z + 4.65], steel);
    }

    for (const side of [-1, 1]) {
      const x = side * 33.4;
      distantBox([2.6, 0.3, 60], [x, -17.4, 0], steel);
      distantBox([2.85, 0.32, 60], [x, -17.75, 0], dark);
      for (const z of [-25, -12.5, 0, 12.5, 25]) {
        distantBox([0.88, 5.92, 0.82], [x, -20.5, z], dark);
        distantBox([0.12, 0.73, 0.12], [x - side * 1.1, -16.97, z], bright);
        distantBox([0.28, 0.19, 0.2], [x - side * 1.1, -16.55, z], coolLight);
      }
      distantBox([0.12, 0.1, 61.3], [x - side * 1.1, -16.61, 0], bright);
    }

    for (const [x, z, radius] of [
      [-57, 13, 8], [55, -10, 9], [-21, -61, 10], [26, 66, 12], [-66, -23, 7], [68, 26, 9]
    ]) {
      cylinder(distantBatch, radius * 0.13, radius, radius * 0.65, 7,
        [x, -23.48 + radius * 0.325, z], salt, [0, x * 0.38, 0]);
      cylinder(distantBatch, radius * 0.16, radius * 0.52, radius * 0.44, 5,
        [x + radius * 0.26, -23.48 + radius * 0.22, z - radius * 0.54],
        stone, [0, z * 0.68, 0]);
    }
  }

  return { descriptor, floorMaterial, build };
})();
