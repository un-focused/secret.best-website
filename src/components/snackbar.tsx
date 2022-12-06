import MUISnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export type Severity = 'error' | 'warning' | 'info' | 'success';

interface Props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    authHideDuration?: number;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'success';
}

export default function Snackbar({ isOpen, setIsOpen, authHideDuration = 6000, message, severity }: Props) {
    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <MUISnackbar open={ isOpen } autoHideDuration={ authHideDuration } onClose={ handleClose }>
            <Alert onClose={ handleClose } severity={ severity } sx={{ width: '100%' }}>
                { message }
            </Alert>
        </MUISnackbar>
    );
}