<script lang="ts">
	import ImagePlaceholder from '$components/ImagePlaceholder.svelte';
	import GenerationImage from '$components/generationImage/GenerationImage.svelte';
	import GenerationAnimation from '$components/grids/GenerationAnimation.svelte';
	import LL from '$i18n/i18n-svelte';
	import type { TGenerationWithSelectedOutput } from '$ts/stores/user/generation';
	import { quadIn, quadOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	export let generation: TGenerationWithSelectedOutput;

	$: output = generation.selected_output;
	$: status = output.status;
	$: animation = output.animation;
</script>

<div class="w-full h-full relative group">
	<ImagePlaceholder width={generation.width} height={generation.height} />
	<div
		class="absolute left-0 top-0 w-full h-full rounded-xl bg-c-bg-secondary transition border-4 border-c-bg-secondary
    z-0 overflow-hidden shadow-lg shadow-c-shadow/[var(--o-shadow-normal)]"
	>
		{#if generation.is_placeholder}
			<!-- content here -->
		{:else if status !== 'failed' && status !== 'failed-nsfw'}
			{#if status !== undefined && status !== 'succeeded' && animation !== undefined}
				<div
					out:fade|local={{ duration: 3000, easing: quadIn }}
					class="w-full h-full absolute left-0 top-0"
				>
					<GenerationAnimation {animation} />
				</div>
			{/if}
			{#if status === undefined || status === 'succeeded'}
				<GenerationImage cardType="generate" useUpscaledImage={false} {generation} />
			{/if}
		{:else}
			<div
				in:fade|local={{ duration: 200, easing: quadOut }}
				class="w-full h-full flex items-center bg-c-bg-secondary justify-center relative"
			>
				<p class="text-sm text-c-on-bg/50 px-5 py-3 text-center leading-relaxed">
					{status === 'failed-nsfw' ? $LL.Error.ImageWasNSFW() : $LL.Error.SomethingWentWrong()}
				</p>
			</div>
		{/if}
	</div>
</div>
