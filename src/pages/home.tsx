import { VisibilityOff, Visibility, PhotoCamera } from '@mui/icons-material';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { getFileExtension, getFilename } from '../actions/file';
import { encodeFile, encryptFileContents, getCipherMapFromFile } from '../actions/cryptography';
import { isValidCipherMapFile, isValidFile, isValidPassword } from '../actions/validation';
import Snackbar, { Severity } from '../components/snackbar';
import { postSBFiles } from '../actions/request';
import { generatePassword } from '../actions/generate';
import { copyTextToClipboard } from '../actions/clipboard';

// TODO: create constants file
// TODO: add validation (password for instance)
// TODO: break down into components
// TODO: make id's less predictible

export default function Home() {
    const [isCustomPassword, setIsCustomPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [cipherFile, setCipherFile] = useState<File>();
    const [secretFile, setSecretFile] = useState<File>();
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [severity, setSeverity] = useState<Severity>('error');
    const [errorMessage, setErrorMessage] = useState('');
    const [cipherFileID, setCipherFileID] = useState('');
    const [secretFileID, setSecretFileID] = useState('');

    // TODO: make function better
    const validateInputFile = (files: FileList | null) => {
        if (!files || files.length === 0) {
            setSnackbarData('error', 'no file was found');
            return;
        }
    
        const file = files[0];
        if (!isValidFile(file, 2097152)) {
            setSnackbarData('error', 'file is too large < 2MiB');
            return;
        }

        return file;
    }

    const setSnackbarData = (severity: Severity, message: string, isOpen = true) => {
        setSeverity(severity);
        setErrorMessage(message);
        setIsSnackbarOpen(isOpen);
    }

    const handleAlertDialogClose = () => setIsAlertDialogOpen(false);

    const handleAlertDialogCopy = () => {
        const contents = `Secret File: ${ window.location.origin }/secret/${ secretFileID }
Cipher File: ${ window.location.origin }/secret/${ cipherFileID }
Password: ${ password }`;

        copyTextToClipboard(contents);
        setSnackbarData('success', 'copied to clipboard');
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setPassword(value);
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const handleUseCustomPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;

        setIsCustomPassword(value);
    }

    const handleUploadCipherFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = validateInputFile(event.target.files);
        if (!file) {
            return;
        }

        const isValidMap = await isValidCipherMapFile(file);
        if (!isValidMap) {
            setSnackbarData('error', 'invalid cipher file uploaded');
            return;
        }
        
        setCipherFile(file);
    }

    const handleUploadSecretFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = validateInputFile(event.target.files);
        if (!file) {
            return;
        }

        setSecretFile(file);
    }

    const uploadFile = async (file: File, password: string) => {
        const { cipherText, iv } = await encryptFileContents(file, password);
        const encryptedData = {
            cipherText,
            iv
        };
        const name = getFilename(file);
        const extension = getFileExtension(file);

        const payload = {
            name,
            password,
            extension,
            encryptedData: JSON.stringify(encryptedData)
        };

        return postSBFiles(payload);
    }

    const handleSubmit = async () => {
        if (!cipherFile || !secretFile) {
            setSnackbarData('error', 'you need to upload both the cipher & secret file');
            return;
        }

        // password generated will override typed password
        let submitPassword = password;
        if (isCustomPassword && !isValidPassword(password)) {
            setSnackbarData('error', 'your password must be at least 6 characters long & not contain spaces');
            return;
        } else {
            submitPassword = generatePassword();
            setPassword(submitPassword);
        }

        const cipherMap = await getCipherMapFromFile(cipherFile);
        const encodedSecretFile = await encodeFile(secretFile, cipherMap);

        const [ciperFileResponse, secretFileResponse] = await Promise.all(
            [
                uploadFile(cipherFile, submitPassword),
                uploadFile(encodedSecretFile, submitPassword),
            ]
        );

        setCipherFileID('' + ciperFileResponse.id);
        setSecretFileID('' + secretFileResponse.id)
        setSnackbarData('success', 'congrats!!');
        setIsAlertDialogOpen(true);
    }

    return (
        <Box
            sx = {
                {
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }>
            <Paper
                elevation={4}
                sx={
                    {
                        height: '60%',
                        width: 'calc(80% - 200px)',
                        marginTop: '100px',
                        padding: '1.3em',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }
                }>
                <Typography
                    variant='h3'
                    sx = {
                        {
                            marginBottom: '10px'
                        }
                    }>
                    Create your secret
                </Typography>
                <Button
                    variant='text'
                    component='label'
                    size = 'large'
                    // TODO: can upload other files so consider different icon
                    endIcon = { <PhotoCamera/> }
                    sx={
                        {
                            width: '80%',
                            margin: 'auto'
                        }
                    }>
                    <Typography
                        variant='h6'>
                        { secretFile && secretFile.name || '1. Upload Secret File' }
                    </Typography>
                    <input
                        type='file'
                        onChange={ handleUploadSecretFile }
                        hidden />
                </Button>
                <Button
                    variant='text'
                    component='label'
                    size = 'large'
                    endIcon = { <PhotoCamera /> }
                    sx={
                        {
                            width: '80%',
                            margin: 'auto'
                        }
                    }>
                    <Typography
                        variant='h6'>
                        { cipherFile && cipherFile.name || '2. Upload Cipher File' }
                    </Typography>
                    <input
                        type='file'
                        onChange={ handleUploadCipherFile }
                        hidden />
                </Button>
                <FormControlLabel
                    label = 'Use Custom Password'
                    control = {
                        <Checkbox
                            value = { isCustomPassword }
                            onChange = { handleUseCustomPassword }
                            inputProps = {
                                {
                                    'aria-label': 'Use custom password'
                                }
                            }
                        />
                    }
                    sx = {
                        {
                            margin: 'auto'
                        }
                    }
                />
                { isCustomPassword &&
                    <FormControl variant='outlined'
                        sx = {
                            {
                                width: '50%',
                                margin: 'auto'
                            }
                        }>
                        <InputLabel htmlFor='outlined-adornment-password'>Password</InputLabel>
                        <OutlinedInput
                            id='outlined-adornment-password'
                            type={ showPassword ? 'text' : 'password' }
                            value={ password }
                            onChange={ handlePasswordChange }
                            endAdornment={
                                <InputAdornment position='end'>
                                    <IconButton
                                        aria-label='toggle password visibility'
                                        onClick={ handleClickShowPassword }
                                        onMouseDown={ handleMouseDownPassword }
                                        edge='end'>
                                        { showPassword ? <VisibilityOff /> : <Visibility /> }
                                    </IconButton>
                                </InputAdornment>
                            }
                            label='Password' />
                    </FormControl>
                }
                <Button
                    variant='contained'
                    size='large'
                    onClick={ handleSubmit }
                    sx= {
                        {
                            margin: 'auto',
                            marginTop: '10px',
                            marginBottom: '0',
                            width: '50%'
                        }
                    }>
                    Submit
                </Button>
            </Paper>
            <Snackbar
                isOpen={ isSnackbarOpen }
                setIsOpen={ setIsSnackbarOpen }
                severity={ severity }
                message={ errorMessage } />
            <Dialog
                open={ isAlertDialogOpen }
                onClose={ handleAlertDialogClose }
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle>
                    Success!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <p>
                            <strong>Secret File: </strong>
                            { `${ window.location.origin }/secret/${ secretFileID }` }
                        </p>
                        <p>
                            <strong>Cipher File: </strong>
                            { `${ window.location.origin }/secret/${ cipherFileID }` }
                        </p>
                        <p>
                            <strong>Password: </strong>
                            { password }
                        </p>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={ handleAlertDialogCopy }
                        autoFocus>
                        Copy
                    </Button>
                    <Button
                        onClick={ handleAlertDialogClose }>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}