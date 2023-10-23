function menuItems(handleNew, handleUndoEvent, handleRedoEvent) {
    return [
        {
            label: 'File',
            key: 'file',
            children: [
                {
                    label: 'New',
                    key: 'file:new',
                    onClick: () => {
                        handleNew()
                    }
                }
            ],
        },
        {
            label: 'Edit',
            key: 'edit',
            children: [
                {
                    label: 'Undo',
                    key: 'edit:undo',
                    onClick: () => {
                        handleUndoEvent(true);
                    }
                },
                {
                    label: 'Redo',
                    key: 'edit:redo',
                    onClick: () => {
                        handleRedoEvent(true);
                    }
                }
            ],
        },
        {
            label: 'View',
            key: 'view',
            disabled: true
        }
    ];
}

export default menuItems;