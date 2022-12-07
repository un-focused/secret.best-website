import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
    children?: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
}

export default function AlertDialog({ children, isOpen, setIsOpen, title }: Props) {
    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Dialog
            open={ isOpen }
            onClose={ handleClose }
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle>
                { title }
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    { children }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={ handleClose } autoFocus>
                    Copy
                </Button>
                <Button onClick={ handleClose }>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}