import { createSignal, onCleanup, onMount } from "solid-js";

export function useMouseDown() {
	const [isDown, setIsDown] = createSignal(false)

	onMount(() => {
		const onMouseDown = () => setIsDown(true);
		const onMouseUp = () => setIsDown(false);

		document.addEventListener("mousedown", onMouseDown);
		document.addEventListener("mouseup", onMouseUp);

		onCleanup(() => {
			document.removeEventListener("mousedown", onMouseDown);
			document.removeEventListener("mouseup", onMouseUp);
		});
	})
	return isDown;
}
