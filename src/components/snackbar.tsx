import MUISnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// TODO: rethink this component
export type Severity = 'error' | 'warning' | 'info' | 'success';

interface Props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    authHideDuration?: number;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'center' | 'right';
}

export default function Snackbar({ isOpen, setIsOpen, authHideDuration = 6000, message, severity, vertical = 'bottom', horizontal = 'center' }: Props) {
    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <MUISnackbar
            anchorOrigin={
                {
                    vertical,
                    horizontal
                }
            }
            open={ isOpen }
            autoHideDuration={ authHideDuration }
            onClose={ handleClose }>
            <Alert 
                onClose={ handleClose }
                severity={ severity }
                sx={{ width: '100%' }}>
                { message }
            </Alert>
        </MUISnackbar>
    );
}