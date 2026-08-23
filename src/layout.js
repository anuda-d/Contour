const TYPE_RADIUS = {
  user: 0,
  thought: 205,
  media: 385,
};

const COLLISION_RADIUS = {
  user: 78,
  thought: 116,
  media: 88,
};

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function initialPosition(node, index, count) {
  if (node.type === "user") return { x: 0, y: 0 };

  const typeOffset = node.type === "thought" ? 0.25 : -0.15;
  const angle =
    ((Math.PI * 2 * index) / Math.max(count, 1) +
      (stableHash(node.id) % 29) / 29 +
      typeOffset) %
    (Math.PI * 2);
  const radius = TYPE_RADIUS[node.type] + (stableHash(node.id) % 47) - 23;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.72,
  };
}

export function layoutGraph(nodes, edges, options = {}) {
  const width = options.width ?? 1080;
  const height = options.height ?? 720;
  const movable = nodes.filter((node) => node.type !== "user");
  const positions = new Map();
  const velocity = new Map();

  nodes.forEach((node) => {
    const typeIndex = movable.findIndex((candidate) => candidate.id === node.id);
    positions.set(node.id, initialPosition(node, typeIndex, movable.length));
    velocity.set(node.id, { x: 0, y: 0 });
  });

  for (let iteration = 0; iteration < 220; iteration += 1) {
    const forces = new Map(nodes.map((node) => [node.id, { x: 0, y: 0 }]));

    for (let left = 0; left < nodes.length; left += 1) {
      for (let right = left + 1; right < nodes.length; right += 1) {
        const a = positions.get(nodes[left].id);
        const b = positions.get(nodes[right].id);
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        if (dx === 0 && dy === 0) dx = 0.01;
        const distanceSquared = Math.max(dx * dx + dy * dy, 900);
        const distance = Math.sqrt(distanceSquared);
        const magnitude = 14500 / distanceSquared;
        const fx = (dx / distance) * magnitude;
        const fy = (dy / distance) * magnitude;
        forces.get(nodes[left].id).x += fx;
        forces.get(nodes[left].id).y += fy;
        forces.get(nodes[right].id).x -= fx;
        forces.get(nodes[right].id).y -= fy;
      }
    }

    edges.forEach((edge) => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      const desired = edge.kind === "authored" ? 205 : 175;
      const magnitude = (distance - desired) * 0.014;
      const fx = (dx / distance) * magnitude;
      const fy = (dy / distance) * magnitude;
      forces.get(edge.source).x += fx;
      forces.get(edge.source).y += fy;
      forces.get(edge.target).x -= fx;
      forces.get(edge.target).y -= fy;
    });

    nodes.forEach((node) => {
      if (node.type === "user") return;
      const point = positions.get(node.id);
      const force = forces.get(node.id);
      force.x += -point.x * 0.0018;
      force.y += -point.y * 0.0018;
      const speed = velocity.get(node.id);
      speed.x = (speed.x + force.x) * 0.78;
      speed.y = (speed.y + force.y) * 0.78;
      point.x += speed.x;
      point.y += speed.y;
      point.x = Math.max(-width / 2 + 70, Math.min(width / 2 - 70, point.x));
      point.y = Math.max(-height / 2 + 60, Math.min(height / 2 - 60, point.y));
    });
  }

  for (let pass = 0; pass < 72; pass += 1) {
    for (let left = 0; left < nodes.length; left += 1) {
      for (let right = left + 1; right < nodes.length; right += 1) {
        const leftNode = nodes[left];
        const rightNode = nodes[right];
        const a = positions.get(leftNode.id);
        const b = positions.get(rightNode.id);
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        if (dx === 0 && dy === 0) {
          dx = left < right ? 1 : -1;
          dy = 0.5;
        }
        const distance = Math.max(Math.hypot(dx, dy), 0.01);
        const minimum = COLLISION_RADIUS[leftNode.type] + COLLISION_RADIUS[rightNode.type];
        if (distance >= minimum) continue;

        const overlap = minimum - distance;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const leftFixed = leftNode.type === "user";
        const rightFixed = rightNode.type === "user";
        const leftShare = leftFixed ? 0 : rightFixed ? 1 : 0.5;
        const rightShare = rightFixed ? 0 : leftFixed ? 1 : 0.5;
        a.x -= unitX * overlap * leftShare;
        a.y -= unitY * overlap * leftShare;
        b.x += unitX * overlap * rightShare;
        b.y += unitY * overlap * rightShare;
      }
    }
  }

  positions.set(
    nodes.find((node) => node.type === "user")?.id,
    { x: 0, y: 0 },
  );

  return Object.fromEntries(
    [...positions.entries()].map(([id, point]) => [
      id,
      {
        x: Math.round(point.x * 100) / 100,
        y: Math.round(point.y * 100) / 100,
      },
    ]),
  );
}
