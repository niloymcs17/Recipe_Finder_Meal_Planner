
export function stripHtml(value: string): string {
	return value
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0*39;/g, "'")
		.replace(/&#x27;/gi, "'")
		.trim();
}

export function sanitizeOptional(value: string | null | undefined): string | null {
	if (value == null) return null;
	const cleaned = stripHtml(value);
	return cleaned.length > 0 ? cleaned : null;
}

export function isHttpUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}
