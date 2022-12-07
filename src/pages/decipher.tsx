import { PhotoCamera } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { downloadFile } from '../actions/file';
import { decodeFile, getCipherMapFromFile } from '../actions/cryptography';
import { isValidCipherMapFile, isValidFile } from '../actions/validation';
import Snackbar, { Severity } from '../components/snackbar';

// TODO: create constants file
// TODO: add validation (password for instance)
// TODO: break down into components

export default function Home() {
    const [cipherFile, setCipherFile] = useState<File>();
    const [secretFile, setSecretFile] = useState<File>();
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [severity, setSeverity] = useState<Severity>('error');
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleDecipher = async () => {
        if (!cipherFile || !secretFile) {
            setSnackbarData('error', 'you need to upload both the cipher & secret file');
            return;
        }

        const cipherMap = await getCipherMapFromFile(cipherFile);
        const decodedSecretFile = await decodeFile(secretFile, cipherMap);

        downloadFile(decodedSecretFile);
        setSnackbarData('success', 'congrats! file is deciphered!');
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
                    Decipher your secret
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
                <Button
                    variant='contained'
                    size='large'
                    onClick={ handleDecipher }
                    sx= {
                        {
                            margin: 'auto',
                            marginTop: '10px',
                            marginBottom: '0',
                            width: '50%'
                        }
                    }>
                    Decipher
                </Button>
            </Paper>
            <Snackbar
                isOpen={ isSnackbarOpen }
                setIsOpen={ setIsSnackbarOpen }
                severity={ severity }
                message={ errorMessage } />
        </Box>
    );
}