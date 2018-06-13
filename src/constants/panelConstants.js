export const panelTypes = {
	UNCERTAIN: 'UNCERTAIN',
	POS_PROBS: 'POS_PROBS',
	NEG_PROBS: 'NEG_PROBS',
	POS_LABEL: 'POS_LABEL',
	NEG_LABEL: 'NEG_LABEL',
	UNK_LABEL: 'UNK_LABEL',
}

export const panelNames = {
	UNCERTAIN: 'Uncertain',
	POS_PROBS: 'Positive',
	NEG_PROBS: 'Negative',
	POS_LABEL: 'Marked Positive',
	NEG_LABEL: 'Marked Negative',
	UNK_LABEL: 'Marked Uncertain',
}

export const predictPanelTypes = [panelTypes.POS_PROBS, panelTypes.NEG_PROBS, panelTypes.UNCERTAIN]
export const labeledPanelTypes = [panelTypes.POS_LABEL, panelTypes.NEG_LABEL, panelTypes.UNK_LABEL]
