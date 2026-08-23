import { ThoughtMap } from "./map.js?v=editorial-constellation-5";
import { getSeedGraph } from "./seed.js";

const root = document.querySelector("#app");

try {
  const graph = getSeedGraph();
  if (!graph.nodes.length) {
    root.innerHTML = `
      <main class="empty-state">
        <h1>This Map is ready for its first Thought.</h1>
        <p>Add a Book or Film to begin shaping it.</p>
      </main>
    `;
  } else {
    window.thoughtMap = new ThoughtMap(root, graph);
  }
} catch (error) {
  console.error("The Map could not start.", error);
  root.innerHTML = `
    <main class="error-state" role="alert">
      <h1>The Map could not open.</h1>
      <p>Reload the page. If the problem continues, the local seed needs attention.</p>
    </main>
  `;
}
