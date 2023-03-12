export function getImageFileNameFromGeneration({
	url,
	isUpscaled,
	prompt,
	seed,
	inferenceSteps,
	guidanceScale
}: IGetImageFileNameFromGenerationProps) {
	let extension: string;
	if (url.startsWith('data:image/')) {
		extension = url.split(';')[0].split('/')[1];
	} else {
		extension = url.split('.').pop() || 'jpeg';
	}
	return `[s_${seed}]-[gs_${guidanceScale}]-[is_${inferenceSteps}]-[u_${
		isUpscaled ? '1' : '0'
	}]-${prompt}.${extension}`;
}

interface IGetImageFileNameFromGenerationProps {
	url: string;
	isUpscaled: boolean;
	prompt: string;
	seed: number;
	guidanceScale: number;
	inferenceSteps: number;
}
