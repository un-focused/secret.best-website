import { VisibilityOff, Visibility, PhotoCamera } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import axios from '../resources/axiosInstance';
import { getFileExtension, getFilename } from '../actions/file';
import { encryptFileContents } from '../actions/cryptography';
import { isValidCipherMapFile } from '../actions/validation';
import Snackbar, { Severity } from '../components/snackbar';

// TODO: create requests & constants file
// TODO: validate cipher file
// TODO: add validation (password for instance)
// TODO: break down into components
// TODO: add 2MB file check
// TODO: add jumbling logic (mapping)
// TODO: validate jumbling file
// TODO: make id's less predictible
// TODO: generate password if don't want to put one in

export default function Home() {
    const [isCustomPassword, setIsCustomPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [cipherFile, setCipherFile] = useState<File>();
    const [secretFile, setSecretFile] = useState<File>();
    const [isOpen, setIsOpen] = useState(false);
    const [severity, setSeverity] = useState<Severity>('error');
    const [errorMessage, setErrorMessage] = useState('');

    const setSnackbarData = (severity: Severity, message: string, isOpen = true) => {
        setSeverity(severity);
        setErrorMessage(message);
        setIsOpen(isOpen);
    }

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
        if (!event.target.files || event.target.files.length === 0) {
            setSnackbarData('error', 'no file was found');
            return;
        }

        const file = event.target.files[0];
        const isValid = await isValidCipherMapFile(file);
        if (!isValid) {
            setSnackbarData('error', 'invalid cipher file uploaded');
            return;
        }
        
        setCipherFile(file);
    }

    const handleUploadSecretFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            setSnackbarData('error', 'no file was found');
            return;
        }

        const file = event.target.files[0];

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
            // we stringify the encrypted data so that we don't need to create a
            // relation on the backend with an inner object that contains the
            // encrypted data, this keeps the process simpler & nicer to work with
            encryptedData: JSON.stringify(encryptedData)
        };

        const { data } = await axios.post('SBFiles', payload);

        return data;
    }

    const handleSubmit = async () => {
        if (!cipherFile || !secretFile) {
            setSnackbarData('error', 'you need to upload both the cipher & secret file');
            return;
        }

        const results = await Promise.all(
            [
                uploadFile(cipherFile, password),
                uploadFile(secretFile, password),
            ]
        );

        console.log(results);
        setSnackbarData('success', 'congrats!!');
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
                isOpen={ isOpen }
                setIsOpen={ setIsOpen }
                severity={ severity }
                message={ errorMessage } />
        </Box>
    );
}