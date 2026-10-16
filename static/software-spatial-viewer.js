/* Saved-output controller. Three.js displays exact archived frames without numerical interpolation. */
(() => {
  "use strict";
  const INITIAL_VIEW = { yaw: -0.58, pitch: 0.44 };
  const TYPE_NAMES = ["Endothelial cell", "Neuron", "Astrocyte"];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const scientific = value => {
    if (!Number.isFinite(value)) return "—";
    if (value === 0) return "0";
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) return value.toExponential(2);
    return Number(value.toPrecision(4)).toString();
  };
  const percent = value => `${scientific(value * 100)}%`;
  const finiteArray = (array, length) => Array.isArray(array) && array.length === length && array.every(Number.isFinite);

  function validate(data) {
    if (data.schema_version !== 1 || !Array.isArray(data.doses) || !data.doses.length || !Array.isArray(data.times_h) || !data.times_h.length) throw new Error("Unsupported archived data schema");
    const frames = data.times_h.length;
    if (!finiteArray(data.times_h, frames) || data.times_h.some((t, i) => i && t <= data.times_h[i - 1])) throw new Error("Invalid recorded times");
    if (!Array.isArray(data.bounds_um) || data.bounds_um.length !== 3 || data.bounds_um.some(b => !finiteArray(b, 2) || b[0] >= b[1])) throw new Error("Invalid spatial bounds");
    if (!data.cells || !Array.isArray(data.cells.positions_um) || !data.cells.positions_um.length || !Array.isArray(data.field_positions_um) || !data.field_positions_um.length) throw new Error("Missing coordinates");
    const cells = data.cells.positions_um.length;
    if (!finiteArray(data.cells.radius_um, cells) || data.cells.radius_um.some(r => r <= 0)) throw new Error("Missing saved radii");
    const points = data.field_positions_um.length;
    if (data.cells.positions_um.some(p => !finiteArray(p, 3)) || data.field_positions_um.some(p => !finiteArray(p, 3))) throw new Error("Invalid coordinates");
    if (!Array.isArray(data.cells.types) || data.cells.types.length !== cells || data.cells.types.some(t => ![0, 1, 2].includes(t))) throw new Error("Invalid cell types");
    if (!Array.isArray(data.cells.ids) || data.cells.ids.length !== cells) throw new Error("Missing cell identifiers");
    const ranges = { field_values: [Infinity, -Infinity], editing_fraction: [Infinity, -Infinity] };
    data.doses.forEach(dose => {
      if (!Number.isFinite(dose.dose) || dose.field_values?.length !== frames || dose.editing_fraction?.length !== frames || dose.summary?.length !== frames) throw new Error("Incomplete scenario");
      for (let frame = 0; frame < frames; frame += 1) {
        if (!finiteArray(dose.field_values[frame], points) || !finiteArray(dose.editing_fraction[frame], cells)) throw new Error("Incomplete saved frame");
        ["field_values", "editing_fraction"].forEach(key => {
          for (const v of dose[key][frame]) {
            ranges[key][0] = Math.min(ranges[key][0], v);
            ranges[key][1] = Math.max(ranges[key][1], v);
          }
        });
        ["extracellular_AAV_mass", "neuron_editing_mean", "astrocyte_editing_mean", "brain_cell_off_target_mean"].forEach(key => {
          if (!Number.isFinite(dose.summary[frame][key])) throw new Error("Missing saved summary");
        });
      }
    });
    // These display domains are calculated once from all archived values, never per frame.
    Object.keys(ranges).forEach(key => {
      const archived = data.global_ranges?.[key];
      if (finiteArray(archived, 2) && archived[0] <= ranges[key][0] && archived[1] >= ranges[key][1]) ranges[key] = [...archived];
      ranges[key][0] = Math.min(0, ranges[key][0]);
    });
    return ranges;
  }

  function mount(root, index) {
    if (root.dataset.spatialMounted) return;
    root.dataset.spatialMounted = "true";
    const q = name => root.querySelector(`[data-spatial-${name}]`);
    const canvases = [q("field"), q("cells")];
    const fallback = q("fallback");
    const status = q("status");
    const tooltip = q("tooltip");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = { data: null, ranges: null, dose: 0, frame: 0, filter: "all", yaw: INITIAL_VIEW.yaw, pitch: INITIAL_VIEW.pitch, playing: false, timer: 0, raf: 0, visible: true, loading: false, scene: null, slice: 100, drag: null };
    const helpId = `spatial-viewer-help-${index}`;
    q("help").id = helpId;
    canvases.forEach(canvas => canvas.setAttribute("aria-describedby", helpId));

    function pause(message) {
      state.playing = false;
      window.clearTimeout(state.timer);
      q("play").textContent = "Play";
      q("play").setAttribute("aria-label", "Play saved frames");
      q("play").setAttribute("aria-pressed", "false");
      if (message) status.textContent = message;
    }

    function scheduleDraw() {
      if (!state.raf) state.raf = window.requestAnimationFrame(() => { state.raf = 0; if (state.data) draw(); });
    }

    function draw() {
      if (!state.scene || !state.visible || document.hidden) return;
      const displayed = state.scene.render(state);
      root.dataset.spatialSlice = String(state.slice);
      root.dataset.spatialClipZ = String(displayed.clipZ);
      root.dataset.spatialVisibleCellCenters = String(displayed.visibleCells);
    }

    function update() {
      const data = state.data, dose = data.doses[state.dose], summary = dose.summary[state.frame];
      const time = data.times_h[state.frame];
      q("time").value = state.frame;
      q("time").setAttribute("aria-valuetext", `${time} hours, recorded frame ${state.frame + 1} of ${data.times_h.length}`);
      q("time-label").textContent = `${time} h`;
      q("frame-label").textContent = `Frame ${state.frame + 1} / ${data.times_h.length} · recorded`;
      q("previous").disabled = state.frame === 0;
      q("next").disabled = state.frame === data.times_h.length - 1;
      q("neuron").textContent = percent(summary.neuron_editing_mean);
      q("astrocyte").textContent = percent(summary.astrocyte_editing_mean);
      const count = state.filter === "all" ? data.cells.positions_um.length : data.cells.types.filter(t => String(t) === state.filter).length;
      q("cell-count").textContent = `${count.toLocaleString()} saved cells`;
      root.querySelectorAll("[data-spatial-dose]").forEach((button, i) => button.setAttribute("aria-pressed", String(i === state.dose)));
      canvases[0].setAttribute("aria-label", `Extracellular AAV at ${data.field_positions_um.length} saved grid locations; dose ${dose.dose} times, ${time} hours. Drag or use arrow keys to rotate.`);
      canvases[1].setAttribute("aria-label", `${count} saved cells colored by edited fraction; dose ${dose.dose} times, ${time} hours. Neuron mean ${percent(summary.neuron_editing_mean)}; astrocyte mean ${percent(summary.astrocyte_editing_mean)}. Drag or use arrow keys to rotate.`);
      tooltip.hidden = true;
      root.dataset.spatialFrame = String(state.frame);
      root.dataset.spatialCurrentDose = String(dose.dose);
      scheduleDraw();
    }

    function tick() {
      if (!state.playing || !state.visible || document.hidden) { pause(); return; }
      if (state.frame >= state.data.times_h.length - 1) { pause("Final saved frame"); return; }
      state.frame += 1;
      update();
      state.timer = window.setTimeout(tick, 450);
    }

    function setFrame(frame) {
      if (!state.data) return;
      pause("Saved frame selected");
      state.frame = clamp(frame, 0, state.data.times_h.length - 1);
      update();
    }

    function hover(event, view) {
      if (!state.data || state.drag) return;
      const closest = state.scene?.pick(view, event);
      if (!closest) { tooltip.hidden = true; return; }
      const position = view ? state.data.cells.positions_um[closest.index] : state.data.field_positions_um[closest.index];
      const heading = view ? `${TYPE_NAMES[state.data.cells.types[closest.index]]} · ID ${state.data.cells.ids[closest.index]}` : `Saved grid location ${closest.index + 1}`;
      const value = view ? `Edited fraction: ${percent(closest.value)}` : `Normalized AAV: ${scientific(closest.value)}`;
      tooltip.textContent = `${heading}\n${value}\nx, y, z: ${position.map(scientific).join(", ")} μm`;
      tooltip.hidden = false;
      const rootRect = root.getBoundingClientRect();
      tooltip.style.left = `${clamp(event.clientX - rootRect.left + 12, 8, Math.max(8, rootRect.width - 242))}px`;
      tooltip.style.top = `${Math.max(8, event.clientY - rootRect.top - tooltip.offsetHeight - 12)}px`;
    }

    canvases.forEach((canvas, view) => {
      canvas.addEventListener("pointerdown", event => {
        if (!state.data || (event.pointerType === "mouse" && event.button !== 0)) return;
        pause("View rotated · saved values unchanged");
        state.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
        tooltip.hidden = true;
        canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener("pointermove", event => {
        if (state.drag && event.pointerId === state.drag.id) {
          state.yaw += (event.clientX - state.drag.x) * 0.009;
          state.pitch = clamp(state.pitch + (event.clientY - state.drag.y) * 0.007, -1.15, 1.15);
          state.drag.x = event.clientX; state.drag.y = event.clientY;
          scheduleDraw();
        } else hover(event, view);
      });
      const endDrag = event => {
        if (state.drag?.id === event.pointerId) state.drag = null;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };
      canvas.addEventListener("pointerup", endDrag);
      canvas.addEventListener("pointercancel", endDrag);
      canvas.addEventListener("pointerleave", () => { tooltip.hidden = true; });
      canvas.addEventListener("keydown", event => {
        if (!state.data || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
        event.preventDefault(); pause("View rotated · saved values unchanged");
        if (event.key === "Home") { state.yaw = INITIAL_VIEW.yaw; state.pitch = INITIAL_VIEW.pitch; }
        if (event.key === "ArrowLeft") state.yaw -= 0.12;
        if (event.key === "ArrowRight") state.yaw += 0.12;
        if (event.key === "ArrowUp") state.pitch = clamp(state.pitch - 0.09, -1.15, 1.15);
        if (event.key === "ArrowDown") state.pitch = clamp(state.pitch + 0.09, -1.15, 1.15);
        scheduleDraw();
      });
    });
    q("time").addEventListener("input", event => setFrame(Number(event.target.value)));
    q("previous").addEventListener("click", () => setFrame(state.frame - 1));
    q("next").addEventListener("click", () => setFrame(state.frame + 1));
    q("filter").addEventListener("change", event => { if (state.data) { state.filter = event.target.value; update(); } });
    q("slice").addEventListener("input", event => {
      pause("Spatial slice selected; summary means retain all saved cells");
      state.slice = Number(event.target.value);
      const z = state.data.bounds_um[2][0] + (state.data.bounds_um[2][1] - state.data.bounds_um[2][0]) * state.slice / 100;
      q("slice-label").textContent = state.slice === 100 ? "Full volume" : `z ≤ ${Math.round(z)} μm`;
      q("slice").setAttribute("aria-valuetext", q("slice-label").textContent);
      tooltip.hidden = true;
      scheduleDraw();
    });
    q("reset").addEventListener("click", () => {
      pause("View reset"); state.yaw = INITIAL_VIEW.yaw; state.pitch = INITIAL_VIEW.pitch;
      state.slice = 100; q("slice").value = 100; q("slice-label").textContent = "Full volume";
      q("slice").setAttribute("aria-valuetext", "Full volume"); tooltip.hidden = true; scheduleDraw();
    });
    q("play").addEventListener("click", () => {
      if (!state.data) return;
      if (state.playing) { pause("Playback paused"); return; }
      if (state.frame === state.data.times_h.length - 1) state.frame = 0;
      state.playing = true;
      q("play").textContent = "Pause";
      q("play").setAttribute("aria-label", "Pause playback");
      q("play").setAttribute("aria-pressed", "true");
      status.textContent = "Playing recorded frames only";
      update(); state.timer = window.setTimeout(tick, 450);
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause("Playback paused"); else scheduleDraw(); });
    const motionChanged = () => { if (motion.matches) pause("Playback paused · reduced motion"); };
    if (motion.addEventListener) motion.addEventListener("change", motionChanged);
    if (window.ResizeObserver) new ResizeObserver(scheduleDraw).observe(root);
    else window.addEventListener("resize", scheduleDraw, { passive: true });

    async function load() {
      if (state.loading || state.data) return;
      state.loading = true;
      root.setAttribute("aria-busy", "true");
      status.textContent = "Loading archived spatial data…";
      status.classList.add("spatial-viewer__sr-only");
      fallback.querySelector("p").hidden = false;
      q("retry").hidden = true;
      try {
        const response = await fetch(root.dataset.source, { credentials: "same-origin" });
        if (!response.ok) throw new Error(`Archived data request failed (${response.status})`);
        const data = await response.json();
        const ranges = validate(data);
        const sceneModule = await import(new URL(root.dataset.spatialModule, document.baseURI).href);
        state.scene = sceneModule.createSpatialScenes(canvases, data, ranges, () => {
          pause("3D rendering interrupted");
          q("interface").hidden = true; fallback.hidden = false;
          fallback.querySelector("p").hidden = false;
          fallback.querySelector("p").textContent = "3D rendering is unavailable. Reload the page to restore the saved-data viewer.";
          root.dataset.spatialReady = "false";
        });
        state.data = data; state.ranges = ranges;
        state.frame = data.times_h.length - 1;
        state.dose = Math.max(0, data.doses.findIndex(d => d.dose === 1));
        q("doses").replaceChildren();
        data.doses.forEach((dose, i) => {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.spatialDose = String(dose.dose);
          button.textContent = `${dose.dose}×`;
          button.setAttribute("aria-label", `Normalized dose ${dose.dose} times`);
          button.addEventListener("click", () => { pause("Saved dose selected"); state.dose = i; update(); });
          q("doses").append(button);
        });
        q("time").max = data.times_h.length - 1;
        q("start").textContent = `${data.times_h[0]} h`;
        q("end").textContent = `${data.times_h.at(-1)} h`;
        q("field-count").textContent = `${data.field_positions_um.length} saved grid locations`;
        q("domain").textContent = `Domain: ${data.bounds_um.map(b => scientific(b[1] - b[0])).join(" × ")} μm (x × y × z)`;
        q("field-min").textContent = scientific(ranges.field_values[0]);
        q("field-max").textContent = scientific(ranges.field_values[1]);
        q("edit-min").textContent = percent(ranges.editing_fraction[0]);
        q("edit-max").textContent = percent(ranges.editing_fraction[1]);
        fallback.hidden = true;
        q("interface").hidden = false;
        root.dataset.spatialReady = "true";
        root.dataset.spatialRenderer = "webgl";
        status.textContent = "Saved frame · drag to explore";
        update();
        root.dispatchEvent(new CustomEvent("spatial-viewer:ready", { bubbles: true, detail: { frames: data.times_h.length, cells: data.cells.positions_um.length, fieldPoints: data.field_positions_um.length, ranges } }));
      } catch (error) {
        state.data = null;
        status.textContent = "The 3D saved-data viewer could not load. Please retry or use the reproducibility package.";
        status.classList.remove("spatial-viewer__sr-only");
        fallback.querySelector("p").hidden = true;
        q("retry").hidden = false;
        console.warn("Spatial saved-output viewer:", error);
      } finally {
        state.loading = false;
        root.removeAttribute("aria-busy");
      }
    }
    q("retry").addEventListener("click", load);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) load(); }, { rootMargin: "250px 0px" }).observe(root);
      new IntersectionObserver(entries => {
        state.visible = entries.some(e => e.isIntersecting);
        if (!state.visible && state.playing) pause("Playback paused outside the view");
        if (state.visible) scheduleDraw();
      }, { threshold: 0 }).observe(root);
    } else load();
  }
  const boot = () => document.querySelectorAll("[data-spatial-viewer]").forEach(mount);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
