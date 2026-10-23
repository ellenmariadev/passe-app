type Listener = (pending: number) => void;

let pending = 0;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener(pending);
  }
}

export function startLoading(): void {
  pending += 1;
  emit();
}

export function stopLoading(): void {
  pending = Math.max(0, pending - 1);
  emit();
}

export function getPendingRequests(): number {
  return pending;
}

export function subscribeLoading(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
