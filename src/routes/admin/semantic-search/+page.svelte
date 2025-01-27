<script lang="ts">
	import { browser } from '$app/environment';
	import IconSearch from '$components/icons/IconSearch.svelte';
	import Input from '$components/Input.svelte';
	import LL from '$i18n/i18n-svelte';
	import { navbarHeight } from '$ts/stores/navbarHeight';
	import { createQuery } from '@tanstack/svelte-query';
	import { quadOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import IconAnimatedSpinner from '$components/icons/IconAnimatedSpinner.svelte';
	import IconSadFace from '$components/icons/IconSadFace.svelte';
	import { PUBLIC_BUCKET_URL, PUBLIC_GO_SERVER_URL_QA } from '$env/static/public';
	import { apiUrl } from '$ts/constants/main.js';

	export let data;

	let searchString: string;
	let searchStringDebounced: string | undefined = undefined;
	let currentText: string;
	let searchTimeout: NodeJS.Timeout;
	let searchDebounceMs = 500;
	$: searchString, setDebouncedSearch(searchString);
	const endpoint = `${apiUrl.origin}/clipq`;

	const getUrlFromImagePath = (imagePath: string) => {
		return `${PUBLIC_BUCKET_URL}/${imagePath}`;
	};

	$: semanticSearchQuery = browser
		? createQuery({
				queryKey: ['admin_semantic_search', searchStringDebounced],
				queryFn: async () => {
					const params = new URLSearchParams();
					params.append(
						'query',
						searchStringDebounced !== undefined && searchStringDebounced !== ''
							? searchStringDebounced
							: 'cat'
					);
					const res = await fetch(`${endpoint}?${params.toString()}`, {
						method: 'GET',
						headers: {
							Authorization: data.clipApiToken || ''
						}
					});
					if (!res.ok) {
						throw new Error('Non-200 response');
					}
					const resJson: {
						data: { image: string; prompt: string }[];
						translated_text?: string;
						input_text: string;
					} = await res.json();
					currentText = resJson.translated_text || resJson.input_text;
					return resJson;
				}
		  })
		: undefined;

	let scrollDirection: 'up' | 'down' = 'down';
	let oldScrollY = 0;
	let notAtTheVeryTop = false;

	async function setDebouncedSearch(searchString: string | undefined) {
		if (!browser) return;
		clearTimeout(searchTimeout);
		if (!searchString) {
			searchStringDebounced = '';
			return;
		}
		searchTimeout = setTimeout(async () => {
			if (searchString) {
				searchStringDebounced = searchString;
			} else {
				searchStringDebounced = '';
			}
		}, searchDebounceMs);
	}

	const notAtTheVeryTopThreshold = 5;
	const minScrollThreshold = 40;

	$: hideSearchBar = scrollDirection === 'down' && notAtTheVeryTop;

	function onScroll() {
		const scrollY = window.scrollY;
		const _notAtTheVeryTop = scrollY > notAtTheVeryTopThreshold;
		if (_notAtTheVeryTop !== notAtTheVeryTop) {
			notAtTheVeryTop = _notAtTheVeryTop;
		}
		if (Math.abs(window.scrollY - oldScrollY) < minScrollThreshold) return;
		if (window.scrollY > oldScrollY) {
			scrollDirection = 'down';
		} else {
			scrollDirection = 'up';
		}
		oldScrollY = scrollY;
	}
</script>

<svelte:window on:scroll={onScroll} />
<div class="w-full flex-1 flex flex-col items-center relative mt-1 md:mt-0">
	<div
		style="top: {$navbarHeight}px"
		class="w-full px-2 py-1 md:py-2 flex flex-col items-center justify-center sticky z-10 transition duration-200 {hideSearchBar
			? '-translate-y-22 pointer-events-none opacity-0'
			: 'translate-y-0 opacity-100'}"
	>
		<Input
			disabled={hideSearchBar}
			class="w-full max-w-2xl"
			bind:value={searchString}
			title={$LL.Gallery.SearchInput.Title()}
			hasIcon
			hasClearButton
			bg="bg-secondary"
			shadow={notAtTheVeryTop ? 'strongest' : 'normal'}
		>
			<IconSearch slot="icon" class="w-full h-full" />
		</Input>
		<div
			class="w-full max-w-2xl text-xs px-3 py-2 text-c-primary rounded-md mt-2 bg-c-bg-secondary
			shadow-lg {notAtTheVeryTop
				? 'shadow-c-shadow/[var(--o-shadow-strongest)]'
				: 'shadow-c-shadow/[var(--o-shadow-normal)]'}"
		>
			<span class="text-c-on-bg/50">Translation:</span>
			{currentText}
		</div>
	</div>
	<div class="w-full px-1 pb-3 pt-1 md:pt-3 relative flex flex-col flex-1">
		{#if $semanticSearchQuery?.isError}
			<div
				class="w-full flex flex-col text-c-on-bg/60 flex-1 py-6 px-4 justify-center items-center text-center"
			>
				<div class="w-16 h-16">
					<IconSadFace class="w-full h-full" />
				</div>
				<p class="mt-2">Something went wrong :(</p>
				<div class="h-[2vh]" />
			</div>
		{:else if !semanticSearchQuery || !$semanticSearchQuery || $semanticSearchQuery?.isInitialLoading || $semanticSearchQuery.data === undefined}
			<div
				class="w-full flex flex-col text-c-on-bg/60 flex-1 py-6 px-4 justify-center items-center text-center"
			>
				<div
					in:scale|local={{
						duration: 200,
						easing: quadOut,
						opacity: 0,
						start: 0.5
					}}
					class="w-12 h-12"
				>
					<IconAnimatedSpinner class="w-full h-full" />
				</div>
				<p class="mt-2 opacity-0">
					{$LL.Gallery.SearchingTitle()}
				</p>
				<div class="h-[2vh]" />
			</div>
		{:else if $semanticSearchQuery?.data?.data.length === 0}
			<div
				class="w-full flex flex-col text-c-on-bg/60 flex-1 py-6 px-4 justify-center items-center text-center"
			>
				<div class="w-16 h-16">
					<IconSearch class="w-full h-full" />
				</div>
				<p class="mt-2">No matches</p>
				<div class="h-[2vh]" />
			</div>
		{:else if $semanticSearchQuery?.data?.data.length > 0}
			<div class="w-full flex-1 flex flex-wrap justify-center">
				{#each $semanticSearchQuery.data.data as object}
					<div class="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-1.5">
						<div
							class="w-full rounded-lg ring-4 relative
							ring-c-bg-secondary bg-c-bg-secondary shadow-xl shadow-c-shadow/var(--o-shadow-stronger) overflow-hidden"
						>
							<img
								class="w-full h-auto"
								src={getUrlFromImagePath(object.image)}
								alt={object.prompt}
							/>
							<div
								class="w-full absolute bottom-0 left-0 bg-c-bg/85 px-3 py-2 max-h-[4rem] overflow-hidden"
							>
								<p class="w-full text-xxs leading-normal">{object.prompt}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
