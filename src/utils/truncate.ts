export function truncate(target: string, limit: number) {
    const truncatedContent = target.slice(0, limit);
    if (target.length > limit && truncatedContent.length === limit) {
        return `${truncatedContent}...`;
    }

    return truncatedContent;
}
