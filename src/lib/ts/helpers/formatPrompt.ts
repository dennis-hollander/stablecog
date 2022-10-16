import { maxPromptLength } from '$ts/constants/main';

const multiLineBreaksRegex = /\n\s*\n/g;
const singleLineBreaksRegex = /\n/g;

export const removeLineBreaks = (text: string): string => {
	return text.replace(multiLineBreaksRegex, '\n').replace(singleLineBreaksRegex, ' ');
};

export const formatPrompt = (text: string): string => {
	return removeLineBreaks(text.slice(0, maxPromptLength));
};