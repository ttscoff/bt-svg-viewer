import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import SVGViewer from "../../bt-svg-viewer/js/bt-svg-viewer.js";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("SVGViewer core behavior", () => {
  const setupDom = (options = {}) => {
    const { includeSlider = false } = options;
    document.body.innerHTML = `
			<div id="viewer-1" class="bt-svg-viewer-wrapper">
				<div class="bt-svg-viewer-main" data-viewer="viewer-1">
					<div class="svg-controls controls-mode-expanded" data-viewer="viewer-1">
						<button class="bt-svg-viewer-btn zoom-in-btn" data-viewer="viewer-1"></button>
						<button class="bt-svg-viewer-btn zoom-out-btn" data-viewer="viewer-1"></button>
						<button class="bt-svg-viewer-btn reset-zoom-btn" data-viewer="viewer-1"></button>
						<button class="bt-svg-viewer-btn center-view-btn" data-viewer="viewer-1"></button>
						<span class="zoom-percentage" data-viewer="viewer-1"></span>
						<button class="bt-svg-viewer-btn coord-copy-btn" data-viewer="viewer-1"></button>
						${
              includeSlider
                ? '<input type="range" class="zoom-slider" data-viewer="viewer-1" value="100" min="10" max="400" />'
                : ""
            }
					</div>
					<div class="svg-container" data-viewer="viewer-1">
						<div class="svg-viewport" data-viewer="viewer-1"></div>
					</div>
					<div class="coord-output" data-viewer="viewer-1"></div>
				</div>
			</div>
		`;
  };

  const createViewer = (overrides = {}) =>
    new SVGViewer({
      viewerId: "viewer-1",
      svgUrl: "https://example.com/test.svg",
      initialZoom: 1,
      minZoom: 0.5,
      maxZoom: 4,
      zoomStep: 0.25,
      showCoordinates: true,
      panMode: "drag",
      zoomMode: "scroll",
      ...overrides,
    });

  beforeEach(() => {
    setupDom();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      return setTimeout(() => cb(Date.now()), 0);
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("normalizes interaction modes", () => {
    expect(SVGViewer.normalizePanMode("Drag")).toBe("drag");
    expect(SVGViewer.normalizePanMode("scroll")).toBe("scroll");
    expect(SVGViewer.normalizeZoomMode("CLICK")).toBe("click");
    expect(SVGViewer.normalizeZoomMode("super scroll")).toBe("super_scroll");
  });

  it("initializes with provided options and loads SVG", async () => {
    const viewer = createViewer({ showCoordinates: false });

    await flush();

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/test.svg");
    expect(viewer.currentZoom).toBe(1);
    expect(
      document
        .querySelector('[data-viewer="viewer-1"].zoom-percentage')
        .textContent.trim()
    ).toContain("100");
  });

  it("clamps zoom values when setZoom is called directly", () => {
    const viewer = createViewer({
      maxZoom: 1.5,
      minZoom: 0.5,
      zoomStep: 0.5,
      showCoordinates: false,
    });

    viewer.setZoom(1.5, { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(1.5, 5);

    viewer.setZoom(2.0, { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(1.5, 5);

    viewer.setZoom(0.5, { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(0.5, 5);

    viewer.setZoom(0.2, { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(0.5, 5);
  });

  it("propagates slider input to setZoom", async () => {
    setupDom({ includeSlider: true });

    const viewer = createViewer({
      minZoom: 1,
      maxZoom: 2,
      zoomStep: 0.1,
      showCoordinates: false,
      panMode: "scroll",
      zoomMode: "super_scroll",
    });

    const slider = viewer.zoomSliderEls[0];
    expect(slider).toBeDefined();

    slider.value = "150";
    const setZoomSpy = vi.spyOn(viewer, "setZoom");
    slider.dispatchEvent(new Event("input"));

    await flush();

    expect(setZoomSpy).toHaveBeenLastCalledWith(1.5);
  });

  it("copies center coordinates to clipboard when available", async () => {
    const viewer = createViewer({
      showCoordinates: true,
      panMode: "scroll",
      zoomMode: "super_scroll",
    });

    const copyButton = document.querySelector(
      '[data-viewer="viewer-1"].coord-copy-btn'
    );
    viewer.getVisibleCenterPoint = vi
      .fn()
      .mockReturnValue({ x: 12.345, y: 67.89 });

    copyButton.click();
    await flush();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("12.35, 67.89");
  });

  it("falls back to prompt when clipboard API is unavailable", async () => {
    const viewer = createViewer({
      showCoordinates: true,
      panMode: "scroll",
      zoomMode: "super_scroll",
    });

    const copyButton = document.querySelector(
      '[data-viewer="viewer-1"].coord-copy-btn'
    );
    viewer.getVisibleCenterPoint = vi.fn().mockReturnValue({ x: 1.2, y: 3.4 });

    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = undefined;
    window.prompt.mockClear();

    copyButton.click();
    await flush();

    expect(window.prompt).toHaveBeenCalledWith(
      "Copy coordinates",
      "1.20, 3.40"
    );

    navigator.clipboard.writeText = originalWriteText;
  });

  it("invokes performWheelZoom for eligible wheel events", async () => {
    const viewer = createViewer({
      maxZoom: 3,
      panMode: "scroll",
      zoomMode: "scroll",
      showCoordinates: false,
    });

    const container = document.querySelector(
      '[data-viewer="viewer-1"].svg-container'
    );
    viewer.baseDimensions = { width: 2000, height: 1000 };
    viewer.baseOrigin = { x: 0, y: 0 };
    viewer.unitsPerCss = { x: 1, y: 1 };
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 400 });
    Object.defineProperty(container, "scrollWidth", { value: 600 });
    Object.defineProperty(container, "scrollHeight", { value: 800 });

    const performWheelZoomSpy = vi.spyOn(viewer, "performWheelZoom");

    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -160,
      clientX: 250,
      clientY: 200,
      bubbles: true,
      cancelable: true,
    });

    viewer.handleMouseWheel(wheelEvent);
    await flush();

    expect(performWheelZoomSpy).toHaveBeenCalled();
  });

  it("adjusts container scroll when zooming around a focus point", () => {
    const viewer = createViewer({
      maxZoom: 3,
      panMode: "scroll",
      zoomMode: "scroll",
      showCoordinates: false,
    });

    const container = document.querySelector(
      '[data-viewer="viewer-1"].svg-container'
    );
    viewer.baseDimensions = { width: 2000, height: 1000 };
    viewer.baseOrigin = { x: 0, y: 0 };
    viewer.unitsPerCss = { x: 1, y: 1 };
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 400 });
    Object.defineProperty(container, "scrollWidth", {
      get() {
        return 800;
      },
    });
    Object.defineProperty(container, "scrollHeight", {
      get() {
        return 900;
      },
    });

    viewer.setZoom(1.5, {
      animate: false,
      focusX: 400,
      focusY: 300,
      focusOffsetX: 200,
      focusOffsetY: 150,
    });

    expect(container.scrollLeft).toBeGreaterThanOrEqual(0);
    expect(container.scrollTop).toBeGreaterThanOrEqual(0);
  });

  it("disables zoom buttons when reaching bounds", async () => {
    const viewer = createViewer({
      maxZoom: 1.5,
      minZoom: 0.5,
      zoomStep: 0.5,
      showCoordinates: false,
    });

    const zoomInButton = document.querySelector(
      '[data-viewer="viewer-1"].zoom-in-btn'
    );
    const zoomOutButton = document.querySelector(
      '[data-viewer="viewer-1"].zoom-out-btn'
    );

    viewer.setZoom(1.5, { animate: false });
    await flush();

    expect(zoomInButton.disabled).toBe(true);
    expect(zoomInButton.getAttribute("aria-disabled")).toBe("true");
    expect(zoomOutButton.disabled).toBe(false);

    viewer.setZoom(0.5, { animate: false });
    await flush();

    expect(zoomOutButton.disabled).toBe(true);
    expect(zoomOutButton.getAttribute("aria-disabled")).toBe("true");
    expect(zoomInButton.disabled).toBe(false);
  });

  it("enforces zoom bounds through zoom buttons", async () => {
    const viewer = createViewer({
      maxZoom: 1.5,
      minZoom: 0.5,
      zoomStep: 0.5,
      showCoordinates: false,
    });

    viewer.setZoom(viewer.computeZoomTarget("in"), { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(1.5, 5);

    viewer.setZoom(viewer.computeZoomTarget("out"), { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(1.0, 5);

    viewer.setZoom(viewer.computeZoomTarget("out"), { animate: false });
    expect(viewer.currentZoom).toBeCloseTo(0.5, 5);
  });
});
