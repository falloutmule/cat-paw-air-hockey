interface WebkitFullscreenDocument extends Document {
  readonly webkitFullscreenElement?: Element | null;
  readonly webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

export function fullscreenElement(documentTarget: Document = document): Element | null {
  const compatibleDocument = documentTarget as WebkitFullscreenDocument;
  return documentTarget.fullscreenElement ?? compatibleDocument.webkitFullscreenElement ?? null;
}

export function fullscreenAvailable(target: HTMLElement, documentTarget: Document = document): boolean {
  const compatibleTarget = target as WebkitFullscreenElement;
  const compatibleDocument = documentTarget as WebkitFullscreenDocument;
  return typeof target.requestFullscreen === "function"
    || typeof compatibleTarget.webkitRequestFullscreen === "function"
    || (fullscreenElement(documentTarget) !== null
      && (typeof documentTarget.exitFullscreen === "function" || typeof compatibleDocument.webkitExitFullscreen === "function"));
}

export async function toggleElementFullscreen(target: HTMLElement, documentTarget: Document = document): Promise<void> {
  const compatibleTarget = target as WebkitFullscreenElement;
  const compatibleDocument = documentTarget as WebkitFullscreenDocument;
  if (fullscreenElement(documentTarget) !== null) {
    if (typeof documentTarget.exitFullscreen === "function") {
      await documentTarget.exitFullscreen();
      return;
    }
    if (typeof compatibleDocument.webkitExitFullscreen === "function") {
      await compatibleDocument.webkitExitFullscreen();
      return;
    }
    throw new Error("Fullscreen exit is unavailable");
  }
  if (typeof target.requestFullscreen === "function") {
    await target.requestFullscreen({ navigationUI: "hide" });
    return;
  }
  if (typeof compatibleTarget.webkitRequestFullscreen === "function") {
    await compatibleTarget.webkitRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen is unavailable");
}
