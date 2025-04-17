export const getCurrentNodeName = (nodes: string[]) => {
	const lastNode = nodes[nodes.length - 1];

	if (lastNode.startsWith('agent') && nodes.length > 1) {
		return nodes[nodes.length - 2].split(':')[0];
	}

	return lastNode.split(':')[0];
};
